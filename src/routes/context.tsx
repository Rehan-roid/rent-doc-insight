import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/leaselens";
import { useDemoState } from "@/hooks/use-demo-state";
import { cn } from "@/lib/utils";
import type { ExpectedStay, Role, UserContext, UserPriority } from "@/types/backend";

export const Route = createFileRoute("/context")({
  head: () => ({
    meta: [
      { title: "Your renter context — LeaseLens" },
      { name: "description", content: "Optionally tell LeaseLens what matters most so findings can be ordered for you." },
      { property: "og:title", content: "Your renter context — LeaseLens" },
      { property: "og:description", content: "Three optional questions help organize your agreement findings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContextPage,
});

function ContextPage() {
  const navigate = useNavigate();
  const { setUserContext } = useDemoState();
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const questions = [
    { id: "profile", label: "I am", options: ["Student", "Working professional", "Other"] },
    { id: "stay", label: "Expected stay", options: ["Under 6 months", "6–12 months", "1+ year"] },
    { id: "priority", label: "What matters most?", options: ["Flexibility", "Deposit", "Monthly cost", "Repairs"] },
  ];

  const mapAnswersToContext = (): UserContext => {
    let role: Role | undefined = undefined;
    if (answers.profile === "Student") role = "student";
    else if (answers.profile === "Working professional") role = "working_professional";
    else if (answers.profile === "Other") role = "other";

    let expected_stay: ExpectedStay | undefined = undefined;
    if (answers.stay === "Under 6 months") expected_stay = "under_6_months";
    else if (answers.stay === "6–12 months") expected_stay = "6_to_12_months";
    else if (answers.stay === "1+ year") expected_stay = "over_12_months";

    let priority: UserPriority | undefined = undefined;
    if (answers.priority === "Flexibility") priority = "flexibility";
    else if (answers.priority === "Deposit") priority = "deposit";
    else if (answers.priority === "Monthly cost") priority = "monthly_cost";
    else if (answers.priority === "Repairs") priority = "repairs";

    return { role, expected_stay, priority };
  };

  const proceedWithContext = () => {
    const ctx = mapAnswersToContext();
    setUserContext(ctx);
    navigate({ to: "/reading" });
  };

  const skipContext = () => {
    setUserContext({});
    navigate({ to: "/reading" });
  };

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex h-20 max-w-5xl items-center px-4">
        <Logo />
      </header>
      <main className="page-enter mx-auto max-w-3xl px-4 py-10">
        <p className="text-xs font-bold text-secondary-foreground">OPTIONAL CONTEXT</p>
        <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">A little context helps us organize your results.</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          This only changes the order of findings. It never hides anything or changes what the agreement says.
        </p>

        <div className="mt-9 space-y-8">
          {questions.map((question, index) => (
            <fieldset key={question.id}>
              <legend className="text-sm font-bold">
                <span className="mr-2 text-muted-foreground">{index + 1}.</span>
                {question.label}
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {question.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setAnswers((current) => ({ ...current, [question.id]: option }))}
                    className={cn(
                      "rounded-md border px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      answers[question.id] === option
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card hover:border-primary/40",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-between">
          <Button variant="ghost" onClick={skipContext}>
            Skip for now
          </Button>
          <Button onClick={proceedWithContext}>
            See my results <ArrowRight />
          </Button>
        </div>
      </main>
    </div>
  );
}