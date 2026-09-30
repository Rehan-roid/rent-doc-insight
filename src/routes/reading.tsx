import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Circle } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/leaselens";

export const Route = createFileRoute("/reading")({ head: () => ({ meta: [
  { title: "Reading your agreement — LeaseLens" }, { name: "description", content: "LeaseLens is organizing the terms and clauses in your demo agreement." },
  { property: "og:title", content: "Reading your agreement — LeaseLens" }, { property: "og:description", content: "Organizing key terms, connected clauses, and questions." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
]}), component: ReadingPage });

function ReadingPage() {
  const navigate = useNavigate(); const [step, setStep] = useState(0);
  useEffect(() => { const timer = window.setInterval(() => setStep((value) => value + 1), 650); return () => window.clearInterval(timer); }, []);
  useEffect(() => { if (step >= 4) { const next = window.setTimeout(() => navigate({ to: "/context" }), 450); return () => window.clearTimeout(next); } return undefined; }, [step, navigate]);
  const steps = ["Finding key terms", "Connecting related clauses", "Preparing questions", "Building your checklist"];
  return <div className="flex min-h-screen flex-col"><header className="mx-auto flex h-20 w-full max-w-5xl items-center px-4"><Logo /></header><main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 pb-24"><div className="grid size-16 place-items-center rounded-full bg-secondary text-secondary-foreground"><span className="size-7 animate-pulse rounded-sm border-2 border-current" /></div><h1 className="mt-7 text-3xl font-extrabold">Reading your agreement</h1><p className="mt-3 text-sm text-muted-foreground">We're organizing the wording into a clear review.</p><div className="mt-9 space-y-1">{steps.map((label, index) => <div key={label} className="flex items-center gap-4 border-b border-border py-4 last:border-0">{index < step ? <span className="grid size-6 place-items-center rounded-full bg-success text-success-foreground"><Check className="size-4" /></span> : <Circle className={index === step ? "size-6 animate-pulse text-secondary-foreground" : "size-6 text-border"} />}<span className={index <= step ? "text-sm font-semibold" : "text-sm text-muted-foreground"}>{label}</span></div>)}</div></main></div>;
}