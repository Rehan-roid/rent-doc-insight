import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowRight, Check, CheckCircle2, CircleHelp, FileCheck2, FileText, Menu, Plus,
  Search, ShieldCheck, Sparkles, X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { mockAnalysis } from "@/data/mock-analysis";
import { useDemoState } from "@/hooks/use-demo-state";
import type { Finding, FindingStatus, KeyTerm, SourceClause } from "@/types/analysis";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="inline-flex items-center gap-2.5 font-bold text-foreground" aria-label="LeaseLens home">
      <span className="relative grid size-8 place-items-center rounded-md bg-primary text-primary-foreground">
        <FileText className="size-4" />
        <span className="absolute -bottom-0.5 -right-0.5 grid size-3.5 place-items-center rounded-full bg-secondary text-secondary-foreground ring-2 ring-background"><Check className="size-2.5" strokeWidth={3} /></span>
      </span>
      {!compact && <span className="text-lg">LeaseLens</span>}
    </Link>
  );
}

const appLinks = [
  ["Dashboard", "/dashboard"], ["Findings", "/findings"], ["Early exit", "/early-exit"], ["Action plan", "/action-plan"],
  ["Checklist", "/checklist"], ["Summary", "/summary"],
] as const;

export function Navbar({ landing = false }: { landing?: boolean }) {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (state) => state.location.pathname });
  const links = landing ? [["How it works", "/#how-it-works"], ["What you get", "/#what-you-get"], ["Privacy", "/privacy"]] as const : appLinks;
  return (
    <header data-no-print className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
          {links.map(([label, href]) => href.startsWith("/#") ? (
            <a key={label} href={href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">{label}</a>
          ) : (
            <Link key={label} to={href as (typeof appLinks)[number][1] | "/privacy"} className={cn("text-sm font-medium transition-colors hover:text-foreground", path === href ? "text-foreground" : "text-muted-foreground")}>{label}</Link>
          ))}
        </nav>
        <div className="hidden md:block">
          {landing ? <Button asChild><Link to="/upload">Start with your agreement <ArrowRight /></Link></Button> : <span className="inline-flex items-center gap-2 text-xs font-semibold text-success-foreground"><CheckCircle2 className="size-4" /> Analysis complete</span>}
        </div>
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation">{open ? <X /> : <Menu />}</Button>
      </div>
      {open && <nav className="border-t border-border px-4 py-4 md:hidden">{links.map(([label, href]) => href.startsWith("/#") ? <a key={label} href={href} className="block py-3 text-sm font-medium" onClick={() => setOpen(false)}>{label}</a> : <Link key={label} to={href as (typeof appLinks)[number][1] | "/privacy"} className="block py-3 text-sm font-medium" onClick={() => setOpen(false)}>{label}</Link>)}</nav>}
    </header>
  );
}

export function DisclaimerBanner({ compact = false }: { compact?: boolean }) {
  return <div className={cn("flex items-center justify-center gap-2 text-center text-muted-foreground", compact ? "text-xs" : "border-t border-border bg-muted/60 px-4 py-3 text-sm")}><ShieldCheck className="size-4 shrink-0" /> This explains the document. It isn't legal advice.</div>;
}

export function AppShell({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-background"><Navbar /><main className="page-enter mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">{children}</main><DisclaimerBanner /></div>;
}

const statusStyles: Record<FindingStatus, string> = {
  discuss: "bg-attention text-attention-foreground",
  clarify: "bg-advice text-advice-foreground",
  understood: "bg-success text-success-foreground",
  advice: "bg-advice text-advice-foreground",
};

export function StatusBadge({ status }: { status: FindingStatus }) {
  const label = status === "advice" ? "Professional advice" : status;
  return <span className={cn("inline-flex rounded-md px-2.5 py-1 text-[11px] font-bold capitalize", statusStyles[status])}>{label}</span>;
}

export function KeyTermCard({ term }: { term: KeyTerm }) {
  return <article className={cn("min-h-32 border border-border bg-card p-5", term.status === "attention" && "border-attention-foreground/30 bg-attention/45")}><p className="text-xs font-semibold text-muted-foreground">{term.label}</p><p className={cn("mt-2 text-xl font-bold", term.status === "attention" && "text-attention-foreground")}>{term.value}</p>{term.note && <p className="mt-3 text-xs leading-5 text-attention-foreground">{term.note}</p>}</article>;
}

export function EvidencePanel({ finding, open, onOpenChange }: { finding?: Finding | undefined; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { analysis } = useDemoState();
  const sources = finding ? analysis.clauses.filter((clause) => finding.sourceIds.includes(clause.id)) : [];
  return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent className="w-full overflow-y-auto sm:max-w-4xl"><SheetHeader><p className="text-xs font-bold text-secondary-foreground">EXACT EVIDENCE</p><SheetTitle className="text-2xl">Where this came from</SheetTitle><SheetDescription>Original wording stays separate from the LeaseLens explanation.</SheetDescription></SheetHeader>{finding && <div className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.85fr]"> <div><p className="mb-3 text-xs font-bold text-muted-foreground">ORIGINAL AGREEMENT</p><div className="space-y-4">{sources.length > 0 ? sources.map((source) => <ClauseBlock key={source.id} clause={source} />) : <p className="text-sm text-muted-foreground">Source clause verified in original text.</p>}</div></div><aside className="h-fit border-l-4 border-secondary-foreground bg-secondary/60 p-5"><div className="mb-3 flex items-center gap-2 text-sm font-bold"><Search className="size-4" /> LeaseLens explanation</div><p className="text-sm leading-7">{finding.explanation}</p></aside></div>}</SheetContent></Sheet>;
}


function ClauseBlock({ clause }: { clause: SourceClause }) {
  const [before, after = ""] = clause.text.split(clause.highlight);
  return <div className="border border-border bg-card p-5"><p className="mb-4 text-sm font-bold">{clause.label}</p><p className="text-sm leading-7 text-muted-foreground">{before}<mark className="bg-attention px-0.5 text-foreground">{clause.highlight}</mark>{after}</p></div>;
}

export function FindingCard({ finding, onViewSource }: { finding: Finding; onViewSource: () => void }) {
  const { addQuestion, addedQuestions } = useDemoState();
  const added = addedQuestions.includes(finding.id);
  const add = () => { addQuestion(finding.id); toast.success("Question added to your action plan"); };
  return <article className="border border-border bg-card p-5 transition-[border-color,transform] hover:-translate-y-0.5 hover:border-primary/30 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-lg font-bold">{finding.title}</h3><StatusBadge status={finding.status} /></div></div><p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">{finding.summary}</p><div className="mt-5 border-l-2 border-border pl-4"><p className="text-xs font-bold">Why this matters</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{finding.why}</p></div><div className="mt-6 flex flex-wrap gap-2"><Button variant="outline" onClick={onViewSource}><Search /> View in agreement</Button><Button variant={added ? "soft" : "default"} onClick={add} disabled={added}>{added ? <Check /> : <Plus />}{added ? "Added to action plan" : "Add question"}</Button></div></article>;
}

export function EmptyState() {
  return <div className="border border-dashed border-border bg-card px-6 py-12 text-center"><CircleHelp className="mx-auto size-8 text-muted-foreground" /><h3 className="mt-4 font-bold">Nothing here yet</h3><p className="mt-2 text-sm text-muted-foreground">Try another filter to see more findings.</p></div>;
}

export function SectionHeading({ eyebrow, title, body, action }: { eyebrow?: string; title: string; body?: string; action?: ReactNode }) {
  return <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div>{eyebrow && <p className="mb-2 text-xs font-bold text-secondary-foreground">{eyebrow}</p>}<h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">{title}</h1>{body && <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">{body}</p>}</div>{action}</div>;
}

export function ChecklistItem({ label }: { label: string }) {
  const { checklist, toggleChecklist } = useDemoState();
  const checked = Boolean(checklist[label]);
  return <label className="flex cursor-pointer items-start gap-4 border-b border-border py-4 last:border-0"><Checkbox checked={checked} onCheckedChange={() => toggleChecklist(label)} className="mt-0.5 size-5" /><span className={cn("text-sm font-medium leading-6", checked && "text-muted-foreground line-through")}>{label}</span></label>;
}

export function ProductPreview() {
  return <div className="relative mx-auto max-w-xl border border-border bg-card p-4 shadow-[0_24px_60px_-28px_oklch(0.29_0.075_252_/_0.35)] sm:p-6"><div className="flex items-center justify-between border-b border-border pb-4"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-md bg-secondary text-secondary-foreground"><FileCheck2 /></span><div><p className="text-sm font-bold">Flat Rental Agreement</p><p className="text-xs text-muted-foreground">Analysis complete</p></div></div><CheckCircle2 className="size-5 text-success-foreground" /></div><div className="grid grid-cols-2 gap-px bg-border my-5 border border-border">{mockAnalysis.key_terms.slice(0,4).map((term) => <div key={term.id} className="bg-card p-4"><p className="text-[11px] font-semibold text-muted-foreground">{term.label}</p><p className="mt-1 font-bold">{term.value}</p></div>)}</div><div className="border-l-4 border-attention-foreground bg-attention/55 p-4"><div className="flex items-start gap-3"><Sparkles className="mt-0.5 size-4 shrink-0 text-attention-foreground" /><div><p className="text-sm font-bold">Worth clarifying</p><p className="mt-1 text-sm text-attention-foreground">Deposit refund timeline isn't specified.</p><Button size="sm" className="mt-4" asChild><Link to="/upload"><Plus /> Add question</Link></Button></div></div></div></div>;
}