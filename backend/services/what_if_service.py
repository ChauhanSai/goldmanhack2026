from __future__ import annotations

from datetime import datetime, timedelta, timezone
import json
from pathlib import Path
import subprocess
from typing import Any


BASE_DIR = Path(__file__).resolve().parents[1]
SCRIPTS_DIR = BASE_DIR / "scripts"
RUN_WHAT_IF_SCRIPT = SCRIPTS_DIR / "runWhatIfScenario.js"
CACHE_TTL = timedelta(hours=1)

_what_if_cache: dict[str, dict[str, Any]] = {}


class WhatIfValidationError(ValueError):
    pass


class WhatIfProviderError(RuntimeError):
    pass


def validate_scenario(scenario: str) -> str:
    normalized = (scenario or "").strip()
    if not normalized:
        raise WhatIfValidationError("Invalid what-if scenario")
    return normalized


def _cache_key(
    scenario: str,
    base_amount: Any,
    years: Any,
    custom_prompt: Any,
    portfolio: Any,
) -> str:
    try:
        portfolio_key = json.dumps(portfolio, sort_keys=True)
    except TypeError:
        portfolio_key = str(portfolio)
    return f"{scenario}::{base_amount}::{years}::{custom_prompt}::{portfolio_key}"


def _cache_get(key: str) -> dict[str, Any] | None:
    cached = _what_if_cache.get(key)
    if not cached:
        return None
    if datetime.now(timezone.utc) - cached["cached_at"] >= CACHE_TTL:
        _what_if_cache.pop(key, None)
        return None
    return cached["data"]


def _cache_set(key: str, data: dict[str, Any]) -> None:
    _what_if_cache[key] = {
        "cached_at": datetime.now(timezone.utc),
        "data": data,
    }


def _run_what_if_route(
    scenario: str,
    base_amount: Any,
    years: Any,
    custom_prompt: Any = None,
    portfolio: Any = None,
) -> dict[str, Any]:
    try:
        result = subprocess.run(
            [
                "node",
                str(RUN_WHAT_IF_SCRIPT),
                scenario,
                str(base_amount if base_amount is not None else ""),
                str(years if years is not None else ""),
                str(custom_prompt if custom_prompt is not None else ""),
                json.dumps(portfolio if portfolio is not None else []),
            ],
            cwd=BASE_DIR,
            capture_output=True,
            text=True,
            timeout=25,
            check=False,
        )
    except subprocess.TimeoutExpired as exc:
        raise WhatIfProviderError("What-if scenario generation timed out.") from exc
    except OSError as exc:
        raise WhatIfProviderError("Node runtime is unavailable for what-if scenarios.") from exc

    if result.returncode != 0:
        raw_error = result.stderr.strip() or result.stdout.strip()
        if raw_error:
            try:
                payload = json.loads(raw_error)
                message = payload.get("error") or raw_error
            except json.JSONDecodeError:
                message = raw_error
        else:
            message = "What-if scenario generation failed."
        raise WhatIfProviderError(message)

    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError as exc:
        raise WhatIfProviderError("What-if scenario route returned invalid JSON.") from exc


def get_what_if_payload(
    scenario: str,
    base_amount: Any = None,
    years: Any = None,
    custom_scenario: Any = None,
    portfolio: Any = None,
) -> dict[str, Any]:
    normalized_scenario = validate_scenario(scenario)
    key = _cache_key(normalized_scenario, base_amount, years, custom_scenario, portfolio)
    cached = _cache_get(key)
    if cached:
        return cached

    payload = _run_what_if_route(
        normalized_scenario,
        base_amount,
        years,
        custom_scenario,
        portfolio,
    )
    _cache_set(key, payload)
    return payload
