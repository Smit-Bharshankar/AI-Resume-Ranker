import { Worker } from "bullmq";
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
import { trackLifecycle } from "../monitoring/lifecycleTracker.js";

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

const enqueueInsightsPipeline = async ({ resumeId, userId, jobId, jobLogger }) => {
  await enqueueResumeInsightGeneration({ resumeId, userId, jobId });

  jobLogger.info("Resume insights generation enqueued", {
    stage: "insights_enqueue",
    nextStatus: "SCORED",
  });
};

const processResumeJob = async (job) => {
  const startedAtMs = Date.now();
  const { resumeId, userId: jobUserId, jobId: payloadJobId } = job.data ?? {};

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

  baseJobLogger.info("Resume pipeline job started");
  void trackLifecycle({
    entityType: "resume",
    entityId: resumeId,
    runId: resumeId,
    event: "stage_started",
    status: "processing",
    stage: "pipeline_start",
    attempt,
    maxAttempts,
    retries,
    progressPct: 5,
    queueJobId: String(job.id ?? ""),
    worker: "resumeWorker",
    message: "Resume pipeline job started",
    isTerminal: false,
  });

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
    return;
  }

  const jobLogger = baseJobLogger.child({
    currentStatus: resume.status,
  });

  if (resume.status === "UPLOADED") {
    const extractionStartedAtMs = Date.now();
    void trackLifecycle({
      entityType: "resume",
      entityId: resumeId,
      runId: resumeId,
      event: "stage_started",
      status: "uploaded",
      stage: "text_extraction",
      attempt,
      maxAttempts,
      retries,
      progressPct: 20,
      queueJobId: String(job.id ?? ""),
      worker: "resumeWorker",
      message: "Text extraction started",
      isTerminal: false,
    });
    try {
      const fileBuffer = await supabaseStorage.downloadResume(resume.storagePath);
      const parser = new PDFParse({ data: fileBuffer });
      let parsedText = "";

      try {
        const parsed = await parser.getText();
        parsedText = parsed.text ?? "";
      } finally {
        await parser.destroy();
      }

      const normalizedText = normalizeText(parsedText);

      if (!normalizedText) {
        throw new Error("Extracted text was empty");
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
        return;
      }

      jobLogger.info("Resume text extraction completed", {
        stage: "text_extraction",
        durationMs: Date.now() - extractionStartedAtMs,
      });
      void trackLifecycle({
        entityType: "resume",
        entityId: resumeId,
        runId: resumeId,
        event: "stage_completed",
        status: "text_extracted",
        stage: "text_extraction",
        attempt,
        maxAttempts,
        retries,
        progressPct: 35,
        queueJobId: String(job.id ?? ""),
        worker: "resumeWorker",
        message: "Text extraction completed",
        isTerminal: false,
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
        durationMs: Date.now() - extractionStartedAtMs,
        error: error.message,
      });

      if (isFinalAttempt) {
        await resumeService.markExtractionFailed(resumeId);
        void trackLifecycle({
          entityType: "resume",
          entityId: resumeId,
          runId: resumeId,
          event: "failed",
          status: "failed_extraction",
          stage: "text_extraction",
          attempt,
          maxAttempts,
          retries,
          progressPct: 100,
          queueJobId: String(job.id ?? ""),
          worker: "resumeWorker",
          message: "Text extraction failed on final attempt",
          error: error.message,
          isTerminal: true,
        });
      } else {
        void trackLifecycle({
          entityType: "resume",
          entityId: resumeId,
          runId: resumeId,
          event: "retry_scheduled",
          status: "retrying",
          stage: "text_extraction",
          attempt,
          maxAttempts,
          retries,
          progressPct: 20,
          queueJobId: String(job.id ?? ""),
          worker: "resumeWorker",
          message: "Text extraction retry scheduled",
          error: error.message,
          isTerminal: false,
        });
      }

      throw error;
    }

    resume = await resumeService.getResumeById(resumeId);
  }

  if (resume?.status === "TEXT_EXTRACTED") {
    const structuringStartedAtMs = Date.now();
    void trackLifecycle({
      entityType: "resume",
      entityId: resumeId,
      runId: resumeId,
      event: "stage_started",
      status: "text_extracted",
      stage: "structuring",
      attempt,
      maxAttempts,
      retries,
      progressPct: 45,
      queueJobId: String(job.id ?? ""),
      worker: "resumeWorker",
      message: "Structuring started",
      isTerminal: false,
    });
    const structureResult = await resumeExtractionService.process(resumeId);
    jobLogger.info("Resume structuring stage finished", {
      stage: "structuring",
      structureStatus: structureResult?.status ?? "unknown",
      durationMs: Date.now() - structuringStartedAtMs,
    });

    if (structureResult?.status === "structured") {
      void trackLifecycle({
        entityType: "resume",
        entityId: resumeId,
        runId: resumeId,
        event: "stage_completed",
        status: "structured",
        stage: "structuring",
        attempt,
        maxAttempts,
        retries,
        progressPct: 60,
        queueJobId: String(job.id ?? ""),
        worker: "resumeWorker",
        message: "Structuring completed",
        isTerminal: false,
      });
      const scoringStartedAtMs = Date.now();
      void trackLifecycle({
        entityType: "resume",
        entityId: resumeId,
        runId: resumeId,
        event: "stage_started",
        status: "structured",
        stage: "scoring",
        attempt,
        maxAttempts,
        retries,
        progressPct: 70,
        queueJobId: String(job.id ?? ""),
        worker: "resumeWorker",
        message: "Scoring started",
        isTerminal: false,
      });
      const scoringResult = await resumeMatchingService.process(resumeId);
      jobLogger.info("Resume scoring stage finished", {
        stage: "scoring",
        scoringStatus: scoringResult?.status ?? "unknown",
        durationMs: Date.now() - scoringStartedAtMs,
        totalDurationMs: Date.now() - startedAtMs,
      });

      if (scoringResult?.status === "scored") {
        void trackLifecycle({
          entityType: "resume",
          entityId: resumeId,
          runId: resumeId,
          event: "stage_completed",
          status: "scored",
          stage: "scoring",
          attempt,
          maxAttempts,
          retries,
          progressPct: 80,
          queueJobId: String(job.id ?? ""),
          worker: "resumeWorker",
          message: "Scoring completed",
          isTerminal: false,
        });
        try {
          await enqueueInsightsPipeline({
            resumeId,
            userId: distinctId,
            jobId: relatedJobId,
            jobLogger,
          });
          void trackLifecycle({
            entityType: "resume",
            entityId: resumeId,
            runId: resumeId,
            event: "queued",
            status: "scored",
            stage: "insights_queued",
            attempt,
            maxAttempts,
            retries,
            progressPct: 85,
            queueJobId: String(job.id ?? ""),
            worker: "resumeWorker",
            message: "Insights generation queued",
            isTerminal: false,
          });
        } catch (error) {
          jobLogger.error("Failed to enqueue resume insights", {
            stage: "insights_enqueue",
            error: error.message,
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
      return;
    }

    if (structureResult?.status === "failed") {
      void trackLifecycle({
        entityType: "resume",
        entityId: resumeId,
        runId: resumeId,
        event: "failed",
        status: "failed_structure",
        stage: "structuring",
        attempt,
        maxAttempts,
        retries,
        progressPct: 100,
        queueJobId: String(job.id ?? ""),
        worker: "resumeWorker",
        message: "Structuring failed",
        isTerminal: true,
      });
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
        totalDurationMs: Date.now() - startedAtMs,
      });
      return;
    }

    const refreshedResume = await resumeService.getResumeById(resumeId);
    if (refreshedResume?.status === "STRUCTURED") {
      const scoringStartedAtMs = Date.now();
      const scoringResult = await resumeMatchingService.process(resumeId);
      jobLogger.info("Resume scoring stage finished after status refresh", {
        stage: "scoring",
        scoringStatus: scoringResult?.status ?? "unknown",
        durationMs: Date.now() - scoringStartedAtMs,
        totalDurationMs: Date.now() - startedAtMs,
      });

      if (scoringResult?.status === "scored") {
        try {
          await enqueueInsightsPipeline({
            resumeId,
            userId: distinctId,
            jobId: relatedJobId,
            jobLogger,
          });
        } catch (error) {
          jobLogger.error("Failed to enqueue resume insights", {
            stage: "insights_enqueue",
            error: error.message,
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
    }
    return;
  }

  if (resume?.status === "STRUCTURED") {
    void trackLifecycle({
      entityType: "resume",
      entityId: resumeId,
      runId: resumeId,
      event: "stage_started",
      status: "structured",
      stage: "scoring",
      attempt,
      maxAttempts,
      retries,
      progressPct: 70,
      queueJobId: String(job.id ?? ""),
      worker: "resumeWorker",
      message: "Scoring started",
      isTerminal: false,
    });
    const scoringStartedAtMs = Date.now();
    const scoringResult = await resumeMatchingService.process(resumeId);
    jobLogger.info("Resume scoring stage finished from structured state", {
      stage: "scoring",
      scoringStatus: scoringResult?.status ?? "unknown",
      durationMs: Date.now() - scoringStartedAtMs,
      totalDurationMs: Date.now() - startedAtMs,
    });

    if (scoringResult?.status === "scored") {
      void trackLifecycle({
        entityType: "resume",
        entityId: resumeId,
        runId: resumeId,
        event: "stage_completed",
        status: "scored",
        stage: "scoring",
        attempt,
        maxAttempts,
        retries,
        progressPct: 80,
        queueJobId: String(job.id ?? ""),
        worker: "resumeWorker",
        message: "Scoring completed",
        isTerminal: false,
      });
      try {
        await enqueueInsightsPipeline({
          resumeId,
          userId: distinctId,
          jobId: relatedJobId,
          jobLogger,
        });
        void trackLifecycle({
          entityType: "resume",
          entityId: resumeId,
          runId: resumeId,
          event: "queued",
          status: "scored",
          stage: "insights_queued",
          attempt,
          maxAttempts,
          retries,
          progressPct: 85,
          queueJobId: String(job.id ?? ""),
          worker: "resumeWorker",
          message: "Insights generation queued",
          isTerminal: false,
        });
      } catch (error) {
        jobLogger.error("Failed to enqueue resume insights", {
          stage: "insights_enqueue",
          error: error.message,
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
    return;
  }

  if (resume?.status === "SCORED") {
    try {
      await enqueueInsightsPipeline({
        resumeId,
        userId: distinctId,
        jobId: relatedJobId,
        jobLogger,
      });
      void trackLifecycle({
        entityType: "resume",
        entityId: resumeId,
        runId: resumeId,
        event: "queued",
        status: "scored",
        stage: "insights_queued",
        attempt,
        maxAttempts,
        retries,
        progressPct: 85,
        queueJobId: String(job.id ?? ""),
        worker: "resumeWorker",
        message: "Insights generation queued",
        isTerminal: false,
      });
    } catch (error) {
      jobLogger.error("Failed to enqueue resume insights from scored state", {
        stage: "insights_enqueue",
        error: error.message,
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
    return;
  }

  jobLogger.info("Skipping resume with unsupported status in worker", {
    status: resume?.status,
    totalDurationMs: Date.now() - startedAtMs,
  });
};

const worker = new Worker(env.resumeQueueName, processResumeJob, {
  connection,
  concurrency: env.resumeWorkerConcurrency,
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
  void trackLifecycle({
    entityType: "resume",
    entityId: job?.data?.resumeId ?? "",
    runId: job?.data?.resumeId ?? "",
    event: isFinalAttempt ? "failed" : "retry_scheduled",
    status: isFinalAttempt ? "failed_resume_pipeline" : "retrying",
    stage: "resume_worker_failed",
    attempt,
    maxAttempts: attempts,
    retries,
    progressPct: isFinalAttempt ? 100 : 20,
    queueJobId: String(job?.id ?? ""),
    worker: "resumeWorker",
    message: isFinalAttempt
      ? "Resume worker failed on final attempt"
      : "Resume worker retry scheduled",
    error: error.message,
    isTerminal: isFinalAttempt,
  });
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
    error: error.message,
  });
});

logger.info("Resume worker started", {
  queue: env.resumeQueueName,
  concurrency: env.resumeWorkerConcurrency,
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
