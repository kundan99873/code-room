import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { LANGUAGES, LANG_BY_ID } from "@/lib/languages";
import {
    Plus, ArrowRight, Search, Sparkles, Link2, Hash, Activity, Globe2, Filter, LayoutGrid, Rows3,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { StatCard } from "@/components/pages/dashboard/statCard";
import { RoomCard } from "@/components/pages/dashboard/roomCard";
import { EmptyState } from "@/components/pages/dashboard/emptyState";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createRoom, fetchUserRooms, updateRoom, deleteRoom } from "@/api/rooms";

type Room = {
    id: string;
    name: string;
    language: string;
    owner_id: string;
    is_public: boolean;
    updated_at: string;
    created_at: string;
};

type FilterType = "all" | "public" | "private" | "mine";
type SortType = "recent" | "name" | "language";

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [language, setLanguage] = useState("javascript");
    const [isPublic, setIsPublic] = useState<"public" | "private">("public");
    const [joinId, setJoinId] = useState("");
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState<FilterType>("all");
    const [sort, setSort] = useState<SortType>("recent");
    const [view, setView] = useState<"grid" | "list">("grid");
    const [langFilter, setLangFilter] = useState<string>("all");

    // Fetch user rooms
    const { data: rawRooms = [], isLoading: loading } = useQuery<any[]>({
        queryKey: ["rooms"],
        queryFn: fetchUserRooms,
        refetchOnWindowFocus: true,
    });

    // Map backend response rooms to frontend expected format
    const rooms = useMemo(() => {
        return rawRooms.map((r: any) => ({
            id: r._id,
            name: r.name,
            language: r.language,
            owner_id: typeof r.ownerId === "object" ? r.ownerId?._id : r.ownerId,
            is_public: r.isPublic,
            updated_at: r.updatedAt,
            created_at: r.createdAt,
        }));
    }, [rawRooms]);

    // Create room mutation
    const createMutation = useMutation({
        mutationFn: createRoom,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["rooms"] });
            toast.success(`Created room "${data.name}"`);
            navigate(`/room/${data._id}`);
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to create room");
        },
    });

    // Delete room mutation
    const deleteMutation = useMutation({
        mutationFn: deleteRoom,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["rooms"] });
            toast.success("Room deleted");
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to delete room");
        },
    });

    // Update room mutation (for visibility changes)
    const updateMutation = useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: any }) => updateRoom(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["rooms"] });
            toast.success("Room visibility updated");
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to update room");
        },
    });

    const create = async () => {
        if (!name.trim()) return toast.error("Room name is required");
        createMutation.mutate({
            name: name.trim(),
            language,
            isPublic: isPublic === "public",
        });
        setOpen(false);
        setName("");
    };

    const remove = async (id: string) => {
        if (confirm("Are you sure you want to delete this room? This action cannot be undone.")) {
            deleteMutation.mutate(id);
        }
    };

    const toggleVisibility = async (room: Room) => {
        updateMutation.mutate({
            id: room.id,
            updates: { isPublic: !room.is_public },
        });
    };

    const copyLink = async (id: string) => {
        const url = `${window.location.origin}/room/${id}`;
        await navigator.clipboard.writeText(url);
        toast.success("Invite link copied");
    };

    const filtered = useMemo(() => {
        let list = rooms.slice();
        if (filter === "public") list = list.filter((r) => r.is_public);
        if (filter === "private") list = list.filter((r) => !r.is_public);
        if (filter === "mine") list = list.filter((r) => r.owner_id === user?.id);
        if (langFilter !== "all") list = list.filter((r) => r.language === langFilter);
        if (query.trim()) {
            const q = query.toLowerCase();
            list = list.filter((r) => r.name.toLowerCase().includes(q) || r.language.toLowerCase().includes(q));
        }
        if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
        if (sort === "language") list.sort((a, b) => a.language.localeCompare(b.language));
        return list;
    }, [rooms, filter, langFilter, query, sort, user?.id]);

    const stats = useMemo(() => ({
        total: rooms.length,
        mine: rooms.filter((r) => r.owner_id === user?.id).length,
        shared: rooms.filter((r) => r.is_public && r.owner_id !== user?.id).length,
        recent: rooms.filter((r) => Date.now() - new Date(r.updated_at).getTime() < 1000 * 60 * 60 * 24).length,
    }), [rooms, user?.id]);

    const usedLanguages = useMemo(
        () => Array.from(new Set(rooms.map((r) => r.language))).sort(),
        [rooms],
    );

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Ambient background */}
            <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
                <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
                <div className="absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/10 blur-3xl" />
                <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage:
                            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
                        backgroundSize: "32px 32px",
                    }}
                />
            </div>

            <main className="mx-auto max-w-7xl px-4 py-8 md:py-12">
                {/* Header */}
                <motion.section
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-8"
                >
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div className="min-w-0">
                            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 backdrop-blur px-3 py-1 text-xs text-muted-foreground">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                                </span>
                                Live workspace
                            </div>
                            <h1 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight">
                                <span className="bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                                    Your Rooms
                                </span>
                            </h1>
                            <p className="text-muted-foreground text-sm md:text-base mt-2 max-w-xl">
                                Spin up a session, invite teammates, and code together in real time —
                                with live previews and instant runtimes.
                            </p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                        <StatCard icon={<Hash className="h-4 w-4" />} label="Total Rooms" value={stats.total} tint="from-indigo-500/20 to-indigo-500/0" />
                        <StatCard icon={<Activity className="h-4 w-4" />} label="Active (24h)" value={stats.recent} tint="from-emerald-500/20 to-emerald-500/0" />
                        <StatCard icon={<Globe2 className="h-4 w-4" />} label="Shared" value={stats.shared} tint="from-cyan-500/20 to-cyan-500/0" />
                        <StatCard icon={<Sparkles className="h-4 w-4" />} label="Owned" value={stats.mine} tint="from-fuchsia-500/20 to-fuchsia-500/0" />
                    </div>
                </motion.section>

                {/* Action bar */}
                <motion.section
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.05 }}
                    className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-3 md:p-4 shadow-sm"
                >
                    <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
                        {/* Search */}
                        <div className="relative flex-1 min-w-0">
                            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search rooms by name or language…"
                                className="pl-9 h-11 bg-background/60 border-border focus-visible:ring-2 focus-visible:ring-primary/40"
                            />
                        </div>

                        {/* Join */}
                        <div className="flex gap-2">
                            <div className="relative">
                                <Link2 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Paste room ID…"
                                    value={joinId}
                                    onChange={(e) => setJoinId(e.target.value)}
                                    className="pl-9 h-11 w-48 md:w-64 bg-background/60"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && joinId.trim()) {
                                            navigate("/room/" + joinId.trim());
                                        }
                                    }}
                                />
                            </div>
                            <Button
                                variant="outline"
                                className="h-11 cursor-pointer"
                                onClick={() => joinId.trim() && navigate("/room/" + joinId.trim())}
                            >
                                Join <ArrowRight className="ml-1 h-4 w-4" />
                            </Button>

                            <Dialog open={open} onOpenChange={setOpen}>
                                <DialogTrigger asChild>
                                    <Button className="h-11 gap-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white border-0 shadow-[0_8px_30px_-10px_hsl(265_80%_60%)] hover:shadow-[0_12px_40px_-10px_hsl(265_80%_60%)] hover:scale-[1.02] transition cursor-pointer">
                                        <Plus className="h-4 w-4" /> New Room
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[460px] border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl p-6 rounded-2xl animate-in duration-300">
                                    <DialogHeader>
                                        <DialogTitle className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
                                            <Sparkles className="h-5 w-5 text-amber-300 animate-pulse" /> Create a coding room
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-5 mt-2">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-foreground/80 tracking-wide">Room name</Label>
                                            <Input
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="e.g. quicksort-pair"
                                                className="h-10 bg-background/50 border-border focus-visible:ring-primary/30"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-foreground/80 tracking-wide">Language</Label>
                                                <Select value={language} onValueChange={setLanguage}>
                                                    <SelectTrigger className="w-full h-10 bg-background/50 border-border">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {LANGUAGES.map((l) => (
                                                            <SelectItem key={l.id} value={l.id}>{l.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-foreground/80 tracking-wide">Visibility</Label>
                                                <Select value={isPublic} onValueChange={(v) => setIsPublic(v as "public" | "private")}>
                                                    <SelectTrigger className="w-full h-10 bg-background/50 border-border">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="public">Public — anyone with the link</SelectItem>
                                                        <SelectItem value="private">Private — only you</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                    <DialogFooter className="mt-6">
                                        <Button
                                            onClick={create}
                                            className="h-10 w-full md:w-auto px-5 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white border-0 shadow-[0_8px_30px_-10px_rgba(99,102,241,0.5)] hover:shadow-[0_12px_40px_-10px_rgba(99,102,241,0.7)] hover:scale-[1.01] transition duration-200 cursor-pointer font-medium"
                                        >
                                            <Sparkles className="mr-1.5 h-4 w-4" /> Create room
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {/* Filter row */}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1 rounded-lg border border-border bg-background/50 p-1">
                            {(["all", "public", "private", "mine"] as FilterType[]).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-3 py-1 text-xs rounded-md transition capitalize cursor-pointer ${filter === f
                                        ? "bg-primary text-primary-foreground shadow"
                                        : "text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        <Select value={langFilter} onValueChange={setLangFilter}>
                            <SelectTrigger className="h-8 w-40 text-xs bg-background/50">
                                <Filter className="h-3.5 w-3.5 mr-1" />
                                <SelectValue placeholder="Language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All languages</SelectItem>
                                {usedLanguages.map((l) => (
                                    <SelectItem key={l} value={l}>{LANG_BY_ID[l]?.label ?? l}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={sort} onValueChange={(v) => setSort(v as SortType)}>
                            <SelectTrigger className="h-8 w-36 text-xs bg-background/50">
                                <SelectValue placeholder="Sort" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="recent">Recently updated</SelectItem>
                                <SelectItem value="name">Name (A→Z)</SelectItem>
                                <SelectItem value="language">Language</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="ml-auto flex items-center gap-1 rounded-lg border border-border bg-background/50 p-1">
                            <button
                                onClick={() => setView("grid")}
                                title="Grid view"
                                className={`p-1.5 rounded-md transition cursor-pointer ${view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                <LayoutGrid className="h-3.5 w-3.5" />
                            </button>
                            <button
                                onClick={() => setView("list")}
                                title="List view"
                                className={`p-1.5 rounded-md transition cursor-pointer ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                <Rows3 className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                </motion.section>

                {/* Content */}
                <section className="mt-6">
                    {loading ? (
                        <div className={view === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="animate-pulse rounded-2xl border border-border bg-card/40 p-5 h-44" />
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <EmptyState onCreate={() => setOpen(true)} hasRooms={rooms.length > 0} />
                    ) : (
                        <AnimatePresence mode="popLayout">
                            <motion.div
                                key={view}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={view === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}
                            >
                                {filtered.map((r, i) => (
                                    <RoomCard
                                        key={r.id}
                                        room={r}
                                        index={i}
                                        isOwner={r.owner_id === user?.id}
                                        view={view}
                                        onDelete={() => remove(r.id)}
                                        onCopyLink={() => copyLink(r.id)}
                                        onToggleVisibility={() => toggleVisibility(r)}
                                    />
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    )}
                </section>
            </main>
        </div>
    );
}
