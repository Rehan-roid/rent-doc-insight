import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { QuestionStatus } from "@/types/analysis";

const checklistLabels = [
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
  checklist: Record<string, boolean>;
  checklistLabels: string[];
  questionStatuses: Record<string, QuestionStatus>;
  addedQuestions: string[];
  toggleChecklist: (label: string) => void;
  setQuestionStatus: (id: string, status: QuestionStatus) => void;
  addQuestion: (id: string) => void;
}

const DemoContext = createContext<DemoState | undefined>(undefined);

export function DemoStateProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [questionStatuses, setQuestionStatuses] = useState<Record<string, QuestionStatus>>({});
  const [addedQuestions, setAddedQuestions] = useState<string[]>(["early-exit", "deposit-refund", "repairs"]);

  useEffect(() => {
    const saved = window.localStorage.getItem("leaselens-demo-state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<Pick<DemoState, "checklist" | "questionStatuses" | "addedQuestions">>;
        setChecklist(parsed.checklist ?? {});
        setQuestionStatuses(parsed.questionStatuses ?? {});
        setAddedQuestions(parsed.addedQuestions ?? ["early-exit", "deposit-refund", "repairs"]);
      } catch {
        window.localStorage.removeItem("leaselens-demo-state");
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(
      "leaselens-demo-state",
      JSON.stringify({ checklist, questionStatuses, addedQuestions }),
    );
  }, [hydrated, checklist, questionStatuses, addedQuestions]);

  const value = useMemo<DemoState>(() => ({
    checklist,
    checklistLabels,
    questionStatuses,
    addedQuestions,
    toggleChecklist: (label) => setChecklist((current) => ({ ...current, [label]: !current[label] })),
    setQuestionStatus: (id, status) => setQuestionStatuses((current) => ({ ...current, [id]: status })),
    addQuestion: (id) => setAddedQuestions((current) => current.includes(id) ? current : [...current, id]),
  }), [checklist, questionStatuses, addedQuestions]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemoState() {
  const value = useContext(DemoContext);
  if (!value) throw new Error("useDemoState must be used inside DemoStateProvider");
  return value;
}