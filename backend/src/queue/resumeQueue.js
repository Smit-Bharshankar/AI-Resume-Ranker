import { Queue } from "bullmq";
import IORedis from "ioredis";
import env from "../config/env.js";
import logger from "../utils/logger.js";
import { Sentry } from "../monitoring/sentry.js";

const redisConnectionOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

const isUsableRedisUrl = (value) => {
  if (!value) {
    return false;
  }

  try {
    const parsed = new URL(value);
    if (!parsed.hostname || parsed.hostname.toLowerCase() === "host") {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

const connection = isUsableRedisUrl(env.redisUrl)
  ? new IORedis(env.redisUrl, redisConnectionOptions)
  : new IORedis({
      host: env.redisHost,
      port: env.redisPort,
      username: env.redisUsername,
      password: env.redisPassword,
      ...(env.redisUseTls ? { tls: {} } : {}),
      ...redisConnectionOptions,
    });

if (env.redisUrl && !isUsableRedisUrl(env.redisUrl)) {
  logger.warn("Ignoring invalid REDIS_URL, using REDIS_HOST/PORT settings", {
    queue: env.resumeQueueName,
  });
}

connection.on("error", (error) => {
  Sentry.captureException(error, {
    tags: {
      component: "redis",
      queue: env.resumeQueueName,
    },
  });
});

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

const enqueueResumeExtraction = async ({ resumeId, userId, jobId }) => {
  return resumeQueue.add(
    "extract-resume-text",
    { resumeId, userId, jobId },
    {
      jobId: resumeId,
    },
  );
};

export { connection, resumeQueue, enqueueResumeExtraction };
