import { insightQueue } from "./insightQueue.js";
import { jobExtractionQueue } from "./jobExtractionQueue.js";
import { resumeQueue } from "./resumeQueue.js";
import logger from "../utils/logger.js";

const ACTIVE_STATE = "active";

const removeQueueJobById = async ({
  queue,
  queueName,
  jobId,
  userId = null,
  resumeId = null,
  parentJobId = null,
}) => {
  let state = null;
  let existed = false;
  let wasActive = false;
  let existing = null;

  try {
    existing = await queue.getJob(jobId);
    if (existing) {
      existed = true;
      state = await existing.getState();
      wasActive = state === ACTIVE_STATE;

      if (wasActive) {
        try {
          existing.discard();
        } catch {
          // Best-effort only. Active jobs may still finish naturally.
        }
      }
    }
  } catch (error) {
    logger.warn("queue_jobs_cancelled_lookup_failed", {
      queue: queueName,
      userId,
      resumeId,
      jobId: parentJobId,
      queueJobId: jobId,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  try {
    if (existing) {
      await existing.remove();
    }
  } catch (error) {
    logger.warn("queue_jobs_cancelled_remove_failed", {
      queue: queueName,
      userId,
      resumeId,
      jobId: parentJobId,
      queueJobId: jobId,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  logger.info("queue_jobs_cancelled", {
    queue: queueName,
    userId,
    resumeId,
    jobId: parentJobId,
    queueJobId: jobId,
    existed,
    state,
    wasActive,
  });

  return {
    queue: queueName,
    queueJobId: jobId,
    existed,
    state,
    wasActive,
  };
};

const cancelResumeQueueJobs = async ({ resumeId, userId = null, jobId = null }) => {
  const [processing, insight] = await Promise.all([
    removeQueueJobById({
      queue: resumeQueue,
      queueName: "resume-processing",
      jobId: resumeId,
      userId,
      resumeId,
      parentJobId: jobId,
    }),
    removeQueueJobById({
      queue: insightQueue,
      queueName: "resume-insight",
      jobId: resumeId,
      userId,
      resumeId,
      parentJobId: jobId,
    }),
  ]);

  return [processing, insight];
};

const cancelJobExtractionQueueJob = async ({ jobId, userId = null }) => {
  return removeQueueJobById({
    queue: jobExtractionQueue,
    queueName: "job-extraction",
    jobId,
    userId,
    parentJobId: jobId,
  });
};

export {
  cancelResumeQueueJobs,
  cancelJobExtractionQueueJob,
};
