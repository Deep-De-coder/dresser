export type WardrobeCategory = "shirt" | "pants" | "jacket" | "dress" | "shoes" | "accessory";

const SYNONYMS: Record<WardrobeCategory, string[]> = {
  shirt: ["shirt","t-shirt","tee","top","blouse","sweater","cardigan","hoodie","polo","jersey","kurta","kurti"],
  pants: ["pants","trousers","jeans","denim","chinos","leggings","joggers","shorts","cargo pants"],
  jacket: ["jacket","coat","blazer","parka","windbreaker","overcoat","trench coat","puffer","suit","tuxedo"],
  dress: ["dress","gown","skirt","saree","kurta set","sundress"],
  shoes: ["shoe","shoes","sneaker","sneakers","boot","boots","heel","heels","loafer","loafers","sandal","sandals","flip-flop","slipper","slippers"],
  accessory: ["handbag","bag","backpack","belt","hat","cap","scarf","watch","glasses","sunglasses","tie","bow tie","wallet","necktie","pocket square"],
};

const CATEGORY_PRIORITY: WardrobeCategory[] = ["shirt","jacket","pants","dress","shoes","accessory"];
// ^ If scores tie or are close, prefer upper-body garments over shoes/accessories for single-item photos.

// Heuristic words for better context detection
const HEADSHOT_HINTS = ["portrait","headshot","face","smile","shoulder","profile"];
const SUIT_HINTS = ["suit","blazer","tuxedo","tie","necktie","pocket square"];

export function computeCategory(
  tags: { name: string; confidence: number }[] = [],
  objects: { name: string; confidence: number; rectangle?: {x:number;y:number;w:number;h:number} }[] = []
): { category?: WardrobeCategory; confidence?: number; debug?: any } {

  const tagTokens = tags.map(t => ({token: t.name.toLowerCase(), conf: t.confidence||0}));
  const objTokens = objects.map(o => ({token: (o as any).object?.toLowerCase?.() || o.name?.toLowerCase?.() || "", conf: o.confidence||0}));

  // Weight objects a bit higher than tags (they localize things)
  const TAG_W = 1.0;
  const OBJ_W = 1.3;

  const scores: Record<WardrobeCategory, number> = {
    shirt:0, pants:0, jacket:0, dress:0, shoes:0, accessory:0
  };

  const hits: Record<WardrobeCategory, string[]> = {
    shirt:[], pants:[], jacket:[], dress:[], shoes:[], accessory:[]
  };

  const addMatches = (list: {token:string; conf:number}[], weight:number) => {
    for (const {token, conf} of list) {
      for (const [cat, words] of Object.entries(SYNONYMS) as [WardrobeCategory,string[]][]) {
        if (words.includes(token)) {
          scores[cat] += conf * weight;
          hits[cat].push(`${token}:${(conf*weight).toFixed(2)}`);
        }
      }
    }
  };

  addMatches(tagTokens, TAG_W);
  addMatches(objTokens, OBJ_W);

  // Guardrails:
  // 1) Shoes must have strong evidence: object mention OR >=2 shoe synonyms in tags.
  const shoeSignals = hits.shoes.length;
  const hasShoeObject = objTokens.some(t => SYNONYMS.shoes.includes(t.token) && t.conf >= 0.6);
  if (!hasShoeObject && shoeSignals < 2) {
    // Knock shoes down if it only appeared once in tags
    scores.shoes *= 0.6;
  }

  // 2) If we see a clear shirt/jacket token, lightly downweight shoes (single-item photos bias)
  const hasTop = hits.shirt.length > 0 || hits.jacket.length > 0;
  if (hasTop) scores.shoes *= 0.7;

  // Enhanced heuristic detection
  const hasHeadshot = tagTokens.some(t => HEADSHOT_HINTS.includes(t.token) && t.conf >= 0.5);
  const hasSuit = tagTokens.concat(objTokens).some(t => SUIT_HINTS.includes(t.token) && t.conf >= 0.5);

  // Boost tops when a suit is present
  if (hasSuit) {
    scores.jacket *= 1.35;
    scores.shirt  *= 1.15;
    // Suits rarely show shoes/pants clearly in headshots
    scores.pants  *= 0.75;
    scores.shoes  *= 0.7;
  }

  // Penalize lower-body for headshots
  if (hasHeadshot) {
    scores.pants *= 0.6;
    scores.shoes *= 0.5;
  }

  // Extra guardrail: if there is NO pants/jeans/trousers object with conf >= 0.65,
  // but we DO have shirt/jacket hits, knock pants down.
  const hasPantsObject = objTokens.some(t => SYNONYMS.pants.includes(t.token) && t.conf >= 0.65);
  const hasTopHits = hits.shirt.length > 0 || hits.jacket.length > 0;
  if (!hasPantsObject && hasTopHits) scores.pants *= 0.6;

  // Pick best with a minimum threshold
  let best: WardrobeCategory | undefined = undefined;
  let bestScore = 0;
  for (const cat of Object.keys(scores) as WardrobeCategory[]) {
    if (scores[cat] > bestScore) {
      best = cat;
      bestScore = scores[cat];
    }
  }

  // Require a reasonable score (else return undefined so you can show "Needs review")
  const MIN_SCORE = 0.55; // tune as you collect data
  if (!best || bestScore < MIN_SCORE) {
    return { category: undefined, confidence: undefined, debug: {scores, hits} };
  }

  // Tie-breaker: if close (within 10%), use CATEGORY_PRIORITY order
  const sorted = (Object.entries(scores) as [WardrobeCategory,number][])
    .sort((a,b) => b[1]-a[1]);
  if (sorted.length >= 2 && (sorted[0][1] - sorted[1][1]) / (sorted[0][1] || 1e-6) < 0.10) {
    for (const cat of CATEGORY_PRIORITY) {
      if (sorted.slice(0,2).some(([c]) => c === cat)) {
        best = cat; break;
      }
    }
  }

  // Convert score (roughly 0–1.3) to a 0–1 confidence for UI
  const confidence = Math.max(0, Math.min(1, bestScore / 1.3));

  return { category: best, confidence, debug: {scores, hits} };
}
