/** Frontend API client and adapter bridging Backend FullAnalysisResponse with LeaseLens UI */

import { mockAnalysis } from "@/data/mock-analysis";
import type {
  AnalysisResponse,
  Finding as UIFinding,
  FindingStatus,
  Inconsistency as UIInconsistency,
  Interaction as UIInteraction,
  KeyTerm as UIKeyTerm,
  SourceClause as UISourceClause,
} from "@/types/analysis";
import type { FullAnalysisResponse, UserContext } from "@/types/backend";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

/** Translate backend error codes into calm, user-friendly messages */
export function getFriendlyErrorMessage(code: string, fallback?: string): string {
  switch (code) {
    case "empty_text":
      return "Please paste your agreement text or upload a PDF to begin.";
    case "text_too_long":
      return "The agreement text exceeds 60,000 characters. Please upload a PDF or select specific sections.";
    case "file_too_large":
      return "The PDF file is larger than 10 MB. Please choose a smaller file.";
    case "too_many_pages":
      return "The PDF has more than 30 pages. Please choose a standard residential agreement.";
    case "unsupported_file":
    case "invalid_pdf":
      return "This file doesn't appear to be a valid readable PDF. Please check the file and try again.";
    case "scanned_pdf":
      return "This PDF appears to be a scanned image without selectable text. Please copy and paste the text instead.";
    case "llm_timeout":
      return "The analysis took longer than expected. Please try again.";
    case "llm_unavailable":
      return "The AI analysis service is temporarily unavailable. Deterministic rules have been applied.";
    default:
      return fallback || "Could not complete the analysis. Please check your connection and try again.";
  }
}

/** Adapter converting backend FullAnalysisResponse into UI AnalysisResponse */
export function adaptBackendResponse(backend: FullAnalysisResponse): AnalysisResponse {
  // 1. Clauses
  const clauses: UISourceClause[] = backend.document.clauses.map((c) => ({
    id: c.id,
    label: c.title ? `${c.label} — ${c.title}` : c.label,
    text: c.text,
    highlight: c.text.split(".")[0]?.trim() + "." || c.text.slice(0, 100),
  }));

  // 2. Key Terms
  const key_terms: UIKeyTerm[] = backend.key_terms.map((kt) => {
    const isMissing = kt.status === "not_specified";
    return {
      id: kt.type,
      label: kt.label,
      value: isMissing ? "Not specified" : kt.value || "Not specified",
      note: isMissing ? "Not specified in this agreement. Worth asking the landlord." : undefined,
      status: isMissing ? "attention" : "confirmed",
    };
  });

  // Append any missing items that are not in key terms
  for (const m of backend.missing) {
    if (!key_terms.some((kt) => kt.id === m.item)) {
      key_terms.push({
        id: m.item,
        label: m.label,
        value: "Not specified",
        note: m.question,
        status: "attention",
      });
    }
  }

  // 3. Findings
  const findings: UIFinding[] = backend.findings.map((f) => {
    let uiStatus: FindingStatus = "understood";
    if (f.needs_professional) {
      uiStatus = "advice";
    } else if (f.label === "discuss") {
      uiStatus = "discuss";
    } else if (f.label === "clarify") {
      uiStatus = "clarify";
    }

    const sourceIds = f.evidence.map((e) => e.clause_id);

    return {
      id: f.id,
      title: f.plain_english.split(".")[0]?.trim() || "Agreement clause",
      status: uiStatus,
      summary: f.plain_english,
      why: f.tenant_impact,
      sourceIds: sourceIds.length > 0 ? sourceIds : (backend.document.clauses[0] ? [backend.document.clauses[0].id] : []),
      explanation: f.plain_english,
      question: f.question || "Could you please clarify this clause in writing?",
    };
  });

  // 4. Interactions
  const interactions: UIInteraction[] = backend.interactions.map((i) => {
    const primaryClauseId = i.evidence[0]?.clause_id || backend.document.clauses[0]?.id || "c1";
    const formulaStr = i.calculation?.exposure_by_month?.[0]?.formula || "Interacting clauses";
    return {
      id: i.id,
      title: i.title,
      formula: formulaStr,
      summary: i.explanation,
      findingId: primaryClauseId,
    };
  });

  // 5. Inconsistencies
  const inconsistencies: UIInconsistency[] = backend.inconsistencies.map((inc) => ({
    id: inc.id,
    title: inc.kind.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    detail: inc.description,
    sourceIds: inc.evidence.map((e) => e.clause_id),
  }));

  return {
    agreement_name: backend.document.filename || "Rental Agreement",
    key_terms,
    findings,
    interactions,
    inconsistencies,
    clauses,
    rawBackend: backend,
  };
}

export const analysisService = {
  getDemoAnalysis(): AnalysisResponse {
    return mockAnalysis;
  },

  async getSampleAgreement(): Promise<{ filename: string; text: string }> {
    try {
      const res = await fetch(`${API_BASE}/sample`);
      if (!res.ok) {
        throw new Error(`Failed to fetch sample: ${res.statusText}`);
      }
      return await res.json();
    } catch (e) {
      console.warn("Could not fetch sample from backend, using fallback demo text:", e);
      return {
        filename: "demo_agreement.txt",
        text: "LEAVE AND LICENSE AGREEMENT\n\n1. Term of License\nThe Licensor hereby grants unto the Licensee the leave and license for 11 months...",
      };
    }
  },

  async analyzeText(text: string, context?: UserContext): Promise<AnalysisResponse> {
    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, context: context || {} }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const code = errorData?.error?.code || "internal_error";
        const message = errorData?.error?.message || res.statusText;
        throw new Error(getFriendlyErrorMessage(code, message));
      }

      const backendResponse: FullAnalysisResponse = await res.json();
      return adaptBackendResponse(backendResponse);
    } catch (err: any) {
      console.warn("Backend analysis failed, checking fallback:", err);
      // If backend is down during development, fallback gracefully to mockAnalysis
      if (err.message?.includes("Failed to fetch") || err.message?.includes("NetworkError")) {
        return mockAnalysis;
      }
      throw err;
    }
  },

  async analyzePdf(file: File, context?: UserContext): Promise<AnalysisResponse> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (context) {
        formData.append("context", JSON.stringify(context));
      }

      const res = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const code = errorData?.error?.code || "internal_error";
        const message = errorData?.error?.message || res.statusText;
        throw new Error(getFriendlyErrorMessage(code, message));
      }

      const backendResponse: FullAnalysisResponse = await res.json();
      return adaptBackendResponse(backendResponse);
    } catch (err: any) {
      console.warn("Backend PDF analysis failed:", err);
      if (err.message?.includes("Failed to fetch") || err.message?.includes("NetworkError")) {
        return mockAnalysis;
      }
      throw err;
    }
  },
};