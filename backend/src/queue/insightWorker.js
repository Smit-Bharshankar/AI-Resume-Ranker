import { UnrecoverableError, Worker } from "bullmq";
import env from "../config/env.js";
import logger from "../utils/logger.js";
import { connection } from "./resumeQueue.js";
import insightService from "../modules/insights/insight.service.js";
import { Sentry } from "../monitoring/sentry.js";
import { capturePosthogEvent } from "../analytics/posthog.js";
import resumeService from "../modules/resume/resume.service.js";
import { shutdownPosthog } from "../analytics/posthog.js";
import { withProcessTimeout } from "./processorTimeout.js";
import { buildFailureRecord, resolveFailureReason } from "../modules/ai/failureReason.js";
import { classifyRetry } from "./retryPolicy.js";

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

const persistInsightFailure = async ({ resumeId, failure, baseLogger }) => {
  const markedFailed = await resumeService.markInsightsFailed(resumeId, failure);
  if (markedFailed) {
    return;
  }

  await resumeService.updateLastProcessingFailure(resumeId, failure);
  baseLogger.warn("Insight failure persisted without FAILED_INSIGHTS transition", {
    resumeId,
  });
  signal("🧷", "insight:failure-persisted-fallback", { resumeId });
};

const logStageResult = ({ baseLogger, resumeId, attempt, durationMs, result, code = null }) => {
  baseLogger.info("Insight stage execution", {
    resumeId,
    stage: "INSIGHTS",
    attempt,
    durationMs,
    result,
    code,
  });
};

const processInsightJob = async (job) => {
  const startedAtMs = Date.now();
  const { resumeId, userId: jobUserId, jobId: payloadJobId } = job.data ?? {};

  if (!resumeId || typeof resumeId !== "string") {
    throw new Error("Invalid resumeId in queue payload");
  }

  const { distinctId, relatedJobId } = await resolveOwnerContextSafe({
    resumeId,
    jobUserId,
    payloadJobId,
  });

  const baseLogger = logger.child({
    queue: env.resumeInsightQueueName,
    queueJobId: job.id,
    resumeId,
    attemptsMade: job.attemptsMade + 1,
    maxAttempts: job.opts.attempts ?? env.resumeInsightQueueAttempts,
  });
  const attempt = job.attemptsMade + 1;
  const maxAttempts = job.opts.attempts ?? env.resumeInsightQueueAttempts;
  const retries = Math.max(0, attempt - 1);
  signal("📥", "insight:start", { resumeId, attempt, maxAttempts });

  baseLogger.info("Resume insight generation started");
  capturePosthogEvent({
    distinctId,
    event: "analysis_started",
    properties: {
      analysis_type: "resume_insights_generation",
      resume_id: resumeId,
      job_id: relatedJobId,
      queue_job_id: String(job.id ?? ""),
      source: "worker",
    },
  });

  try {
    const serviceStartedAt = Date.now();
    const result = await insightService.process(resumeId);
    signal("🧠", "insight:service-result", {
      resumeId,
      status: result?.status ?? "unknown",
      code: result?.failureCode ?? null,
      ms: Date.now() - serviceStartedAt,
    });
    if (result?.status === "failed") {
      const reason = {
        code: result.failureCode ?? "RESUME_INSIGHTS_FAILED",
        retryable: classifyRetry(result).retryable || Boolean(result.retryable),
        statusCode: null,
        message: "Resume insight generation failed",
      };
      logStageResult({
        baseLogger,
        resumeId,
        attempt,
        durationMs: Date.now() - startedAtMs,
        result: reason.retryable ? "retry" : "failed",
        code: reason.code,
      });
      if (!reason.retryable) {
        throwUnrecoverable(reason);
      }
      const failureError = new Error(reason.message);
      failureError.code = reason.code;
      failureError.retryable = reason.retryable;
      signal("⚠️", "insight:service-failed", {
        resumeId,
        code: reason.code,
        retryable: reason.retryable,
      });
      throw failureError;
    }
    capturePosthogEvent({
      distinctId,
      event: "analysis_completed",
      properties: {
        analysis_type: "resume_insights_generation",
        resume_id: resumeId,
        job_id: relatedJobId,
        queue_job_id: String(job.id ?? ""),
        status: "success",
        duration_ms: Date.now() - startedAtMs,
      },
    });

    baseLogger.info("Resume insight generation finished", {
      resultStatus: result?.status ?? "unknown",
      durationMs: Date.now() - startedAtMs,
      recommendation: result?.insights?.recommendation ?? null,
    });
    logStageResult({
      baseLogger,
      resumeId,
      attempt,
      durationMs: Date.now() - startedAtMs,
      result: "success",
    });

    return result;
  } catch (error) {
    const isFinalAttempt = attempt >= maxAttempts;
    const reason = resolveFailureReason(error, "RESUME_INSIGHTS_FAILED");
    reason.retryable = classifyRetry(error).retryable;
    if (isFinalAttempt || !reason.retryable) {
      await persistInsightFailure({
        resumeId,
        failure: buildFailureRecord({ stage: "insight_worker", reason }),
        baseLogger,
      });
    }
    logStageResult({
      baseLogger,
      resumeId,
      attempt,
      durationMs: Date.now() - startedAtMs,
      result: reason.retryable && !isFinalAttempt ? "retry" : "failed",
      code: reason.code,
    });
    signal("❌", "insight:error", {
      resumeId,
      code: reason.code,
      retryable: reason.retryable,
      isFinalAttempt,
    });
    Sentry.captureException(error, {
      tags: {
        queue: env.resumeInsightQueueName,
        worker: "insight",
      },
      extra: {
        resumeId,
        queueJobId: job.id,
      },
    });
    capturePosthogEvent({
      distinctId,
      event: "worker_failed",
      properties: {
        worker: "insight",
        queue: env.resumeInsightQueueName,
        resume_id: resumeId,
        job_id: relatedJobId,
        queue_job_id: String(job.id ?? ""),
      },
    });
    capturePosthogEvent({
      distinctId,
      event: "analysis_completed",
      properties: {
        analysis_type: "resume_insights_generation",
        resume_id: resumeId,
        job_id: relatedJobId,
        queue_job_id: String(job.id ?? ""),
        status: "failed",
        duration_ms: Date.now() - startedAtMs,
      },
    });
    baseLogger.error("Resume insight generation failed", {
      failureCode: reason.code,
      retryable: reason.retryable,
      error: error.message,
      durationMs: Date.now() - startedAtMs,
    });

    if (!reason.retryable) {
      throwUnrecoverable(reason);
    }

    throw error;
  }
};

const processInsightJobWithTimeout = async (job) => {
  return withProcessTimeout({
    operation: () => processInsightJob(job),
    timeoutMs: env.resumeInsightProcessTimeoutMs,
    processName: "Resume insight generation",
  });
};

const worker = new Worker(env.resumeInsightQueueName, processInsightJobWithTimeout, {
  connection,
  concurrency: env.resumeInsightWorkerConcurrency,
  limiter: {
    max: env.resumeInsightWorkerLimiterMax,
    duration: env.resumeInsightWorkerLimiterDurationMs,
  },
});

worker.on("error", (error) => {
  Sentry.captureException(error, {
    tags: {
      queue: env.resumeInsightQueueName,
      worker: "insight",
    },
  });
  logger.error("Insight worker encountered an error", {
    queue: env.resumeInsightQueueName,
    error: error.message,
  });
});

worker.on("failed", async (job, error) => {
  const attempts = job?.opts?.attempts ?? env.resumeInsightQueueAttempts;
  const attempt = (job?.attemptsMade ?? 0) + 1;
  const isFinalAttempt = attempt >= attempts;
  const retries = Math.max(0, attempt - 1);
  const reason = resolveFailureReason(error, "RESUME_INSIGHTS_FAILED");
  if (isFinalAttempt && job?.data?.resumeId) {
    await persistInsightFailure({
      resumeId: job.data.resumeId,
      failure: buildFailureRecord({ stage: "insight_worker", reason }),
      baseLogger: logger.child({
        queue: env.resumeInsightQueueName,
        queueJobId: job?.id,
      }),
    });
  }
  signal("💥", "insight:job-failed-event", {
    resumeId: job?.data?.resumeId ?? null,
    code: reason.code,
    isFinalAttempt,
  });
  Sentry.captureException(error, {
    tags: {
      queue: env.resumeInsightQueueName,
      worker: "insight",
    },
    extra: {
      queueJobId: job?.id,
      resumeId: job?.data?.resumeId,
      attemptsMade: job?.attemptsMade,
    },
  });
  capturePosthogEvent({
    distinctId: job?.data?.userId,
    event: "worker_failed",
    properties: {
      worker: "insight",
      queue: env.resumeInsightQueueName,
      queue_job_id: String(job?.id ?? ""),
      resume_id: job?.data?.resumeId ?? null,
      job_id: job?.data?.jobId ?? null,
    },
  });
  logger.error("Insight queue job failed", {
    queue: env.resumeInsightQueueName,
    queueJobId: job?.id,
    resumeId: job?.data?.resumeId,
    attemptsMade: job?.attemptsMade,
    failureCode: error?.code ?? null,
    error: error.message,
  });
});

logger.info("Insight worker started", {
  queue: env.resumeInsightQueueName,
  concurrency: env.resumeInsightWorkerConcurrency,
  limiterMax: env.resumeInsightWorkerLimiterMax,
  limiterDurationMs: env.resumeInsightWorkerLimiterDurationMs,
  processTimeoutMs: env.resumeInsightProcessTimeoutMs,
});

process.on("unhandledRejection", (error) => {
  Sentry.captureException(error, {
    tags: {
      queue: env.resumeInsightQueueName,
      worker: "insight",
    },
  });
  logger.error("Unhandled rejection in insight worker", {
    queue: env.resumeInsightQueueName,
    error: error instanceof Error ? error.message : String(error),
  });
});

process.on("uncaughtException", (error) => {
  Sentry.captureException(error, {
    tags: {
      queue: env.resumeInsightQueueName,
      worker: "insight",
    },
  });
  logger.error("Uncaught exception in insight worker", {
    queue: env.resumeInsightQueueName,
    error: error.message,
  });
  void shutdownPosthog();
  process.exit(1);
});
