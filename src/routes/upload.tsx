import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FileText, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DisclaimerBanner, Logo } from "@/components/leaselens";
import { useDemoState } from "@/hooks/use-demo-state";

export const Route = createFileRoute("/upload")({
  validateSearch: (search: Record<string, unknown>): { mode?: "paste" | "upload" | undefined } => ({
    mode: search["mode"] === "paste" ? "paste" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Upload your agreement — LeaseLens" },
      { name: "description", content: "Choose a rental agreement PDF or paste its text for the LeaseLens demo." },
      { property: "og:title", content: "Upload your agreement — LeaseLens" },
      { property: "og:description", content: "Start a calm, clear review of your rental agreement." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UploadPage,
});

function UploadPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const input = useRef<HTMLInputElement>(null);
  const [pasting, setPasting] = useState(mode === "paste");
  const [text, setText] = useState("");
  const { setPendingText, setPendingFile, setPendingFileName } = useDemoState();

  const handlePasteContinue = () => {
    if (!text.trim()) return;
    setPendingText(text);
    setPendingFile(null);
    setPendingFileName("Pasted Agreement.txt");
    navigate({ to: "/context" });
  };

  const handleFileSelected = (file: File) => {
    setPendingFile(file);
    setPendingFileName(file.name);
    setPendingText("");
    navigate({ to: "/context" });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex h-20 w-full max-w-6xl items-center px-4 sm:px-6">
        <Logo />
      </header>
      <main className="page-enter mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-10 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-bold text-secondary-foreground">YOUR AGREEMENT</p>
          <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">Let's look through your agreement.</h1>
          <p className="mt-3 text-sm text-muted-foreground">Choose the simplest way to share the wording for this review.</p>
        </div>

        {pasting ? (
          <div className="mt-8 border border-border bg-card p-5 sm:p-7">
            <label className="text-sm font-bold" htmlFor="agreement-text">
              Paste agreement text
            </label>
            <Textarea
              id="agreement-text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Paste your rental agreement wording here…"
              className="mt-3 min-h-64 resize-none"
            />
            <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <Button variant="ghost" onClick={() => setPasting(false)}>
                Upload PDF instead
              </Button>
              <Button onClick={handlePasteContinue} disabled={!text.trim()}>
                Continue
              </Button>
            </div>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => input.current?.click()}
              onDrop={(event) => {
                event.preventDefault();
                const file = event.dataTransfer.files?.[0];
                if (file) handleFileSelected(file);
              }}
              onDragOver={(event) => event.preventDefault()}
              className="mt-8 flex min-h-72 w-full cursor-pointer flex-col items-center justify-center border-2 border-dashed border-input bg-card p-8 text-center transition-colors hover:border-primary/50 hover:bg-secondary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="grid size-14 place-items-center rounded-full bg-secondary text-secondary-foreground">
                <UploadCloud />
              </span>
              <strong className="mt-5 text-lg">Drag & drop your PDF here</strong>
              <span className="my-2 text-sm text-muted-foreground">or</span>
              <span className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">
                Choose PDF
              </span>
              <span className="mt-4 text-xs text-muted-foreground">PDFs up to 10 MB</span>
            </button>
            <input
              ref={input}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleFileSelected(file);
              }}
            />
            <Button variant="ghost" className="mx-auto mt-4" onClick={() => setPasting(true)}>
              <FileText /> Paste agreement text instead
            </Button>
          </>
        )}

        <div className="mt-8">
          <DisclaimerBanner compact />
        </div>
      </main>
    </div>
  );
}