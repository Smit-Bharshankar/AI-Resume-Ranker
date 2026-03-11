const NETWORK_ERROR_CODES = new Set([
  "econnreset",
  "enotfound",
  "eai_again",
  "econnrefused",
  "etimedout",
]);
const KNOWN_FAILURE_CODES = new Set([
  "AI_INVALID_JSON_RESPONSE",
  "AI_PROVIDER_TIMEOUT",
  "PROCESS_TIMEOUT",
  "AI_CONFIG_MISSING",
  "AI_RATE_LIMITED",
  "AI_PROVIDER_5XX",
  "AI_PROVIDER_4XX",
  "AI_NETWORK_ERROR",
  "AI_TRANSIENT_ERROR",
]);

const getErrorStatus = (error) => {
  const status = error?.status ?? error?.response?.status;
  return Number.isFinite(status) ? status : null;
};

const resolveFailureReason = (error, fallbackCode = "PROCESSING_FAILED") => {
  if (!error) {
    return {
      code: fallbackCode,
      retryable: false,
      statusCode: null,
      message: "Unknown processing failure",
    };
  }

  const statusCode = getErrorStatus(error);
  const normalizedCode = String(error.code ?? "").trim();
  const loweredCode = normalizedCode.toLowerCase();
  const message = error.message ?? "Processing failed";
  const messageCodeMatch =
    typeof message === "string" ? message.match(/^([A-Z0-9_]+):/) : null;
  const prefixedMessageCode = messageCodeMatch?.[1] ?? null;

  if (KNOWN_FAILURE_CODES.has(normalizedCode)) {
    return {
      code: normalizedCode,
      retryable:
        typeof error.retryable === "boolean"
          ? error.retryable
          : normalizedCode !== "AI_CONFIG_MISSING" &&
            normalizedCode !== "AI_PROVIDER_4XX",
      statusCode,
      message,
    };
  }

  if (prefixedMessageCode && KNOWN_FAILURE_CODES.has(prefixedMessageCode)) {
    return {
      code: prefixedMessageCode,
      retryable:
        typeof error.retryable === "boolean"
          ? error.retryable
          : prefixedMessageCode !== "AI_CONFIG_MISSING" &&
            prefixedMessageCode !== "AI_PROVIDER_4XX",
      statusCode,
      message,
    };
  }

  if (normalizedCode === "INVALID_JSON_RESPONSE") {
    return { code: "AI_INVALID_JSON_RESPONSE", retryable: true, statusCode, message };
  }

  if (normalizedCode === "AI_PROVIDER_TIMEOUT" || normalizedCode === "PROCESS_TIMEOUT") {
    return { code: normalizedCode, retryable: true, statusCode, message };
  }

  if (normalizedCode === "AI_CONFIG_MISSING") {
    return { code: normalizedCode, retryable: false, statusCode, message };
  }

  if (statusCode === 429) {
    return { code: "AI_RATE_LIMITED", retryable: true, statusCode, message };
  }

  if (statusCode !== null && statusCode >= 500) {
    return { code: "AI_PROVIDER_5XX", retryable: true, statusCode, message };
  }

  if (statusCode !== null && statusCode >= 400) {
    return { code: "AI_PROVIDER_4XX", retryable: false, statusCode, message };
  }

  if (NETWORK_ERROR_CODES.has(loweredCode)) {
    return { code: "AI_NETWORK_ERROR", retryable: true, statusCode, message };
  }

  if (loweredCode.includes("timeout") || loweredCode.includes("rate")) {
    return { code: "AI_TRANSIENT_ERROR", retryable: true, statusCode, message };
  }

  return {
    code: fallbackCode,
    retryable: Boolean(error.retryable),
    statusCode,
    message,
  };
};

const buildFailureRecord = ({ stage, reason }) => {
  return {
    code: reason.code,
    retryable: reason.retryable,
    statusCode: reason.statusCode,
    stage,
    message: reason.message,
    at: new Date().toISOString(),
  };
};

export { resolveFailureReason, buildFailureRecord, getErrorStatus };
