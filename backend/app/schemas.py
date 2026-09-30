"""Pydantic schemas for LeaseLens backend — data contract between pipeline and frontend."""
from __future__ import annotations

from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator

DISCLAIMER = "This explains the document. It isn't legal advice."
EXPOSURE_WORDING = "Potential financial exposure based only on the stated agreement terms."

# ---------- vocabularies ----------
Role = Literal["student", "working_professional", "other"]
ExpectedStay = Literal["under_6_months", "6_to_12_months", "over_12_months"]
UserPriority = Literal["flexibility", "deposit", "monthly_cost", "repairs"]

TAGS: set[str] = {
    "rent_payment", "term", "lock_in", "early_termination", "penalty", "notice",
    "deposit", "deductions", "refund", "inspection", "condition_inventory",
    "repairs", "maintenance", "damage_liability", "escalation", "renewal",
    "entry", "entry_notice_or_permission", "late_penalty", "utilities", "sublet",
    "unilateral_change", "registration", "stamp_duty", "jurisdiction",
    "arbitration", "indemnity", "waiver",
}

KeyTermType = Literal["rent", "deposit", "lock_in", "notice", "repairs", "escalation", "term"]
KeyTermStatus = Literal["found", "not_specified", "unclear"]
Unit = Literal["INR", "months", "days", "percent"]
FindingLabel = Literal["discuss", "clarify", "confirm", "understood"]
Confidence = Literal["high", "medium", "low"]
Pattern = Literal["early_exit", "deposit_return", "rent_growth", "repair_burden", "entry_privacy"]
MissingKey = Literal[
    "deposit_refund_timeline", "repair_responsibility", "notice_period", "lock_in_terms",
    "inspection_process", "condition_inventory", "escalation_schedule",
]
PenaltyType = Literal["remaining_rent", "fixed_amount", "deposit_forfeiture", "none_stated", "unclear"]
ActionSource = Literal["interaction", "finding", "missing"]
QuestionPriority = Literal["must_ask", "nice_to_ask"]
ActionStatus = Literal[
    "not_asked", "asked", "answered", "agreed_in_writing",
    "resolved", "accepted_as_is", "needs_professional",
]
Mode = Literal["live", "deterministic_only", "demo_cached"]
InconsistencyKind = Literal[
    "notice_period", "deposit_words_vs_figures", "rent_amount", "lock_in_period", "term_vs_dates", "other",
]


# ---------- request ----------
class UserContext(BaseModel):
    role: Optional[Role] = None
    expected_stay: Optional[ExpectedStay] = None
    priority: Optional[UserPriority] = None

    @field_validator("role", "expected_stay", "priority", mode="before")
    @classmethod
    def _unknown_to_none(cls, v: object, info: object) -> object:
        field_name = info.field_name  # type: ignore[union-attr]
        allowed: dict[str, set[str]] = {
            "role": {"student", "working_professional", "other"},
            "expected_stay": {"under_6_months", "6_to_12_months", "over_12_months"},
            "priority": {"flexibility", "deposit", "monthly_cost", "repairs"},
        }
        return v if v in allowed.get(field_name, set()) else None


class AnalyzeRequest(BaseModel):
    text: str
    context: UserContext = Field(default_factory=UserContext)


# ---------- shared building blocks ----------
class Clause(BaseModel):
    id: str
    label: str
    title: Optional[str] = None
    text: str
    start: int
    end: int


class Evidence(BaseModel):
    clause_id: str
    clause_label: str
    quote: str
    start: int
    end: int


# ---------- key terms and missing information ----------
class KeyTerm(BaseModel):
    type: KeyTermType
    status: KeyTermStatus
    label: str
    value: Optional[str] = None
    numeric_value: Optional[float] = None
    unit: Optional[Unit] = None
    evidence: Optional[Evidence] = None
    question: Optional[str] = None


class MissingItem(BaseModel):
    item: MissingKey
    label: str
    note: str = "Not specified in this agreement."
    question: str


# ---------- findings, interactions, inconsistencies ----------
class Finding(BaseModel):
    id: str
    label: FindingLabel
    plain_english: str
    tenant_impact: str
    question: Optional[str] = None
    needs_professional: bool = False
    confidence: Confidence = "medium"
    evidence: list[Evidence]
    linked_interaction_id: Optional[str] = None


class ChainStep(BaseModel):
    step: Literal[
        "lock_in", "notice", "early_termination", "penalty", "deposit", "deductions",
        "refund", "inspection", "escalation", "renewal", "repairs", "damage_liability",
        "entry", "entry_notice_or_permission",
    ]
    label: str
    status: Literal["found", "not_specified"]
    clause_ids: list[str] = []


class ExposurePoint(BaseModel):
    leave_after_months: int
    amount: int
    formula: str


class Calculation(BaseModel):
    available: bool
    currency: Literal["INR"] = "INR"
    reason_unavailable: Optional[str] = None
    default_leave_after_months: Optional[int] = None
    exposure_by_month: list[ExposurePoint] = []
    assumptions: list[str] = []
    wording: str = EXPOSURE_WORDING


class Interaction(BaseModel):
    id: str
    pattern: Pattern
    title: str
    chain: list[ChainStep]
    evidence: list[Evidence]
    explanation: str
    question: str
    needs_professional: bool = False
    calculation: Optional[Calculation] = None


class Inconsistency(BaseModel):
    id: str
    kind: InconsistencyKind
    description: str
    evidence: list[Evidence]


# ---------- action plan, checklist, context ----------
class ActionItem(BaseModel):
    id: str
    source: ActionSource
    label: FindingLabel
    priority: QuestionPriority
    question: str
    landlord_message: str
    fallback: str = "If the answer is given verbally, please confirm it in writing (message, email or addendum)."
    clause_ids: list[str] = []
    needs_professional: bool = False
    status: ActionStatus = "not_asked"


class ChecklistItem(BaseModel):
    id: str
    group: Literal["before_signing", "move_in"]
    text: str
    checked: bool = False


class ContextNote(BaseModel):
    text: str
    clause_ids: list[str] = []


# ---------- response ----------
class DocumentInfo(BaseModel):
    analysis_id: str
    filename: Optional[str] = None
    page_count: Optional[int] = None
    clauses: list[Clause]


class ValidationStats(BaseModel):
    quotes_verified: int = 0
    quotes_recovered: int = 0
    items_dropped: int = 0
    guardrail_replacements: int = 0


class Meta(BaseModel):
    analysis_version: str = "1.0"
    prompt_version: str
    mode: Mode = "live"
    disclaimer: str = DISCLAIMER
    notices: list[str] = []
    validation: ValidationStats = Field(default_factory=ValidationStats)


class FullAnalysisResponse(BaseModel):
    document: DocumentInfo
    context_notes: list[ContextNote] = []
    key_terms: list[KeyTerm]
    missing: list[MissingItem]
    findings: list[Finding]
    interactions: list[Interaction]
    inconsistencies: list[Inconsistency]
    action_plan: list[ActionItem]
    checklist: list[ChecklistItem]
    meta: Meta


# ---------- errors ----------
class ErrorBody(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    error: ErrorBody


# ---------- LLM raw output (lenient) ----------
class LLMClauseTags(BaseModel):
    model_config = ConfigDict(extra="ignore")
    clause_id: str
    tags: list[str] = []


class LLMKeyTerm(BaseModel):
    model_config = ConfigDict(extra="ignore")
    type: str
    value: Optional[str] = None
    numeric_value: Optional[float] = None
    unit: Optional[str] = None
    clause_id: Optional[str] = None
    quote: Optional[str] = None
    status: str = "found"


class LLMPenalty(BaseModel):
    model_config = ConfigDict(extra="ignore")
    type: str = "unclear"
    amount: Optional[float] = None
    clause_id: Optional[str] = None
    quote: Optional[str] = None


class LLMMissing(BaseModel):
    model_config = ConfigDict(extra="ignore")
    item: str
    note: Optional[str] = None


class LLMFinding(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = ""
    label: str = "clarify"
    clause_ids: list[str] = []
    quotes: list[str] = []
    plain_english: str = ""
    tenant_impact: str = ""
    question: Optional[str] = None
    needs_professional: bool = False
    confidence: str = "medium"


class LLMInteraction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    pattern: str
    clause_ids: list[str] = []
    quotes: list[str] = []
    explanation: str = ""
    question: str = ""


class LLMInconsistency(BaseModel):
    model_config = ConfigDict(extra="ignore")
    clause_ids: list[str] = []
    quotes: list[str] = []
    description: str = ""


class LLMOutput(BaseModel):
    model_config = ConfigDict(extra="ignore")
    clause_tags: list[LLMClauseTags] = []
    key_terms: list[LLMKeyTerm] = []
    penalty: Optional[LLMPenalty] = None
    missing: list[LLMMissing] = []
    findings: list[LLMFinding] = []
    interactions: list[LLMInteraction] = []
    inconsistencies: list[LLMInconsistency] = []
