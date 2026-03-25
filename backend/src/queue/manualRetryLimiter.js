import env from "../config/env.js";
import { connection } from "./resumeQueue.js";

const keyForResume = (resumeId) => `resume:manual-retry-count:${resumeId}`;

const getManualRetryCount = async (resumeId) => {
  const raw = await connection.get(keyForResume(resumeId));
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

const incrementManualRetryCount = async (resumeId) => {
  const key = keyForResume(resumeId);
  const next = await connection.incr(key);
  if (next === 1 && env.manualRetryCounterTtlSec > 0) {
    await connection.expire(key, env.manualRetryCounterTtlSec);
  }
  return next;
};

export { getManualRetryCount, incrementManualRetryCount };
