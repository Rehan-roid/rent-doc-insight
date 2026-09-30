"""Action engine — generates action items, polite landlord messages, and the checklist."""
from __future__ import annotations

import hashlib
from typing import Optional

from app.schemas import (
    ActionItem,
    ChecklistItem,
    Finding,
    Interaction,
    MissingItem,
    QuestionPriority,
)


def _stable_hash(*parts: str) -> str:
    """Generate a short, deterministic hash from components."""
    data = ":".join(parts).encode("utf-8")
    return hashlib.sha256(data).hexdigest()[:12]


def generate_action_plan(
    interactions: list[Interaction],
    findings: list[Finding],
    missing_items: list[MissingItem],
) -> list[ActionItem]:
    """Generate a prioritized action plan with stable IDs and polite landlord messages.

    Understood items do NOT become questions.
    Interactions take precedence over overlapping finding questions.
    """
    actions: list[ActionItem] = []
    seen_clause_sets: set[frozenset[str]] = set()

    # 1. Interactions -> must_ask ActionItems
    for inter in interactions:
        clause_ids = sorted({ev.clause_id for ev in inter.evidence})
        seen_clause_sets.add(frozenset(clause_ids))

        # Polite landlord message template
        msg = f"Hi, before signing I wanted to clarify one point regarding {inter.title.lower()}. {inter.question}"

        actions.append(
            ActionItem(
                id=f"act-inter-{inter.pattern}-{_stable_hash(*clause_ids)}",
                source="interaction",
                label="discuss",
                priority="must_ask",
                question=inter.question,
                landlord_message=msg,
                clause_ids=clause_ids,
                needs_professional=inter.needs_professional,
                status="not_asked",
            )
        )

    # 2. Missing items -> ActionItems
    for missing in missing_items:
        # Deposit refund timeline and notice period are must_ask
        priority: QuestionPriority = (
            "must_ask"
            if missing.item in ("deposit_refund_timeline", "notice_period")
            else "nice_to_ask"
        )
        msg = f"Hi, could you please clarify one point that wasn't mentioned in the draft? {missing.question}"

        actions.append(
            ActionItem(
                id=f"act-missing-{missing.item}",
                source="missing",
                label="clarify",
                priority=priority,
                question=missing.question,
                landlord_message=msg,
                clause_ids=[],
                needs_professional=False,
                status="not_asked",
            )
        )

    # 3. Findings -> ActionItems (skip understood, skip if overlapping interaction already asked)
    for finding in findings:
        if finding.label == "understood" or not finding.question:
            continue

        c_ids = sorted({ev.clause_id for ev in finding.evidence})
        c_set = frozenset(c_ids)
        if c_set in seen_clause_sets and finding.linked_interaction_id:
            # Already covered by an interaction
            continue

        priority = "must_ask" if finding.label == "discuss" else "nice_to_ask"
        c_ref = f" (Clause {', '.join(c_ids)})" if c_ids else ""
        msg = f"Hi, before signing I wanted to check the clause regarding {finding.plain_english.split('.')[0].lower()}{c_ref}. {finding.question}"

        actions.append(
            ActionItem(
                id=f"act-find-{_stable_hash(finding.id, *c_ids)}",
                source="finding",
                label=finding.label,
                priority=priority,
                question=finding.question,
                landlord_message=msg,
                clause_ids=c_ids,
                needs_professional=finding.needs_professional,
                status="not_asked",
            )
        )

    return actions


def generate_checklist(interactions: list[Interaction], action_plan: list[ActionItem]) -> list[ChecklistItem]:
    """Generate a structured signing and move-in checklist with stable IDs."""
    items: list[ChecklistItem] = [
        # Base "before_signing" items
        ChecklistItem(
            id="chk-before-rent",
            group="before_signing",
            text="Confirm monthly rent and payment date",
            checked=False,
        ),
        ChecklistItem(
            id="chk-before-deposit",
            group="before_signing",
            text="Confirm security deposit amount",
            checked=False,
        ),
        ChecklistItem(
            id="chk-before-refund-timeline",
            group="before_signing",
            text="Confirm deposit refund timeline in writing",
            checked=False,
        ),
        ChecklistItem(
            id="chk-before-lockin",
            group="before_signing",
            text="Confirm lock-in period and early-exit terms",
            checked=False,
        ),
        ChecklistItem(
            id="chk-before-notice",
            group="before_signing",
            text="Confirm notice period required for termination",
            checked=False,
        ),
        ChecklistItem(
            id="chk-before-repairs",
            group="before_signing",
            text="Confirm repair and maintenance responsibilities",
            checked=False,
        ),
        ChecklistItem(
            id="chk-before-written",
            group="before_signing",
            text="Get all agreed changes or clarifications in writing",
            checked=False,
        ),
        ChecklistItem(
            id="chk-before-signed-copy",
            group="before_signing",
            text="Keep a fully signed copy of the final agreement",
            checked=False,
        ),
    ]

    # Derived items from interactions
    for inter in interactions:
        if inter.pattern == "early_exit":
            items.append(
                ChecklistItem(
                    id="chk-before-early-exit-written",
                    group="before_signing",
                    text="Get exact early-exit calculation or waiver confirmed in writing",
                    checked=False,
                )
            )
        elif inter.pattern == "entry_privacy":
            items.append(
                ChecklistItem(
                    id="chk-before-entry-notice",
                    group="before_signing",
                    text="Request written notice requirement (e.g. 24 hours) for landlord visits",
                    checked=False,
                )
            )

    # Base "move_in" items
    items.extend(
        [
            ChecklistItem(
                id="chk-movein-deposit-receipt",
                group="move_in",
                text="Obtain receipt for security deposit payment",
                checked=False,
            ),
            ChecklistItem(
                id="chk-movein-photos",
                group="move_in",
                text="Take date-stamped photos of property condition and any existing damage",
                checked=False,
            ),
            ChecklistItem(
                id="chk-movein-meters",
                group="move_in",
                text="Record initial utility meter readings (electricity, water, gas)",
                checked=False,
            ),
            ChecklistItem(
                id="chk-movein-inventory",
                group="move_in",
                text="Complete joint inventory check for furniture, fixtures, and appliances",
                checked=False,
            ),
        ]
    )

    return items
