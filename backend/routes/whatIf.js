const { getWhatIfScenario } = require("../services/geminiWhatIfService");

async function getWhatIfPayload(body = {}) {
  const scenarioKey = String(body.scenario || "").trim();
  const customScenario = String(body.customScenario || "").trim();
  const baseAmount = Number(body.baseAmount || 10000);
  const years = Number(body.years || 30);

  return getWhatIfScenario({
    scenarioKey,
    customScenario,
    baseAmount,
    years,
  });
}

module.exports = {
  getWhatIfPayload,
};
