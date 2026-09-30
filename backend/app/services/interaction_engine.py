"""Interaction engine — builds Interaction objects from detected patterns."""
from __future__ import annotations

import hashlib
from typing import Optional

from app.schemas import (
    Clause,
    ChainStep,
    Calculation,
    ExposurePoint,
    Evidence,
    Interaction,
    LLMOutput,
    ValidationStats,
)
from app.services.evidence_validator import verify_quote
from app.services.guardrail_service import check_field

# ---------------------------------------------------------------------------
# Deterministic templates (fallbacks when LLM doesn't provide explanation)
# ---------------------------------------------------------------------------

_TEMPLATES = {
    "early_exit": {
        "title": "Early Exit",
        "explanation": (
            "These clauses relate to each other and may affect when, and at what cost, "
            "you can leave. Worth clarifying how they work together."
        ),
        "question": (
            "If I need to leave before the lock-in ends, what exact amount would I owe, "
            "and how does the notice period apply?"
        ),
        "needs_professional": False,
    },
    "deposit_return": {
        "title": "Deposit Return",
        "explanation": (
            "The agreement covers deductions from the deposit but may not say when it is "
            "returned or how the flat's condition is checked. Worth clarifying."
        ),
        "question": (
            "Within how many days will the deposit be returned after I vacate, and how "
            "will deductions be itemised and agreed?"
        ),
        "needs_professional": False,
    },
    "rent_growth": {
        "title": "Rent Growth",
        "explanation": (
            "The agreement addresses rent increases together with renewal. Worth clarifying "
            "what the rent would be after renewal."
        ),
        "question": (
            "What will the rent be after renewal, and how is any increase decided?"
        ),
        "needs_professional": False,
    },
    "repair_burden": {
        "title": "Repair Burden",
        "explanation": (
            "Repairs and damage responsibility appear together. Worth clarifying which "
            "repairs the tenant pays for and which the landlord does."
        ),
        "question": (
            "Which repairs are my responsibility, which are yours, and is there a cost limit?"
        ),
        "needs_professional": False,
    },
    "entry_privacy": {
        "title": "Entry & Privacy",
        "explanation": (
            "The agreement allows the landlord to enter the premises but does not clearly "
            "specify notice or permission. Worth clarifying."
        ),
        "question": (
            "Can we agree that entry happens only with advance notice and at a convenient "
            "time, except in emergencies?"
        ),
        "needs_professional": False,
    },
}

# Chain step definitions per pattern
_CHAIN_DEFS = {
    "early_exit": [
        ("lock_in", "Lock-in period"),
        ("notice", "Notice period"),
        ("early_termination", "Early termination clause"),
        ("penalty", "Penalty or cost"),
    ],
    "deposit_return": [
        ("deposit", "Security deposit"),
        ("deductions", "Deposit deductions"),
        ("refund", "Deposit refund"),
        ("inspection", "Move-out inspection"),
    ],
    "rent_growth": [
        ("escalation", "Rent escalation"),
        ("renewal", "Renewal terms"),
    ],
    "repair_burden": [
        ("repairs", "Repairs"),
        ("damage_liability", "Damage liability"),
    ],
    "entry_privacy": [
        ("entry", "Landlord entry"),
        ("entry_notice_or_permission", "Notice / permission"),
    ],
}


def _stable_id(pattern: str, clause_ids: list[str]) -> str:
    key = pattern + ":" + ":".join(sorted(clause_ids))
    return hashlib.sha256(key.encode()).hexdigest()[:12]


def build_interaction(
    pattern_info: dict,
    clauses_by_id: dict[str, Clause],
    llm_output: LLMOutput,
    stats: ValidationStats,
    calculation: Optional[Calculation] = None,
) -> Interaction:
    pattern = pattern_info["pattern"]
    clause_ids = pattern_info["clause_ids"]
    tag_index = pattern_info.get("tag_index", {})
    tmpl = _TEMPLATES[pattern]

    # Get explanation/question from LLM interactions if available
    explanation = tmpl["explanation"]
    question = tmpl["question"]
    for llm_int in llm_output.interactions:
        if llm_int.pattern == pattern:
            if llm_int.explanation:
                checked = check_field(llm_int.explanation, "explanation", stats)
                explanation = checked
            if llm_int.question:
                checked = check_field(llm_int.question, "question", stats)
                question = checked
            break

    # Build chain steps
    chain_defs = _CHAIN_DEFS.get(pattern, [])
    chain: list[ChainStep] = []
    for step_key, step_label in chain_defs:
        step_clause_ids = [cid for cid in tag_index.get(step_key, []) if cid in clause_ids or step_key in ("entry_notice_or_permission",)]
        status: str = "found" if step_clause_ids else "not_specified"
        chain.append(ChainStep(
            step=step_key,  # type: ignore[arg-type]
            label=step_label,
            status=status,  # type: ignore[arg-type]
            clause_ids=step_clause_ids,
        ))

    # Gather evidence from clause_ids
    evidence: list[Evidence] = []
    for cid in clause_ids[:4]:  # cap at 4 to avoid redundancy
        clause = clauses_by_id.get(cid)
        if not clause:
            continue
        # Use first sentence of clause as evidence quote
        first_sentence = clause.text.split(".")[0].strip() + "."
        if len(first_sentence) > 300:
            first_sentence = first_sentence[:297] + "..."
        ev = verify_quote(first_sentence, cid, clauses_by_id, stats)
        if ev and not any(e.clause_id == ev.clause_id for e in evidence):
            evidence.append(ev)

    iid = _stable_id(pattern, clause_ids)

    return Interaction(
        id=iid,
        pattern=pattern,  # type: ignore[arg-type]
        title=tmpl["title"],
        chain=chain,
        evidence=evidence,
        explanation=explanation,
        question=question,
        needs_professional=tmpl["needs_professional"],
        calculation=calculation,
    )
