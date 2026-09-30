"""Personalization service — re-orders findings and produces context notes deterministically."""
from __future__ import annotations

from typing import Optional

from app.schemas import (
    ContextNote,
    Finding,
    KeyTerm,
    UserContext,
)

PRIORITY_TAG_MAP: dict[str, set[str]] = {
    "flexibility": {"lock_in", "early_termination", "notice", "penalty"},
    "deposit": {"deposit", "deductions", "refund", "inspection"},
    "monthly_cost": {"rent_payment", "escalation", "utilities", "late_penalty"},
    "repairs": {"repairs", "maintenance", "damage_liability"},
}

LABEL_ORDER: dict[str, int] = {
    "discuss": 0,
    "clarify": 1,
    "confirm": 2,
    "understood": 3,
}


def personalize_findings(
    findings: list[Finding],
    clause_tags_map: dict[str, set[str]],
    context: Optional[UserContext] = None,
) -> tuple[list[Finding], list[ContextNote]]:
    """Deterministically order findings and produce context notes based on user context.

    Personalization NEVER changes legal meaning, hides findings, or modifies labels.
    """
    if not findings:
        return [], []

    context_notes: list[ContextNote] = []

    if not context or (not context.priority and not context.expected_stay and not context.role):
        # Default order: by label severity (discuss -> clarify -> confirm -> understood), then original index
        sorted_findings = sorted(
            findings,
            key=lambda f: (LABEL_ORDER.get(f.label, 99)),
        )
        return sorted_findings, []

    # Build context notes
    priority_tags: set[str] = set()
    if context.priority:
        priority_tags = PRIORITY_TAG_MAP.get(context.priority, set())
        context_notes.append(
            ContextNote(
                text=f"Because you selected {context.priority.replace('_', ' ')} as your priority, related terms are highlighted first.",
                clause_ids=[],
            )
        )

    if context.expected_stay == "under_6_months":
        context_notes.append(
            ContextNote(
                text="You selected a stay under 6 months. Worth confirming how early exit and notice periods work if you need to leave early.",
                clause_ids=[],
            )
        )
    elif context.expected_stay == "6_to_12_months":
        context_notes.append(
            ContextNote(
                text="You selected a 6–12 month stay. Worth checking renewal terms and whether lock-in periods align with your schedule.",
                clause_ids=[],
            )
        )

    if context.role == "student":
        context_notes.append(
            ContextNote(
                text="For students, deposit deductions and sudden lock-in penalties are common pain points. Double-check refund timelines.",
                clause_ids=[],
            )
        )

    # Score each finding based on priority match and label severity
    def score_finding(f: Finding) -> tuple[int, int]:
        # Priority match: -1 if any evidence clause has a matching tag, 0 otherwise
        matches_priority = 0
        if priority_tags:
            for ev in f.evidence:
                c_tags = clause_tags_map.get(ev.clause_id, set())
                if c_tags & priority_tags:
                    matches_priority = -1
                    break
        label_score = LABEL_ORDER.get(f.label, 99)
        return (matches_priority, label_score)

    sorted_findings = sorted(findings, key=score_finding)
    return sorted_findings, context_notes
