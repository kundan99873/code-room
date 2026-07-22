import { useEffect, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useTheme } from "@/context/themeContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/useMobile";
import { toast } from "react-hot-toast";
import {
  Play, RefreshCw, Download, Copy, Maximize2, Minimize2,
  Monitor, Tablet, Smartphone, Eraser, FileCode2, Palette, Braces,
  Eye, Code2, Settings2, Library, X, Plus, ArrowLeft,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Link } from "react-router-dom";
import SEO from "@/components/seo";

const STORAGE_KEY = "pen.v1";

const DEFAULT_HTML = `<div class="card">
  <h1>Hello, <span>World</span></h1>
  <p>Edit the HTML, CSS, and JS panels — preview updates live.</p>
  <button id="btn">Click me</button>
  <p id="out"></p>
</div>
`;

const DEFAULT_CSS = `* { box-sizing: border-box; }
body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  font-family: 'Inter', system-ui, sans-serif;
  background: radial-gradient(circle at 30% 20%, #6366f1, #0f172a 70%);
  color: white;
}
.card {
  padding: 2.5rem 3rem;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 1.25rem;
  text-align: center;
  box-shadow: 0 25px 60px -20px rgba(0, 0, 0, 0.5);
}
h1 { margin: 0 0 .5rem; font-weight: 800; letter-spacing: -0.02em; }
h1 span { background: linear-gradient(90deg, #f472b6, #fbbf24); -webkit-background-clip: text; color: transparent; }
button {
  margin-top: 1rem;
  padding: .6rem 1.25rem;
  border-radius: .6rem;
  border: 0;
  background: white;
  color: #111;
  font-weight: 600;
  cursor: pointer;
  transition: transform .15s ease;
}
button:hover { transform: translateY(-2px); }
`;

const DEFAULT_JS = `const btn = document.getElementById('btn');
const out = document.getElementById('out');
let n = 0;
btn.addEventListener('click', () => {
  n++;
  out.textContent = 'Clicked ' + n + (n === 1 ? ' time' : ' times');
  console.log('click', n);
});
console.log('Ready');
`;

type Tab = "html" | "css" | "js";
type Viewport = "desktop" | "tablet" | "mobile";

function buildDoc(html: string, css: string, js: string, cssLibs: string[] = [], jsLibs: string[] = []) {
  const bridge = `
    (function(){
      const send = (level, args) => {
        try { parent.postMessage({ __pen: true, level, args: args.map(a => {
          try {
            if (a instanceof Error) return a.stack || a.message;
            if (typeof a === 'function') return a.toString();
            if (typeof a === 'object' && a !== null) return JSON.stringify(a, null, 2);
            return String(a);
          } catch(e) { return String(a); }
        })}, '*'); } catch(e) {}
      };
      ['log','info','warn','error','debug'].forEach(k => {
        const orig = console[k].bind(console);
        console[k] = (...a) => { send(k, a); orig(...a); };
      });
      window.addEventListener('error', e => send('error', [e.message + ' (' + (e.filename||'') + ':' + e.lineno + ')']));
      window.addEventListener('unhandledrejection', e => send('error', ['Unhandled: ' + (e.reason && e.reason.message || e.reason)]));
    })();
  `;
  const cssLinks = cssLibs.filter(Boolean).map(u => `<link rel="stylesheet" href="${u}">`).join("");
  const jsScripts = jsLibs.filter(Boolean).map(u => `<script src="${u}"><\/script>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${cssLinks}<style>${css}</style></head><body>${html}${jsScripts}<script>${bridge}</script><script>try{${js}}catch(e){console.error(e);}</script></body></html>`;
}

type ConsoleLine = { level: "log" | "info" | "warn" | "error" | "debug"; text: string };

function isPreviewConsoleNoise(text: string) {
  return /browserbase keeping connection alive|\[(v3-piercer|lovable|vite)\]/i.test(text);
}

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
    // Light formatter: re-indent JSON, trim trailing whitespace on lines.
    try {
      if (tab === "html" || tab === "css") {
        // basic: collapse spaces, ensure newline after ; or }
        const v = current
          .replace(/[ \t]+\n/g, "\n");
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

  const tabMeta: Record<Tab, { label: string; ext: string; color: string; icon: React.ReactNode }> = {
    html: { label: "HTML", ext: "html", color: "text-orange-500", icon: <FileCode2 className="h-3.5 w-3.5" /> },
    css: { label: "CSS", ext: "css", color: "text-sky-500", icon: <Palette className="h-3.5 w-3.5" /> },
    js: { label: "JS", ext: "js", color: "text-amber-400", icon: <Braces className="h-3.5 w-3.5" /> },
  };

  const editorBlock = (
    <div className="h-full min-h-0 flex flex-col bg-card">
      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-border bg-muted/30">
        <div className="flex">
          {(Object.keys(tabMeta) as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium border-r border-border transition ${tab === t
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
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={formatCurrent} title="Format (Shift+Alt+F in editor)">
            <Settings2 className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={copyCurrent} title="Copy">
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setFullEditor((f) => !f)} title="Fullscreen editor">
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

  const previewBlock = (
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
                className={`p-1.5 ${viewport === o.v ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-zinc-100"}`}
              >
                {o.icon}
              </button>
            ))}
          </div>
          <Button size="sm" variant="ghost" className="h-7 px-2 text-zinc-400 hover:text-zinc-100 hover:bg-white/5" onClick={() => setShowConsole((s) => !s)} title="Toggle console">
            <Code2 className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" className="h-7 px-2 text-zinc-400 hover:text-zinc-100 hover:bg-white/5" onClick={buildAndRun} title="Reload (⌘/Ctrl+Enter)">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" className="h-7 px-2 text-zinc-400 hover:text-zinc-100 hover:bg-white/5" onClick={() => setFullPreview((f) => !f)} title="Fullscreen preview">
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
                <pre key={i} className={`whitespace-pre-wrap ${l.level === "error" ? "text-rose-400" :
                    l.level === "warn" ? "text-amber-300" :
                      l.level === "info" ? "text-sky-300" :
                        l.level === "debug" ? "text-zinc-400" :
                          "text-zinc-100"
                  }`}>
                  <span className="text-zinc-600 select-none mr-2">›</span>{l.text}
                </pre>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (fullPreview) return <div className="fixed inset-0 z-50">{previewBlock}</div>;
  if (fullEditor) return <div className="fixed inset-0 z-50">{editorBlock}</div>;

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-background">
      <SEO 
        title="Pen - Live HTML/CSS/JS Editor"
        description="Write and design front-end code with instant live preview. Prototype, sketch, and edit HTML, CSS, and JS side-by-side in your browser."
        keywords="codepen alternative, online html editor, live html preview, html css js compiler, front-end editor, codesroom pen"
      />
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <Link to="/" className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-background text-muted-foreground transition hover:text-foreground hover:border-primary/40" title="Back to Home">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
              <Code2 className="h-5 w-5 text-primary shrink-0" />
              <span>
                <span className="hidden sm:inline">Web </span>Playground
              </span>
            </h1>
          </div>
        </div>
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
              {editorBlock}
            </div>
            <div className="h-[400px] border border-border rounded-lg overflow-hidden bg-card shrink-0">
              {previewBlock}
            </div>
          </div>
        ) : (
          <ResizablePanelGroup
            direction="horizontal"
            className="h-full w-full overflow-hidden rounded-lg border border-border bg-card shadow-sm"
          >
            <ResizablePanel defaultSize={50} minSize={25}>{editorBlock}</ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={25}>{previewBlock}</ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </div>
  );
}

function LibrariesPopover({
  cssLibs, jsLibs, setCssLibs, setJsLibs,
}: {
  cssLibs: string[]; jsLibs: string[];
  setCssLibs: (v: string[]) => void; setJsLibs: (v: string[]) => void;
}) {
  const [cssDraft, setCssDraft] = useState("");
  const [jsDraft, setJsDraft] = useState("");
  const addCss = () => { const v = cssDraft.trim(); if (!v) return; setCssLibs([...cssLibs, v]); setCssDraft(""); };
  const addJs = () => { const v = jsDraft.trim(); if (!v) return; setJsLibs([...jsLibs, v]); setJsDraft(""); };
  const total = cssLibs.length + jsLibs.length;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5 h-9" title="Libraries">
          <Library className="h-4 w-4" />
          <span className="hidden sm:inline">Libraries</span>
          {total > 0 && (
            <span className="ml-1 rounded bg-primary/15 text-primary px-1.5 text-[10px] font-semibold">{total}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="end">
        <div className="space-y-4">
          <div>
            <div className="text-xs font-semibold mb-1.5 text-muted-foreground uppercase tracking-wide">CSS CDN</div>
            <div className="flex gap-1.5">
              <Input
                placeholder="https://cdn.jsdelivr.net/.../bootstrap.min.css"
                value={cssDraft}
                onChange={(e) => setCssDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCss())}
                className="h-8 text-xs"
              />
              <Button size="sm" className="h-8 px-2" onClick={addCss}><Plus className="h-3.5 w-3.5" /></Button>
            </div>
            <ul className="mt-2 space-y-1">
              {cssLibs.map((u, i) => (
                <li key={i} className="flex items-center gap-1.5 text-xs bg-muted/40 rounded px-2 py-1">
                  <span className="truncate flex-1 font-mono">{u}</span>
                  <button onClick={() => setCssLibs(cssLibs.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-foreground">
                    <X className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs font-semibold mb-1.5 text-muted-foreground uppercase tracking-wide">JS CDN</div>
            <div className="flex gap-1.5">
              <Input
                placeholder="https://cdn.jsdelivr.net/npm/jquery"
                value={jsDraft}
                onChange={(e) => setJsDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addJs())}
                className="h-8 text-xs"
              />
              <Button size="sm" className="h-8 px-2" onClick={addJs}><Plus className="h-3.5 w-3.5" /></Button>
            </div>
            <ul className="mt-2 space-y-1">
              {jsLibs.map((u, i) => (
                <li key={i} className="flex items-center gap-1.5 text-xs bg-muted/40 rounded px-2 py-1">
                  <span className="truncate flex-1 font-mono">{u}</span>
                  <button onClick={() => setJsLibs(jsLibs.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-foreground">
                    <X className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}


export default PenPage;