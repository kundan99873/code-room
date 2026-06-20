import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Edit2, FileCode2, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { LANGUAGES } from "@/lib/languages";

export type RoomFile = {
    id: string;
    room_id: string;
    name: string;
    language: string;
    content: string;
    position: number;
    updated_at: string;
};

type Props = {
    files: RoomFile[];
    activeId: string | null;
    onSelect: (id: string) => void;
    onCreate: (name: string, language: string) => Promise<void>;
    onRename: (id: string, name: string) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    canEdit: boolean;
};

function getFileIcon(fileName: string) {
    const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
    switch (ext) {
        case "js":
            return (
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-amber-500/10 text-amber-500 font-mono text-[9px] font-bold border border-amber-500/20">
                    JS
                </div>
            );
        case "ts":
            return (
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-blue-500/10 text-blue-500 font-mono text-[9px] font-bold border border-blue-500/20">
                    TS
                </div>
            );
        case "py":
            return (
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-500/10 text-emerald-500 font-mono text-[9px] font-bold border border-emerald-500/20">
                    PY
                </div>
            );
        case "java":
            return (
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-orange-500/10 text-orange-500 font-mono text-[9px] font-bold border border-orange-500/20">
                    JV
                </div>
            );
        case "go":
            return (
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-cyan-500/10 text-cyan-500 font-mono text-[9px] font-bold border border-cyan-500/20">
                    GO
                </div>
            );
        case "rs":
            return (
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-rose-500/10 text-rose-500 font-mono text-[9px] font-bold border border-rose-500/20">
                    RS
                </div>
            );
        case "cpp":
        case "h":
        case "hpp":
            return (
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-indigo-500/10 text-indigo-500 font-mono text-[9px] font-bold border border-indigo-500/20">
                    C++
                </div>
            );
        case "cs":
            return (
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-purple-500/10 text-purple-500 font-mono text-[9px] font-bold border border-purple-500/20">
                    C#
                </div>
            );
        case "php":
            return (
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-violet-500/10 text-violet-500 font-mono text-[9px] font-bold border border-violet-500/20">
                    PHP
                </div>
            );
        case "rb":
            return (
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-red-500/10 text-red-500 font-mono text-[9px] font-bold border border-red-500/20">
                    RB
                </div>
            );
        case "sh":
            return (
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-zinc-500/10 text-zinc-400 font-mono text-[9px] font-bold border border-zinc-500/20">
                    SH
                </div>
            );
        case "html":
            return (
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-orange-600/10 text-orange-500 font-mono text-[9px] font-bold border border-orange-600/20">
                    HT
                </div>
            );
        case "css":
            return (
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-sky-500/10 text-sky-400 font-mono text-[9px] font-bold border border-sky-500/20">
                    CS
                </div>
            );
        case "sql":
            return (
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-teal-500/10 text-teal-400 font-mono text-[9px] font-bold border border-teal-500/20">
                    SQL
                </div>
            );
        case "json":
            return (
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-amber-400/10 text-amber-500 font-mono text-[9px] font-bold border border-amber-400/20">
                    {"{}"}
                </div>
            );
        default:
            return (
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground font-mono text-[9px] font-bold border border-border">
                    TX
                </div>
            );
    }
}

export function FileTabs({ files, activeId, onSelect, onCreate, onRename, onDelete, canEdit }: Props) {
    const [creating, setCreating] = useState(false);
    const [newName, setNewName] = useState("");
    const [newLang, setNewLang] = useState("javascript");
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState("");

    const submitCreate = async () => {
        const name = newName.trim();
        if (!name) return toast.error("File name is compulsory");
        
        if (name.includes(".")) {
            return toast.error("File name cannot contain a dot (.)");
        }

        const lang = LANGUAGES.find((l) => l.id === newLang);
        if (!lang) return toast.error("Invalid language selected");

        const finalName = `${name}.${lang.ext}`;

        if (files.some((f) => f.name === finalName)) {
            return toast.error(`A file named "${finalName}" already exists`);
        }

        try {
            await onCreate(finalName, lang.id);
            setCreating(false);
            setNewName("");
            setNewLang("javascript");
        } catch (e: any) {
            toast.error(e?.message ?? "Failed to create file");
        }
    };

    const submitRename = async (id: string) => {
        const name = renameValue.trim();
        if (!name) return toast.error("Name required");

        // Enforce that the user cannot change the extension on rename
        const fileToRename = files.find((f) => f.id === id);
        if (fileToRename) {
            const dotIndex = fileToRename.name.lastIndexOf(".");
            const expectedExt = dotIndex !== -1 ? fileToRename.name.slice(dotIndex) : "";
            
            const newDotIndex = name.lastIndexOf(".");
            const newExt = newDotIndex !== -1 ? name.slice(newDotIndex) : "";

            if (expectedExt && newExt !== expectedExt) {
                return toast.error(`Cannot change file extension. You must keep the "${expectedExt}" extension.`);
            }
        }

        if (files.some((f) => f.id !== id && f.name === name)) {
            return toast.error("Name already in use");
        }

        try {
            await onRename(id, name);
            setRenamingId(null);
        } catch (e: any) {
            toast.error(e?.message ?? "Failed to rename");
        }
    };

    return (
        <>
            <div className="w-56 border-r border-border bg-card p-4 flex flex-col gap-3 shrink-0 overflow-y-auto scrollbar-thin">
                <div className="flex items-center justify-between pb-1 border-b border-border/60">
                    <h3 className="font-semibold text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <FileCode2 className="h-3.5 w-3.5" /> Files
                    </h3>
                    {canEdit && (
                        <button
                            onClick={() => setCreating(true)}
                            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
                            title="New File"
                        >
                            <Plus className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                <div className="flex flex-col gap-1.5">
                    <AnimatePresence initial={false}>
                        {files.map((f) => {
                            const active = f.id === activeId;
                            const isRenaming = renamingId === f.id;
                            return (
                                <motion.div
                                    key={f.id}
                                    layout
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className={`group flex items-center justify-between rounded-lg border p-2 text-xs font-medium shrink-0 transition-all ${active
                                        ? "border-primary/30 bg-primary/10 text-foreground shadow-sm"
                                        : "border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                                        }`}
                                >
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        {getFileIcon(f.name)}
                                        {isRenaming ? (
                                            <form
                                                onSubmit={(e) => { e.preventDefault(); submitRename(f.id); }}
                                                className="flex items-center gap-1 flex-1 min-w-0"
                                            >
                                                <Input
                                                    autoFocus
                                                    value={renameValue}
                                                    onChange={(e) => setRenameValue(e.target.value)}
                                                    onBlur={() => submitRename(f.id)}
                                                    className="h-6 text-xs px-1.5 py-0.5 w-full bg-background"
                                                />
                                                <button type="submit" className="text-primary cursor-pointer shrink-0"><Check className="h-3.5 w-3.5" /></button>
                                            </form>
                                        ) : (
                                            <button
                                                onClick={() => onSelect(f.id)}
                                                onDoubleClick={() => canEdit && (setRenamingId(f.id), setRenameValue(f.name))}
                                                className="font-mono truncate text-left w-full cursor-pointer"
                                            >
                                                {f.name}
                                            </button>
                                        )}
                                    </div>
                                    
                                    {!isRenaming && canEdit && (
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0 ml-1">
                                            <button
                                                onClick={() => { setRenamingId(f.id); setRenameValue(f.name); }}
                                                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
                                                title="Rename"
                                            >
                                                <Edit2 className="h-3.5 w-3.5" />
                                            </button>
                                            {files.length > 1 && (
                                                <button
                                                    onClick={() => {
                                                        if (confirm(`Delete file "${f.name}"?`)) onDelete(f.id);
                                                    }}
                                                    className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-muted transition cursor-pointer"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>

            <Dialog open={creating} onOpenChange={setCreating}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileCode2 className="h-4 w-4 text-primary" /> Create new file
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <div>
                            <label className="text-xs font-medium text-muted-foreground">File name</label>
                            <Input
                                autoFocus
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="e.g. utils.ts"
                                onKeyDown={(e) => e.key === "Enter" && submitCreate()}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground">Language</label>
                            <select
                                value={newLang}
                                onChange={(e) => setNewLang(e.target.value)}
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                                {LANGUAGES.map((l) => (
                                    <option key={l.id} value={l.id}>{l.label}</option>
                                ))}
                            </select>
                        </div>

                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
                        <Button onClick={submitCreate}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
