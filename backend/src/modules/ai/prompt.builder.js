const MAX_RESUME_TEXT_CHARS = 15000;

const normalizeResumeText = (rawText) => {
  if (typeof rawText !== "string") {
    return "";
  }

  return rawText
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const dedupeLines = (text) => {
  const seen = new Set();
  const lines = text.split("\n");
  const filtered = [];

  for (const line of lines) {
    const normalizedLine = line.trim().toLowerCase();
    if (!normalizedLine) {
      filtered.push(line);
      continue;
    }

    if (seen.has(normalizedLine)) {
      continue;
    }

    seen.add(normalizedLine);
    filtered.push(line);
  }

  return filtered.join("\n").replace(/\n{3,}/g, "\n\n").trim();
};

const truncateResumeText = (text, maxChars = MAX_RESUME_TEXT_CHARS) => {
  if (text.length <= maxChars) {
    return text;
  }

  return text.slice(0, maxChars);
};

const buildExtractionPrompt = (rawResumeText) => {
  const normalizedText = normalizeResumeText(rawResumeText);
  const dedupedText = dedupeLines(normalizedText);
  const resumeText = truncateResumeText(dedupedText);

  const schema = `{
  "name": "",
  "email": "",
  "phone": "",
  "location": "",
  "total_years_experience": 0,
  "skills": [],
  "primary_roles": [],
  "education": [],
  "certifications": []
}`;

  const systemPrompt = [
    "You extract structured resume data.",
    "Return valid JSON only with no markdown, no prose, and no explanation.",
    "Do not add keys beyond the provided schema.",
    "Use conservative total years of experience estimation when dates are ambiguous.",
    "Normalize all skills to lowercase and remove duplicate skills.",
  ].join(" ");

  const userPrompt = [
    "Extract resume information into this exact JSON schema:",
    schema,
    "",
    "Rules:",
    "- Output JSON only.",
    "- Include every schema key.",
    "- Keep unknown values as empty string, empty array, or 0.",
    "- All arrays must contain strings only.",
    "- skills must be lowercase unique strings.",
    "",
    "Resume text:",
    resumeText,
  ].join("\n");

  return {
    systemPrompt,
    userPrompt,
    resumeText,
    wasTruncated: dedupedText.length > resumeText.length,
    wasDeduped: dedupedText.length < normalizedText.length,
  };
};

export { MAX_RESUME_TEXT_CHARS, buildExtractionPrompt };
