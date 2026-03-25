const ALLOWED_KEYS = [
  "summary",
  "strengths",
  "weaknesses",
  "interview_questions",
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
  };
};

export {
  InsightSchemaValidationError,
  INSIGHT_JSON_SCHEMA,
  validateInsightPayload,
};
