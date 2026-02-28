export type JobStatus =
  | "DRAFT"
  | "EXTRACTING_REQUIREMENTS"
  | "REQUIREMENTS_STRUCTURED"
  | "ACTIVE"
  | "FAILED_STRUCTURE";

export type StructuredRequirements = {
  required_skills: string[];
  preferred_skills: string[];
  mandatory_keywords: string[];
  minimum_experience_years: number;
};

export type Job = {
  id: string;
  title: string;
  rawDescription: string;
  status: JobStatus;
  structuredRequirements?: StructuredRequirements | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateJobInput = {
  title: string;
  rawDescription: string;
};

export type UpdateRequirementsInput = StructuredRequirements;
