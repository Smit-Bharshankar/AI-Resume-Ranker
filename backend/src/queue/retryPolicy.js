const RETRYABLE_NETWORK_CODES = new Set([
  "ECONNRESET",
  "ENOTFOUND",
  "EAI_AGAIN",
  "ECONNREFUSED",
  "ETIMEDOUT",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_SOCKET",
]);

const NON_RETRYABLE_ERROR_CODES = new Set([
  "INVALID_PDF",
  "INVALID_PDF_FILE",
  "EMPTY_EXTRACTION_RESULT",
  "MISSING_RESUME_TEXT",
  "MISSING_JOB_DESCRIPTION",
  "RESUME_SCHEMA_VALIDATION_FAILED",
  "JOB_SCHEMA_VALIDATION_FAILED",
  "INSIGHT_SCHEMA_VALIDATION_FAILED",
  "AI_INVALID_JSON_RESPONSE",
  "INVALID_JSON_RESPONSE",
]);

const normalizeCode = (value) => String(value ?? "").trim().toUpperCase();

const getStatusCode = (error) => {
  const status = error?.status ?? error?.response?.status ?? error?.statusCode;
  return Number.isFinite(status) ? status : null;
};

const classifyRetry = (error) => {
  const code = normalizeCode(error?.code);
  const statusCode = getStatusCode(error);
  const message = String(error?.message ?? "").toLowerCase();

  if (typeof error?.retryable === "boolean") {
    return {
      retryable: error.retryable,
      code,
      statusCode,
    };
  }

  if (NON_RETRYABLE_ERROR_CODES.has(code)) {
    return { retryable: false, code, statusCode };
  }

  if (statusCode === 429) {
    return { retryable: true, code: code || "RATE_LIMITED", statusCode };
  }

  if (statusCode !== null && statusCode >= 500) {
    return { retryable: true, code: code || "UPSTREAM_5XX", statusCode };
  }

  if (statusCode !== null && statusCode >= 400) {
    return { retryable: false, code: code || "UPSTREAM_4XX", statusCode };
  }

  if (RETRYABLE_NETWORK_CODES.has(code)) {
    return { retryable: true, code, statusCode };
  }

  if (
    code.includes("TIMEOUT") ||
    message.includes("timeout") ||
    message.includes("timed out")
  ) {
    return { retryable: true, code: code || "TIMEOUT", statusCode };
  }

  if (
    message.includes("network") ||
    message.includes("socket hang up") ||
    message.includes("temporary")
  ) {
    return { retryable: true, code: code || "NETWORK_ERROR", statusCode };
  }

  return {
    retryable: false,
    code: code || "UNKNOWN_ERROR",
    statusCode,
  };
};

const isRetryableError = (error) => classifyRetry(error).retryable;

export { classifyRetry, isRetryableError, getStatusCode };
