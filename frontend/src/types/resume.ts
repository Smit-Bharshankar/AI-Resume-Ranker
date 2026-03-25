import { Insights } from "./insights";

export type ResumeStatus =
  | "UPLOADED"
  | "TEXT_EXTRACTED"
  | "STRUCTURED"
  | "SCORED"
  | "INSIGHTS_GENERATING"
  | "INSIGHTS_GENERATED"
  | "FAILED_EXTRACTION"
  | "FAILED_STRUCTURE"
  | "FAILED_SCORING"
  | "FAILED_INSIGHTS";

export type CandidateStage =
  | "NEW"
  | "SHORTLISTED"
  | "INTERVIEWING"
  | "REJECTED"
  | "HIRED";

export type ScoreWeights = {
  required: number;
  preferred: number;
  experience: number;
};

export type RequiredScoreBreakdown = {
  total: number;
  matched: number;
  missing: string[];
};

export type PreferredScoreBreakdown = {
  total: number;
  matched: number;
};

export type ExperienceScoreBreakdown = {
  score: number;
  required_years: number;
  candidate_years: number;
};

export type ScoreBreakdown = {
  weights: ScoreWeights;
  required: RequiredScoreBreakdown;
  preferred: PreferredScoreBreakdown;
  experience: ExperienceScoreBreakdown;
  final_score: number;
};

export type ResumeStructuredData = {
  name?: string;
  email?: string;
  phone?: string;
  skills?: string[];
  location?: string;
  education?: string[];
  primary_roles?: string[];
  certifications?: string[];
  total_years_experience?: number;
};

export type Resume = {
  id: string;
  jobId: string;
  status: ResumeStatus;
  retryAllowed?: boolean;
  retryCount?: number;
  lastError?: unknown | null;
  stage: CandidateStage;
  score?: number;
  recommendation?: Insights["recommendation"] | null;
  scoreBreakdown?: ScoreBreakdown;
  insights?: Insights;
  structuredData?: ResumeStructuredData;
  storagePath?: string;
  createdAt?: string;
  updatedAt?: string;
};
