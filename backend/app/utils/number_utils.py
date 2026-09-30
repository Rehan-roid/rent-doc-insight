"""Number, currency, and duration parsing utilities."""
from __future__ import annotations

import re
from typing import Optional


# ---------------------------------------------------------------------------
# Indian number word mapping
# ---------------------------------------------------------------------------
_WORD_UNITS: dict[str, int] = {
    "zero": 0, "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
    "eleven": 11, "twelve": 12, "thirteen": 13, "fourteen": 14, "fifteen": 15,
    "sixteen": 16, "seventeen": 17, "eighteen": 18, "nineteen": 19,
    "twenty": 20, "thirty": 30, "forty": 40, "fifty": 50,
    "sixty": 60, "seventy": 70, "eighty": 80, "ninety": 90,
}
_WORD_SCALES: dict[str, int] = {
    "hundred": 100, "thousand": 1000,
    "lakh": 100_000, "lakhs": 100_000,
    "crore": 10_000_000, "crores": 10_000_000,
}

_AMOUNT_RE = re.compile(
    r"(?:₹|Rs\.?|INR)\s*"
    r"([\d,]+(?:\.\d+)?)"
    r"(?:\s*/-)?",
    re.IGNORECASE,
)

_LAKH_RE = re.compile(
    r"([\d.]+)\s+lakh(?:s)?",
    re.IGNORECASE,
)

_CRORE_RE = re.compile(
    r"([\d.]+)\s+crore(?:s)?",
    re.IGNORECASE,
)

_DURATION_RE = re.compile(
    r"(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve"
    r"|sixty|thirty|ninety)\s*"
    r"(?:\((\d+)\)\s*)?"
    r"(month(?:s)?(?:'?s?)?|day(?:s)?|year(?:s)?|week(?:s)?)",
    re.IGNORECASE,
)

_PERCENT_RE = re.compile(
    r"(\d+(?:\.\d+)?)\s*(?:%|per\s*cent|percent)",
    re.IGNORECASE,
)

_WORD_AMOUNT_RE = re.compile(
    r"(?:rupees?\s+)?"
    r"((?:(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve"
    r"|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty"
    r"|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|lakh|lakhs|crore|crores"
    r")\s+)+(?:(?:thousand|lakh|lakhs|crore|crores|hundred)\s*)?)"
    r"(?=(?:rupees?|only|and|\(|$|\.))",
    re.IGNORECASE,
)


def _parse_word_number(text: str) -> Optional[int]:
    """Parse English number words into an integer."""
    tokens = text.lower().split()
    total = 0
    current = 0
    for token in tokens:
        if token in _WORD_UNITS:
            current += _WORD_UNITS[token]
        elif token in _WORD_SCALES:
            scale = _WORD_SCALES[token]
            if scale >= 100_000:
                total += (current or 1) * scale
                current = 0
            elif scale == 1000:
                current *= scale
            elif scale == 100:
                current *= scale
    total += current
    return total if total > 0 else None


def parse_amount(text: str) -> Optional[float]:
    """Extract first currency amount from text. Returns float or None."""
    # Check for 1.5 lakh / 2 crore
    m = _LAKH_RE.search(text)
    if m:
        return float(m.group(1)) * 100_000

    m = _CRORE_RE.search(text)
    if m:
        return float(m.group(1)) * 10_000_000

    # ₹/Rs/INR + digits
    m = _AMOUNT_RE.search(text)
    if m:
        return float(m.group(1).replace(",", ""))

    # Words in brackets: "Fifty Thousand (50,000)" — prefer figures
    bracket = re.search(r"\((\d[\d,]*)\)", text)
    if bracket:
        return float(bracket.group(1).replace(",", ""))

    # Pure digit (must be at least 3 digits to avoid noise)
    digits = re.search(r"\b(\d{3,}[\d,]*)\b", text)
    if digits:
        return float(digits.group(1).replace(",", ""))

    # Word amounts
    m = _WORD_AMOUNT_RE.search(text)
    if m:
        val = _parse_word_number(m.group(1))
        if val:
            return float(val)

    return None


def parse_duration(text: str) -> Optional[dict]:
    """Return {'value': int, 'unit': 'months'|'days'|'years'} or None."""
    m = _DURATION_RE.search(text)
    if not m:
        return None
    raw_val = m.group(1).lower()
    explicit_digits = m.group(2)
    unit_raw = m.group(3).lower()

    if explicit_digits:
        value = int(explicit_digits)
    elif raw_val.isdigit():
        value = int(raw_val)
    else:
        val = _WORD_UNITS.get(raw_val)
        if val is None:
            return None
        value = val

    if "month" in unit_raw:
        unit = "months"
    elif "day" in unit_raw:
        unit = "days"
    elif "year" in unit_raw:
        unit = "years"
    elif "week" in unit_raw:
        unit = "weeks"
    else:
        return None

    return {"value": value, "unit": unit}


def parse_percent(text: str) -> Optional[float]:
    """Return percentage as float (e.g. 5.0) or None."""
    m = _PERCENT_RE.search(text)
    return float(m.group(1)) if m else None


def format_inr(amount: int) -> str:
    """Format integer rupees using Indian grouping: ₹1,80,000."""
    s = str(abs(amount))
    if len(s) <= 3:
        result = s
    else:
        # Last 3 digits, then groups of 2
        result = s[-3:]
        s = s[:-3]
        while s:
            result = s[-2:] + "," + result
            s = s[:-2]
    return f"₹{result}"


# Convenient aliases and structured duration helper
extract_currency_amount = parse_amount
extract_percent = parse_percent


class ParsedDuration:
    __slots__ = ("value", "unit", "normalized_days")

    def __init__(self, value: int, unit: str, normalized_days: int):
        self.value = value
        self.unit = unit
        self.normalized_days = normalized_days


def extract_duration(text: str) -> Optional[ParsedDuration]:
    """Parse duration and calculate normalized days for comparison."""
    res = parse_duration(text)
    if not res:
        return None
    val = res["value"]
    unit = res["unit"]
    if "month" in unit:
        norm_days = val * 30
    elif "year" in unit:
        norm_days = val * 365
    elif "week" in unit:
        norm_days = val * 7
    else:
        norm_days = val
    return ParsedDuration(value=val, unit=unit, normalized_days=norm_days)

