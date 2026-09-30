import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowRight, FileText, Lightbulb } from "lucide-react";
import {
  AppShell,
  HeroPanel,
  InsightCard,
  StatusBadge,
  TermCard,
  TermChipRow,
} from "@/components/leaselens";
import { orderKeyTerms, termThemeAt } from "@/lib/term-themes";
import { useDemoState } from "@/hooks/use-demo-state";
import { cn } from "@/lib/utils";
import type { FindingStatus } from "@/types/analysis";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your agreement overview — LeaseLens" },
      { name: "description", content: "Key terms, findings and next steps from your rental agreement." },
      { property: "og:title", content: "Your agreement overview — LeaseLens" },
      { property: "og:description", content: "Key terms, findings and next steps from your rental agreement." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const statusDot: Record<FindingStatus, string> = {
  discuss: "bg-[#F2B01E]",
  clarify: "bg-brand-purple",
  understood: "bg-[#12B76A]",
  advice: "bg-[#E24C4C]",
};

function Page() {
  const { analysis, rawBackend } = useDemoState();
  const a = analysis;
  const { primary, extra } = orderKeyTerms(a.key_terms);

  const count = (status: FindingStatus) => a.findings.filter((f) => f.status === status).length;
  const total = a.findings.length || 1;
  const worth = a.findings.filter((f) => f.status !== "understood").slice(0, 3);

  const glance: [string, number, string][] = [
    ["To discuss", count("discuss"), "bg-[#F2B01E]"],
    ["To clarify", count("clarify"), "bg-brand-purple"],
    ["Looks clear", count("understood"), "bg-[#12B76A]"],
  ];

  return (
    <AppShell>
      <div className="space-y-5 sm:space-y-6">
        <HeroPanel
          eyebrow={a.agreement_name}
          title="Here's what your agreement says."
          body="Start with the key terms, then look at the few points worth talking through before you sign."
          note={rawBackend?.context_notes?.[0]?.text}
          action={
            <Link
              to="/findings"
              className="inline-flex h-12 items-center gap-2.5 rounded-xl bg-brand-deep-teal px-6 text-[15px] font-bold text-white shadow-[0_18px_34px_-16px_oklch(0.486_0.082_188.1_/_0.9)] transition-colors hover:bg-[#095B56]"
            >
              Review findings
              <ArrowRight className="size-[18px]" />
            </Link>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {primary.map((term, index) => (
            <TermCard key={term.id} term={term} theme={termThemeAt(index)} />
          ))}
        </div>

        {extra.length > 0 && <TermChipRow terms={extra} />}

        <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
          <InsightCard
            to="/findings"
            title="Worth a closer look"
            icon={<FileText className="size-5" />}
            footer={`See all ${a.findings.length} findings`}
          >
            {worth.length > 0 ? (
              <ul className="space-y-1">
                {worth.map((finding) => (
                  <li
                    key={finding.id}
                    className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors group-hover:bg-[#F6F9FE]"
                  >
                    <span className={cn("size-2 shrink-0 rounded-full", statusDot[finding.status])} />
                    <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-muted-foreground">
                      {finding.title}
                    </span>
                    <StatusBadge status={finding.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-2 py-3 text-sm text-muted-foreground">
                Nothing flagged — everything in this agreement looks clear.
              </p>
            )}
          </InsightCard>

          <InsightCard
            to="/early-exit"
            title="At a glance"
            icon={<Lightbulb className="size-5" />}
            footer="See how early exit works"
          >
            <ul className="space-y-1">
              {glance.map(([label, value, dot]) => (
                <li key={label} className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors group-hover:bg-[#F6F9FE]">
                  <span className={cn("size-2 shrink-0 rounded-full", dot)} />
                  <span className="w-[104px] shrink-0 text-[13.5px] font-semibold text-muted-foreground">{label}</span>
                  <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[#EEF3F9]">
                    <span
                      className={cn("block h-full rounded-full", dot)}
                      style={{ width: `${Math.round((value / total) * 100)}%` }}
                    />
                  </span>
                  <span className="w-6 shrink-0 text-right text-[13.5px] font-extrabold text-brand-navy">{value}</span>
                </li>
              ))}
            </ul>
          </InsightCard>
        </div>
      </div>
    </AppShell>
  );
}
