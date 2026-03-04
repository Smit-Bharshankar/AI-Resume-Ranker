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

const stageBadgeToneMap: Record<
  CandidateStage,
  "neutral" | "info" | "warning" | "danger" | "success"
> = {
  NEW: "neutral",
  SHORTLISTED: "info",
  INTERVIEWING: "warning",
  REJECTED: "danger",
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

export const getCandidateStageBadgeTone = (
  stage: CandidateStage,
): "neutral" | "info" | "warning" | "danger" | "success" => stageBadgeToneMap[stage];
