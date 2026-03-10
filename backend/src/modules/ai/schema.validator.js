const ALLOWED_KEYS = [
  "name",
  "email",
  "phone",
  "location",
  "total_years_experience",
  "skills",
  "primary_roles",
  "education",
  "certifications",
];

const STRUCTURED_RESUME_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ALLOWED_KEYS,
  properties: {
    name: { type: "string" },
    email: { type: "string" },
    phone: { type: "string" },
    location: { type: "string" },
    total_years_experience: { type: "number" },
    skills: { type: "array", items: { type: "string" } },
    primary_roles: { type: "array", items: { type: "string" } },
    education: { type: "array", items: { type: "string" } },
    certifications: { type: "array", items: { type: "string" } },
  },
};

class ValidationError extends Error {
  constructor(message, metadata = {}) {
    super(message);
    this.name = "ValidationError";
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

const ensureString = (value) => {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }

  return "";
};

const ensureStringArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
};

const normalizeItemToString = (item) => {
  if (typeof item === "string") {
    return item.trim();
  }

  if (typeof item === "number" || typeof item === "boolean") {
    return String(item).trim();
  }

  if (item && typeof item === "object") {
    const preferredKeys = [
      "name",
      "title",
      "degree",
      "institution",
      "issuer",
      "certification",
      "role",
    ];

    for (const key of preferredKeys) {
      if (typeof item[key] === "string" && item[key].trim()) {
        return item[key].trim();
      }
    }

    const compact = JSON.stringify(item);
    return compact === "{}" ? "" : compact;
  }

  return "";
};

const ensureTextArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map(normalizeItemToString).filter(Boolean);
};

const normalizeSkills = (skills) => {
  const unique = new Set();
  for (const skill of skills) {
    unique.add(skill.toLowerCase());
  }
  return [...unique].sort((a, b) => a.localeCompare(b));
};

const validateStructuredResume = (payload) => {
  if (!isPlainObject(payload)) {
    throw new ValidationError("Structured payload must be a JSON object");
  }

  const totalYearsCandidate = payload.total_years_experience;
  const parsedTotalYears = Number(totalYearsCandidate);
  const totalYears = Number.isFinite(parsedTotalYears) && parsedTotalYears >= 0
    ? parsedTotalYears
    : 0;

  return {
    name: ensureString(payload.name),
    email: ensureString(payload.email),
    phone: ensureString(payload.phone),
    location: ensureString(payload.location),
    total_years_experience: totalYears,
    skills: normalizeSkills(ensureStringArray(payload.skills)),
    primary_roles: ensureTextArray(payload.primary_roles),
    education: ensureTextArray(payload.education),
    certifications: ensureTextArray(payload.certifications),
  };
};

export { ValidationError, STRUCTURED_RESUME_JSON_SCHEMA, validateStructuredResume };
