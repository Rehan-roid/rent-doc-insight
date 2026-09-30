"""Guardrail validation — scans model-written fields for restricted language."""
from __future__ import annotations

import re
from typing import Optional

# ---------------------------------------------------------------------------
# Restricted word/phrase list (word-boundary, case-insensitive)
# These must never appear in model-written output (outside verbatim quotes).
# ---------------------------------------------------------------------------

_RESTRICTED_PATTERNS = [
    r"\billegal\b",
    r"\bunlawful\b",
    r"\bvoid\b",
    r"\binvalid\b",
    r"\benforceable\b",
    r"\bunenforceable\b",
    r"\bdefinitely\b",
    r"\brisky\b",
    r"\btrap\b",
    r"\bscam\b",
    r"\bred flag\b",
    r"\bdangerous\b",
    r"\bagainst the law\b",
    r"\bviolates\b",
    r"\byou should sign\b",
    r"\byou should not sign\b",
    r"\bstandard\b",
    r"\bnormal\b",
    r"\busual\b",
    r"\busually\b",
    r"\bmarket rate\b",
    # Additional legal-conclusion phrases
    r"\bnot allowed by law\b",
    r"\bcannot legally\b",
    r"\bthis is not allowed\b",
]

_COMPILED = [re.compile(p, re.IGNORECASE) for p in _RESTRICTED_PATTERNS]

# ---------------------------------------------------------------------------
# Neutral replacement templates
# ---------------------------------------------------------------------------

_PLAIN_ENGLISH_TEMPLATE = "This clause is worth reading carefully. The original text is shown below."
_TENANT_IMPACT_TEMPLATE = "The practical impact may be worth clarifying with the landlord."
_QUESTION_TEMPLATE = "Could you clarify what this clause means in practice?"
_EXPLANATION_TEMPLATE = "These clauses may be worth reviewing together. Worth clarifying how they interact."
_DESCRIPTION_TEMPLATE = "The agreement contains a point worth clarifying with the landlord."


def _contains_restricted(text: str) -> bool:
    return any(p.search(text) for p in _COMPILED)


def check_field(text: str, field_type: str, stats_container: object) -> str:
    """
    Check a model-written field for restricted language.
    On violation, replaces the entire field with a neutral template and increments
    stats_container.guardrail_replacements.
    field_type: 'plain_english' | 'tenant_impact' | 'question' | 'explanation' | 'description' | 'other'
    """
    if not _contains_restricted(text):
        return text

    # Increment replacements
    if hasattr(stats_container, "guardrail_replacements"):
        stats_container.guardrail_replacements += 1

    templates = {
        "plain_english": _PLAIN_ENGLISH_TEMPLATE,
        "tenant_impact": _TENANT_IMPACT_TEMPLATE,
        "question": _QUESTION_TEMPLATE,
        "explanation": _EXPLANATION_TEMPLATE,
        "description": _DESCRIPTION_TEMPLATE,
    }
    return templates.get(field_type, _PLAIN_ENGLISH_TEMPLATE)


def check_text(text: str) -> bool:
    """Return True if text contains restricted language, False if clean."""
    return _contains_restricted(text)
