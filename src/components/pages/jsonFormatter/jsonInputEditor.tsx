import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, Download } from "lucide-react";

interface JsonInputEditorProps {
  src: string;
  setSrc: (v: string) => void;
  mounted: boolean;
  resolved: "dark" | "light";
  copy: (s: string) => void;
  download: (s: string, ext: string) => void;
}

export function JsonInputEditor({
  src,
  setSrc,
  mounted,
  resolved,
  copy,
  download,
}: JsonInputEditorProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30 text-xs">
        <span className="font-medium">Input JSON</span>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2"
            onClick={() => copy(src)}
            title="Copy Input"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2"
            onClick={() => download(src, "json")}
            title="Download Input"
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
            loading={<Skeleton className="h-full w-full rounded-none" />}
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
          <Skeleton className="h-full w-full rounded-none" />
        )}
      </div>
    </div>
  );
}
