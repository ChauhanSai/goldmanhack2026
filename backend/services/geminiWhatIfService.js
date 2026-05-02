const { GoogleGenAI } = require("@google/genai");

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const TECH_TICKERS = new Set([
  "AAPL",
  "MSFT",
  "NVDA",
  "TSLA",
  "META",
  "GOOGL",
  "GOOG",
  "AMZN",
  "AMD",
  "INTC",
  "QCOM",
  "AVGO",
  "ORCL",
  "CRM",
  "ADBE",
  "NFLX",
  "SMCI",
  "TSM",
  "ASML",
  "MU",
  "SNOW",
  "PLTR",
  "SHOP",
  "QQQ",
]);

const BROAD_FUNDS = new Set([
  "VOO",
  "VTI",
  "SPY",
  "IVV",
  "SCHB",
  "ITOT",
  "QQQ",
  "DIA",
]);

const DEFENSIVE_TICKERS = new Set([
  "BND",
  "AGG",
  "SGOV",
  "SHY",
  "BIL",
  "VGIT",
  "IEF",
]);

const CASH_LIKE_TICKERS = new Set([
  "CASH",
  "SGOV",
  "SHY",
  "BIL",
  "SHV",
]);

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

function normalizeTicker(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9.-]/g, "")
    .slice(0, 12);
}

function normalizePortfolio(rawPortfolio = []) {
  if (!Array.isArray(rawPortfolio)) {
    return [];
  }

  const combined = new Map();

  rawPortfolio.forEach((holding) => {
    const ticker = normalizeTicker(holding?.ticker);
    const value = Number(holding?.value);
    if (!ticker || !Number.isFinite(value) || value <= 0) {
      return;
    }

    combined.set(ticker, (combined.get(ticker) || 0) + value);
  });

  return Array.from(combined.entries())
    .map(([ticker, value]) => ({ ticker, value: Number(value.toFixed(2)) }))
    .sort((a, b) => b.value - a.value);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function summarizePortfolio(portfolio, fallbackBaseAmount = 10000) {
  const totalValue =
    portfolio.reduce((sum, holding) => sum + holding.value, 0) ||
    Math.max(Number(fallbackBaseAmount) || 0, 1000);

  const holdings = portfolio.map((holding) => ({
    ...holding,
    weight: totalValue > 0 ? holding.value / totalValue : 0,
  }));

  return {
    totalValue,
    holdings,
    topHoldings: holdings.slice(0, 4),
    techHoldings: holdings.filter((holding) => TECH_TICKERS.has(holding.ticker)),
    defensiveHolding: holdings.find((holding) => DEFENSIVE_TICKERS.has(holding.ticker)) || null,
    broadHolding: holdings.find((holding) => BROAD_FUNDS.has(holding.ticker)) || null,
    cashHolding: holdings.find((holding) => CASH_LIKE_TICKERS.has(holding.ticker)) || null,
  };
}

function serializePortfolioForPrompt(summary) {
  if (!summary.holdings.length) {
    return "No dashboard holdings were provided.";
  }

  const lines = summary.holdings.slice(0, 8).map((holding) => {
    const weightPct = (holding.weight * 100).toFixed(1);
    return `- ${holding.ticker}: ${formatCurrency(holding.value)} (${weightPct}% of portfolio)`;
  });

  return [
    `Total portfolio value: ${formatCurrency(summary.totalValue)}`,
    ...lines,
  ].join("\n");
}

function inferCustomScenarioFlags(customScenario) {
  const text = String(customScenario || "").toLowerCase();
  const percentMatch = text.match(/(\d{1,2}(?:\.\d+)?)\s*%/);
  const dollarMatch = text.match(/\$ ?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/);
  const yearMatch = text.match(/(?:in|next)\s+(\d{1,2})\s+year/);

  return {
    needsCash:
      /withdraw|tuition|semester|rent|car|job|expense|medical|down payment|pay/i.test(text),
    techRisk: /tech|semiconductor|chip|ai|software|cloud/i.test(text),
    lowerRisk: /lower risk|safer|less risk|volatility/i.test(text),
    inflationLike: /inflation|interest rate|rates stay high|purchasing power/i.test(text),
    explicitPct: percentMatch ? Number(percentMatch[1]) / 100 : null,
    explicitDollar: dollarMatch ? Number(dollarMatch[1].replace(/,/g, "")) : null,
    explicitYear: yearMatch ? Number(yearMatch[1]) : null,
  };
}

function buildPortfolioContext(summary) {
  return {
    totalValue: Number(summary.totalValue.toFixed(2)),
    topHoldings: summary.topHoldings.map((holding) => ({
      ticker: holding.ticker,
      value: Number(holding.value.toFixed(2)),
      weightPct: Number((holding.weight * 100).toFixed(1)),
    })),
  };
}

function buildPortfolioActionPlan({
  scenarioKey,
  customScenario,
  portfolio,
  baseAmount,
}) {
  const normalizedPortfolio = normalizePortfolio(portfolio);
  const summary = summarizePortfolio(normalizedPortfolio, baseAmount);
  const portfolioContext = buildPortfolioContext(summary);

  if (!summary.holdings.length) {
    return {
      actionSteps: [],
      recommendationSuffix: "",
      promptSummary: serializePortfolioForPrompt(summary),
      portfolioContext,
    };
  }

  const flags = inferCustomScenarioFlags(customScenario);
  const effectiveScenario =
    scenarioKey === "custom"
      ? flags.techRisk
        ? "tech_crash"
        : flags.needsCash
          ? "withdrawal"
          : flags.inflationLike
            ? "inflation"
            : flags.lowerRisk
              ? "lower_risk"
              : "market_drop"
      : scenarioKey;

  const nonCashHoldings = summary.holdings.filter(
    (holding) => !CASH_LIKE_TICKERS.has(holding.ticker),
  );
  const trimCandidates =
    effectiveScenario === "tech_crash" && summary.techHoldings.length
      ? summary.techHoldings
      : nonCashHoldings.filter(
          (holding) =>
            !BROAD_FUNDS.has(holding.ticker) && !DEFENSIVE_TICKERS.has(holding.ticker),
        );
  const primary = trimCandidates[0] || nonCashHoldings[0] || summary.holdings[0];
  const secondary = trimCandidates[1] || nonCashHoldings[1] || null;

  const destination = summary.defensiveHolding
    ? summary.defensiveHolding.ticker
    : summary.broadHolding
      ? `${summary.broadHolding.ticker} plus a cash buffer`
      : "a broad-market fund plus a cash buffer";

  const primaryTrimPct =
    effectiveScenario === "tech_crash"
      ? 0.18
      : effectiveScenario === "withdrawal"
        ? 0.16
        : effectiveScenario === "lower_risk"
          ? 0.1
          : 0.12;
  const secondaryTrimPct = effectiveScenario === "tech_crash" ? 0.12 : 0.08;

  const defaultCashNeed =
    effectiveScenario === "withdrawal"
      ? summary.totalValue * 0.2
      : flags.needsCash
        ? summary.totalValue * 0.12
        : null;
  const targetCashNeed = flags.explicitDollar
    ? Math.min(flags.explicitDollar, summary.totalValue * 0.5)
    : flags.explicitPct
      ? Math.min(summary.totalValue * flags.explicitPct, summary.totalValue * 0.5)
      : defaultCashNeed;

  const actionSteps = [];

  if (primary) {
    actionSteps.push(
      `Trim about ${Math.round(primaryTrimPct * 100)}% of ${primary.ticker} (${formatCurrency(
        primary.value * primaryTrimPct,
      )}) so one position carries less of the risk.`,
    );
  }

  if (secondary && secondary.ticker !== primary?.ticker) {
    actionSteps.push(
      `Sell roughly ${Math.round(secondaryTrimPct * 100)}% of ${secondary.ticker} (${formatCurrency(
        secondary.value * secondaryTrimPct,
      )}) and redirect it to ${destination}.`,
    );
  } else if (primary) {
    actionSteps.push(
      `Move the proceeds from ${primary.ticker} into ${destination} instead of leaving all of it in the same theme.`,
    );
  }

  if (targetCashNeed) {
    actionSteps.push(
      `Set aside about ${formatCurrency(targetCashNeed)} in cash or short-term Treasuries before the planned expense hits.`,
    );
  } else {
    actionSteps.push(
      `Try to keep your biggest single holding near or below ${effectiveScenario === "tech_crash" ? "25%" : "30%"} of the portfolio after the rebalance.`,
    );
  }

  const topNames = [primary?.ticker, secondary?.ticker].filter(Boolean);
  const recommendationSuffix = topNames.length
    ? `Start with ${topNames.map((ticker) => `trimming ${ticker}`).join(" and ")}.`
    : "";

  return {
    actionSteps: actionSteps.slice(0, 3),
    recommendationSuffix,
    promptSummary: serializePortfolioForPrompt(summary),
    portfolioContext,
  };
}

function mergeRecommendation(baseText, recommendationSuffix) {
  const normalizedBase = String(baseText || "").trim();
  if (!recommendationSuffix) {
    return normalizedBase;
  }
  if (!normalizedBase) {
    return recommendationSuffix;
  }
  return `${normalizedBase} ${recommendationSuffix}`.trim();
}

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

function buildFallbackResponse(
  scenarioKey,
  warning = null,
  portfolio = [],
  baseAmount = 10000,
) {
  const scenario = SCENARIOS[scenarioKey];
  const warnings = [];
  if (warning) {
    warnings.push(warning);
  }
  const actionPlan = buildPortfolioActionPlan({
    scenarioKey,
    customScenario: "",
    portfolio,
    baseAmount,
  });

  return {
    scenarioTitle: scenario.scenarioTitle,
    explanation: scenario.fallbackExplanation,
    recommendedRebalance: mergeRecommendation(
      scenario.fallbackRecommendedRebalance,
      actionPlan.recommendationSuffix,
    ),
    actionSteps:
      actionPlan.actionSteps.length > 0
        ? actionPlan.actionSteps
        : scenario.fallbackActionSteps,
    noRebalance: scenario.noRebalance,
    rebalanced: scenario.rebalanced,
    disclaimer: "Educational estimate only, not financial advice.",
    warnings,
    source: "fallback",
    portfolioContext: actionPlan.portfolioContext,
  };
}

function buildCustomFallbackResponse(
  customScenario = "Custom What-If",
  warning = null,
  portfolio = [],
  baseAmount = 10000,
) {
  const warnings = [];
  if (warning) {
    warnings.push(warning);
  }
  const actionPlan = buildPortfolioActionPlan({
    scenarioKey: "custom",
    customScenario,
    portfolio,
    baseAmount,
  });

  return {
    scenarioTitle: customScenario || "Custom What-If",
    explanation:
      "This scenario could affect your future path, especially if it forces you to sell investments at a bad time.",
    recommendedRebalance: mergeRecommendation(
      "Build a cash buffer for near-term needs and reduce concentration in riskier assets.",
      actionPlan.recommendationSuffix,
    ),
    actionSteps:
      actionPlan.actionSteps.length > 0
        ? actionPlan.actionSteps
        : [
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
    portfolioContext: actionPlan.portfolioContext,
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

function normalizeCoachPayload(parsed, scenarioKey, portfolio = [], baseAmount = 10000) {
  const scenario = SCENARIOS[scenarioKey];
  const actionPlan = buildPortfolioActionPlan({
    scenarioKey,
    customScenario: "",
    portfolio,
    baseAmount,
  });
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
    recommendedRebalance: mergeRecommendation(
      parsed.recommendedRebalance.trim(),
      actionPlan.recommendationSuffix,
    ),
    actionSteps: actionPlan.actionSteps.length > 0 ? actionPlan.actionSteps : actionSteps,
    noRebalance: scenario.noRebalance,
    rebalanced: scenario.rebalanced,
    disclaimer:
      String(parsed.disclaimer || "").trim() ||
      "Educational estimate only, not financial advice.",
    warnings: [],
    source: "gemini",
    portfolioContext: actionPlan.portfolioContext,
  };
}

function normalizeCustomPayload(
  parsed,
  customScenario,
  portfolio = [],
  baseAmount = 10000,
) {
  const actionPlan = buildPortfolioActionPlan({
    scenarioKey: "custom",
    customScenario,
    portfolio,
    baseAmount,
  });
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
    recommendedRebalance: mergeRecommendation(
      parsed.recommendedRebalance.trim(),
      actionPlan.recommendationSuffix,
    ),
    actionSteps: actionPlan.actionSteps.length > 0 ? actionPlan.actionSteps : actionSteps,
    noRebalance: normalizeAssumptions(parsed.noRebalance, 0.05),
    rebalanced: normalizeAssumptions(parsed.rebalanced, 0.06),
    disclaimer:
      String(parsed.disclaimer || "").trim() ||
      "Educational estimate only, not financial advice.",
    warnings: [],
    source: "gemini",
    portfolioContext: actionPlan.portfolioContext,
  };
}

async function generatePresetScenarioResponse(
  scenarioKey,
  baseAmount = 10000,
  portfolio = [],
) {
  const scenario = SCENARIOS[scenarioKey];
  const actionPlan = buildPortfolioActionPlan({
    scenarioKey,
    customScenario: "",
    portfolio,
    baseAmount,
  });

  if (!process.env.GEMINI_API_KEY) {
    return buildFallbackResponse(
      scenarioKey,
      "The coach is unavailable, so Moore Money is using a built-in response.",
      portfolio,
      baseAmount,
    );
  }

  const prompt = `
You are a friendly financial education coach for a beginner retail-investor app called Moore Money.

The user selected this what-if scenario:
"${scenario.scenarioTitle}"

Dashboard portfolio snapshot:
${actionPlan.promptSummary}

Write a simple explanation and a clear rebalancing recommendation.

Rules:
- Do not give personalized financial advice.
- Use the dashboard holdings when you want to mention specific tickers.
- If you mention selling, suggest trimming or reducing part of a position instead of liquidating everything.
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
    return normalizeCoachPayload(parsed, scenarioKey, portfolio, baseAmount);
  } catch {
    return buildFallbackResponse(
      scenarioKey,
      "The coach is temporarily unavailable. Showing a stable fallback plan instead.",
      portfolio,
      baseAmount,
    );
  }
}

async function generateCustomScenarioResponse(
  customScenario,
  baseAmount,
  years,
  portfolio = [],
) {
  const normalizedCustomScenario = normalizeCustomPrompt(customScenario);
  if (!normalizedCustomScenario) {
    throw new Error("Invalid what-if scenario");
  }
  const actionPlan = buildPortfolioActionPlan({
    scenarioKey: "custom",
    customScenario: normalizedCustomScenario,
    portfolio,
    baseAmount,
  });

  if (!process.env.GEMINI_API_KEY) {
    return buildCustomFallbackResponse(
      normalizedCustomScenario,
      "The coach is unavailable, so Moore Money is using a built-in response.",
      portfolio,
      baseAmount,
    );
  }

  const prompt = `
You are a friendly financial education coach for a beginner retail-investor app called Moore Money.

The user typed this custom what-if scenario:
"${normalizedCustomScenario}"

The current starting portfolio value is ${baseAmount}.
The chart projects ${years} years.
Dashboard portfolio snapshot:
${actionPlan.promptSummary}

Return STRICT JSON only. No markdown. No text outside JSON.

Your job:
1. Explain the scenario in beginner-friendly terms.
2. Recommend a simple rebalance.
3. Create numeric assumptions that can update a chart comparing:
   - No Rebalance
   - Rebalanced Strategy

Rules:
- This is educational, not personalized financial advice.
- Use the dashboard holdings when you want to mention specific tickers.
- If you mention selling, suggest trimming or reducing part of a position instead of liquidating everything.
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
    return normalizeCustomPayload(
      parsed,
      normalizedCustomScenario,
      portfolio,
      baseAmount,
    );
  } catch {
    return buildCustomFallbackResponse(
      normalizedCustomScenario,
      "The coach is temporarily unavailable. Showing a stable fallback plan instead.",
      portfolio,
      baseAmount,
    );
  }
}

async function getWhatIfScenario({
  scenarioKey,
  customScenario,
  baseAmount = 10000,
  years = 30,
  portfolio = [],
}) {
  const normalizedScenarioKey = String(scenarioKey || "").trim();

  if (normalizedScenarioKey === "custom") {
    return generateCustomScenarioResponse(customScenario, baseAmount, years, portfolio);
  }

  const validScenarioKey = validateScenarioKey(normalizedScenarioKey);
  return generatePresetScenarioResponse(validScenarioKey, baseAmount, portfolio);
}

module.exports = {
  SCENARIOS,
  clamp,
  normalizeNullableYear,
  normalizeAssumptions,
  normalizePortfolio,
  getWhatIfScenario,
};
