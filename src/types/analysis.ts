export type FindingStatus = "discuss" | "clarify" | "understood" | "advice";
export type QuestionStatus =
  | "Not asked"
  | "Asked"
  | "Answered"
  | "Agreed in writing"
  | "Resolved"
  | "Accepted as-is"
  | "Get professional advice";

export interface SourceClause {
  id: string;
  label: string;
  text: string;
  highlight: string;
}

export interface KeyTerm {
  id: string;
  label: string;
  value: string;
  note?: string;
  status?: "confirmed" | "attention";
}

export interface Finding {
  id: string;
  title: string;
  status: FindingStatus;
  summary: string;
  why: string;
  sourceIds: string[];
  explanation: string;
  question: string;
}

export interface Interaction {
  id: string;
  title: string;
  formula: string;
  summary: string;
  findingId: string;
}

export interface Inconsistency {
  id: string;
  title: string;
  detail: string;
  sourceIds: string[];
}

export interface AnalysisResponse {
  agreement_name: string;
  key_terms: KeyTerm[];
  findings: Finding[];
  interactions: Interaction[];
  inconsistencies: Inconsistency[];
  clauses: SourceClause[];
}