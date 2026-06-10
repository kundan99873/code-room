import { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Copy, Eraser, Maximize2, Minimize2, Terminal,
} from "lucide-react";
import type { OutLine } from "@/lib/data";

type Props = {
  mode: "none" | "browser" | "server" | "web";
  lines: OutLine[];
  execMs: number | null;
  previewSrc: string;
  value: string;
  placeholder: string;
  isFull: boolean;
  onToggleFull: () => void;
  onClear: () => void;
  onCopyOutput: () => void;
};

export const OutputPanel = forwardRef<HTMLIFrameElement, Props>(function OutputPanel(
  { mode, lines, execMs, previewSrc, value, placeholder, isFull, onToggleFull, onClear, onCopyOutput },
  iframeRef,
) {
  const previewLabel = mode === "web" ? "Live Preview" : "Console";

  return (
    <div className="h-full min-h-0 flex flex-col bg-card/95 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 text-xs border-b border-border bg-muted/40 text-muted-foreground">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-primary" />
          <span className="font-medium text-foreground">{previewLabel}</span>
          {execMs !== null && mode !== "web" && (
            <span className="ml-2 rounded-full bg-primary/10 text-primary px-2 py-0.5 font-mono">
              {execMs}ms
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {mode !== "web" && (
            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={onCopyOutput} title="Copy output">
              <Copy className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={onClear} title="Clear">
            <Eraser className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={onToggleFull} title="Fullscreen output">
            {isFull ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {mode === "web" ? (
        <iframe
          title="preview"
          className="flex-1 w-full bg-white"
          sandbox="allow-scripts allow-modals allow-forms"
          srcDoc={previewSrc || value}
        />
      ) : (
        <>
          <div className="flex-1 overflow-auto bg-background text-foreground font-mono text-[13px] leading-relaxed">
            {lines.length === 0 ? (
              <pre className="p-4 text-muted-foreground whitespace-pre-wrap">{placeholder}</pre>
            ) : (
              <pre className="p-4 whitespace-pre-wrap">
                {lines.map((l) => l.text).join("\n")}
              </pre>
            )}
          </div>
          {mode === "browser" && (
            <iframe ref={iframeRef} title="js-sandbox" sandbox="allow-scripts" className="hidden" />
          )}
        </>
      )}
    </div>
  );
});
