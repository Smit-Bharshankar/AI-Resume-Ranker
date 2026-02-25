import AIProvider from "./base.provider.js";

const GEMINI_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

const parseHeaders = (headers) => {
  if (!headers || typeof headers.entries !== "function") {
    return {};
  }

  return Object.fromEntries(headers.entries());
};

class GeminiProvider extends AIProvider {
  constructor(options) {
    super({ provider: "gemini", ...options });
  }

  async generateJson({ systemPrompt, userPrompt, temperature }) {
    this.assertConfigured();

    const abortController = new AbortController();
    const timeout = setTimeout(() => {
      abortController.abort();
    }, this.timeoutMs);

    try {
      const response = await fetch(
        `${GEMINI_BASE_URL}/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemPrompt }],
            },
            contents: [
              {
                role: "user",
                parts: [{ text: userPrompt }],
              },
            ],
            generationConfig: {
              temperature,
              maxOutputTokens: this.maxOutputTokens,
              responseMimeType: "application/json",
              thinkingConfig: {
                thinkingBudget: 0,
              },
            },
          }),
          signal: abortController.signal,
        },
      );

      if (!response.ok) {
        const body = await response.text();
        const error = new Error(
          `Gemini request failed with status ${response.status}`,
        );
        error.status = response.status;
        error.code = "AI_PROVIDER_REQUEST_FAILED";
        error.headers = parseHeaders(response.headers);
        error.responseBody = body;
        throw error;
      }

      const payload = await response.json();
      const text = payload?.candidates?.[0]?.content?.parts
        ?.map((part) => part?.text ?? "")
        .join("")
        .trim();

      if (!text) {
        const error = new Error("Gemini returned empty content");
        error.code = "AI_PROVIDER_EMPTY_CONTENT";
        throw error;
      }

      return {
        text,
        model: this.model,
        usage: {
          inputTokens: payload?.usageMetadata?.promptTokenCount,
          outputTokens: payload?.usageMetadata?.candidatesTokenCount,
          totalTokens: payload?.usageMetadata?.totalTokenCount,
        },
      };
    } catch (error) {
      if (error?.name === "AbortError") {
        const timeoutError = new Error("Gemini request timed out");
        timeoutError.code = "AI_PROVIDER_TIMEOUT";
        throw timeoutError;
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}

export default GeminiProvider;
