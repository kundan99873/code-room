import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { toast } from "react-hot-toast";
import { Copy, ExternalLink } from "lucide-react";
import { getSnippet, type Snippet } from "@/api/snippet";
import { Skeleton } from "@/components/ui/skeleton";

export default function SnippetEmbedPage() {
  const { id } = useParams<{ id: string }>();
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getSnippet(id)
      .then((res) => setSnippet(res.data.snippet))
      .catch(() => setSnippet(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCopy = async () => {
    if (!snippet) return;
    await navigator.clipboard.writeText(snippet.code);
    toast.success("Code copied!");
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#0e1015] p-3 flex flex-col space-y-3">
        <Skeleton className="h-8 w-full bg-zinc-800" />
        <Skeleton className="flex-1 w-full bg-zinc-800" />
      </div>
    );
  }

  if (!snippet) {
    return (
      <div className="h-screen w-screen bg-[#0e1015] text-zinc-400 flex items-center justify-center text-xs font-mono">
        Snippet not found.
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#0e1015] text-zinc-200 flex flex-col font-sans select-none overflow-hidden border border-zinc-800">
      {/* Title bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#141720] border-b border-zinc-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80 inline-block" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80 inline-block" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 inline-block" />
          <span className="ml-2 font-mono text-zinc-300 font-medium truncate max-w-[200px]">
            {snippet.title}
          </span>
          <span className="text-[10px] uppercase font-mono bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">
            {snippet.language}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
            title="Copy Code"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <a
            href={`https://codesroom.in/s/${snippet.shortId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-primary hover:underline px-2 py-0.5 rounded bg-primary/10 border border-primary/20"
          >
            Run on CodesRoom <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Editor view */}
      <div className="flex-1 min-h-0 bg-[#0e1015]">
        <Editor
          height="100%"
          language={snippet.language === "cpp" ? "cpp" : snippet.language}
          value={snippet.code}
          theme="vs-dark"
          options={{
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            fontSize: 13,
            readOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 8 },
            lineNumbers: "on",
            renderLineHighlight: "none",
            automaticLayout: true,
            wordWrap: "on",
          }}
        />
      </div>
    </div>
  );
}
