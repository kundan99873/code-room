import { memo } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/themeContext";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Camera, Copy, Download, Maximize2, Minimize2, Share2, Wand2, Zap,
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
  onShareSnippet?: () => void;
  onExportImage?: () => void;
  fileName?: string;
  readOnly?: boolean;
};

export const EditorPanel = memo(function EditorPanel({
  value, language, monacoLang, ext, mode, mounted, isFull,
  onToggleFull, onChange, onEditorMount, onFormat, onCopy, onDownload,
  onShareSnippet, onExportImage,
  fileName, readOnly = false,
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
          {onShareSnippet && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs gap-1 border-primary/30 hover:border-primary text-primary"
              onClick={onShareSnippet}
              title="Share Snippet (Public Link & Embed)"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Share</span>
            </Button>
          )}
          {onExportImage && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
              onClick={onExportImage}
              title="Export Code to Image (Carbon style)"
            >
              <Camera className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden md:inline">Image</span>
            </Button>
          )}
          {!readOnly && (
            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={onFormat} title="Format code">
              <Wand2 className="h-3.5 w-3.5" />
            </Button>
          )}
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
            loading={<Skeleton className="h-full w-full rounded-none" />}
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
              readOnly: readOnly,
            }}
          />
        ) : (
          <Skeleton className="h-full w-full rounded-none" />
        )}
      </div>
    </div>
  );
});
