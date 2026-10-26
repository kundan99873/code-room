import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type OnMount } from "@monaco-editor/react";
import {
  ResizablePanelGroup, ResizablePanel, ResizableHandle,
} from "@/components/ui/resizable";
import { useIsMobile } from "@/hooks/useMobile";
import {
  LANG_BY_ID, runOnPiston,
  getPistonEndpoint, setPistonEndpoint,
  getLanguageRunMode, setLanguageRunMode,
} from "@/lib/languages";
import { toast } from "react-hot-toast";
import type { OutLine } from "@/lib/data";
import { buildJsSandbox, isRunnerNoise, transformTypeScript } from "@/lib/utils";
import { EditorPanel } from "./editorPanel";
import { OutputPanel } from "./outputPanel";
import { RunnerToolbar } from "./runnerToolbar";
import { CodeToImageModal } from "./CodeToImageModal";
import { ShareSnippetModal } from "./ShareSnippetModal";
import { LoginRequiredModal } from "./LoginRequiredModal";
import { useAuth } from "@/context/authContext";

type Props = {
  value: string;
  language: string;
  onChange?: (v: string) => void;
  onLanguageChange?: (l: string) => void;
  onEditorMount?: OnMount;
  header?: React.ReactNode;
  heightClass?: string;
  allFiles?: { name: string; content: string }[];
  activeFileName?: string;
  readOnly?: boolean;
};

export function CodeRunner({
  value, language, onChange, onLanguageChange, onEditorMount,
  header, heightClass = "h-[calc(100vh-3.5rem)]",
  allFiles = [], activeFileName = "", readOnly = false,
}: Props) {
  const isMobile = useIsMobile();
  const [lines, setLines] = useState<OutLine[]>([]);
  const [running, setRunning] = useState(false);
  const [execMs, setExecMs] = useState<number | null>(null);
  const [endpoint, setEndpointState] = useState<string>(() => getPistonEndpoint());
  const [fullEditor, setFullEditor] = useState(false);
  const [fullOutput, setFullOutput] = useState(false);
  const { user } = useAuth();
  const [showImageModal, setShowImageModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const codeRef = useRef(value);
  useEffect(() => {
    codeRef.current = value;
  }, [value]);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const startedAt = useRef<number>(0);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  const [jsMode, setJsModeState] = useState(() => getLanguageRunMode("javascript"));
  const [tsMode, setTsModeState] = useState(() => getLanguageRunMode("typescript"));
  const [pyMode, setPyModeState] = useState(() => getLanguageRunMode("python"));

  const handleModeChange = useCallback((langId: string, newMode: "browser" | "server") => {
    setLanguageRunMode(langId, newMode);
    if (langId === "javascript") setJsModeState(newMode);
    if (langId === "typescript") setTsModeState(newMode);
    if (langId === "python") setPyModeState(newMode);
  }, []);

  const handleEndpointChange = useCallback((v: string) => {
    setPistonEndpoint(v);
    setEndpointState(v);
  }, []);

  const lang = LANG_BY_ID[language];
  const mode = useMemo(() => {
    if (!lang) return "none";
    if (language === "html" || language === "css") return "web";
    if (language === "javascript" || language === "js") return jsMode;
    if (language === "typescript" || language === "ts") return tsMode;
    if (language === "python" || language === "py") return pyMode;
    return lang.runMode;
  }, [language, lang, jsMode, tsMode, pyMode]);

  const monacoLang = useMemo(() => (language === "cpp" ? "cpp" : language), [language]);

  const [previewSrc, setPreviewSrc] = useState<string>(() => (mode === "web" ? value : ""));

  // Debounce refs for typing without React re-render cascades
  const webDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const jsonDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const append = useCallback((l: OutLine) => {
    setLines((p) => [...p, l]);
  }, []);

  // When language or mode changes, initialize preview or plaintext/json lines once
  useEffect(() => {
    if (mode === "web") {
      setPreviewSrc(codeRef.current);
    } else if (language === "plaintext") {
      setLines([{ level: "log", text: codeRef.current }]);
    } else if (language === "json") {
      const current = codeRef.current.trim();
      if (!current) {
        setLines([]);
        return;
      }
      try {
        JSON.parse(current);
        setLines([{ level: "log", text: codeRef.current }]);
      } catch (e: any) {
        setLines([
          { level: "error", text: `Invalid JSON: ${e.message}` },
          { level: "log", text: codeRef.current },
        ]);
      }
    }
  }, [language, mode]);

  // Clean typing change handler: keeps codeRef instant, debounces heavy preview & parsing
  const handleCodeChange = useCallback((v: string) => {
    codeRef.current = v;
    onChange?.(v);

    if (mode === "web") {
      if (webDebounceRef.current) clearTimeout(webDebounceRef.current);
      webDebounceRef.current = setTimeout(() => {
        setPreviewSrc(v);
      }, 300);
    } else if (language === "plaintext" || language === "json") {
      if (jsonDebounceRef.current) clearTimeout(jsonDebounceRef.current);
      jsonDebounceRef.current = setTimeout(() => {
        if (language === "plaintext") {
          setLines([{ level: "log", text: v }]);
        } else if (language === "json") {
          if (!v.trim()) {
            setLines([]);
            return;
          }
          try {
            JSON.parse(v);
            setLines([{ level: "log", text: v }]);
          } catch (e: any) {
            setLines([
              { level: "error", text: `Invalid JSON: ${e.message}` },
              { level: "log", text: v },
            ]);
          }
        }
      }, 350);
    }
  }, [onChange, mode, language]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (webDebounceRef.current) clearTimeout(webDebounceRef.current);
      if (jsonDebounceRef.current) clearTimeout(jsonDebounceRef.current);
    };
  }, []);

  // Auto-open Share modal when returning from login
  useEffect(() => {
    if (user && sessionStorage.getItem("codesroom_auto_share") === "true") {
      sessionStorage.removeItem("codesroom_auto_share");
      setShowShareModal(true);
    }
  }, [user]);

  // Listen to browser sandbox messages
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
  }, [mode, append]);

  const run = useCallback(async () => {
    setLines([]);
    setExecMs(null);
    startedAt.current = performance.now();
    if (mode === "web") {
      setPreviewSrc(codeRef.current + `\n<!-- ${Date.now()} -->`);
      return;
    }
    if (mode === "browser") {
      setRunning(true);
      try {
        let source = codeRef.current;
        if (language === "typescript" || language === "ts") {
          if (monacoRef.current && editorRef.current) {
            try {
              const model = editorRef.current.getModel();
              const worker = await monacoRef.current.languages.typescript.getTypeScriptWorker();
              const client = await worker(model.uri);
              const result = await client.getEmitOutput(model.uri.toString());
              if (result && result.outputFiles && result.outputFiles[0]) {
                source = result.outputFiles[0].text;
              } else {
                source = transformTypeScript(codeRef.current);
              }
            } catch (tsErr) {
              console.warn("Monaco TS worker compile failed, falling back to regex:", tsErr);
              source = transformTypeScript(codeRef.current);
            }
          } else {
            source = transformTypeScript(codeRef.current);
          }
        }
        const iframe = iframeRef.current;
        if (iframe) iframe.srcdoc = buildJsSandbox(source);
        setTimeout(() => setRunning(false), 8000);
      } catch (e: any) {
        append({ level: "error", text: e?.message ?? String(e) });
        setRunning(false);
      }
      return;
    }
    if (mode === "server") {
      setRunning(true);
      try {
        const r = await runOnPiston(language, codeRef.current, allFiles, activeFileName);
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
  }, [mode, language, allFiles, activeFileName, append]);

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(codeRef.current);
    toast.success("Code copied to clipboard");
  }, []);

  const download = useCallback(() => {
    const blob = new Blob([codeRef.current], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `main.${lang?.ext ?? "txt"}`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success(`Downloaded main.${lang?.ext}`);
  }, [lang?.ext]);

  const runRef = useRef(run);
  runRef.current = run;
  const downloadRef = useRef(download);
  downloadRef.current = download;

  // Single unified keyboard shortcut listener
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFullEditor(false);
        setFullOutput(false);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        runRef.current();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        downloadRef.current();
        return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleEditorMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    onEditorMount?.(editor, monaco);

    // Register keyboard commands directly in Monaco Editor
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      runRef.current();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      downloadRef.current();
    });
  }, [onEditorMount]);

  const format = useCallback(() => {
    if (editorRef.current) {
      const formatAction = editorRef.current.getAction("editor.action.formatDocument");
      if (formatAction) {
        formatAction.run()
          .then(() => toast.success("Code formatted!"))
          .catch((err: any) => toast.error(`Format failed: ${err.message}`));
      } else {
        toast.error("Formatting not supported for this language");
      }
    } else {
      toast.error("Editor not initialized");
    }
  }, []);

  const copyOutput = useCallback(async () => {
    await navigator.clipboard.writeText(lines.map((l) => l.text).join("\n"));
    toast.success("Output copied");
  }, [lines]);

  const onClear = useCallback(() => {
    setLines([]);
    setExecMs(null);
    if (mode === "web") setPreviewSrc("");
  }, [mode]);

  const toggleFullEditor = useCallback(() => setFullEditor((f) => !f), []);
  const toggleFullOutput = useCallback(() => setFullOutput((f) => !f), []);

  const openShareModal = useCallback(() => {
    if (!user) {
      setShowLoginModal(true);
    } else {
      setShowShareModal(true);
    }
  }, [user]);

  const closeShareModal = useCallback(() => setShowShareModal(false), []);
  const openImageModal = useCallback(() => setShowImageModal(true), []);
  const closeImageModal = useCallback(() => setShowImageModal(false), []);
  const closeLoginModal = useCallback(() => setShowLoginModal(false), []);

  const placeholder = useMemo(() => {
    if (language === "plaintext") return "Type text in the editor to see it here.";
    if (language === "json") return "Type valid JSON in the editor to view it parsed.";
    if (mode === "web") return "Edit your HTML/CSS/JS — preview updates automatically.";
    return "Press ▶ Run (or ⌘/Ctrl + Enter) to see the output here.";
  }, [mode, language]);

  const editorPanel = useMemo(() => (
    <EditorPanel
      value={value}
      language={language}
      monacoLang={monacoLang}
      ext={lang?.ext ?? "txt"}
      mode={mode}
      mounted={true}
      isFull={fullEditor}
      onToggleFull={toggleFullEditor}
      onChange={handleCodeChange}
      onEditorMount={handleEditorMount}
      onFormat={format}
      onCopy={copy}
      onDownload={download}
      onShareSnippet={openShareModal}
      onExportImage={openImageModal}
      fileName={activeFileName}
      readOnly={readOnly}
    />
  ), [
    value,
    language,
    monacoLang,
    lang?.ext,
    mode,
    fullEditor,
    toggleFullEditor,
    handleCodeChange,
    handleEditorMount,
    format,
    copy,
    download,
    openShareModal,
    openImageModal,
    activeFileName,
    readOnly,
  ]);

  const outputPanel = useMemo(() => (
    <OutputPanel
      ref={iframeRef}
      mode={mode}
      lines={lines}
      running={running}
      execMs={execMs}
      previewSrc={previewSrc}
      placeholder={placeholder}
      isFull={fullOutput}
      onToggleFull={toggleFullOutput}
      onClear={onClear}
      onCopyOutput={copyOutput}
    />
  ), [
    mode,
    lines,
    running,
    execMs,
    previewSrc,
    placeholder,
    fullOutput,
    toggleFullOutput,
    onClear,
    copyOutput,
  ]);

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
        onEndpointChange={handleEndpointChange}
        running={running}
        runnable={runnable}
        mode={mode}
        onRun={run}
        jsMode={jsMode}
        tsMode={tsMode}
        pyMode={pyMode}
        onModeChange={handleModeChange}
      />

      <div className="flex-1 min-h-0 p-2 md:p-3 overflow-y-auto">
        {isMobile ? (
          <div className="flex flex-col gap-3 h-full pb-6">
            <div className="h-[400px] border border-border rounded-lg overflow-hidden bg-card shrink-0">
              {editorPanel}
            </div>
            <div className="h-[350px] border border-border rounded-lg overflow-hidden bg-card shrink-0">
              {outputPanel}
            </div>
          </div>
        ) : (
          <ResizablePanelGroup
            direction="horizontal"
            className="h-full w-full overflow-hidden rounded-lg border border-border bg-card shadow-sm"
          >
            <ResizablePanel defaultSize={55} minSize={25}>{editorPanel}</ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={45} minSize={20}>{outputPanel}</ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>

      {/* Code to Image Exporter Modal */}
      <CodeToImageModal
        isOpen={showImageModal}
        onClose={closeImageModal}
        code={codeRef.current}
        language={language}
        filename={activeFileName || `main.${lang?.ext ?? "js"}`}
      />

      {/* Share Snippet Modal (For Authenticated Users) */}
      <ShareSnippetModal
        isOpen={showShareModal}
        onClose={closeShareModal}
        code={codeRef.current}
        language={language}
        defaultTitle={activeFileName || `${language} snippet`}
      />

      {/* Login Required Modal (When guest clicks share) */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={closeLoginModal}
        code={codeRef.current}
        language={language}
      />
    </div>
  );
}
