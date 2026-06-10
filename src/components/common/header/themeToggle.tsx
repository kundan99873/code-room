import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme, type Theme } from "@/context/themeContext";
import { cn } from "@/lib/utils";

const OPTIONS: { value: Theme; icon: typeof Sun; label: string }[] = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "system", icon: Monitor, label: "System" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/60 p-1 backdrop-blur"
    >
      {OPTIONS.map(({ value, icon: Icon, label }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            onClick={() => setTheme(value)}
            className={cn(
              "grid h-7 w-7 place-items-center rounded-full transition-all duration-200",
              active
                ? "bg-gradient-to-br from-primary to-violet-500 text-white shadow-[0_4px_14px_-2px_color-mix(in_oklab,var(--primary)_60%,transparent)] scale-105"
                : "text-muted-foreground hover:text-foreground hover:bg-background/60",
            )}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
          </button>
        );
      })}
    </div>
  );
}
