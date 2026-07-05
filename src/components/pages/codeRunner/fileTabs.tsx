import React, { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Edit2, FileCode2, Check, Folder, FolderOpen, ChevronDown, ChevronRight, FolderPlus, FolderInput, Search, ChevronLeft, FolderMinus } from "lucide-react";
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
    onCollapseSidebar?: () => void;
};

interface TreeNode {
    name: string;
    path: string;
    isFolder: boolean;
    children?: TreeNode[];
    file?: RoomFile;
}

function buildFileTree(files: RoomFile[], emptyFolders: string[]): TreeNode[] {
    const root: TreeNode[] = [];

    // 1. Add files
    files.forEach((file) => {
        const parts = file.name.split("/");
        let currentLevel = root;
        let currentPath = "";

        parts.forEach((part, index) => {
            currentPath = currentPath ? `${currentPath}/${part}` : part;
            const isLast = index === parts.length - 1;

            let node = currentLevel.find((n) => n.name === part && n.isFolder === !isLast);

            if (!node) {
                node = {
                    name: part,
                    path: currentPath,
                    isFolder: !isLast,
                    children: isLast ? undefined : [],
                    file: isLast ? file : undefined,
                };
                currentLevel.push(node);
            }

            if (!isLast) {
                currentLevel = node.children!;
            }
        });
    });

    // 2. Add empty folders
    emptyFolders.forEach((folderPath) => {
        const parts = folderPath.split("/");
        let currentLevel = root;
        let currentPath = "";

        parts.forEach((part) => {
            currentPath = currentPath ? `${currentPath}/${part}` : part;
            let node = currentLevel.find((n) => n.name === part && n.isFolder === true);

            if (!node) {
                node = {
                    name: part,
                    path: currentPath,
                    isFolder: true,
                    children: [],
                };
                currentLevel.push(node);
            }

            currentLevel = node.children!;
        });
    });

    const sortTree = (nodes: TreeNode[]) => {
        nodes.sort((a, b) => {
            if (a.isFolder && !b.isFolder) return -1;
            if (!a.isFolder && b.isFolder) return 1;
            return a.name.localeCompare(b.name);
        });
        nodes.forEach((node) => {
            if (node.children) {
                sortTree(node.children);
            }
        });
    };

    sortTree(root);
    return root;
}

function getFileIcon(fileName: string) {
    const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
    switch (ext) {
        case "js":
            return (
                <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] bg-amber-500/10 text-amber-500 font-sans text-[8px] font-bold border border-amber-500/20">
                    JS
                </div>
            );
        case "ts":
            return (
                <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] bg-blue-500/10 text-blue-500 font-sans text-[8px] font-bold border border-blue-500/20">
                    TS
                </div>
            );
        case "py":
            return (
                <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] bg-emerald-500/10 text-emerald-500 font-sans text-[8px] font-bold border border-emerald-500/20">
                    PY
                </div>
            );
        case "java":
            return (
                <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] bg-orange-500/10 text-orange-500 font-sans text-[8px] font-bold border border-orange-500/20">
                    JV
                </div>
            );
        case "go":
            return (
                <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] bg-cyan-500/10 text-cyan-500 font-sans text-[8px] font-bold border border-cyan-500/20">
                    GO
                </div>
            );
        case "rs":
            return (
                <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] bg-rose-500/10 text-rose-500 font-sans text-[8px] font-bold border border-rose-500/20">
                    RS
                </div>
            );
        case "cpp":
        case "h":
        case "hpp":
            return (
                <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] bg-indigo-500/10 text-indigo-500 font-sans text-[8px] font-bold border border-indigo-500/20">
                    C++
                </div>
            );
        case "cs":
            return (
                <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] bg-purple-500/10 text-purple-500 font-sans text-[8px] font-bold border border-purple-500/20">
                    C#
                </div>
            );
        case "php":
            return (
                <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] bg-violet-500/10 text-violet-500 font-sans text-[8px] font-bold border border-violet-500/20">
                    PHP
                </div>
            );
        case "rb":
            return (
                <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] bg-red-500/10 text-red-500 font-sans text-[8px] font-bold border border-red-500/20">
                    RB
                </div>
            );
        case "sh":
            return (
                <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] bg-zinc-500/10 text-zinc-400 font-sans text-[8px] font-bold border border-zinc-500/20 text-center">
                    SH
                </div>
            );
        case "html":
            return (
                <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] bg-orange-600/10 text-orange-500 font-sans text-[8px] font-bold border border-orange-600/20">
                    HT
                </div>
            );
        case "css":
            return (
                <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] bg-sky-500/10 text-sky-400 font-sans text-[8px] font-bold border border-sky-500/20">
                    CS
                </div>
            );
        case "sql":
            return (
                <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] bg-teal-500/10 text-teal-400 font-sans text-[8px] font-bold border border-teal-500/20 text-center">
                    SQL
                </div>
            );
        case "json":
            return (
                <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] bg-amber-400/10 text-amber-500 font-sans text-[8px] font-bold border border-amber-400/20">
                    {"{}"}
                </div>
            );
        default:
            return (
                <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] bg-muted text-muted-foreground font-sans text-[8px] font-bold border border-border">
                    TX
                </div>
            );
    }
}

export function FileTabs({ files, activeId, onSelect, onCreate, onRename, onDelete, canEdit, onCollapseSidebar }: Props) {
    const [creating, setCreating] = useState(false);
    const [newName, setNewName] = useState("");
    const [newLang, setNewLang] = useState("javascript");
    const [createParentPath, setCreateParentPath] = useState("");
    const [selectedFolder, setSelectedFolder] = useState("");
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState("");
    const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

    const [creatingFolder, setCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [emptyFolders, setEmptyFolders] = useState<string[]>([]);

    const [movingFile, setMovingFile] = useState<RoomFile | null>(null);
    const [moveTargetFolder, setMoveTargetFolder] = useState("");

    const [searchQuery, setSearchQuery] = useState("");

    const filteredFiles = useMemo(() => {
        if (!searchQuery.trim()) return files;
        return files.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [files, searchQuery]);

    // Synchronize selectedFolder with createParentPath when dialog opens
    useEffect(() => {
        if (creating) {
            setSelectedFolder(createParentPath);
        }
    }, [creating, createParentPath]);

    const toggleFolder = (path: string) => {
        setExpandedFolders((prev) => {
            const currentVal = prev[path] ?? true; // default to true
            return {
                ...prev,
                [path]: !currentVal,
            };
        });
    };

    // Extract all folder paths from files and emptyFolders
    const folderOptions = Array.from(
        new Set([
            ...files
                .map((f) => {
                    const parts = f.name.split("/");
                    if (parts.length > 1) {
                        const foldersList: string[] = [];
                        for (let i = 1; i < parts.length; i++) {
                            foldersList.push(parts.slice(0, i).join("/"));
                        }
                        return foldersList;
                    }
                    return [];
                })
                .flat(),
            ...emptyFolders,
        ])
    ).sort();

    const collapseAll = () => {
        const next: Record<string, boolean> = {};
        folderOptions.forEach((path) => {
            next[path] = false;
        });
        setExpandedFolders(next);
    };

    const submitCreate = async () => {
        const name = newName.trim();
        if (!name) return toast.error("File name is compulsory");
        
        if (name.includes(".")) {
            return toast.error("File name cannot contain a dot (.)");
        }

        const lang = LANGUAGES.find((l) => l.id === newLang);
        if (!lang) return toast.error("Invalid language selected");

        const extName = `${name}.${lang.ext}`;
        const finalName = selectedFolder ? `${selectedFolder}/${extName}` : extName;

        if (files.some((f) => f.name === finalName)) {
            return toast.error(`A file named "${finalName}" already exists`);
        }

        try {
            await onCreate(finalName, lang.id);
            
            // Clean up emptyFolders that are now parent to this file
            if (selectedFolder) {
                setEmptyFolders((prev) => prev.filter((path) => path !== selectedFolder));
            }

            setCreating(false);
            setNewName("");
            setNewLang("javascript");
            setCreateParentPath("");
            setSelectedFolder("");
        } catch (e: any) {
            toast.error(e?.message ?? "Failed to create file");
        }
    };

    const submitCreateFolder = async () => {
        const name = newFolderName.trim().replace(/\/+$/, ""); // remove trailing slashes
        if (!name) return toast.error("Folder name is required");

        if (name.includes("..") || name.includes(".")) {
            return toast.error("Invalid folder name");
        }

        // Check if folder already exists in files or emptyFolders
        if (folderOptions.includes(name)) {
            return toast.error(`Folder "${name}" already exists`);
        }

        setEmptyFolders((prev) => [...prev, name]);
        setExpandedFolders((prev) => ({
            ...prev,
            [name]: true,
        }));
        setCreatingFolder(false);
        setNewFolderName("");
        toast.success(`Folder "${name}" created`);
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

    const submitMove = async () => {
        if (!movingFile) return;

        const fileName = movingFile.name.split("/").pop()!;
        const finalName = moveTargetFolder ? `${moveTargetFolder}/${fileName}` : fileName;

        if (finalName === movingFile.name) {
            setMovingFile(null);
            return; // No change
        }

        if (files.some((f) => f.name === finalName)) {
            return toast.error(`A file named "${fileName}" already exists in the target folder`);
        }

        try {
            await onRename(movingFile.id, finalName);
            
            // Clean up emptyFolders that are now parent to this moved file
            if (moveTargetFolder) {
                setEmptyFolders((prev) => prev.filter((path) => path !== moveTargetFolder));
            }

            setMovingFile(null);
            toast.success(`Moved to ${moveTargetFolder || "Root"}`);
        } catch (e: any) {
            toast.error(e?.message ?? "Failed to move file");
        }
    };

    const deleteFolder = async (folderPath: string) => {
        const prefix = folderPath + "/";
        const filesToDelete = files.filter((f) => f.name.startsWith(prefix));
        
        if (filesToDelete.length === 0) {
            // Delete folder path from emptyFolders state
            setEmptyFolders((prev) => prev.filter((p) => p !== folderPath && !p.startsWith(prefix)));
            toast.success(`Folder "${folderPath}" deleted`);
            return;
        }
        
        if (confirm(`Delete folder "${folderPath}" and all its ${filesToDelete.length} files?`)) {
            try {
                await Promise.all(filesToDelete.map((f) => onDelete(f.id)));
                setEmptyFolders((prev) => prev.filter((p) => p !== folderPath && !p.startsWith(prefix)));
                toast.success(`Folder "${folderPath}" deleted`);
            } catch (e: any) {
                toast.error(e?.message ?? "Failed to delete folder");
            }
        }
    };

    const renderTree = (nodes: TreeNode[], depth = 0): React.ReactNode => {
        return nodes.map((node) => {
            const isFolder = node.isFolder;
            const isExpanded = searchQuery.trim() !== "" ? true : (expandedFolders[node.path] ?? true);
            
            if (isFolder) {
                return (
                    <div key={node.path} className="flex flex-col select-none">
                        <div
                            className="group flex items-center justify-between py-1.5 px-2 hover:bg-muted/30 rounded-md text-[11px] font-medium text-muted-foreground/80 hover:text-foreground cursor-pointer transition-colors"
                            onClick={() => toggleFolder(node.path)}
                            style={{ paddingLeft: `${depth * 12 + 6}px` }}
                        >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                {isExpanded ? (
                                    <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground/60 transition-transform" />
                                ) : (
                                    <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/60 transition-transform" />
                                )}
                                {isExpanded ? (
                                    <FolderOpen className="h-3.5 w-3.5 shrink-0 text-indigo-400/95" />
                                ) : (
                                    <Folder className="h-3.5 w-3.5 shrink-0 text-indigo-400/95" />
                                )}
                                <span className="truncate font-sans font-medium text-slate-200 group-hover:text-white transition-colors">{node.name}</span>
                            </div>
                            
                            {canEdit && (
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCreateParentPath(node.path);
                                            setCreating(true);
                                        }}
                                        className="p-1 rounded-md text-muted-foreground hover:text-white hover:bg-muted transition-colors cursor-pointer"
                                        title="New file in folder"
                                    >
                                        <Plus className="h-3 w-3" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteFolder(node.path);
                                        }}
                                        className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-muted transition-colors cursor-pointer"
                                        title="Delete folder"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        {isExpanded && node.children && (
                            <div className="flex flex-col">
                                {renderTree(node.children, depth + 1)}
                            </div>
                        )}
                    </div>
                );
            } else {
                const f = node.file!;
                if (f.name.endsWith(".gitkeep")) return null; // Hide placeholder file in the explorer tree!

                const active = f.id === activeId;
                const isRenaming = renamingId === f.id;
                
                return (
                    <div
                        key={f.id}
                        className={`group flex items-center justify-between py-1.5 px-2 rounded-md text-[11px] font-medium transition-all select-none ${
                            active
                                ? "bg-indigo-500/10 text-white font-semibold border-l-2 border-indigo-500 rounded-r-md rounded-l-none"
                                : "text-muted-foreground/90 hover:bg-muted/20 hover:text-foreground"
                        }`}
                        style={{ 
                            paddingLeft: active ? `${depth * 12 + 16}px` : `${depth * 12 + 18}px`,
                            marginLeft: active ? `2px` : `0px`
                        }}
                    >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            {getFileIcon(f.name)}
                            {isRenaming ? (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        submitRename(f.id);
                                    }}
                                    className="flex items-center gap-1 flex-1 min-w-0"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Input
                                        autoFocus
                                        value={renameValue}
                                        onChange={(e) => setRenameValue(e.target.value)}
                                        onBlur={() => submitRename(f.id)}
                                        className="h-5 text-[10px] px-1 py-0.5 w-full bg-background"
                                    />
                                    <button type="submit" className="text-primary cursor-pointer shrink-0">
                                        <Check className="h-3 w-3" />
                                    </button>
                                </form>
                            ) : (
                                <button
                                    onClick={() => onSelect(f.id)}
                                    onDoubleClick={() => canEdit && (setRenamingId(f.id), setRenameValue(f.name))}
                                    className="truncate text-left w-full cursor-pointer font-sans text-slate-300 group-hover:text-white transition-colors"
                                >
                                    {node.name}
                                </button>
                            )}
                        </div>
                        
                        {!isRenaming && canEdit && (
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setMovingFile(f);
                                        const parts = f.name.split("/");
                                        const currentFolder = parts.length > 1 ? parts.slice(0, -1).join("/") : "";
                                        setMoveTargetFolder(currentFolder);
                                    }}
                                    className="p-1 rounded-md text-muted-foreground hover:text-white hover:bg-muted transition-colors cursor-pointer"
                                    title="Move File"
                                >
                                    <FolderInput className="h-3 w-3" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setRenamingId(f.id);
                                        setRenameValue(f.name);
                                    }}
                                    className="p-1 rounded-md text-muted-foreground hover:text-white hover:bg-muted transition-colors cursor-pointer"
                                    title="Rename"
                                >
                                    <Edit2 className="h-3 w-3" />
                                </button>
                                {files.length > 1 && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm(`Delete file "${f.name}"?`)) onDelete(f.id);
                                        }}
                                        className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-muted transition-colors cursor-pointer"
                                        title="Delete"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                );
            }
        });
    };

    const tree = useMemo(() => buildFileTree(filteredFiles, emptyFolders), [filteredFiles, emptyFolders]);

    return (
        <>
            <div className="w-full h-full bg-card p-3 flex flex-col gap-2 overflow-hidden border-r border-border/60">
                <div className="flex items-center justify-between pb-1.5 border-b border-border/60 shrink-0 select-none">
                    <h3 className="font-semibold text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <FileCode2 className="h-3.5 w-3.5" /> Explorer
                    </h3>
                    <div className="flex items-center gap-0.5">
                        <button
                            onClick={collapseAll}
                            className="p-1 rounded text-slate-400 hover:text-foreground hover:bg-muted/65 transition cursor-pointer"
                            title="Collapse All Folders"
                        >
                            <FolderMinus className="h-3.5 w-3.5" />
                        </button>
                        {canEdit && (
                            <>
                                <button
                                    onClick={() => {
                                        setNewFolderName("");
                                        setCreatingFolder(true);
                                    }}
                                    className="p-1 rounded text-slate-400 hover:text-foreground hover:bg-muted/65 transition cursor-pointer"
                                    title="New Folder"
                                >
                                    <FolderPlus className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    onClick={() => {
                                        setCreateParentPath("");
                                        setCreating(true);
                                    }}
                                    className="p-1 rounded text-slate-400 hover:text-foreground hover:bg-muted/65 transition cursor-pointer"
                                    title="New File"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                </button>
                            </>
                        )}
                        {onCollapseSidebar && (
                            <button
                                onClick={onCollapseSidebar}
                                className="p-1 rounded text-slate-400 hover:text-foreground hover:bg-muted/65 transition cursor-pointer"
                                title="Collapse Sidebar"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* File Search Input */}
                <div className="relative shrink-0 select-none">
                    <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-background border border-border rounded px-2.5 py-1 pl-8 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-slate-500/60"
                    />
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-none flex flex-col gap-0.5 pr-0.5">
                    {tree.length > 0 ? (
                        renderTree(tree)
                    ) : (
                        <div className="text-xs text-muted-foreground py-4 text-center">
                            {searchQuery ? "No matching files" : "No files yet"}
                        </div>
                    )}
                </div>
            </div>

            {/* Create File Dialog */}
            <Dialog open={creating} onOpenChange={setCreating}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileCode2 className="h-4 w-4 text-primary" /> Create new file
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        {folderOptions.length > 0 && (
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">Select Folder</label>
                                <select
                                    value={selectedFolder}
                                    onChange={(e) => setSelectedFolder(e.target.value)}
                                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                >
                                    <option value="">Root (No Folder)</option>
                                    {folderOptions.map((fld) => (
                                        <option key={fld} value={fld}>{fld}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div>
                            <label className="text-xs font-medium text-muted-foreground">File name</label>
                            <Input
                                autoFocus
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="e.g. utils"
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
                        <Button variant="outline" onClick={() => { setCreating(false); setCreateParentPath(""); setSelectedFolder(""); }}>Cancel</Button>
                        <Button onClick={submitCreate}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Folder Dialog */}
            <Dialog open={creatingFolder} onOpenChange={setCreatingFolder}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FolderPlus className="h-4 w-4 text-primary" /> Create new folder
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <div>
                            <label className="text-xs font-medium text-muted-foreground">Folder name</label>
                            <Input
                                autoFocus
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                placeholder="e.g. src/components"
                                onKeyDown={(e) => e.key === "Enter" && submitCreateFolder()}
                                className="mt-1"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreatingFolder(false)}>Cancel</Button>
                        <Button onClick={submitCreateFolder}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Move File Dialog */}
            <Dialog open={!!movingFile} onOpenChange={(open) => !open && setMovingFile(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FolderInput className="h-4 w-4 text-primary" /> Move file
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        {movingFile && (
                            <div className="text-xs text-muted-foreground">
                                Moving file <span className="font-mono text-foreground font-semibold">{movingFile.name.split("/").pop()}</span> to:
                            </div>
                        )}
                        <div>
                            <label className="text-xs font-medium text-muted-foreground">Select Target Folder</label>
                            <select
                                value={moveTargetFolder}
                                onChange={(e) => setMoveTargetFolder(e.target.value)}
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                                <option value="">Root (No Folder)</option>
                                {folderOptions.map((fld) => (
                                    <option key={fld} value={fld}>{fld}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setMovingFile(null)}>Cancel</Button>
                        <Button onClick={submitMove}>Move</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
