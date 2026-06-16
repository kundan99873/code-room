import { Button } from "@/components/ui/button";
import { Loader2, Play, RefreshCw, Sparkles } from "lucide-react";
import { LanguageSelect } from "./languageSelect";
import { RunnerSettings } from "./runnerSettings";

type Props = {
  header?: React.ReactNode;
  language: string;
  onLanguageChange?: (l: string) => void;
  endpoint: string;
  onEndpointChange: (v: string) => void;
  running: boolean;
  runnable: boolean;
  mode: "none" | "browser" | "server" | "web";
  onRun: () => void;
};

export function RunnerToolbar({
  header,
  language,
  onLanguageChange,
  endpoint,
  onEndpointChange,
  running,
  runnable,
  mode,
  onRun,
}: Props) {
  return (
    <div className="flex flex-col gap-3 border-b border-border bg-card/90 px-4 py-3 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <div className="hidden h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm sm:grid">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="min-w-0">{header}</div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {onLanguageChange && (
          <LanguageSelect
            value={language}
            onChange={(v) => onLanguageChange?.(v)}
          />
        )}
        <RunnerSettings endpoint={endpoint} onSave={onEndpointChange} />
        <Button
          size="sm"
          onClick={onRun}
          disabled={running || !runnable}
          className="gap-1.5"
        >
          {running ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : mode === "web" ? (
            <RefreshCw className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {mode === "web" ? "Reload" : "Run"}
          <kbd className="hidden md:inline ml-1 text-[10px] opacity-70">⌘↵</kbd>
        </Button>
      </div>
    </div>
  );
}
