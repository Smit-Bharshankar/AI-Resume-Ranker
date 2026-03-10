import resumeService from "../resume/resume.service.js";
import jobService from "../job/job.service.js";
import scoringEngine from "./scoring.engine.js";
import scoreExplainer from "./score.explainer.js";
import logger from "../../utils/logger.js";
import { buildFailureRecord, resolveFailureReason } from "../ai/failureReason.js";

const hasStructuredRequirements = (value) => {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
};

const process = async (resumeId) => {
  const startedAtMs = Date.now();
  const serviceLogger = logger.child({
    service: "resume-matching",
    resumeId,
  });

  if (!resumeId || typeof resumeId !== "string") {
    serviceLogger.warn("Skipping resume scoring due to invalid resumeId");
    return { status: "skipped" };
  }

  const resume = await resumeService.getResumeById(resumeId);
  if (!resume) {
    serviceLogger.warn("Skipping resume scoring for missing resume");
    return { status: "skipped" };
  }

  const scopedLogger = serviceLogger.child({
    jobId: resume.jobId,
    currentStatus: resume.status,
  });

  scopedLogger.info("Resume scoring evaluation started");

  if (resume.status !== "STRUCTURED") {
    scopedLogger.info("Skipping resume scoring due to status mismatch");
    return { status: "skipped" };
  }

  const job = await jobService.getJobById(resume.jobId);
  if (!job) {
    scopedLogger.warn("Skipping resume scoring because job was not found");
    return { status: "skipped" };
  }

  if (job.status !== "ACTIVE") {
    scopedLogger.info("Skipping resume scoring because job is not ACTIVE", {
      jobStatus: job.status,
    });
    return { status: "skipped" };
  }

  if (!hasStructuredRequirements(job.structuredRequirements)) {
    scopedLogger.warn("Skipping resume scoring due to missing structured requirements");
    return { status: "skipped" };
  }

  try {
    const requirements = job.structuredRequirements;
    const requiredCount = Array.isArray(requirements.required_skills)
      ? requirements.required_skills.length
      : 0;
    const preferredCount = Array.isArray(requirements.preferred_skills)
      ? requirements.preferred_skills.length
      : 0;

    scopedLogger.info("Scoring inputs resolved", {
      requiredSkillsCount: requiredCount,
      preferredSkillsCount: preferredCount,
      minimumExperienceYears:
        Number(requirements.minimum_experience_years) || 0,
    });

    const scoringResult = scoringEngine.score({
      structuredResume: resume.structuredData,
      structuredRequirements: job.structuredRequirements,
    });

    const scoreBreakdown = scoreExplainer.buildScoreBreakdown(scoringResult);
    const saved = await resumeService.completeScoring({
      id: resumeId,
      score: scoringResult.finalScore,
      scoreBreakdown,
    });

    if (!saved) {
      scopedLogger.warn("Skipped scoring save due to concurrent status update");
      return { status: "skipped" };
    }

    scopedLogger.info("Resume scoring completed", {
      score: scoringResult.finalScore,
      requiredMatched: scoreBreakdown.required.matched,
      requiredTotal: scoreBreakdown.required.total,
      preferredMatched: scoreBreakdown.preferred.matched,
      preferredTotal: scoreBreakdown.preferred.total,
      durationMs: Date.now() - startedAtMs,
    });

    return { status: "scored" };
  } catch (error) {
    const reason = resolveFailureReason(error, "RESUME_SCORING_FAILED");
    await resumeService.markScoringFailed(
      resumeId,
      buildFailureRecord({ stage: "scoring", reason }),
    );

    scopedLogger.error("Resume scoring failed", {
      failureCode: reason.code,
      retryable: reason.retryable,
      error: error.message,
      durationMs: Date.now() - startedAtMs,
    });

    return { status: "failed", failureCode: reason.code, retryable: reason.retryable };
  }
};

const resumeMatchingService = {
  process,
};

export default resumeMatchingService;
