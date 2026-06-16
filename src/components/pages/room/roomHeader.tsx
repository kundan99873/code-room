import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft, Sparkles, Globe2, Lock, LockKeyhole, Wifi, WifiOff, Users, Copy,
    PanelRightClose, PanelRightOpen,
} from "lucide-react";

type Room = {
    id: string;
    name: string;
    language: string;
    code: string;
    owner_id: string;
    is_public: boolean;
    updated_at: string;
};

export function RoomHeader({
    room,
    filesCount,
    updatedLabel,
    activeFileLang,
    connected,
    presence,
    panelOpen,
    setPanelOpen,
    copyLink,
}: {
    room: Room;
    filesCount: number;
    updatedLabel: string;
    activeFileLang: string | undefined;
    connected: boolean;
    presence: number;
    panelOpen: boolean;
    setPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
    copyLink: () => void;
}) {
    return (
        <motion.header
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative overflow-hidden border-b border-border bg-card/90 px-4 py-3 shadow-sm backdrop-blur"
        >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3 min-w-0">
                    <Link to="/dashboard" className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-background text-muted-foreground transition hover:text-foreground hover:border-primary/40">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <motion.div
                        initial={{ scale: 0.9, rotate: -4 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 240, damping: 18 }}
                        className="relative grid h-11 w-11 place-items-center rounded-xl border border-primary/20 bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-sm"
                    >
                        <Sparkles className="absolute -right-1 -top-1 h-3.5 w-3.5 text-amber-300" />
                        <span className="text-sm font-bold">{room.name.charAt(0).toUpperCase()}</span>
                    </motion.div>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="truncate text-base font-semibold md:text-lg">{room.name}</h1>
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">#{room.id.slice(0, 6)}</span>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${room.is_public
                                    ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                                    : "bg-zinc-500/15 text-zinc-400 border border-zinc-500/30"
                                }`}>
                                {room.is_public ? <Globe2 className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                                {room.is_public ? "Public" : "Private"}
                            </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1"><LockKeyhole className="h-3 w-3" /> collaborative</span>
                            <span>{filesCount} file{filesCount === 1 ? "" : "s"}</span>
                            <span>saved {updatedLabel}</span>
                            {activeFileLang && <span className="font-mono">{activeFileLang}</span>}
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">

                    <div className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs shadow-sm">
                        <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-emerald-500 animate-pulse" : "bg-destructive"}`} />
                        {connected ? <span className="text-foreground">Live sync</span> : <span className="text-muted-foreground">Offline</span>}
                        {connected ? <Wifi className="h-3 w-3 text-emerald-500" /> : <WifiOff className="h-3 w-3 text-destructive" />}
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs shadow-sm">
                        <Users className="h-3 w-3 text-primary" />
                        <span className="font-medium">{presence}</span>
                        <span className="text-muted-foreground">online</span>
                    </div>
                    <Button size="sm" variant="default" onClick={copyLink} className="h-9 gap-1.5 shadow-sm cursor-pointer">
                        <Copy className="h-3.5 w-3.5" /> Share
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPanelOpen((v) => !v)}
                        className="h-9 gap-1.5 cursor-pointer"
                        title="Toggle members panel"
                    >
                        {panelOpen ? <PanelRightClose className="h-3.5 w-3.5" /> : <PanelRightOpen className="h-3.5 w-3.5" />}
                        <span className="hidden md:inline">Members</span>
                    </Button>
                </div>
            </div>
        </motion.header>
    );
}
