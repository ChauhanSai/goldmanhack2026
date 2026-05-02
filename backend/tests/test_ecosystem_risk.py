from unittest import TestCase
from unittest.mock import patch

import app as aura_app
from services import ecosystem_risk_service as service


class EcosystemRiskServiceTests(TestCase):
    def setUp(self):
        service._ecosystem_cache.clear()
        self.client = aura_app.app.test_client()

    def test_validate_ticker_trims_and_normalizes(self):
        self.assertEqual(service.validate_ticker("  aapl "), "AAPL")

    def test_validate_ticker_rejects_invalid_characters(self):
        with self.assertRaises(service.EcosystemRiskValidationError):
            service.validate_ticker("AAPL!")

    @patch("services.ecosystem_risk_service._run_gemini_route")
    def test_service_prefers_gemini_when_it_returns_valid_payload(self, mock_gemini):
        mock_gemini.return_value = {
            "symbol": "AAPL",
            "companyName": "Apple Inc.",
            "source": "gemini_ai_estimate",
            "suppliers": [{"symbol": "TSM", "name": "TSMC"}],
            "customers": [],
            "competitors": [{"symbol": "MSFT", "name": "Microsoft"}],
            "ecosystem": [],
            "warnings": [
                "This relationship map is AI-estimated from general public knowledge, not verified real-time supplier data.",
            ],
            "methodology": [
                "Used Gemini to infer likely suppliers, customers, competitors, and ecosystem exposures.",
            ],
        }

        payload = service.get_ecosystem_risk("aapl")

        self.assertEqual(payload["symbol"], "AAPL")
        self.assertEqual(payload["source"], "gemini_ai_estimate")
        self.assertEqual(payload["suppliers"][0]["symbol"], "TSM")

    @patch("services.ecosystem_risk_service._run_gemini_route")
    def test_service_falls_back_when_gemini_fails(self, mock_gemini):
        mock_gemini.side_effect = service.ProviderExecutionError("Missing GEMINI_API_KEY")

        payload = service.get_supply_chain_payload("AAPL")

        self.assertEqual(payload["source"], "fallback")
        self.assertEqual(payload["companyName"], "Apple Inc.")
        self.assertTrue(any("Gemini failed" in warning for warning in payload["warnings"]))
        self.assertIn("Using fallback relationship data.", payload["warnings"])

    @patch("services.ecosystem_risk_service._run_gemini_route")
    def test_service_returns_empty_payload_for_unknown_ticker(self, mock_gemini):
        mock_gemini.side_effect = service.ProviderExecutionError("Gemini offline")

        payload = service.get_supply_chain_payload("ZZZZ")

        self.assertEqual(payload["source"], "empty")
        self.assertEqual(payload["suppliers"], [])
        self.assertIn("Gemini failed", payload["warnings"][0])

    @patch("services.ecosystem_risk_service._run_gemini_route")
    def test_supply_chain_route_returns_payload(self, mock_gemini):
        mock_gemini.return_value = {
            "symbol": "AAPL",
            "companyName": "Apple Inc.",
            "source": "gemini_ai_estimate",
            "suppliers": [],
            "customers": [],
            "competitors": [],
            "ecosystem": [],
            "warnings": [],
            "methodology": [],
        }

        response = self.client.get("/api/supply-chain/AAPL")
        payload = response.get_json()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(payload["symbol"], "AAPL")
        self.assertEqual(payload["source"], "gemini_ai_estimate")

    def test_route_rejects_invalid_ticker(self):
        response = self.client.get("/api/supply-chain/AAPL!")
        payload = response.get_json()

        self.assertEqual(response.status_code, 400)
        self.assertIn("error", payload)
