import AIProvider from "./base.provider.js";
import { waitForAiBudget } from "../rateBudget.js";

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

  async requestGenerateContent({
    systemPrompt,
    userPrompt,
    temperature,
    responseSchema,
    thinkingMode = "model-default",
    signal,
  }) {
    const isGemini3Series = this.model.toLowerCase().includes("gemini-3");
    const thinkingConfig =
      thinkingMode === "none"
        ? null
        : thinkingMode === "level" || (thinkingMode === "model-default" && isGemini3Series)
          ? { thinkingLevel: "minimal" }
          : { thinkingBudget: 0 };

    return fetch(
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
            ...(responseSchema ? { responseSchema } : {}),
            ...(thinkingConfig ? { thinkingConfig } : {}),
          },
        }),
        signal,
      },
    );
  }

  async generateJson({
    systemPrompt,
    userPrompt,
    temperature,
    responseSchema,
    rateLimitBucket,
  }) {
    this.assertConfigured();
    await waitForAiBudget(rateLimitBucket ?? "default");

    const abortController = new AbortController();
    const timeout = setTimeout(() => {
      abortController.abort();
    }, this.timeoutMs);

    try {
      const attempts = [
        { responseSchema, thinkingMode: "model-default", label: "schema+modelThinking" },
        { responseSchema: null, thinkingMode: "model-default", label: "json+modelThinking" },
        { responseSchema: null, thinkingMode: "none", label: "json+noThinkingConfig" },
      ];

      let response = await this.requestGenerateContent({
        systemPrompt,
        userPrompt,
        temperature,
        responseSchema: attempts[0].responseSchema,
        thinkingMode: attempts[0].thinkingMode,
        signal: abortController.signal,
      });
      let requestVariant = attempts[0].label;
      let previousFailures = [];

      for (let index = 1; index < attempts.length && !response.ok && response.status === 400; index += 1) {
        const failedBody = await response.text();
        previousFailures.push({
          variant: requestVariant,
          status: response.status,
          body: failedBody,
        });

        const nextAttempt = attempts[index];
        requestVariant = nextAttempt.label;
        response = await this.requestGenerateContent({
          systemPrompt,
          userPrompt,
          temperature,
          responseSchema: nextAttempt.responseSchema,
          thinkingMode: nextAttempt.thinkingMode,
          signal: abortController.signal,
        });
      }

      if (!response.ok) {
        const body = await response.text();
        const error = new Error(
          `Gemini request failed with status ${response.status}`,
        );
        error.status = response.status;
        error.code = "AI_PROVIDER_REQUEST_FAILED";
        error.headers = parseHeaders(response.headers);
        error.responseBody = body;
        error.requestVariant = requestVariant;
        error.previousFailures = previousFailures;
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
