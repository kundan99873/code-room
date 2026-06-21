import { useEffect, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useTheme } from "@/context/themeContext";
import { useIsMobile } from "@/hooks/useMobile";
import { toast } from "react-hot-toast";
import {
  Wand2,
  Minimize,
  FileJson,
  ListTree,
  Copy,
  Download,
  CheckCircle2,
  AlertCircle,
  ArrowLeftRight,
  ArrowLeft,
} from "lucide-react";

const SAMPLE = `{
  "name": "coderoom",
  "version": "1.0.0",
  "active": true,
  "tags": ["editor", "runner", "rooms"],
  "author": { "name": "You", "email": "you@example.com" }
}`;

type Status = { ok: boolean; message: string };

function validate(src: string): Status {
  try {
    JSON.parse(src);
    return { ok: true, message: "Valid JSON" };
  } catch (e: any) {
    return { ok: false, message: e.message };
  }
}

function toYaml(obj: any, indent = 0): string {
  const pad = " ".repeat(indent);
  if (obj === null) return "null";
  if (typeof obj !== "object")
    return typeof obj === "string" ? JSON.stringify(obj) : String(obj);
  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]";
    return obj
      .map(
        (v) =>
          `${pad}- ${typeof v === "object" && v !== null ? "\n" + toYaml(v, indent + 2) : toYaml(v)}`,
      )
      .join("\n");
  }
  const entries = Object.entries(obj);
  if (entries.length === 0) return "{}";
  return entries
    .map(([k, v]) => {
      if (v !== null && typeof v === "object")
        return `${pad}${k}:\n${toYaml(v, indent + 2)}`;
      return `${pad}${k}: ${toYaml(v)}`;
    })
    .join("\n");
}

function toXml(obj: any, name = "root", indent = 0): string {
  const pad = "  ".repeat(indent);
  if (obj === null || obj === undefined) return `${pad}<${name}/>`;
  if (typeof obj !== "object") {
    return `${pad}<${name}>${String(obj).replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c]!)}</${name}>`;
  }
  if (Array.isArray(obj)) {
    return obj.map((v) => toXml(v, name, indent)).join("\n");
  }
  const inner = Object.entries(obj)
    .map(([k, v]) => toXml(v, k, indent + 1))
    .join("\n");
  return `${pad}<${name}>\n${inner}\n${pad}</${name}>`;
}

function JsonTree({ data, k }: { data: any; k?: string }) {
  const [open, setOpen] = useState(true);
  if (data === null) return <Leaf k={k} v="null" cls="text-zinc-400" />;
  if (typeof data !== "object") {
    const cls =
      typeof data === "string"
        ? "text-emerald-400"
        : typeof data === "number"
          ? "text-sky-400"
          : typeof data === "boolean"
            ? "text-amber-300"
            : "text-zinc-200";
    const v = typeof data === "string" ? `"${data}"` : String(data);
    return <Leaf k={k} v={v} cls={cls} />;
  }
  const arr = Array.isArray(data);
  const entries = arr
    ? data.map((v: any, i: number) => [String(i), v] as const)
    : Object.entries(data);
  return (
    <div className="font-mono text-[13px]">
      <div
        className="cursor-pointer select-none"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="text-zinc-500 mr-1">{open ? "▾" : "▸"}</span>
        {k && <span className="text-violet-300">{k}: </span>}
        <span className="text-zinc-400">
          {arr ? `[${entries.length}]` : `{${entries.length}}`}
        </span>
      </div>
      {open && (
        <div className="pl-5 border-l border-border ml-1.5">
          {entries.map(([kk, v]) => (
            <JsonTree key={kk} data={v} k={kk} />
          ))}
        </div>
      )}
    </div>
  );
}

function Leaf({ k, v, cls }: { k?: string; v: string; cls: string }) {
  return (
    <div className="font-mono text-[13px] pl-4">
      {k && <span className="text-violet-300">{k}: </span>}
      <span className={cls}>{v}</span>
    </div>
  );
}

export default function JsonPage() {
  const { resolved } = useTheme();
  const isMobile = useIsMobile();
  const [src, setSrc] = useState(SAMPLE);
  const [other, setOther] = useState("");
  const [tab, setTab] = useState("format");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const status = useMemo<Status>(() => validate(src), [src]);
  const parsed = useMemo(() => {
    try {
      return JSON.parse(src);
    } catch {
      return null;
    }
  }, [src]);

  useEffect(() => {
    if (!parsed) {
      setOther("");
      return;
    }
    if (tab === "format") setOther(JSON.stringify(parsed, null, 2));
    if (tab === "minify") setOther(JSON.stringify(parsed));
    if (tab === "stringify")
      setOther(JSON.stringify(JSON.stringify(parsed, null, 2)));
    if (tab === "yaml") setOther(toYaml(parsed));
    if (tab === "xml")
      setOther(
        '<?xml version="1.0" encoding="UTF-8"?>\n' + toXml(parsed, "root"),
      );
  }, [parsed, tab]);

  const apply = (fn: (s: string) => string) => {
    try {
      setSrc(fn(src));
      toast.success("Done");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const copy = async (s: string) => {
    await navigator.clipboard.writeText(s);
    toast.success("Copied");
  };
  const download = (s: string, ext: string) => {
    const blob = new Blob([s], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `data.${ext}`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const outLang =
    tab === "yaml"
      ? "yaml"
      : tab === "xml"
        ? "xml"
        : tab === "stringify"
          ? "plaintext"
          : "json";

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-background">
      <div className="border-b border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-background text-muted-foreground transition hover:text-foreground hover:border-primary/40" title="Back to Home">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                <FileJson className="h-5 w-5 text-primary shrink-0" />
                <span>
                  <span className="hidden sm:inline">JSON </span>Toolkit
                </span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                apply((s) => JSON.stringify(JSON.parse(s), null, 2))
              }
              title="Beautify"
            >
              <Wand2 className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Beautify</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => apply((s) => JSON.stringify(JSON.parse(s)))}
              title="Minify"
            >
              <Minimize className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Minify</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSrc(SAMPLE)} title="Sample">
              <ArrowLeftRight className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Sample</span>
            </Button>
          </div>
        </div>
      </div>

      <div
        className={`px-4 py-2 text-sm border-b border-border flex items-center gap-2 ${status.ok
          ? "bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
          : "bg-rose-500/5 text-rose-600 dark:text-rose-400"
          }`}
      >
        {status.ok ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <AlertCircle className="h-4 w-4" />
        )}
        <span className="font-mono">{status.message}</span>
      </div>

      <div className="flex-1 min-h-0 p-2 md:p-3 overflow-y-auto">
        {isMobile ? (
          <div className="flex flex-col gap-3 h-full pb-6">
            <div className="h-[400px] border border-border rounded-lg overflow-hidden bg-card shrink-0 flex flex-col">
              <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30 text-xs">
                <span className="font-medium">Input JSON</span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2"
                    onClick={() => copy(src)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2"
                    onClick={() => download(src, "json")}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex-1 min-h-0">
                {mounted ? (
                  <Editor
                    height="100%"
                    language="json"
                    value={src}
                    onChange={(v) => setSrc(v ?? "")}
                    theme={resolved === "dark" ? "vs-dark" : "vs-light"}
                    options={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 14,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      padding: { top: 12 },
                      tabSize: 2,
                      automaticLayout: true,
                      wordWrap: "on",
                    }}
                  />
                ) : (
                  <div className="h-full grid place-items-center text-xs text-muted-foreground">
                    Loading editor…
                  </div>
                )}
              </div>
            </div>

            <div className="h-[400px] border border-border rounded-lg overflow-hidden bg-card shrink-0 flex flex-col">
              <Tabs
                value={tab}
                onValueChange={setTab}
                className="flex-1 flex flex-col min-h-0"
              >
                <div className="px-3 py-2 border-b border-border bg-muted/30 flex items-center justify-between gap-2 min-w-0 w-full">
                  <div className="overflow-x-auto scrollbar-none flex-1 min-w-0 pr-2">
                    <TabsList className="h-8 flex-nowrap min-w-max">
                      <TabsTrigger value="format" className="text-xs">
                        Pretty
                      </TabsTrigger>
                      <TabsTrigger value="minify" className="text-xs">
                        Minified
                      </TabsTrigger>
                      <TabsTrigger value="stringify" className="text-xs">
                        Stringify
                      </TabsTrigger>
                      <TabsTrigger value="tree" className="text-xs">
                        <ListTree className="h-3.5 w-3.5 mr-1" /> Tree
                      </TabsTrigger>
                      <TabsTrigger value="yaml" className="text-xs">
                        YAML
                      </TabsTrigger>
                      <TabsTrigger value="xml" className="text-xs">
                        XML
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2"
                      onClick={() => copy(other)}
                      disabled={!parsed}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2"
                      onClick={() =>
                        download(
                          other,
                          outLang === "plaintext" ? "txt" : outLang,
                        )
                      }
                      disabled={!parsed}
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <TabsContent
                  value="tree"
                  className="flex-1 min-h-0 m-0 overflow-auto p-4 bg-[#0d1117]"
                >
                  {parsed ? (
                    <JsonTree data={parsed} />
                  ) : (
                    <p className="text-sm text-rose-400 font-mono">
                      Fix the JSON to view tree.
                    </p>
                  )}
                </TabsContent>

                {(
                  ["format", "minify", "stringify", "yaml", "xml"] as const
                ).map((id) => (
                  <TabsContent
                    key={id}
                    value={id}
                    className="flex-1 min-h-0 m-0"
                  >
                    {mounted ? (
                      <Editor
                        height="100%"
                        language={outLang}
                        value={parsed ? other : status.message}
                        theme={resolved === "dark" ? "vs-dark" : "vs-light"}
                        options={{
                          readOnly: true,
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 14,
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          padding: { top: 12 },
                          wordWrap: "on",
                          automaticLayout: true,
                        }}
                      />
                    ) : (
                      <div className="h-full grid place-items-center text-xs text-muted-foreground">
                        Loading output…
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        ) : (
          <ResizablePanelGroup
            direction="horizontal"
            className="h-full overflow-hidden rounded-lg border border-border bg-card shadow-sm"
          >
            <ResizablePanel defaultSize={50} minSize={25}>
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30 text-xs">
                  <span className="font-medium">Input JSON</span>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2"
                      onClick={() => copy(src)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2"
                      onClick={() => download(src, "json")}
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="flex-1 min-h-0">
                  {mounted ? (
                    <Editor
                      height="100%"
                      language="json"
                      value={src}
                      onChange={(v) => setSrc(v ?? "")}
                      theme={resolved === "dark" ? "vs-dark" : "vs-light"}
                      options={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 14,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        padding: { top: 12 },
                        tabSize: 2,
                        automaticLayout: true,
                        wordWrap: "on",
                      }}
                    />
                  ) : (
                    <div className="h-full grid place-items-center text-xs text-muted-foreground">
                      Loading editor…
                    </div>
                  )}
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={25}>
              <div className="h-full flex flex-col">
                <Tabs
                  value={tab}
                  onValueChange={setTab}
                  className="flex-1 flex flex-col min-h-0"
                >
                  <div className="px-3 py-2 border-b border-border bg-muted/30 flex items-center justify-between gap-2 min-w-0 w-full">
                    <div className="overflow-x-auto scrollbar-none flex-1 min-w-0 pr-2">
                      <TabsList className="h-8 flex-nowrap min-w-max">
                        <TabsTrigger value="format" className="text-xs">
                          Pretty
                        </TabsTrigger>
                        <TabsTrigger value="minify" className="text-xs">
                          Minified
                        </TabsTrigger>
                        <TabsTrigger value="stringify" className="text-xs">
                          Stringify
                        </TabsTrigger>
                        <TabsTrigger value="tree" className="text-xs">
                          <ListTree className="h-3.5 w-3.5 mr-1" /> Tree
                        </TabsTrigger>
                        <TabsTrigger value="yaml" className="text-xs">
                          YAML
                        </TabsTrigger>
                        <TabsTrigger value="xml" className="text-xs">
                          XML
                        </TabsTrigger>
                      </TabsList>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2"
                        onClick={() => copy(other)}
                        disabled={!parsed}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2"
                        onClick={() =>
                          download(
                            other,
                            outLang === "plaintext" ? "txt" : outLang,
                          )
                        }
                        disabled={!parsed}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <TabsContent
                    value="tree"
                    className="flex-1 min-h-0 m-0 overflow-auto p-4 bg-[#0d1117]"
                  >
                    {parsed ? (
                      <JsonTree data={parsed} />
                    ) : (
                      <p className="text-sm text-rose-400 font-mono">
                        Fix the JSON to view tree.
                      </p>
                    )}
                  </TabsContent>

                  {(
                    ["format", "minify", "stringify", "yaml", "xml"] as const
                  ).map((id) => (
                    <TabsContent
                      key={id}
                      value={id}
                      className="flex-1 min-h-0 m-0"
                    >
                      {mounted ? (
                        <Editor
                          height="100%"
                          language={outLang}
                          value={parsed ? other : status.message}
                          theme={resolved === "dark" ? "vs-dark" : "vs-light"}
                          options={{
                            readOnly: true,
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 14,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            padding: { top: 12 },
                            wordWrap: "on",
                            automaticLayout: true,
                          }}
                        />
                      ) : (
                        <div className="h-full grid place-items-center text-xs text-muted-foreground">
                          Loading output…
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </div>
  );
}
