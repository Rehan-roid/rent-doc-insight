import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { mockAnalysis } from "@/data/mock-analysis";
import { analysisService } from "@/services/analysis-service";
import type { AnalysisResponse, QuestionStatus } from "@/types/analysis";
import type { FullAnalysisResponse, UserContext } from "@/types/backend";

const defaultChecklistLabels = [
  "Confirm rent and payment date",
  "Confirm deposit amount",
  "Ask about deposit refund timeline",
  "Clarify lock-in and early exit",
  "Confirm notice period",
  "Confirm repair responsibilities",
  "Get important changes in writing",
  "Keep a copy of the signed agreement",
];

interface DemoState {
  analysis: AnalysisResponse;
  rawBackend?: FullAnalysisResponse;
  setAnalysis: (res: AnalysisResponse) => void;
  checklist: Record<string, boolean>;
  checklistLabels: string[];
  questionStatuses: Record<string, QuestionStatus>;
  addedQuestions: string[];
  toggleChecklist: (label: string) => void;
  setQuestionStatus: (id: string, status: QuestionStatus) => void;
  addQuestion: (id: string) => void;
  pendingText: string;
  setPendingText: (text: string) => void;
  pendingFile: File | null;
  setPendingFile: (file: File | null) => void;
  pendingFileName: string | null;
  setPendingFileName: (name: string | null) => void;
  userContext: UserContext;
  setUserContext: (ctx: UserContext | ((prev: UserContext) => UserContext)) => void;
  isAnalyzing: boolean;
  analysisError: string | null;
  runAnalysis: () => Promise<AnalysisResponse>;
  loadSampleAgreement: () => Promise<AnalysisResponse>;
}

const DemoContext = createContext<DemoState | undefined>(undefined);

export function DemoStateProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [analysis, setAnalysisState] = useState<AnalysisResponse>(mockAnalysis);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [questionStatuses, setQuestionStatuses] = useState<Record<string, QuestionStatus>>({});
  const [addedQuestions, setAddedQuestions] = useState<string[]>(["early-exit", "deposit-refund", "repairs"]);
  const [pendingText, setPendingText] = useState<string>("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingFileName, setPendingFileName] = useState<string | null>(null);
  const [userContext, setUserContext] = useState<UserContext>({});
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Compute checklist labels dynamically from backend checklist or defaults
  const checklistLabels = useMemo(() => {
    if (analysis.rawBackend?.checklist && analysis.rawBackend.checklist.length > 0) {
      return analysis.rawBackend.checklist.map((item) => item.text);
    }
    return defaultChecklistLabels;
  }, [analysis]);

  useEffect(() => {
    const saved = window.localStorage.getItem("leaselens-state-v2");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.analysis) setAnalysisState(parsed.analysis);
        if (parsed.checklist) setChecklist(parsed.checklist);
        if (parsed.questionStatuses) setQuestionStatuses(parsed.questionStatuses);
        if (parsed.addedQuestions) setAddedQuestions(parsed.addedQuestions);
        if (parsed.userContext) setUserContext(parsed.userContext);
      } catch {
        window.localStorage.removeItem("leaselens-state-v2");
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        "leaselens-state-v2",
        JSON.stringify({
          analysis,
          checklist,
          questionStatuses,
          addedQuestions,
          userContext,
        }),
      );
    } catch (e) {
      console.warn("Failed to persist state:", e);
    }
  }, [hydrated, analysis, checklist, questionStatuses, addedQuestions, userContext]);

  const setAnalysis = (newAnalysis: AnalysisResponse) => {
    setAnalysisState(newAnalysis);
    // If backend provided findings, initialize added questions to top findings
    if (newAnalysis.findings && newAnalysis.findings.length > 0) {
      const topIds = newAnalysis.findings
        .filter((f) => f.status === "discuss" || f.status === "clarify")
        .slice(0, 4)
        .map((f) => f.id);
      if (topIds.length > 0) {
        setAddedQuestions(topIds);
      }
    }
  };

  const runAnalysis = async (): Promise<AnalysisResponse> => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      let result: AnalysisResponse;
      if (pendingFile) {
        result = await analysisService.analyzePdf(pendingFile, userContext);
      } else if (pendingText.trim()) {
        result = await analysisService.analyzeText(pendingText, userContext);
      } else {
        // Fallback to sample
        const sample = await analysisService.getSampleAgreement();
        result = await analysisService.analyzeText(sample.text, userContext);
      }
      setAnalysis(result);
      setIsAnalyzing(false);
      return result;
    } catch (err: any) {
      const msg = err.message || "Failed to analyze document";
      setAnalysisError(msg);
      setIsAnalyzing(false);
      throw err;
    }
  };

  const loadSampleAgreement = async (): Promise<AnalysisResponse> => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const sample = await analysisService.getSampleAgreement();
      setPendingText(sample.text);
      setPendingFileName(sample.filename);
      setPendingFile(null);
      const result = await analysisService.analyzeText(sample.text, userContext);
      setAnalysis(result);
      setIsAnalyzing(false);
      return result;
    } catch (err: any) {
      const msg = err.message || "Failed to load sample agreement";
      setAnalysisError(msg);
      setIsAnalyzing(false);
      throw err;
    }
  };

  const value = useMemo<DemoState>(
    () => ({
      analysis,
      rawBackend: analysis.rawBackend,
      setAnalysis,
      checklist,
      checklistLabels,
      questionStatuses,
      addedQuestions,
      toggleChecklist: (label) =>
        setChecklist((current) => ({ ...current, [label]: !current[label] })),
      setQuestionStatus: (id, status) =>
        setQuestionStatuses((current) => ({ ...current, [id]: status })),
      addQuestion: (id) =>
        setAddedQuestions((current) =>
          current.includes(id) ? current : [...current, id],
        ),
      pendingText,
      setPendingText,
      pendingFile,
      setPendingFile,
      pendingFileName,
      setPendingFileName,
      userContext,
      setUserContext,
      isAnalyzing,
      analysisError,
      runAnalysis,
      loadSampleAgreement,
    }),
    [
      analysis,
      checklist,
      checklistLabels,
      questionStatuses,
      addedQuestions,
      pendingText,
      pendingFile,
      pendingFileName,
      userContext,
      isAnalyzing,
      analysisError,
    ],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemoState() {
  const value = useContext(DemoContext);
  if (!value) throw new Error("useDemoState must be used inside DemoStateProvider");
  return value;
}