import { JobStatus } from "../types/job";

export const isDraft = (status: JobStatus): boolean => status === "DRAFT";

export const isExtractingRequirements = (status: JobStatus): boolean =>
  status === "EXTRACTING_REQUIREMENTS";

export const isRequirementsStructured = (status: JobStatus): boolean =>
  status === "REQUIREMENTS_STRUCTURED";

export const isJobActive = (status: JobStatus): boolean => status === "ACTIVE";
