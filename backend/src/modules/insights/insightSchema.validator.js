const ALLOWED_RECOMMENDATIONS = new Set([
  "STRONG_FIT",
  "GOOD_FIT",
  "MODERATE_FIT",
  "WEAK_FIT",
]);

const ALLOWED_KEYS = [
  "summary",
  "strengths",
  "weaknesses",
  "interview_questions",
  "recommendation",
];

class InsightSchemaValidationError extends Error {
  constructor(message, metadata = {}) {
    super(message);
    this.name = "InsightSchemaValidationError";
    this.metadata = metadata;
  }
}

const isPlainObject = (value) => {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
};

const normalizeArrayOfStrings = (value, key) => {
  if (!Array.isArray(value)) {
    throw new InsightSchemaValidationError(`${key} must be an array`, { key });
  }

  if (!value.every((item) => typeof item === "string")) {
    throw new InsightSchemaValidationError(`${key} must be an array of strings`, {
      key,
    });
  }

  const normalized = [];
  for (const item of value) {
    const trimmed = item.trim();
    if (!trimmed) {
      continue;
    }
    normalized.push(trimmed);
  }

  return normalized;
};

const validateInsightRecommendation = (value) => {
  if (typeof value !== "string") {
    throw new InsightSchemaValidationError("recommendation must be a string", {
      key: "recommendation",
    });
  }

  const normalized = value.trim();
  if (!ALLOWED_RECOMMENDATIONS.has(normalized)) {
    throw new InsightSchemaValidationError("recommendation must be a valid enum value", {
      key: "recommendation",
      allowed: [...ALLOWED_RECOMMENDATIONS],
    });
  }

  return normalized;
};

const validateInsightPayload = (payload) => {
  if (!isPlainObject(payload)) {
    throw new InsightSchemaValidationError("Insights payload must be a JSON object");
  }

  const payloadKeys = Object.keys(payload);
  const extraKeys = payloadKeys.filter((key) => !ALLOWED_KEYS.includes(key));
  if (extraKeys.length > 0) {
    throw new InsightSchemaValidationError("Insights payload contains unsupported keys", {
      extraKeys,
    });
  }

  const missingKeys = ALLOWED_KEYS.filter((key) => !(key in payload));
  if (missingKeys.length > 0) {
    throw new InsightSchemaValidationError("Insights payload is missing required keys", {
      missingKeys,
    });
  }

  if (typeof payload.summary !== "string") {
    throw new InsightSchemaValidationError("summary must be a string", {
      key: "summary",
    });
  }

  return {
    summary: payload.summary.trim(),
    strengths: normalizeArrayOfStrings(payload.strengths, "strengths"),
    weaknesses: normalizeArrayOfStrings(payload.weaknesses, "weaknesses"),
    interview_questions: normalizeArrayOfStrings(
      payload.interview_questions,
      "interview_questions",
    ),
    recommendation: validateInsightRecommendation(payload.recommendation),
  };
};

export {
  InsightSchemaValidationError,
  ALLOWED_RECOMMENDATIONS,
  validateInsightPayload,
};
