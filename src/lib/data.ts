import {
  Code2,
  FileJson,
  ShieldCheck,
  Terminal,
  Users,
  Zap,
} from "lucide-react";

export const LANGS = [
  { name: "JavaScript", color: "from-yellow-400 to-amber-500" },
  { name: "TypeScript", color: "from-sky-400 to-blue-600" },
  { name: "Python", color: "from-blue-400 to-cyan-500" },
  { name: "Java", color: "from-orange-500 to-red-600" },
  { name: "C++", color: "from-indigo-400 to-violet-600" },
  { name: "Go", color: "from-cyan-400 to-teal-500" },
  { name: "Rust", color: "from-amber-500 to-orange-700" },
  { name: "HTML/CSS", color: "from-pink-400 to-fuchsia-600" },
  { name: "PHP", color: "from-violet-400 to-indigo-600" },
  { name: "Ruby", color: "from-rose-400 to-red-600" },
  { name: "C#", color: "from-emerald-400 to-green-600" },
  { name: "Bash", color: "from-zinc-400 to-zinc-700" },
];

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
  plaintext: "#78716c",
};

export const FEATURES = [
  {
    icon: Zap,
    title: "Instant execution",
    body: "Run Python, JS, Java, C++ and Go in seconds — no setup, no signup.",
  },
  {
    icon: Code2,
    title: "Monaco editor",
    body: "The same editor as VS Code. Syntax highlighting, IntelliSense, multi-cursor.",
  },
  {
    icon: Users,
    title: "Realtime rooms",
    body: "Share a link, pair-program, and watch edits stream live.",
  },
  {
    icon: FileJson,
    title: "JSON toolkit",
    body: "Format, minify, validate, tree-view, and convert to YAML or XML.",
  },
  {
    icon: Terminal,
    title: "Terminal output",
    body: "True dev console — color-coded stdout/stderr with execution time.",
  },
  {
    icon: ShieldCheck,
    title: "Sandboxed runtime",
    body: "JS/TS execute in isolated iframes. Server code runs in containerized workers.",
  },
];
