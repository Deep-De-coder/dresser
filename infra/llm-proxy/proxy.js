import Fastify from "fastify";
const f = Fastify({ logger: false });
const KEY = process.env.PROXY_KEY || "";

f.post("/llm", async (req, reply) => {
  if (req.headers["x-api-key"] !== KEY) return reply.code(401).send({ error: "unauthorized" });
  try {
    const r = await fetch("http://dresser-ollama.internal:11434/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(req.body),
    });
    if (!r.ok) return reply.code(502).send({ error: "upstream_failed", detail: await r.text() });
    return reply.send(await r.json().catch(() => ({})));
  } catch {
    return reply.code(502).send({ error: "upstream_unreachable" });
  }
});

f.get("/health", async () => ({ ok: true }));
f.listen({ port: 8787, host: "0.0.0.0" });