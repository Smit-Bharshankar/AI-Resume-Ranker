class AIProvider {
  constructor({ provider, apiKey, model, timeoutMs, maxOutputTokens }) {
    this.provider = provider;
    this.apiKey = apiKey;
    this.model = model;
    this.timeoutMs = timeoutMs;
    this.maxOutputTokens = maxOutputTokens;
  }

  assertConfigured() {
    if (!this.apiKey) {
      const error = new Error(
        `AI API key is not configured for provider: ${this.provider}`,
      );
      error.code = "AI_CONFIG_MISSING";
      throw error;
    }
  }

  // Implement in provider adapters.
  // Must return:
  // {
  //   text: string,
  //   model: string,
  //   usage: { inputTokens?: number, outputTokens?: number, totalTokens?: number }
  // }
  // eslint-disable-next-line no-unused-vars
  async generateJson({ systemPrompt, userPrompt, temperature }) {
    throw new Error("generateJson must be implemented by provider");
  }
}

export default AIProvider;
