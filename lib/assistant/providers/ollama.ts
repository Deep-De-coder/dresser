export interface OllamaMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OllamaRequest {
  model: string;
  messages: OllamaMessage[];
  stream: boolean;
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

export interface ProviderError {
  status: number;
  code: string;
  message: string;
}

export class OllamaProvider {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = "http://127.0.0.1:11434", timeout: number = 15000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  async chat(request: OllamaRequest): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama API error: ${response.status} ${errorText}`);
      }

      const data: OllamaResponse = await response.json();
      
      if (!data.message?.content) {
        throw new Error("No content in Ollama response");
      }

      return data.message.content;

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

      if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
        const connectionError: ProviderError = {
          status: 502,
          code: "CONNECTION_FAILED",
          message: "Cannot connect to Ollama service"
        };
        throw connectionError;
      }

      // Re-throw with provider error format
      const providerError: ProviderError = {
        status: 500,
        code: "OLLAMA_ERROR",
        message: error.message || "Unknown Ollama error"
      };
      throw providerError;
    }
  }
}