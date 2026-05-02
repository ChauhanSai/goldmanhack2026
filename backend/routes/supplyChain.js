const axios = require("axios");
const fs = require("node:fs/promises");
const path = require("node:path");

const {
  getGeminiSupplyChain,
  hasValidRelationshipData,
} = require("../services/geminiSupplyChainService");

const FALLBACK_PATH = path.join(__dirname, "..", "data", "supply_chain_fallback.json");

function normalizeSymbol(rawSymbol) {
  const symbol = String(rawSymbol ?? "").trim().toUpperCase();
  if (!/^[A-Z0-9.-]{1,12}$/.test(symbol)) {
    throw new Error("Invalid ticker symbol");
  }
  return symbol;
}

async function loadFallbackData() {
  const raw = await fs.readFile(FALLBACK_PATH, "utf-8");
  return JSON.parse(raw);
}

async function getFinnhubCompanyProfile(symbol) {
  if (!process.env.FINNHUB_API_KEY) {
    return null;
  }

  try {
    const response = await axios.get("https://finnhub.io/api/v1/stock/profile2", {
      params: {
        symbol,
        token: process.env.FINNHUB_API_KEY,
      },
      timeout: 8000,
      validateStatus: () => true,
    });

    if (response.status < 200 || response.status >= 300 || !response.data) {
      return null;
    }

    return response.data;
  } catch {
    return null;
  }
}

async function getSupplyChainForTicker(rawSymbol) {
  const symbol = normalizeSymbol(rawSymbol);
  const warnings = [];
  const companyProfile = await getFinnhubCompanyProfile(symbol);

  try {
    const geminiData = await getGeminiSupplyChain(symbol, companyProfile);
    if (hasValidRelationshipData(geminiData)) {
      return geminiData;
    }
    warnings.push("Gemini returned invalid relationship data.");
  } catch (error) {
    warnings.push(`Gemini failed: ${error?.message || "Unknown Gemini error."}`);
  }

  const fallback = await loadFallbackData();
  const fallbackData = fallback[symbol];

  if (fallbackData) {
    return {
      symbol,
      source: "fallback",
      ...fallbackData,
      warnings: [
        ...warnings,
        "Using fallback relationship data.",
      ],
      methodology: [
        "Used local fallback relationship estimates because Gemini was unavailable or invalid.",
      ],
    };
  }

  return {
    symbol,
    source: "empty",
    suppliers: [],
    customers: [],
    competitors: [],
    ecosystem: [],
    warnings: [
      ...warnings,
      "No relationship data found.",
    ],
    methodology: [],
  };
}

module.exports = {
  getSupplyChainForTicker,
};
