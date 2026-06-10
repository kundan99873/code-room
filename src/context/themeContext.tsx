import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "light" | "system";
type Ctx = { theme: Theme; setTheme: (t: Theme) => void; resolved: "dark" | "light" };

const ThemeCtx = createContext<Ctx | null>(null);
const KEY = "coderoom.theme";

function applyTheme(t: Theme) {
  if (typeof document === "undefined") return;
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  const resolved = t === "system" ? (mql.matches ? "dark" : "light") : t;
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.classList.toggle("light", resolved === "light");
  return resolved;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [resolved, setResolved] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const stored = (localStorage.getItem(KEY) as Theme | null) ?? "system";
    setThemeState(stored);
    const r = applyTheme(stored);
    if (r) setResolved(r);
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const t = (localStorage.getItem(KEY) as Theme | null) ?? "system";
      if (t === "system") {
        const r = applyTheme("system");
        if (r) setResolved(r);
      }
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const setTheme = (t: Theme) => {
    localStorage.setItem(KEY, t);
    setThemeState(t);
    const r = applyTheme(t);
    if (r) setResolved(r);
  };

  return <ThemeCtx.Provider value={{ theme, setTheme, resolved }}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const c = useContext(ThemeCtx);
  if (!c) throw new Error("useTheme must be used inside ThemeProvider");
  return c;
}
