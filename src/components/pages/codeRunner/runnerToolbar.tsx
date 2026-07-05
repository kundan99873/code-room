import { Button } from "@/components/ui/button";
import { Loader2, Play, RefreshCw } from "lucide-react";
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
  jsMode: "browser" | "server";
  tsMode: "browser" | "server";
  pyMode: "browser" | "server";
  onModeChange: (langId: string, mode: "browser" | "server") => void;
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
  jsMode,
  tsMode,
  pyMode,
  onModeChange,
}: Props) {
  return (
    <div className="flex flex-col gap-3 border-b border-border bg-card px-3 py-1.5 md:flex-row md:items-center md:justify-between h-auto md:h-12 shrink-0 select-none">
      <div className="flex items-center min-w-0 flex-1">
        <div className="min-w-0 flex-1">{header}</div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {onLanguageChange && (
          <LanguageSelect
            value={language}
            onChange={(v) => onLanguageChange?.(v)}
          />
        )}
        <RunnerSettings
          endpoint={endpoint}
          onSave={onEndpointChange}
          jsMode={jsMode}
          tsMode={tsMode}
          pyMode={pyMode}
          onModeChange={onModeChange}
        />
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
