import { createFileRoute } from "@tanstack/react-router";
import { AppShell, SectionHeading } from "@/components/leaselens";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [
    { title: "Privacy — LeaseLens" }, { name: "description", content: "How LeaseLens handles your rental agreement in this demo." },
    { property: "og:title", content: "Privacy — LeaseLens" }, { property: "og:description", content: "How LeaseLens handles your rental agreement in this demo." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ]}),
  component: Page,
});

function Page() {
  const points = ["This demo runs in your browser and does not send your agreement anywhere.", "Your checklist and question progress are saved only on this device.", "Clearing your browser data removes everything.", "LeaseLens explains wording. It isn't legal advice."];
  return <AppShell>
    <SectionHeading eyebrow="PRIVACY" title="Your agreement stays with you" />
    <ul className="max-w-2xl space-y-3">{points.map((p) => <li key={p} className="border border-border bg-card p-5 text-sm leading-6">{p}</li>)}</ul>
  </AppShell>;
}
