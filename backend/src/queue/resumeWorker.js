import { UnrecoverableError, Worker } from "bullmq";
import { connection } from "./resumeQueue.js";
import env from "../config/env.js";
import resumeService from "../modules/resume/resume.service.js";
import resumeExtractionService from "../modules/ai/extraction.service.js";
import resumeMatchingService from "../modules/matching/matching.service.js";
import { enqueueResumeInsightGeneration } from "./insightQueue.js";
import { validateAiConfiguration } from "../modules/ai/providers/provider.factory.js";
import supabaseStorage from "../storage/supabaseStorage.js";
import logger from "../utils/logger.js";
import { PDFParse } from "pdf-parse";
import { Sentry } from "../monitoring/sentry.js";
import { capturePosthogEvent } from "../analytics/posthog.js";
import { shutdownPosthog } from "../analytics/posthog.js";
import { withProcessTimeout } from "./processorTimeout.js";
import { buildFailureRecord, resolveFailureReason } from "../modules/ai/failureReason.js";
import { classifyRetry } from "./retryPolicy.js";
import { withOperationTimeout } from "../utils/operationTimeout.js";

const signal = (icon, label, meta = {}) => {
  const ts = new Date().toISOString();
  const suffix = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
  console.log(`${ts} ${icon} ${label}${suffix}`);
};

const throwUnrecoverable = (reason) => {
  const error = new UnrecoverableError(`${reason.code}: ${reason.message}`);
  error.code = reason.code;
  throw error;
};

const resolveOwnerContextSafe = async ({ resumeId, jobUserId, payloadJobId }) => {
  if (typeof jobUserId === "string") {
    return {
      distinctId: jobUserId,
      relatedJobId: payloadJobId ?? null,
    };
  }

  try {
    const ownerContext = await resumeService.getResumeOwnerContext(resumeId);
    return {
      distinctId: ownerContext?.job?.userId ?? ownerContext?.userId ?? null,
      relatedJobId: ownerContext?.jobId ?? payloadJobId ?? null,
    };
  } catch {
    return {
      distinctId: null,
      relatedJobId: payloadJobId ?? null,
    };
  }
};

const normalizeText = (rawText) => {
  return rawText
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const enqueueInsightsPipeline = async ({ resumeId, userId, jobId, jobLogger, attempt }) => {
  const startedAtMs = Date.now();
  await enqueueResumeInsightGeneration({ resumeId, userId, jobId });

  jobLogger.info("Resume insights generation enqueued", {
    stage: "insights_enqueue",
    nextStatus: "SCORED",
  });
  logStageResult({
    jobLogger,
    resumeId,
    stage: "INSIGHTS_ENQUEUE",
    attempt,
    durationMs: Date.now() - startedAtMs,
    result: "success",
  });
};

const logStageResult = ({ jobLogger, resumeId, stage, attempt, durationMs, result, code = null }) => {
  jobLogger.info("Resume stage execution", {
    resumeId,
    stage,
    attempt,
    durationMs,
    result,
    code,
  });
};

const processResumeJob = async (job) => {
  const startedAtMs = Date.now();
  const { resumeId, userId: jobUserId, jobId: payloadJobId } = job.data ?? {};
  const jobResult = {
    resumeId,
    stages: {
      textExtraction: "skipped",
      structuring: "skipped",
      scoring: "skipped",
      insightEnqueue: "skipped",
    },
    structuredResume: null,
  };

  if (!resumeId || typeof resumeId !== "string") {
    throw new Error("Invalid resumeId in queue payload");
  }

  const baseJobLogger = logger.child({
    queue: env.resumeQueueName,
    jobId: job.id,
    resumeId,
    attemptsMade: job.attemptsMade + 1,
    maxAttempts: job.opts.attempts ?? env.resumeQueueAttempts,
  });
  const attempt = job.attemptsMade + 1;
  const maxAttempts = job.opts.attempts ?? env.resumeQueueAttempts;
  const retries = Math.max(0, attempt - 1);
  signal("📥", "resume:start", { resumeId, attempt, maxAttempts });

  baseJobLogger.info("Resume pipeline job started");

  const { distinctId, relatedJobId } = await resolveOwnerContextSafe({
    resumeId,
    jobUserId,
    payloadJobId,
  });

  capturePosthogEvent({
    distinctId,
    event: "analysis_started",
    properties: {
      analysis_type: "resume_analysis",
      resume_id: resumeId,
      job_id: relatedJobId,
      queue_job_id: String(job.id ?? ""),
      source: "worker",
    },
  });

  let resume = await resumeService.getResumeById(resumeId);

  if (!resume) {
    baseJobLogger.warn("Skipping missing resume");
    return {
      ...jobResult,
      status: "skipped",
      reason: "missing_resume",
    };
  }

  const jobLogger = baseJobLogger.child({
    currentStatus: resume.status,
  });

  if (resume.status === "UPLOADED") {
    const extractionStartedAtMs = Date.now();
    try {
      const fileBuffer = await withOperationTimeout({
        timeoutMs: env.storageReadTimeoutMs,
        operationName: "Resume file download",
        operation: () => supabaseStorage.downloadResume(resume.storagePath),
      });
      const parser = new PDFParse({ data: fileBuffer });
      let parsedText = "";

      try {
        const parsed = await withOperationTimeout({
          timeoutMs: env.pdfParseTimeoutMs,
          operationName: "PDF text extraction",
          operation: () => parser.getText(),
        });
        parsedText = parsed.text ?? "";
      } catch (error) {
        if (error?.code !== "PROCESS_TIMEOUT") {
          const invalidPdfError = new Error("Invalid PDF file");
          invalidPdfError.code = "INVALID_PDF";
          invalidPdfError.retryable = false;
          throw invalidPdfError;
        }
        throw error;
      } finally {
        await parser.destroy();
      }

      const normalizedText = normalizeText(parsedText);

      if (!normalizedText) {
        const emptyExtractionError = new Error("Extracted text was empty");
        emptyExtractionError.code = "EMPTY_EXTRACTION_RESULT";
        emptyExtractionError.retryable = false;
        throw emptyExtractionError;
      }

      const updated = await resumeService.completeTextExtraction({
        id: resumeId,
        rawText: normalizedText,
      });

      if (!updated) {
        jobLogger.warn("Skipped completion due to concurrent status update", {
          stage: "text_extraction",
          durationMs: Date.now() - extractionStartedAtMs,
        });
        return {
          ...jobResult,
          status: "skipped",
          reason: "concurrent_status_update_text_extraction",
        };
      }

      jobLogger.info("Resume text extraction completed", {
        stage: "text_extraction",
        durationMs: Date.now() - extractionStartedAtMs,
      });
      logStageResult({
        jobLogger,
        resumeId,
        stage: "TEXT_EXTRACTION",
        attempt,
        durationMs: Date.now() - extractionStartedAtMs,
        result: "success",
      });
      jobResult.stages.textExtraction = "completed";
      signal("📄", "resume:text-ok", {
        resumeId,
        ms: Date.now() - extractionStartedAtMs,
      });

      capturePosthogEvent({
        distinctId,
        event: "resume_parsed",
        properties: {
          resume_id: resumeId,
          job_id: relatedJobId,
          queue_job_id: String(job.id ?? ""),
          duration_ms: Date.now() - extractionStartedAtMs,
        },
      });
    } catch (error) {
      const attempts = job.opts.attempts ?? env.resumeQueueAttempts;
      const isFinalAttempt = job.attemptsMade + 1 >= attempts;
      const reason = resolveFailureReason(error, "RESUME_TEXT_EXTRACTION_FAILED");
      reason.retryable = classifyRetry(error).retryable;
      Sentry.captureException(error, {
        tags: {
          queue: env.resumeQueueName,
          worker: "resume",
        },
        extra: {
          resumeId,
          queueJobId: job.id,
          isFinalAttempt,
        },
      });
      capturePosthogEvent({
        distinctId,
        event: "worker_failed",
        properties: {
          worker: "resume",
          queue: env.resumeQueueName,
          resume_id: resumeId,
          job_id: relatedJobId,
          queue_job_id: String(job.id ?? ""),
          is_final_attempt: isFinalAttempt,
        },
      });

      jobLogger.error("Resume text extraction failed", {
        stage: "text_extraction",
        isFinalAttempt,
        failureCode: reason.code,
        retryable: reason.retryable,
        durationMs: Date.now() - extractionStartedAtMs,
        error: error.message,
      });
      logStageResult({
        jobLogger,
        resumeId,
        stage: "TEXT_EXTRACTION",
        attempt,
        durationMs: Date.now() - extractionStartedAtMs,
        result: reason.retryable && !isFinalAttempt ? "retry" : "failed",
        code: reason.code,
      });

      if (isFinalAttempt) {
        await resumeService.markExtractionFailed(
          resumeId,
          buildFailureRecord({ stage: "text_extraction", reason }),
        );
      }
      signal("❌", "resume:text-fail", {
        resumeId,
        code: reason.code,
        retryable: reason.retryable,
        isFinalAttempt,
      });

      if (!reason.retryable) {
        throwUnrecoverable(reason);
      }

      throw error;
    }

    resume = await resumeService.getResumeById(resumeId);
  }

  if (resume?.status === "TEXT_EXTRACTED") {
    const structuringStartedAtMs = Date.now();
    const structureResult = await resumeExtractionService.process(resumeId);
    jobResult.stages.structuring = structureResult?.status ?? "unknown";
    if (structureResult?.status === "structured") {
      jobResult.structuredResume = structureResult?.structuredData ?? null;
    }
    signal("🧠", "resume:struct-result", {
      resumeId,
      status: structureResult?.status ?? "unknown",
      code: structureResult?.failureCode ?? null,
    });
    jobLogger.info("Resume structuring stage finished", {
      stage: "structuring",
      structureStatus: structureResult?.status ?? "unknown",
      durationMs: Date.now() - structuringStartedAtMs,
    });
    logStageResult({
      jobLogger,
      resumeId,
      stage: "STRUCTURING",
      attempt,
      durationMs: Date.now() - structuringStartedAtMs,
      result:
        structureResult?.status === "failed"
          ? (structureResult?.retryable ? "retry" : "failed")
          : (structureResult?.status ?? "unknown"),
      code: structureResult?.failureCode ?? null,
    });

    if (structureResult?.status === "structured") {
      const scoringStartedAtMs = Date.now();
      const scoringResult = await resumeMatchingService.process(resumeId);
      jobResult.stages.scoring = scoringResult?.status ?? "unknown";
      signal("🧮", "resume:score-result", {
        resumeId,
        status: scoringResult?.status ?? "unknown",
        code: scoringResult?.failureCode ?? null,
      });
      jobLogger.info("Resume scoring stage finished", {
        stage: "scoring",
        scoringStatus: scoringResult?.status ?? "unknown",
        durationMs: Date.now() - scoringStartedAtMs,
        totalDurationMs: Date.now() - startedAtMs,
      });
      logStageResult({
        jobLogger,
        resumeId,
        stage: "SCORING",
        attempt,
        durationMs: Date.now() - scoringStartedAtMs,
        result:
          scoringResult?.status === "failed"
            ? (scoringResult?.retryable ? "retry" : "failed")
            : (scoringResult?.status ?? "unknown"),
        code: scoringResult?.failureCode ?? null,
      });

      if (scoringResult?.status === "scored") {
        try {
          await enqueueInsightsPipeline({
            resumeId,
            userId: distinctId,
            jobId: relatedJobId,
            jobLogger,
            attempt,
          });
          signal("📤", "resume:insight-enqueued", { resumeId });
        } catch (error) {
          jobLogger.error("Failed to enqueue resume insights", {
            stage: "insights_enqueue",
            error: error.message,
          });
          logStageResult({
            jobLogger,
            resumeId,
            stage: "INSIGHTS_ENQUEUE",
            attempt,
            durationMs: 0,
            result: "failed",
            code: "INSIGHT_ENQUEUE_FAILED",
          });
          throw error;
        }
      }
      capturePosthogEvent({
        distinctId,
        event: "analysis_completed",
        properties: {
          analysis_type: "resume_analysis",
          resume_id: resumeId,
          job_id: relatedJobId,
          queue_job_id: String(job.id ?? ""),
          status: "success",
          duration_ms: Date.now() - startedAtMs,
        },
      });
      return {
        ...jobResult,
        status: "completed",
      };
    }

    if (structureResult?.status === "failed") {
      const reason = {
        code: structureResult.failureCode ?? "RESUME_STRUCTURING_FAILED",
        retryable: Boolean(structureResult.retryable),
        statusCode: null,
        message: "Resume structuring failed",
      };
      capturePosthogEvent({
        distinctId,
        event: "analysis_completed",
        properties: {
          analysis_type: "resume_analysis",
          resume_id: resumeId,
          job_id: relatedJobId,
          queue_job_id: String(job.id ?? ""),
          status: "failed",
          duration_ms: Date.now() - startedAtMs,
        },
      });
      jobLogger.warn("Stopping pipeline due to structuring failure", {
        stage: "structuring",
        failureCode: reason.code,
        retryable: reason.retryable,
        totalDurationMs: Date.now() - startedAtMs,
      });
      if (!reason.retryable) {
        throwUnrecoverable(reason);
      }
      const failureError = new Error(reason.message);
      failureError.code = reason.code;
      failureError.retryable = reason.retryable;
      throw failureError;
    }

    const refreshedResume = await resumeService.getResumeById(resumeId);
    if (refreshedResume?.status === "STRUCTURED") {
      const scoringStartedAtMs = Date.now();
      const scoringResult = await resumeMatchingService.process(resumeId);
      jobResult.stages.scoring = scoringResult?.status ?? "unknown";
      jobResult.structuredResume =
        refreshedResume?.structuredData ?? jobResult.structuredResume;
      signal("🧮", "resume:score-result", {
        resumeId,
        status: scoringResult?.status ?? "unknown",
        code: scoringResult?.failureCode ?? null,
      });
      jobLogger.info("Resume scoring stage finished after status refresh", {
        stage: "scoring",
        scoringStatus: scoringResult?.status ?? "unknown",
        durationMs: Date.now() - scoringStartedAtMs,
        totalDurationMs: Date.now() - startedAtMs,
      });
      logStageResult({
        jobLogger,
        resumeId,
        stage: "SCORING",
        attempt,
        durationMs: Date.now() - scoringStartedAtMs,
        result:
          scoringResult?.status === "failed"
            ? (scoringResult?.retryable ? "retry" : "failed")
            : (scoringResult?.status ?? "unknown"),
        code: scoringResult?.failureCode ?? null,
      });

      if (scoringResult?.status === "scored") {
        try {
          await enqueueInsightsPipeline({
            resumeId,
            userId: distinctId,
            jobId: relatedJobId,
            jobLogger,
            attempt,
          });
          signal("📤", "resume:insight-enqueued", { resumeId });
        } catch (error) {
          jobLogger.error("Failed to enqueue resume insights", {
            stage: "insights_enqueue",
            error: error.message,
          });
          logStageResult({
            jobLogger,
            resumeId,
            stage: "INSIGHTS_ENQUEUE",
            attempt,
            durationMs: 0,
            result: "failed",
            code: "INSIGHT_ENQUEUE_FAILED",
          });
          throw error;
        }
      }
      if (scoringResult?.status === "failed") {
        const reason = {
          code: scoringResult.failureCode ?? "RESUME_SCORING_FAILED",
          retryable: Boolean(scoringResult.retryable),
          statusCode: null,
          message: "Resume scoring failed",
        };
        throwUnrecoverable({ ...reason, retryable: false });
      }
      capturePosthogEvent({
        distinctId,
        event: "analysis_completed",
        properties: {
          analysis_type: "resume_analysis",
          resume_id: resumeId,
          job_id: relatedJobId,
          queue_job_id: String(job.id ?? ""),
          status: "success",
          duration_ms: Date.now() - startedAtMs,
        },
      });
    }
    return {
      ...jobResult,
      status: "completed",
    };
  }

  if (resume?.status === "STRUCTURED") {
    jobResult.stages.structuring = "already_structured";
    jobResult.structuredResume = resume?.structuredData ?? null;
    const scoringStartedAtMs = Date.now();
    const scoringResult = await resumeMatchingService.process(resumeId);
    jobResult.stages.scoring = scoringResult?.status ?? "unknown";
    signal("🧮", "resume:score-result", {
      resumeId,
      status: scoringResult?.status ?? "unknown",
      code: scoringResult?.failureCode ?? null,
    });
    jobLogger.info("Resume scoring stage finished from structured state", {
      stage: "scoring",
      scoringStatus: scoringResult?.status ?? "unknown",
      durationMs: Date.now() - scoringStartedAtMs,
      totalDurationMs: Date.now() - startedAtMs,
    });
    logStageResult({
      jobLogger,
      resumeId,
      stage: "SCORING",
      attempt,
      durationMs: Date.now() - scoringStartedAtMs,
      result:
        scoringResult?.status === "failed"
          ? (scoringResult?.retryable ? "retry" : "failed")
          : (scoringResult?.status ?? "unknown"),
      code: scoringResult?.failureCode ?? null,
    });

    if (scoringResult?.status === "scored") {
      try {
        await enqueueInsightsPipeline({
          resumeId,
          userId: distinctId,
          jobId: relatedJobId,
          jobLogger,
          attempt,
        });
        signal("📤", "resume:insight-enqueued", { resumeId });
      } catch (error) {
        jobLogger.error("Failed to enqueue resume insights", {
          stage: "insights_enqueue",
          error: error.message,
        });
        logStageResult({
          jobLogger,
          resumeId,
          stage: "INSIGHTS_ENQUEUE",
          attempt,
          durationMs: 0,
          result: "failed",
          code: "INSIGHT_ENQUEUE_FAILED",
        });
        throw error;
      }
    }
    if (scoringResult?.status === "failed") {
      const reason = {
        code: scoringResult.failureCode ?? "RESUME_SCORING_FAILED",
        retryable: Boolean(scoringResult.retryable),
        statusCode: null,
        message: "Resume scoring failed",
      };
      throwUnrecoverable({ ...reason, retryable: false });
    }
    capturePosthogEvent({
      distinctId,
      event: "analysis_completed",
      properties: {
        analysis_type: "resume_analysis",
        resume_id: resumeId,
        job_id: relatedJobId,
        queue_job_id: String(job.id ?? ""),
        status: "success",
        duration_ms: Date.now() - startedAtMs,
      },
    });
    return {
      ...jobResult,
      status: "completed",
    };
  }

  if (resume?.status === "SCORED") {
    jobResult.stages.structuring = "already_structured";
    jobResult.stages.scoring = "already_scored";
    jobResult.structuredResume = resume?.structuredData ?? null;
    try {
      await enqueueInsightsPipeline({
        resumeId,
        userId: distinctId,
        jobId: relatedJobId,
        jobLogger,
        attempt,
      });
      signal("📤", "resume:insight-enqueued", { resumeId });
    } catch (error) {
      jobLogger.error("Failed to enqueue resume insights from scored state", {
        stage: "insights_enqueue",
        error: error.message,
      });
      logStageResult({
        jobLogger,
        resumeId,
        stage: "INSIGHTS_ENQUEUE",
        attempt,
        durationMs: 0,
        result: "failed",
        code: "INSIGHT_ENQUEUE_FAILED",
      });
      throw error;
    }
    capturePosthogEvent({
      distinctId,
      event: "analysis_completed",
      properties: {
        analysis_type: "resume_analysis",
        resume_id: resumeId,
        job_id: relatedJobId,
        queue_job_id: String(job.id ?? ""),
        status: "success",
        duration_ms: Date.now() - startedAtMs,
      },
    });
    return {
      ...jobResult,
      status: "completed",
    };
  }

  jobLogger.info("Skipping resume with unsupported status in worker", {
    status: resume?.status,
    totalDurationMs: Date.now() - startedAtMs,
  });
  return {
    ...jobResult,
    status: "skipped",
    reason: "unsupported_status",
    resumeStatus: resume?.status ?? null,
  };
};

const processResumeJobWithTimeout = async (job) => {
  return withProcessTimeout({
    operation: () => processResumeJob(job),
    timeoutMs: env.resumeProcessTimeoutMs,
    processName: "Resume pipeline",
  });
};

const worker = new Worker(env.resumeQueueName, processResumeJobWithTimeout, {
  connection,
  concurrency: env.resumeWorkerConcurrency,
  limiter: {
    max: env.resumeWorkerLimiterMax,
    duration: env.resumeWorkerLimiterDurationMs,
  },
});

const aiConfigHealth = validateAiConfiguration();
for (const warning of aiConfigHealth.warnings) {
  logger.warn("AI config warning", {
    queue: env.resumeQueueName,
    warning,
  });
}
for (const error of aiConfigHealth.errors) {
  logger.error("AI config error", {
    queue: env.resumeQueueName,
    error,
  });
}

worker.on("error", (error) => {
  Sentry.captureException(error, {
    tags: {
      queue: env.resumeQueueName,
      worker: "resume",
    },
  });
  logger.error("Worker encountered an error", {
    queue: env.resumeQueueName,
    error: error.message,
  });
});

worker.on("failed", (job, error) => {
  const attempts = job?.opts?.attempts ?? env.resumeQueueAttempts;
  const attempt = (job?.attemptsMade ?? 0) + 1;
  const isFinalAttempt = attempt >= attempts;
  const retries = Math.max(0, attempt - 1);
  Sentry.captureException(error, {
    tags: {
      queue: env.resumeQueueName,
      worker: "resume",
    },
    extra: {
      jobId: job?.id,
      resumeId: job?.data?.resumeId,
      attemptsMade: job?.attemptsMade,
    },
  });
  capturePosthogEvent({
    distinctId: job?.data?.userId,
    event: "worker_failed",
    properties: {
      worker: "resume",
      queue: env.resumeQueueName,
      queue_job_id: String(job?.id ?? ""),
      resume_id: job?.data?.resumeId ?? null,
      job_id: job?.data?.jobId ?? null,
    },
  });
  logger.error("Queue job failed", {
    queue: env.resumeQueueName,
    jobId: job?.id,
    resumeId: job?.data?.resumeId,
    attemptsMade: job?.attemptsMade,
    failureCode: error?.code ?? null,
    error: error.message,
  });
});

logger.info("Resume worker started", {
  queue: env.resumeQueueName,
  concurrency: env.resumeWorkerConcurrency,
  limiterMax: env.resumeWorkerLimiterMax,
  limiterDurationMs: env.resumeWorkerLimiterDurationMs,
  processTimeoutMs: env.resumeProcessTimeoutMs,
});

process.on("unhandledRejection", (error) => {
  Sentry.captureException(error, {
    tags: {
      queue: env.resumeQueueName,
      worker: "resume",
    },
  });
  logger.error("Unhandled rejection in worker", {
    queue: env.resumeQueueName,
    error: error instanceof Error ? error.message : String(error),
  });
});

process.on("uncaughtException", (error) => {
  Sentry.captureException(error, {
    tags: {
      queue: env.resumeQueueName,
      worker: "resume",
    },
  });
  logger.error("Uncaught exception in worker", {
    queue: env.resumeQueueName,
    error: error.message,
  });
  void shutdownPosthog();
  process.exit(1);
});

