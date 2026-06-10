import { useEffect, useMemo, useRef, useState } from "react";
import { type OnMount } from "@monaco-editor/react";
import {
  ResizablePanelGroup, ResizablePanel, ResizableHandle,
} from "@/components/ui/resizable";
import {
  LANG_BY_ID, runOnPiston,
  getPistonEndpoint, setPistonEndpoint,
} from "@/lib/languages";
import { toast } from "react-hot-toast";
import { useIsMobile } from "@/hooks/useMobile";
import { buildJsSandbox, isRunnerNoise } from "@/lib/utils";
import { EditorPanel } from "./editorPanel";
import { OutputPanel } from "./outputPanel";
import { RunnerToolbar } from "./runnerToolbar";
import type { OutLine } from "@/lib/data";

type Props = {
  value: string;
  language: string;
  onChange?: (v: string) => void;
  onLanguageChange?: (l: string) => void;
  onEditorMount?: OnMount;
  header?: React.ReactNode;
  heightClass?: string;
};

export function CodeRunner({
  value, language, onChange, onLanguageChange, onEditorMount,
  header, heightClass = "h-[calc(100vh-3.5rem)]",
}: Props) {
  const isMobile = useIsMobile();
  const [lines, setLines] = useState<OutLine[]>([]);
  const [running, setRunning] = useState(false);
  const [execMs, setExecMs] = useState<number | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string>("");
  const [endpoint, setEndpointState] = useState<string>(() => getPistonEndpoint());
  const [fullEditor, setFullEditor] = useState(false);
  const [fullOutput, setFullOutput] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const codeRef = useRef(value);
  codeRef.current = value;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const startedAt = useRef<number>(0);

  const lang = LANG_BY_ID[language];
  const mode = lang?.runMode ?? "none";
  const monacoLang = language === "cpp" ? "cpp" : language;

  const append = (l: OutLine) => setLines((p) => [...p, l]);

  useEffect(() => {
    if (mode !== "web") return;
    const t = setTimeout(() => setPreviewSrc(value), 300);
    return () => clearTimeout(t);
  }, [value, mode]);

  useEffect(() => {
    if (mode !== "browser") return;
    const onMsg = (e: MessageEvent) => {
      const d: any = e.data;
      if (!d || !d.__runner) return;
      if (d.level === "done") {
        setRunning(false);
        setExecMs(Math.round(performance.now() - startedAt.current));
        return;
      }
      const text = d.args.join(" ");
      if (!isRunnerNoise(text)) append({ level: d.level, text });
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [mode]);

  useEffect(() => {
    if (!fullEditor && !fullOutput) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setFullEditor(false); setFullOutput(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullEditor, fullOutput]);

  // Keyboard shortcuts: Cmd/Ctrl + Enter to run, Cmd/Ctrl + S to download
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault(); run();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        download();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const run = async () => {
    setLines([]);
    setExecMs(null);
    startedAt.current = performance.now();
    if (mode === "web") {
      setPreviewSrc(codeRef.current + `\n<!-- ${Date.now()} -->`);
      return;
    }
    if (mode === "browser") {
      setRunning(true);
      const html = buildJsSandbox(codeRef.current, language === "typescript");
      const iframe = iframeRef.current;
      if (iframe) iframe.srcdoc = html;
      setTimeout(() => setRunning(false), 8000);
      return;
    }
    if (mode === "server") {
      setRunning(true);
      try {
        const r = await runOnPiston(language, codeRef.current);
        setExecMs(r.timeMs ?? Math.round(performance.now() - startedAt.current));
        if (r.stdout) append({ level: "log", text: r.stdout.replace(/\n+$/, "") });
        if (r.stderr) append({ level: "error", text: r.stderr.replace(/\n+$/, "") });
      } catch (e: any) {
        append({ level: "error", text: e?.message ?? String(e) });
      } finally {
        setRunning(false);
      }
      return;
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(codeRef.current);
    toast.success("Code copied to clipboard");
  };

  const download = () => {
    const blob = new Blob([codeRef.current], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `main.${lang?.ext ?? "txt"}`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success(`Downloaded main.${lang?.ext}`);
  };

  const format = () => {
    try {
      if (language === "json") {
        const parsed = JSON.parse(codeRef.current);
        onChange?.(JSON.stringify(parsed, null, 2));
        toast.success("Formatted JSON");
        return;
      }
      toast("Format: built-in formatter supports JSON. Use Shift+Alt+F in Monaco for others.");
    } catch (e: any) {
      toast.error(`Format failed: ${e.message}`);
    }
  };

  const copyOutput = async () => {
    await navigator.clipboard.writeText(lines.map((l) => l.text).join("\n"));
    toast.success("Output copied");
  };

  const onClear = () => {
    setLines([]);
    setExecMs(null);
    if (mode === "web") setPreviewSrc("");
  };

  const placeholder = useMemo(() => {
    if (mode === "web") return "Edit your HTML/CSS/JS — preview updates automatically.";
    return "Press ▶ Run (or ⌘/Ctrl + Enter) to see the output here.";
  }, [mode]);

  const editorPanel = (
    <EditorPanel
      value={value}
      language={language}
      monacoLang={monacoLang}
      ext={lang?.ext ?? "txt"}
      mode={mode}
      mounted={mounted}
      isFull={fullEditor}
      onToggleFull={() => setFullEditor((f) => !f)}
      onChange={onChange}
      onEditorMount={onEditorMount}
      onFormat={format}
      onCopy={copy}
      onDownload={download}
    />
  );

  const outputPanel = (
    <OutputPanel
      ref={iframeRef}
      mode={mode}
      lines={lines}
      execMs={execMs}
      previewSrc={previewSrc}
      value={value}
      placeholder={placeholder}
      isFull={fullOutput}
      onToggleFull={() => setFullOutput((f) => !f)}
      onClear={onClear}
      onCopyOutput={copyOutput}
    />
  );

  if (fullEditor) return <div className="fixed inset-0 z-50 bg-background">{editorPanel}</div>;
  if (fullOutput) return <div className="fixed inset-0 z-50 bg-background">{outputPanel}</div>;

  const runnable = mode !== "none";

  return (
    <div className={`flex flex-col ${heightClass} bg-background`}>
      <RunnerToolbar
        header={header}
        language={language}
        onLanguageChange={onLanguageChange}
        endpoint={endpoint}
        onEndpointChange={(v) => { setPistonEndpoint(v); setEndpointState(v); }}
        running={running}
        runnable={runnable}
        mode={mode}
        onRun={run}
      />

      <div className="flex-1 min-h-0 p-2 md:p-3">
        <ResizablePanelGroup
          direction={isMobile ? "vertical" : "horizontal"}
          className="h-full w-full overflow-hidden rounded-lg border border-border bg-card shadow-sm"
        >
          <ResizablePanel defaultSize={isMobile ? 58 : 55} minSize={25}>{editorPanel}</ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={isMobile ? 42 : 45} minSize={20}>{outputPanel}</ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
