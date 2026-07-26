import { useState } from "react";

export function JsonTree({ data, k }: { data: any; k?: string }) {
  const [open, setOpen] = useState(true);
  
  if (data === null) {
    return <Leaf k={k} v="null" cls="text-zinc-400" />;
  }
  
  if (typeof data !== "object") {
    const cls =
      typeof data === "string"
        ? "text-emerald-400"
        : typeof data === "number"
          ? "text-sky-400"
          : typeof data === "boolean"
            ? "text-amber-300"
            : "text-zinc-200";
    const v = typeof data === "string" ? `"${data}"` : String(data);
    return <Leaf k={k} v={v} cls={cls} />;
  }
  
  const arr = Array.isArray(data);
  const entries = arr
    ? data.map((v: any, i: number) => [String(i), v] as const)
    : Object.entries(data);
    
  return (
    <div className="font-mono text-[13px]">
      <div
        className="cursor-pointer select-none"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="text-zinc-500 mr-1">{open ? "▾" : "▸"}</span>
        {k && <span className="text-violet-300">{k}: </span>}
        <span className="text-zinc-400">
          {arr ? `[${entries.length}]` : `{${entries.length}}`}
        </span>
      </div>
      {open && (
        <div className="pl-5 border-l border-border ml-1.5">
          {entries.map(([kk, v]) => (
            <JsonTree key={kk} data={v} k={kk} />
          ))}
        </div>
      )}
    </div>
  );
}

function Leaf({ k, v, cls }: { k?: string; v: string; cls: string }) {
  return (
    <div className="font-mono text-[13px] pl-4">
      {k && <span className="text-violet-300">{k}: </span>}
      <span className={cls}>{v}</span>
    </div>
  );
}
