import { Insights } from "./insights";
import { Job } from "./job";
import { Resume, ResumeStatus, ScoreBreakdown } from "./resume";

export type CandidateStructuredData = Resume["structuredData"];

export type CandidateProfile = {
  id: string;
  jobId: string;
  status: ResumeStatus;
  score?: number;
  scoreBreakdown?: ScoreBreakdown;
  insights?: Insights;
  structuredData?: CandidateStructuredData;
  storagePath?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CandidateProfileView = {
  candidate: CandidateProfile;
  job?: Pick<Job, "id" | "title" | "structuredRequirements">;
};

export type ResumeFileUrl = {
  url: string;
  expiresAt?: string;
};
