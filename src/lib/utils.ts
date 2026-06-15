import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export function stripTsTypes(src: string): string {
  return src
    .replace(/:\s*[A-Za-z_$][\w$<>[\],\s|&?.]*(?=[\s),=;{])/g, "")
    .replace(/\sas\s+[A-Za-z_$][\w$<>[\],\s|&?.]*/g, "")
    .replace(/<[A-Za-z_$][\w$,\s]*>(?=\s*\()/g, "");
}


export type OutLine = {
  level: "log" | "info" | "warn" | "error" | "debug" | "sys";
  text: string;
};

export const LANG_COLORS: Record<string, string> = {
  javascript: "#f7df1e",
  typescript: "#3178c6",
  python: "#3776ab",
  go: "#00add8",
  rust: "#dea584",
  java: "#f89820",
  cpp: "#00599c",
  csharp: "#9b4f96",
  php: "#777bb4",
  ruby: "#cc342d",
  bash: "#4eaa25",
  json: "#a3a3a3",
};

export function transformTypeScript(source: string): string {
  const cleanParams = (params: string) =>
    params.replace(/\b([A-Za-z_$][\w$]*)\??\s*:\s*[^,]+/g, "$1");

  return source
    .replace(/^\s*type\s+[A-Za-z_$][\w$]*\s*=\s*[\s\S]*?;\s*$/gm, "")
    .replace(/^\s*interface\s+[A-Za-z_$][\w$]*\s*{[\s\S]*?}\s*$/gm, "")
    .replace(/\b(const|let|var)\s+([A-Za-z_$][\w$]*)\s*:\s*[^=;]+(?=\s*=)/g, "$1 $2")
    .replace(/\(([^()]*)\)\s*:\s*[^=({]+\s*=>/g, (_, params) => `(${cleanParams(params)}) =>`)
    .replace(/\(([^()]*)\)\s*=>/g, (_, params) => `(${cleanParams(params)}) =>`)
    .replace(/function(\s+[A-Za-z_$][\w$]*)?\s*\(([^()]*)\)\s*:\s*[^({]+\s*{/g, (_, name = "", params) => `function${name}(${cleanParams(params)}) {`)
    .replace(/\sas\s+[A-Za-z_$][\w$<>[\],\s|&?.]*/g, "")
    .replace(/<[A-Za-z_$][\w$,\s]*>(?=\s*\()/g, "");
}

export function buildJsSandbox(source: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"></head><body><script>
    (function(){
      const safe = (v) => {
        try {
          if (v instanceof Error) return v.stack || v.message;
          if (typeof v === "function") return v.toString();
          if (typeof v === "object" && v !== null) return JSON.stringify(v, null, 2);
          return String(v);
        } catch (e) { return String(v); }
      };
      const send = (level, args) => parent.postMessage({ __runner: true, level, args: args.map(safe) }, "*");
      ["log","info","warn","error","debug"].forEach((k) => {
        const orig = console[k].bind(console);
        console[k] = (...a) => { send(k, a); orig(...a); };
      });
      window.addEventListener("error", (e) => send("error", [e.message]));
      window.addEventListener("unhandledrejection", (e) => send("error", ["Unhandled rejection: " + (e.reason && e.reason.message || e.reason)]));
      try {
        ${source}
        send("done", []);
      } catch (e) {
        send("error", [e.stack || e.message || String(e)]);
        send("done", []);
      }
    })();
  <\/script></body></html>`;
}

export function isRunnerNoise(text: string) {
  return /\[(v3-piercer|lovable|vite)\]/i.test(text) || text.includes("server connection lost");
}

