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

const INSIGHT_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ALLOWED_KEYS,
  properties: {
    summary: { type: "string" },
    strengths: { type: "array", items: { type: "string" } },
    weaknesses: { type: "array", items: { type: "string" } },
    interview_questions: { type: "array", items: { type: "string" } },
    recommendation: {
      type: "string",
      enum: ["STRONG_FIT", "GOOD_FIT", "MODERATE_FIT", "WEAK_FIT"],
    },
  },
};

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
    return [];
  }

  const normalized = [];
  for (const item of value) {
    const trimmed =
      typeof item === "string"
        ? item.trim()
        : typeof item === "number" || typeof item === "boolean"
          ? String(item).trim()
          : "";
    if (!trimmed) {
      continue;
    }
    normalized.push(trimmed);
  }

  return normalized;
};

const validateInsightRecommendation = (value) => {
  if (typeof value !== "string") {
    return "MODERATE_FIT";
  }

  const normalized = value.trim().toUpperCase();
  if (!ALLOWED_RECOMMENDATIONS.has(normalized)) {
    return "MODERATE_FIT";
  }

  return normalized;
};

const validateInsightPayload = (payload) => {
  if (!isPlainObject(payload)) {
    throw new InsightSchemaValidationError("Insights payload must be a JSON object");
  }

  const summary =
    typeof payload.summary === "string"
      ? payload.summary.trim()
      : typeof payload.summary === "number" || typeof payload.summary === "boolean"
        ? String(payload.summary).trim()
        : "";

  return {
    summary,
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
  INSIGHT_JSON_SCHEMA,
  validateInsightPayload,
};
