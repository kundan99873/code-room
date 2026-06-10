import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function buildJsSandbox(source: string, isTs: boolean): string {
  const transformed = isTs ? stripTsTypes(source) : source;
  return `<!doctype html><html><head><meta charset="utf-8"></head><body><script>
    (function(){
      const safe = (v) => { /* ... same as before ... */ };
      const send = (level, args) => parent.postMessage({ __runner: true, level, args: args.map(safe) }, "*");
      ["log","info","warn","error","debug"].forEach((k) => {
        const orig = console[k].bind(console);
        console[k] = (...a) => { send(k, a); orig(...a); };
      });
      window.addEventListener("error", (e) => send("error", [e.message]));
      window.addEventListener("unhandledrejection", (e) => send("error", ["Unhandled rejection: " + (e.reason?.message || e.reason)]));
      try {
        ${transformed}
        send("done", []);
      } catch (e) {
        send("error", [e.stack || e.message || String(e)]);
        send("done", []);
      }
    })();
  <\/script></body></html>`;
}

export function stripTsTypes(src: string): string {
  return src
    .replace(/:\s*[A-Za-z_$][\w$<>[\],\s|&?.]*(?=[\s),=;{])/g, "")
    .replace(/\sas\s+[A-Za-z_$][\w$<>[\],\s|&?.]*/g, "")
    .replace(/<[A-Za-z_$][\w$,\s]*>(?=\s*\()/g, "");
}

export function isRunnerNoise(text: string) {
  return (
    /\[(v3-piercer|lovable|vite)\]/i.test(text) ||
    text.includes("server connection lost")
  );
}


