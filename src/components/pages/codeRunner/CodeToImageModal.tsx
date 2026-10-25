import { useState, useRef, useMemo, memo } from "react";
import { toPng, toBlob } from "html-to-image";
import { toast } from "react-hot-toast";
import {
  Download,
  Copy,
  Check,
  X,
  Sparkles,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodeToImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  language: string;
  filename?: string;
}

const THEMES = [
  {
    id: "hyper",
    name: "Hyper",
    bg: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%)",
  },
  {
    id: "sunset",
    name: "Sunset",
    bg: "linear-gradient(135deg, #f97316 0%, #e11d48 50%, #7c3aed 100%)",
  },
  {
    id: "midnight",
    name: "Midnight",
    bg: "linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%)",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    bg: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 40%, #ec4899 100%)",
  },
  {
    id: "emerald",
    name: "Emerald",
    bg: "linear-gradient(135deg, #059669 0%, #0d9488 50%, #0f172a 100%)",
  },
  {
    id: "obsidian",
    name: "Obsidian",
    bg: "linear-gradient(180deg, #18181b 0%, #09090b 100%)",
  },
  {
    id: "transparent",
    name: "None",
    bg: "transparent",
  },
];

const PADDING_OPTIONS = [
  { label: "16px", value: 16 },
  { label: "32px", value: 32 },
  { label: "48px", value: 48 },
  { label: "64px", value: 64 },
];

const FONT_SIZES = [
  { label: "Small", value: 12 },
  { label: "Medium", value: 14 },
  { label: "Large", value: 16 },
];

export const CodeToImageModal = memo(function CodeToImageModal({
  isOpen,
  onClose,
  code,
  language,
  filename = "snippet",
}: CodeToImageModalProps) {
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [padding, setPadding] = useState(48);
  const [fontSize, setFontSize] = useState(14);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [windowControls, setWindowControls] = useState<"mac" | "win" | "none">("mac");
  const [showWatermark, setShowWatermark] = useState(true);
  const [customTitle, setCustomTitle] = useState(filename);
  const [hasShadow, setHasShadow] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  const lines = useMemo(() => (isOpen ? code.split("\n") : []), [isOpen, code]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `${customTitle.replace(/\s+/g, "_") || "code"}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Image exported as PNG!");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to export image: " + (err?.message || "Unknown error"));
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyImage = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const blob = await toBlob(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });

      if (!blob) throw new Error("Could not generate image blob");

      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2500);
        toast.success("Image copied to clipboard!");
      } else {
        toast.error("Clipboard image copy is not supported in this browser.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to copy image: " + (err?.message || "Unknown error"));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 grid place-items-center text-primary">
              <Camera className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                Export Code to Image <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              </h2>
              <p className="text-xs text-muted-foreground">
                Generate high-resolution Carbon-style graphics for Twitter, LinkedIn, and blogs.
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

        {/* Content Body: Split into Settings & Live Preview */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Controls Sidebar (Left) */}
          <div className="lg:col-span-4 p-5 border-b lg:border-b-0 lg:border-r border-border bg-muted/10 overflow-y-auto space-y-5 text-sm">
            {/* Title / Filename */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Window Title
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="e.g. solution.js"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Gradient Preset */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                Background Theme
              </label>
              <div className="grid grid-cols-4 gap-2">
                {THEMES.map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setSelectedTheme(th)}
                    className={`h-10 rounded-lg relative overflow-hidden transition-all border flex items-center justify-center ${
                      selectedTheme.id === th.id
                        ? "border-primary ring-2 ring-primary/40 scale-105"
                        : "border-border/60 hover:border-border"
                    }`}
                    style={{ background: th.bg }}
                    title={th.name}
                  >
                    {selectedTheme.id === th.id && (
                      <Check className="h-3.5 w-3.5 text-white drop-shadow" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Window Controls */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Window Controls
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-background rounded-lg border border-border">
                {(["mac", "win", "none"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setWindowControls(mode)}
                    className={`py-1 text-xs font-medium rounded capitalize transition ${
                      windowControls === mode
                        ? "bg-primary text-primary-foreground shadow"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {mode === "mac" ? "macOS" : mode === "win" ? "Windows" : "None"}
                  </button>
                ))}
              </div>
            </div>

            {/* Padding */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Padding
              </label>
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-background rounded-lg border border-border">
                {PADDING_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPadding(opt.value)}
                    className={`py-1 text-xs font-medium rounded transition ${
                      padding === opt.value
                        ? "bg-primary text-primary-foreground shadow"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Font Size
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-background rounded-lg border border-border">
                {FONT_SIZES.map((fs) => (
                  <button
                    key={fs.value}
                    onClick={() => setFontSize(fs.value)}
                    className={`py-1 text-xs font-medium rounded transition ${
                      fontSize === fs.value
                        ? "bg-primary text-primary-foreground shadow"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {fs.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-2 pt-2 border-t border-border">
              <label className="flex items-center justify-between cursor-pointer py-1">
                <span className="text-xs text-foreground">Line Numbers</span>
                <input
                  type="checkbox"
                  checked={showLineNumbers}
                  onChange={(e) => setShowLineNumbers(e.target.checked)}
                  className="rounded border-border accent-primary h-4 w-4"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer py-1">
                <span className="text-xs text-foreground">CodesRoom Watermark</span>
                <input
                  type="checkbox"
                  checked={showWatermark}
                  onChange={(e) => setShowWatermark(e.target.checked)}
                  className="rounded border-border accent-primary h-4 w-4"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer py-1">
                <span className="text-xs text-foreground">Drop Shadow</span>
                <input
                  type="checkbox"
                  checked={hasShadow}
                  onChange={(e) => setHasShadow(e.target.checked)}
                  className="rounded border-border accent-primary h-4 w-4"
                />
              </label>
            </div>
          </div>

          {/* Canvas Preview Area (Right) */}
          <div className="lg:col-span-8 p-4 sm:p-8 bg-black/40 overflow-auto flex items-center justify-center min-h-[350px]">
            {/* The element being captured */}
            <div
              ref={cardRef}
              className="transition-all duration-200 inline-block max-w-full"
              style={{
                background: selectedTheme.bg,
                padding: `${padding}px`,
                borderRadius: "16px",
              }}
            >
              <div
                className={`w-full min-w-[320px] max-w-[650px] bg-[#12141a]/95 rounded-xl border border-white/10 overflow-hidden font-mono text-zinc-100 ${
                  hasShadow
                    ? "shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_1px_1px_rgba(255,255,255,0.1)]"
                    : ""
                }`}
                style={{ fontSize: `${fontSize}px` }}
              >
                {/* Window Title Bar */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#181a20]/90 border-b border-white/5 select-none">
                  <div className="flex items-center gap-2">
                    {windowControls === "mac" && (
                      <div className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-full bg-[#ff5f56] inline-block shadow-sm" />
                        <span className="h-3 w-3 rounded-full bg-[#ffbd2e] inline-block shadow-sm" />
                        <span className="h-3 w-3 rounded-full bg-[#27c93f] inline-block shadow-sm" />
                      </div>
                    )}
                    {windowControls === "win" && (
                      <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-sans">
                        <span>─</span>
                        <span>□</span>
                        <span>✕</span>
                      </div>
                    )}
                    <span className="ml-2 text-xs font-sans text-zinc-400 font-medium tracking-wide">
                      {customTitle || `${language}.${language === "javascript" ? "js" : language}`}
                    </span>
                  </div>

                  <span className="text-[10px] uppercase font-sans tracking-widest text-zinc-500 bg-white/5 px-2 py-0.5 rounded">
                    {language}
                  </span>
                </div>

                {/* Code Body */}
                <div className="p-4 sm:p-5 overflow-x-auto leading-relaxed max-h-[460px]">
                  <table className="w-full border-collapse">
                    <tbody>
                      {lines.map((line, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02]">
                          {showLineNumbers && (
                            <td className="pr-4 text-right text-zinc-600 select-none text-xs w-8 align-top">
                              {idx + 1}
                            </td>
                          )}
                          <td className="whitespace-pre font-mono text-zinc-200">
                            {line || " "}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Optional Watermark */}
                {showWatermark && (
                  <div className="px-4 py-2 bg-[#0e1015]/80 border-t border-white/5 flex items-center justify-between text-[11px] font-sans text-zinc-500">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      codesroom.in
                    </span>
                    <span className="text-[10px] text-zinc-600">Online IDE & Playground</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-t border-border bg-card">
          <div className="text-xs text-muted-foreground hidden sm:block">
            High-DPI Retina PNG export with zero quality loss.
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyImage}
              disabled={isExporting}
              className="gap-2 text-xs"
            >
              {copiedImage ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedImage ? "Copied!" : "Copy Image"}
            </Button>
            <Button
              size="sm"
              onClick={handleDownload}
              disabled={isExporting}
              className="gap-2 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md"
            >
              <Download className="h-3.5 w-3.5" />
              {isExporting ? "Rendering..." : "Download PNG"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});
