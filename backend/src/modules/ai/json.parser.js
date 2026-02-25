const parseJsonFromCompletion = (content) => {
  if (typeof content !== "string" || !content.trim()) {
    const error = new Error("Empty AI response content");
    error.code = "INVALID_JSON_RESPONSE";
    throw error;
  }

  const normalized = content.trim();

  try {
    return JSON.parse(normalized);
  } catch {
    const fencedMatch = normalized.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    const candidate = fencedMatch?.[1]?.trim() ?? normalized;
    const firstBrace = candidate.indexOf("{");
    const lastBrace = candidate.lastIndexOf("}");

    if (firstBrace >= 0 && lastBrace > firstBrace) {
      const sliced = candidate.slice(firstBrace, lastBrace + 1);

      try {
        return JSON.parse(sliced);
      } catch {
        const error = new Error("AI response was not valid JSON");
        error.code = "INVALID_JSON_RESPONSE";
        throw error;
      }
    }

    const error = new Error("AI response was not valid JSON");
    error.code = "INVALID_JSON_RESPONSE";
    throw error;
  }
};

export { parseJsonFromCompletion };
