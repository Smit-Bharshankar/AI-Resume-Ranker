import dotenv from "dotenv";

dotenv.config();

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value, fallback = false) => {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }
  return fallback;
};

const resolveAiProvider = () => {
  const provider = (process.env.AI_PROVIDER ?? "gemini").trim().toLowerCase();
  return provider || "gemini";
};

const aiProvider = resolveAiProvider();
const defaultAiModel = aiProvider === "openai" ? "gpt-4o-mini" : "gemini-2.5-flash-lite";

const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: toNumber(process.env.PORT, 5000),
  apiRateLimitWindowMs: toNumber(process.env.API_RATE_LIMIT_WINDOW_MS, 60000),
  apiRateLimitMaxRequests: toNumber(process.env.API_RATE_LIMIT_MAX_REQUESTS, 100),
  sentryDsnBackend: process.env.SENTRY_DSN_BACKEND ?? "",
  posthogKey: process.env.POSTHOG_KEY ?? "",
  posthogHost: process.env.POSTHOG_HOST ?? "https://app.posthog.com",
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseAnonKey:
    process.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY ?? "",
  authRequireEmailConfirmation: toBoolean(
    process.env.AUTH_REQUIRE_EMAIL_CONFIRMATION,
    true,
  ),
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  supabaseStorageBucket: process.env.SUPABASE_STORAGE_BUCKET ?? "resumes",
  redisUrl: process.env.REDIS_URL ?? "",
  redisHost: process.env.REDIS_HOST ?? "",
  redisPort: toNumber(process.env.REDIS_PORT, 6379),
  redisUsername: process.env.REDIS_USERNAME ?? "",
  redisPassword: process.env.REDIS_PASSWORD ?? "",
  redisUseTls: toBoolean(process.env.REDIS_USE_TLS, false),
  resumeQueueName: process.env.RESUME_QUEUE_NAME ?? "resume-processing",
  resumeQueueAttempts: toNumber(process.env.RESUME_QUEUE_ATTEMPTS, 3),
  resumeQueueBackoffMs: toNumber(process.env.RESUME_QUEUE_BACKOFF_MS, 2000),
  resumeWorkerConcurrency: toNumber(process.env.RESUME_WORKER_CONCURRENCY, 3),
  resumeInsightQueueName:
    process.env.RESUME_INSIGHT_QUEUE_NAME ?? "resume-insight-generation",
  resumeInsightQueueAttempts: toNumber(
    process.env.RESUME_INSIGHT_QUEUE_ATTEMPTS,
    2,
  ),
  resumeInsightQueueBackoffMs: toNumber(
    process.env.RESUME_INSIGHT_QUEUE_BACKOFF_MS,
    2000,
  ),
  resumeInsightWorkerConcurrency: toNumber(
    process.env.RESUME_INSIGHT_WORKER_CONCURRENCY,
    4,
  ),
  jobExtractionQueueName:
    process.env.JOB_EXTRACTION_QUEUE_NAME ?? "job-requirements-extraction",
  jobExtractionQueueAttempts: toNumber(
    process.env.JOB_EXTRACTION_QUEUE_ATTEMPTS,
    3,
  ),
  jobExtractionQueueBackoffMs: toNumber(
    process.env.JOB_EXTRACTION_QUEUE_BACKOFF_MS,
    2000,
  ),
  jobExtractionWorkerConcurrency: toNumber(
    process.env.JOB_EXTRACTION_WORKER_CONCURRENCY,
    4,
  ),
  aiProvider,
  aiApiKey:
    process.env.AI_API_KEY ??
    (aiProvider === "openai"
      ? process.env.OPENAI_API_KEY
      : process.env.GEMINI_API_KEY) ??
    "",
  aiModel:
    process.env.AI_MODEL ??
    (aiProvider === "openai"
      ? process.env.OPENAI_MODEL
      : process.env.GEMINI_MODEL) ??
    defaultAiModel,
  aiMaxOutputTokens: toNumber(
    process.env.AI_MAX_OUTPUT_TOKENS ??
      (aiProvider === "openai"
        ? process.env.OPENAI_MAX_OUTPUT_TOKENS
        : process.env.GEMINI_MAX_OUTPUT_TOKENS),
    600,
  ),
  aiRequestTimeoutMs: toNumber(
    process.env.AI_REQUEST_TIMEOUT_MS ??
      (aiProvider === "openai"
        ? process.env.OPENAI_REQUEST_TIMEOUT_MS
        : process.env.GEMINI_REQUEST_TIMEOUT_MS),
    20000,
  ),
  aiRpm: toNumber(
    process.env.AI_RPM ??
      (aiProvider === "openai" ? process.env.OPENAI_RPM : process.env.GEMINI_RPM),
    0,
  ),
  aiRpd: toNumber(
    process.env.AI_RPD ??
      (aiProvider === "openai" ? process.env.OPENAI_RPD : process.env.GEMINI_RPD),
    0,
  ),
  aiTpm: toNumber(
    process.env.AI_TPM ??
      (aiProvider === "openai" ? process.env.OPENAI_TPM : process.env.GEMINI_TPM),
    0,
  ),
  aiExtractionMaxRetries: toNumber(process.env.AI_EXTRACTION_MAX_RETRIES, 2),
  aiExtractionRetryBaseDelayMs: toNumber(
    process.env.AI_EXTRACTION_RETRY_BASE_DELAY_MS,
    500,
  ),
};

export default env;
