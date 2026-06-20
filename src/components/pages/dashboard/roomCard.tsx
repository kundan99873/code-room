import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Code2, Clock, ArrowRight } from "lucide-react";
import { Badge } from "./badge";
import { RoomMenu } from "./roomMenu";
import { LANG_BY_ID } from "@/lib/languages";

type Room = {
    id: string;
    name: string;
    language: string;
    owner_id: string;
    is_public: boolean;
    updated_at: string;
    created_at: string;
    db_id?: string;
};

const LANG_ACCENT: Record<string, string> = {
    javascript: "from-amber-400 to-yellow-500",
    typescript: "from-sky-400 to-blue-600",
    python: "from-emerald-400 to-cyan-500",
    rust: "from-orange-500 to-rose-500",
    go: "from-cyan-400 to-sky-600",
    java: "from-rose-400 to-orange-500",
    cpp: "from-indigo-400 to-purple-600",
    csharp: "from-violet-500 to-fuchsia-500",
    php: "from-indigo-400 to-blue-500",
    ruby: "from-rose-500 to-red-600",
    bash: "from-zinc-400 to-zinc-600",
    html: "from-orange-400 to-rose-500",
    css: "from-sky-400 to-indigo-500",
    sql: "from-emerald-500 to-teal-600",
    json: "from-amber-300 to-orange-500",
};

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d ago`;
    return new Date(iso).toLocaleDateString();
}

export function RoomCard({
    room, index, isOwner, view, onDelete, onCopyLink, onToggleVisibility,
}: {
    room: Room; index: number; isOwner: boolean; view: "grid" | "list";
    onDelete: () => void; onCopyLink: () => void; onToggleVisibility: () => void;
}) {
    const accent = LANG_ACCENT[room.language] ?? "from-indigo-400 to-fuchsia-500";
    const langLabel = LANG_BY_ID[room.language]?.label ?? room.language;

    if (view === "list") {
        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.15) }}
                className="group relative rounded-xl border border-border bg-card p-3.5 hover:border-primary/40 hover:shadow-sm transition"
            >
                <Link to={`/room/${room.id}`} className="absolute inset-0 z-10" aria-label={room.name} />
                <div className="flex items-center gap-3">
                    <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${accent} text-white`}>
                        <Code2 className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="truncate font-medium text-sm">{room.name}</h3>
                            <Badge variant={room.is_public ? "public" : "private"} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {langLabel} · updated {timeAgo(room.updated_at)}
                        </p>
                    </div>
                    <RoomMenu
                        isOwner={isOwner}
                        isPublic={room.is_public}
                        onDelete={onDelete}
                        onCopyLink={onCopyLink}
                        onToggleVisibility={onToggleVisibility}
                    />
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: Math.min(index * 0.025, 0.2), ease: "easeOut" }}
            whileHover={{ y: -2 }}
            className="group relative rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:shadow-md transition"
        >
            <Link to={`/room/${room.id}`} className="absolute inset-0 z-10 rounded-xl" aria-label={room.name} />

            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${accent} text-white shadow-sm`}>
                        <Code2 className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-medium text-sm leading-tight truncate">{room.name}</h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5 font-mono truncate">#{room.db_id ? room.db_id.slice(0, 8) : room.id.slice(0, 8)}</p>
                    </div>
                </div>
                <RoomMenu
                    isOwner={isOwner}
                    isPublic={room.is_public}
                    onDelete={onDelete}
                    onCopyLink={onCopyLink}
                    onToggleVisibility={onToggleVisibility}
                />
            </div>

            <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-muted text-foreground/80">
                    {langLabel}
                </span>
                <Badge variant={room.is_public ? "public" : "private"} />
                {isOwner && (
                    <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        Owner
                    </span>
                )}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {timeAgo(room.updated_at)}
                </span>
                <span className="inline-flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition">
                    Open <ArrowRight className="h-3 w-3" />
                </span>
            </div>
        </motion.div>
    );
}
