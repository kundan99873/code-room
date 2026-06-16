import Editor, { type OnMount } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/themeContext";
import {
  Copy, Download, Maximize2, Minimize2, Wand2, Zap,
} from "lucide-react";

type Props = {
  value: string;
  language: string;
  monacoLang: string;
  ext: string;
  mode: "none" | "browser" | "server" | "web";
  mounted: boolean;
  isFull: boolean;
  onToggleFull: () => void;
  onChange?: (v: string) => void;
  onEditorMount?: OnMount;
  onFormat: () => void;
  onCopy: () => void;
  onDownload: () => void;
  fileName?: string;
};

export function EditorPanel({
  value, language, monacoLang, ext, mode, mounted, isFull,
  onToggleFull, onChange, onEditorMount, onFormat, onCopy, onDownload,
  fileName,
}: Props) {
  const { resolved } = useTheme();

  return (
    <div className="h-full min-h-0 flex flex-col bg-card/95 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border text-xs text-muted-foreground bg-muted/40">
        <div className="flex items-center gap-2 font-mono">
          <span className="h-2 w-2 rounded-full bg-rose-500/80" />
          <span className="h-2 w-2 rounded-full bg-amber-500/80" />
          <span className="h-2 w-2 rounded-full bg-emerald-500/80" />
          <span className="ml-2 text-foreground">{fileName || `main.${ext}`}</span>
          {mode === "server" && (language === "python" || language === "php") && (
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-500 font-sans">
              <Zap className="h-3 w-3" /> local runtime
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={onFormat} title="Format">
            <Wand2 className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={onCopy} title="Copy code">
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={onDownload} title="Download (⌘/Ctrl+S)">
            <Download className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={onToggleFull} title="Fullscreen editor">
            {isFull ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        {mounted ? (
          <Editor
            key={language}
            height="100%"
            language={monacoLang}
            defaultValue={value}
            theme={resolved === "dark" ? "vs-dark" : "vs-light"}
            onMount={onEditorMount}
            onChange={(v) => onChange?.(v ?? "")}
            options={{
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              padding: { top: 12 },
              tabSize: 2,
              lineNumbers: "on",
              renderLineHighlight: "all",
              cursorBlinking: "smooth",
              automaticLayout: true,
              autoClosingBrackets: "always",
              autoClosingQuotes: "always",
              autoSurround: "languageDefined",
              wordWrap: "on",
            }}
          />
        ) : (
          <div className="h-full grid place-items-center text-xs text-muted-foreground">Loading editor…</div>
        )}
      </div>
    </div>
  );
}
