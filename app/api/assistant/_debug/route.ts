export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const hasUrl = !!process.env.OLLAMA_URL;
  const hasKey = !!process.env.OLLAMA_PROXY_KEY;

  if (!hasUrl || !hasKey) {
    return new Response(JSON.stringify({ error: 'env_missing', hasUrl, hasKey }), { status: 500 });
  }

  const testBody = { 
    model: process.env.LLM_MODEL || "qwen2:1.5b-instruct",
    messages: [{ role: "user", content: "ping" }], 
    stream: false 
  };

  try {
    const r = await fetch(process.env.OLLAMA_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": process.env.OLLAMA_PROXY_KEY! },
      body: JSON.stringify(testBody),
    });

    const text = await r.text();
    return new Response(JSON.stringify({ ok: r.ok, status: r.status, body: text.slice(0, 400) }), { status: r.ok ? 200 : 502 });
  } catch (e:any) {
    return new Response(JSON.stringify({ error: 'fetch_failed', message: e?.message || String(e) }), { status: 502 });
  }
}
