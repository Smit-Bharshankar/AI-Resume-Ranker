import env from "../config/env.js";
import logger from "../utils/logger.js";
import { parseJsonFromCompletion } from "../modules/ai/json.parser.js";
import getAiProvider, {
  validateAiConfiguration,
} from "../modules/ai/providers/provider.factory.js";

const buildSmokePrompt = () => {
  const systemPrompt =
    "You are a health-check assistant. Return only strict JSON. No markdown.";
  const userPrompt = [
    "Respond with this exact shape and nothing else:",
    '{ "ok": true, "service": "ai-smoke", "timestamp_utc": "<ISO8601>" }',
    "Set timestamp_utc to the current UTC timestamp.",
  ].join("\n");

  return { systemPrompt, userPrompt };
};

const validateSmokePayload = (payload) => {
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    throw new Error("Smoke response is not a JSON object");
  }

  if (payload.ok !== true) {
    throw new Error("Smoke response missing ok=true");
  }

  if (payload.service !== "ai-smoke") {
    throw new Error("Smoke response has unexpected service value");
  }

  if (
    typeof payload.timestamp_utc !== "string" ||
    Number.isNaN(Date.parse(payload.timestamp_utc))
  ) {
    throw new Error("Smoke response has invalid timestamp_utc");
  }
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

  const provider = getAiProvider();
  const { systemPrompt, userPrompt } = buildSmokePrompt();

  const response = await provider.generateJson({
    systemPrompt,
    userPrompt,
    temperature: 0,
  });

  const parsed = parseJsonFromCompletion(response.text);
  validateSmokePayload(parsed);

  logger.info("AI provider smoke check passed", {
    provider: env.aiProvider,
    model: response.model,
    responseOk: parsed.ok,
    service: parsed.service,
    timestampUtc: parsed.timestamp_utc,
    inputTokens: response.usage?.inputTokens,
    outputTokens: response.usage?.outputTokens,
    totalTokens: response.usage?.totalTokens,
  });
};

try {
  await run();
} catch (error) {
  logger.error("AI provider smoke check failed", {
    error: error.message,
    code: error.code,
    status: error.status,
  });
  process.exitCode = 1;
}
