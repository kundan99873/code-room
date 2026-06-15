import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import type { OnMount } from "@monaco-editor/react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { RoomMembersPanel } from "@/components/RoomMembersPanel";
import { CodeRunner } from "@/components/pages/codeRunner/codeRunner";
import { FileTabs, type RoomFile } from "@/components/pages/codeRunner/fileTabs";
import { RoomHeader } from "@/components/pages/room/roomHeader";
import { RoomNotFound, PrivateRoomRequest } from "@/components/pages/room/roomStates";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import {
    fetchRoom,
    fetchRoomFiles,
    createRoomFile,
    updateRoomFile,
    deleteRoomFile,
    createJoinRequest,
    updateRoom,
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

export default function RoomPage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const nav = useNavigate();
    const [access, setAccess] = useState<AccessState>({ kind: "loading" });
    const [connected, setConnected] = useState(false);
    const [presence, setPresence] = useState(1);
    const [panelOpen, setPanelOpen] = useState(true);
    const [files, setFiles] = useState<RoomFile[]>([]);
    const [activeFileId, setActiveFileId] = useState<string | null>(null);
    const [isMember, setIsMember] = useState(false);
    const skipNextRef = useRef(false);
    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
    const filesRef = useRef<RoomFile[]>([]);
    filesRef.current = files;

    const activeFile = useMemo(
        () => files.find((f) => f.id === activeFileId) ?? null,
        [files, activeFileId],
    );

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
            setIsMember(true);
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

    useEffect(() => {
        if (access.kind !== "ok" || !user) return;
        setConnected(true);
        setPresence(1);
        return () => {};
    }, [id, user, access.kind]);

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
        persist(activeFile.id, value);
    };

    const onLanguageChange = async (lang: string) => {
        if (!activeFile) return;
        try {
            await updateRoomFile(id!, activeFile.id, { language: lang });
            setFiles((prev) =>
                prev.map((f) =>
                    f.id === activeFile.id
                        ? { ...f, language: lang, updated_at: new Date().toISOString() }
                        : f
                )
            );
            toast.success(`Language changed to ${lang}`);
        } catch (e: any) {
            toast.error(e.message || "Failed to update language");
        }
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
    const canEdit = isMember || room.owner_id === user?.id || room.owner_id === user?._id;

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
                copyLink={copyLink}
            />

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.35, ease: "easeOut" }}
                className="flex-1 min-h-0 bg-muted/20 flex"
            >
                <FileTabs
                    files={files}
                    activeId={activeFileId}
                    onSelect={setActiveFileId}
                    onCreate={createFile}
                    onRename={renameFile}
                    onDelete={deleteFile}
                    canEdit={canEdit}
                />
                <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex-1 min-h-0">
                        {activeFile ? (
                            <CodeRunner
                                key={activeFile.id}
                                value={activeFile.content}
                                language={activeFile.language}
                                onChange={onChange}
                                onLanguageChange={onLanguageChange}
                                onEditorMount={(editor: any) => {
                                    editorRef.current = editor;
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
                    <div className="hidden md:block w-72 lg:w-80 shrink-0 animate-in slide-in-from-right duration-200">
                        <RoomMembersPanel
                            roomId={room.id}
                            isOwner={room.owner_id === user?.id || room.owner_id === user?._id}
                            isPublic={room.is_public}
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
