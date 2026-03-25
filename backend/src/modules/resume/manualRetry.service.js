import env from "../../config/env.js";
import logger from "../../utils/logger.js";
import resumeService from "./resume.service.js";
import {
  getRetryStageConfig,
  isRetryEligibleStatus,
} from "./retry.validation.js";
import { resumeQueue, enqueueResumeExtraction, getAttemptsForResumeStatus } from "../../queue/resumeQueue.js";
import { insightQueue, enqueueResumeInsightGeneration } from "../../queue/insightQueue.js";
import { getManualRetryCount, incrementManualRetryCount } from "../../queue/manualRetryLimiter.js";
import { getGlobalRateLimitCooldownMs } from "../ai/rateBudget.js";

const IN_FLIGHT_JOB_STATES = new Set([
  "active",
  "waiting",
  "delayed",
  "prioritized",
  "waiting-children",
]);

class ManualRetryServiceError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.name = "ManualRetryServiceError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

const getQueueJobState = async (queue, jobId) => {
  const queueJob = await queue.getJob(jobId);
  if (!queueJob) {
    return { exists: false, state: null };
  }
  const state = await queueJob.getState();
  return { exists: true, state };
};

const clearStaleQueueJobs = async (resumeId) => {
  for (const queue of [resumeQueue, insightQueue]) {
    try {
      if (typeof queue.removeJobs === "function") {
        await queue.removeJobs(resumeId);
      }
    } catch {
      // Best-effort cleanup only.
    }
  }
};

const ensureNotAlreadyProcessing = async (resumeId) => {
  const [resumeProcessing, insightProcessing] = await Promise.all([
    getQueueJobState(resumeQueue, resumeId),
    getQueueJobState(insightQueue, resumeId),
  ]);

  if (
    IN_FLIGHT_JOB_STATES.has(resumeProcessing.state) ||
    IN_FLIGHT_JOB_STATES.has(insightProcessing.state)
  ) {
    throw new ManualRetryServiceError("Resume is already processing", 409, {
      alreadyProcessing: true,
      queueStates: {
        resumeQueue: resumeProcessing.state,
        insightQueue: insightProcessing.state,
      },
    });
  }
};

const enqueueForRetryStage = async ({ stageConfig, resumeId, userId, jobId }) => {
  if (stageConfig.queue === "insight") {
    await enqueueResumeInsightGeneration({ resumeId, userId, jobId });
    return "insight";
  }

  await enqueueResumeExtraction({
    resumeId,
    userId,
    jobId,
    attempts: getAttemptsForResumeStatus(stageConfig.resetStatus),
  });
  return "resume";
};

const buildRetryInfo = ({ resume, retryCount }) => ({
  currentStatus: resume.status,
  retryAllowed: isRetryEligibleStatus(resume.status),
  lastError: resume.lastProcessingFailure ?? null,
  retryCount,
});

const retryFailedResume = async ({ resumeId, userId }) => {
  const resume = await resumeService.getResumeById(resumeId, userId);
  if (!resume) {
    throw new ManualRetryServiceError("Resume not found", 404);
  }

  const existingRetryCount = await getManualRetryCount(resumeId);

  if (!isRetryEligibleStatus(resume.status)) {
    throw new ManualRetryServiceError("Manual retry is only allowed for failed resumes", 409, {
      ...buildRetryInfo({ resume, retryCount: existingRetryCount }),
    });
  }

  if (existingRetryCount >= env.manualRetryMaxPerResume) {
    throw new ManualRetryServiceError(
      "Manual retry limit reached for this resume. Please re-upload.",
      429,
      {
        ...buildRetryInfo({ resume, retryCount: existingRetryCount }),
        maxManualRetries: env.manualRetryMaxPerResume,
      },
    );
  }

  const globalCooldownMs = await getGlobalRateLimitCooldownMs();
  if (globalCooldownMs > 0) {
    throw new ManualRetryServiceError(
      "System is temporarily rate limited. Please retry shortly.",
      429,
      {
        ...buildRetryInfo({ resume, retryCount: existingRetryCount }),
        cooldownMs: globalCooldownMs,
      },
    );
  }

  await ensureNotAlreadyProcessing(resumeId);
  await clearStaleQueueJobs(resumeId);

  const stageConfig = getRetryStageConfig(resume.status);
  if (!stageConfig) {
    throw new ManualRetryServiceError("Unable to resolve retry stage", 500);
  }

  const transitioned = await resumeService.resetFailedStatusForRetry({
    id: resumeId,
    userId,
    fromStatus: resume.status,
    toStatus: stageConfig.resetStatus,
  });

  if (!transitioned) {
    throw new ManualRetryServiceError("Resume status changed, please retry", 409, {
      conflict: true,
    });
  }

  const queueName = await enqueueForRetryStage({
    stageConfig,
    resumeId,
    userId,
    jobId: resume.jobId,
  });

  const retryCount = await incrementManualRetryCount(resumeId);
  const refreshed = await resumeService.getResumeById(resumeId, userId);

  logger.info("manual_retry", {
    resumeId,
    action: "manual_retry",
    fromStatus: resume.status,
    toStatus: stageConfig.resetStatus,
    timestamp: new Date().toISOString(),
    triggeredBy: "user",
    queue: queueName,
    retryCount,
  });

  return {
    resumeId,
    action: "manual_retry",
    fromStatus: resume.status,
    toStatus: stageConfig.resetStatus,
    currentStatus: refreshed?.status ?? stageConfig.resetStatus,
    retryAllowed: false,
    lastError: null,
    retryCount,
    maxManualRetries: env.manualRetryMaxPerResume,
  };
};

const manualRetryService = {
  retryFailedResume,
  buildRetryInfo,
  ManualRetryServiceError,
};

export { ManualRetryServiceError, buildRetryInfo, retryFailedResume };
export default manualRetryService;
