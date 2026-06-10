import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { LANG_COLORS } from "@/lib/data";
import { LANGUAGES } from "@/lib/languages";

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export function LanguageSelect({ value, onChange }: Props) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-48 rounded-full border-border/70 bg-background/60 px-3 text-sm shadow-sm backdrop-blur hover:bg-accent/50 transition">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: LANG_COLORS[value] ?? "var(--muted-foreground)" }}
          />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        {LANGUAGES.map((l) => (
          <SelectItem key={l.id} value={l.id} className="rounded-lg my-0.5">
            <span className="flex items-center gap-2">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: LANG_COLORS[l.id] ?? "var(--muted-foreground)" }}
              />
              <span className="font-medium">{l.label}</span>
              {l.runMode === "browser" && (
                <span className="ml-1 text-[10px] uppercase tracking-wide rounded-md px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">browser</span>
              )}
              {l.runMode === "server" && (
                <span className="ml-1 text-[10px] uppercase tracking-wide rounded-md px-1.5 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">server</span>
              )}
              {l.runMode === "web" && (
                <span className="ml-1 text-[10px] uppercase tracking-wide rounded-md px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400">web</span>
              )}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
