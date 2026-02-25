import env from "../../../config/env.js";
import GeminiProvider from "./gemini.provider.js";
import OpenAIProvider from "./openai.provider.js";

let providerInstance = null;
const SUPPORTED_AI_PROVIDERS = new Set(["gemini", "openai"]);

const createProvider = () => {
  const baseOptions = {
    apiKey: env.aiApiKey,
    model: env.aiModel,
    timeoutMs: env.aiRequestTimeoutMs,
    maxOutputTokens: env.aiMaxOutputTokens,
  };

  if (env.aiProvider === "gemini") {
    return new GeminiProvider(baseOptions);
  }

  if (env.aiProvider === "openai") {
    return new OpenAIProvider(baseOptions);
  }

  const error = new Error(`Unsupported AI provider: ${env.aiProvider}`);
  error.code = "AI_PROVIDER_UNSUPPORTED";
  throw error;
};

const validateAiConfiguration = () => {
  const warnings = [];
  const errors = [];

  if (!SUPPORTED_AI_PROVIDERS.has(env.aiProvider)) {
    errors.push(
      `Unsupported AI provider "${env.aiProvider}". Supported providers: gemini, openai.`,
    );
  }

  if (!env.aiApiKey) {
    errors.push("Missing AI API key. Set AI_API_KEY (or provider-specific fallback key).");
  }

  if (!env.aiModel) {
    errors.push("Missing AI model. Set AI_MODEL (or provider-specific fallback model).");
  }

  if (env.aiProvider === "gemini" && env.aiModel && !env.aiModel.startsWith("gemini-")) {
    warnings.push(
      `Model "${env.aiModel}" does not look like a Gemini model. Check AI_PROVIDER and AI_MODEL.`,
    );
  }

  if (env.aiProvider === "openai" && env.aiModel) {
    const looksLikeOpenAiModel =
      env.aiModel.startsWith("gpt-") ||
      env.aiModel.startsWith("o1") ||
      env.aiModel.startsWith("o3") ||
      env.aiModel.startsWith("o4");

    if (!looksLikeOpenAiModel) {
      warnings.push(
        `Model "${env.aiModel}" does not look like an OpenAI model. Check AI_PROVIDER and AI_MODEL.`,
      );
    }
  }

  return {
    ok: errors.length === 0,
    warnings,
    errors,
  };
};

const getAiProvider = () => {
  if (providerInstance) {
    return providerInstance;
  }

  providerInstance = createProvider();
  return providerInstance;
};

export default getAiProvider;
export { validateAiConfiguration };
