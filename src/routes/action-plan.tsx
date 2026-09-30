import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Copy, MessageSquare, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AppShell, SectionHeading } from "@/components/leaselens";
import { useDemoState } from "@/hooks/use-demo-state";
import type { QuestionStatus } from "@/types/analysis";

export const Route = createFileRoute("/action-plan")({
  head: () => ({
    meta: [
      { title: "Action plan — LeaseLens" },
      { name: "description", content: "Questions to ask your landlord and track until they are agreed in writing." },
      { property: "og:title", content: "Action plan — LeaseLens" },
      { property: "og:description", content: "Questions to ask your landlord and track until they are agreed in writing." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const statuses: QuestionStatus[] = [
  "Not asked",
  "Asked",
  "Answered",
  "Agreed in writing",
  "Resolved",
  "Accepted as-is",
  "Get professional advice",
];

function Page() {
  const { analysis, rawBackend, addedQuestions, questionStatuses, setQuestionStatus } = useDemoState();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Items can come from rawBackend.action_plan or analysis.findings filtered by addedQuestions
  const backendActions = rawBackend?.action_plan;
  const items = analysis.findings.filter((f) => addedQuestions.includes(f.id));

  // Calculate progress stats
  const totalCount = items.length;
  const askedCount = items.filter(
    (f) =>
      questionStatuses[f.id] &&
      questionStatuses[f.id] !== "Not asked",
  ).length;
  const agreedInWritingCount = items.filter(
    (f) => questionStatuses[f.id] === "Agreed in writing",
  ).length;

  const copyLandlordMessage = (findingId: string, question: string, title: string) => {
    // Find custom message in backend action plan if available
    const backendAction = backendActions?.find((a) => a.id.includes(findingId));
    const msg =
      backendAction?.landlord_message ||
      `Hi, before signing I wanted to clarify one point regarding ${title.toLowerCase()}. ${question}`;

    navigator.clipboard.writeText(msg);
    setCopiedId(findingId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <AppShell>
      <SectionHeading
        eyebrow="ACTION PLAN"
        title="Questions to ask before signing"
        body="Track each answer. Anything important should end up agreed in writing."
        action={
          <div className="rounded-md border border-border bg-card px-4 py-2 text-xs font-semibold">
            <span>
              {askedCount} of {totalCount} asked • {agreedInWritingCount} agreed in writing
            </span>
          </div>
        }
      />

      {items.length === 0 ? (
        <div className="border border-dashed border-border bg-card p-8 text-center">
          <MessageSquare className="mx-auto size-8 text-muted-foreground" />
          <h3 className="mt-3 font-bold">No questions in your action plan yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse the agreement findings and add items worth asking your landlord.
          </p>
          <Button asChild className="mt-5">
            <Link to="/findings">Review findings</Link>
          </Button>
        </div>
      ) : (
        <ol className="space-y-4">
          {items.map((f, n) => {
            const currentStatus = questionStatuses[f.id] ?? "Not asked";
            return (
              <li key={f.id} className="border border-border bg-card p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="max-w-2xl">
                    <p className="text-xs font-bold text-secondary-foreground">
                      QUESTION {n + 1} • {f.title}
                    </p>
                    <p className="mt-2 text-base font-semibold text-foreground">{f.question}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{f.summary}</p>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <select
                      aria-label={`Status for ${f.title}`}
                      value={currentStatus}
                      onChange={(e) => setQuestionStatus(f.id, e.target.value as QuestionStatus)}
                      className="h-10 rounded-md border border-input bg-background px-3 text-sm font-medium"
                    >
                      {statuses.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyLandlordMessage(f.id, f.question, f.title)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      {copiedId === f.id ? (
                        <>
                          <Check className="mr-1 size-3.5 text-success-foreground" /> Copied message
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1 size-3.5" /> Copy polite message
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Verbal answer warning banner */}
                {currentStatus === "Answered" && (
                  <div className="mt-4 border-l-4 border-attention-foreground bg-attention/30 p-3 text-xs text-attention-foreground">
                    <strong>Note:</strong> A spoken answer isn't the same as a written one. Consider getting it in writing (WhatsApp, email, or addendum).
                  </div>
                )}

                {currentStatus === "Agreed in writing" && (
                  <div className="mt-4 border-l-4 border-success-foreground bg-success/20 p-3 text-xs text-success-foreground">
                    <span className="font-bold">Agreed in writing:</span> Ensure you retain a copy of the written confirmation or signed amendment.
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}

      <div className="mt-8 flex justify-between">
        <Button asChild variant="outline">
          <Link to="/findings">Add more questions</Link>
        </Button>
        <Button asChild>
          <Link to="/checklist">View signing checklist</Link>
        </Button>
      </div>
    </AppShell>
  );
}
