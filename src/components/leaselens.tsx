import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowRight, Bell, Calendar, Check, CheckCircle2, ChevronDown, ChevronRight,
  CircleHelp, FileCheck2, FileText, House, LayoutDashboard, List, Menu, Plus,
  Search, ShieldCheck, Signature, Sparkles, SquareCheck, X,
} from "lucide-react";
import { useState, type ComponentType, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { termIcon, type TermTheme } from "@/lib/term-themes";
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

const appIcons: Record<string, ComponentType<{ className?: string }>> = {
  "/dashboard": LayoutDashboard,
  "/findings": Search,
  "/early-exit": Calendar,
  "/action-plan": SquareCheck,
  "/checklist": List,
  "/summary": FileText,
};

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

function SidebarBody({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  const path = useRouterState({ select: (state) => state.location.pathname });

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-brand-navy">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="absolute -right-20 top-24 size-56 rounded-full bg-brand-teal/25 blur-3xl" />
        <span className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-[#0A5F63]/85 via-brand-navy/0 to-transparent" />
        <svg viewBox="0 0 240 180" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-56 w-full text-brand-teal/30">
          <path d="M0 122 C 52 58, 112 152, 240 74 L240 180 L0 180 Z" fill="currentColor" />
        </svg>
      </div>

      <Link to="/" onClick={onNavigate} className="relative flex items-center gap-3 px-5 pb-1 pt-6 text-white" aria-label="LeaseLens home">
        <span className="relative grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-cyan to-[#0E9C96] shadow-[0_12px_26px_-12px_oklch(0.797_0.126_191.1_/_0.9)]">
          <House className="size-5" strokeWidth={2.2} />
          <span className="absolute -bottom-1 -right-1 grid size-4 place-items-center rounded-full bg-white text-[#0E9C96]"><Check className="size-2.5" strokeWidth={4} /></span>
        </span>
        <span className="text-[19px] font-extrabold tracking-tight">LeaseLens</span>
      </Link>

      <nav aria-label="Main navigation" className="relative mt-7 flex flex-1 flex-col gap-1.5 px-3.5">
        {appLinks.map(([label, to]) => {
          const Icon = appIcons[to] ?? LayoutDashboard;
          const active = path === to;
          return (
            <Link
              key={to}
              to={to}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14.5px] font-semibold transition-all",
                active
                  ? "bg-gradient-to-r from-[#12539B] to-[#1B6EC0] text-white shadow-[0_14px_28px_-14px_oklch(0.288_0.082_253.6_/_0.95)]"
                  : "text-[#A9BDD6] hover:bg-white/10 hover:text-white",
              )}
            >
              <Icon className={cn("size-[18px] shrink-0", active ? "text-white" : "text-[#8FA9C6] group-hover:text-brand-cyan")} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="relative mt-auto px-6 pb-8 pt-10 text-center">
        <div className="relative mx-auto grid size-16 place-items-center">
          <span aria-hidden className="absolute inset-0 rounded-full bg-brand-teal/30 blur-xl" />
          <House className="relative size-12 text-brand-cyan" strokeWidth={1.3} />
        </div>
        <p className="mt-3 text-[13px] font-semibold leading-5 text-[#9ED6D4]">Better insights.<br />Smarter rentals.</p>
      </div>
    </div>
  );
}

function AppHeader({ onOpenNav }: { onOpenNav: () => void }) {
  return (
    <header data-no-print className="flex h-16 shrink-0 items-center gap-3 px-1 sm:h-[74px] sm:px-2">
      <button
        type="button"
        onClick={onOpenNav}
        aria-label="Open navigation"
        className="grid size-10 place-items-center rounded-xl border border-border bg-card text-foreground shadow-sm md:hidden"
      >
        <Menu className="size-5" />
      </button>

      <div className="ml-auto flex items-center gap-2 sm:gap-3.5">
        <button type="button" aria-label="Notifications" className="relative grid size-10 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-card hover:text-foreground">
          <Bell className="size-[19px]" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-brand-teal ring-2 ring-background" />
        </button>
        <button type="button" className="flex items-center gap-2.5 rounded-full border border-border bg-card py-1.5 pl-1.5 pr-3 shadow-surface transition-shadow hover:shadow-raised">
          <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-brand-blue to-brand-navy text-[12.5px] font-extrabold text-white">MK</span>
          <span className="text-[14px] font-bold text-brand-navy">Hi, Mohammad</span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-[1680px] gap-3 p-2 sm:p-2.5 lg:p-3">
        <aside
          data-no-print
          className="sticky top-2.5 hidden h-[calc(100vh-1.25rem)] w-[220px] shrink-0 overflow-hidden rounded-[26px] shadow-sidebar md:block lg:top-3 lg:h-[calc(100vh-1.5rem)]"
        >
          <SidebarBody />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader onOpenNav={() => setNavOpen(true)} />
          <main className="page-enter min-w-0 flex-1 px-1 pb-4 sm:px-2">{children}</main>
          <div className="px-2 pb-2"><DisclaimerBanner compact /></div>
        </div>
      </div>

      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent side="left" className="w-[276px] border-0 bg-transparent p-0 [&>button]:text-white">
          <SheetTitle className="sr-only">LeaseLens navigation</SheetTitle>
          <SheetDescription className="sr-only">Jump to any part of your agreement review.</SheetDescription>
          <SidebarBody onNavigate={() => setNavOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
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
  return <article className={cn("min-h-32 rounded-2xl border border-border bg-card p-5 shadow-surface", term.status === "attention" && "border-attention-foreground/30 bg-attention/45")}><p className="text-xs font-semibold text-muted-foreground">{term.label}</p><p className={cn("mt-2 text-xl font-bold text-brand-navy", term.status === "attention" && "text-attention-foreground")}>{term.value}</p>{term.note && <p className="mt-3 text-xs leading-5 text-attention-foreground">{term.note}</p>}</article>;
}

export function TermCard({ term, theme }: { term: KeyTerm; theme: TermTheme }) {
  const Icon = termIcon(term.id);
  const attention = term.status === "attention";

  return (
    <article
      className={cn(
        "group relative flex min-h-[176px] flex-col overflow-hidden rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-raised sm:p-7",
        theme.card,
      )}
    >
      <span aria-hidden className={cn("pointer-events-none absolute -bottom-14 -right-10 size-40 rounded-full opacity-60 blur-2xl", theme.blob)} />
      <span aria-hidden className={cn("pointer-events-none absolute -right-6 -top-12 size-24 rounded-full opacity-40 blur-2xl", theme.blob)} />

      <span className={cn("relative grid size-12 place-items-center rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]", theme.icon)}>
        <Icon className="size-6" strokeWidth={2} />
      </span>
      <p className="relative mt-4 text-[15px] font-bold text-brand-navy/75">{term.label}</p>
      <p className={cn("relative mt-1 text-[30px] font-extrabold leading-tight tracking-[-0.02em] sm:text-[34px]", attention ? "text-[#D96A0B]" : theme.value)}>
        {term.value}
      </p>
      {term.note && <p className="relative mt-3 max-w-[24rem] text-[13.5px] leading-6 text-muted-foreground">{term.note}</p>}
    </article>
  );
}

function HeroIllustration() {
  return (
    <div aria-hidden className="relative h-[172px] w-[258px] shrink-0">
      <span className="absolute right-1 top-1 size-40 rounded-full bg-brand-mint" />
      <span className="absolute right-5 top-6 size-32 rounded-full bg-[#CCEFE0]" />

      <div className="absolute left-0 top-1 w-[152px] -rotate-3 rounded-2xl border border-white bg-white/95 p-4 shadow-raised backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-brand-teal" />
          <span className="h-1.5 w-14 rounded-full bg-brand-navy/20" />
        </div>
        <div className="mt-3.5 space-y-2">
          <span className="block h-1.5 w-full rounded-full bg-brand-navy/10" />
          <span className="block h-1.5 w-11/12 rounded-full bg-brand-navy/10" />
          <span className="block h-1.5 w-9/12 rounded-full bg-brand-navy/10" />
          <span className="block h-1.5 w-10/12 rounded-full bg-brand-navy/10" />
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Signature className="size-5 text-brand-teal" />
          <span className="h-1.5 w-12 rounded-full bg-brand-navy/15" />
        </div>
      </div>

      <House className="absolute bottom-1 right-7 size-[94px] text-brand-teal" strokeWidth={1.35} />
      <span className="absolute bottom-14 left-[128px] grid size-9 place-items-center rounded-full bg-[#12B76A] text-white ring-4 ring-white/70">
        <Check className="size-5" strokeWidth={3.2} />
      </span>
    </div>
  );
}

export function HeroPanel({
  eyebrow,
  title,
  body,
  note,
  action,
}: {
  eyebrow: string;
  title: string;
  body: string;
  note?: string | undefined;
  action?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[#DDEBFA] bg-gradient-to-br from-[#EAF4FF] via-[#E5F7F7] to-[#DBF7EA] p-6 sm:p-8 lg:p-10">
      <span aria-hidden className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-[#BFE3FF]/50 blur-3xl" />
      <span aria-hidden className="pointer-events-none absolute -bottom-28 left-1/3 size-80 rounded-full bg-brand-mint/60 blur-3xl" />
      <span aria-hidden className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-[#C9F2E4]/60 blur-3xl" />

      <div className="relative grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0">
          <div className="flex items-center gap-3.5">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] text-white shadow-[0_18px_34px_-16px_oklch(0.55_0.2_262_/_0.75)]">
              <FileText className="size-7" />
            </span>
            <p className="text-[12.5px] font-extrabold uppercase tracking-[0.16em] text-brand-deep-teal">{eyebrow}</p>
          </div>

          <h1 className="mt-6 max-w-[34rem] text-[34px] font-extrabold leading-[1.05] tracking-[-0.025em] text-brand-navy sm:text-[42px] lg:text-[50px]">
            {title}
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-7 text-muted-foreground sm:text-base">{body}</p>

          {note && (
            <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3.5 py-1.5 text-[13px] font-semibold text-brand-blue backdrop-blur">
              <Sparkles className="size-3.5 text-brand-teal" />
              {note}
            </p>
          )}
        </div>

        <div className="flex flex-col items-start gap-7 lg:items-end">
          <HeroIllustration />
          {action}
        </div>
      </div>
    </section>
  );
}

export function InsightCard({
  icon,
  title,
  to,
  footer,
  children,
}: {
  icon: ReactNode;
  title: string;
  to: (typeof appLinks)[number][1];
  footer?: string | undefined;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-surface transition-all hover:-translate-y-0.5 hover:border-brand-teal/40 hover:shadow-raised sm:p-7"
    >
      <div className="flex items-center gap-3.5">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#E7F0FE] text-[#2563EB]">{icon}</span>
        <h2 className="min-w-0 flex-1 text-[18px] font-extrabold text-brand-navy sm:text-[19px]">{title}</h2>
        <span className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors group-hover:bg-[#E7F0FE] group-hover:text-[#2563EB]">
          <ChevronRight className="size-5" />
        </span>
      </div>

      <div className="mt-5 flex-1">{children}</div>

      {footer && (
        <p className="mt-5 flex items-center gap-1.5 text-[13px] font-bold text-brand-deep-teal">
          {footer}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </p>
      )}
    </Link>
  );
}

export function TermChipRow({ terms }: { terms: KeyTerm[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-border bg-card px-5 py-4 shadow-surface">
      <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Also in this agreement</span>
      {terms.map((term) => (
        <span key={term.id} className="inline-flex items-center gap-2 rounded-full bg-[#F1F5FB] px-3.5 py-1.5 text-[13px] font-semibold text-brand-navy/75">
          {term.label}
          <span className="font-extrabold text-brand-blue">{term.value}</span>
        </span>
      ))}
    </div>
  );
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
  return <article className="rounded-2xl border border-border bg-card p-5 transition-[border-color,transform] shadow-surface hover:-translate-y-0.5 hover:border-primary/30 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-lg font-bold text-brand-navy">{finding.title}</h3><StatusBadge status={finding.status} /></div></div><p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">{finding.summary}</p><div className="mt-5 border-l-2 border-border pl-4"><p className="text-xs font-bold">Why this matters</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{finding.why}</p></div><div className="mt-6 flex flex-wrap gap-2"><Button variant="outline" onClick={onViewSource}><Search /> View in agreement</Button><Button variant={added ? "soft" : "default"} onClick={add} disabled={added}>{added ? <Check /> : <Plus />}{added ? "Added to action plan" : "Add question"}</Button></div></article>;
}

export function EmptyState() {
  return <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center"><CircleHelp className="mx-auto size-8 text-muted-foreground" /><h3 className="mt-4 font-bold">Nothing here yet</h3><p className="mt-2 text-sm text-muted-foreground">Try another filter to see more findings.</p></div>;
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