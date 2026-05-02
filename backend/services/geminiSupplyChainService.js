const { GoogleGenerativeAI } = require("@google/generative-ai");

function normalizeSymbol(value) {
  const normalized = String(value ?? "").trim().toUpperCase();
  if (!normalized || !/^[A-Z0-9.-]{1,12}$/.test(normalized)) {
    throw new Error("Invalid ticker symbol");
  }
  return normalized;
}

function clampUnit(value, fallback = 0.5) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return fallback;
  }
  return Math.max(0, Math.min(1, Number(number.toFixed(2))));
}

function normalizeRelationshipArray(items, relationship) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => ({
      symbol: item?.symbol ? String(item.symbol).trim().toUpperCase() : null,
      name: String(item?.name ?? "").trim() || "Unknown",
      relationship,
      category: String(item?.category ?? "").trim() || "general",
      weight: clampUnit(item?.weight, 0.12),
      confidence: clampUnit(item?.confidence, 0.55),
      reason: String(item?.reason ?? "").trim() || "AI-estimated relationship based on public company context.",
    }))
    .filter((item) => item.name)
    .slice(0, 8);
}

function parseJsonResponse(text) {
  const cleaned = String(text ?? "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleaned);
}

function hasValidRelationshipData(data) {
  return Boolean(
    data &&
      Array.isArray(data.suppliers) &&
      Array.isArray(data.customers) &&
      Array.isArray(data.competitors) &&
      Array.isArray(data.ecosystem),
  );
}

async function getGeminiSupplyChain(symbol, companyProfile = null) {
  const normalizedSymbol = normalizeSymbol(symbol);

  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const prompt = `
You are a financial ecosystem analysis engine.

Given a public company ticker, infer likely supply-chain dependencies, major customer types, competitors, and related ecosystem stocks.

Ticker: ${normalizedSymbol}
Company profile, if available:
${companyProfile ? JSON.stringify(companyProfile, null, 2) : "No company profile provided."}

Return STRICT JSON only. No markdown. No explanation.

Schema:
{
  "symbol": "string",
  "companyName": "string",
  "suppliers": [
    {
      "symbol": "string or null",
      "name": "string",
      "relationship": "supplier",
      "category": "string",
      "weight": 0.0,
      "confidence": 0.0,
      "reason": "short reason"
    }
  ],
  "customers": [
    {
      "symbol": "string or null",
      "name": "string",
      "relationship": "customer",
      "category": "string",
      "weight": 0.0,
      "confidence": 0.0,
      "reason": "short reason"
    }
  ],
  "competitors": [
    {
      "symbol": "string or null",
      "name": "string",
      "relationship": "competitor",
      "category": "string",
      "weight": 0.0,
      "confidence": 0.0,
      "reason": "short reason"
    }
  ],
  "ecosystem": [
    {
      "symbol": "string or null",
      "name": "string",
      "relationship": "ecosystem",
      "category": "string",
      "weight": 0.0,
      "confidence": 0.0,
      "reason": "short reason"
    }
  ]
}

Rules:
- Use your general knowledge of public companies.
- Do not claim this is verified real-time supply-chain data.
- Prefer public tickers where known.
- If unsure of ticker, use null.
- Use weights between 0 and 1 to represent relative exposure or importance.
- Use confidence between 0 and 1.
- Suppliers should be companies or categories the company depends on.
- Customers should be major customer companies or customer segments.
- Competitors should be direct or close competitors.
- Ecosystem should include related companies affected by the same theme, supply chain, market, or technology stack.
- Return 3 to 8 items per category when possible.
- Keep reasons short and user-friendly.
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const parsed = parseJsonResponse(text);

  const payload = {
    symbol: normalizeSymbol(parsed.symbol || normalizedSymbol),
    companyName: String(parsed.companyName ?? "").trim() || normalizedSymbol,
    suppliers: normalizeRelationshipArray(parsed.suppliers, "supplier"),
    customers: normalizeRelationshipArray(parsed.customers, "customer"),
    competitors: normalizeRelationshipArray(parsed.competitors, "competitor"),
    ecosystem: normalizeRelationshipArray(parsed.ecosystem, "ecosystem"),
  };

  if (!hasValidRelationshipData(payload)) {
    throw new Error("Gemini returned invalid relationship data.");
  }

  return {
    ...payload,
    source: "gemini_ai_estimate",
    warnings: [
      "This relationship map is AI-estimated from general public knowledge, not verified real-time supplier data.",
    ],
    methodology: [
      "Used Gemini to infer likely suppliers, customers, competitors, and ecosystem exposures.",
      "Fallback data is used if Gemini is unavailable or returns invalid JSON.",
    ],
  };
}

module.exports = {
  getGeminiSupplyChain,
  hasValidRelationshipData,
};
