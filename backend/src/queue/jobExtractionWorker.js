import { Worker } from "bullmq";
import { fileURLToPath } from "url";
import env from "../config/env.js";
import logger from "../utils/logger.js";
import { connection } from "./resumeQueue.js";
import jobExtractionService from "../modules/jobExtraction/jobExtraction.service.js";

const isRetriableError = (error) => {
  return error?.retryable === true;
};

const processJobExtraction = async (job) => {
  const startedAtMs = Date.now();
  const { jobId } = job.data ?? {};

  if (!jobId || typeof jobId !== "string") {
    throw new Error("Invalid jobId in queue payload");
  }

  const baseLogger = logger.child({
    queue: env.jobExtractionQueueName,
    queueJobId: job.id,
    jobId,
    attemptsMade: job.attemptsMade + 1,
    maxAttempts: job.opts.attempts ?? env.jobExtractionQueueAttempts,
  });

  baseLogger.info("Job requirements extraction started");

  try {
    const result = await jobExtractionService.process(jobId);
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

const startJobExtractionWorker = ({ concurrency = 1 } = {}) => {
  const worker = new Worker(env.jobExtractionQueueName, processJobExtraction, {
    connection,
    concurrency,
  });

  worker.on("error", (error) => {
    logger.error("Job extraction worker encountered an error", {
      queue: env.jobExtractionQueueName,
      error: error.message,
    });
  });

  worker.on("failed", (job, error) => {
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
    concurrency,
  });

  return worker;
};

export { processJobExtraction, startJobExtractionWorker };

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startJobExtractionWorker({ concurrency: 1 });
}
