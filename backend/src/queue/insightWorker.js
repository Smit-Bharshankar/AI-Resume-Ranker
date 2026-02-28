import { Worker } from "bullmq";
import env from "../config/env.js";
import logger from "../utils/logger.js";
import { connection } from "./resumeQueue.js";
import insightService from "../modules/insights/insight.service.js";

const processInsightJob = async (job) => {
  const startedAtMs = Date.now();
  const { resumeId } = job.data ?? {};

  if (!resumeId || typeof resumeId !== "string") {
    throw new Error("Invalid resumeId in queue payload");
  }

  const baseLogger = logger.child({
    queue: env.resumeInsightQueueName,
    queueJobId: job.id,
    resumeId,
    attemptsMade: job.attemptsMade + 1,
    maxAttempts: job.opts.attempts ?? env.resumeInsightQueueAttempts,
  });

  baseLogger.info("Resume insight generation started");

  try {
    const result = await insightService.process(resumeId);

    baseLogger.info("Resume insight generation finished", {
      resultStatus: result?.status ?? "unknown",
      durationMs: Date.now() - startedAtMs,
      recommendation: result?.insights?.recommendation ?? null,
    });

    return result;
  } catch (error) {
    baseLogger.error("Resume insight generation failed", {
      error: error.message,
      durationMs: Date.now() - startedAtMs,
    });

    throw error;
  }
};

const worker = new Worker(env.resumeInsightQueueName, processInsightJob, {
  connection,
  concurrency: env.resumeInsightWorkerConcurrency,
});

worker.on("error", (error) => {
  logger.error("Insight worker encountered an error", {
    queue: env.resumeInsightQueueName,
    error: error.message,
  });
});

worker.on("failed", (job, error) => {
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
});

process.on("unhandledRejection", (error) => {
  logger.error("Unhandled rejection in insight worker", {
    queue: env.resumeInsightQueueName,
    error: error instanceof Error ? error.message : String(error),
  });
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception in insight worker", {
    queue: env.resumeInsightQueueName,
    error: error.message,
  });
  process.exit(1);
});
