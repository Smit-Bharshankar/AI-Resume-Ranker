import env from "../../config/env.js";
import logger from "../../utils/logger.js";
import resumeService from "../resume/resume.service.js";
import jobService from "../job/job.service.js";
import getAiProvider from "../ai/providers/provider.factory.js";
import { parseJsonFromCompletion } from "../ai/json.parser.js";
import { buildInsightPrompt } from "./insightPrompt.builder.js";
import {
  InsightSchemaValidationError,
  validateInsightPayload,
} from "./insightSchema.validator.js";

const MAX_AI_RETRIES = 2;

const sleep = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isPlainObject = (value) => {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
};

const getErrorStatus = (error) => {
  const status = error?.status ?? error?.response?.status;
  return Number.isFinite(status) ? status : null;
};

const isRetriableAiError = (error) => {
  const status = getErrorStatus(error);
  if (status !== null) {
    if (status === 429) {
      return true;
    }

    if (status >= 500) {
      return true;
    }

    return false;
  }

  const code = String(error?.code ?? "").toLowerCase();
  const type = String(error?.type ?? "").toLowerCase();
  const message = String(error?.message ?? "").toLowerCase();

  return (
    type.includes("rate_limit") ||
    code.includes("timeout") ||
    code.includes("econnreset") ||
    code.includes("enotfound") ||
    code.includes("eai_again") ||
    code.includes("econnrefused") ||
    code.includes("etimedout") ||
    message.includes("socket hang up") ||
    code.includes("ai_provider_timeout")
  );
};

const resolveRetryDelayMs = (error, attempt) => {
  const retryAfterHeader =
    error?.headers?.["retry-after"] ??
    error?.response?.headers?.["retry-after"] ??
    error?.response?.headers?.get?.("retry-after");

  const retryAfterSeconds = Number(retryAfterHeader);
  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
    return Math.floor(retryAfterSeconds * 1000);
  }

  return env.aiExtractionRetryBaseDelayMs * 2 ** attempt;
};

const requestInsights = async ({
  resumeId,
  structuredResume,
  structuredRequirements,
  scoreBreakdown,
}) => {
  const provider = getAiProvider();
  const { systemPrompt, userPrompt, wasTruncated } = buildInsightPrompt({
    structuredResume,
    structuredRequirements,
    scoreBreakdown,
  });

  const result = await provider.generateJson({
    systemPrompt,
    userPrompt,
    temperature: 0.1,
  });

  logger.info("Resume insight AI response received", {
    resumeId,
    provider: env.aiProvider,
    model: result.model,
    wasTruncated,
    inputTokens: result.usage?.inputTokens,
    outputTokens: result.usage?.outputTokens,
    totalTokens: result.usage?.totalTokens,
    configuredRpm: env.aiRpm,
    configuredRpd: env.aiRpd,
    configuredTpm: env.aiTpm,
  });

  const parsed = parseJsonFromCompletion(result.text);
  return validateInsightPayload(parsed);
};

const process = async (resumeId) => {
  const startedAtMs = Date.now();
  const serviceLogger = logger.child({
    service: "resume-insight-generation",
    resumeId,
  });

  if (!resumeId || typeof resumeId !== "string") {
    serviceLogger.warn("Skipping resume insights due to invalid resumeId");
    return { status: "skipped" };
  }

  const resume = await resumeService.getResumeById(resumeId);
  if (!resume) {
    serviceLogger.warn("Skipping resume insights for missing resume");
    return { status: "skipped" };
  }

  const scopedLogger = serviceLogger.child({
    jobId: resume.jobId,
    currentStatus: resume.status,
  });

  if (resume.status !== "SCORED" && resume.status !== "INSIGHTS_GENERATING") {
    scopedLogger.info("Skipping resume insights due to status mismatch");
    return { status: "skipped" };
  }

  if (resume.status === "SCORED") {
    const started = await resumeService.startInsightsGeneration(resumeId);
    if (!started) {
      scopedLogger.warn("Skipped resume insights start due to concurrent status update");
      return { status: "skipped" };
    }
  }

  if (!isPlainObject(resume.structuredData) || !isPlainObject(resume.scoreBreakdown)) {
    await resumeService.markInsightsFailed(resumeId);
    scopedLogger.error("Cannot generate insights without structured resume and score breakdown");
    return { status: "failed" };
  }

  const job = await jobService.getJobById(resume.jobId);
  if (!job) {
    await resumeService.markInsightsFailed(resumeId);
    scopedLogger.error("Cannot generate insights because job was not found");
    return { status: "failed" };
  }

  if (!isPlainObject(job.structuredRequirements)) {
    await resumeService.markInsightsFailed(resumeId);
    scopedLogger.error("Cannot generate insights due to missing structured requirements");
    return { status: "failed" };
  }

  for (let attempt = 0; attempt <= MAX_AI_RETRIES; attempt += 1) {
    const attemptNumber = attempt + 1;
    const isFinalAttempt = attempt === MAX_AI_RETRIES;

    try {
      const insights = await requestInsights({
        resumeId,
        structuredResume: resume.structuredData,
        structuredRequirements: job.structuredRequirements,
        scoreBreakdown: resume.scoreBreakdown,
      });

      const saved = await resumeService.completeInsightsGeneration({
        id: resumeId,
        insights,
      });

      if (!saved) {
        scopedLogger.warn("Skipped insights save due to concurrent status update", {
          attempt: attemptNumber,
          durationMs: Date.now() - startedAtMs,
        });
        return { status: "skipped" };
      }

      scopedLogger.info("Resume insights generated", {
        attempt: attemptNumber,
        recommendation: insights.recommendation,
        strengthsCount: insights.strengths.length,
        weaknessesCount: insights.weaknesses.length,
        interviewQuestionsCount: insights.interview_questions.length,
        durationMs: Date.now() - startedAtMs,
      });

      return { status: "generated", insights };
    } catch (error) {
      const retriable = isRetriableAiError(error);
      const statusCode = getErrorStatus(error);
      const isValidationError = error instanceof InsightSchemaValidationError;
      const isInvalidJsonError = error?.code === "INVALID_JSON_RESPONSE";

      scopedLogger.warn("Resume insights attempt failed", {
        attempt: attemptNumber,
        maxRetries: MAX_AI_RETRIES,
        retriable,
        statusCode,
        errorCode: error?.code,
        isValidationError,
        isInvalidJsonError,
        error: error.message,
      });

      if (isFinalAttempt || !retriable) {
        await resumeService.markInsightsFailed(resumeId);
        scopedLogger.error("Resume insights generation failed", {
          attempt: attemptNumber,
          maxRetries: MAX_AI_RETRIES,
          isFinalAttempt,
          retriable,
          statusCode,
          errorCode: error?.code,
          durationMs: Date.now() - startedAtMs,
          error: error.message,
        });
        return { status: "failed" };
      }

      const delayMs = resolveRetryDelayMs(error, attempt);
      await sleep(delayMs);
    }
  }

  await resumeService.markInsightsFailed(resumeId);
  return { status: "failed" };
};

const insightService = {
  process,
};

export default insightService;
