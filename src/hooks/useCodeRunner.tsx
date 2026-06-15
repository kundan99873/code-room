import { useState, useRef, useEffect } from "react";
import { runOnPiston, getPistonEndpoint, LANG_BY_ID } from "@/lib/languages";
import { buildJsSandbox, isRunnerNoise, transformTypeScript } from "@/lib/utils";
import type { OutLine } from "@/lib/data";

export function useCodeRunner({
  value,
  language,
}: {
  value: string;
  language: string;
  onChange?: (v: string) => void;
}) {
  const [lines, setLines] = useState<OutLine[]>([]);
  const [running, setRunning] = useState(false);
  const [execMs, setExecMs] = useState<number | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string>("");
  const [endpoint, setEndpoint] = useState(() => getPistonEndpoint());

  const codeRef = useRef(value);
  codeRef.current = value;

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const startedAt = useRef(0);

  const lang = LANG_BY_ID[language];
  const mode = lang?.runMode ?? "none";

  const append = (l: OutLine) => setLines((p) => [...p, l]);

  // Preview for web mode
  useEffect(() => {
    if (mode !== "web") return;
    const t = setTimeout(() => setPreviewSrc(value), 300);
    return () => clearTimeout(t);
  }, [value, mode]);

  // Browser JS sandbox
  useEffect(() => {
    if (mode !== "browser") return;

    const onMsg = (e: MessageEvent) => {
      const d = e.data as any;
      if (!d?.__runner) return;

      if (d.level === "done") {
        setRunning(false);
        setExecMs(Math.round(performance.now() - startedAt.current));
        return;
      }

      const text = d.args.join(" ");
      if (!isRunnerNoise(text)) {
        append({ level: d.level, text });
      }
    };

    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [mode]);

  const run = async () => {
    setLines([]);
    setExecMs(null);
    startedAt.current = performance.now();

    if (mode === "web") {
      setPreviewSrc(codeRef.current + `\n<!-- ${Date.now()} -->`);
      return;
    }

    if (mode === "browser") {
      setRunning(true);
      const source = language === "typescript" ? transformTypeScript(codeRef.current) : codeRef.current;
      const html = buildJsSandbox(source);
      iframeRef.current!.srcdoc = html;
      setTimeout(() => setRunning(false), 8000);
      return;
    }

    if (mode === "server") {
      setRunning(true);
      try {
        const r = await runOnPiston(language, codeRef.current);
        setExecMs(
          r.timeMs ?? Math.round(performance.now() - startedAt.current),
        );

        if (r.stdout)
          append({ level: "log", text: r.stdout.replace(/\n+$/, "") });
        if (r.stderr)
          append({ level: "error", text: r.stderr.replace(/\n+$/, "") });
      } catch (e: any) {
        append({ level: "error", text: e?.message ?? String(e) });
      } finally {
        setRunning(false);
      }
    }
  };

  const clearOutput = () => {
    setLines([]);
    setExecMs(null);
    if (mode === "web") setPreviewSrc("");
  };

  return {
    lines,
    running,
    execMs,
    previewSrc,
    mode,
    run,
    clearOutput,
    iframeRef,
    append,
    endpoint,
    setEndpoint,
  };
}
