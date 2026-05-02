from flask import Blueprint, jsonify, request

from services.what_if_service import (
    WhatIfProviderError,
    WhatIfValidationError,
    get_what_if_payload,
)


what_if_bp = Blueprint("what_if", __name__)


@what_if_bp.post("/api/what-if")
def what_if():
    try:
        data = request.get_json(silent=True) or {}
        payload = get_what_if_payload(
            data.get("scenario"),
            data.get("baseAmount"),
            data.get("years"),
            data.get("customScenario"),
            data.get("portfolio"),
        )
        return jsonify(payload)
    except (WhatIfValidationError, WhatIfProviderError) as exc:
        return jsonify({"error": str(exc)}), 400
