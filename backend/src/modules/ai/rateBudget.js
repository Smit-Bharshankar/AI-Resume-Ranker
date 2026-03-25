import IORedis from "ioredis";
import env from "../../config/env.js";

const WINDOW_MS = 60 * 1000;
const KEY_PREFIX = "ai:budget";
const GLOBAL_RATE_LIMIT_KEY = "ai:global:cooldown";
const redisConnectionOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

const isUsableRedisUrl = (value) => {
  if (!value) {
    return false;
  }

  try {
    const parsed = new URL(value);
    if (!parsed.hostname || parsed.hostname.toLowerCase() === "host") {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

const resolveLimit = (bucket) => {
  if (bucket === "structuring") {
    return env.aiStructuringRpm;
  }

  if (bucket === "insights") {
    return env.aiInsightsRpm;
  }

  if (bucket === "job_extraction") {
    return env.aiJobExtractionRpm;
  }

  return env.aiRpm;
};

const sleep = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const createRedisConnection = () => {
  if (isUsableRedisUrl(env.redisUrl)) {
    return new IORedis(env.redisUrl, redisConnectionOptions);
  }

  return new IORedis({
    host: env.redisHost,
    port: env.redisPort,
    username: env.redisUsername,
    password: env.redisPassword,
    ...(env.redisUseTls ? { tls: {} } : {}),
    ...redisConnectionOptions,
  });
};

const budgetConnection = createRedisConnection();

const waitForAiBudget = async (bucket) => {
  const ttlMs = await budgetConnection.pttl(GLOBAL_RATE_LIMIT_KEY);
  if (Number.isFinite(ttlMs) && ttlMs > 0) {
    const error = new Error("Global AI rate-limit cooldown is active");
    error.code = "AI_RATE_LIMIT_COOLDOWN";
    error.retryable = true;
    error.statusCode = 429;
    error.cooldownMs = ttlMs;
    throw error;
  }

  const limit = resolveLimit(bucket);
  if (!Number.isFinite(limit) || limit <= 0) {
    return;
  }

  while (true) {
    const now = Date.now();
    const windowStart = Math.floor(now / WINDOW_MS) * WINDOW_MS;
    const key = `${KEY_PREFIX}:${bucket}:${windowStart}`;
    const used = await budgetConnection.incr(key);

    if (used === 1) {
      await budgetConnection.pexpire(key, WINDOW_MS + 1000);
    }

    if (used <= limit) {
      return;
    }

    const waitMs = windowStart + WINDOW_MS - now + 25;
    await sleep(Math.max(waitMs, 50));
  }
};

const activateGlobalRateLimitCooldown = async (
  ttlSeconds = env.aiGlobalRateLimitCooldownSec,
) => {
  const ttl = Math.max(1, Number(ttlSeconds) || 1);
  await budgetConnection.set(GLOBAL_RATE_LIMIT_KEY, "1", "EX", ttl);
};

const getGlobalRateLimitCooldownMs = async () => {
  const ttlMs = await budgetConnection.pttl(GLOBAL_RATE_LIMIT_KEY);
  return Number.isFinite(ttlMs) && ttlMs > 0 ? ttlMs : 0;
};

const isGlobalRateLimitCooldownActive = async () => {
  return (await getGlobalRateLimitCooldownMs()) > 0;
};

export {
  waitForAiBudget,
  activateGlobalRateLimitCooldown,
  getGlobalRateLimitCooldownMs,
  isGlobalRateLimitCooldownActive,
};
