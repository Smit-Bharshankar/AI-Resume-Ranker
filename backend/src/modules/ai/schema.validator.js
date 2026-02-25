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

const ensureString = (value, key) => {
  if (typeof value !== "string") {
    throw new ValidationError(`${key} must be a string`, { key });
  }

  return value.trim();
};

const ensureStringArray = (value, key) => {
  if (!Array.isArray(value)) {
    throw new ValidationError(`${key} must be an array`, { key });
  }

  if (!value.every((item) => typeof item === "string")) {
    throw new ValidationError(`${key} must be an array of strings`, { key });
  }

  return value.map((item) => item.trim()).filter(Boolean);
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

const ensureTextArray = (value, key) => {
  if (!Array.isArray(value)) {
    throw new ValidationError(`${key} must be an array`, { key });
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

  const keys = Object.keys(payload);
  const extraKeys = keys.filter((key) => !ALLOWED_KEYS.includes(key));
  if (extraKeys.length > 0) {
    throw new ValidationError("Structured payload contains unsupported keys", {
      extraKeys,
    });
  }

  const missingKeys = ALLOWED_KEYS.filter((key) => !(key in payload));
  if (missingKeys.length > 0) {
    throw new ValidationError("Structured payload is missing required keys", {
      missingKeys,
    });
  }

  const totalYears = payload.total_years_experience;
  if (typeof totalYears !== "number" || !Number.isFinite(totalYears)) {
    throw new ValidationError("total_years_experience must be a valid number", {
      key: "total_years_experience",
    });
  }

  return {
    name: ensureString(payload.name, "name"),
    email: ensureString(payload.email, "email"),
    phone: ensureString(payload.phone, "phone"),
    location: ensureString(payload.location, "location"),
    total_years_experience: totalYears,
    skills: normalizeSkills(ensureStringArray(payload.skills, "skills")),
    primary_roles: ensureTextArray(payload.primary_roles, "primary_roles"),
    education: ensureTextArray(payload.education, "education"),
    certifications: ensureTextArray(payload.certifications, "certifications"),
  };
};

export { ValidationError, validateStructuredResume };
