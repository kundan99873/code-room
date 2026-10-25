import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useTheme } from "@/context/themeContext";
import { useIsMobile } from "@/hooks/useMobile";
import { toast } from "react-hot-toast";
import {
  Play, Download, Eraser, Code2, ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/seo";
import {
  STORAGE_KEY,
  DEFAULT_HTML,
  DEFAULT_CSS,
  DEFAULT_JS,
  type Tab,
  type Viewport,
  type ConsoleLine,
  buildDoc,
  isPreviewConsoleNoise,
} from "@/components/pages/pen/penHelpers";
import { LibrariesPopover } from "@/components/pages/pen/librariesPopover";
import { PenEditor } from "@/components/pages/pen/penEditor";
import { PenPreview } from "@/components/pages/pen/penPreview";

function PenPage() {
  const { resolved } = useTheme();
  const isMobile = useIsMobile();
  const [tab, setTab] = useState<Tab>("html");
  const [html, setHtml] = useState(DEFAULT_HTML);
  const [css, setCss] = useState(DEFAULT_CSS);
  const [js, setJs] = useState(DEFAULT_JS);
  const [doc, setDoc] = useState("");
  const [autoRun, setAutoRun] = useState(true);
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [fullPreview, setFullPreview] = useState(false);
  const [fullEditor, setFullEditor] = useState(false);
  const [showConsole, setShowConsole] = useState(true);
  const [lines, setLines] = useState<ConsoleLine[]>([]);
  const [cssLibs, setCssLibs] = useState<string[]>([]);
  const [jsLibs, setJsLibs] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Load persisted state once on mount (client only).
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (typeof s.html === "string") setHtml(s.html);
        if (typeof s.css === "string") setCss(s.css);
        if (typeof s.js === "string") setJs(s.js);
        if (Array.isArray(s.cssLibs)) setCssLibs(s.cssLibs);
        if (Array.isArray(s.jsLibs)) setJsLibs(s.jsLibs);
      }
    } catch { }
  }, []);

  // Persist.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ html, css, js, cssLibs, jsLibs })); } catch { }
    }, 400);
    return () => clearTimeout(id);
  }, [html, css, js, cssLibs, jsLibs]);

  // Build preview doc.
  const buildAndRun = () => {
    setLines([]);
    setDoc(buildDoc(html, css, js, cssLibs, jsLibs));
  };

  useEffect(() => {
    if (!autoRun) return;
    const id = setTimeout(() => { setLines([]); setDoc(buildDoc(html, css, js, cssLibs, jsLibs)); }, 500);
    return () => clearTimeout(id);
  }, [html, css, js, cssLibs, jsLibs, autoRun]);

  // Console bridge.
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const d: any = e.data;
      if (!d || !d.__pen) return;
      const text = (d.args || []).join(" ");
      if (!isPreviewConsoleNoise(text)) setLines((p) => [...p, { level: d.level, text }]);
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const buildAndRunRef = useRef(buildAndRun);
  buildAndRunRef.current = buildAndRun;

  // Shortcuts: Cmd/Ctrl+Enter to run, Esc to exit fullscreen.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        buildAndRunRef.current();
      }
      if (e.key === "Escape") {
        setFullPreview(false);
        setFullEditor(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleEditorMount = (editor: any, monaco: any) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      buildAndRunRef.current();
    });
  };

  const current = tab === "html" ? html : tab === "css" ? css : js;
  const setCurrent = (v: string) => {
    if (tab === "html") setHtml(v);
    else if (tab === "css") setCss(v);
    else setJs(v);
  };

  const copyCurrent = async () => {
    await navigator.clipboard.writeText(current);
    toast.success(`Copied ${tab.toUpperCase()}`);
  };

  const downloadAll = () => {
    const merged = buildDoc(html, css, js, cssLibs, jsLibs);
    const blob = new Blob([merged], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "playground.html";
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("Downloaded playground.html");
  };

  const resetAll = () => {
    if (!confirm("Reset HTML, CSS, and JS to defaults?")) return;
    setHtml(DEFAULT_HTML); setCss(DEFAULT_CSS); setJs(DEFAULT_JS);
    toast.success("Reset to defaults");
  };

  const formatCurrent = () => {
    try {
      if (tab === "html" || tab === "css") {
        const v = current.replace(/[ \t]+\n/g, "\n");
        setCurrent(v);
        toast("Format: use Shift+Alt+F in the editor for full formatting.");
      } else {
        toast("Format: press Shift+Alt+F inside the editor.");
      }
    } catch (e: any) {
      toast.error(`Format failed: ${e.message}`);
    }
  };

  const viewportWidth = useMemo(() => {
    return viewport === "mobile" ? 390 : viewport === "tablet" ? 820 : "100%";
  }, [viewport]);

  const editorComp = (
    <PenEditor
      tab={tab}
      setTab={setTab}
      current={current}
      setCurrent={setCurrent}
      formatCurrent={formatCurrent}
      copyCurrent={copyCurrent}
      fullEditor={fullEditor}
      setFullEditor={setFullEditor}
      mounted={mounted}
      resolved={resolved === "dark" ? "dark" : "light"}
      handleEditorMount={handleEditorMount}
    />
  );

  const previewComp = (
    <PenPreview
      iframeRef={iframeRef}
      doc={doc}
      html={html}
      css={css}
      js={js}
      cssLibs={cssLibs}
      jsLibs={jsLibs}
      viewport={viewport}
      setViewport={setViewport}
      viewportWidth={viewportWidth}
      showConsole={showConsole}
      setShowConsole={setShowConsole}
      lines={lines}
      setLines={setLines}
      buildAndRun={buildAndRun}
      fullPreview={fullPreview}
      setFullPreview={setFullPreview}
    />
  );

  if (fullPreview) return <div className="fixed inset-0 z-50">{previewComp}</div>;
  if (fullEditor) return <div className="fixed inset-0 z-50">{editorComp}</div>;

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-background">
      <SEO
        title="Web Pen — Online HTML, CSS & JavaScript Live Editor | CodesRoom"
        description="Interactive online HTML, CSS, and JavaScript editor with real-time live preview. Prototype, experiment, and test frontend code side-by-side with zero setup."
        keywords="html editor online, live html preview, codepen alternative, html css js playground, web pen, front-end editor, test html online, codesroom"
        canonical="https://codesroom.in/web-pen"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Web Pen", url: "/web-pen" },
        ]}
        structuredData={{
          "@type": "SoftwareApplication",
          "name": "CodesRoom Web Pen",
          "url": "https://codesroom.in/web-pen",
          "applicationCategory": "DeveloperApplication",
          "operatingSystem": "All",
          "description": "Interactive HTML, CSS, and JavaScript frontend editor with live in-browser preview.",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          }
        }}
      />
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-background text-muted-foreground transition hover:text-foreground hover:border-primary/40"
            title="Back to Home"
            aria-label="Back to Home"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Code2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
              <span>Web Pen — Live HTML/CSS/JS</span>
            </h1>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-3 text-xs text-muted-foreground mr-2" aria-label="Tool Navigation">
          <Link to="/online-compiler" className="hover:text-foreground transition">Online Compiler</Link>
          <span className="text-border">|</span>
          <Link to="/json-formatter" className="hover:text-foreground transition">JSON Tools</Link>
        </nav>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none" title="Auto-run">
            <input
              type="checkbox"
              className="accent-primary"
              checked={autoRun}
              onChange={(e) => setAutoRun(e.target.checked)}
            />
            <span className="hidden sm:inline">Auto-run</span>
          </label>
          <LibrariesPopover
            cssLibs={cssLibs} jsLibs={jsLibs}
            setCssLibs={setCssLibs} setJsLibs={setJsLibs}
          />
          <Button size="sm" variant="outline" onClick={resetAll} className="gap-1.5 h-9" title="Reset">
            <Eraser className="h-4 w-4" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
          <Button size="sm" variant="outline" onClick={downloadAll} className="gap-1.5 h-9" title="Download">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download</span>
          </Button>
          <Button size="sm" onClick={buildAndRun} className="gap-1.5 h-9" title="Run (⌘/Ctrl+Enter)">
            <Play className="h-4 w-4" />
            <span className="hidden sm:inline">Run</span>
            <kbd className="hidden md:inline ml-1 text-[10px] opacity-70">⌘↵</kbd>
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 p-2 md:p-3 overflow-y-auto">
        {isMobile ? (
          <div className="flex flex-col gap-3 h-full pb-6">
            <div className="h-[400px] border border-border rounded-lg overflow-hidden bg-card shrink-0">
              {editorComp}
            </div>
            <div className="h-[400px] border border-border rounded-lg overflow-hidden bg-card shrink-0">
              {previewComp}
            </div>
          </div>
        ) : (
          <ResizablePanelGroup
            direction="horizontal"
            className="h-full w-full overflow-hidden rounded-lg border border-border bg-card shadow-sm"
          >
            <ResizablePanel defaultSize={50} minSize={25}>{editorComp}</ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={25}>{previewComp}</ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </div>
  );
}

export default PenPage;