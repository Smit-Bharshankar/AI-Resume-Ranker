import { Queue } from "bullmq";
import IORedis from "ioredis";
import env from "../config/env.js";
import logger from "../utils/logger.js";

const redisConnectionOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

const redisUrl = process.env.REDIS_URL ?? env.redisUrl;

if (!redisUrl) {
  logger.warn("REDIS_URL is not configured; falling back to local Redis", {
    queue: env.resumeQueueName,
  });
}

const connection = new IORedis(redisUrl || "redis://127.0.0.1:6379", redisConnectionOptions);

const resumeQueue = new Queue(env.resumeQueueName, {
  connection,
  defaultJobOptions: {
    attempts: env.resumeQueueAttempts,
    backoff: {
      type: "exponential",
      delay: env.resumeQueueBackoffMs,
    },
    removeOnComplete: {
      count: 1000,
    },
    removeOnFail: {
      count: 1000,
    },
  },
});

const enqueueResumeExtraction = async ({ resumeId }) => {
  return resumeQueue.add(
    "extract-resume-text",
    { resumeId },
    {
      jobId: resumeId,
    },
  );
};

export { connection, resumeQueue, enqueueResumeExtraction };
