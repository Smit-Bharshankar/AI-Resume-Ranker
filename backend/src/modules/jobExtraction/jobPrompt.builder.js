const MAX_JOB_DESCRIPTION_CHARS = 15000;

const normalizeJobDescription = (rawDescription) => {
  if (typeof rawDescription !== "string") {
    return "";
  }

  return rawDescription
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const truncateJobDescription = (
  normalizedDescription,
  maxChars = MAX_JOB_DESCRIPTION_CHARS,
) => {
  if (normalizedDescription.length <= maxChars) {
    return normalizedDescription;
  }

  return normalizedDescription.slice(0, maxChars);
};

const buildJobExtractionPrompt = (rawDescription) => {
  const normalizedDescription = normalizeJobDescription(rawDescription);
  const jobDescription = truncateJobDescription(normalizedDescription);

  const schema = `{
  "required_skills": [],
  "preferred_skills": [],
  "minimum_experience_years": 0,
  "mandatory_keywords": []
}`;

  const systemPrompt = [
    "You extract structured job requirements from job descriptions.",
    "Output valid JSON only. Do not return markdown, prose, comments, or explanations.",
    "Return exactly the keys defined by the schema and no additional keys.",
    "Use conservative inference only from text explicitly stated in the job description.",
    "Do not hallucinate tools, frameworks, skills, or keywords not mentioned.",
    "Normalize required_skills, preferred_skills, and mandatory_keywords to lowercase.",
    "Remove duplicates in all output arrays.",
    "minimum_experience_years must be a number greater than or equal to 0.",
    "If unknown, return empty arrays and 0.",
  ].join(" ");

  const userPrompt = [
    "Extract the job requirements into this exact JSON schema:",
    schema,
    "",
    "Rules:",
    "- Output JSON only.",
    "- Include all keys.",
    "- Arrays must contain strings only.",
    "- Lowercase all strings inside arrays.",
    "- Deduplicate array values.",
    "- Avoid inferring requirements not explicitly stated.",
    "",
    "Job description:",
    jobDescription,
  ].join("\n");

  return {
    systemPrompt,
    userPrompt,
    jobDescription,
    wasTruncated: normalizedDescription.length > jobDescription.length,
  };
};

export { MAX_JOB_DESCRIPTION_CHARS, buildJobExtractionPrompt };
