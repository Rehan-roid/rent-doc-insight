import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, EmptyState, EvidencePanel, FindingCard, SectionHeading } from "@/components/leaselens";
import { mockAnalysis } from "@/data/mock-analysis";
import { cn } from "@/lib/utils";
import type { Finding, FindingStatus } from "@/types/analysis";

export const Route = createFileRoute("/findings")({
  head: () => ({ meta: [
    { title: "Findings — LeaseLens" }, { name: "description", content: "Clauses in your rental agreement worth discussing, clarifying, or already clear." },
    { property: "og:title", content: "Findings — LeaseLens" }, { property: "og:description", content: "Clauses in your rental agreement worth discussing, clarifying, or already clear." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ]}),
  component: Page,
});

const filters: [string, FindingStatus | "all"][] = [["All", "all"], ["Discuss", "discuss"], ["Clarify", "clarify"], ["Understood", "understood"]];
function Page() {
  const [filter, setFilter] = useState<FindingStatus | "all">("all");
  const [active, setActive] = useState<Finding>();
  const list = mockAnalysis.findings.filter((f) => filter === "all" || f.status === filter);
  return <AppShell>
    <SectionHeading eyebrow="FINDINGS" title="What to talk through" body="Each point links back to the exact wording, so you can check it yourself." />
    <div className="mb-6 flex flex-wrap gap-2" role="tablist">{filters.map(([l, v]) => <button key={v} role="tab" aria-selected={filter === v} onClick={() => setFilter(v)} className={cn("rounded-md border px-3 py-1.5 text-sm font-medium", filter === v ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card")}>{l}</button>)}</div>
    <div className="space-y-4">{list.length ? list.map((f) => <FindingCard key={f.id} finding={f} onViewSource={() => setActive(f)} />) : <EmptyState />}</div>
    <EvidencePanel finding={active} open={Boolean(active)} onOpenChange={(o) => !o && setActive(undefined)} />
  </AppShell>;
}
