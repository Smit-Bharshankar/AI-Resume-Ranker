import { Queue } from "bullmq";
import env from "../config/env.js";
import { connection } from "./resumeQueue.js";
import logger from "../utils/logger.js";

const insightQueue = new Queue(env.resumeInsightQueueName, {
  connection,
  defaultJobOptions: {
    attempts: env.resumeInsightsAttempts,
    backoff: {
      type: "exponential",
      delay: env.stageBackoffMs,
    },
    removeOnComplete: {
      count: 1000,
    },
    removeOnFail: {
      count: 1000,
    },
  },
});

const getReusableExistingJob = async (jobId) => {
  const existingJob = await insightQueue.getJob(jobId);
  if (!existingJob) {
    return null;
  }

  const state = await existingJob.getState();
  if (state === "failed" || state === "completed") {
    await existingJob.remove();
    return null;
  }

  return existingJob;
};

const enqueueResumeInsightGeneration = async ({ resumeId, userId, jobId }) => {
  const existing = await getReusableExistingJob(resumeId);
  if (existing) {
    logger.info("insight_queue_enqueue_skipped_duplicate", {
      queue: env.resumeInsightQueueName,
      resumeId,
      existingQueueJobId: existing.id,
    });
    return existing;
  }

  return insightQueue.add(
    "generate-resume-insights",
    { resumeId, userId, jobId },
    {
      jobId: resumeId,
      attempts: env.resumeInsightsAttempts,
      backoff: {
        type: "exponential",
        delay: env.stageBackoffMs,
      },
    },
  );
};

export { insightQueue, enqueueResumeInsightGeneration };
