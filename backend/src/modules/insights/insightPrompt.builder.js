const MAX_PROMPT_CHARS = 14000;

const normalizeJsonForPrompt = (value) => {
  if (value === undefined || value === null) {
    return "{}";
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "{}";
  }
};

const truncate = (value, maxChars = MAX_PROMPT_CHARS) => {
  if (value.length <= maxChars) {
    return value;
  }

  return value.slice(0, maxChars);
};

const buildInsightPrompt = ({
  structuredResume,
  structuredRequirements,
  scoreBreakdown,
}) => {
  const schema = `{
  "summary": "",
  "strengths": [],
  "weaknesses": [],
  "interview_questions": [],
  "recommendation": "STRONG_FIT | GOOD_FIT | MODERATE_FIT | WEAK_FIT"
}`;

  const resumeJson = truncate(normalizeJsonForPrompt(structuredResume));
  const requirementsJson = truncate(normalizeJsonForPrompt(structuredRequirements));
  const scoreBreakdownJson = truncate(normalizeJsonForPrompt(scoreBreakdown));

  const systemPrompt = [
    "You are an AI recruiting analyst generating candidate insights for hiring teams.",
    "Output valid JSON only. Do not return markdown, prose, comments, or explanations.",
    "Return exactly the keys defined by the schema and no additional keys.",
    "Use only the provided data. Do not hallucinate achievements, tools, roles, or years of experience.",
    "Use a concise professional recruiter tone inside JSON strings.",
    "recommendation must be exactly one of: STRONG_FIT, GOOD_FIT, MODERATE_FIT, WEAK_FIT.",
  ].join(" ");

  const userPrompt = [
    "Generate recruiter-facing insights using this exact schema:",
    schema,
    "",
    "Rules:",
    "- Output JSON only.",
    "- Include all keys.",
    "- strengths, weaknesses, interview_questions must be arrays of strings.",
    "- Keep each interview question specific and job-relevant.",
    "- Use only evidence present in the provided input data.",
    "",
    "Input: structured_resume",
    resumeJson,
    "",
    "Input: job_structured_requirements",
    requirementsJson,
    "",
    "Input: score_breakdown",
    scoreBreakdownJson,
  ].join("\n");

  return {
    systemPrompt,
    userPrompt,
    wasTruncated:
      resumeJson.length < normalizeJsonForPrompt(structuredResume).length ||
      requirementsJson.length < normalizeJsonForPrompt(structuredRequirements).length ||
      scoreBreakdownJson.length < normalizeJsonForPrompt(scoreBreakdown).length,
  };
};

export { MAX_PROMPT_CHARS, buildInsightPrompt };
