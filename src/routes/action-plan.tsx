import { createFileRoute } from "@tanstack/react-router";
import { AppShell, SectionHeading } from "@/components/leaselens";
import { mockAnalysis } from "@/data/mock-analysis";
import { useDemoState } from "@/hooks/use-demo-state";
import type { QuestionStatus } from "@/types/analysis";

export const Route = createFileRoute("/action-plan")({
  head: () => ({ meta: [
    { title: "Action plan — LeaseLens" }, { name: "description", content: "Questions to ask your landlord and track until they are agreed in writing." },
    { property: "og:title", content: "Action plan — LeaseLens" }, { property: "og:description", content: "Questions to ask your landlord and track until they are agreed in writing." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ]}),
  component: Page,
});

const statuses: QuestionStatus[] = ["Not asked", "Asked", "Answered", "Agreed in writing", "Resolved", "Accepted as-is", "Get professional advice"];
function Page() {
  const { addedQuestions, questionStatuses, setQuestionStatus } = useDemoState();
  const items = mockAnalysis.findings.filter((f) => addedQuestions.includes(f.id));
  return <AppShell>
    <SectionHeading eyebrow="ACTION PLAN" title="Questions to ask before signing" body="Track each answer. Anything important should end up in writing." />
    <ol className="space-y-3">{items.map((f, n) => <li key={f.id} className="flex flex-col gap-4 border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold text-muted-foreground">{n + 1}. {f.title}</p><p className="mt-1 font-medium">{f.question}</p></div><select aria-label={`Status for ${f.title}`} value={questionStatuses[f.id] ?? "Not asked"} onChange={(e) => setQuestionStatus(f.id, e.target.value as QuestionStatus)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">{statuses.map((s) => <option key={s}>{s}</option>)}</select></li>)}</ol>
  </AppShell>;
}
