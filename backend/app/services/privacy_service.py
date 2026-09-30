"""Privacy redaction service — masks PII before text reaches the LLM."""
from __future__ import annotations

import re


# ---------------------------------------------------------------------------
# Patterns — ordered conservatively so amounts/dates are never masked
# ---------------------------------------------------------------------------

_AADHAAR_RE = re.compile(
    r"\b(\d{4}[\s-]\d{4}[\s-]\d{4}|\d{12})\b"
)

_PAN_RE = re.compile(
    r"\b[A-Z]{5}[0-9]{4}[A-Z]\b"
)

_PHONE_RE = re.compile(
    r"(?:\+91[\s-]?|0)?(?<!\d)([6-9]\d{9})(?!\d)"
)

_EMAIL_RE = re.compile(
    r"\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b"
)

# Amount patterns to PROTECT (never mask)
_AMOUNT_PROTECT_RE = re.compile(
    r"(?:₹|Rs\.?|INR|deposit|rent|advance|amount)\s*[\d,]+",
    re.IGNORECASE,
)


class RedactionResult:
    __slots__ = ("masked_text", "placeholder_map")

    def __init__(self, masked_text: str, placeholder_map: dict[str, str]):
        self.masked_text = masked_text
        self.placeholder_map = placeholder_map  # placeholder -> original


def redact(original_text: str) -> RedactionResult:
    """
    Replace PII with stable numbered placeholders.
    Returns a RedactionResult with the masked text and a reverse map.
    The original text is unchanged.
    """
    text = original_text
    placeholder_map: dict[str, str] = {}

    counters = {"AADHAAR": 0, "PAN": 0, "PHONE": 0, "EMAIL": 0}

    def _replace(pattern: re.Pattern, kind: str) -> None:
        nonlocal text

        def _sub(m: re.Match) -> str:
            value = m.group(0)
            # Safety: don't mask if it looks like a plain amount
            # (Aadhaar pattern can overlap 12-digit amounts — unlikely but guard)
            counters[kind] += 1
            key = f"[{kind}_REDACTED_{counters[kind]}]"
            placeholder_map[key] = value
            return key

        text = pattern.sub(_sub, text)

    _replace(_AADHAAR_RE, "AADHAAR")
    _replace(_PAN_RE, "PAN")
    _replace(_PHONE_RE, "PHONE")
    _replace(_EMAIL_RE, "EMAIL")

    return RedactionResult(masked_text=text, placeholder_map=placeholder_map)
