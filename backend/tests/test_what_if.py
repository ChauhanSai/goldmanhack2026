from unittest import TestCase
from unittest.mock import patch

import app as aura_app
from services import what_if_service as service


class WhatIfServiceTests(TestCase):
    def setUp(self):
        service._what_if_cache.clear()
        self.client = aura_app.app.test_client()

    def test_validate_scenario_rejects_missing_input(self):
        with self.assertRaises(service.WhatIfValidationError):
            service.validate_scenario("")

    @patch("services.what_if_service._run_what_if_route")
    def test_service_returns_route_payload(self, mock_run):
        mock_run.return_value = {
            "scenarioTitle": "Market drops 20%",
            "explanation": "A drop can hurt a stock-heavy portfolio.",
            "recommendedRebalance": "Diversify and keep some safer assets.",
            "actionSteps": ["Step 1", "Step 2", "Step 3"],
            "noRebalance": {
                "label": "No Rebalance: full 20% shock",
                "yearOneShock": -0.2,
                "withdrawalYear": None,
                "withdrawalPct": None,
                "annualGrowthAfterShock": 0.05,
            },
            "rebalanced": {
                "label": "Rebalanced: smaller 10% shock",
                "yearOneShock": -0.1,
                "withdrawalYear": None,
                "withdrawalPct": None,
                "annualGrowthAfterShock": 0.07,
            },
            "disclaimer": "Educational estimate only, not financial advice.",
        }

        payload = service.get_what_if_payload("market_drop", 10000, 30)

        self.assertEqual(payload["scenarioTitle"], "Market drops 20%")
        self.assertEqual(payload["rebalanced"]["annualGrowthAfterShock"], 0.07)
        mock_run.assert_called_once()

    @patch("services.what_if_service._run_what_if_route")
    def test_service_passes_custom_scenario_through(self, mock_run):
        mock_run.return_value = {
            "scenarioTitle": "What if I lose my job next year?",
            "explanation": "Income loss can force bad-timing sales.",
            "recommendedRebalance": "Build a cash buffer and reduce concentrated risk.",
            "actionSteps": ["Step 1", "Step 2", "Step 3"],
            "noRebalance": {
                "label": "No Rebalance: less prepared",
                "yearOneShock": -0.08,
                "withdrawalYear": None,
                "withdrawalPct": None,
                "annualGrowthAfterShock": 0.05,
            },
            "rebalanced": {
                "label": "Rebalanced: more prepared",
                "yearOneShock": -0.04,
                "withdrawalYear": None,
                "withdrawalPct": None,
                "annualGrowthAfterShock": 0.06,
            },
            "disclaimer": "Educational estimate only, not financial advice.",
        }

        payload = service.get_what_if_payload(
            "custom",
            10000,
            30,
            "What if I lose my job next year?",
        )

        self.assertEqual(payload["scenarioTitle"], "What if I lose my job next year?")
        self.assertEqual(mock_run.call_args.args[3], "What if I lose my job next year?")

    @patch("services.what_if_service._run_what_if_route")
    def test_service_passes_portfolio_through(self, mock_run):
        mock_run.return_value = {
            "scenarioTitle": "Lower my risk",
            "explanation": "Concentration increases volatility.",
            "recommendedRebalance": "Trim the biggest holding first.",
            "actionSteps": ["Step 1", "Step 2", "Step 3"],
            "noRebalance": {
                "label": "No Rebalance: higher volatility path",
                "yearOneShock": 0,
                "withdrawalYear": None,
                "withdrawalPct": None,
                "annualGrowthAfterShock": 0.05,
            },
            "rebalanced": {
                "label": "Rebalanced: smoother lower-risk path",
                "yearOneShock": 0,
                "withdrawalYear": None,
                "withdrawalPct": None,
                "annualGrowthAfterShock": 0.06,
            },
            "disclaimer": "Educational estimate only, not financial advice.",
        }

        portfolio = [{"ticker": "AAPL", "value": 15000}, {"ticker": "TSLA", "value": 8500}]
        payload = service.get_what_if_payload("lower_risk", 23500, 30, None, portfolio)

        self.assertEqual(payload["scenarioTitle"], "Lower my risk")
        self.assertEqual(mock_run.call_args.args[4], portfolio)

    @patch("services.what_if_service._run_what_if_route")
    def test_route_returns_payload(self, mock_run):
        mock_run.return_value = {
            "scenarioTitle": "Inflation stays high",
            "explanation": "Inflation drags on real returns.",
            "recommendedRebalance": "Use an inflation-aware mix.",
            "actionSteps": ["Step 1", "Step 2", "Step 3"],
            "noRebalance": {
                "label": "No Rebalance: inflation drag",
                "yearOneShock": 0,
                "withdrawalYear": None,
                "withdrawalPct": None,
                "annualGrowthAfterShock": 0.04,
            },
            "rebalanced": {
                "label": "Rebalanced: inflation-aware mix",
                "yearOneShock": 0,
                "withdrawalYear": None,
                "withdrawalPct": None,
                "annualGrowthAfterShock": 0.065,
            },
            "disclaimer": "Educational estimate only, not financial advice.",
        }

        response = self.client.post(
            "/api/what-if",
            json={"scenario": "inflation", "baseAmount": 10000, "years": 30},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["scenarioTitle"], "Inflation stays high")

    def test_route_rejects_invalid_scenario(self):
        response = self.client.post("/api/what-if", json={"scenario": ""})

        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.get_json())

    @patch("services.what_if_service._run_what_if_route")
    def test_route_accepts_custom_scenario(self, mock_run):
        mock_run.return_value = {
            "scenarioTitle": "What if rent goes up 15%?",
            "explanation": "Higher fixed costs reduce flexibility.",
            "recommendedRebalance": "Increase cash planning and diversify.",
            "actionSteps": ["Step 1", "Step 2", "Step 3"],
            "noRebalance": {
                "label": "No Rebalance: less prepared",
                "yearOneShock": -0.08,
                "withdrawalYear": None,
                "withdrawalPct": None,
                "annualGrowthAfterShock": 0.05,
            },
            "rebalanced": {
                "label": "Rebalanced: more prepared",
                "yearOneShock": -0.04,
                "withdrawalYear": None,
                "withdrawalPct": None,
                "annualGrowthAfterShock": 0.06,
            },
            "disclaimer": "Educational estimate only, not financial advice.",
        }

        response = self.client.post(
            "/api/what-if",
            json={
                "scenario": "custom",
                "customScenario": "What if rent goes up 15%?",
                "baseAmount": 10000,
                "years": 30,
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["scenarioTitle"], "What if rent goes up 15%?")
