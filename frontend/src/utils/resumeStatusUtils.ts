import { ResumeStatus } from "../types/resume";

const processingStatuses: ResumeStatus[] = [
  "UPLOADED",
  "TEXT_EXTRACTED",
  "STRUCTURED",
  "SCORED",
  "INSIGHTS_GENERATING",
];

const failedStatuses: ResumeStatus[] = [
  "FAILED_EXTRACTION",
  "FAILED_STRUCTURE",
  "FAILED_SCORING",
  "FAILED_INSIGHTS",
];

export const isResumeProcessingStatus = (status: ResumeStatus): boolean =>
  processingStatuses.includes(status);

export const isResumeCompletedStatus = (status: ResumeStatus): boolean =>
  status === "INSIGHTS_GENERATED";

export const isResumeFailedStatus = (status: ResumeStatus): boolean =>
  failedStatuses.includes(status);

export const shouldPollResumeStatus = (status: ResumeStatus): boolean =>
  isResumeProcessingStatus(status);
