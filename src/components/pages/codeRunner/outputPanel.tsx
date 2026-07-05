import { forwardRef, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Copy, Eraser, Maximize2, Minimize2, Terminal,
  ChevronRight, ChevronDown, ShieldAlert, AlertTriangle,
  Info, Search
} from "lucide-react";
import type { OutLine } from "@/lib/utils";

type Props = {
  mode: "none" | "browser" | "server" | "web";
  lines: OutLine[];
  running: boolean;
  execMs: number | null;
  previewSrc: string;
  value: string;
  placeholder: string;
  isFull: boolean;
  onToggleFull: () => void;
  onClear: () => void;
  onCopyOutput: () => void;
};

// Interactive Collapsible JSON Tree Component
function JsonTreeView({ data, name, isLast = true, depth = 0 }: { data: any; name?: string; isLast?: boolean; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const type = typeof data;

  if (data === null) {
    return (
      <div className="pl-4 py-0.5 font-mono text-[13px]">
        {name && <span className="text-zinc-400 font-medium">{name}: </span>}
        <span className="text-red-400 font-semibold">null</span>
        {!isLast && <span className="text-zinc-500">,</span>}
      </div>
    );
  }

  if (type === "undefined") {
    return (
      <div className="pl-4 py-0.5 font-mono text-[13px]">
        {name && <span className="text-zinc-400 font-medium">{name}: </span>}
        <span className="text-zinc-500">undefined</span>
        {!isLast && <span className="text-zinc-500">,</span>}
      </div>
    );
  }

  if (type === "boolean" || type === "number") {
    return (
      <div className="pl-4 py-0.5 font-mono text-[13px]">
        {name && <span className="text-zinc-400 font-medium">{name}: </span>}
        <span className={type === "boolean" ? "text-amber-500 font-semibold" : "text-sky-400 font-medium"}>
          {String(data)}
        </span>
        {!isLast && <span className="text-zinc-500">,</span>}
      </div>
    );
  }

  if (type === "string") {
    return (
      <div className="pl-4 py-0.5 font-mono text-[13px] break-all">
        {name && <span className="text-zinc-400 font-medium">{name}: </span>}
        <span className="text-amber-300">"{data}"</span>
        {!isLast && <span className="text-zinc-500">,</span>}
      </div>
    );
  }

  const isArray = Array.isArray(data);
  const keys = isArray ? data : Object.keys(data);
  const isEmpty = keys.length === 0;

  if (isEmpty) {
    return (
      <div className="pl-4 py-0.5 font-mono text-[13px] text-zinc-400">
        {name && <span className="text-zinc-300 font-medium">{name}: </span>}
        <span>{isArray ? "[]" : "{}"}</span>
        {!isLast && <span className="text-zinc-500">,</span>}
      </div>
    );
  }

  return (
    <div className="pl-2 font-mono text-[13px]">
      <div
        className="flex items-center gap-1 cursor-pointer select-none hover:bg-zinc-800/40 py-0.5 rounded px-1 -ml-1 text-zinc-300 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-zinc-500 shrink-0">
          {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </span>
        {name && <span className="text-zinc-300 font-medium">{name}: </span>}
        <span className="text-zinc-400 text-xs">
          {isArray ? `Array(${keys.length})` : "Object"}
        </span>
      </div>

      {expanded && (
        <div className="border-l border-zinc-850 ml-1.5 pl-2.5 my-0.5 space-y-0.5">
          {isArray ? (
            data.map((item: any, idx: number) => (
              <JsonTreeView
                key={idx}
                data={item}
                name={String(idx)}
                isLast={idx === data.length - 1}
                depth={depth + 1}
              />
            ))
          ) : (
            Object.keys(data).map((key: string, idx: number) => (
              <JsonTreeView
                key={key}
                data={data[key]}
                name={key}
                isLast={idx === keys.length - 1}
                depth={depth + 1}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Utility to parse dynamic JSON console outputs
function tryParseJson(text: string): any {
  const trimmed = text.trim();
  if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
    try {
      return JSON.parse(trimmed);
    } catch (e) {
      return null;
    }
  }
  return null;
}

export const OutputPanel = forwardRef<HTMLIFrameElement, Props>(function OutputPanel(
  { mode, lines, running, execMs, previewSrc, value, placeholder, isFull, onToggleFull, onClear, onCopyOutput },
  iframeRef,
) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<"all" | "logs" | "warnings" | "errors">("all");

  const previewLabel = mode === "web" ? "Live Preview" : "Console";

  // Filter logs by type and search terms
  const filteredLines = useMemo(() => {
    return lines.filter((l) => {
      if (selectedLevel !== "all") {
        if (selectedLevel === "errors" && l.level !== "error") return false;
        if (selectedLevel === "warnings" && l.level !== "warn") return false;
        if (selectedLevel === "logs" && l.level !== "log") return false;
      }
      if (searchQuery.trim()) {
        return l.text.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });
  }, [lines, selectedLevel, searchQuery]);

  const outputLength = lines.map((l) => l.text).join("\n").length;
  const estimatedKb = (outputLength / 1024).toFixed(2);
  const hasErrors = lines.some((l) => l.level === "error");

  const getEngineLabel = () => {
    if (mode === "browser") return "Browser Sandbox";
    if (mode === "web") return "Live Preview";
    return "Server Worker";
  };

  return (
    <div className="h-full min-h-0 flex flex-col bg-card/95 overflow-hidden">
      {/* Panel Tabs Header */}
      <div className="flex items-center justify-between px-3 py-1.5 text-xs border-b border-border bg-muted/40 text-muted-foreground shrink-0 select-none">
        <div className="flex items-center gap-1 bg-background/60 p-0.5 rounded-md border border-border">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2.5 text-xs gap-1.5 rounded-sm bg-zinc-800 text-foreground font-semibold shadow-sm"
          >
            <Terminal className="h-3.5 w-3.5" />
            {previewLabel}
          </Button>
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
        // Advanced DevTools Styled Console
        <>
          {/* Filters and Search Bar */}
          <div className="flex items-center gap-3 px-3 py-1.5 border-b border-border bg-muted/20 select-none text-[11px] shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Filter logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-border rounded px-2.5 py-1 pl-8 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
              />
            </div>
            <div className="flex items-center gap-1.5">
              {(["all", "logs", "warnings", "errors"] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-2 py-0.5 rounded-sm capitalize transition-colors font-medium ${selectedLevel === lvl
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Logs List */}
          <div className="flex-1 overflow-auto bg-background text-foreground">
            {filteredLines.length === 0 ? (
              <pre className="p-4 text-muted-foreground whitespace-pre-wrap font-mono text-[13px]">
                {running
                  ? "Running code… executing isolated runtime environment."
                  : searchQuery
                    ? "No logs match the current filter query."
                    : placeholder
                }
              </pre>
            ) : (
              <div className="divide-y divide-border/20">
                {filteredLines.map((l, index) => {
                  const parsed = tryParseJson(l.text);
                  let icon = null;
                  let bgClass = "";
                  let textClass = "";
                  let borderClass = "";

                  if (l.level === "error") {
                    icon = <ShieldAlert className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />;
                    bgClass = "bg-red-500/5 hover:bg-red-500/10";
                    textClass = "text-red-400 font-medium";
                    borderClass = "border-l-2 border-red-500";
                  } else if (l.level === "warn") {
                    icon = <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />;
                    bgClass = "bg-amber-500/5 hover:bg-amber-500/10";
                    textClass = "text-amber-400 font-medium";
                    borderClass = "border-l-2 border-amber-500";
                  } else if (l.level === "info") {
                    icon = <Info className="h-4 w-4 text-sky-500 shrink-0 mt-0.5" />;
                    bgClass = "bg-sky-500/5 hover:bg-sky-500/10";
                    textClass = "text-sky-400 font-medium";
                    borderClass = "border-l-2 border-sky-500";
                  } else if (l.level === "sys") {
                    icon = <span className="text-emerald-500 font-bold shrink-0">&gt;</span>;
                    bgClass = "bg-zinc-950/20 hover:bg-zinc-950/40";
                    textClass = "text-emerald-400 font-medium";
                  } else {
                    bgClass = "hover:bg-zinc-800/25";
                    textClass = "text-zinc-100";
                  }

                  return (
                    <div
                      key={index}
                      className={`flex items-start gap-2.5 px-4 py-2 font-mono transition-all ${bgClass} ${borderClass}`}
                    >
                      {icon}
                      <div className="flex-1 min-w-0">
                        {parsed ? (
                          <JsonTreeView data={parsed} />
                        ) : (
                          <span className={`whitespace-pre-wrap break-all text-[13px] ${textClass}`}>
                            {l.text}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sandbox & Performance Summary Header */}
          <div className="flex items-center justify-between border-t border-border bg-muted/20 px-3 py-1.5 text-[11px] text-muted-foreground shrink-0 select-none">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-full ${hasErrors ? "bg-red-500 animate-pulse" : "bg-emerald-500"}`} />
                {hasErrors ? "Errors detected" : "Success"}
              </span>
              <span>•</span>
              <span>Size: {estimatedKb} KB</span>
            </div>
            <div className="flex items-center gap-3.5">
              {execMs !== null && (
                <span className={`px-1.5 py-0.5 rounded font-mono font-medium ${execMs < 100
                    ? "bg-emerald-500/10 text-emerald-400"
                    : execMs < 500
                      ? "bg-amber-500/10 text-amber-400"
                      : "bg-red-500/10 text-red-400"
                  }`}>
                  {execMs} ms
                </span>
              )}
              <span className="bg-zinc-800 px-2 py-0.5 rounded text-zinc-300 font-medium text-[10px]">
                {getEngineLabel()}
              </span>
            </div>
          </div>

          {mode === "browser" && (
            <iframe ref={iframeRef} title="js-sandbox" sandbox="allow-scripts" className="hidden" />
          )}
        </>
      )}
    </div>
  );
});
