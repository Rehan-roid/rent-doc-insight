import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppShell, KeyTermCard, SectionHeading, StatusBadge } from "@/components/leaselens";
import { useDemoState } from "@/hooks/use-demo-state";

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

function Page() {
  const { analysis, rawBackend } = useDemoState();
  const a = analysis;
  const count = (s: string) => a.findings.filter((f) => f.status === s).length;

  return (
    <AppShell>
      {rawBackend?.context_notes && rawBackend.context_notes.length > 0 && (
        <div className="mb-6 border-l-4 border-primary bg-secondary/30 p-4">
          <div className="flex items-start gap-2.5">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="text-sm font-medium text-foreground">
              {rawBackend.context_notes[0].text}
            </p>
          </div>
        </div>
      )}

      <SectionHeading
        eyebrow={a.agreement_name.toUpperCase()}
        title="Here's what your agreement says."
        body="Start with the key terms, then look at the few points worth talking through before you sign."
        action={
          <Button asChild>
            <Link to="/findings">
              Review findings <ArrowRight />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
        {a.key_terms.map((t) => (
          <KeyTermCard key={t.id} term={t} />
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <section className="border border-border bg-card p-6 lg:col-span-2">
          <h2 className="text-lg font-bold">Worth a closer look</h2>
          <ul className="mt-4 divide-y divide-border">
            {a.findings
              .filter((f) => f.status !== "understood")
              .map((f) => (
                <li key={f.id} className="flex items-center justify-between gap-4 py-3">
                  <span className="text-sm font-medium">{f.title}</span>
                  <StatusBadge status={f.status} />
                </li>
              ))}
          </ul>
        </section>

        <section className="border border-border bg-card p-6">
          <h2 className="text-lg font-bold">At a glance</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt>To discuss</dt>
              <dd className="font-bold">{count("discuss")}</dd>
            </div>
            <div className="flex justify-between">
              <dt>To clarify</dt>
              <dd className="font-bold">{count("clarify")}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Looks clear</dt>
              <dd className="font-bold">{count("understood")}</dd>
            </div>
          </dl>
          <Button asChild variant="outline" className="mt-6 w-full">
            <Link to="/early-exit">See how early exit works</Link>
          </Button>
        </section>
      </div>
    </AppShell>
  );
}
