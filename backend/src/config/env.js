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
const defaultAiModel = aiProvider === "openai" ? "gpt-4o-mini" : "gemini-3.1-flash-lite-preview";

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
  resumeExtractionAttempts: toNumber(process.env.RESUME_EXTRACTION_ATTEMPTS, 3),
  resumeStructuringAttempts: toNumber(process.env.RESUME_STRUCTURING_ATTEMPTS, 2),
  resumeScoringAttempts: toNumber(process.env.RESUME_SCORING_ATTEMPTS, 1),
  resumeInsightsAttempts: toNumber(process.env.RESUME_INSIGHTS_ATTEMPTS, 2),
  stageBackoffMs: toNumber(process.env.STAGE_BACKOFF_MS, 5000),
  pdfParseTimeoutMs: toNumber(process.env.PDF_PARSE_TIMEOUT_MS, 30000),
  storageReadTimeoutMs: toNumber(process.env.STORAGE_READ_TIMEOUT_MS, 30000),
  aiCallTimeoutMs: toNumber(process.env.AI_CALL_TIMEOUT_MS, 30000),
  resumeQueueStaggerMs: toNumber(process.env.RESUME_QUEUE_STAGGER_MS, 500),
  resumeWorkerConcurrency: toNumber(process.env.RESUME_WORKER_CONCURRENCY, 3),
  resumeWorkerLimiterMax: toNumber(process.env.RESUME_WORKER_LIMITER_MAX, 1),
  resumeWorkerLimiterDurationMs: toNumber(
    process.env.RESUME_WORKER_LIMITER_DURATION_MS,
    7500,
  ),
  resumeProcessTimeoutMs: toNumber(
    process.env.RESUME_PROCESS_TIMEOUT_MS,
    10 * 60 * 1000,
  ),
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
  resumeInsightWorkerLimiterMax: toNumber(
    process.env.RESUME_INSIGHT_WORKER_LIMITER_MAX,
    1,
  ),
  resumeInsightWorkerLimiterDurationMs: toNumber(
    process.env.RESUME_INSIGHT_WORKER_LIMITER_DURATION_MS,
    10000,
  ),
  resumeInsightProcessTimeoutMs: toNumber(
    process.env.RESUME_INSIGHT_PROCESS_TIMEOUT_MS,
    5 * 60 * 1000,
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
    2,
  ),
  jobExtractionProcessTimeoutMs: toNumber(
    process.env.JOB_EXTRACTION_PROCESS_TIMEOUT_MS,
    5 * 60 * 1000,
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
  aiStructuringRpm: toNumber(process.env.AI_STRUCTURING_RPM, 10),
  aiInsightsRpm: toNumber(process.env.AI_INSIGHTS_RPM, 4),
  aiJobExtractionRpm: toNumber(process.env.AI_JOB_EXTRACTION_RPM, 1),
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
  aiGlobalRateLimitCooldownSec: toNumber(
    process.env.AI_GLOBAL_RATE_LIMIT_COOLDOWN_SEC,
    60,
  ),
  manualRetryMaxPerResume: toNumber(process.env.MANUAL_RETRY_MAX_PER_RESUME, 3),
  manualRetryCounterTtlSec: toNumber(
    process.env.MANUAL_RETRY_COUNTER_TTL_SEC,
    90 * 24 * 60 * 60,
  ),
  recoveryScanIntervalMs: toNumber(process.env.RECOVERY_SCAN_INTERVAL_MS, 3 * 60 * 1000),
  recoveryStaleAfterMs: toNumber(process.env.RECOVERY_STALE_AFTER_MS, 5 * 60 * 1000),
  recoveryBatchSize: toNumber(process.env.RECOVERY_BATCH_SIZE, 200),
  freeTierMaxJobsPerUser: toNumber(process.env.FREE_TIER_MAX_JOBS_PER_USER, 5),
  freeTierMaxResumesPerJob: toNumber(process.env.FREE_TIER_MAX_RESUMES_PER_JOB, 30),
  freeTierMaxResumesPerUser: toNumber(process.env.FREE_TIER_MAX_RESUMES_PER_USER, 100),
  recommendationStrongFitMin: toNumber(process.env.RECOMMENDATION_STRONG_FIT_MIN, 80),
  recommendationGoodFitMin: toNumber(process.env.RECOMMENDATION_GOOD_FIT_MIN, 60),
  recommendationModerateFitMin: toNumber(process.env.RECOMMENDATION_MODERATE_FIT_MIN, 40),
  uploadMaxFileSizeBytes: toNumber(process.env.UPLOAD_MAX_FILE_SIZE_BYTES, 5 * 1024 * 1024),
  uploadMaxPdfPages: toNumber(process.env.UPLOAD_MAX_PDF_PAGES, 5),
};

export default env;
