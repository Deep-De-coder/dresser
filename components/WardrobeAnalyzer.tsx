"use client";
import { useState } from "react";

export default function WardrobeAnalyzer() {
  const [imageUrl, setImageUrl] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const analyze = async () => {
    setLoading(true);
    setErr(null);
    setResult(null);
    try {
      const r = await fetch("/api/wardrobe/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error || "Failed");
      setResult(json);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        className="border p-2 w-full"
        placeholder="Paste image URL…"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
      />
      <button className="border px-3 py-2 rounded" onClick={analyze} disabled={!imageUrl || loading}>
        {loading ? "Analyzing…" : "Analyze"}
      </button>
      {err && <div className="text-red-600">{err}</div>}
      {result && (
        <pre className="text-xs whitespace-pre-wrap border p-3 rounded bg-black/5">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
