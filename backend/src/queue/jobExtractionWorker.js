import { Worker } from "bullmq";
import env from "../config/env.js";
import logger from "../utils/logger.js";
import { connection } from "./resumeQueue.js";
import jobExtractionService from "../modules/jobExtraction/jobExtraction.service.js";
import { Sentry } from "../monitoring/sentry.js";
import { capturePosthogEvent } from "../analytics/posthog.js";
import jobService from "../modules/job/job.service.js";
import { shutdownPosthog } from "../analytics/posthog.js";
import { withProcessTimeout } from "./processorTimeout.js";

const isRetriableError = (error) => {
  return error?.retryable === true;
};

const processJobExtraction = async (job) => {
  const startedAtMs = Date.now();
  const { jobId, userId: jobUserId } = job.data ?? {};

  if (!jobId || typeof jobId !== "string") {
    throw new Error("Invalid jobId in queue payload");
  }

  const ownerContext =
    typeof jobUserId === "string"
      ? { userId: jobUserId }
      : await jobService.getJobOwnerContext(jobId);
  const distinctId = ownerContext?.userId ?? null;

  const baseLogger = logger.child({
    queue: env.jobExtractionQueueName,
    queueJobId: job.id,
    jobId,
    attemptsMade: job.attemptsMade + 1,
    maxAttempts: job.opts.attempts ?? env.jobExtractionQueueAttempts,
  });

  const attempt = job.attemptsMade + 1;
  const maxAttempts = job.opts.attempts ?? env.jobExtractionQueueAttempts;
  const retries = Math.max(0, attempt - 1);

  baseLogger.info("Job requirements extraction started");
  capturePosthogEvent({
    distinctId,
    event: "analysis_started",
    properties: {
      analysis_type: "requirements_extraction",
      job_id: jobId,
      queue_job_id: String(job.id ?? ""),
      source: "worker",
    },
  });

  try {
    const result = await jobExtractionService.process(jobId);
    capturePosthogEvent({
      distinctId,
      event: "analysis_completed",
      properties: {
        analysis_type: "requirements_extraction",
        job_id: jobId,
        queue_job_id: String(job.id ?? ""),
        status: "success",
        duration_ms: Date.now() - startedAtMs,
      },
    });
    baseLogger.info("Job requirements extraction finished", {
      resultStatus: result?.status ?? "unknown",
      durationMs: Date.now() - startedAtMs,
      structuredRequirements: result?.structuredRequirements ?? null,
    });
    return result;
  } catch (error) {
    const attempts = job.opts.attempts ?? env.jobExtractionQueueAttempts;
    const isFinalAttempt = job.attemptsMade + 1 >= attempts;
    const retryable = isRetriableError(error);
    Sentry.captureException(error, {
      tags: {
        queue: env.jobExtractionQueueName,
        worker: "job-extraction",
      },
      extra: {
        jobId,
        queueJobId: job.id,
        retryable,
      },
    });
    capturePosthogEvent({
      distinctId,
      event: "worker_failed",
      properties: {
        worker: "job_extraction",
        queue: env.jobExtractionQueueName,
        job_id: jobId,
        queue_job_id: String(job.id ?? ""),
        retryable,
      },
    });
    capturePosthogEvent({
      distinctId,
      event: "analysis_completed",
      properties: {
        analysis_type: "requirements_extraction",
        job_id: jobId,
        queue_job_id: String(job.id ?? ""),
        status: "failed",
        duration_ms: Date.now() - startedAtMs,
      },
    });

    baseLogger.error("Job requirements extraction failed", {
      error: error.message,
      retryable,
      isFinalAttempt,
      durationMs: Date.now() - startedAtMs,
    });

    if (!retryable) {
      return;
    }

    throw error;
  }
};

const processJobExtractionWithTimeout = async (job) => {
  return withProcessTimeout({
    operation: () => processJobExtraction(job),
    timeoutMs: env.jobExtractionProcessTimeoutMs,
    processName: "Job requirements extraction",
  });
};

const worker = new Worker(
  env.jobExtractionQueueName,
  processJobExtractionWithTimeout,
  {
    connection,
    concurrency: env.jobExtractionWorkerConcurrency,
  },
);

worker.on("error", (error) => {
  Sentry.captureException(error, {
    tags: {
      queue: env.jobExtractionQueueName,
      worker: "job-extraction",
    },
  });
  logger.error("Job extraction worker encountered an error", {
    queue: env.jobExtractionQueueName,
    error: error.message,
  });
});

worker.on("failed", (job, error) => {
  Sentry.captureException(error, {
    tags: {
      queue: env.jobExtractionQueueName,
      worker: "job-extraction",
    },
    extra: {
      queueJobId: job?.id,
      jobId: job?.data?.jobId,
      attemptsMade: job?.attemptsMade,
    },
  });
  capturePosthogEvent({
    distinctId: job?.data?.userId,
    event: "worker_failed",
    properties: {
      worker: "job_extraction",
      queue: env.jobExtractionQueueName,
      queue_job_id: String(job?.id ?? ""),
      job_id: job?.data?.jobId ?? null,
    },
  });
  logger.error("Job extraction queue job failed", {
    queue: env.jobExtractionQueueName,
    queueJobId: job?.id,
    jobId: job?.data?.jobId,
    attemptsMade: job?.attemptsMade,
    error: error.message,
  });
});

logger.info("Job extraction worker started", {
  queue: env.jobExtractionQueueName,
  concurrency: env.jobExtractionWorkerConcurrency,
  processTimeoutMs: env.jobExtractionProcessTimeoutMs,
});

process.on("unhandledRejection", (error) => {
  Sentry.captureException(error, {
    tags: {
      queue: env.jobExtractionQueueName,
      worker: "job-extraction",
    },
  });
  logger.error("Unhandled rejection in job extraction worker", {
    queue: env.jobExtractionQueueName,
    error: error instanceof Error ? error.message : String(error),
  });
});

process.on("uncaughtException", (error) => {
  Sentry.captureException(error, {
    tags: {
      queue: env.jobExtractionQueueName,
      worker: "job-extraction",
    },
  });
  logger.error("Uncaught exception in job extraction worker", {
    queue: env.jobExtractionQueueName,
    error: error.message,
  });
  void shutdownPosthog();
  process.exit(1);
});
