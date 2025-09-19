import { OllamaProvider } from "./providers/ollama";
import { OpenAIProvider } from "./providers/openai";

export interface Weather {
  tempC: number;
  condition: string;
  windKph?: number;
}

export interface Preferences {
  style?: string;
  avoidColors?: string[];
  [key: string]: any;
}

export interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  color?: string;
  fabric?: string;
  formality?: string;
  [key: string]: any;
}

export interface AssistantRequest {
  query: string;
  weather?: Weather;
  preferences?: Preferences;
  items: WardrobeItem[];
}

export interface OutfitPlan {
  top?: string;
  bottom?: string;
  shoes?: string;
  outerwear?: string;
  accessories?: string[];
}

export interface AssistantResponse {
  replyText: string;
  plan: OutfitPlan;
  rationale: string;
  usedItems: string[];
  meta: {
    provider: string;
    model: string;
    latencyMs: number;
  };
}

export interface Message {
  role: "system" | "user";
  content: string;
}

// Provider interface
export interface AIProvider {
  chat(request: any): Promise<string>;
}

// Get the appropriate provider based on environment
export function getProvider(): AIProvider | null {
  const provider = process.env.AI_PROVIDER || "ollama";
  
  switch (provider) {
    case "ollama":
      const ollamaUrl = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
      return new OllamaProvider(ollamaUrl);
    
    case "openai":
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        console.warn("OpenAI provider requested but OPENAI_API_KEY not set");
        return null;
      }
      return new OpenAIProvider(apiKey);
    
    default:
      console.warn(`Unknown AI provider: ${provider}`);
      return null;
  }
}

// Build system and user messages for the AI
export function buildMessages(request: AssistantRequest): Message[] {
  const { query, weather, preferences, items } = request;
  
  // Pre-filter items based on weather and formality
  const filteredItems = preFilterItems(items, query, weather);
  
  // Build system prompt
  const systemPrompt = buildSystemPrompt();
  
  // Build user prompt with context
  const userPrompt = buildUserPrompt(query, weather, preferences, filteredItems);
  
  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ];
}

// Pre-filter items to keep context manageable
function preFilterItems(items: WardrobeItem[], query: string, weather?: Weather): WardrobeItem[] {
  let filtered = [...items];
  
  // Filter by formality based on query keywords
  const formalityKeywords = {
    business: ["meeting", "interview", "office", "business", "formal", "professional"],
    casual: ["casual", "relaxed", "weekend", "hangout", "informal"],
    formal: ["wedding", "gala", "black tie", "formal event", "ceremony"]
  };
  
  const detectedFormality = detectFormality(query, formalityKeywords);
  if (detectedFormality) {
    filtered = filtered.filter(item => 
      !item.formality || 
      item.formality === detectedFormality || 
      item.formality === "business-casual" // Include business-casual for business queries
    );
  }
  
  // Filter by weather
  if (weather) {
    if (weather.tempC < 10) {
      // Cold weather - prefer layers, avoid shorts
      filtered = filtered.filter(item => 
        item.category !== "shorts" && 
        (item.category === "jacket" || item.category === "pants" || item.category === "shirt")
      );
    } else if (weather.tempC > 25) {
      // Hot weather - prefer breathable fabrics, allow shorts
      filtered = filtered.filter(item => 
        !item.fabric || 
        ["cotton", "linen", "breathable"].some(fabric => 
          item.fabric?.toLowerCase().includes(fabric)
        )
      );
    }
    
    if (weather.condition?.toLowerCase().includes("rain")) {
      // Rainy weather - prefer waterproof items
      filtered = filtered.filter(item => 
        item.fabric?.toLowerCase().includes("waterproof") ||
        item.category === "jacket" ||
        item.category === "shoes"
      );
    }
  }
  
  // Limit to max 20 items to keep context small
  return filtered.slice(0, 20);
}

function detectFormality(query: string, keywords: Record<string, string[]>): string | null {
  const lowerQuery = query.toLowerCase();
  
  for (const [formality, words] of Object.entries(keywords)) {
    if (words.some(word => lowerQuery.includes(word))) {
      return formality;
    }
  }
  
  return null;
}

function buildSystemPrompt(): string {
  return `You are a professional wardrobe stylist assistant. Your job is to provide concise, practical outfit recommendations based on the user's query, weather conditions, and available wardrobe items.

Guidelines:
- Always provide a structured outfit plan with: top, bottom, shoes, outerwear, accessories
- Keep responses concise and practical
- Consider weather conditions and formality requirements
- If no suitable items are available, suggest what to add to the wardrobe
- Be specific about item names and colors when possible
- Provide a brief rationale for your choices

Response format:
1. A friendly paragraph explaining your recommendation
2. A structured plan with specific items
3. A brief rationale (1-2 sentences)

Always end your response with a clear plan structure like:
PLAN:
Top: [specific item]
Bottom: [specific item] 
Shoes: [specific item]
Outerwear: [specific item or "none needed"]
Accessories: [list of accessories or "none needed"]`;
}

function buildUserPrompt(query: string, weather?: Weather, preferences?: Preferences, items: WardrobeItem[] = []): string {
  let prompt = `User Query: "${query}"\n\n`;
  
  if (weather) {
    prompt += `Weather: ${weather.tempC}°C, ${weather.condition}`;
    if (weather.windKph) {
      prompt += `, ${weather.windKph} km/h wind`;
    }
    prompt += `\n\n`;
  }
  
  if (preferences) {
    prompt += `Preferences: `;
    if (preferences.style) prompt += `Style: ${preferences.style}`;
    if (preferences.avoidColors?.length) {
      prompt += `, Avoid colors: ${preferences.avoidColors.join(", ")}`;
    }
    prompt += `\n\n`;
  }
  
  if (items.length === 0) {
    prompt += `Available wardrobe: No items available. Please suggest a basic outfit and what items should be added to the wardrobe.`;
  } else {
    prompt += `Available wardrobe items:\n`;
    items.forEach(item => {
      prompt += `- ${item.name} (${item.category}`;
      if (item.color) prompt += `, ${item.color}`;
      if (item.fabric) prompt += `, ${item.fabric}`;
      if (item.formality) prompt += `, ${item.formality}`;
      prompt += `)\n`;
    });
  }
  
  return prompt;
}

// Call the AI provider
export async function callAssistant(provider: AIProvider, messages: Message[]): Promise<string> {
  const model = process.env.LLM_MODEL || "phi3:instruct";
  
  if (provider instanceof OllamaProvider) {
    return await provider.chat({
      model,
      messages: messages as any,
      stream: false
    });
  } else if (provider instanceof OpenAIProvider) {
    return await provider.chat({
      model: model === "phi3:instruct" ? "gpt-3.5-turbo" : model,
      messages: messages as any
    });
  }
  
  throw new Error("Unsupported provider type");
}

// Shape the raw AI response into structured format
export function shapeResponse(rawText: string, items: WardrobeItem[]): Omit<AssistantResponse, 'meta'> {
  // Extract plan from the response
  const plan = extractPlan(rawText);
  
  // Extract rationale
  const rationale = extractRationale(rawText);
  
  // Find used items based on the plan
  const usedItems = findUsedItems(plan, items);
  
  // Clean up the reply text (remove plan section)
  const replyText = cleanReplyText(rawText);
  
  return {
    replyText,
    plan,
    rationale,
    usedItems
  };
}

function extractPlan(text: string): OutfitPlan {
  const plan: OutfitPlan = {};
  
  // Look for PLAN: section
  const planMatch = text.match(/PLAN:\s*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i);
  if (planMatch) {
    const planText = planMatch[1];
    
    // Extract each category
    const topMatch = planText.match(/Top:\s*(.+?)(?=\n|$)/i);
    const bottomMatch = planText.match(/Bottom:\s*(.+?)(?=\n|$)/i);
    const shoesMatch = planText.match(/Shoes:\s*(.+?)(?=\n|$)/i);
    const outerwearMatch = planText.match(/Outerwear:\s*(.+?)(?=\n|$)/i);
    const accessoriesMatch = planText.match(/Accessories:\s*(.+?)(?=\n|$)/i);
    
    if (topMatch) plan.top = topMatch[1].trim();
    if (bottomMatch) plan.bottom = bottomMatch[1].trim();
    if (shoesMatch) plan.shoes = shoesMatch[1].trim();
    if (outerwearMatch) plan.outerwear = outerwearMatch[1].trim();
    if (accessoriesMatch) {
      const accessories = accessoriesMatch[1].trim();
      if (accessories.toLowerCase() !== "none needed") {
        plan.accessories = accessories.split(",").map(a => a.trim());
      }
    }
  }
  
  // Fallback: try to extract from unstructured text
  if (!plan.top && !plan.bottom) {
    // Simple keyword extraction as fallback
    if (text.toLowerCase().includes("shirt") || text.toLowerCase().includes("blouse")) {
      plan.top = "Suggested top";
    }
    if (text.toLowerCase().includes("pants") || text.toLowerCase().includes("jeans")) {
      plan.bottom = "Suggested bottom";
    }
    if (text.toLowerCase().includes("shoes") || text.toLowerCase().includes("sneakers")) {
      plan.shoes = "Suggested shoes";
    }
  }
  
  return plan;
}

function extractRationale(text: string): string {
  // Look for rationale after the plan
  const rationaleMatch = text.match(/Rationale:\s*(.+?)(?=\n\n|$)/i);
  if (rationaleMatch) {
    return rationaleMatch[1].trim();
  }
  
  // Fallback: extract last sentence or two
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  if (sentences.length >= 2) {
    return sentences.slice(-2).join(". ").trim() + ".";
  }
  
  return "Based on weather conditions and available items.";
}

function findUsedItems(plan: OutfitPlan, items: WardrobeItem[]): string[] {
  const usedItems: string[] = [];
  
  // Simple matching based on item names
  const planText = Object.values(plan).flat().join(" ").toLowerCase();
  
  items.forEach(item => {
    if (planText.includes(item.name.toLowerCase()) || 
        planText.includes(item.category.toLowerCase())) {
      usedItems.push(item.id);
    }
  });
  
  return usedItems;
}

function cleanReplyText(text: string): string {
  // Remove the PLAN: section and rationale
  let cleaned = text.replace(/PLAN:\s*[\s\S]*?(?=\n\n|\n[A-Z]|$)/i, "");
  cleaned = cleaned.replace(/Rationale:\s*[\s\S]*$/i, "");
  
  // Clean up extra whitespace
  cleaned = cleaned.trim();
  
  // If too short, use the original text
  if (cleaned.length < 50) {
    return text.split("PLAN:")[0]?.trim() || text;
  }
  
  return cleaned;
}
