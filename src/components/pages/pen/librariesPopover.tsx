import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Library, Plus, X } from "lucide-react";

interface LibrariesPopoverProps {
  cssLibs: string[];
  jsLibs: string[];
  setCssLibs: (v: string[]) => void;
  setJsLibs: (v: string[]) => void;
}

export function LibrariesPopover({
  cssLibs,
  jsLibs,
  setCssLibs,
  setJsLibs,
}: LibrariesPopoverProps) {
  const [cssDraft, setCssDraft] = useState("");
  const [jsDraft, setJsDraft] = useState("");

  const addCss = () => {
    const v = cssDraft.trim();
    if (!v) return;
    setCssLibs([...cssLibs, v]);
    setCssDraft("");
  };

  const addJs = () => {
    const v = jsDraft.trim();
    if (!v) return;
    setJsLibs([...jsLibs, v]);
    setJsDraft("");
  };

  const total = cssLibs.length + jsLibs.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5 h-9" title="Libraries">
          <Library className="h-4 w-4" />
          <span className="hidden sm:inline">Libraries</span>
          {total > 0 && (
            <span className="ml-1 rounded bg-primary/15 text-primary px-1.5 text-[10px] font-semibold">
              {total}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="end">
        <div className="space-y-4">
          <div>
            <div className="text-xs font-semibold mb-1.5 text-muted-foreground uppercase tracking-wide">
              CSS CDN
            </div>
            <div className="flex gap-1.5">
              <Input
                placeholder="https://cdn.jsdelivr.net/.../bootstrap.min.css"
                value={cssDraft}
                onChange={(e) => setCssDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCss())}
                className="h-8 text-xs"
              />
              <Button size="sm" className="h-8 px-2" onClick={addCss}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
            <ul className="mt-2 space-y-1">
              {cssLibs.map((u, i) => (
                <li key={i} className="flex items-center gap-1.5 text-xs bg-muted/40 rounded px-2 py-1">
                  <span className="truncate flex-1 font-mono">{u}</span>
                  <button
                    onClick={() => setCssLibs(cssLibs.filter((_, j) => j !== i))}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs font-semibold mb-1.5 text-muted-foreground uppercase tracking-wide">
              JS CDN
            </div>
            <div className="flex gap-1.5">
              <Input
                placeholder="https://cdn.jsdelivr.net/npm/jquery"
                value={jsDraft}
                onChange={(e) => setJsDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addJs())}
                className="h-8 text-xs"
              />
              <Button size="sm" className="h-8 px-2" onClick={addJs}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
            <ul className="mt-2 space-y-1">
              {jsLibs.map((u, i) => (
                <li key={i} className="flex items-center gap-1.5 text-xs bg-muted/40 rounded px-2 py-1">
                  <span className="truncate flex-1 font-mono">{u}</span>
                  <button
                    onClick={() => setJsLibs(jsLibs.filter((_, j) => j !== i))}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
