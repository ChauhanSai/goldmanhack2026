const { GoogleGenAI } = require("@google/genai");

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const SCENARIOS = {
  market_drop: {
    scenarioTitle: "Market drops 20%",
    noRebalance: {
      label: "No Rebalance: full 20% shock",
      yearOneShock: -0.2,
      withdrawalYear: null,
      withdrawalPct: null,
      annualGrowthAfterShock: 0.05,
    },
    rebalanced: {
      label: "Rebalanced: smaller 10% shock",
      yearOneShock: -0.1,
      withdrawalYear: null,
      withdrawalPct: null,
      annualGrowthAfterShock: 0.07,
    },
    fallbackExplanation:
      "A sudden market drop can hit a stock-heavy portfolio before it has time to recover, especially if most of the money is exposed to the same risk.",
    fallbackRecommendedRebalance:
      "Spread some of the portfolio into broader funds, steadier assets, and a small cash reserve so one bad year does less damage.",
    fallbackActionSteps: [
      "Trim concentrated stock positions.",
      "Add diversified market exposure.",
      "Keep some money in lower-volatility assets.",
    ],
  },
  inflation: {
    scenarioTitle: "Inflation stays high",
    noRebalance: {
      label: "No Rebalance: inflation drag",
      yearOneShock: 0,
      withdrawalYear: null,
      withdrawalPct: null,
      annualGrowthAfterShock: 0.04,
    },
    rebalanced: {
      label: "Rebalanced: inflation-aware mix",
      yearOneShock: 0,
      withdrawalYear: null,
      withdrawalPct: null,
      annualGrowthAfterShock: 0.065,
    },
    fallbackExplanation:
      "When inflation stays high, money that sits in slower-growing assets can lose purchasing power even if the account balance still rises.",
    fallbackRecommendedRebalance:
      "Shift toward a mix that still aims for growth while avoiding too much reliance on one slow-moving asset type.",
    fallbackActionSteps: [
      "Review assets that may lag inflation.",
      "Add diversified long-term growth exposure.",
      "Keep short-term cash needs separate.",
    ],
  },
  withdrawal: {
    scenarioTitle: "Need to withdraw 20%",
    noRebalance: {
      label: "No Rebalance: sell during need",
      yearOneShock: 0,
      withdrawalYear: 1,
      withdrawalPct: 0.2,
      annualGrowthAfterShock: 0.05,
    },
    rebalanced: {
      label: "Rebalanced: planned cash bucket",
      yearOneShock: 0,
      withdrawalYear: 1,
      withdrawalPct: 0.2,
      annualGrowthAfterShock: 0.065,
    },
    fallbackExplanation:
      "A large withdrawal can be harder on a portfolio if it forces you to sell growth investments at the wrong time.",
    fallbackRecommendedRebalance:
      "Set aside near-term cash before you need it so the rest of the portfolio can stay invested and recover more smoothly.",
    fallbackActionSteps: [
      "Plan withdrawals ahead of time.",
      "Build a short-term cash bucket.",
      "Avoid selling everything from one risky area.",
    ],
  },
  tech_crash: {
    scenarioTitle: "Tech stocks crash",
    noRebalance: {
      label: "No Rebalance: concentrated tech hit",
      yearOneShock: -0.15,
      withdrawalYear: null,
      withdrawalPct: null,
      annualGrowthAfterShock: 0.05,
    },
    rebalanced: {
      label: "Rebalanced: diversified sector mix",
      yearOneShock: -0.07,
      withdrawalYear: null,
      withdrawalPct: null,
      annualGrowthAfterShock: 0.065,
    },
    fallbackExplanation:
      "If too much of the portfolio depends on tech, a sector crash can pull down long-term results much more than expected.",
    fallbackRecommendedRebalance:
      "Reduce single-sector dependence by spreading exposure across more industries and adding steadier holdings.",
    fallbackActionSteps: [
      "Cut back on concentrated tech risk.",
      "Add exposure to other sectors.",
      "Use broad funds to smooth out shocks.",
    ],
  },
  lower_risk: {
    scenarioTitle: "Lower my risk",
    noRebalance: {
      label: "No Rebalance: higher volatility path",
      yearOneShock: 0,
      withdrawalYear: null,
      withdrawalPct: null,
      annualGrowthAfterShock: 0.05,
    },
    rebalanced: {
      label: "Rebalanced: smoother lower-risk path",
      yearOneShock: 0,
      withdrawalYear: null,
      withdrawalPct: null,
      annualGrowthAfterShock: 0.06,
    },
    fallbackExplanation:
      "A higher-risk portfolio may grow more in strong years, but it can also swing more sharply when markets get rough.",
    fallbackRecommendedRebalance:
      "Move toward a steadier mix that still grows, but with less dependence on the most volatile positions.",
    fallbackActionSteps: [
      "Reduce concentrated risk.",
      "Add steadier diversified holdings.",
      "Match risk level to your comfort and timeline.",
    ],
  },
};

const COACH_JSON_SCHEMA = {
  type: "object",
  properties: {
    explanation: { type: "string" },
    recommendedRebalance: { type: "string" },
    actionSteps: {
      type: "array",
      items: { type: "string" },
      minItems: 3,
      maxItems: 5,
    },
    disclaimer: { type: "string" },
  },
  required: [
    "explanation",
    "recommendedRebalance",
    "actionSteps",
    "disclaimer",
  ],
};

const CUSTOM_COACH_JSON_SCHEMA = {
  type: "object",
  properties: {
    scenarioTitle: { type: "string" },
    explanation: { type: "string" },
    recommendedRebalance: { type: "string" },
    actionSteps: {
      type: "array",
      items: { type: "string" },
      minItems: 3,
      maxItems: 5,
    },
    noRebalance: {
      type: "object",
      properties: {
        label: { type: "string" },
        yearOneShock: { type: "number" },
        withdrawalYear: { type: ["number", "null"] },
        withdrawalPct: { type: ["number", "null"] },
        annualGrowthAfterShock: { type: "number" },
      },
      required: [
        "label",
        "yearOneShock",
        "withdrawalYear",
        "withdrawalPct",
        "annualGrowthAfterShock",
      ],
    },
    rebalanced: {
      type: "object",
      properties: {
        label: { type: "string" },
        yearOneShock: { type: "number" },
        withdrawalYear: { type: ["number", "null"] },
        withdrawalPct: { type: ["number", "null"] },
        annualGrowthAfterShock: { type: "number" },
      },
      required: [
        "label",
        "yearOneShock",
        "withdrawalYear",
        "withdrawalPct",
        "annualGrowthAfterShock",
      ],
    },
    disclaimer: { type: "string" },
  },
  required: [
    "scenarioTitle",
    "explanation",
    "recommendedRebalance",
    "actionSteps",
    "noRebalance",
    "rebalanced",
    "disclaimer",
  ],
};

function validateScenarioKey(scenarioKey) {
  const normalized = String(scenarioKey || "").trim();
  if (!normalized || !SCENARIOS[normalized]) {
    throw new Error("Invalid what-if scenario");
  }
  return normalized;
}

function normalizeCustomPrompt(customPrompt) {
  return String(customPrompt || "").trim().replace(/\s+/g, " ").slice(0, 180);
}

function buildFallbackResponse(scenarioKey, warning = null) {
  const scenario = SCENARIOS[scenarioKey];
  const warnings = [];
  if (warning) {
    warnings.push(warning);
  }

  return {
    scenarioTitle: scenario.scenarioTitle,
    explanation: scenario.fallbackExplanation,
    recommendedRebalance: scenario.fallbackRecommendedRebalance,
    actionSteps: scenario.fallbackActionSteps,
    noRebalance: scenario.noRebalance,
    rebalanced: scenario.rebalanced,
    disclaimer: "Educational estimate only, not financial advice.",
    warnings,
    source: "fallback",
  };
}

function buildCustomFallbackResponse(customScenario = "Custom What-If", warning = null) {
  const warnings = [];
  if (warning) {
    warnings.push(warning);
  }

  return {
    scenarioTitle: customScenario || "Custom What-If",
    explanation:
      "This scenario could affect your future path, especially if it forces you to sell investments at a bad time.",
    recommendedRebalance:
      "Build a cash buffer for near-term needs and reduce concentration in riskier assets.",
    actionSteps: [
      "Set aside cash for planned expenses.",
      "Reduce overexposure to one sector or stock.",
      "Use a diversified mix for longer-term money.",
    ],
    noRebalance: {
      label: "No Rebalance: less prepared",
      yearOneShock: -0.08,
      withdrawalYear: null,
      withdrawalPct: null,
      annualGrowthAfterShock: 0.05,
    },
    rebalanced: {
      label: "Rebalanced: more prepared",
      yearOneShock: -0.04,
      withdrawalYear: null,
      withdrawalPct: null,
      annualGrowthAfterShock: 0.06,
    },
    disclaimer: "Educational estimate only, not financial advice.",
    warnings,
    source: "fallback",
  };
}

function safeJsonParse(text) {
  const cleaned = String(text || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  return JSON.parse(cleaned);
}

function clamp(num, min, max, fallback) {
  if (typeof num !== "number" || Number.isNaN(num)) return fallback;
  return Math.min(max, Math.max(min, num));
}

function normalizeNullableYear(value) {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (n < 1 || n > 30) return null;
  return Math.round(n);
}

function normalizeAssumptions(assumptions, fallbackGrowth) {
  return {
    label: String(assumptions?.label || "Scenario Path").slice(0, 60),
    yearOneShock: clamp(Number(assumptions?.yearOneShock), -0.5, 0.1, 0),
    withdrawalYear: normalizeNullableYear(assumptions?.withdrawalYear),
    withdrawalPct:
      assumptions?.withdrawalPct === null || assumptions?.withdrawalPct === undefined
        ? null
        : clamp(Number(assumptions.withdrawalPct), 0, 0.5, null),
    annualGrowthAfterShock: clamp(
      Number(assumptions?.annualGrowthAfterShock),
      0,
      0.1,
      fallbackGrowth,
    ),
  };
}

function normalizeActionSteps(value) {
  return Array.isArray(value)
    ? value
        .map((step) => String(step || "").trim())
        .filter(Boolean)
        .slice(0, 5)
    : [];
}

function normalizeCoachPayload(parsed, scenarioKey) {
  const scenario = SCENARIOS[scenarioKey];
  const actionSteps = normalizeActionSteps(parsed?.actionSteps);

  if (
    !parsed ||
    typeof parsed.explanation !== "string" ||
    typeof parsed.recommendedRebalance !== "string" ||
    actionSteps.length === 0
  ) {
    throw new Error("Gemini returned invalid JSON.");
  }

  return {
    scenarioTitle: scenario.scenarioTitle,
    explanation: parsed.explanation.trim(),
    recommendedRebalance: parsed.recommendedRebalance.trim(),
    actionSteps,
    noRebalance: scenario.noRebalance,
    rebalanced: scenario.rebalanced,
    disclaimer:
      String(parsed.disclaimer || "").trim() ||
      "Educational estimate only, not financial advice.",
    warnings: [],
    source: "gemini",
  };
}

function normalizeCustomPayload(parsed, customScenario) {
  const actionSteps = normalizeActionSteps(parsed?.actionSteps);

  if (
    !parsed ||
    typeof parsed.explanation !== "string" ||
    typeof parsed.recommendedRebalance !== "string" ||
    actionSteps.length === 0
  ) {
    throw new Error("Gemini returned invalid JSON.");
  }

  return {
    scenarioTitle: String(parsed.scenarioTitle || customScenario || "Custom What-If").trim().slice(0, 120),
    explanation: parsed.explanation.trim(),
    recommendedRebalance: parsed.recommendedRebalance.trim(),
    actionSteps,
    noRebalance: normalizeAssumptions(parsed.noRebalance, 0.05),
    rebalanced: normalizeAssumptions(parsed.rebalanced, 0.06),
    disclaimer:
      String(parsed.disclaimer || "").trim() ||
      "Educational estimate only, not financial advice.",
    warnings: [],
    source: "gemini",
  };
}

async function generatePresetScenarioResponse(scenarioKey) {
  const scenario = SCENARIOS[scenarioKey];

  if (!process.env.GEMINI_API_KEY) {
    return buildFallbackResponse(
      scenarioKey,
      "The coach is unavailable, so Moore Money is using a built-in response.",
    );
  }

  const prompt = `
You are a friendly financial education coach for a beginner retail-investor app called Moore Money.

The user selected this what-if scenario:
"${scenario.scenarioTitle}"

Write a simple explanation and a clear rebalancing recommendation.

Rules:
- Do not give personalized financial advice.
- Do not mention that you know the user's actual portfolio.
- Keep it beginner-friendly.
- Do not use jargon unless you explain it simply.
- Recommend easy-to-understand rebalancing actions.
- Explain why doing nothing may be riskier.
- Keep action steps short.
- Return STRICT JSON only.
- No markdown.
- No text outside JSON.

Return exactly this JSON shape:
{
  "explanation": "string",
  "recommendedRebalance": "string",
  "actionSteps": ["string", "string", "string"],
  "disclaimer": "Educational estimate only, not financial advice."
}
`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: COACH_JSON_SCHEMA,
      },
    });

    const parsed = safeJsonParse(response.text);
    return normalizeCoachPayload(parsed, scenarioKey);
  } catch {
    return buildFallbackResponse(
      scenarioKey,
      "The coach is temporarily unavailable. Showing a stable fallback plan instead.",
    );
  }
}

async function generateCustomScenarioResponse(customScenario, baseAmount, years) {
  const normalizedCustomScenario = normalizeCustomPrompt(customScenario);
  if (!normalizedCustomScenario) {
    throw new Error("Invalid what-if scenario");
  }

  if (!process.env.GEMINI_API_KEY) {
    return buildCustomFallbackResponse(
      normalizedCustomScenario,
      "The coach is unavailable, so Moore Money is using a built-in response.",
    );
  }

  const prompt = `
You are a friendly financial education coach for a beginner retail-investor app called Moore Money.

The user typed this custom what-if scenario:
"${normalizedCustomScenario}"

The current starting portfolio value is ${baseAmount}.
The chart projects ${years} years.

Return STRICT JSON only. No markdown. No text outside JSON.

Your job:
1. Explain the scenario in beginner-friendly terms.
2. Recommend a simple rebalance.
3. Create numeric assumptions that can update a chart comparing:
   - No Rebalance
   - Rebalanced Strategy

Rules:
- This is educational, not personalized financial advice.
- Do not say you know the user's real portfolio.
- Keep assumptions realistic and simple.
- Do not make catastrophic assumptions unless the user explicitly says so.
- yearOneShock should be between -0.50 and 0.10.
- withdrawalPct should be between 0 and 0.50, or null.
- withdrawalYear should be an integer from 1 to 30, or null.
- annualGrowthAfterShock should be between 0.00 and 0.10.
- Rebalanced strategy should usually have smaller downside or better planning.
- Use null when no withdrawal applies.
- Labels should be short enough for a chart legend.

Return exactly:
{
  "scenarioTitle": "string",
  "explanation": "string",
  "recommendedRebalance": "string",
  "actionSteps": ["string", "string", "string"],
  "noRebalance": {
    "label": "string",
    "yearOneShock": number,
    "withdrawalYear": number_or_null,
    "withdrawalPct": number_or_null,
    "annualGrowthAfterShock": number
  },
  "rebalanced": {
    "label": "string",
    "yearOneShock": number,
    "withdrawalYear": number_or_null,
    "withdrawalPct": number_or_null,
    "annualGrowthAfterShock": number
  },
  "disclaimer": "Educational estimate only, not financial advice."
}
`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: CUSTOM_COACH_JSON_SCHEMA,
      },
    });

    const parsed = safeJsonParse(response.text);
    return normalizeCustomPayload(parsed, normalizedCustomScenario);
  } catch {
    return buildCustomFallbackResponse(
      normalizedCustomScenario,
      "The coach is temporarily unavailable. Showing a stable fallback plan instead.",
    );
  }
}

async function getWhatIfScenario({
  scenarioKey,
  customScenario,
  baseAmount = 10000,
  years = 30,
}) {
  const normalizedScenarioKey = String(scenarioKey || "").trim();

  if (normalizedScenarioKey === "custom") {
    return generateCustomScenarioResponse(customScenario, baseAmount, years);
  }

  const validScenarioKey = validateScenarioKey(normalizedScenarioKey);
  return generatePresetScenarioResponse(validScenarioKey);
}

module.exports = {
  SCENARIOS,
  clamp,
  normalizeNullableYear,
  normalizeAssumptions,
  getWhatIfScenario,
};
