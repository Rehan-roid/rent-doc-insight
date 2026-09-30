"""Analysis service — pipeline orchestrator coordinating all document analysis steps."""
from __future__ import annotations

import json
import logging
import os
from pathlib import Path
from typing import Optional

from app.config import settings
from app.schemas import (
    ActionItem,
    AnalyzeRequest,
    ChecklistItem,
    Clause,
    ContextNote,
    DocumentInfo,
    Evidence,
    Finding,
    FullAnalysisResponse,
    Inconsistency,
    Interaction,
    KeyTerm,
    KeyTermType,
    LLMKeyTerm,
    LLMOutput,
    Meta,
    MissingItem,
    Mode,
    PenaltyType,
    UserContext,
    ValidationStats,
    DISCLAIMER,
)
from app.services.action_service import generate_action_plan, generate_checklist
from app.services.calculation_service import compute_early_exit
from app.services.clause_service import segment
from app.services.consistency_service import find_inconsistencies
from app.services.document_service import process_pdf, process_text
from app.services.evidence_validator import verify_quote, verify_quotes_list
from app.services.guardrail_service import check_field
from app.services.interaction_engine import build_interaction
from app.services.llm_service import PROMPT_VERSION, extract_with_llm
from app.services.personalization_service import personalize_findings
from app.services.privacy_service import redact
from app.services.rule_engine import (
    MISSING_QUESTIONS,
    detect_missing,
    detect_interactions,
    keyword_tags,
    merged_tags,
)
from app.utils.number_utils import (
    extract_currency_amount,
    extract_duration,
    extract_percent,
    format_inr,
)

logger = logging.getLogger(__name__)

# Sample directory path
_SAMPLE_DIR = Path(__file__).resolve().parent.parent.parent / "sample"


def _is_demo_text(text: str) -> bool:
    """Check if the text corresponds to the benchmark demo agreement."""
    demo_file = _SAMPLE_DIR / "demo_agreement.txt"
    if not demo_file.exists():
        return False
    demo_content = demo_file.read_text(encoding="utf-8").strip()
    return text.strip() == demo_content or "Clause 4.2" in text and "Rs. 18,000" in text and "Clause 7.1" in text


def _load_demo_analysis() -> Optional[FullAnalysisResponse]:
    """Load cached demo analysis if available."""
    cached_file = _SAMPLE_DIR / "demo_analysis.json"
    if cached_file.exists():
        try:
            data = json.loads(cached_file.read_text(encoding="utf-8"))
            return FullAnalysisResponse.model_validate(data)
        except Exception as e:
            logger.warning("Could not load demo_analysis.json: %s", e)
    return None


async def analyze_document(
    raw_text: Optional[str] = None,
    pdf_bytes: Optional[bytes] = None,
    filename: Optional[str] = None,
    context: Optional[UserContext] = None,
) -> FullAnalysisResponse:
    """Execute the end-to-end analysis pipeline according to the LeaseLens specification."""
    if context is None:
        context = UserContext()

    page_count: Optional[int] = None
    if pdf_bytes is not None:
        normalized_text, analysis_id, page_count = process_pdf(pdf_bytes, filename)
    elif raw_text is not None:
        normalized_text, analysis_id = process_text(raw_text)
    else:
        raise ValueError("Either raw_text or pdf_bytes must be provided")

    is_demo = _is_demo_text(normalized_text)

    # 1. Privacy redaction
    redaction = redact(normalized_text)

    # 2. Clause segmentation
    clauses = segment(normalized_text)
    clauses_by_id = {c.id: c for c in clauses}

    # 3. LLM extraction or fallback
    stats = ValidationStats()
    notices: list[str] = []
    mode: Mode = "live"

    llm_output = LLMOutput()
    llm_error = ""

    # Check if LLM API key is configured
    if not settings.llm_api_key or settings.llm_api_key.strip() == "":
        llm_error = "no_key"

    if not llm_error:
        # Pass redacted text or segmented clauses with redacted text
        redacted_clauses = segment(redaction.masked_text)
        llm_output, llm_error = await extract_with_llm(redacted_clauses, context)

    if llm_error:
        if is_demo and settings.demo_fallback_enabled:
            cached = _load_demo_analysis()
            if cached:
                cached.document.analysis_id = analysis_id
                cached.meta.mode = "demo_cached"
                cached.meta.notices.append("Showing benchmark demo analysis (cached).")
                return cached

        # For any other text (or demo without cache), fall back to deterministic pipeline
        mode = "deterministic_only"
        notices.append("Analysis completed using deterministic rules (LLM analysis unavailable).")
        llm_output = LLMOutput()  # Empty output for deterministic pipeline

    # 4. Merge tags for all clauses
    clause_tags_map: dict[str, set[str]] = {}
    for clause in clauses:
        clause_tags_map[clause.id] = merged_tags(clause, llm_output)

    # 5. Extract & verify key terms
    key_terms = _build_key_terms(clauses, llm_output, clauses_by_id, stats)

    # 6. Extract & verify findings
    findings = _build_findings(clauses, llm_output, clauses_by_id, stats)

    # 7. Detect missing items
    missing_keys = detect_missing(clauses, llm_output)
    missing_items: list[MissingItem] = []
    for m_key in missing_keys:
        missing_items.append(
            MissingItem(
                item=m_key,  # type: ignore[arg-type]
                label=m_key.replace("_", " ").title(),
                question=MISSING_QUESTIONS.get(
                    m_key, "Could you please clarify this missing term in writing?"
                ),
            )
        )

    # 8. Early-exit calculation
    rent_term = next((kt for kt in key_terms if kt.type == "rent"), None)
    lock_in_term = next((kt for kt in key_terms if kt.type == "lock_in"), None)
    deposit_term = next((kt for kt in key_terms if kt.type == "deposit"), None)

    # Identify penalty type from clauses or LLM
    penalty_type: PenaltyType = "none_stated"
    clause_ref_rent = rent_term.evidence.clause_label if rent_term and rent_term.evidence else "Clause 2"

    for c in clauses:
        tags = clause_tags_map.get(c.id, set())
        if "lock_in" in tags or "early_termination" in tags or "penalty" in tags:
            lower = c.text.lower()
            if "remaining" in lower and "rent" in lower:
                penalty_type = "remaining_rent"
                break
            elif "forfeit" in lower and "deposit" in lower:
                penalty_type = "deposit_forfeiture"
                break

    calc = compute_early_exit(
        rent_term=rent_term,
        lock_in_term=lock_in_term,
        deposit_term=deposit_term,
        penalty_type=penalty_type,
        clause_ref_rent=clause_ref_rent,
    )

    # 9. Detect and build interactions
    patterns = detect_interactions(clauses, llm_output)
    interactions: list[Interaction] = []
    for p_info in patterns:
        p_calc = calc if p_info["pattern"] == "early_exit" else None
        inter = build_interaction(p_info, clauses_by_id, llm_output, stats, p_calc)
        interactions.append(inter)


    # Link findings to interactions
    for f in findings:
        for inter in interactions:
            inter_cids = {cid for step in inter.chain for cid in step.clause_ids}
            f_cids = {ev.clause_id for ev in f.evidence}
            if f_cids & inter_cids:
                f.linked_interaction_id = inter.id
                break


    # 10. Check internal inconsistencies
    inconsistencies = find_inconsistencies(clauses)

    # 11. Personalization & Context Notes
    ordered_findings, context_notes = personalize_findings(
        findings=findings,
        clause_tags_map=clause_tags_map,
        context=context,
    )

    # 12. Action engine & checklist
    action_plan = generate_action_plan(interactions, ordered_findings, missing_items)
    checklist = generate_checklist(interactions, action_plan)

    # Build response
    doc_info = DocumentInfo(
        analysis_id=analysis_id,
        filename=filename,
        page_count=page_count,
        clauses=clauses,
    )

    meta = Meta(
        analysis_version="1.0",
        prompt_version=PROMPT_VERSION,
        mode=mode,
        disclaimer=DISCLAIMER,
        notices=notices,
        validation=stats,
    )

    return FullAnalysisResponse(
        document=doc_info,
        context_notes=context_notes,
        key_terms=key_terms,
        missing=missing_items,
        findings=ordered_findings,
        interactions=interactions,
        inconsistencies=inconsistencies,
        action_plan=action_plan,
        checklist=checklist,
        meta=meta,
    )


def _build_key_terms(
    clauses: list[Clause],
    llm_output: LLMOutput,
    clauses_by_id: dict[str, Clause],
    stats: ValidationStats,
) -> list[KeyTerm]:
    """Extract code-validated key terms."""
    term_types: list[KeyTermType] = [
        "rent", "deposit", "lock_in", "notice", "repairs", "escalation", "term"
    ]
    key_terms: list[KeyTerm] = []

    for t_type in term_types:
        # Check LLM extraction first
        llm_match: Optional[LLMKeyTerm] = None
        for kt in llm_output.key_terms:
            if kt.type == t_type:
                llm_match = kt
                break

        # Code extraction as baseline / validator
        code_kt = _code_extract_key_term(t_type, clauses, clauses_by_id, stats)

        if code_kt and code_kt.status == "found":
            # If LLM provided question, validate and attach
            if llm_match and llm_match.question:
                code_kt.question = check_field(llm_match.question, "question", stats)
            key_terms.append(code_kt)
        elif llm_match and llm_match.status == "found" and llm_match.evidence:
            ev = verify_quote(
                llm_match.evidence.quote,
                llm_match.evidence.clause_id,
                clauses_by_id,
                stats,
            )
            if ev:
                key_terms.append(
                    KeyTerm(
                        type=t_type,
                        status="found",
                        label=t_type.replace("_", " ").title(),
                        value=llm_match.value,
                        numeric_value=llm_match.numeric_value,
                        unit=llm_match.unit,  # type: ignore[arg-type]
                        evidence=ev,
                        question=check_field(llm_match.question, "question", stats) if llm_match.question else None,
                    )
                )
            else:
                key_terms.append(
                    KeyTerm(
                        type=t_type,
                        status="not_specified",
                        label=t_type.replace("_", " ").title(),
                        value="Not specified",
                    )
                )
        else:
            key_terms.append(
                KeyTerm(
                    type=t_type,
                    status="not_specified",
                    label=t_type.replace("_", " ").title(),
                    value="Not specified",
                )
            )

    return key_terms


def _code_extract_key_term(
    t_type: KeyTermType,
    clauses: list[Clause],
    clauses_by_id: dict[str, Clause],
    stats: ValidationStats,
) -> Optional[KeyTerm]:
    """Deterministically parse key terms using regex and number utilities."""
    label = t_type.replace("_", " ").title()

    if t_type == "rent":
        for c in clauses:
            if "rent" in c.text.lower() and ("per month" in c.text.lower() or "monthly" in c.text.lower()):
                amt = extract_currency_amount(c.text)
                if amt and amt > 1000:
                    # Find quote containing the amount
                    first_sent = c.text.split(".")[0].strip() + "."
                    ev = verify_quote(first_sent, c.id, clauses_by_id, stats)
                    return KeyTerm(
                        type="rent",
                        status="found",
                        label="Monthly Rent",
                        value=format_inr(int(amt)),
                        numeric_value=float(amt),
                        unit="INR",
                        evidence=ev,
                    )

    elif t_type == "deposit":
        for c in clauses:
            if "security deposit" in c.text.lower() or "deposit" in c.text.lower():
                amt = extract_currency_amount(c.text)
                if amt and amt >= 1000:
                    first_sent = c.text.split(".")[0].strip() + "."
                    ev = verify_quote(first_sent, c.id, clauses_by_id, stats)
                    return KeyTerm(
                        type="deposit",
                        status="found",
                        label="Security Deposit",
                        value=format_inr(int(amt)),
                        numeric_value=float(amt),
                        unit="INR",
                        evidence=ev,
                    )

    elif t_type == "lock_in":
        for c in clauses:
            if "lock-in" in c.text.lower() or "lock in" in c.text.lower():
                dur = extract_duration(c.text)
                if dur:
                    first_sent = c.text.split(".")[0].strip() + "."
                    ev = verify_quote(first_sent, c.id, clauses_by_id, stats)
                    return KeyTerm(
                        type="lock_in",
                        status="found",
                        label="Lock-in Period",
                        value=f"{dur.value} {dur.unit}",
                        numeric_value=float(dur.value),
                        unit="months" if "month" in dur.unit else "days",
                        evidence=ev,
                    )

    elif t_type == "notice":
        for c in clauses:
            if "notice" in c.text.lower() and ("termination" in c.text.lower() or "vacat" in c.text.lower() or "period" in c.text.lower()):
                dur = extract_duration(c.text)
                if dur:
                    first_sent = c.text.split(".")[0].strip() + "."
                    ev = verify_quote(first_sent, c.id, clauses_by_id, stats)
                    return KeyTerm(
                        type="notice",
                        status="found",
                        label="Notice Period",
                        value=f"{dur.value} {dur.unit}",
                        numeric_value=float(dur.value),
                        unit="days" if "day" in dur.unit else "months",
                        evidence=ev,
                    )

    elif t_type == "escalation":
        for c in clauses:
            if "escalat" in c.text.lower() or "increase" in c.text.lower() or "hike" in c.text.lower():
                pct = extract_percent(c.text)
                if pct:
                    first_sent = c.text.split(".")[0].strip() + "."
                    ev = verify_quote(first_sent, c.id, clauses_by_id, stats)
                    return KeyTerm(
                        type="escalation",
                        status="found",
                        label="Rent Escalation",
                        value=f"{pct}%",
                        numeric_value=float(pct),
                        unit="percent",
                        evidence=ev,
                    )

    elif t_type == "term":
        for c in clauses:
            if "period of license" in c.text.lower() or "term of this agreement" in c.text.lower() or "eleven (11) months" in c.text.lower():
                dur = extract_duration(c.text)
                if dur:
                    first_sent = c.text.split(".")[0].strip() + "."
                    ev = verify_quote(first_sent, c.id, clauses_by_id, stats)
                    return KeyTerm(
                        type="term",
                        status="found",
                        label="Agreement Term",
                        value=f"{dur.value} {dur.unit}",
                        numeric_value=float(dur.value),
                        unit="months" if "month" in dur.unit else "days",
                        evidence=ev,
                    )

    return None


def _build_findings(
    clauses: list[Clause],
    llm_output: LLMOutput,
    clauses_by_id: dict[str, Clause],
    stats: ValidationStats,
) -> list[Finding]:
    """Verify evidence and apply guardrails to findings from LLM or deterministic fallback."""
    findings: list[Finding] = []

    for idx, raw_f in enumerate(llm_output.findings):
        # 1. Evidence verification
        valid_ev: list[Evidence] = []
        for ev in raw_f.evidence:
            v_ev = verify_quote(ev.quote, ev.clause_id, clauses_by_id, stats)
            if v_ev:
                valid_ev.append(v_ev)

        # Drop finding if no quote could be verified
        if not valid_ev:
            stats.items_dropped += 1
            continue

        # 2. Guardrail validation
        plain = check_field(raw_f.plain_english, "plain_english", stats)
        impact = check_field(raw_f.tenant_impact, "tenant_impact", stats)
        q = check_field(raw_f.question, "question", stats) if raw_f.question else None

        # Determine label (default discuss if professional advice needed)
        f_label = raw_f.label if raw_f.label in ("discuss", "clarify", "confirm", "understood") else "clarify"

        findings.append(
            Finding(
                id=f"finding-{idx + 1}",
                label=f_label,  # type: ignore[arg-type]
                plain_english=plain,
                tenant_impact=impact,
                question=q,
                needs_professional=raw_f.needs_professional,
                confidence=raw_f.confidence if raw_f.confidence in ("high", "medium", "low") else "medium",  # type: ignore[arg-type]
                evidence=valid_ev,
            )
        )

    # If no findings from LLM (e.g. deterministic mode), generate standard deterministic findings
    if not findings:
        findings = _generate_deterministic_findings(clauses, clauses_by_id, stats)

    return findings


def _generate_deterministic_findings(
    clauses: list[Clause],
    clauses_by_id: dict[str, Clause],
    stats: ValidationStats,
) -> list[Finding]:
    """Produce structured findings deterministically from tagged clauses."""
    findings: list[Finding] = []
    idx = 1

    for c in clauses:
        tags = keyword_tags(c.text)
        first_sent = c.text.split(".")[0].strip() + "."
        if len(first_sent) > 250:
            first_sent = first_sent[:247] + "..."
        ev = verify_quote(first_sent, c.id, clauses_by_id, stats)
        if not ev:
            continue

        if "lock_in" in tags:
            findings.append(
                Finding(
                    id=f"finding-{idx}",
                    label="discuss",
                    plain_english=f"This clause sets out a lock-in period in {c.label}.",
                    tenant_impact="Leaving before the lock-in period ends may involve paying rent for the remaining period.",
                    question="What is the exact financial obligation if I need to leave before the lock-in completes?",
                    evidence=[ev],
                )
            )
            idx += 1
        elif "deductions" in tags and "deposit" in tags:
            findings.append(
                Finding(
                    id=f"finding-{idx}",
                    label="clarify",
                    plain_english=f"This clause allows deductions from the security deposit in {c.label}.",
                    tenant_impact="Deductions for painting, cleaning, or damages are permitted, but the specific standard of wear and tear is not detailed.",
                    question="How are move-out deductions itemised, and is fair wear and tear excluded?",
                    evidence=[ev],
                )
            )
            idx += 1
        elif "repairs" in tags:
            findings.append(
                Finding(
                    id=f"finding-{idx}",
                    label="clarify",
                    plain_english=f"This clause specifies maintenance and repair duties in {c.label}.",
                    tenant_impact="Day-to-day versus major structural repairs may need clearer demarcation.",
                    question="Who bears the cost for major electrical, plumbing, or structural repairs?",
                    evidence=[ev],
                )
            )
            idx += 1
        elif "indemnity" in tags or "jurisdiction" in tags or "waiver" in tags:
            findings.append(
                Finding(
                    id=f"finding-{idx}",
                    label="discuss",
                    plain_english=f"This clause contains legal terms regarding dispute resolution or indemnity in {c.label}.",
                    tenant_impact="Legal liability clauses are binding commitments that may warrant professional review.",
                    question="Could you explain the scope of liability under this indemnity clause?",
                    needs_professional=True,
                    evidence=[ev],
                )
            )
            idx += 1

    return findings
