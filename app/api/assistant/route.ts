import { NextRequest, NextResponse } from "next/server";
import { getProvider, buildMessages, callAssistant, shapeResponse } from "@/lib/assistant";

// Rate limiting: simple in-memory sliding window per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_MAX = 20; // 20 requests per window

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  record.count++;
  return true;
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  return forwarded?.split(",")[0] || realIP || "unknown";
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    // Parse and validate request
    const body = await request.json();
    const { query, weather, preferences, items } = body;

    // Input validation
    if (!query || typeof query !== "string" || query.length > 1000) {
      return NextResponse.json(
        { error: "Query is required and must be under 1000 characters." },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length > 200) {
      return NextResponse.json(
        { error: "Items must be an array with maximum 200 items." },
        { status: 400 }
      );
    }

    // Get provider and validate
    const provider = getProvider();
    if (!provider) {
      return NextResponse.json(
        { error: "AI provider not configured or unsupported." },
        { status: 501 }
      );
    }

    try {
      // Build messages and call assistant
      const messages = buildMessages({ query, weather, preferences, items });
      const rawResponse = await callAssistant(provider, messages);
      
      // Shape response into structured format
      const response = shapeResponse(rawResponse, items);
      
      // Add metadata
      response.meta = {
        provider: process.env.AI_PROVIDER || "ollama",
        model: process.env.LLM_MODEL || "phi3:instruct",
        latencyMs: Date.now() - startTime
      };

      return NextResponse.json(response);
    } catch (providerError: any) {
      // If Ollama is not running, provide a helpful fallback response
      if (providerError.code === "OLLAMA_ERROR" || providerError.message?.includes("fetch failed")) {
        const fallbackResponse = {
          replyText: `I'd love to help you with outfit suggestions! However, I need Ollama to be running to provide AI-powered recommendations. 

For now, here's a general suggestion: ${query.toLowerCase().includes('dress') ? 'A comfortable dress with appropriate accessories would work well for today.' : 'Consider layering with a nice top and bottoms, plus comfortable shoes.'}

To get full AI assistance, please:
1. Install Ollama: https://ollama.ai
2. Run: ollama pull phi3:instruct
3. Start Ollama: ollama serve`,
          plan: {
            top: "Suggested top based on your query",
            bottom: "Suggested bottom based on your query", 
            shoes: "Comfortable shoes appropriate for the occasion",
            outerwear: "Layer as needed for weather",
            accessories: ["Minimal accessories"]
          },
          rationale: "This is a fallback suggestion while AI services are being set up.",
          usedItems: [],
          meta: {
            provider: "fallback",
            model: "none",
            latencyMs: Date.now() - startTime
          }
        };
        
        return NextResponse.json(fallbackResponse);
      }
      
      // Re-throw other errors
      throw providerError;
    }

  } catch (error: any) {
    console.error("Assistant API error:", error);
    
    // Handle specific error types
    if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      return NextResponse.json(
        { error: "AI service unavailable. Please check your configuration." },
        { status: 502 }
      );
    }
    
    if (error.name === "TimeoutError" || error.message?.includes("timeout")) {
      return NextResponse.json(
        { error: "Request timed out. Please try again." },
        { status: 504 }
      );
    }
    
    // Generic error
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
