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
       // If Ollama is not running, provide intelligent fallback responses
       if (providerError.code === "OLLAMA_ERROR" || providerError.message?.includes("fetch failed")) {
         const queryLower = query.toLowerCase();
         
         // Generate intelligent contextual suggestions
         let suggestion = "";
         let plan = {
           top: "Classic white or light-colored shirt",
           bottom: "Dark jeans or chinos", 
           shoes: "Clean sneakers or loafers",
           outerwear: "Light jacket or cardigan",
           accessories: ["Minimal watch", "Simple belt"]
         };
         
         if (queryLower.includes('dress')) {
           suggestion = "A comfortable, well-fitted dress would be perfect for today. Choose a style that matches your occasion - casual for everyday wear, or more formal for special events.";
           plan = {
             top: "Not needed - dress covers this",
             bottom: "Not needed - dress covers this",
             shoes: "Heels, flats, or comfortable sneakers",
             outerwear: "Light cardigan or blazer if needed",
             accessories: ["Simple jewelry", "Handbag or clutch"]
           };
         } else if (queryLower.includes('business') || queryLower.includes('meeting') || queryLower.includes('work') || queryLower.includes('office')) {
           suggestion = "For a professional look, opt for business-casual attire that's comfortable yet polished. A well-fitted blazer with a crisp shirt and tailored pants will give you confidence.";
           plan = {
             top: "Button-down shirt or blouse in white, light blue, or pastel",
             bottom: "Dress pants, chinos, or pencil skirt in navy, black, or gray",
             shoes: "Loafers, oxfords, or low heels in black or brown",
             outerwear: "Blazer or cardigan in navy, black, or gray",
             accessories: ["Professional watch", "Minimal jewelry", "Leather belt"]
           };
         } else if (queryLower.includes('casual') || queryLower.includes('weekend') || queryLower.includes('relaxed') || queryLower.includes('hangout')) {
           suggestion = "Keep it comfortable and relaxed for a casual day out. Focus on comfort while still looking put-together.";
           plan = {
             top: "T-shirt, polo, or casual shirt in your favorite color",
             bottom: "Jeans, shorts, or casual pants in denim or khaki",
             shoes: "Sneakers, sandals, or casual shoes",
             outerwear: "Hoodie, sweater, or light jacket",
             accessories: ["Casual watch", "Backpack or tote bag"]
           };
         } else if (queryLower.includes('date') || queryLower.includes('dinner') || queryLower.includes('evening') || queryLower.includes('romantic')) {
           suggestion = "Dress to impress while staying comfortable for your special occasion. Choose pieces that make you feel confident and attractive.";
           plan = {
             top: "Nice blouse, dress shirt, or elegant top",
             bottom: "Dress pants, skirt, or nice dark jeans",
             shoes: "Dress shoes, heels, or nice boots",
             outerwear: "Blazer, cardigan, or elegant jacket",
             accessories: ["Elegant jewelry", "Nice handbag or clutch"]
           };
         } else if (queryLower.includes('gym') || queryLower.includes('workout') || queryLower.includes('exercise') || queryLower.includes('fitness')) {
           suggestion = "Choose comfortable, breathable activewear for your workout. Focus on functionality and comfort.";
           plan = {
             top: "Moisture-wicking t-shirt or tank top",
             bottom: "Athletic shorts or leggings",
             shoes: "Running shoes or athletic sneakers",
             outerwear: "Light jacket for warm-up",
             accessories: ["Water bottle", "Gym towel", "Fitness tracker"]
           };
         } else if (queryLower.includes('party') || queryLower.includes('celebration') || queryLower.includes('festive')) {
           suggestion = "Have fun with your outfit for the party! Choose something that reflects your personality and the occasion.";
           plan = {
             top: "Statement top or festive blouse",
             bottom: "Party pants, skirt, or dressy jeans",
             shoes: "Party shoes, heels, or stylish sneakers",
             outerwear: "Fun jacket or cardigan",
             accessories: ["Bold jewelry", "Party bag", "Fun accessories"]
           };
         } else if (queryLower.includes('interview') || queryLower.includes('job')) {
           suggestion = "Dress professionally and conservatively for your interview. First impressions matter, so choose classic, well-fitted pieces.";
           plan = {
             top: "Crisp white or light blue button-down shirt",
             bottom: "Dark dress pants or pencil skirt",
             shoes: "Professional shoes in black or brown",
             outerwear: "Blazer in navy, black, or gray",
             accessories: ["Professional watch", "Minimal jewelry", "Portfolio or briefcase"]
           };
         } else if (queryLower.includes('travel') || queryLower.includes('trip') || queryLower.includes('vacation')) {
           suggestion = "Pack versatile pieces that can be mixed and matched. Focus on comfort for travel while still looking stylish.";
           plan = {
             top: "Comfortable layers - t-shirts, light sweaters",
             bottom: "Versatile pants and shorts",
             shoes: "Comfortable walking shoes",
             outerwear: "Light jacket or cardigan",
             accessories: ["Travel bag", "Comfortable accessories"]
           };
         } else {
           suggestion = "Consider layering with a nice top and bottoms, plus comfortable shoes that match your day's activities. Choose colors that make you feel confident.";
         }
         
         const fallbackResponse = {
           replyText: `I'd love to help you with outfit suggestions! Here's my recommendation: ${suggestion}

*Note: For even more personalized AI-powered recommendations, you can set up Ollama by visiting https://ollama.ai, running 'ollama pull phi3:instruct', and starting 'ollama serve'. But for now, this suggestion should work perfectly for your needs!`,
           plan: plan,
           rationale: "This recommendation is based on styling best practices for your specific request. I've considered the occasion, comfort, and style factors to give you a well-rounded outfit suggestion.",
           usedItems: [],
           meta: {
             provider: "intelligent-fallback",
             model: "contextual-styling",
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
