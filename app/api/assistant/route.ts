import { NextRequest, NextResponse } from "next/server";

const PROVIDER = process.env.AI_PROVIDER || "ollama";
const OLLAMA_URL = process.env.OLLAMA_URL!;
const OLLAMA_KEY = process.env.OLLAMA_PROXY_KEY!;
const MODEL = process.env.LLM_MODEL || "qwen2:1.5b-instruct";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";


export async function POST(req: NextRequest) {
  try {
    const { query, weather, items, preferences } = await req.json();

    const messages = [
      { role: "system", content: "You are Dresser, a wardrobe stylist. Reply concisely with outfit suggestions." },
      { role: "user", content:
        `Question: ${query}\nWeather: ${JSON.stringify(weather)}\nPreferences: ${JSON.stringify(preferences)}\nItems:\n${
          (items||[]).slice(0,20).map((i:any)=>`- ${i.name} (${i.category}, ${i.color}, ${i.formality||"?"})`).join("\n")
        }`
      }
    ];

    if (PROVIDER !== "ollama") {
      return NextResponse.json({ error: "provider_not_enabled" }, { status: 501 });
    }

    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 15000);

    const r = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": OLLAMA_KEY },
      body: JSON.stringify({ model: MODEL, messages, stream: false }),
      signal: ctrl.signal
    }).catch((e) => ({ ok: false, status: 502, text: async () => e?.message || "fetch failed" } as any));

    clearTimeout(t);

    if (!r.ok) {
      const detail = await (r.text?.() ?? Promise.resolve(""));
      return NextResponse.json({ error: "proxy_failed", detail }, { status: r.status || 502 });
    }

    const data = await r.json();
    const reply = data?.message?.content || data?.response || "Sorry, I couldn't generate a response.";
    return NextResponse.json({ reply });
  } catch (e:any) {
    return NextResponse.json({ error: e?.name === "AbortError" ? "timeout" : (e?.message || "server_error") },
                              { status: e?.name === "AbortError" ? 504 : 500 });
  }
}
