import env from "../config/env.js";
import { errorResponse } from "../utils/api-response.js";

const userWindows = new Map();

const resolveNowMs = () => Date.now();

const getRateLimitKey = (req) => {
  if (req.user?.id) {
    return `user:${req.user.id}`;
  }
  return `ip:${req.ip}`;
};

const rateLimitMiddleware = (req, res, next) => {
  const windowMs = env.apiRateLimitWindowMs;
  const maxRequests = env.apiRateLimitMaxRequests;

  if (windowMs <= 0 || maxRequests <= 0) {
    return next();
  }

  const key = getRateLimitKey(req);
  const now = resolveNowMs();
  const current = userWindows.get(key);

  if (!current || now >= current.resetAtMs) {
    const nextState = {
      count: 1,
      resetAtMs: now + windowMs,
    };
    userWindows.set(key, nextState);
    res.setHeader("X-RateLimit-Limit", String(maxRequests));
    res.setHeader("X-RateLimit-Remaining", String(maxRequests - nextState.count));
    res.setHeader("X-RateLimit-Reset", String(Math.ceil(nextState.resetAtMs / 1000)));
    return next();
  }

  if (current.count >= maxRequests) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((current.resetAtMs - now) / 1000),
    );
    res.setHeader("Retry-After", String(retryAfterSeconds));
    res.setHeader("X-RateLimit-Limit", String(maxRequests));
    res.setHeader("X-RateLimit-Remaining", "0");
    res.setHeader("X-RateLimit-Reset", String(Math.ceil(current.resetAtMs / 1000)));
    return res
      .status(429)
      .json(errorResponse("Too many requests. Please try again in a minute."));
  }

  current.count += 1;
  userWindows.set(key, current);
  res.setHeader("X-RateLimit-Limit", String(maxRequests));
  res.setHeader("X-RateLimit-Remaining", String(maxRequests - current.count));
  res.setHeader("X-RateLimit-Reset", String(Math.ceil(current.resetAtMs / 1000)));
  return next();
};

export default rateLimitMiddleware;
