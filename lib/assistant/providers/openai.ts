// OpenAI provider stub for future implementation
// This file is not used unless OPENAI_API_KEY is set and AI_PROVIDER=openai

export interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  max_tokens?: number;
  temperature?: number;
}

export interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export interface ProviderError {
  status: number;
  code: string;
  message: string;
}

export class OpenAIProvider {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;

  constructor(apiKey: string, baseUrl: string = "https://api.openai.com/v1", timeout: number = 15000) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  async chat(request: OpenAIRequest): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          ...request,
          max_tokens: request.max_tokens || 500,
          temperature: request.temperature || 0.7,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} ${errorData.error?.message || response.statusText}`);
      }

      const data: OpenAIResponse = await response.json();
      
      if (!data.choices?.[0]?.message?.content) {
        throw new Error("No content in OpenAI response");
      }

      return data.choices[0].message.content;

    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === "AbortError") {
        const timeoutError: ProviderError = {
          status: 504,
          code: "TIMEOUT",
          message: "Request timed out"
        };
        throw timeoutError;
      }

      if (error.message?.includes("401")) {
        const authError: ProviderError = {
          status: 401,
          code: "AUTH_FAILED",
          message: "Invalid OpenAI API key"
        };
        throw authError;
      }

      // Re-throw with provider error format
      const providerError: ProviderError = {
        status: 500,
        code: "OPENAI_ERROR",
        message: error.message || "Unknown OpenAI error"
      };
      throw providerError;
    }
  }
}
