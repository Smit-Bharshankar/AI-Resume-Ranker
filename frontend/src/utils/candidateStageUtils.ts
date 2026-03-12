import { CandidateStage } from "../types/resume";

export const CANDIDATE_STAGES = [
  "NEW",
  "SHORTLISTED",
  "INTERVIEWING",
  "REJECTED",
  "HIRED",
] as const satisfies readonly CandidateStage[];

export type CandidateStageFilter = "ALL" | CandidateStage;

const stageLabelMap: Record<CandidateStage, string> = {
  NEW: "New",
  SHORTLISTED: "Shortlisted",
  INTERVIEWING: "Interviewing",
  REJECTED: "Rejected",
  HIRED: "Hired",
};

const stageBadgeVariantMap: Record<
  CandidateStage,
  "secondary" | "info" | "warning" | "destructive" | "success"
> = {
  NEW: "secondary",
  SHORTLISTED: "info",
  INTERVIEWING: "warning",
  REJECTED: "destructive",
  HIRED: "success",
};

export const CANDIDATE_STAGE_FILTERS: CandidateStageFilter[] = [
  "ALL",
  ...CANDIDATE_STAGES,
];

export const isCandidateStage = (value: unknown): value is CandidateStage =>
  typeof value === "string" &&
  (CANDIDATE_STAGES as readonly string[]).includes(value);

export const getCandidateStageLabel = (stage: CandidateStage): string =>
  stageLabelMap[stage];

export const getCandidateStageBadgeVariant = (
  stage: CandidateStage,
): "secondary" | "info" | "warning" | "destructive" | "success" => stageBadgeVariantMap[stage];
