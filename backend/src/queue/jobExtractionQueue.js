import { Queue } from "bullmq";
import env from "../config/env.js";
import { connection } from "./resumeQueue.js";

const jobExtractionQueue = new Queue(env.jobExtractionQueueName, {
  connection,
  defaultJobOptions: {
    attempts: env.jobExtractionQueueAttempts,
    backoff: {
      type: "exponential",
      delay: env.jobExtractionQueueBackoffMs,
    },
    removeOnComplete: {
      count: 1000,
    },
    removeOnFail: {
      count: 1000,
    },
  },
});

const enqueueJobRequirementsExtraction = async ({ jobId, userId }) => {
  return jobExtractionQueue.add(
    "extract-job-requirements",
    { jobId, userId },
    {
      jobId,
    },
  );
};

export { jobExtractionQueue, enqueueJobRequirementsExtraction };
