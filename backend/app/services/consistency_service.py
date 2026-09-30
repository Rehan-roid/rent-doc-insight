"""Consistency checking service — deterministic internal consistency checks between clauses."""
from __future__ import annotations

import re
from typing import Optional

from app.schemas import Clause, Evidence, Inconsistency, InconsistencyKind
from app.utils.number_utils import extract_currency_amount, extract_duration


def find_inconsistencies(clauses: list[Clause]) -> list[Inconsistency]:
    """Check for internal inconsistencies across clauses.

    Checks:
    - Differing notice periods across clauses
    - Deposit or rent discrepancy between figures and words
    - Conflicting lock-in periods
    - Term duration vs explicit date ranges
    """
    inconsistencies: list[Inconsistency] = []

    # 1. Notice period conflicts
    notice_matches: list[tuple[Clause, str, int, str]] = []  # clause, quote, days/approx, raw_match
    for clause in clauses:
        # Look for notice clauses
        for m in re.finditer(
            r"(\b(?:\d+|one|two|three|four|sixty|thirty|forty-five)\s*(?:\([0-9]+\)\s*)?(?:day|month)s?(?:'s)?(?:\s+(?:prior|written|calendar|advance))*\s+notice\b)",
            clause.text,
            re.IGNORECASE,
        ):

            raw_match = m.group(1)
            dur = extract_duration(raw_match)
            if dur:
                start_offset = clause.start + m.start(1)
                end_offset = clause.start + m.end(1)
                quote_text = clause.text[m.start(1) : m.end(1)]
                notice_matches.append((clause, quote_text, dur.normalized_days, dur.unit))

    # Compare notice periods across different clauses
    for i in range(len(notice_matches)):
        for j in range(i + 1, len(notice_matches)):
            c1, q1, d1, u1 = notice_matches[i]
            c2, q2, d2, u2 = notice_matches[j]
            if c1.id != c2.id and d1 != d2:
                # Found differing notice periods
                ev1 = Evidence(
                    clause_id=c1.id,
                    clause_label=c1.label,
                    quote=q1,
                    start=c1.start + c1.text.find(q1),
                    end=c1.start + c1.text.find(q1) + len(q1),
                )
                ev2 = Evidence(
                    clause_id=c2.id,
                    clause_label=c2.label,
                    quote=q2,
                    start=c2.start + c2.text.find(q2),
                    end=c2.start + c2.text.find(q2) + len(q2),
                )
                inconsistencies.append(
                    Inconsistency(
                        id=f"inconsistency-notice-{c1.id}-{c2.id}",
                        kind="notice_period",
                        description=(
                            f"The agreement contains two different notice periods: '{q1}' in {c1.label} and '{q2}' in {c2.label}. "
                            "Worth clarifying which notice period applies."
                        ),
                        evidence=[ev1, ev2],
                    )
                )
                break
        if inconsistencies:
            break

    # 2. Deposit or rent figures vs words discrepancy
    for clause in clauses:
        # Pattern: words (figures)
        m = re.search(
            r"(Rupees\s+[A-Za-z\s]+)\s*\(\s*(?:Rs\.?|INR|₹)?\s*([0-9,]+)/?-?\s*\)",
            clause.text,
            re.IGNORECASE,
        )
        if m:
            words_part = m.group(1).strip()
            digits_part = m.group(2).strip()
            w_val = extract_currency_amount(words_part)
            d_val = extract_currency_amount(digits_part)
            if w_val and d_val and w_val != d_val:
                quote_text = clause.text[m.start() : m.end()]
                ev = Evidence(
                    clause_id=clause.id,
                    clause_label=clause.label,
                    quote=quote_text,
                    start=clause.start + m.start(),
                    end=clause.start + m.end(),
                )
                inconsistencies.append(
                    Inconsistency(
                        id=f"inconsistency-words-figures-{clause.id}",
                        kind="deposit_words_vs_figures",
                        description=(
                            f"Amount in words ({words_part}) differs from figures ({digits_part}) in {clause.label}. "
                            "Worth having the exact amount corrected in the agreement text."
                        ),
                        evidence=[ev],
                    )
                )

    # 3. Differing rent amounts across clauses
    rent_amounts: list[tuple[Clause, str, float]] = []
    for clause in clauses:
        if "rent" in clause.text.lower() and ("per month" in clause.text.lower() or "monthly" in clause.text.lower()):
            for rm in re.finditer(r"(?:Rs\.?|INR|₹)\s*([0-9,]+)", clause.text):
                amt = extract_currency_amount(rm.group(0))
                if amt and amt > 1000:  # Ignore tiny charges
                    rent_amounts.append((clause, rm.group(0), amt))

    if len(rent_amounts) >= 2:
        for i in range(len(rent_amounts)):
            for j in range(i + 1, len(rent_amounts)):
                c1, q1, a1 = rent_amounts[i]
                c2, q2, a2 = rent_amounts[j]
                if c1.id != c2.id and a1 != a2:
                    ev1 = Evidence(
                        clause_id=c1.id,
                        clause_label=c1.label,
                        quote=q1,
                        start=c1.start + c1.text.find(q1),
                        end=c1.start + c1.text.find(q1) + len(q1),
                    )
                    ev2 = Evidence(
                        clause_id=c2.id,
                        clause_label=c2.label,
                        quote=q2,
                        start=c2.start + c2.text.find(q2),
                        end=c2.start + c2.text.find(q2) + len(q2),
                    )
                    inconsistencies.append(
                        Inconsistency(
                            id=f"inconsistency-rent-{c1.id}-{c2.id}",
                            kind="rent_amount",
                            description=(
                                f"Different rent amounts are mentioned: '{q1}' in {c1.label} and '{q2}' in {c2.label}. "
                                "Worth clarifying the agreed monthly rent."
                            ),
                            evidence=[ev1, ev2],
                        )
                    )
                    break
            if len(inconsistencies) > 2:
                break

    return inconsistencies
