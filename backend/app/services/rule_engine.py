"""Rule engine — keyword tagging, missing-item detection, interaction patterns."""
from __future__ import annotations

import re
from typing import Any

from app.schemas import Clause, LLMOutput, TAGS

# ---------------------------------------------------------------------------
# Keyword tagging patterns
# ---------------------------------------------------------------------------

_TAG_PATTERNS: list[tuple[str, re.Pattern]] = [
    ("rent_payment", re.compile(r"monthly rent|rent of|rent shall be|pay(?:s)?.{0,20}rent", re.I)),
    ("term", re.compile(r"\bterm\b|period of (?:license|lease|tenancy)|commenc", re.I)),
    ("lock_in", re.compile(r"lock[\s-]?in", re.I)),
    ("notice", re.compile(r"\bnotice\b", re.I)),
    ("early_termination", re.compile(r"early.{0,5}terminat|terminat\w* the (?:agreement|licen[cs]e|lease) (?:before|prior)|premature|vacat\w* (?:before|during)", re.I)),
    ("penalty", re.compile(r"penalt|forfeit|liquidated|balance (?:rent|of the)|remaining (?:rent|period|lock)", re.I)),
    ("deposit", re.compile(r"security deposit|\bdeposit\b|refundable advance", re.I)),
    ("deductions", re.compile(r"deduct|adjust(?:ed)? against|appropriat|set[\s-]?off", re.I)),
    ("refund", re.compile(r"refund|return(?:ed)? (?:of )?(?:the )?(?:security )?deposit", re.I)),
    ("inspection", re.compile(r"inspect|walk[\s-]?through|handover checklist|joint (?:survey|check)", re.I)),
    ("condition_inventory", re.compile(r"inventory|fixtures|fittings|condition of the (?:premises|flat|room)|photograph", re.I)),
    ("repairs", re.compile(r"repair|maintenance|upkeep|servicing", re.I)),
    ("maintenance", re.compile(r"maintenance|upkeep|servicing", re.I)),
    ("damage_liability", re.compile(r"damage|loss|wear and tear|replacement", re.I)),
    ("escalation", re.compile(r"escalat|increase|hike|enhance|\d+\s?%", re.I)),
    ("renewal", re.compile(r"renew|extension|extend", re.I)),
    ("entry", re.compile(r"\benter\b|\binspect\w*|access to the premises|visit", re.I)),
    ("entry_notice_or_permission", re.compile(r"prior notice|advance notice|reasonable notice|permission|consent|appointment|24 hours|\d+ hours", re.I)),
    ("late_penalty", re.compile(r"(?:late|delay)\w*.{0,60}(?:fee|penalt|interest|charge)", re.I)),
    ("utilities", re.compile(r"electricity|water|gas|internet|wi[\s-]?fi|society|maintenance charges", re.I)),
    ("sublet", re.compile(r"sub[\s-]?let|sub[\s-]?leas|assign|transfer", re.I)),
    ("unilateral_change", re.compile(r"(?:landlord|licensor|owner).{0,80}(?:modify|change|revise|amend).{0,60}(?:rent|rule|charge|term)", re.I)),
    ("registration", re.compile(r"registrat|registered", re.I)),
    ("stamp_duty", re.compile(r"stamp duty|stamp paper|notari", re.I)),
    ("jurisdiction", re.compile(r"jurisdiction|courts? (?:at|of|in)", re.I)),
    ("arbitration", re.compile(r"arbitrat", re.I)),
    ("indemnity", re.compile(r"indemnif|hold harmless", re.I)),
    ("waiver", re.compile(r"waive|waiver|relinquish", re.I)),
]


def keyword_tags(text: str) -> set[str]:
    """Return set of TAGS matched in text by keyword patterns."""
    matched: set[str] = set()
    for tag, pattern in _TAG_PATTERNS:
        if pattern.search(text):
            matched.add(tag)
    return matched


def merged_tags(clause: Clause, llm_output: LLMOutput) -> set[str]:
    """Return LLM tags ∪ keyword tags for this clause."""
    llm_tags: set[str] = set()
    for ct in llm_output.clause_tags:
        if ct.clause_id == clause.id:
            llm_tags = {t for t in ct.tags if t in TAGS}
            break
    return llm_tags | keyword_tags(clause.text)


# ---------------------------------------------------------------------------
# Interaction pattern detection
# ---------------------------------------------------------------------------

def detect_interactions(
    clauses: list[Clause],
    llm_output: LLMOutput,
) -> list[dict]:
    """
    Deterministically detect which interaction patterns apply.
    Returns list of dicts: {pattern, clause_ids, chain_steps}
    """
    # Build tag index: tag -> list[clause_id]
    tag_index: dict[str, list[str]] = {}
    for clause in clauses:
        tags = merged_tags(clause, llm_output)
        for tag in tags:
            tag_index.setdefault(tag, []).append(clause.id)

    interactions: list[dict] = []

    # 1. early_exit
    if (
        tag_index.get("lock_in")
        and tag_index.get("notice")
        and (tag_index.get("early_termination") or tag_index.get("penalty"))
    ):
        clause_ids = list({
            *tag_index.get("lock_in", []),
            *tag_index.get("notice", []),
            *tag_index.get("early_termination", []),
            *tag_index.get("penalty", []),
        })
        interactions.append({
            "pattern": "early_exit",
            "clause_ids": clause_ids,
            "tag_index": tag_index,
        })

    # 2. deposit_return
    missing_refund = not _has_refund_timeline(clauses, tag_index)
    missing_inspection = not tag_index.get("inspection")
    if (
        tag_index.get("deposit")
        and tag_index.get("deductions")
        and (missing_refund or missing_inspection)
    ):
        clause_ids = list({
            *tag_index.get("deposit", []),
            *tag_index.get("deductions", []),
            *tag_index.get("refund", []),
            *tag_index.get("inspection", []),
        })
        interactions.append({
            "pattern": "deposit_return",
            "clause_ids": clause_ids,
            "tag_index": tag_index,
        })

    # 3. rent_growth
    if tag_index.get("escalation") and tag_index.get("renewal"):
        clause_ids = list({
            *tag_index.get("escalation", []),
            *tag_index.get("renewal", []),
        })
        interactions.append({
            "pattern": "rent_growth",
            "clause_ids": clause_ids,
            "tag_index": tag_index,
        })

    # 4. repair_burden
    if tag_index.get("repairs") and tag_index.get("damage_liability"):
        clause_ids = list({
            *tag_index.get("repairs", []),
            *tag_index.get("maintenance", []),
            *tag_index.get("damage_liability", []),
        })
        interactions.append({
            "pattern": "repair_burden",
            "clause_ids": clause_ids,
            "tag_index": tag_index,
        })

    # 5. entry_privacy
    entry_clause_ids = tag_index.get("entry", [])
    if entry_clause_ids:
        # Check if ANY entry clause ALSO has entry_notice_or_permission
        entry_clauses_with_notice = [
            cid for cid in entry_clause_ids
            if cid in tag_index.get("entry_notice_or_permission", [])
        ]
        if not entry_clauses_with_notice:
            interactions.append({
                "pattern": "entry_privacy",
                "clause_ids": entry_clause_ids,
                "tag_index": tag_index,
            })

    return interactions


def _has_refund_timeline(clauses: list[Clause], tag_index: dict) -> bool:
    """Check if any clause with 'refund' tag contains a time specification."""
    _TIMELINE_RE = re.compile(
        r"within \d+ days|on vacating|at the time of handing over|\d+ (?:days|weeks|months) (?:of|after)",
        re.I,
    )
    refund_clause_ids = tag_index.get("refund", [])
    clause_map = {c.id: c for c in clauses}
    for cid in refund_clause_ids:
        clause = clause_map.get(cid)
        if clause and _TIMELINE_RE.search(clause.text):
            return True
    return False


# ---------------------------------------------------------------------------
# Missing-information rules
# ---------------------------------------------------------------------------

MISSING_RULES = {
    "deposit_refund_timeline": "Deposit refund timeline",
    "inspection_process": "Move-out inspection process",
    "repair_responsibility": "Repair responsibilities",
    "notice_period": "Notice period",
    "lock_in_terms": "Lock-in terms",
    "condition_inventory": "Condition and inventory record",
    "escalation_schedule": "Rent escalation schedule",
}

MISSING_QUESTIONS = {
    "deposit_refund_timeline": "Within how many days will the deposit be returned after I vacate, and how will any deductions be itemised and agreed?",
    "inspection_process": "How will the condition of the flat be checked when I move out, and who will be present?",
    "repair_responsibility": "Which repairs are my responsibility and which are the landlord's?",
    "notice_period": "What notice period is required to end the agreement, and from which date does notice count?",
    "lock_in_terms": "Is there a minimum stay period, and what happens if I need to leave earlier?",
    "condition_inventory": "Is there an inventory or condition record for the flat that we both sign at move-in?",
    "escalation_schedule": "Will the rent change at renewal, and if so, by how much and when will it be confirmed?",
}


def detect_missing(
    clauses: list[Clause],
    llm_output: LLMOutput,
) -> list[str]:
    """
    Determine which important items are missing from the agreement.
    Returns list of MissingKey strings.
    """
    tag_index: dict[str, list[str]] = {}
    for clause in clauses:
        tags = merged_tags(clause, llm_output)
        for tag in tags:
            tag_index.setdefault(tag, []).append(clause.id)

    missing: list[str] = []

    # deposit_refund_timeline
    if tag_index.get("deposit") and not _has_refund_timeline(clauses, tag_index):
        missing.append("deposit_refund_timeline")

    # inspection_process
    if tag_index.get("deposit") and tag_index.get("deductions") and not tag_index.get("inspection"):
        missing.append("inspection_process")

    # repair_responsibility
    if not tag_index.get("repairs") and not tag_index.get("maintenance"):
        missing.append("repair_responsibility")
    else:
        # Has repairs tag but check if cost bearer is named
        _WHO_RE = re.compile(r"tenant|landlord|licensor|licensee|lessor|lessee", re.I)
        has_assignment = False
        for cid in tag_index.get("repairs", []) + tag_index.get("maintenance", []):
            clause_map = {c.id: c for c in clauses}
            c = clause_map.get(cid)
            if c and _WHO_RE.search(c.text):
                has_assignment = True
                break
        if not has_assignment:
            missing.append("repair_responsibility")

    # notice_period
    from app.utils.number_utils import parse_duration
    if not tag_index.get("notice"):
        missing.append("notice_period")
    else:
        clause_map = {c.id: c for c in clauses}
        has_duration = False
        for cid in tag_index.get("notice", []):
            c = clause_map.get(cid)
            if c and parse_duration(c.text):
                has_duration = True
                break
        if not has_duration:
            missing.append("notice_period")

    # lock_in_terms
    if not tag_index.get("lock_in"):
        missing.append("lock_in_terms")

    # condition_inventory
    if not tag_index.get("condition_inventory"):
        missing.append("condition_inventory")

    # escalation_schedule
    if tag_index.get("rent_payment") and not tag_index.get("escalation"):
        missing.append("escalation_schedule")

    # Deduplicate while preserving order
    seen: set[str] = set()
    result: list[str] = []
    for m in missing:
        if m not in seen:
            seen.add(m)
            result.append(m)
    return result
