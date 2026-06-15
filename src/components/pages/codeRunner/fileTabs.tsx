import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Pencil, FileCode2, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { LANGUAGES } from "@/lib/languages";
import { LANG_COLORS } from "@/lib/utils";

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

export function FileTabs({ files, activeId, onSelect, onCreate, onRename, onDelete, canEdit }: Props) {
    const [creating, setCreating] = useState(false);
    const [newName, setNewName] = useState("");
    const [newLang, setNewLang] = useState("javascript");
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState("");

    const submitCreate = async () => {
        const name = newName.trim();
        if (!name) return toast.error("File name required");
        
        // Find language configuration and enforce correct file extension
        const lang = LANGUAGES.find((l) => l.id === newLang);
        const ext = lang ? `.${lang.ext}` : "";
        let finalName = name;
        if (ext && !name.endsWith(ext)) {
            finalName = name + ext;
        }

        if (files.some((f) => f.name === finalName)) {
            return toast.error(`A file named "${finalName}" already exists`);
        }

        try {
            await onCreate(finalName, newLang);
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
                            const color = LANG_COLORS[f.language] ?? "#94a3b8";
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
                                        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
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
                                                className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
                                                title="Rename"
                                            >
                                                <Pencil className="h-3 w-3" />
                                            </button>
                                            {files.length > 1 && (
                                                <button
                                                    onClick={() => {
                                                        if (confirm(`Delete file "${f.name}"?`)) onDelete(f.id);
                                                    }}
                                                    className="p-0.5 rounded text-muted-foreground hover:text-destructive hover:bg-muted transition cursor-pointer"
                                                    title="Delete"
                                                >
                                                    <X className="h-3 w-3" />
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
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
