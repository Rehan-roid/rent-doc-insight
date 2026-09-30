import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertCircle, Check, Circle, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/leaselens";
import { useDemoState } from "@/hooks/use-demo-state";

export const Route = createFileRoute("/reading")({
  head: () => ({
    meta: [
      { title: "Reading your agreement — LeaseLens" },
      { name: "description", content: "LeaseLens is organizing the terms and clauses in your agreement." },
      { property: "og:title", content: "Reading your agreement — LeaseLens" },
      { property: "og:description", content: "Organizing key terms, connected clauses, and questions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReadingPage,
});

function ReadingPage() {
  const navigate = useNavigate();
  const { runAnalysis, analysisError } = useDemoState();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const analysisCompleteRef = useRef(false);

  const steps = [
    "Finding key terms & amounts",
    "Connecting related clauses",
    "Preparing questions for the landlord",
    "Building your custom checklist",
  ];

  useEffect(() => {
    let timer: number;
    let isCancelled = false;

    // Advance UI progress steps
    timer = window.setInterval(() => {
      setStep((curr) => {
        if (curr < steps.length - 1) return curr + 1;
        return curr;
      });
    }, 600);

    // Execute analysis
    const start = async () => {
      try {
        await runAnalysis();
        analysisCompleteRef.current = true;
        setStep(steps.length);
        setTimeout(() => {
          if (!isCancelled) {
            navigate({ to: "/dashboard" });
          }
        }, 500);
      } catch (err: any) {
        if (!isCancelled) {
          setError(err.message || "Could not analyze the agreement. Please try again.");
        }
      }
    };

    start();

    return () => {
      isCancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const handleRetry = async () => {
    setError(null);
    setStep(0);
    try {
      await runAnalysis();
      setStep(steps.length);
      setTimeout(() => navigate({ to: "/dashboard" }), 400);
    } catch (err: any) {
      setError(err.message || "Failed to analyze document");
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex h-20 w-full max-w-5xl items-center px-4">
        <Logo />
      </header>
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 pb-24">
        {error ? (
          <div className="border border-destructive/30 bg-destructive/10 p-6 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-destructive/20 text-destructive">
              <AlertCircle className="size-6" />
            </span>
            <h2 className="mt-4 text-xl font-bold">Analysis Could Not Complete</h2>
            <p className="mt-2 text-sm text-muted-foreground">{error || analysisError}</p>
            <div className="mt-6 flex justify-center gap-3">
              <Button variant="outline" onClick={() => navigate({ to: "/upload" })}>
                Back to upload
              </Button>
              <Button onClick={handleRetry}>
                <RefreshCw className="mr-1.5 size-4" /> Try again
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid size-16 place-items-center rounded-full bg-secondary text-secondary-foreground">
              <span className="size-7 animate-pulse rounded-sm border-2 border-current" />
            </div>
            <h1 className="mt-7 text-3xl font-extrabold">Reading your agreement</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              We're organizing the wording into a calm, evidence-backed review.
            </p>
            <div className="mt-9 space-y-1">
              {steps.map((label, index) => (
                <div key={label} className="flex items-center gap-4 border-b border-border py-4 last:border-0">
                  {index < step ? (
                    <span className="grid size-6 place-items-center rounded-full bg-success text-success-foreground">
                      <Check className="size-4" />
                    </span>
                  ) : (
                    <Circle
                      className={
                        index === step
                          ? "size-6 animate-pulse text-secondary-foreground"
                          : "size-6 text-border"
                      }
                    />
                  )}
                  <span className={index <= step ? "text-sm font-semibold" : "text-sm text-muted-foreground"}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}