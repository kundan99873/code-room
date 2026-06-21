import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { RoomMembersPanel } from "@/components/RoomMembersPanel";
import { useIsMobile } from "@/hooks/useMobile";
import { CodeRunner } from "@/components/pages/codeRunner/codeRunner";
import { FileTabs, type RoomFile } from "@/components/pages/codeRunner/fileTabs";
import { RoomHeader } from "@/components/pages/room/roomHeader";
import { RoomNotFound, PrivateRoomRequest } from "@/components/pages/room/roomStates";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { io, type Socket } from "socket.io-client";
import { fetchCurrentUser } from "@/api/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    fetchRoom,
    fetchRoomFiles,
    createRoomFile,
    updateRoomFile,
    deleteRoomFile,
    createJoinRequest,
    updateRoom,
    fetchRoomMembers,
} from "@/api/rooms";

type Room = {
    id: string;
    name: string;
    language: string;
    code: string;
    owner_id: string;
    is_public: boolean;
    updated_at: string;
};

type AccessState =
    | { kind: "loading" }
    | { kind: "ok"; room: Room }
    | { kind: "request"; status: "idle" | "sent" | "pending" | "rejected" }
    | { kind: "not-found" };

const getStableColor = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
        "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
        "#ec4899", "#14b8a6", "#f97316", "#06b6d4"
    ];
    return colors[Math.abs(hash) % colors.length];
};

export default function RoomPage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const nav = useNavigate();
    const queryClient = useQueryClient();
    const isMobile = useIsMobile();
    const [access, setAccess] = useState<AccessState>({ kind: "loading" });
    const [connected, setConnected] = useState(false);
    const [presence, setPresence] = useState(1);
    const [panelOpen, setPanelOpen] = useState(() => typeof window !== "undefined" ? window.innerWidth >= 1024 : true);
    const [filesPanelOpen, setFilesPanelOpen] = useState(() => typeof window !== "undefined" ? window.innerWidth >= 768 : true);
    const [files, setFiles] = useState<RoomFile[]>([]);
    const [activeFileId, setActiveFileId] = useState<string | null>(null);
    const skipNextRef = useRef(false);
    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);
    const socketRef = useRef<Socket | null>(null);
    const prevDecorationsRef = useRef<string[]>([]);

    const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
    const [remoteCursors, setRemoteCursors] = useState<Record<string, { userName: string; fileId: string; position: { lineNumber: number; column: number } | null }>>({});

    const filesRef = useRef<RoomFile[]>([]);
    filesRef.current = files;

    const activeFileIdRef = useRef<string | null>(null);
    activeFileIdRef.current = activeFileId;

    const activeFile = useMemo(
        () => files.find((f) => f.id === activeFileId) ?? null,
        [files, activeFileId],
    );

    const { data: members = [] } = useQuery<any[]>({
        queryKey: ["room-members", id],
        queryFn: () => fetchRoomMembers(id!),
        enabled: !!id && access.kind === "ok",
        refetchInterval: 5000,
    });

    const currentMember = members.find((m) => m.userId?._id === user?.id || m.userId?._id === user?._id);
    const userRole = currentMember?.role || null;

    const loadFiles = async () => {
        try {
            const filesData = await fetchRoomFiles(id!);
            const mappedFiles: RoomFile[] = filesData.map((f: any) => ({
                id: f._id,
                room_id: f.roomId,
                name: f.name,
                language: f.language,
                content: f.content,
                position: f.position,
                updated_at: f.updatedAt,
            }));
            setFiles(mappedFiles);
            if (mappedFiles.length > 0) {
                setActiveFileId((prev) => {
                    if (prev && mappedFiles.some((f) => f.id === prev)) return prev;
                    return mappedFiles[0].id;
                });
            } else {
                setActiveFileId(null);
            }
            return mappedFiles;
        } catch (e: any) {
            console.error("Failed to load room files:", e);
            return [];
        }
    };

    const load = async () => {
        if (!id) {
            setAccess({ kind: "not-found" });
            return;
        }

        try {
            const roomData = await fetchRoom(id);
            const room: Room = {
                id: roomData._id,
                name: roomData.name,
                language: roomData.language,
                code: roomData.code,
                owner_id: typeof roomData.ownerId === "object" ? roomData.ownerId?._id : roomData.ownerId,
                is_public: roomData.isPublic,
                updated_at: roomData.updatedAt,
            };

            setAccess({ kind: "ok", room });
            await loadFiles();
        } catch (error: any) {
            console.error("Room load error:", error);
            if (error.status === 403) {
                const requestStatus = error.error?.requestStatus || "idle";
                setAccess({
                    kind: "request",
                    status: requestStatus === "pending" ? "sent" : requestStatus,
                });
            } else if (error.status === 404) {
                setAccess({ kind: "not-found" });
            } else {
                toast.error(error.message || "Failed to load room");
                setAccess({ kind: "not-found" });
            }
        }
    };

    useEffect(() => {
        load();
    }, [id, user?.id]);

    // Socket.io connection and event handlers
    useEffect(() => {
        if ((access.kind !== "ok" && access.kind !== "request") || !user || !id) return;

        const socketUrl = import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? "http://localhost:3000" : window.location.origin);
        const socket = io(socketUrl, {
            query: {
                roomId: id,
            },
            transports: ["websocket", "polling"],
            withCredentials: true,
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            setConnected(true);
            socket.emit("join-room");
        });

        socket.on("disconnect", () => {
            setConnected(false);
        });

        socket.on("connect_error", async (err) => {
            console.error("Socket connection error:", err.message);
            if (err.message.includes("Authentication error")) {
                try {
                    await fetchCurrentUser();
                    socket.connect();
                } catch (refreshErr) {
                    toast.error("Session expired. Please log in again.");
                    nav("/auth");
                }
            }
        });

        // Listen for active users list
        socket.on("room-users", (data: { users: any[]; count: number }) => {
            setPresence(data.count);
            setOnlineUsers(data.users);

            // Cleanup remote cursors for users who left
            const activeUserIds = new Set(data.users.map((u) => u.id));
            setRemoteCursors((prev) => {
                const next = { ...prev };
                let changed = false;
                Object.keys(next).forEach((uid) => {
                    if (!activeUserIds.has(uid)) {
                        delete next[uid];
                        changed = true;
                    }
                });
                return changed ? next : prev;
            });
        });

        // Listen for real-time code changes from other users
        socket.on("code-update", (data: { fileId: string; content: string; senderId: string }) => {
            // Update the files state
            setFiles((prev) =>
                prev.map((f) => (f.id === data.fileId ? { ...f, content: data.content } : f))
            );

            // If it's the active file and Monaco is initialized, set value directly to prevent scroll jump
            if (activeFileIdRef.current === data.fileId && editorRef.current) {
                const currentValue = editorRef.current.getValue();
                if (currentValue !== data.content) {
                    skipNextRef.current = true;
                    const position = editorRef.current.getPosition();
                    editorRef.current.setValue(data.content);
                    if (position) {
                        editorRef.current.setPosition(position);
                    }
                }
            }
        });

        // Listen for remote cursors positions
        socket.on("cursor-update", (data: { userId: string; userName: string; fileId: string; position: { lineNumber: number; column: number } | null }) => {
            setRemoteCursors((prev) => ({
                ...prev,
                [data.userId]: {
                    userName: data.userName,
                    fileId: data.fileId,
                    position: data.position,
                },
            }));
        });

        // Listen for room file operations (creation, rename, deletion)
        socket.on("file-update", (data: { action: "create" | "rename" | "delete"; fileId?: string; name?: string; file?: any }) => {
            if (data.action === "create" && data.file) {
                setFiles((prev) => {
                    if (prev.some((f) => f.id === data.file.id)) return prev;
                    return [...prev, data.file];
                });
            } else if (data.action === "rename" && data.fileId && data.name) {
                setFiles((prev) =>
                    prev.map((f) => (f.id === data.fileId ? { ...f, name: data.name! } : f))
                );
            } else if (data.action === "delete" && data.fileId) {
                setFiles((prev) => {
                    const remaining = prev.filter((f) => f.id !== data.fileId);
                    if (activeFileIdRef.current === data.fileId) {
                        setActiveFileId(remaining[0]?.id ?? null);
                    }
                    return remaining;
                });
            }
        });

        socket.on("user-joined", (data: { id: string; name: string }) => {
            toast.success(`${data.name} entered the room`);
            queryClient.invalidateQueries({ queryKey: ["room-members", id] });
        });

        socket.on("user-left", (data: { id: string; name: string }) => {
            toast(`${data.name} left the room`, { icon: "👋" });
            queryClient.invalidateQueries({ queryKey: ["room-members", id] });
        });

        socket.on("new-join-request", () => {
            queryClient.invalidateQueries({ queryKey: ["room-join-requests", id] });
            toast("New join request received!", { icon: "🔔" });
        });

        socket.on("join-request-handled", (data: { roomId: string; status: "approved" | "rejected" }) => {
            if (data.roomId !== id) return;
            if (data.status === "approved") {
                toast.success("Join request approved! Entering room...");
                load();
            } else {
                toast.error("Join request rejected.");
                setAccess({ kind: "request", status: "rejected" });
            }
        });

        socket.on("error-msg", (msg: string) => {
            toast.error(msg);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
            setConnected(false);
        };
    }, [id, user, access.kind]);

    // Notify server of active file updates
    useEffect(() => {
        if (socketRef.current && activeFileId && connected) {
            socketRef.current.emit("active-file-change", activeFileId);
        }
    }, [activeFileId, connected]);

    // Create dynamic styles for remote cursors colors
    useEffect(() => {
        let styleTag = document.getElementById("remote-cursor-styles") as HTMLStyleElement;
        if (!styleTag) {
            styleTag = document.createElement("style");
            styleTag.id = "remote-cursor-styles";
            document.head.appendChild(styleTag);
        }

        const cssRules = onlineUsers
            .map((u) => {
                const color = getStableColor(u.id);
                return `
                    .remote-cursor-${u.id} {
                        position: relative;
                        border-left: 2px solid ${color} !important;
                        margin-left: -1px;
                    }
                    .remote-cursor-${u.id}::after {
                        content: "${u.name}";
                        position: absolute;
                        top: -14px;
                        left: -2px;
                        background: ${color};
                        color: #ffffff;
                        font-size: 9px;
                        font-family: system-ui, sans-serif;
                        font-weight: 600;
                        padding: 1px 4px;
                        border-radius: 3px;
                        white-space: nowrap;
                        pointer-events: none;
                        z-index: 50;
                        box-shadow: 0 1px 4px rgba(0,0,0,0.2);
                        opacity: 0.9;
                    }
                `;
            })
            .join("\n");

        styleTag.textContent = cssRules;
    }, [onlineUsers]);

    // Update Monaco editor decorations for remote cursors
    useEffect(() => {
        if (!editorRef.current || !monacoRef.current || !activeFileId) return;

        const editor = editorRef.current;
        const monaco = monacoRef.current;
        const newDecorations: any[] = [];

        Object.entries(remoteCursors).forEach(([userId, cursor]) => {
            if (cursor.fileId !== activeFileId || !cursor.position) return;

            const pos = cursor.position;
            const range = new monaco.Range(
                pos.lineNumber,
                pos.column,
                pos.lineNumber,
                pos.column
            );

            newDecorations.push({
                range,
                options: {
                    className: `remote-cursor-${userId}`,
                    hoverMessage: { value: `**${cursor.userName}**` },
                },
            });
        });

        prevDecorationsRef.current = editor.deltaDecorations(
            prevDecorationsRef.current,
            newDecorations
        );
    }, [remoteCursors, activeFileId]);

    const persist = (fileId: string, content: string) => {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(async () => {
            try {
                await updateRoomFile(id!, fileId, { content });
                setFiles((prev) =>
                    prev.map((f) =>
                        f.id === fileId
                            ? { ...f, content, updated_at: new Date().toISOString() }
                            : f
                    )
                );
            } catch (e: any) {
                console.error("Failed to auto-save file:", e);
            }
        }, 500);
    };

    const onChange = (value: string) => {
        if (!activeFile) return;
        if (skipNextRef.current) {
            skipNextRef.current = false;
            return;
        }
        setFiles((prev) =>
            prev.map((f) => (f.id === activeFile.id ? { ...f, content: value } : f))
        );

        if (socketRef.current) {
            socketRef.current.emit("code-change", {
                fileId: activeFile.id,
                content: value,
            });
        }

        persist(activeFile.id, value);
    };


    const createFile = async (name: string, language: string) => {
        if (!user) return;
        try {
            const newFileData = await createRoomFile(id!, { name, language });
            const newFile: RoomFile = {
                id: newFileData._id,
                room_id: newFileData.roomId,
                name: newFileData.name,
                language: newFileData.language,
                content: newFileData.content,
                position: newFileData.position,
                updated_at: newFileData.updatedAt,
            };
            setFiles((prev) => [...prev, newFile]);
            setActiveFileId(newFile.id);
            toast.success(`Created ${name}`);

            if (socketRef.current) {
                socketRef.current.emit("file-event", {
                    action: "create",
                    file: newFile,
                });
            }
        } catch (e: any) {
            toast.error(e.message || "Failed to create file");
        }
    };

    const renameFile = async (fileId: string, name: string) => {
        try {
            await updateRoomFile(id!, fileId, { name });
            setFiles((prev) =>
                prev.map((f) =>
                    f.id === fileId
                        ? { ...f, name, updated_at: new Date().toISOString() }
                        : f
                )
            );
            toast.success(`Renamed file to ${name}`);

            if (socketRef.current) {
                socketRef.current.emit("file-event", {
                    action: "rename",
                    fileId,
                    name,
                });
            }
        } catch (e: any) {
            toast.error(e.message || "Failed to rename file");
        }
    };

    const deleteFile = async (fileId: string) => {
        if (files.length <= 1) {
            toast.error("At least one file required");
            return;
        }
        try {
            await deleteRoomFile(id!, fileId);
            const remaining = files.filter((f) => f.id !== fileId);
            setFiles(remaining);
            if (activeFileId === fileId) setActiveFileId(remaining[0]?.id ?? null);
            toast.success("File deleted");

            if (socketRef.current) {
                socketRef.current.emit("file-event", {
                    action: "delete",
                    fileId,
                });
            }
        } catch (e: any) {
            toast.error(e.message || "Failed to delete file");
        }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Room link copied");
    };

    const sendJoinRequest = async () => {
        try {
            const result = await createJoinRequest(id!);
            toast.success(result.message || "Join request sent successfully");
            setAccess({ kind: "request", status: "sent" });
        } catch (e: any) {
            toast.error(e.message || "Failed to send join request");
        }
    };

    if (access.kind === "loading") {
        return (
            <div className="min-h-screen grid place-items-center bg-background text-muted-foreground text-sm">
                <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" /> loading room…
                </div>
            </div>
        );
    }

    if (access.kind === "not-found") {
        return <RoomNotFound onBack={() => nav("/dashboard")} />;
    }

    if (access.kind === "request") {
        return (
            <PrivateRoomRequest
                status={access.status}
                onBack={() => nav("/dashboard")}
                onRequest={sendJoinRequest}
            />
        );
    }

    const room = access.room;
    const updatedLabel = new Date(activeFile?.updated_at ?? room.updated_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
    const canEdit = userRole === "owner" || userRole === "editor" || room.owner_id === user?.id || room.owner_id === user?._id;

    return (
        <div className="h-screen overflow-hidden flex flex-col bg-background">
            <RoomHeader
                room={room}
                filesCount={files.length}
                updatedLabel={updatedLabel}
                activeFileLang={activeFile?.language}
                connected={connected}
                presence={presence}
                panelOpen={panelOpen}
                setPanelOpen={setPanelOpen}
                filesPanelOpen={filesPanelOpen}
                setFilesPanelOpen={setFilesPanelOpen}
                copyLink={copyLink}
            />

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.35, ease: "easeOut" }}
                className="flex-1 min-h-0 bg-muted/20 flex relative"
            >
                {/* Mobile overlay backdrop */}
                {isMobile && (filesPanelOpen || panelOpen) && (
                    <div
                        className="absolute inset-0 bg-background/55 backdrop-blur-xs z-10 cursor-pointer transition-opacity"
                        onClick={() => {
                            setFilesPanelOpen(false);
                            setPanelOpen(false);
                        }}
                    />
                )}

                {filesPanelOpen && (
                    <div className={`shrink-0 animate-in slide-in-from-left duration-200 h-full border-r border-border ${
                        isMobile ? "absolute inset-y-0 left-0 z-20 shadow-2xl bg-card" : "relative"
                    }`}>
                        <FileTabs
                            files={files}
                            activeId={activeFileId}
                            onSelect={(id) => {
                                setActiveFileId(id);
                                if (isMobile) {
                                    setFilesPanelOpen(false);
                                }
                            }}
                            onCreate={createFile}
                            onRename={renameFile}
                            onDelete={deleteFile}
                            canEdit={canEdit}
                        />
                    </div>
                )}
                <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex-1 min-h-0">
                        {activeFile ? (
                            <CodeRunner
                                key={activeFile.id}
                                value={activeFile.content}
                                language={activeFile.language}
                                onChange={onChange}
                                readOnly={!canEdit}
                                onEditorMount={(editor: any, monaco: any) => {
                                    editorRef.current = editor;
                                    monacoRef.current = monaco;

                                    // Listen to local cursor position changes and emit
                                    editor.onDidChangeCursorPosition((e: any) => {
                                        if (socketRef.current && activeFileId) {
                                            socketRef.current.emit("cursor-move", {
                                                fileId: activeFileId,
                                                position: {
                                                    lineNumber: e.position.lineNumber,
                                                    column: e.position.column,
                                                },
                                            });
                                        }
                                    });

                                    // Listen to local cursor blur
                                    editor.onDidBlurEditorText(() => {
                                        if (socketRef.current && activeFileId) {
                                            socketRef.current.emit("cursor-move", {
                                                fileId: activeFileId,
                                                position: null,
                                            });
                                        }
                                    });
                                }}
                                heightClass="h-full"
                                allFiles={files}
                                activeFileName={activeFile.name}
                            />
                        ) : (
                            <div className="h-full grid place-items-center text-sm text-muted-foreground">
                                No files yet. {canEdit ? "Create one above." : "Wait for a member to add a file."}
                            </div>
                        )}
                    </div>
                </div>
                {panelOpen && (
                    <div className={`shrink-0 animate-in slide-in-from-right duration-200 h-full w-72 lg:w-80 border-l border-border bg-card ${
                        isMobile ? "absolute inset-y-0 right-0 z-20 shadow-2xl bg-card" : "relative"
                    }`}>
                        <RoomMembersPanel
                            roomId={room.id}
                            isOwner={room.owner_id === user?.id || room.owner_id === user?._id}
                            isPublic={room.is_public}
                            onlineUserIds={onlineUsers.map((u) => u.id)}
                            onVisibilityChange={async (next: boolean) => {
                                try {
                                    await updateRoom(room.id, { isPublic: next });
                                    setAccess((prev) =>
                                        prev.kind === "ok"
                                            ? { ...prev, room: { ...prev.room, is_public: next } }
                                            : prev
                                    );
                                    toast.success(`Room is now ${next ? "public" : "private"}`);
                                } catch (e: any) {
                                    toast.error(e.message || "Failed to update room visibility");
                                }
                            }}
                        />
                    </div>
                )}
            </motion.div>
        </div>
    );
}
