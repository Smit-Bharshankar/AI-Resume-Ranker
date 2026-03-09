import { Queue } from "bullmq";
import env from "../config/env.js";
import { connection } from "./resumeQueue.js";

const insightQueue = new Queue(env.resumeInsightQueueName, {
  connection,
  defaultJobOptions: {
    attempts: env.resumeInsightQueueAttempts,
    backoff: {
      type: "exponential",
      delay: env.resumeInsightQueueBackoffMs,
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
    return existing;
  }

  return insightQueue.add(
    "generate-resume-insights",
    { resumeId, userId, jobId },
    {
      jobId: resumeId,
    },
  );
};

export { insightQueue, enqueueResumeInsightGeneration };
