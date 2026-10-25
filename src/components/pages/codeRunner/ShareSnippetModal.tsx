import { useState } from "react";
import { toast } from "react-hot-toast";
import {
  Share2,
  Copy,
  Check,
  X,
  ExternalLink,
  Sparkles,
  Globe,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSnippet, type SnippetResponse } from "@/api/snippet";
import { Link } from "react-router-dom";

interface ShareSnippetModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  language: string;
  defaultTitle?: string;
}

export function ShareSnippetModal({
  isOpen,
  onClose,
  code,
  language,
  defaultTitle = "",
}: ShareSnippetModalProps) {
  const [title, setTitle] = useState(defaultTitle || "My Code Snippet");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SnippetResponse["data"] | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!code.trim()) {
      toast.error("Code cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const res = await createSnippet({
        title,
        code,
        language,
        description,
        isPublic,
      });
      setResult(res.data);
      toast.success("Snippet link generated successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to create shareable snippet");
    } finally {
      setLoading(false);
    }
  };

  const shareUrl = result
    ? `${window.location.origin}/s/${result.snippet.shortId}`
    : "";
  const embedCode = result
    ? `<iframe src="${window.location.origin}/embed/s/${result.snippet.shortId}" width="100%" height="450" frameborder="0" style="border-radius:12px; border:1px solid #27272a; overflow:hidden;" title="${result.snippet.title}"></iframe>`
    : "";

  const copyToClipboard = async (text: string, isEmbed = false) => {
    await navigator.clipboard.writeText(text);
    if (isEmbed) {
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2000);
      toast.success("Embed HTML copied!");
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      toast.success("Share link copied to clipboard!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 grid place-items-center text-primary">
              <Share2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                Share Code Snippet <Sparkles className="h-3.5 w-3.5 text-primary" />
              </h2>
              <p className="text-xs text-muted-foreground">
                Generate an instant public link & embeddable widget.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-sm">
          {!result ? (
            <>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Snippet Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Binary Search in C++"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Explain what this snippet solves or how to run it..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20">
                <div className="flex items-center gap-2.5">
                  {isPublic ? (
                    <Globe className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Lock className="h-4 w-4 text-amber-500" />
                  )}
                  <div>
                    <div className="text-xs font-medium text-foreground">
                      {isPublic ? "Public Snippet" : "Unlisted Snippet"}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {isPublic
                        ? "Anyone with the link can view & execute this snippet."
                        : "Only people with the direct link can access."}
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded border-border accent-primary h-4 w-4 cursor-pointer"
                />
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleCreate}
                  disabled={loading}
                  className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md"
                >
                  <Share2 className="h-4 w-4" />
                  {loading ? "Generating Link..." : "Create Shareable Link"}
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Share URL */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Public Share Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 px-3 py-2 text-xs font-mono rounded-lg border border-border bg-muted text-foreground focus:outline-none"
                  />
                  <Button
                    size="sm"
                    onClick={() => copyToClipboard(shareUrl)}
                    className="gap-1.5 text-xs shrink-0"
                  >
                    {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedLink ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>

              {/* Embed Code */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Embed in Blog / Website
                  </label>
                  <button
                    onClick={() => copyToClipboard(embedCode, true)}
                    className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                  >
                    {copiedEmbed ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    {copiedEmbed ? "Copied" : "Copy iframe"}
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={2}
                  value={embedCode}
                  className="w-full px-3 py-1.5 text-[11px] font-mono rounded-lg border border-border bg-muted text-muted-foreground focus:outline-none resize-none"
                />
              </div>

              {/* Social Share Buttons */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                  Share directly
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      `Check out this code snippet on CodesRoom: ${result.snippet.title}`
                    )}&url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg border border-border bg-background hover:bg-muted text-foreground transition"
                  >
                    <span>𝕏</span> Twitter
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg border border-border bg-background hover:bg-muted text-foreground transition"
                  >
                    <span>in</span> LinkedIn
                  </a>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `${result.snippet.title} - ${shareUrl}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg border border-border bg-background hover:bg-muted text-foreground transition"
                  >
                    <span>💬</span> WhatsApp
                  </a>
                </div>
              </div>

              {/* View Snippet Page Link */}
              <div className="pt-2 flex items-center justify-between border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setResult(null)}
                  className="text-xs"
                >
                  Create Another
                </Button>
                <Link
                  to={`/s/${result.snippet.shortId}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                >
                  View Public Page <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
