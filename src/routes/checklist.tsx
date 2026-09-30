import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AppShell, ChecklistItem, SectionHeading } from "@/components/leaselens";
import { useDemoState } from "@/hooks/use-demo-state";

export const Route = createFileRoute("/checklist")({
  head: () => ({
    meta: [
      { title: "Signing & move-in checklist — LeaseLens" },
      { name: "description", content: "A clear checklist to finish before you sign and when you move in." },
      { property: "og:title", content: "Signing & move-in checklist — LeaseLens" },
      { property: "og:description", content: "A clear checklist to finish before you sign and when you move in." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  const { rawBackend, checklistLabels, checklist } = useDemoState();
  const [showMoveIn, setShowMoveIn] = useState(true);

  // Group items if rawBackend available
  const backendChecklist = rawBackend?.checklist;
  const beforeSigningItems = backendChecklist
    ? backendChecklist.filter((item) => item.group === "before_signing").map((i) => i.text)
    : checklistLabels;

  const moveInItems = backendChecklist
    ? backendChecklist.filter((item) => item.group === "move_in").map((i) => i.text)
    : [
        "Obtain receipt for security deposit payment",
        "Take date-stamped photos of property condition and any existing damage",
        "Record initial utility meter readings (electricity, water, gas)",
        "Complete joint inventory check for furniture and fixtures",
      ];

  const totalItems = [...beforeSigningItems, ...moveInItems];
  const doneCount = totalItems.filter((l) => checklist[l]).length;

  return (
    <AppShell>
      <SectionHeading
        eyebrow="CHECKLIST"
        title="Signing & Move-in Checklist"
        body={`${doneCount} of ${totalItems.length} completed.`}
        action={
          <Button asChild>
            <Link to="/summary">Export & print summary</Link>
          </Button>
        }
      />

      <div className="max-w-3xl space-y-8">
        {/* Before signing group */}
        <section className="border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-base font-bold text-foreground">Before signing the agreement</h2>
            <span className="text-xs font-semibold text-secondary-foreground">
              {beforeSigningItems.filter((l) => checklist[l]).length} / {beforeSigningItems.length}
            </span>
          </div>
          <div>
            {beforeSigningItems.map((label) => (
              <ChecklistItem key={label} label={label} />
            ))}
          </div>
        </section>

        {/* Move-in group (collapsible) */}
        <section className="border border-border bg-card p-6">
          <div
            className="flex cursor-pointer items-center justify-between border-b border-border pb-3"
            onClick={() => setShowMoveIn(!showMoveIn)}
          >
            <div>
              <h2 className="text-base font-bold text-foreground">Move-in day records</h2>
              <p className="text-xs text-muted-foreground">Photos, meter readings, and inventory checks</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-secondary-foreground">
                {moveInItems.filter((l) => checklist[l]).length} / {moveInItems.length}
              </span>
              <button type="button" className="p-1">
                {showMoveIn ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </button>
            </div>
          </div>
          {showMoveIn && (
            <div className="mt-3">
              {moveInItems.map((label) => (
                <ChecklistItem key={label} label={label} />
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="mt-8 flex justify-between">
        <Button asChild variant="outline">
          <Link to="/action-plan">Back to action plan</Link>
        </Button>
        <Button asChild>
          <Link to="/summary">Save & share summary</Link>
        </Button>
      </div>
    </AppShell>
  );
}
