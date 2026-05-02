require("dotenv").config({ quiet: true });

const { getSupplyChainForTicker } = require("../routes/supplyChain");

const ticker = process.argv[2];

if (!ticker) {
  console.error(JSON.stringify({ error: "Ticker argument is required." }));
  process.exit(1);
}

(async () => {
  try {
    const payload = await getSupplyChainForTicker(ticker);
    console.log(JSON.stringify(payload));
  } catch (error) {
    console.error(
      JSON.stringify({
        error: error?.message || "Gemini supply-chain route failed.",
      }),
    );
    process.exit(1);
  }
})();
