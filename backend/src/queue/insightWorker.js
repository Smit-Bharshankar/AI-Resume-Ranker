import { Worker } from "bullmq";
import env from "../config/env.js";
import logger from "../utils/logger.js";
import { connection } from "./resumeQueue.js";
import insightService from "../modules/insights/insight.service.js";
import { Sentry } from "../monitoring/sentry.js";
import { capturePosthogEvent } from "../analytics/posthog.js";
import resumeService from "../modules/resume/resume.service.js";
import { shutdownPosthog } from "../analytics/posthog.js";
import { withProcessTimeout } from "./processorTimeout.js";

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
    const result = await insightService.process(resumeId);
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

    return result;
  } catch (error) {
    const isFinalAttempt = attempt >= maxAttempts;
    if (isFinalAttempt) {
      void resumeService.markInsightsFailed(resumeId);
    }
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
      error: error.message,
      durationMs: Date.now() - startedAtMs,
    });

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

worker.on("failed", (job, error) => {
  const attempts = job?.opts?.attempts ?? env.resumeInsightQueueAttempts;
  const attempt = (job?.attemptsMade ?? 0) + 1;
  const isFinalAttempt = attempt >= attempts;
  const retries = Math.max(0, attempt - 1);
  if (isFinalAttempt && job?.data?.resumeId) {
    void resumeService.markInsightsFailed(job.data.resumeId);
  }
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
    error: error.message,
  });
});

logger.info("Insight worker started", {
  queue: env.resumeInsightQueueName,
  concurrency: env.resumeInsightWorkerConcurrency,
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
