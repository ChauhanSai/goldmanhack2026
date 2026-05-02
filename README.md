# goldmanhack2026

## Running this locally

Because the frontend is served directly by our Flask backend, you only need to run one command to start everything!

```bash
cd backend
npm install
python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && python app.py
```

Once running, open your browser to [http://127.0.0.1:5000](http://127.0.0.1:5000) to view the frontend.

## Live supply-chain data

The portfolio dashboard now uses Gemini to infer likely suppliers, customers, competitors, and ecosystem exposures for a ticker. If Gemini is unavailable or returns invalid JSON, the backend falls back to curated local estimates.

Optional environment variables for other backend features:

```bash
export GEMINI_API_KEY=your_gemini_api_key
export FINNHUB_API_KEY=your_optional_finnhub_profile_key
```

Reference template: [backend/.env.example](/Users/purva/Desktop/goldmanhack2026/backend/.env.example)

The backend reads keys from the process environment only. Keys are never exposed to the frontend, and `.env` files are not auto-loaded by the app right now.

Useful verification commands:

```bash
cd backend
node -e "require('dotenv').config(); const { getGeminiSupplyChain } = require('./services/geminiSupplyChainService'); getGeminiSupplyChain('AAPL').then(console.log).catch(console.error)"
curl http://127.0.0.1:5000/api/supply-chain/AAPL
venv/bin/python -m unittest discover -s tests -v
```

`/api/supply-chain/<ticker>` and `/api/ecosystem-risk/<ticker>` always return a safe JSON payload. If Gemini fails, the response degrades into fallback data or empty arrays plus non-blocking warnings.
