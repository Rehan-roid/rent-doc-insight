import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, ClipboardPaste, FileCheck, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DisclaimerBanner, Navbar, ProductPreview } from "@/components/leaselens";
import { useDemoState } from "@/hooks/use-demo-state";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LeaseLens — Understand your rental agreement" },
      { name: "description", content: "Turn complicated rental agreements into clear terms, useful questions, and exact evidence." },
      { property: "og:title", content: "LeaseLens — Understand it before you sign it" },
      { property: "og:description", content: "Clear rental terms, questions, and source evidence for first-time renters." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const navigate = useNavigate();
  const { loadSampleAgreement } = useDemoState();

  const handleTrySample = async () => {
    try {
      await loadSampleAgreement();
      navigate({ to: "/dashboard" });
    } catch {
      navigate({ to: "/dashboard" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar landing />
      <main>
        <section className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-20">
          <div className="page-enter">
            <p className="text-xs font-extrabold text-secondary-foreground">RENTAL AGREEMENT CLARITY</p>
            <h1 className="mt-5 max-w-2xl text-4xl font-extrabold leading-[1.12] sm:text-5xl lg:text-6xl">
              Know what you're signing before you sign it.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              LeaseLens turns complicated rental agreements into clear terms, questions, and evidence you can actually use.
            </p>
            <div className="mt-8 flex flex-col flex-wrap gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link to="/upload">
                  <Upload /> Upload agreement
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/upload" search={{ mode: "paste" }}>
                  <ClipboardPaste /> Paste text
                </Link>
              </Button>
              <Button size="lg" variant="ghost" onClick={handleTrySample} className="text-muted-foreground hover:text-foreground">
                <FileCheck className="mr-1.5 size-4" /> Try sample agreement
              </Button>
            </div>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Check className="size-3.5 text-success-foreground" /> Your document stays private. PII is redacted.
              </span>
              <DisclaimerBanner compact />
            </div>
          </div>
          <div className="page-enter">
            <ProductPreview />
          </div>
        </section>

        <section id="how-it-works" className="border-y border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <p className="text-xs font-bold text-secondary-foreground">HOW IT WORKS</p>
            <h2 className="mt-3 text-3xl font-extrabold">From document to useful conversation.</h2>
            <div className="mt-9 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-3">
              {[
                ["01", "Share your agreement", "Upload a PDF or paste the wording for analysis."],
                ["02", "Review with evidence", "See key terms, connected clauses, and the exact source wording."],
                ["03", "Get it in writing", "Turn unclear terms into questions and track each answer."],
              ].map(([n, t, d]) => (
                <div key={n} className="bg-background p-6">
                  <p className="text-xs font-bold text-secondary-foreground">{n}</p>
                  <h3 className="mt-4 font-bold">{t}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="what-you-get" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold text-secondary-foreground">WHAT YOU GET</p>
              <h2 className="mt-3 text-3xl font-extrabold">Clarity you can act on.</h2>
            </div>
            <Button variant="soft" asChild>
              <Link to="/upload">
                Start with your agreement <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <DisclaimerBanner />
    </div>
  );
}