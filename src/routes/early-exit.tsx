import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { AppShell, SectionHeading } from "@/components/leaselens";
import { mockAnalysis } from "@/data/mock-analysis";

export const Route = createFileRoute("/early-exit")({
  head: () => ({ meta: [
    { title: "Early exit explained — LeaseLens" }, { name: "description", content: "How lock-in, notice and early termination clauses combine in your agreement." },
    { property: "og:title", content: "Early exit explained — LeaseLens" }, { property: "og:description", content: "How lock-in, notice and early termination clauses combine in your agreement." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ]}),
  component: Page,
});

function Page() {
  const a = mockAnalysis;
  return <AppShell>
    <SectionHeading eyebrow="HOW CLAUSES CONNECT" title="If you need to leave early" body="Some clauses only make sense together. Here's how they combine." />
    <div className="grid gap-4 md:grid-cols-2">{a.interactions.map((i) => <article key={i.id} className="border border-border bg-card p-6"><h2 className="text-lg font-bold">{i.title}</h2><p className="mt-1 text-xs font-semibold text-secondary-foreground">{i.formula}</p><p className="mt-3 text-sm leading-6 text-muted-foreground">{i.summary}</p></article>)}</div>
    {a.inconsistencies.map((x) => <div key={x.id} className="mt-8 border-l-4 border-attention-foreground bg-attention/40 p-5"><p className="font-bold">{x.title}</p><p className="mt-1 text-sm">{x.detail}</p></div>)}
    <Button asChild className="mt-8"><Link to="/action-plan">Turn this into questions</Link></Button>
  </AppShell>;
}
