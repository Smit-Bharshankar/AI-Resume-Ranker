const FAILED_RETRY_STATUSES = Object.freeze([
  "FAILED_EXTRACTION",
  "FAILED_STRUCTURE",
  "FAILED_SCORING",
  "FAILED_INSIGHTS",
]);

const FAILED_RETRY_STATUS_SET = new Set(FAILED_RETRY_STATUSES);

const RETRY_STAGE_MAPPING = Object.freeze({
  FAILED_EXTRACTION: {
    resetStatus: "UPLOADED",
    stage: "EXTRACTION",
    queue: "resume",
  },
  FAILED_STRUCTURE: {
    resetStatus: "TEXT_EXTRACTED",
    stage: "STRUCTURING",
    queue: "resume",
  },
  FAILED_SCORING: {
    resetStatus: "STRUCTURED",
    stage: "SCORING",
    queue: "resume",
  },
  FAILED_INSIGHTS: {
    resetStatus: "SCORED",
    stage: "INSIGHTS",
    queue: "insight",
  },
});

const isRetryEligibleStatus = (status) => FAILED_RETRY_STATUS_SET.has(status);

const getRetryStageConfig = (failedStatus) => RETRY_STAGE_MAPPING[failedStatus] ?? null;

export {
  FAILED_RETRY_STATUSES,
  isRetryEligibleStatus,
  getRetryStageConfig,
};
