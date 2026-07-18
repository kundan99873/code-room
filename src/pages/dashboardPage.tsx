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
    Building2, Users, UserPlus, Trash2, ArrowLeft, LogOut, Info,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { StatCard } from "@/components/pages/dashboard/statCard";
import { RoomCard } from "@/components/pages/dashboard/roomCard";
import { EmptyState } from "@/components/pages/dashboard/emptyState";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createRoom, fetchUserRooms, updateRoom, deleteRoom } from "@/api/rooms";
import {
    fetchUserTeams,
    fetchTeamDetails,
    createTeamRequest,
    addTeamMemberRequest,
    removeTeamMemberRequest,
    deleteTeamRequest,
} from "@/api/teams";
import type { Team } from "@/api/teams";

import { Skeleton } from "@/components/ui/skeleton";

type Room = {
    id: string;
    name: string;
    language: string;
    owner_id: string;
    is_public: boolean;
    updated_at: string;
    created_at: string;
    db_id: string;
};

type FilterType = "all" | "public" | "private" | "mine";
type SortType = "recent" | "name" | "language";

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Tab view state
    const [activeTab, setActiveTab] = useState<"rooms" | "teams">("rooms");

    // Room Dialog state
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [language, setLanguage] = useState("javascript");
    const [isPublic, setIsPublic] = useState<"public" | "private">("public");
    const [roomTeamId, setRoomTeamId] = useState<string>("none");

    // Team state & dialogs
    const [newTeamOpen, setNewTeamOpen] = useState(false);
    const [newTeamName, setNewTeamName] = useState("");
    const [newTeamDesc, setNewTeamDesc] = useState("");
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
    const [inviteEmail, setInviteEmail] = useState("");

    // Shared filters
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

    // Fetch user teams
    const { data: teams = [], isLoading: loadingTeams } = useQuery<Team[]>({
        queryKey: ["teams"],
        queryFn: fetchUserTeams,
        refetchOnWindowFocus: true,
    });

    // Fetch team details if one is selected
    const { data: teamDetails, isLoading: loadingTeamDetails } = useQuery({
        queryKey: ["teamDetails", selectedTeamId],
        queryFn: () => selectedTeamId ? fetchTeamDetails(selectedTeamId) : null,
        enabled: !!selectedTeamId,
    });

    // Map backend response rooms to frontend expected format
    const rooms = useMemo(() => {
        return rawRooms.map((r: any) => ({
            id: r.customId || r._id,
            name: r.name,
            language: r.language,
            owner_id: typeof r.ownerId === "object" ? r.ownerId?._id : r.ownerId,
            is_public: r.isPublic,
            updated_at: r.updatedAt,
            created_at: r.createdAt,
            db_id: r._id,
        }));
    }, [rawRooms]);

    // Map team details rooms to standard frontend format
    const teamRooms = useMemo(() => {
        if (!teamDetails?.rooms) return [];
        return teamDetails.rooms.map((r: any) => ({
            id: r.customId || r._id,
            name: r.name,
            language: r.language,
            owner_id: typeof r.ownerId === "object" ? r.ownerId?._id : r.ownerId,
            is_public: r.isPublic,
            updated_at: r.updatedAt,
            created_at: r.createdAt,
            db_id: r._id,
        }));
    }, [teamDetails?.rooms]);

    // Create room mutation
    const createMutation = useMutation({
        mutationFn: createRoom,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["rooms"] });
            if (selectedTeamId) {
                queryClient.invalidateQueries({ queryKey: ["teamDetails", selectedTeamId] });
            }
            toast.success(`Created room "${data.name}"`);
            navigate(`/room/${data.customId || data._id}`);
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
            if (selectedTeamId) {
                queryClient.invalidateQueries({ queryKey: ["teamDetails", selectedTeamId] });
            }
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
            if (selectedTeamId) {
                queryClient.invalidateQueries({ queryKey: ["teamDetails", selectedTeamId] });
            }
            toast.success("Room visibility updated");
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to update room");
        },
    });

    // Team Mutations
    const createTeamMutation = useMutation({
        mutationFn: createTeamRequest,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["teams"] });
            toast.success(`Created team "${data.name}"`);
            setSelectedTeamId(data.id);
            setNewTeamOpen(false);
            setNewTeamName("");
            setNewTeamDesc("");
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to create team");
        },
    });

    const addTeamMemberMutation = useMutation({
        mutationFn: ({ teamId, email }: { teamId: string; email: string }) => addTeamMemberRequest(teamId, email),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["teamDetails", selectedTeamId] });
            toast.success("Member added to team");
            setInviteEmail("");
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to add team member");
        },
    });

    const removeTeamMemberMutation = useMutation({
        mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) => removeTeamMemberRequest(teamId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["teamDetails", selectedTeamId] });
            toast.success("Member removed from team");
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to remove member");
        },
    });

    const deleteTeamMutation = useMutation({
        mutationFn: deleteTeamRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["teams"] });
            setSelectedTeamId(null);
            toast.success("Team deleted");
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to delete team");
        },
    });

    const create = async () => {
        if (!name.trim()) return toast.error("Room name is required");
        createMutation.mutate({
            name: name.trim(),
            language,
            isPublic: isPublic === "public",
            teamId: roomTeamId !== "none" ? roomTeamId : undefined,
        });
        setOpen(false);
        setName("");
        setRoomTeamId("none");
    };

    const handleCreateTeam = async () => {
        if (!newTeamName.trim()) return toast.error("Team name is required");
        createTeamMutation.mutate({
            name: newTeamName.trim(),
            description: newTeamDesc.trim() || undefined,
        });
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
        if (sort === "recent") {
            list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
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
            {/* Custom animations for premium UI */}

            {/* Ambient background */}
            <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
                <motion.div
                    animate={{
                        x: [0, 40, -20, 0],
                        y: [0, -30, 20, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/25 blur-3xl opacity-80"
                />
                <motion.div
                    animate={{
                        x: [0, -50, 30, 0],
                        y: [0, 40, -30, 0],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/15 blur-3xl opacity-70"
                />
                <motion.div
                    animate={{
                        x: [0, 30, -40, 0],
                        y: [0, 20, 40, 0],
                    }}
                    transition={{
                        duration: 22,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-cyan-400/15 blur-3xl opacity-60"
                />
                <div
                    className="absolute inset-0 opacity-[0.035]"
                    style={{
                        backgroundImage:
                            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
                        backgroundSize: "40px 40px",
                    }}
                />
            </div>

            <main className="mx-auto max-w-7xl px-4 py-8 md:py-12">
                {/* Header */}
                <motion.section
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div className="min-w-0">
                            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/45 backdrop-blur px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm transition hover:border-muted-foreground/30">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                </span>
                                Collaborative spaces
                            </div>
                            <h1 className="mt-4 font-display text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
                                <span className="bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent bg-[length:200%_auto] hover:animate-[gradient-shift_3s_ease_infinite]">
                                    {selectedTeamId && teamDetails ? teamDetails.team.name : activeTab === "rooms" ? "Your Rooms" : "Teams & Organizations"}
                                </span>
                            </h1>
                            <p className="text-muted-foreground text-sm md:text-base mt-3 max-w-2xl leading-relaxed">
                                {selectedTeamId && teamDetails
                                    ? teamDetails.team.description || "A workspace shared among all team members."
                                    : activeTab === "rooms"
                                        ? "Spin up an interactive development room, invite team members in real-time, share terminal outputs, and build products together."
                                        : "Organize rooms into collaborative teams and shared spaces. All organization members gain access instantly."}
                            </p>
                        </div>
                    </div>
                </motion.section>

                {/* Tab Switcher */}
                {!selectedTeamId && (
                    <div className="flex items-center gap-1 rounded-2xl border border-border/80 bg-card/40 backdrop-blur-xl p-1.5 w-fit mb-8 shadow-inner">
                        <button
                            onClick={() => setActiveTab("rooms")}
                            className={`relative px-5 py-2 text-sm rounded-xl font-medium transition cursor-pointer flex items-center gap-1.5 z-10 select-none ${activeTab === "rooms"
                                    ? "text-primary-foreground font-semibold"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {activeTab === "rooms" && (
                                <motion.div
                                    layoutId="activeTabIndicator"
                                    className="absolute inset-0 bg-primary rounded-xl -z-10 shadow-lg shadow-primary/20"
                                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                />
                            )}
                            <LayoutGrid className="h-4 w-4" />
                            Rooms
                        </button>
                        <button
                            onClick={() => setActiveTab("teams")}
                            className={`relative px-5 py-2 text-sm rounded-xl font-medium transition cursor-pointer flex items-center gap-1.5 z-10 select-none ${activeTab === "teams"
                                    ? "text-primary-foreground font-semibold"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {activeTab === "teams" && (
                                <motion.div
                                    layoutId="activeTabIndicator"
                                    className="absolute inset-0 bg-primary rounded-xl -z-10 shadow-lg shadow-primary/20"
                                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                />
                            )}
                            <Building2 className="h-4 w-4" />
                            Teams
                        </button>
                    </div>
                )}

                {/* --- ROOMS TAB --- */}
                {activeTab === "rooms" && !selectedTeamId && (
                    <>
                        {/* Stats */}
                        <motion.section
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.05 }}
                            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                        >
                            <StatCard icon={<Hash className="h-5 w-5" />} label="Total Rooms" value={stats.total} tint="from-indigo-500/25 to-indigo-500/0" />
                            <StatCard icon={<Activity className="h-5 w-5" />} label="Active (24h)" value={stats.recent} tint="from-emerald-500/25 to-emerald-500/0" />
                            <StatCard icon={<Globe2 className="h-5 w-5" />} label="Shared" value={stats.shared} tint="from-cyan-500/25 to-cyan-500/0" />
                            <StatCard icon={<Sparkles className="h-5 w-5" />} label="Owned" value={stats.mine} tint="from-fuchsia-500/25 to-fuchsia-500/0" />
                        </motion.section>

                        {/* Action bar */}
                        <motion.section
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="rounded-2xl border border-border/80 bg-card/35 backdrop-blur-2xl p-4 shadow-lg mb-6"
                        >
                            <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                                {/* Search & Join Container */}
                                <div className="flex flex-col md:flex-row gap-3 flex-1 min-w-0">
                                    {/* Search */}
                                    <div className="relative flex-1 min-w-0 group">
                                        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            placeholder="Search rooms by name or language…"
                                            className="pl-10 h-12 bg-background/40 border-border/60 focus-visible:bg-background/80 focus-visible:ring-primary/30 transition-all text-sm rounded-xl"
                                        />
                                    </div>

                                    {/* Join Room */}
                                    <div className="flex items-center gap-2 md:w-80 lg:w-96 group">
                                        <div className="relative flex-1 min-w-0">
                                            <Link2 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            <Input
                                                placeholder="Paste room ID…"
                                                value={joinId}
                                                onChange={(e) => setJoinId(e.target.value)}
                                                className="pl-10 h-12 bg-background/40 border-border/60 focus-visible:bg-background/80 focus-visible:ring-primary/30 transition-all text-sm rounded-xl"
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" && joinId.trim()) {
                                                        navigate("/room/" + joinId.trim());
                                                    }
                                                }}
                                            />
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="h-12 px-4 cursor-pointer hover:bg-muted/80 rounded-xl font-medium border-border/60 hover:border-muted-foreground/30 active:scale-95 transition-all flex items-center gap-1.5"
                                            onClick={() => joinId.trim() && navigate("/room/" + joinId.trim())}
                                        >
                                            Join <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Create Button */}
                                <div className="w-full lg:w-auto">
                                    <Button
                                        onClick={() => {
                                            setRoomTeamId("none");
                                            setOpen(true);
                                        }}
                                        className="h-12 w-full lg:w-auto px-6 font-semibold gap-2 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white border-0 shadow-[0_8px_30px_-8px_rgba(99,102,241,0.5)] hover:shadow-[0_12px_40px_-8px_rgba(99,102,241,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer rounded-xl glow-btn gradient-bg-animate"
                                    >
                                        <Plus className="h-5 w-5" /> New Room
                                    </Button>
                                </div>
                            </div>

                            {/* Filter row */}
                            <div className="mt-4 pt-4 border-t border-border/30 flex flex-wrap items-center gap-3">
                                {/* Filter Toggle Pills */}
                                <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-background/35 p-1">
                                    {(["all", "public", "private", "mine"] as FilterType[]).map((f) => (
                                        <button
                                            key={f}
                                            onClick={() => setFilter(f)}
                                            className={`relative px-4 py-1.5 text-xs font-semibold rounded-lg transition capitalize cursor-pointer select-none ${filter === f
                                                    ? "text-primary-foreground font-bold"
                                                    : "text-muted-foreground hover:text-foreground"
                                                }`}
                                        >
                                            {filter === f && (
                                                <motion.div
                                                    layoutId="activeFilterIndicator"
                                                    className="absolute inset-0 bg-primary rounded-lg -z-10 shadow-sm"
                                                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                                />
                                            )}
                                            {f}
                                        </button>
                                    ))}
                                </div>

                                {/* Language Filter Dropdown */}
                                <Select value={langFilter} onValueChange={setLangFilter}>
                                    <SelectTrigger className="h-9 w-40 text-xs bg-background/35 border-border/60 rounded-xl hover:bg-background/60 transition-colors">
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <Filter className="h-3.5 w-3.5" />
                                            <SelectValue placeholder="Language" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="bg-card/95 backdrop-blur-xl border border-border/80">
                                        <SelectItem value="all">All languages</SelectItem>
                                        {usedLanguages.map((l) => (
                                            <SelectItem key={l} value={l}>{LANG_BY_ID[l]?.label ?? l}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Sort Dropdown */}
                                <Select value={sort} onValueChange={(v) => setSort(v as SortType)}>
                                    <SelectTrigger className="h-9 w-40 text-xs bg-background/35 border-border/60 rounded-xl hover:bg-background/60 transition-colors">
                                        <span className="text-muted-foreground">Sort: </span>
                                        <SelectValue placeholder="Sort" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card/95 backdrop-blur-xl border border-border/80">
                                        <SelectItem value="recent">Recently updated</SelectItem>
                                        <SelectItem value="name">Name (A→Z)</SelectItem>
                                        <SelectItem value="language">Language</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Grid/List switcher */}
                                <div className="ml-auto flex items-center gap-1 rounded-xl border border-border/60 bg-background/35 p-1">
                                    <button
                                        onClick={() => setView("grid")}
                                        title="Grid view"
                                        className={`relative p-2 rounded-lg transition-all cursor-pointer ${view === "grid"
                                                ? "bg-primary text-primary-foreground shadow animate-in fade-in"
                                                : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                                            }`}
                                    >
                                        <LayoutGrid className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => setView("list")}
                                        title="List view"
                                        className={`relative p-2 rounded-lg transition-all cursor-pointer ${view === "list"
                                                ? "bg-primary text-primary-foreground shadow animate-in fade-in"
                                                : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                                            }`}
                                    >
                                        <Rows3 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.section>

                        {/* Rooms Content */}
                        <section className="mt-6">
                            {loading ? (
                                <div className={view === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <Skeleton key={i} className="border border-border bg-card/40 p-5 h-44 rounded-2xl" />
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
                    </>
                )}

                {/* --- TEAMS TAB LIST VIEW --- */}
                {activeTab === "teams" && !selectedTeamId && (
                    <motion.section
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Your Teams</h2>
                            <Dialog open={newTeamOpen} onOpenChange={setNewTeamOpen}>
                                <DialogTrigger asChild>
                                    <Button className="gap-1.5 cursor-pointer bg-gradient-to-r from-indigo-500 to-violet-500 text-white border-0 shadow hover:scale-[1.01] transition">
                                        <Plus className="h-4 w-4" /> Create Team
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[420px] border border-border bg-card/95 backdrop-blur shadow-2xl p-6 rounded-2xl">
                                    <DialogHeader>
                                        <DialogTitle className="text-lg font-bold flex items-center gap-2">
                                            <Building2 className="h-5 w-5 text-indigo-400" /> Create new team
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 mt-2">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold">Team Name</Label>
                                            <Input
                                                value={newTeamName}
                                                onChange={(e) => setNewTeamName(e.target.value)}
                                                placeholder="e.g. CS 101 Class, Web dev squad"
                                                className="bg-background/50 border-border"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold">Description (Optional)</Label>
                                            <Input
                                                value={newTeamDesc}
                                                onChange={(e) => setNewTeamDesc(e.target.value)}
                                                placeholder="Brief description about the team workspace"
                                                className="bg-background/50 border-border"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter className="mt-6">
                                        <Button
                                            onClick={handleCreateTeam}
                                            disabled={createTeamMutation.isPending}
                                            className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white cursor-pointer"
                                        >
                                            Create Team
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {loadingTeams ? (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} className="border border-border bg-card/40 p-5 h-36 rounded-2xl" />
                                ))}
                            </div>
                        ) : teams.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border bg-card/20 max-w-lg mx-auto mt-6">
                                <Building2 className="h-10 w-10 text-muted-foreground/30 mb-3 animate-pulse" />
                                <h3 className="font-semibold text-sm">No teams found</h3>
                                <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
                                    Create a team to easily group pair-programming rooms, university classes, or work projects.
                                </p>
                                <Button
                                    variant="outline"
                                    className="mt-4 gap-1.5 cursor-pointer text-xs h-9"
                                    onClick={() => setNewTeamOpen(true)}
                                >
                                    <Plus className="h-3.5 w-3.5" /> Start a Team
                                </Button>
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {teams.map((team) => (
                                    <motion.div
                                        key={team.id}
                                        whileHover={{ y: -2 }}
                                        onClick={() => setSelectedTeamId(team.id)}
                                        className="p-5 rounded-2xl border border-border/80 bg-card/50 hover:bg-card/85 transition cursor-pointer flex flex-col justify-between h-36 group relative overflow-hidden"
                                    >
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition">
                                                    <Building2 className="h-4 w-4" />
                                                </div>
                                                <h3 className="font-semibold text-sm truncate">{team.name}</h3>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                                                {team.description || "No description provided."}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-4 pt-2 border-t border-border/30">
                                            <span>Created by {team.ownerId?.name || "Unknown"}</span>
                                            <span className="flex items-center gap-1 text-indigo-400 font-medium">
                                                Workspace <ArrowRight className="h-3 w-3" />
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.section>
                )}

                {/* --- DETAILED TEAM WORKSPACE VIEW --- */}
                {selectedTeamId && (
                    <motion.section
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <button
                            onClick={() => setSelectedTeamId(null)}
                            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition cursor-pointer mb-2 bg-background border border-border rounded-lg px-3 py-1.5 shadow-sm"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" /> Back to Teams
                        </button>

                        {loadingTeamDetails || !teamDetails ? (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Skeleton className="h-7 w-48" />
                                    <Skeleton className="h-4 w-96" />
                                </div>
                                <div className="grid lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 space-y-4">
                                        <Skeleton className="h-10 w-full" />
                                        <Skeleton className="h-48 w-full" />
                                    </div>
                                    <div className="space-y-4">
                                        <Skeleton className="h-10 w-full" />
                                        <Skeleton className="h-48 w-full" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid lg:grid-cols-3 gap-6">
                                {/* Left/Main side: Rooms list in Team */}
                                <div className="lg:col-span-2 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                            <Hash className="h-4 w-4 text-indigo-400" /> Team Rooms ({teamRooms.length})
                                        </h3>
                                        <Button
                                            onClick={() => {
                                                setRoomTeamId(teamDetails.team.id);
                                                setOpen(true);
                                            }}
                                            className="h-9 gap-1 text-xs cursor-pointer bg-indigo-500 hover:bg-indigo-600"
                                        >
                                            <Plus className="h-3.5 w-3.5" /> Create Room
                                        </Button>
                                    </div>

                                    {teamRooms.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border bg-card/10">
                                            <Sparkles className="h-8 w-8 text-indigo-400/20 mb-2" />
                                            <h4 className="font-medium text-xs">No rooms inside this team</h4>
                                            <p className="text-[11px] text-muted-foreground mt-1 max-w-xs leading-relaxed">
                                                Create a collaborative room here so all team members can join automatically.
                                            </p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mt-3 cursor-pointer text-xs"
                                                onClick={() => {
                                                    setRoomTeamId(teamDetails.team.id);
                                                    setOpen(true);
                                                }}
                                            >
                                                Create Team Room
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            {teamRooms.map((r, i) => (
                                                <RoomCard
                                                    key={r.id}
                                                    room={r}
                                                    index={i}
                                                    isOwner={r.owner_id === user?.id}
                                                    view="grid"
                                                    onDelete={() => remove(r.id)}
                                                    onCopyLink={() => copyLink(r.id)}
                                                    onToggleVisibility={() => toggleVisibility(r)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Right sidebar: Team Members / Settings */}
                                <div className="space-y-6">
                                    {/* Members Section */}
                                    <div className="p-5 rounded-2xl border border-border bg-card/50 flex flex-col gap-4 shadow-sm">
                                        <h3 className="text-sm font-semibold flex items-center gap-2">
                                            <Users className="h-4 w-4 text-indigo-400" /> Members ({teamDetails.members.length})
                                        </h3>

                                        {/* Add member (owner only) */}
                                        {teamDetails.role === "owner" && (
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="Invite by email..."
                                                    value={inviteEmail}
                                                    onChange={(e) => setInviteEmail(e.target.value)}
                                                    className="h-9 bg-background/50 border-border text-xs focus-visible:ring-primary/30"
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter" && inviteEmail.trim()) {
                                                            addTeamMemberMutation.mutate({
                                                                teamId: teamDetails.team.id,
                                                                email: inviteEmail.trim(),
                                                            });
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        if (inviteEmail.trim()) {
                                                            addTeamMemberMutation.mutate({
                                                                teamId: teamDetails.team.id,
                                                                email: inviteEmail.trim(),
                                                            });
                                                        }
                                                    }}
                                                    className="h-9 w-9 bg-indigo-500 hover:bg-indigo-600 cursor-pointer"
                                                >
                                                    <UserPlus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}

                                        {/* Member list */}
                                        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                                            {teamDetails.members.map((member) => (
                                                <div key={member.userId._id} className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-background/30 transition">
                                                    <div className="min-w-0">
                                                        <p className="font-medium truncate">{member.userId.name}</p>
                                                        <p className="text-[10px] text-muted-foreground truncate">{member.userId.email}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0 ml-2">
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize font-medium ${member.role === "owner"
                                                                ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                                                                : "bg-muted text-muted-foreground"
                                                            }`}>
                                                            {member.role}
                                                        </span>
                                                        {teamDetails.role === "owner" && member.role !== "owner" && (
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm(`Remove ${member.userId.name} from team?`)) {
                                                                        removeTeamMemberMutation.mutate({
                                                                            teamId: teamDetails.team.id,
                                                                            userId: member.userId._id,
                                                                        });
                                                                    }
                                                                }}
                                                                className="p-1 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 rounded transition cursor-pointer"
                                                                title="Kick member"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Actions & Danger Zone */}
                                    <div className="p-5 rounded-2xl border border-border bg-card/50 flex flex-col gap-4 shadow-sm">
                                        <h3 className="text-sm font-semibold flex items-center gap-2">
                                            <Info className="h-4 w-4 text-indigo-400" /> Actions
                                        </h3>
                                        {teamDetails.role === "owner" ? (
                                            <Button
                                                variant="destructive"
                                                onClick={() => {
                                                    if (confirm("Are you sure you want to delete this team? All rooms will be decoupled and team access will be lost.")) {
                                                        deleteTeamMutation.mutate(teamDetails.team.id);
                                                    }
                                                }}
                                                className="w-full text-xs h-9 cursor-pointer gap-1.5"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" /> Delete Team
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    if (confirm("Are you sure you want to leave this team? You will lose access to team rooms.")) {
                                                        removeTeamMemberMutation.mutate({
                                                            teamId: teamDetails.team.id,
                                                            userId: user?.id || user?._id || "",
                                                        });
                                                        setSelectedTeamId(null);
                                                    }
                                                }}
                                                className="w-full text-xs h-9 cursor-pointer gap-1.5 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20"
                                            >
                                                <LogOut className="h-3.5 w-3.5" /> Leave Team
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.section>
                )}
            </main>

            {/* Create Room Dialog (Shared globally by Personal and Team view) */}
            <Dialog open={open} onOpenChange={setOpen}>
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
                                        <SelectItem value="public">Public — anyone with link</SelectItem>
                                        <SelectItem value="private">Private — only you</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {/* Team Selection */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-foreground/80 tracking-wide">Team Space (Optional)</Label>
                            <Select value={roomTeamId} onValueChange={setRoomTeamId}>
                                <SelectTrigger className="w-full h-10 bg-background/50 border-border">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Team (Personal Room)</SelectItem>
                                    {teams.map((t) => (
                                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
    );
}
