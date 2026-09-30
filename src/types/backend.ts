/** FullAnalysisResponse schema matching the LeaseLens backend specification */

export type Role = "student" | "working_professional" | "other";
export type ExpectedStay = "under_6_months" | "6_to_12_months" | "over_12_months";
export type UserPriority = "flexibility" | "deposit" | "monthly_cost" | "repairs";

export interface UserContext {
  role?: Role | null;
  expected_stay?: ExpectedStay | null;
  priority?: UserPriority | null;
}

export interface Clause {
  id: string;
  label: string;
  title?: string;
  text: string;
  start: number;
  end: number;
}

export interface Evidence {
  clause_id: string;
  clause_label: string;
  quote: string;
  start: number;
  end: number;
}

export interface KeyTerm {
  type: string;
  status: "found" | "not_specified" | "unclear";
  label: string;
  value?: string;
  numeric_value?: number;
  unit?: string;
  evidence?: Evidence;
  question?: string;
}

export interface MissingItem {
  item: string;
  label: string;
  note: string;
  question: string;
}

export interface Finding {
  id: string;
  label: "discuss" | "clarify" | "confirm" | "understood";
  plain_english: string;
  tenant_impact: string;
  question?: string;
  needs_professional: boolean;
  confidence: "high" | "medium" | "low";
  evidence: Evidence[];
  linked_interaction_id?: string;
}

export interface ChainStep {
  step: string;
  label: string;
  status: "found" | "not_specified";
  clause_ids: string[];
}

export interface ExposurePoint {
  leave_after_months: number;
  amount: number;
  formula: string;
}

export interface Calculation {
  available: boolean;
  currency: "INR";
  reason_unavailable?: string;
  default_leave_after_months?: number;
  exposure_by_month: ExposurePoint[];
  assumptions: string[];
  wording: string;
}

export interface Interaction {
  id: string;
  pattern: "early_exit" | "deposit_return" | "rent_growth" | "repair_burden" | "entry_privacy";
  title: string;
  chain: ChainStep[];
  evidence: Evidence[];
  explanation: string;
  question: string;
  needs_professional: boolean;
  calculation?: Calculation;
}

export interface Inconsistency {
  id: string;
  kind: string;
  description: string;
  evidence: Evidence[];
}

export interface ActionItem {
  id: string;
  source: "interaction" | "finding" | "missing";
  label: "discuss" | "clarify" | "confirm" | "understood";
  priority: "must_ask" | "nice_to_ask";
  question: string;
  landlord_message: string;
  fallback: string;
  clause_ids: string[];
  needs_professional: boolean;
  status: "not_asked" | "asked" | "answered" | "agreed_in_writing" | "resolved" | "accepted_as_is" | "needs_professional";
}

export interface ChecklistItem {
  id: string;
  group: "before_signing" | "move_in";
  text: string;
  checked: boolean;
}

export interface ContextNote {
  text: string;
  clause_ids: string[];
}

export interface DocumentInfo {
  analysis_id: string;
  filename?: string;
  page_count?: number;
  clauses: Clause[];
}

export interface ValidationStats {
  quotes_verified: number;
  quotes_recovered: number;
  items_dropped: number;
  guardrail_replacements: number;
}

export interface Meta {
  analysis_version: string;
  prompt_version: string;
  mode: "live" | "deterministic_only" | "demo_cached";
  disclaimer: string;
  notices: string[];
  validation: ValidationStats;
}

export interface FullAnalysisResponse {
  document: DocumentInfo;
  context_notes: ContextNote[];
  key_terms: KeyTerm[];
  missing: MissingItem[];
  findings: Finding[];
  interactions: Interaction[];
  inconsistencies: Inconsistency[];
  action_plan: ActionItem[];
  checklist: ChecklistItem[];
  meta: Meta;
}
