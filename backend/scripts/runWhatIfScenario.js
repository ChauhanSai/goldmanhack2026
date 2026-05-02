require("dotenv").config({ quiet: true });

const { getWhatIfPayload } = require("../routes/whatIf");

const scenario = process.argv[2];
const baseAmount = process.argv[3];
const years = process.argv[4];
const customScenario = process.argv[5] || "";

if (!scenario) {
  console.error(JSON.stringify({ error: "Scenario argument is required." }));
  process.exit(1);
}

(async () => {
  try {
    const payload = await getWhatIfPayload({
      scenario,
      baseAmount,
      years,
      customScenario,
    });
    console.log(JSON.stringify(payload));
  } catch (error) {
    console.error(
      JSON.stringify({
        error: error?.message || "What-if scenario generation failed.",
      }),
    );
    process.exit(1);
  }
})();
