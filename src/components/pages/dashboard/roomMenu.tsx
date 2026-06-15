import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, Link2, Lock, Globe2, Trash2 } from "lucide-react";

export function RoomMenu({
    isOwner, isPublic, onDelete, onCopyLink, onToggleVisibility,
}: {
    isOwner: boolean; isPublic: boolean;
    onDelete: () => void; onCopyLink: () => void; onToggleVisibility: () => void;
}) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handleOutsideClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, [open]);

    return (
        <div className="relative z-20" ref={menuRef}>
            <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open); }}
                className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
            >
                <MoreHorizontal className="h-4 w-4" />
            </button>
            {open && (
                <div 
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 mt-1 w-48 rounded-md border border-border bg-card p-1 shadow-lg text-sm flex flex-col z-30"
                >
                    <button 
                        onClick={(e) => { e.preventDefault(); setOpen(false); onCopyLink(); }}
                        className="flex w-full items-center px-2 py-1.5 rounded-sm hover:bg-accent hover:text-accent-foreground text-left cursor-pointer"
                    >
                        <Link2 className="h-4 w-4 mr-2" /> Copy invite link
                    </button>
                    {isOwner && (
                        <>
                            <button 
                                onClick={(e) => { e.preventDefault(); setOpen(false); onToggleVisibility(); }}
                                className="flex w-full items-center px-2 py-1.5 rounded-sm hover:bg-accent hover:text-accent-foreground text-left cursor-pointer"
                            >
                                {isPublic ? <Lock className="h-4 w-4 mr-2" /> : <Globe2 className="h-4 w-4 mr-2" />}
                                Make {isPublic ? "private" : "public"}
                            </button>
                            <div className="h-px bg-border my-1" />
                            <button 
                                onClick={(e) => { e.preventDefault(); setOpen(false); onDelete(); }}
                                className="flex w-full items-center px-2 py-1.5 rounded-sm hover:bg-accent hover:text-accent-foreground text-destructive hover:bg-destructive/10 text-left cursor-pointer"
                            >
                                <Trash2 className="h-4 w-4 mr-2" /> Delete room
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
