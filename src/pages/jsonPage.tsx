import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import SEO from "@/components/seo";
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
  CheckCircle2,
  AlertCircle,
  ArrowLeftRight,
  ArrowLeft,
} from "lucide-react";
import {
  SAMPLE,
  type Status,
  validate,
  toYaml,
  toXml,
} from "@/components/pages/jsonFormatter/jsonPageHelpers";
import { JsonInputEditor } from "@/components/pages/jsonFormatter/jsonInputEditor";
import { JsonOutputTabs } from "@/components/pages/jsonFormatter/jsonOutputTabs";

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
      <SEO 
        title="JSON Formatter & Validator - Format, Beautify & Convert JSON"
        description="Best free online JSON formatter, validator, and editor. Beautify, validate, minify, and parse JSON instantly. Convert JSON to XML, YAML, and interactive tree view."
        keywords="json formatter, json parser, json validator, json to yaml, json to xml, beautify json, codesroom json"
      />
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
              <JsonInputEditor
                src={src}
                setSrc={setSrc}
                mounted={mounted}
                resolved={resolved === "dark" ? "dark" : "light"}
                copy={copy}
                download={download}
              />
            </div>

            <div className="h-[400px] border border-border rounded-lg overflow-hidden bg-card shrink-0 flex flex-col">
              <JsonOutputTabs
                tab={tab}
                setTab={setTab}
                other={other}
                parsed={parsed}
                statusMessage={status.message}
                outLang={outLang}
                mounted={mounted}
                resolved={resolved === "dark" ? "dark" : "light"}
                copy={copy}
                download={download}
              />
            </div>
          </div>
        ) : (
          <ResizablePanelGroup
            direction="horizontal"
            className="h-full overflow-hidden rounded-lg border border-border bg-card shadow-sm"
          >
            <ResizablePanel defaultSize={50} minSize={25}>
              <JsonInputEditor
                src={src}
                setSrc={setSrc}
                mounted={mounted}
                resolved={resolved === "dark" ? "dark" : "light"}
                copy={copy}
                download={download}
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={25}>
              <JsonOutputTabs
                tab={tab}
                setTab={setTab}
                other={other}
                parsed={parsed}
                statusMessage={status.message}
                outLang={outLang}
                mounted={mounted}
                resolved={resolved === "dark" ? "dark" : "light"}
                copy={copy}
                download={download}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </div>
  );
}
