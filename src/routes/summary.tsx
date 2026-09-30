import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy, Printer } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AppShell, KeyTermCard, SectionHeading } from "@/components/leaselens";
import { useDemoState } from "@/hooks/use-demo-state";

export const Route = createFileRoute("/summary")({
  head: () => ({
    meta: [
      { title: "Summary — LeaseLens" },
      { name: "description", content: "A printable summary of your agreement's key terms and open questions." },
      { property: "og:title", content: "Summary — LeaseLens" },
      { property: "og:description", content: "A printable summary of your agreement's key terms and open questions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  const { analysis, addedQuestions, questionStatuses, checklist, checklistLabels } = useDemoState();
  const [copied, setCopied] = useState(false);
  const a = analysis;

  const openQuestions = a.findings.filter((f) => addedQuestions.includes(f.id));

  const copyTextSummary = () => {
    const lines = [
      `LEASELENS SUMMARY: ${a.agreement_name}`,
      `Tagline: Understand it. Question it. Get it in writing.`,
      `----------------------------------------------------`,
      `KEY TERMS:`,
      ...a.key_terms.map((t) => `• ${t.label}: ${t.value}`),
      ``,
      `QUESTIONS FOR LANDLORD & STATUS:`,
      ...openQuestions.map(
        (f, i) =>
          `${i + 1}. [${questionStatuses[f.id] || "Not asked"}] ${f.title}\n   Question: ${f.question}`,
      ),
      ``,
      `CHECKLIST PROGRESS:`,
      ...checklistLabels.map((l) => `[${checklist[l] ? "X" : " "}] ${l}`),
      ``,
      `Disclaimer: This explains the document. It isn't legal advice.`,
    ];

    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <AppShell>
      <SectionHeading
        eyebrow="SUMMARY"
        title={a.agreement_name}
        body="Share, copy, or print this summary before your conversation with the landlord."
        action={
          <div className="flex gap-2" data-no-print>
            <Button variant="outline" onClick={copyTextSummary}>
              {copied ? (
                <>
                  <Check className="mr-1.5 size-4 text-success-foreground" /> Copied summary
                </>
              ) : (
                <>
                  <Copy className="mr-1.5 size-4" /> Copy summary
                </>
              )}
            </Button>
            <Button onClick={() => window.print()}>
              <Printer className="mr-1.5 size-4" /> Print
            </Button>
          </div>
        }
      />

      <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
        {a.key_terms.map((t) => (
          <KeyTermCard key={t.id} term={t} />
        ))}
      </div>

      <h2 className="mt-10 text-xl font-bold">Questions to track with landlord</h2>
      <ul className="mt-4 divide-y divide-border border border-border bg-card">
        {openQuestions.length > 0 ? (
          openQuestions.map((f) => (
            <li key={f.id} className="flex flex-col justify-between gap-3 p-4 text-sm sm:flex-row sm:items-center">
              <div>
                <p className="font-bold text-foreground">{f.title}</p>
                <p className="text-muted-foreground">{f.question}</p>
              </div>
              <span className="shrink-0 rounded bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                {questionStatuses[f.id] ?? "Not asked"}
              </span>
            </li>
          ))
        ) : (
          <li className="p-4 text-sm text-muted-foreground">No questions added yet.</li>
        )}
      </ul>

      <h2 className="mt-10 text-xl font-bold">Signing & move-in progress</h2>
      <div className="mt-4 border border-border bg-card p-4">
        <ul className="space-y-2 text-sm">
          {checklistLabels.map((label) => (
            <li key={label} className="flex items-center gap-2.5">
              <span
                className={`size-2 rounded-full ${
                  checklist[label] ? "bg-success" : "bg-border"
                }`}
              />
              <span className={checklist[label] ? "text-muted-foreground line-through" : ""}>
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
        This explains the document. It isn't legal advice.
      </div>
    </AppShell>
  );
}
