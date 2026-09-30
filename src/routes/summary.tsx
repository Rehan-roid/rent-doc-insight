import { createFileRoute } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppShell, KeyTermCard, SectionHeading } from "@/components/leaselens";
import { mockAnalysis } from "@/data/mock-analysis";
import { useDemoState } from "@/hooks/use-demo-state";

export const Route = createFileRoute("/summary")({
  head: () => ({ meta: [
    { title: "Summary — LeaseLens" }, { name: "description", content: "A printable summary of your agreement's key terms and open questions." },
    { property: "og:title", content: "Summary — LeaseLens" }, { property: "og:description", content: "A printable summary of your agreement's key terms and open questions." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ]}),
  component: Page,
});

function Page() {
  const { addedQuestions, questionStatuses } = useDemoState();
  const a = mockAnalysis;
  return <AppShell>
    <SectionHeading eyebrow="SUMMARY" title={a.agreement_name} body="Share or print this before your conversation with the landlord." action={<Button onClick={() => window.print()} data-no-print><Printer /> Print</Button>} />
    <div className="grid gap-px bg-border sm:grid-cols-3">{a.key_terms.map((t) => <KeyTermCard key={t.id} term={t} />)}</div>
    <h2 className="mt-10 text-xl font-bold">Open questions</h2>
    <ul className="mt-4 divide-y divide-border border border-border bg-card">{a.findings.filter((f) => addedQuestions.includes(f.id)).map((f) => <li key={f.id} className="flex justify-between gap-4 p-4 text-sm"><span>{f.question}</span><span className="shrink-0 font-semibold text-muted-foreground">{questionStatuses[f.id] ?? "Not asked"}</span></li>)}</ul>
  </AppShell>;
}
