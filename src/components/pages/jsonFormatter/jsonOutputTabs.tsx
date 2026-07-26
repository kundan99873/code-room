import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ListTree, Copy, Download } from "lucide-react";
import { JsonTree } from "./jsonTree";

interface JsonOutputTabsProps {
  tab: string;
  setTab: (t: string) => void;
  other: string;
  parsed: any;
  statusMessage: string;
  outLang: string;
  mounted: boolean;
  resolved: "dark" | "light";
  copy: (s: string) => void;
  download: (s: string, ext: string) => void;
}

export function JsonOutputTabs({
  tab,
  setTab,
  other,
  parsed,
  statusMessage,
  outLang,
  mounted,
  resolved,
  copy,
  download,
}: JsonOutputTabsProps) {
  return (
    <Tabs
      value={tab}
      onValueChange={setTab}
      className="flex-1 flex flex-col min-h-0 h-full"
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
            title="Copy Output"
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
            title="Download Output"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <TabsContent
        value="tree"
        className="flex-1 min-h-0 m-0 overflow-auto p-4 bg-[#0d1117] h-full"
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
          className="flex-1 min-h-0 m-0 h-full"
        >
          {mounted ? (
            <Editor
              height="100%"
              language={outLang}
              value={parsed ? other : statusMessage}
              theme={resolved === "dark" ? "vs-dark" : "vs-light"}
              loading={<Skeleton className="h-full w-full rounded-none" />}
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
            <Skeleton className="h-full w-full rounded-none" />
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
