"""Evidence verification service — validates and recovers quotes against original text."""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Optional

from app.schemas import Clause, Evidence, ValidationStats
from app.utils.text_utils import normalize_for_comparison

try:
    from rapidfuzz import fuzz, process as rfuzz_process
    _HAS_RAPIDFUZZ = True
except ImportError:
    _HAS_RAPIDFUZZ = False

from app.config import settings


@dataclass
class VerificationResult:
    evidence: list[Evidence] = field(default_factory=list)
    stats: ValidationStats = field(default_factory=ValidationStats)


def _sentence_split(text: str) -> list[str]:
    """Split text into approximate sentences."""
    return re.split(r"(?<=[.!?])\s+", text)


def _norm(text: str) -> str:
    return normalize_for_comparison(text)


def _find_quote_in_text(quote: str, text: str) -> Optional[tuple[int, int]]:
    """Find start/end offsets of quote in text (case-insensitive, quote/dash/whitespace resilient)."""
    q_stripped = quote.strip().strip("\"'“”‘’")
    if not q_stripped:
        return None

    # 1. Direct substring search
    pos = text.lower().find(q_stripped.lower())
    if pos != -1:
        return pos, pos + len(q_stripped)

    # 2. Resilient token-sequence search (resilient to curly quotes, dashes, whitespace)
    words = re.findall(r"\w+", q_stripped.lower())
    if not words:
        return None
    pattern = r"\b" + r"[\s\W_]+".join(re.escape(w) for w in words) + r"\b"
    m = re.search(pattern, text, re.IGNORECASE)
    if m:
        return m.start(), m.end()

    return None


def _fuzzy_recover(quote: str, clause_text: str, threshold: int) -> Optional[str]:
    """Try to recover a quote via fuzzy sentence matching. Returns the best matching sentence."""
    sentences = _sentence_split(clause_text)
    if not sentences:
        return None
    norm_q = _norm(quote)
    tokens_q = set(re.findall(r"\w+", norm_q))
    if not tokens_q:
        return None

    best_score = 0.0
    best_sentence = None
    for sent in sentences:
        norm_s = _norm(sent)
        if _HAS_RAPIDFUZZ:
            score = float(fuzz.partial_ratio(norm_q, norm_s))
        else:
            import difflib
            tokens_s = set(re.findall(r"\w+", norm_s))
            overlap = len(tokens_q & tokens_s) / max(len(tokens_q), 1) * 100.0
            matcher = difflib.SequenceMatcher(None, norm_q, norm_s)
            score = max(matcher.ratio() * 100.0, overlap)

        if score > best_score:
            best_score = score
            best_sentence = sent

    if best_score >= threshold and best_sentence:
        return best_sentence.strip()
    return None




def verify_quote(
    quote: str,
    clause_id: str,
    clauses_by_id: dict[str, Clause],
    stats: ValidationStats,
) -> Optional[Evidence]:
    """
    Verify a single quote against original clause text.
    Returns Evidence or None if unverifiable.
    """
    if not quote or not quote.strip():
        stats.items_dropped += 1
        return None

    # Cap quote at ~300 chars at a sentence boundary
    if len(quote) > 300:
        quote = quote[:300].rsplit(".", 1)[0] + "."

    clause = clauses_by_id.get(clause_id)

    # Step 1: exact match in cited clause
    if clause:
        result = _find_quote_in_text(quote, clause.text)
        if result:
            start, end = result
            actual_start = clause.start + start
            actual_end = clause.start + end
            stats.quotes_verified += 1
            return Evidence(
                clause_id=clause.id,
                clause_label=clause.label,
                quote=clause.text[start:end],
                start=actual_start,
                end=actual_end,
            )

    # Step 2: exact match in a different clause
    for cid, c in clauses_by_id.items():
        if cid == clause_id:
            continue
        result = _find_quote_in_text(quote, c.text)
        if result:
            start, end = result
            actual_start = c.start + start
            actual_end = c.start + end
            stats.quotes_verified += 1
            return Evidence(
                clause_id=c.id,
                clause_label=c.label,
                quote=c.text[start:end],
                start=actual_start,
                end=actual_end,
            )

    # Step 3: fuzzy match in cited clause
    if clause:
        recovered = _fuzzy_recover(quote, clause.text, settings.fuzzy_quote_threshold)
        if recovered:
            result = _find_quote_in_text(recovered, clause.text)
            if result:
                start, end = result
                actual_start = clause.start + start
                actual_end = clause.start + end
                stats.quotes_recovered += 1
                return Evidence(
                    clause_id=clause.id,
                    clause_label=clause.label,
                    quote=clause.text[start:end],
                    start=actual_start,
                    end=actual_end,
                )

    stats.items_dropped += 1
    return None


def verify_quotes_list(
    quotes: list[str],
    clause_ids: list[str],
    clauses_by_id: dict[str, Clause],
    stats: ValidationStats,
) -> list[Evidence]:
    """Verify a list of quotes for an item that may span multiple clauses."""
    evidence: list[Evidence] = []
    # Pair quotes with clause_ids (zip in order; extras use first clause_id)
    for i, quote in enumerate(quotes):
        cid = clause_ids[i] if i < len(clause_ids) else (clause_ids[0] if clause_ids else "")
        ev = verify_quote(quote, cid, clauses_by_id, stats)
        if ev and not any(e.quote == ev.quote for e in evidence):
            evidence.append(ev)
    return evidence
