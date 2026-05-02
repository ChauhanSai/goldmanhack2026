from __future__ import annotations

from datetime import datetime, timedelta, timezone
import json
from pathlib import Path
import re
import subprocess
from typing import Any


BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"
SCRIPTS_DIR = BASE_DIR / "scripts"
RUN_GEMINI_SCRIPT = SCRIPTS_DIR / "runGeminiSupplyChain.js"
FALLBACK_FILE = DATA_DIR / "supply_chain_fallback.json"
CACHE_TTL = timedelta(hours=12)
INPUT_TICKER_PATTERN = re.compile(r"^[A-Z0-9.-]{1,12}$")

_ecosystem_cache: dict[str, dict[str, Any]] = {}
_fallback_cache: dict[str, Any] | None = None


class EcosystemRiskValidationError(ValueError):
    pass


class ProviderExecutionError(RuntimeError):
    pass


def validate_ticker(ticker: str) -> str:
    normalized = (ticker or "").strip().upper()
    if not normalized:
        raise EcosystemRiskValidationError("Ticker is required.")
    if not INPUT_TICKER_PATTERN.fullmatch(normalized):
        raise EcosystemRiskValidationError("Invalid ticker symbol")
    return normalized


def _cache_get(ticker: str) -> dict[str, Any] | None:
    cached = _ecosystem_cache.get(ticker)
    if not cached:
        return None
    if datetime.now(timezone.utc) - cached["cached_at"] >= CACHE_TTL:
        _ecosystem_cache.pop(ticker, None)
        return None
    return cached["data"]


def _cache_set(ticker: str, data: dict[str, Any]) -> None:
    _ecosystem_cache[ticker] = {
        "cached_at": datetime.now(timezone.utc),
        "data": data,
    }


def _load_fallback_data() -> dict[str, Any]:
    global _fallback_cache
    if _fallback_cache is None:
        _fallback_cache = json.loads(FALLBACK_FILE.read_text(encoding="utf-8"))
    return _fallback_cache


def _build_fallback_payload(ticker: str, warnings: list[str]) -> dict[str, Any]:
    fallback_data = _load_fallback_data().get(ticker)
    if fallback_data:
        return {
            "symbol": ticker,
            "source": "fallback",
            **fallback_data,
            "warnings": warnings or ["Using fallback relationship data."],
            "methodology": [
                "Used local fallback relationship estimates because Gemini was unavailable or invalid.",
            ],
        }

    return {
        "symbol": ticker,
        "source": "empty",
        "suppliers": [],
        "customers": [],
        "competitors": [],
        "ecosystem": [],
        "warnings": warnings or ["No relationship data found."],
        "methodology": [],
    }


def _run_gemini_route(ticker: str) -> dict[str, Any]:
    try:
        result = subprocess.run(
            ["node", str(RUN_GEMINI_SCRIPT), ticker],
            cwd=BASE_DIR,
            capture_output=True,
            text=True,
            timeout=25,
            check=False,
        )
    except subprocess.TimeoutExpired as exc:
        raise ProviderExecutionError("Gemini supply-chain route timed out.") from exc
    except OSError as exc:
        raise ProviderExecutionError("Node runtime is unavailable for Gemini supply-chain extraction.") from exc

    if result.returncode != 0:
        raw_error = result.stderr.strip() or result.stdout.strip()
        if raw_error:
            try:
                payload = json.loads(raw_error)
                message = payload.get("error") or raw_error
            except json.JSONDecodeError:
                message = raw_error
        else:
            message = "Gemini supply-chain route failed."
        raise ProviderExecutionError(message)

    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError as exc:
        raise ProviderExecutionError("Gemini supply-chain route returned invalid JSON.") from exc


def get_supply_chain_payload(ticker: str) -> dict[str, Any]:
    normalized_ticker = validate_ticker(ticker)
    cached = _cache_get(normalized_ticker)
    if cached:
        return cached

    try:
        payload = _run_gemini_route(normalized_ticker)
    except ProviderExecutionError as exc:
        payload = _build_fallback_payload(
            normalized_ticker,
            [
                f"Gemini failed: {exc}",
                "Using fallback relationship data.",
            ],
        )

    if not payload.get("symbol"):
        payload["symbol"] = normalized_ticker

    _cache_set(normalized_ticker, payload)
    return payload


def get_ecosystem_risk(ticker: str) -> dict[str, Any]:
    return get_supply_chain_payload(ticker)
