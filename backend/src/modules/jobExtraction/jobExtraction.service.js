import env from "../../config/env.js";
import logger from "../../utils/logger.js";
import jobService from "../job/job.service.js";
import getAiProvider from "../ai/providers/provider.factory.js";
import { parseJsonFromCompletion } from "../ai/json.parser.js";
import { buildJobExtractionPrompt } from "./jobPrompt.builder.js";
import {
  JOB_REQUIREMENTS_JSON_SCHEMA,
  JobSchemaValidationError,
  validateJobStructuredRequirements,
} from "./jobSchema.validator.js";
import { buildFailureRecord, resolveFailureReason } from "../ai/failureReason.js";

const MAX_AI_RETRIES = 2;

const sleep = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getErrorStatus = (error) => {
  const status = error?.status ?? error?.response?.status;
  return Number.isFinite(status) ? status : null;
};

const isRetriableAiError = (error) => {
  const status = getErrorStatus(error);
  return status === 429 || (status !== null && status >= 500);
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

const requestStructuredRequirements = async ({ jobId, rawDescription }) => {
  const provider = getAiProvider();
  const { systemPrompt, userPrompt, wasTruncated } =
    buildJobExtractionPrompt(rawDescription);

  const result = await provider.generateJson({
    systemPrompt,
    userPrompt,
    temperature: 0.1,
    responseSchema: JOB_REQUIREMENTS_JSON_SCHEMA,
    schemaName: "job_requirements",
    rateLimitBucket: "job_extraction",
  });

  logger.info("Job extraction AI response received", {
    jobId,
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
  return validateJobStructuredRequirements(parsed);
};

const process = async (jobId) => {
  const startedAtMs = Date.now();
  const serviceLogger = logger.child({
    service: "job-requirements-structuring",
    jobId,
  });

  if (!jobId || typeof jobId !== "string") {
    serviceLogger.warn("Skipping job requirements extraction due to invalid jobId");
    return { status: "skipped" };
  }

  const job = await jobService.getJobById(jobId);
  if (!job) {
    serviceLogger.warn("Skipping job requirements extraction for missing job");
    return { status: "skipped" };
  }

  const scopedLogger = serviceLogger.child({
    currentStatus: job.status,
  });

  if (job.status !== "EXTRACTING_REQUIREMENTS") {
    scopedLogger.info("Skipping job requirements extraction due to status mismatch");
    return { status: "skipped" };
  }

  if (!job.rawDescription || typeof job.rawDescription !== "string") {
    const reason = {
      code: "MISSING_JOB_DESCRIPTION",
      retryable: false,
      statusCode: null,
      message: "Job requirements extraction failed due to missing rawDescription",
    };
    await jobService.markRequirementsExtractionFailed({
      id: jobId,
      currentStatus: "EXTRACTING_REQUIREMENTS",
      failure: buildFailureRecord({ stage: "requirements_extraction", reason }),
    });
    scopedLogger.error("Job requirements extraction failed due to missing rawDescription");
    return { status: "failed", failureCode: reason.code, retryable: false };
  }

  for (let attempt = 0; attempt <= MAX_AI_RETRIES; attempt += 1) {
    const attemptNumber = attempt + 1;
    const isFinalAttempt = attempt === MAX_AI_RETRIES;

    try {
      const structuredRequirements = await requestStructuredRequirements({
        jobId,
        rawDescription: job.rawDescription,
      });

      const saved = await jobService.completeRequirementsExtraction({
        id: jobId,
        structuredRequirements,
        currentStatus: "EXTRACTING_REQUIREMENTS",
      });

      if (!saved) {
        scopedLogger.warn(
          "Skipped job requirements save due to concurrent status update",
          {
            attempt: attemptNumber,
            durationMs: Date.now() - startedAtMs,
          },
        );
        return { status: "skipped" };
      }

      scopedLogger.info("Job requirements extraction completed", {
        attempt: attemptNumber,
        durationMs: Date.now() - startedAtMs,
        requiredSkillsCount: structuredRequirements.required_skills.length,
        preferredSkillsCount: structuredRequirements.preferred_skills.length,
        mandatoryKeywordsCount: structuredRequirements.mandatory_keywords.length,
        minimumExperienceYears: structuredRequirements.minimum_experience_years,
      });

      return {
        status: "structured",
        structuredRequirements,
      };
    } catch (error) {
      const errorStatus = getErrorStatus(error);
      const retriable = isRetriableAiError(error);

      scopedLogger.warn("Job requirements extraction attempt failed", {
        attempt: attemptNumber,
        maxRetries: MAX_AI_RETRIES,
        retriable,
        errorStatus,
        errorCode: error?.code,
        error: error.message,
      });

      if (!retriable || isFinalAttempt) {
        const reason = error instanceof JobSchemaValidationError
          ? {
              code: "JOB_SCHEMA_VALIDATION_FAILED",
              retryable: false,
              statusCode: null,
              message: error.message,
            }
          : resolveFailureReason(error, "JOB_REQUIREMENTS_EXTRACTION_FAILED");
        await jobService.markRequirementsExtractionFailed({
          id: jobId,
          currentStatus: "EXTRACTING_REQUIREMENTS",
          failure: buildFailureRecord({ stage: "requirements_extraction", reason }),
        });

        scopedLogger.error("Job requirements extraction failed", {
          attempt: attemptNumber,
          maxRetries: MAX_AI_RETRIES,
          failureCode: reason.code,
          retryable: reason.retryable,
          errorStatus,
          errorCode: error?.code,
          isValidationError: error instanceof JobSchemaValidationError,
          isInvalidJsonError: error?.code === "INVALID_JSON_RESPONSE",
          durationMs: Date.now() - startedAtMs,
          error: error.message,
        });

        return { status: "failed", failureCode: reason.code, retryable: false };
      }

      const delayMs = resolveRetryDelayMs(error, attempt);
      await sleep(delayMs);
    }
  }

  const reason = {
    code: "JOB_REQUIREMENTS_EXTRACTION_FAILED",
    retryable: false,
    statusCode: null,
    message: "Job requirements extraction failed after retries",
  };
  await jobService.markRequirementsExtractionFailed({
    id: jobId,
    currentStatus: "EXTRACTING_REQUIREMENTS",
    failure: buildFailureRecord({ stage: "requirements_extraction", reason }),
  });
  return { status: "failed", failureCode: reason.code, retryable: false };
};

const jobExtractionService = {
  process,
};

export default jobExtractionService;
