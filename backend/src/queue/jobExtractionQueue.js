import { Queue } from "bullmq";
import env from "../config/env.js";
import { connection } from "./resumeQueue.js";
import logger from "../utils/logger.js";

const jobExtractionQueue = new Queue(env.jobExtractionQueueName, {
  connection,
  defaultJobOptions: {
    attempts: env.jobExtractionQueueAttempts,
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
  const existingJob = await jobExtractionQueue.getJob(jobId);
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

const enqueueJobRequirementsExtraction = async ({ jobId, userId }) => {
  const existing = await getReusableExistingJob(jobId);
  if (existing) {
    logger.info("job_extraction_queue_enqueue_skipped_duplicate", {
      queue: env.jobExtractionQueueName,
      jobId,
      existingQueueJobId: existing.id,
    });
    return existing;
  }

  return jobExtractionQueue.add(
    "extract-job-requirements",
    { jobId, userId },
    {
      jobId,
      attempts: env.jobExtractionQueueAttempts,
      backoff: {
        type: "exponential",
        delay: env.stageBackoffMs,
      },
    },
  );
};

export { jobExtractionQueue, enqueueJobRequirementsExtraction };
