import prisma from "../config/prisma.js";
import env from "../config/env.js";
import logger from "../utils/logger.js";
import { buildExtractionPrompt } from "../modules/ai/prompt.builder.js";
import { parseJsonFromCompletion } from "../modules/ai/json.parser.js";
import { validateStructuredResume } from "../modules/ai/schema.validator.js";
import getAiProvider, {
  validateAiConfiguration,
} from "../modules/ai/providers/provider.factory.js";

const getResumeIdArg = () => {
  const arg = process.argv.find((value) => value.startsWith("--resume-id="));
  return arg ? arg.split("=")[1] : null;
};

const loadResume = async (resumeId) => {
  if (resumeId) {
    return prisma.resume.findUnique({
      where: { id: resumeId },
      select: { id: true, status: true, rawText: true },
    });
  }

  return prisma.resume.findFirst({
    where: { status: "TEXT_EXTRACTED" },
    orderBy: { createdAt: "asc" },
    select: { id: true, status: true, rawText: true },
  });
};

const loadFallbackResume = async () => {
  return prisma.resume.findFirst({
    where: {
      rawText: {
        not: null,
      },
    },
    orderBy: { createdAt: "asc" },
    select: { id: true, status: true, rawText: true },
  });
};

const run = async () => {
  const configHealth = validateAiConfiguration();
  for (const warning of configHealth.warnings) {
    logger.warn("AI config warning", { warning });
  }
  if (!configHealth.ok) {
    for (const error of configHealth.errors) {
      logger.error("AI config error", { error });
    }
    process.exitCode = 1;
    return;
  }

  const resumeId = getResumeIdArg();
  let resume = await loadResume(resumeId);
  if (!resume && !resumeId) {
    resume = await loadFallbackResume();
  }
  if (!resume) {
    logger.warn("AI smoke check skipped: resume not found", {
      requestedResumeId: resumeId,
    });
    return;
  }

  if (!resume.rawText || typeof resume.rawText !== "string") {
    logger.error("AI smoke check failed: resume has no raw text", {
      resumeId: resume.id,
      status: resume.status,
    });
    process.exitCode = 1;
    return;
  }

  const provider = getAiProvider();
  const { systemPrompt, userPrompt, wasTruncated, wasDeduped } =
    buildExtractionPrompt(resume.rawText);

  const response = await provider.generateJson({
    systemPrompt,
    userPrompt,
    temperature: 0.1,
  });

  const parsed = parseJsonFromCompletion(response.text);
  const validated = validateStructuredResume(parsed);

  logger.info("AI extraction smoke check passed", {
    provider: env.aiProvider,
    model: response.model,
    resumeId: resume.id,
    resumeStatus: resume.status,
    wasTruncated,
    wasDeduped,
    inputTokens: response.usage?.inputTokens,
    outputTokens: response.usage?.outputTokens,
    totalTokens: response.usage?.totalTokens,
    structuredKeys: Object.keys(validated),
  });
};

try {
  await run();
} catch (error) {
  logger.error("AI extraction smoke check failed", {
    error: error.message,
    code: error.code,
    status: error.status,
  });
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
