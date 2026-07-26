import { Button } from "@/components/ui/button";
import {
  Monitor, Tablet, Smartphone, Code2, RefreshCw, Maximize2, Minimize2, Eye, Eraser
} from "lucide-react";
import { type Viewport, type ConsoleLine, buildDoc } from "./penHelpers";

interface PenPreviewProps {
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  doc: string;
  html: string;
  css: string;
  js: string;
  cssLibs: string[];
  jsLibs: string[];
  viewport: Viewport;
  setViewport: (v: Viewport) => void;
  viewportWidth: string | number;
  showConsole: boolean;
  setShowConsole: (v: boolean | ((s: boolean) => boolean)) => void;
  lines: ConsoleLine[];
  setLines: (v: ConsoleLine[] | ((p: ConsoleLine[]) => ConsoleLine[])) => void;
  buildAndRun: () => void;
  fullPreview: boolean;
  setFullPreview: (v: boolean | ((f: boolean) => boolean)) => void;
}

export function PenPreview({
  iframeRef,
  doc,
  html,
  css,
  js,
  cssLibs,
  jsLibs,
  viewport,
  setViewport,
  viewportWidth,
  showConsole,
  setShowConsole,
  lines,
  setLines,
  buildAndRun,
  fullPreview,
  setFullPreview,
}: PenPreviewProps) {
  return (
    <div className="h-full min-h-0 flex flex-col bg-[#0d1117]">
      <div className="flex items-center justify-between px-3 py-1.5 text-xs border-b border-border bg-[#0d1117] text-zinc-400">
        <div className="flex items-center gap-2">
          <Eye className="h-3.5 w-3.5 text-emerald-400" />
          <span className="font-medium">Live Preview</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex items-center rounded border border-zinc-700 mr-1">
            {([
              { v: "desktop", icon: <Monitor className="h-3.5 w-3.5" />, label: "Desktop" },
              { v: "tablet", icon: <Tablet className="h-3.5 w-3.5" />, label: "Tablet" },
              { v: "mobile", icon: <Smartphone className="h-3.5 w-3.5" />, label: "Mobile" },
            ] as const).map((o) => (
              <button
                key={o.v}
                onClick={() => setViewport(o.v)}
                title={o.label}
                className={`p-1.5 transition-colors duration-150 ${
                  viewport === o.v ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-zinc-100"
                }`}
              >
                {o.icon}
              </button>
            ))}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
            onClick={() => setShowConsole((s) => !s)}
            title="Toggle console"
          >
            <Code2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
            onClick={buildAndRun}
            title="Reload (⌘/Ctrl+Enter)"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
            onClick={() => setFullPreview((f) => !f)}
            title="Fullscreen preview"
          >
            {fullPreview ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex items-stretch justify-center overflow-auto p-2">
        <iframe
          ref={iframeRef}
          title="preview"
          className="bg-white rounded-md shadow-lg border border-zinc-800 transition-all"
          style={{ width: viewportWidth as any, maxWidth: "100%", height: "100%" }}
          sandbox="allow-scripts allow-modals allow-forms allow-popups"
          srcDoc={doc || buildDoc(html, css, js, cssLibs, jsLibs)}
        />
      </div>

      {showConsole && (
        <div className="border-t border-zinc-800 max-h-48 overflow-auto bg-[#0a0e14] text-zinc-100 font-mono text-[12px] leading-relaxed">
          <div className="sticky top-0 flex items-center justify-between px-3 py-1 bg-[#0a0e14] border-b border-zinc-800 text-zinc-500 text-[11px] uppercase tracking-wide">
            <span>Console</span>
            <button onClick={() => setLines([])} className="hover:text-zinc-200" title="Clear console">
              <Eraser className="h-3 w-3" />
            </button>
          </div>
          {lines.length === 0 ? (
            <div className="px-3 py-2 text-zinc-600 italic">No console output yet.</div>
          ) : (
            <div className="px-3 py-2 space-y-0.5">
              {lines.map((l, i) => (
                <pre
                  key={i}
                  className={`whitespace-pre-wrap ${
                    l.level === "error"
                      ? "text-rose-400"
                      : l.level === "warn"
                        ? "text-amber-300"
                        : l.level === "info"
                          ? "text-sky-300"
                          : l.level === "debug"
                            ? "text-zinc-400"
                            : "text-zinc-100"
                  }`}
                >
                  <span className="text-zinc-600 select-none mr-2">›</span>
                  {l.text}
                </pre>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
