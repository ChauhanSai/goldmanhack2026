from flask import Blueprint, jsonify

from services.ecosystem_risk_service import (
    EcosystemRiskValidationError,
    get_ecosystem_risk,
    get_supply_chain_payload,
)


ecosystem_risk_bp = Blueprint("ecosystem_risk", __name__)


@ecosystem_risk_bp.get("/api/ecosystem-risk/<ticker>")
def ecosystem_risk(ticker: str):
    try:
        return jsonify(get_ecosystem_risk(ticker))
    except EcosystemRiskValidationError as exc:
        return jsonify({"error": str(exc)}), 400


@ecosystem_risk_bp.get("/api/supply-chain/<symbol>")
def supply_chain(symbol: str):
    try:
        return jsonify(get_supply_chain_payload(symbol))
    except EcosystemRiskValidationError as exc:
        return jsonify({"error": str(exc)}), 400
