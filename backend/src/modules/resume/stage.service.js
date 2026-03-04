import resumeRepository from "./resume.repository.js";

const CANDIDATE_STAGES = Object.freeze([
  "NEW",
  "SHORTLISTED",
  "INTERVIEWING",
  "REJECTED",
  "HIRED",
]);

const CANDIDATE_STAGE_SET = new Set(CANDIDATE_STAGES);

const ALLOWED_STAGE_TRANSITIONS = Object.freeze({
  NEW: new Set(["SHORTLISTED", "INTERVIEWING", "REJECTED", "HIRED"]),
  SHORTLISTED: new Set(["NEW", "INTERVIEWING", "REJECTED", "HIRED"]),
  INTERVIEWING: new Set(["SHORTLISTED", "REJECTED", "HIRED"]),
  REJECTED: new Set(["NEW", "SHORTLISTED", "INTERVIEWING"]),
  HIRED: new Set(["INTERVIEWING"]),
});

class StageServiceError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "StageServiceError";
    this.statusCode = statusCode;
  }
}

const isValidCandidateStage = (stage) => CANDIDATE_STAGE_SET.has(stage);

const canTransitionStage = (fromStage, toStage) => {
  if (fromStage === toStage) {
    return true;
  }

  const nextStages = ALLOWED_STAGE_TRANSITIONS[fromStage];
  return Boolean(nextStages?.has(toStage));
};

const updateResumeStage = async ({ resumeId, userId, stage }) => {
  if (!isValidCandidateStage(stage)) {
    throw new StageServiceError("Invalid stage value", 400);
  }

  const resume = await resumeRepository.getResumeById(resumeId, userId);
  if (!resume) {
    throw new StageServiceError("Resume not found", 404);
  }

  if (resume.stage === stage) {
    return resume;
  }

  if (!canTransitionStage(resume.stage, stage)) {
    throw new StageServiceError("Invalid stage transition", 409);
  }

  return resumeRepository.updateResumeStage(resumeId, stage);
};

const stageService = {
  CANDIDATE_STAGES,
  isValidCandidateStage,
  canTransitionStage,
  updateResumeStage,
  StageServiceError,
};

export { CANDIDATE_STAGES, StageServiceError, isValidCandidateStage, canTransitionStage };
export default stageService;
