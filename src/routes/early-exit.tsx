import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, Calculator, Info } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AppShell, SectionHeading } from "@/components/leaselens";
import { useDemoState } from "@/hooks/use-demo-state";

export const Route = createFileRoute("/early-exit")({
  head: () => ({
    meta: [
      { title: "Early exit & connections — LeaseLens" },
      { name: "description", content: "How lock-in, notice and early termination clauses combine in your agreement." },
      { property: "og:title", content: "Early exit & connections — LeaseLens" },
      { property: "og:description", content: "How lock-in, notice and early termination clauses combine in your agreement." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  const { analysis, rawBackend } = useDemoState();
  const a = analysis;

  // Find early-exit interaction & calculation from rawBackend if available
  const earlyExitInter = rawBackend?.interactions.find((i) => i.pattern === "early_exit");
  const calculation = earlyExitInter?.calculation;

  const defaultMonth = calculation?.default_leave_after_months || 4;
  const maxMonths = calculation?.exposure_by_month?.length || 6;
  const [selectedMonth, setSelectedMonth] = useState<number>(defaultMonth);

  const selectedExposure = calculation?.exposure_by_month?.find(
    (p) => p.leave_after_months === selectedMonth,
  );

  return (
    <AppShell>
      <SectionHeading
        eyebrow="HOW CLAUSES CONNECT"
        title="If you need to leave early"
        body="Some clauses only make sense when read together. Here's how they combine."
      />

      {/* Interactive Early-Exit Calculator Section */}
      {calculation && calculation.available && (
        <section className="mb-10 border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-2.5 text-xs font-bold text-secondary-foreground">
            <Calculator className="size-4" />
            <span>EARLY-EXIT POTENTIAL EXPOSURE</span>
          </div>

          <h2 className="mt-2 text-2xl font-extrabold">If I leave after {selectedMonth} months</h2>
          <p className="mt-1 text-xs text-muted-foreground">{calculation.wording}</p>

          <div className="mt-6 flex flex-col items-start justify-between gap-6 rounded-lg border border-border bg-background p-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-3xl font-extrabold text-foreground">
                {selectedExposure ? `₹${selectedExposure.amount.toLocaleString("en-IN")}` : "₹0"}
              </p>
              <p className="mt-1 text-sm font-medium text-secondary-foreground">
                {selectedExposure?.formula || "No penalty"}
              </p>
            </div>

            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>Month 1</span>
                <span>Month {selectedMonth}</span>
                <span>Month {maxMonths}</span>
              </div>
              <input
                type="range"
                min={1}
                max={maxMonths}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="h-2 w-full cursor-pointer accent-primary"
              />
            </div>
          </div>

          {calculation.assumptions.length > 0 && (
            <div className="mt-6 border-t border-border pt-4">
              <p className="text-xs font-bold text-muted-foreground">ASSUMPTIONS:</p>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                {calculation.assumptions.map((assump, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 rounded-full bg-secondary-foreground shrink-0" />
                    <span>{assump}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {calculation && !calculation.available && (
        <div className="mb-10 border-l-4 border-attention-foreground bg-attention/30 p-5">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 size-5 shrink-0 text-attention-foreground" />
            <div>
              <p className="font-bold">Early exit financial terms not specified</p>
              <p className="mt-1 text-sm">{calculation.reason_unavailable}</p>
            </div>
          </div>
        </div>
      )}

      {/* Connected Interaction Cards */}
      <h2 className="mb-4 text-xl font-bold">Connected clause patterns</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {a.interactions.map((i) => (
          <article key={i.id} className="border border-border bg-card p-6">
            <h3 className="text-lg font-bold">{i.title}</h3>
            <p className="mt-1 text-xs font-semibold text-secondary-foreground">{i.formula}</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{i.summary}</p>
          </article>
        ))}
      </div>

      {/* Inconsistencies detected */}
      {a.inconsistencies.map((x) => (
        <div key={x.id} className="mt-8 border-l-4 border-attention-foreground bg-attention/40 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-attention-foreground" />
            <div>
              <p className="font-bold">{x.title}</p>
              <p className="mt-1 text-sm">{x.detail}</p>
            </div>
          </div>
        </div>
      ))}

      <div className="mt-8 flex justify-between">
        <Button asChild variant="outline">
          <Link to="/findings">Review all findings</Link>
        </Button>
        <Button asChild>
          <Link to="/action-plan">Turn this into questions</Link>
        </Button>
      </div>
    </AppShell>
  );
}
