import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import {
    fetchRoomMembers,
    addRoomMember,
    removeRoomMember,
    updateRoomMemberRole,
    fetchJoinRequests,
    handleJoinRequest,
} from "@/api/rooms";
import {
    Users, Plus, Trash2, Shield, ShieldCheck, Check, X, LogOut, Loader2, Mail, Edit3, Eye
} from "lucide-react";

export function RoomMembersPanel({
    roomId,
    isOwner,
    isPublic,
    onVisibilityChange,
    onlineUserIds = [],
}: {
    roomId: string;
    isOwner: boolean;
    isPublic: boolean;
    onVisibilityChange: (isPublic: boolean) => void;
    onlineUserIds?: string[];
}) {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviting, setInviting] = useState(false);

    // Query room members
    const { data: members = [], isLoading: loadingMembers } = useQuery<any[]>({
        queryKey: ["room-members", roomId],
        queryFn: () => fetchRoomMembers(roomId),
        refetchInterval: 5000, // poll every 5s for collaborative feel
    });

    const currentMember = members.find((m) => m.userId?._id === user?.id || m.userId?._id === user?._id);
    const isAdminOrOwner = currentMember?.role === "owner" || currentMember?.role === "admin";

    // Query pending join requests
    const { data: joinRequests = [], isLoading: loadingRequests } = useQuery<any[]>({
        queryKey: ["room-join-requests", roomId],
        queryFn: () => fetchJoinRequests(roomId),
        enabled: !!roomId && isAdminOrOwner,
        refetchInterval: 5000, // poll requests too
    });

    // Mutations
    const inviteMutation = useMutation({
        mutationFn: (email: string) => addRoomMember(roomId, email),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["room-members", roomId] });
            toast.success("Member added successfully!");
            setInviteEmail("");
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to add member");
        },
        onSettled: () => setInviting(false),
    });

    const removeMutation = useMutation({
        mutationFn: (userId: string) => removeRoomMember(roomId, userId),
        onSuccess: (_, userId) => {
            queryClient.invalidateQueries({ queryKey: ["room-members", roomId] });
            if (userId === user?.id) {
                toast.success("You have left the room");
                window.location.href = "/dashboard";
            } else {
                toast.success("Member removed successfully");
            }
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to remove member");
        },
    });

    const updateRoleMutation = useMutation({
        mutationFn: ({ userId, role }: { userId: string; role: "admin" | "editor" | "viewer" }) =>
            updateRoomMemberRole(roomId, userId, role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["room-members", roomId] });
            toast.success("Role updated successfully");
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to update role");
        },
    });

    const joinRequestMutation = useMutation({
        mutationFn: ({ requestId, status }: { requestId: string; status: "approved" | "rejected" }) =>
            handleJoinRequest(roomId, requestId, status),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["room-join-requests", roomId] });
            queryClient.invalidateQueries({ queryKey: ["room-members", roomId] });
            toast.success(`Request ${variables.status} successfully`);
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to handle request");
        },
    });

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();
        const email = inviteEmail.trim();
        if (!email) return toast.error("Please enter an email");
        setInviting(true);
        inviteMutation.mutate(email);
    };

    const handleLeave = () => {
        if (confirm("Are you sure you want to leave this room?")) {
            removeMutation.mutate(user!.id);
        }
    };

    return (
        <div className="h-full border-l border-border bg-card p-4 flex flex-col gap-4 overflow-y-auto scrollbar-thin">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-border">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" /> Members & Access
                </h3>
            </div>

            {/* Invite input (Owner/Admin only) */}
            {isAdminOrOwner && (
                <form onSubmit={handleInvite} className="flex flex-col gap-2">
                    <label className="text-[11px] font-medium text-muted-foreground">Add to room</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="teammate@email.com"
                                type="email"
                                className="pl-8 h-9 text-xs"
                            />
                        </div>
                        <Button type="submit" size="sm" className="h-9 px-3 cursor-pointer" disabled={inviting}>
                            {inviting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-4 w-4" />}
                        </Button>
                    </div>
                </form>
            )}

            {/* Members List */}
            <div className="flex-1 flex flex-col gap-3 min-h-[150px]">
                <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-muted-foreground">Active Members ({members.length})</span>
                    {loadingMembers && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                </div>

                <div className="flex flex-col gap-2">
                    {members.map((m) => {
                        const isSelf = m.userId?._id === user?.id;
                        return (
                            <div
                                key={m._id}
                                className="flex items-center justify-between p-2 rounded-lg border border-border/40 bg-muted/20 hover:bg-muted/40 transition"
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="relative shrink-0">
                                        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 border border-primary/20 flex items-center justify-center">
                                            <span className="text-[10px] font-semibold text-primary uppercase">
                                                {m.userId?.name?.charAt(0) || "U"}
                                            </span>
                                        </div>
                                        {onlineUserIds.includes(m.userId?._id) && (
                                            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 border border-card animate-pulse" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium truncate flex items-center gap-1">
                                            {m.userId?.name || "User"}
                                            {isSelf && <span className="text-[10px] text-muted-foreground">(You)</span>}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground truncate">{m.userId?.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                    {/* Role Badge / Actions */}
                                    {isOwner && !isSelf && m.role !== "owner" ? (
                                        <select
                                            value={m.role}
                                            onChange={(e) =>
                                                updateRoleMutation.mutate({
                                                    userId: m.userId._id,
                                                    role: e.target.value as "admin" | "editor" | "viewer",
                                                })
                                            }
                                            className="text-[10px] bg-background border border-border rounded px-1 py-0.5 text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
                                        >
                                            <option value="viewer">Viewer</option>
                                            <option value="editor">Editor</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    ) : (
                                        <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-background border border-border flex items-center gap-1 capitalize">
                                            {m.role === "owner" ? (
                                                <ShieldCheck className="h-3 w-3 text-amber-500" />
                                            ) : m.role === "admin" ? (
                                                <Shield className="h-3 w-3 text-indigo-400" />
                                            ) : m.role === "editor" ? (
                                                <Edit3 className="h-3.5 w-3.5 text-emerald-400" />
                                            ) : m.role === "viewer" ? (
                                                <Eye className="h-3.5 w-3.5 text-blue-400" />
                                            ) : null}
                                            {m.role}
                                        </span>
                                    )}

                                    {/* Kick Member (Owner only) */}
                                    {isOwner && !isSelf && m.role !== "owner" && (
                                        <button
                                            onClick={() => {
                                                if (confirm(`Remove ${m.userId.name} from the room?`)) {
                                                    removeMutation.mutate(m.userId._id);
                                                }
                                            }}
                                            className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition cursor-pointer"
                                            title="Remove member"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Pending Requests Section (Owner/Admin only) */}
            {isAdminOrOwner && joinRequests.length > 0 && (
                <div className="border-t border-border pt-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-amber-500 font-semibold">
                            Pending Requests ({joinRequests.length})
                        </span>
                        {loadingRequests && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                    </div>

                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                        {joinRequests.map((req) => (
                            <div
                                key={req._id}
                                className="flex items-center justify-between p-2 rounded-lg border border-amber-500/20 bg-amber-500/5 transition animate-pulse-subtle"
                            >
                                <div className="min-w-0">
                                    <p className="text-xs font-medium truncate">{req.userId?.name || "Requesting User"}</p>
                                    <p className="text-[10px] text-muted-foreground truncate">{req.userId?.email}</p>
                                </div>
                                <div className="flex gap-1 shrink-0 ml-2">
                                    <button
                                        onClick={() =>
                                            joinRequestMutation.mutate({ requestId: req._id, status: "approved" })
                                        }
                                        className="p-1 rounded bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white transition cursor-pointer"
                                        title="Approve"
                                    >
                                        <Check className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={() =>
                                            joinRequestMutation.mutate({ requestId: req._id, status: "rejected" })
                                        }
                                        className="p-1 rounded bg-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition cursor-pointer"
                                        title="Reject"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Bottom Actions (Visibility Settings & Leave Room) */}
            <div className="border-t border-border pt-4 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Visibility</span>
                    {isOwner ? (
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px] cursor-pointer"
                            onClick={() => onVisibilityChange(!isPublic)}
                        >
                            {isPublic ? "Make Private" : "Make Public"}
                        </Button>
                    ) : (
                        <span className="text-[11px] font-medium capitalize text-foreground/80">
                            {isPublic ? "Public" : "Private"}
                        </span>
                    )}
                </div>

                {/* Leave Room (All members except owners) */}
                {currentMember && currentMember.role !== "owner" && (
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleLeave}
                        className="w-full gap-1.5 h-8 text-[11px] mt-2 cursor-pointer"
                    >
                        <LogOut className="h-3.5 w-3.5" /> Leave Room
                    </Button>
                )}
            </div>
        </div>
    );
}
