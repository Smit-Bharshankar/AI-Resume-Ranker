import env from "../../config/env.js";
import resumeService from "../resume/resume.service.js";
import logger from "../../utils/logger.js";
import { buildExtractionPrompt } from "./prompt.builder.js";
import { ValidationError, validateStructuredResume } from "./schema.validator.js";
import getAiProvider from "./providers/provider.factory.js";
import { parseJsonFromCompletion } from "./json.parser.js";

const sleep = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetriableProviderError = (error) => {
  const status = error?.status ?? error?.response?.status;
  const code = String(error?.code ?? "").toLowerCase();
  const type = String(error?.type ?? "").toLowerCase();

  if (Number.isFinite(status)) {
    if (status === 429) {
      return true;
    }

    if (status >= 500) {
      return true;
    }

    return false;
  }

  if (code === "ai_provider_request_failed") {
    return false;
  }

  return (
    type.includes("rate_limit") ||
    code.includes("429") ||
    code.includes("rate") ||
    code.includes("timeout") ||
    code.includes("econnreset") ||
    code.includes("ai_provider_timeout")
  );
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

const requestStructuredResume = async ({ resumeId, rawText }) => {
  const provider = getAiProvider();
  const { systemPrompt, userPrompt, wasTruncated, wasDeduped } =
    buildExtractionPrompt(rawText);

  const result = await provider.generateJson({
    systemPrompt,
    userPrompt,
    temperature: 0.1,
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

  return parseJsonFromCompletion(result.text);
};

const process = async (resumeId) => {
  if (!resumeId || typeof resumeId !== "string") {
    logger.warn("Skipping structured extraction due to invalid resumeId", {
      resumeId,
    });
    return { status: "skipped" };
  }

  const resume = await resumeService.getResumeById(resumeId);
  if (!resume) {
    logger.warn("Skipping structured extraction for missing resume", { resumeId });
    return { status: "skipped" };
  }

  if (resume.status !== "TEXT_EXTRACTED") {
    logger.info("Skipping structured extraction due to status mismatch", {
      resumeId,
      status: resume.status,
    });
    return { status: "skipped" };
  }

  if (!resume.rawText || typeof resume.rawText !== "string") {
    logger.error("Cannot structure resume without extracted text", { resumeId });
    await resumeService.markStructureFailed(resumeId);
    return { status: "failed" };
  }

  const maxRetries = Math.max(0, env.aiExtractionMaxRetries);

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const attemptNumber = attempt + 1;
    const isFinalAttempt = attempt === maxRetries;

    try {
      const llmPayload = await requestStructuredResume({
        resumeId,
        rawText: resume.rawText,
      });
      const structuredData = validateStructuredResume(llmPayload);

      const updated = await resumeService.completeStructureExtraction({
        id: resumeId,
        structuredData,
      });

      if (!updated) {
        logger.warn("Skipped structured save due to concurrent status update", {
          resumeId,
          attempt: attemptNumber,
        });
        return { status: "skipped" };
      }

      logger.info("Resume structured extraction completed", {
        resumeId,
        attempt: attemptNumber,
      });
      return { status: "structured" };
    } catch (error) {
      const isValidationError = error instanceof ValidationError;
      const isInvalidJsonError = error?.code === "INVALID_JSON_RESPONSE";
      const isConfigError = error?.code === "AI_CONFIG_MISSING";
      const retriable =
        isValidationError ||
        isInvalidJsonError ||
        isRetriableProviderError(error);

      logger.warn("Resume structured extraction attempt failed", {
        resumeId,
        attempt: attemptNumber,
        maxRetries,
        retriable,
        error: error.message,
      });

      if (isConfigError || isFinalAttempt || !retriable) {
        await resumeService.markStructureFailed(resumeId);
        logger.error("Resume structured extraction failed", {
          resumeId,
          attempt: attemptNumber,
          maxRetries,
          isFinalAttempt: true,
          error: error.message,
        });
        return { status: "failed" };
      }

      const rateLimitDelayMs = resolveRateLimitDelayMs(error);
      const delayMs =
        rateLimitDelayMs ?? env.aiExtractionRetryBaseDelayMs * 2 ** attempt;
      await sleep(delayMs);
    }
  }

  await resumeService.markStructureFailed(resumeId);
  return { status: "failed" };
};

const resumeExtractionService = {
  process,
};

export default resumeExtractionService;
