import OpenAI from "openai";
import AIProvider from "./base.provider.js";

class OpenAIProvider extends AIProvider {
  constructor(options) {
    super({ provider: "openai", ...options });
    this.client = null;
  }

  getClient() {
    if (this.client) {
      return this.client;
    }

    this.assertConfigured();

    this.client = new OpenAI({
      apiKey: this.apiKey,
      timeout: this.timeoutMs,
    });

    return this.client;
  }

  async generateJson({ systemPrompt, userPrompt, temperature }) {
    const completion = await this.getClient().chat.completions.create({
      model: this.model,
      temperature,
      max_tokens: this.maxOutputTokens,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    return {
      text: completion.choices?.[0]?.message?.content,
      model: completion.model ?? this.model,
      usage: {
        inputTokens: completion.usage?.prompt_tokens,
        outputTokens: completion.usage?.completion_tokens,
        totalTokens: completion.usage?.total_tokens,
      },
    };
  }
}

export default OpenAIProvider;
