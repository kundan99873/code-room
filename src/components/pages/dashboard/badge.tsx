import { Globe2, Lock } from "lucide-react";

export function Badge({ variant }: { variant: "public" | "private" }) {
    if (variant === "public") {
        return (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Globe2 className="h-3 w-3" /> Public
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border border-zinc-500/20">
            <Lock className="h-3 w-3" /> Private
        </span>
    );
}
