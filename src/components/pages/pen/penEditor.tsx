import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, Settings2, Maximize2, Minimize2, FileCode2, Palette, Braces } from "lucide-react";
import { Tab } from "./penHelpers";

interface PenEditorProps {
  tab: Tab;
  setTab: (t: Tab) => void;
  current: string;
  setCurrent: (v: string) => void;
  formatCurrent: () => void;
  copyCurrent: () => void;
  fullEditor: boolean;
  setFullEditor: (v: boolean | ((f: boolean) => boolean)) => void;
  mounted: boolean;
  resolved: "dark" | "light";
  handleEditorMount: (editor: any, monaco: any) => void;
}

export function PenEditor({
  tab,
  setTab,
  current,
  setCurrent,
  formatCurrent,
  copyCurrent,
  fullEditor,
  setFullEditor,
  mounted,
  resolved,
  handleEditorMount,
}: PenEditorProps) {
  const tabMeta: Record<Tab, { label: string; ext: string; color: string; icon: React.ReactNode }> = {
    html: { label: "HTML", ext: "html", color: "text-orange-500", icon: <FileCode2 className="h-3.5 w-3.5" /> },
    css: { label: "CSS", ext: "css", color: "text-sky-500", icon: <Palette className="h-3.5 w-3.5" /> },
    js: { label: "JS", ext: "js", color: "text-amber-400", icon: <Braces className="h-3.5 w-3.5" /> },
  };

  return (
    <div className="h-full min-h-0 flex flex-col bg-card">
      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-border bg-muted/30">
        <div className="flex">
          {(Object.keys(tabMeta) as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium border-r border-border transition ${
                tab === t
                  ? "bg-background text-foreground border-b-2 border-b-primary -mb-px"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/40"
              }`}
            >
              <span className={tabMeta[t].color}>{tabMeta[t].icon}</span>
              {tabMeta[t].label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 pr-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2"
            onClick={formatCurrent}
            title="Format (Shift+Alt+F in editor)"
          >
            <Settings2 className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={copyCurrent} title="Copy">
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2"
            onClick={() => setFullEditor((f) => !f)}
            title="Fullscreen editor"
          >
            {fullEditor ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {mounted ? (
          <Editor
            key={tab}
            height="100%"
            path={`main.${tabMeta[tab].ext}`}
            language={tab === "js" ? "javascript" : tab}
            defaultValue={current}
            theme={resolved === "dark" ? "vs-dark" : "vs-light"}
            onChange={(v) => setCurrent(v ?? "")}
            onMount={handleEditorMount}
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
              wordWrap: "on",
              automaticLayout: true,
              formatOnPaste: true,
              formatOnType: true,
              autoClosingBrackets: "always",
              autoClosingQuotes: "always",
              autoSurround: "languageDefined",
              suggestOnTriggerCharacters: true,
              quickSuggestions: { other: true, comments: false, strings: true },
            }}
          />
        ) : (
          <Skeleton className="h-full w-full rounded-none" />
        )}
      </div>
    </div>
  );
}
