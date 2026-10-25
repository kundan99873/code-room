import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { toast } from "react-hot-toast";
import {
  Play,
  Copy,
  Share2,
  Camera,
  GitFork,
  Eye,
  Calendar,
  User,
  ArrowLeft,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import SEO from "@/components/seo";
import { getSnippet, forkSnippet, type Snippet } from "@/api/snippet";
import { CodeToImageModal } from "@/components/pages/codeRunner/CodeToImageModal";
import { ShareSnippetModal } from "@/components/pages/codeRunner/ShareSnippetModal";
import { useTheme } from "@/context/themeContext";

export default function SnippetPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { resolved } = useTheme();

  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showImageModal, setShowImageModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [forking, setForking] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getSnippet(id)
      .then((res) => {
        setSnippet(res.data.snippet);
      })
      .catch((err) => {
        setError(err.message || "Snippet not found or has been removed.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleCopyCode = useCallback(async () => {
    if (!snippet) return;
    await navigator.clipboard.writeText(snippet.code);
    toast.success("Code copied to clipboard!");
  }, [snippet]);

  const handleRunInCompiler = useCallback(() => {
    if (!snippet) return;
    // Pass snippet code and language via sessionStorage or query state
    sessionStorage.setItem("codesroom_preload_code", snippet.code);
    sessionStorage.setItem("codesroom_preload_lang", snippet.language);
    navigate(`/online-compiler?fromSnippet=${snippet.shortId}`);
  }, [snippet, navigate]);

  const handleFork = useCallback(async () => {
    if (!snippet) return;
    setForking(true);
    try {
      const res = await forkSnippet(snippet.shortId);
      toast.success("Snippet forked successfully!");
      navigate(`/s/${res.data.snippet.shortId}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to fork snippet");
    } finally {
      setForking(false);
    }
  }, [snippet, navigate]);

  const formattedDate = useMemo(() => {
    if (!snippet) return "";
    return new Date(snippet.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [snippet?.createdAt]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
        <Skeleton className="h-16 w-full max-w-xl" />
        <Skeleton className="flex-1 min-h-[500px] w-full rounded-xl" />
      </div>
    );
  }

  if (error || !snippet) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="h-16 w-16 rounded-2xl bg-destructive/10 border border-destructive/20 grid place-items-center text-destructive mb-4">
          <Code2 className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Snippet Not Found</h1>
        <p className="text-sm text-muted-foreground max-w-md mb-6">
          {error || "The snippet you are looking for doesn't exist or may have been deleted."}
        </p>
        <Link to="/online-compiler">
          <Button className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Open Online Compiler
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title={`${snippet.title} (${snippet.language}) | CodesRoom Snippet`}
        description={
          snippet.description ||
          `View, run, and fork this ${snippet.language} code snippet on CodesRoom. Online execution and sharing.`
        }
        canonical={`https://codesroom.in/s/${snippet.shortId}`}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Snippets", url: "/online-compiler" },
          { name: snippet.title, url: `/s/${snippet.shortId}` },
        ]}
        structuredData={{
          "@type": "SoftwareSourceCode",
          "name": snippet.title,
          "programmingLanguage": snippet.language,
          "text": snippet.code,
          "author": {
            "@type": "Person",
            "name": snippet.authorName || "Anonymous",
          },
        }}
      />

      {/* Top Header Bar */}
      <header className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-40 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/online-compiler"
              className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-background text-muted-foreground transition hover:text-foreground hover:border-primary/40"
              title="Open Compiler"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-foreground truncate max-w-[200px] sm:max-w-md">
                  {snippet.title}
                </h1>
                <span className="text-[11px] font-mono uppercase bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-semibold">
                  {snippet.language}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" /> {snippet.authorName}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {formattedDate}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" /> {snippet.views} views
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleRunInCompiler}
              className="gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm"
            >
              <Play className="h-3.5 w-3.5 fill-current" /> Run in Compiler
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowImageModal(true)}
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              title="Export as Image (Carbon style)"
            >
              <Camera className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">Export Image</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowShareModal(true)}
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              title="Share or Embed"
            >
              <Share2 className="h-3.5 w-3.5 text-primary" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleFork}
              disabled={forking}
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              title="Fork Snippet"
            >
              <GitFork className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Fork</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopyCode}
              className="h-8 px-2 text-xs"
              title="Copy Code"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Snippet Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-4">
        {snippet.description && (
          <div className="p-3.5 rounded-xl border border-border bg-card/40 text-sm text-muted-foreground leading-relaxed">
            {snippet.description}
          </div>
        )}

        {/* Editor Box */}
        <div className="flex-1 min-h-[550px] rounded-xl border border-border bg-card overflow-hidden shadow-lg flex flex-col">
          {/* Editor Header Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b border-border select-none">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-xs text-muted-foreground">
                {snippet.title.replace(/\s+/g, "_").toLowerCase()}.{snippet.language === "javascript" ? "js" : snippet.language}
              </span>
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              {snippet.code.split("\n").length} lines
            </div>
          </div>

          <div className="h-[600px] w-full">
            <Editor
              key={snippet.shortId}
              height="100%"
              language={snippet.language === "cpp" ? "cpp" : snippet.language}
              defaultValue={snippet.code}
              value={snippet.code}
              theme={resolved === "dark" ? "vs-dark" : "vs-light"}
              onMount={(editor) => {
                setTimeout(() => editor.layout(), 50);
              }}
              options={{
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontSize: 14,
                readOnly: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 12 },
                tabSize: 2,
                lineNumbers: "on",
                renderLineHighlight: "all",
                automaticLayout: true,
                wordWrap: "on",
              }}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      <CodeToImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        code={snippet.code}
        language={snippet.language}
        filename={`${snippet.title}.${snippet.language}`}
      />

      <ShareSnippetModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        code={snippet.code}
        language={snippet.language}
        defaultTitle={snippet.title}
      />
    </div>
  );
}
