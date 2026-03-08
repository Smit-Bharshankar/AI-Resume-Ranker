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

const enqueueResumeInsightGeneration = async ({ resumeId, userId, jobId }) => {
  return insightQueue.add(
    "generate-resume-insights",
    { resumeId, userId, jobId },
    {
      jobId: resumeId,
    },
  );
};

export { insightQueue, enqueueResumeInsightGeneration };
