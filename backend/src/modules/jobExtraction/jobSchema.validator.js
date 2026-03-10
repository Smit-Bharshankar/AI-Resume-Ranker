const ALLOWED_KEYS = [
  "required_skills",
  "preferred_skills",
  "minimum_experience_years",
  "mandatory_keywords",
];

const JOB_REQUIREMENTS_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ALLOWED_KEYS,
  properties: {
    required_skills: { type: "array", items: { type: "string" } },
    preferred_skills: { type: "array", items: { type: "string" } },
    minimum_experience_years: { type: "number" },
    mandatory_keywords: { type: "array", items: { type: "string" } },
  },
};

class JobSchemaValidationError extends Error {
  constructor(message, metadata = {}) {
    super(message);
    this.name = "JobSchemaValidationError";
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

const normalizeStringArray = (value, key) => {
  if (!Array.isArray(value)) {
    throw new JobSchemaValidationError(`${key} must be an array`, { key });
  }

  if (!value.every((item) => typeof item === "string")) {
    throw new JobSchemaValidationError(`${key} must be an array of strings`, {
      key,
    });
  }

  const unique = new Set();
  for (const item of value) {
    const normalized = item.trim().toLowerCase();
    if (!normalized) {
      continue;
    }
    unique.add(normalized);
  }

  return [...unique].sort((a, b) => a.localeCompare(b));
};

const normalizeMinimumExperience = (value) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new JobSchemaValidationError(
      "minimum_experience_years must be a valid number",
      { key: "minimum_experience_years" },
    );
  }

  if (value < 0) {
    throw new JobSchemaValidationError(
      "minimum_experience_years must be greater than or equal to 0",
      { key: "minimum_experience_years" },
    );
  }

  return value;
};

const validateJobStructuredRequirements = (payload) => {
  if (!isPlainObject(payload)) {
    throw new JobSchemaValidationError(
      "Structured requirements payload must be a JSON object",
    );
  }

  const payloadKeys = Object.keys(payload);
  const extraKeys = payloadKeys.filter((key) => !ALLOWED_KEYS.includes(key));
  if (extraKeys.length > 0) {
    throw new JobSchemaValidationError(
      "Structured requirements contains unsupported keys",
      { extraKeys },
    );
  }

  const missingKeys = ALLOWED_KEYS.filter((key) => !(key in payload));
  if (missingKeys.length > 0) {
    throw new JobSchemaValidationError(
      "Structured requirements is missing required keys",
      { missingKeys },
    );
  }

  return {
    required_skills: normalizeStringArray(
      payload.required_skills,
      "required_skills",
    ),
    preferred_skills: normalizeStringArray(
      payload.preferred_skills,
      "preferred_skills",
    ),
    minimum_experience_years: normalizeMinimumExperience(
      payload.minimum_experience_years,
    ),
    mandatory_keywords: normalizeStringArray(
      payload.mandatory_keywords,
      "mandatory_keywords",
    ),
  };
};

export {
  JobSchemaValidationError,
  JOB_REQUIREMENTS_JSON_SCHEMA,
  validateJobStructuredRequirements,
};
