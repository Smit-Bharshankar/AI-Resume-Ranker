import env from "../../config/env.js";
import resumeService from "../resume/resume.service.js";
import logger from "../../utils/logger.js";
import { buildExtractionPrompt } from "./prompt.builder.js";
import {
  ValidationError,
  STRUCTURED_RESUME_JSON_SCHEMA,
  validateStructuredResume,
} from "./schema.validator.js";
import getAiProvider from "./providers/provider.factory.js";
import { parseJsonFromCompletion } from "./json.parser.js";
import {
  buildFailureRecord,
  getErrorStatus,
  resolveFailureReason,
} from "./failureReason.js";
import { classifyRetry } from "../../queue/retryPolicy.js";
import { withOperationTimeout } from "../../utils/operationTimeout.js";
import { activateGlobalRateLimitCooldown } from "./rateBudget.js";

const truncateErrorText = (value, maxLength = 600) => {
  if (typeof value !== "string") {
    return null;
  }

  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
};

const sleep = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getTopLevelKeys = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [];
  }

  return Object.keys(value);
};

const resolveRateLimitDelayMs = (error) => {
  const retryAfterHeader =
    error?.headers?.["retry-after"] ??
    error?.response?.headers?.["retry-after"] ??
    error?.response?.headers?.get?.("retry-after");

  const seconds = Number(retryAfterHeader);
  if (Number.isFinite(seconds) && seconds > 0) {
    return Math.floor(seconds * 1000);
  }

  return null;
};

const requestStructuredResume = async ({ resumeId, jobId, rawText }) => {
  const provider = getAiProvider();
  const { systemPrompt, userPrompt, wasTruncated, wasDeduped } =
    buildExtractionPrompt(rawText);

  logger.info("Worker AI call started", {
    stage: "resume_structuring",
    resumeId,
    jobId: jobId ?? null,
    provider: env.aiProvider,
    model: provider.model,
  });

  const result = await withOperationTimeout({
    timeoutMs: env.aiCallTimeoutMs,
    operationName: "Resume structuring AI call",
    operation: () =>
      provider.generateJson({
        systemPrompt,
        userPrompt,
        temperature: 0.1,
        responseSchema: STRUCTURED_RESUME_JSON_SCHEMA,
        schemaName: "structured_resume",
        rateLimitBucket: "structuring",
      }),
  });

  logger.info("AI extraction response received", {
    resumeId,
    provider: env.aiProvider,
    model: result.model,
    wasTruncated,
    wasDeduped,
    inputTokens: result.usage?.inputTokens,
    outputTokens: result.usage?.outputTokens,
    totalTokens: result.usage?.totalTokens,
    configuredRpm: env.aiRpm,
    configuredRpd: env.aiRpd,
    configuredTpm: env.aiTpm,
  });

  const parsed = parseJsonFromCompletion(result.text);
  logger.info("Worker AI call response keys", {
    stage: "resume_structuring",
    resumeId,
    jobId: jobId ?? null,
    keys: getTopLevelKeys(parsed),
  });

  return parsed;
};

const process = async (resumeId) => {
  const startedAtMs = Date.now();
  const serviceLogger = logger.child({
    service: "resume-structuring",
    resumeId,
  });

  if (!resumeId || typeof resumeId !== "string") {
    serviceLogger.warn("Skipping structured extraction due to invalid resumeId");
    return { status: "skipped" };
  }

  const resume = await resumeService.getResumeById(resumeId);
  if (!resume) {
    serviceLogger.warn("Skipping structured extraction for missing resume");
    return { status: "skipped" };
  }

  const scopedLogger = serviceLogger.child({
    currentStatus: resume.status,
  });

  scopedLogger.info("Structured extraction evaluation started");

  if (resume.status !== "TEXT_EXTRACTED") {
    scopedLogger.info("Skipping structured extraction due to status mismatch");
    return { status: "skipped" };
  }

  if (!resume.rawText || typeof resume.rawText !== "string") {
    const reason = {
      code: "MISSING_RESUME_TEXT",
      retryable: false,
      statusCode: null,
      message: "Cannot structure resume without extracted text",
    };
    scopedLogger.error("Cannot structure resume without extracted text");
    await resumeService.markStructureFailed(
      resumeId,
      buildFailureRecord({ stage: "structuring", reason }),
    );
    return { status: "failed", failureCode: reason.code, retryable: false };
  }

  const maxRetries = Math.max(0, env.aiExtractionMaxRetries);

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const attemptNumber = attempt + 1;
    const isFinalAttempt = attempt === maxRetries;

    try {
      const llmPayload = await requestStructuredResume({
        resumeId,
        jobId: resume.jobId,
        rawText: resume.rawText,
      });
      const structuredData = validateStructuredResume(llmPayload);

      const updated = await resumeService.completeStructureExtraction({
        id: resumeId,
        structuredData,
      });

      if (!updated) {
        scopedLogger.warn("Skipped structured save due to concurrent status update", {
          attempt: attemptNumber,
          durationMs: Date.now() - startedAtMs,
        });
        return { status: "skipped" };
      }

      scopedLogger.info("Resume structured extraction completed", {
        attempt: attemptNumber,
        durationMs: Date.now() - startedAtMs,
      });
      return { status: "structured", structuredData };
    } catch (error) {
      const isValidationError = error instanceof ValidationError;
      const isInvalidJsonError = error?.code === "INVALID_JSON_RESPONSE";
      const isConfigError = error?.code === "AI_CONFIG_MISSING";
      const retryClassification = classifyRetry(error);
      const retriable = !isValidationError && (isInvalidJsonError || retryClassification.retryable);
      const errorStatus = getErrorStatus(error);
      if (errorStatus === 429) {
        await activateGlobalRateLimitCooldown();
      }
      const providerResponseBody = truncateErrorText(error?.responseBody);
      const providerRequestVariant = error?.requestVariant ?? null;
      const providerPreviousFailures = Array.isArray(error?.previousFailures)
        ? error.previousFailures.map((item) => ({
            variant: item?.variant ?? null,
            status: item?.status ?? null,
            body: truncateErrorText(item?.body ?? "", 300),
          }))
        : null;

      scopedLogger.warn("Resume structured extraction attempt failed", {
        attempt: attemptNumber,
        maxRetries,
        retriable,
        errorStatus,
        errorCode: error?.code,
        providerRequestVariant,
        providerPreviousFailures,
        providerResponseBody,
        error: error.message,
      });

      if (isConfigError || isFinalAttempt || !retriable) {
        const reason = isValidationError
          ? {
              code: "RESUME_SCHEMA_VALIDATION_FAILED",
              retryable: false,
              statusCode: null,
              message: error.message,
            }
          : isInvalidJsonError && isFinalAttempt
            ? {
                code: "AI_INVALID_JSON_RESPONSE",
                retryable: false,
                statusCode: null,
                message: "Invalid JSON returned by AI after retries",
              }
            : resolveFailureReason(error, "RESUME_STRUCTURING_FAILED");
        await resumeService.markStructureFailed(
          resumeId,
          buildFailureRecord({ stage: "structuring", reason }),
        );
        scopedLogger.error("Resume structured extraction failed", {
          attempt: attemptNumber,
          maxRetries,
          isFinalAttempt: true,
          failureCode: reason.code,
          retryable: reason.retryable,
          errorStatus,
          errorCode: error?.code,
          providerRequestVariant,
          providerPreviousFailures,
          providerResponseBody,
          error: error.message,
          durationMs: Date.now() - startedAtMs,
        });
        return { status: "failed", failureCode: reason.code, retryable: false };
      }

      const rateLimitDelayMs = resolveRateLimitDelayMs(error);
      const delayMs =
        rateLimitDelayMs ?? env.aiExtractionRetryBaseDelayMs * 2 ** attempt;
      await sleep(delayMs);
    }
  }

  const reason = {
    code: "RESUME_STRUCTURING_FAILED",
    retryable: false,
    statusCode: null,
    message: "Resume structuring failed after retries",
  };
  await resumeService.markStructureFailed(
    resumeId,
    buildFailureRecord({ stage: "structuring", reason }),
  );
  return { status: "failed", failureCode: reason.code, retryable: false };
};

const resumeExtractionService = {
  process,
};

export default resumeExtractionService;
