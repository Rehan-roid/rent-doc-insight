import { createFileRoute } from "@tanstack/react-router";
import { AppShell, ChecklistItem, SectionHeading } from "@/components/leaselens";
import { useDemoState } from "@/hooks/use-demo-state";

export const Route = createFileRoute("/checklist")({
  head: () => ({ meta: [
    { title: "Signing checklist — LeaseLens" }, { name: "description", content: "A simple checklist to finish before you sign your rental agreement." },
    { property: "og:title", content: "Signing checklist — LeaseLens" }, { property: "og:description", content: "A simple checklist to finish before you sign your rental agreement." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ]}),
  component: Page,
});

function Page() {
  const { checklistLabels, checklist } = useDemoState();
  const done = checklistLabels.filter((l) => checklist[l]).length;
  return <AppShell>
    <SectionHeading eyebrow="BEFORE YOU SIGN" title="Your signing checklist" body={`${done} of ${checklistLabels.length} done.`} />
    <div className="max-w-2xl border border-border bg-card px-5">{checklistLabels.map((l) => <ChecklistItem key={l} label={l} />)}</div>
  </AppShell>;
}
