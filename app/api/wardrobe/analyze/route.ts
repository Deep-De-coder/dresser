import { NextRequest, NextResponse } from "next/server";

type WardrobeCategory = "shirt" | "pants" | "jacket" | "dress" | "shoes" | "accessory";
type WardrobeAttributes = {
  category?: WardrobeCategory;
  colors?: { name?: string; hex?: string }[];
  boxes?: { label: string; box: [number, number, number, number]; confidence: number }[];
  raw?: any;
};

const ENDPOINT = process.env.AZURE_VISION_ENDPOINT!;
const KEY = process.env.AZURE_VISION_KEY!;

const LABEL_TO_CATEGORY: Record<string, WardrobeCategory> = {
  "t-shirt": "shirt",
  "shirt": "shirt",
  "top": "shirt",
  "blouse": "shirt",
  "sweater": "shirt",
  "hoodie": "shirt",
  "pants": "pants",
  "trousers": "pants",
  "jeans": "pants",
  "shorts": "pants",
  "jacket": "jacket",
  "coat": "jacket",
  "blazer": "jacket",
  "dress": "dress",
  "gown": "dress",
  "skirt": "dress",
  "shoe": "shoes",
  "shoes": "shoes",
  "sneaker": "shoes",
  "boot": "shoes",
  "heels": "shoes",
  "sandal": "shoes",
  "handbag": "accessory",
  "bag": "accessory",
  "belt": "accessory",
  "hat": "accessory",
  "cap": "accessory",
  "scarf": "accessory",
  "watch": "accessory",
  "glasses": "accessory",
};

function pickCategory(tags: { name: string; confidence: number }[]): WardrobeCategory | undefined {
  const sorted = [...tags].sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
  for (const t of sorted) {
    const key = t.name.toLowerCase();
    if (key in LABEL_TO_CATEGORY) return LABEL_TO_CATEGORY[key];
  }
  return undefined;
}

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();
    if (!imageUrl) return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });

    // Check if environment variables are available
    if (!ENDPOINT || !KEY) {
      return NextResponse.json({ 
        error: "Azure Vision API credentials not configured",
        details: `ENDPOINT: ${!!ENDPOINT}, KEY: ${!!KEY}`
      }, { status: 500 });
    }

    const url = new URL(`${ENDPOINT}/vision/v3.2/analyze`);
    url.searchParams.set("visualFeatures", ["Tags", "Objects", "Color"].join(","));

    const resp = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: imageUrl }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      return NextResponse.json({ error: err }, { status: resp.status });
    }

    const data = await resp.json();

    const tagList =
      (data.tags || []).map((t: any) => ({ name: t.name, confidence: t.confidence })) ?? [];

    const category = pickCategory(tagList);

    const boxes =
      (data.objects || []).map((o: any) => ({
        label: o.object,
        confidence: o.confidence,
        box: [o.rectangle.x, o.rectangle.y, o.rectangle.w, o.rectangle.h] as [number, number, number, number],
      })) ?? [];

    // Azure returns color names + an accent hex (without #)
    const colors = [
      ...(data.color?.dominantColors || []).map((name: string) => ({ name })),
      data.color?.accentColor ? { hex: `#${data.color.accentColor}` } : undefined,
    ].filter(Boolean) as { name?: string; hex?: string }[];

    const out: WardrobeAttributes = { category, colors, boxes, raw: data };
    return NextResponse.json(out);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}
