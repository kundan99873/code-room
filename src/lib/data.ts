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
    icon: Code2,
    title: "Web Pen",
    body: "Build frontend prototypes with HTML, CSS, and JS. See your updates render live as you type.",
  },
  {
    icon: Zap,
    title: "Multi-Language Playground",
    body: "Compile and run code in 15+ languages including Python, JS, TS, Java, C++, Go, and Rust.",
  },
  {
    icon: Users,
    title: "Collaborative Rooms",
    body: "Create private or public rooms to pair-program in real-time and stream edits live.",
  },
  {
    icon: ShieldCheck,
    title: "Team Workspaces",
    body: "Organize your collaborative rooms, manage member roles, and share workspaces under Teams.",
  },
  {
    icon: FileJson,
    title: "JSON Toolkit",
    body: "Format, minify, validate, view interactive tree-views, and convert JSON to YAML or XML.",
  },
  {
    icon: Terminal,
    title: "Monaco Editor",
    body: "Enjoy the same powerful editing experience as VS Code, with IntelliSense, auto-formatting, and shortcuts.",
  },
];
