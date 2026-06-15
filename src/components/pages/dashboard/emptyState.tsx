import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Code2 } from "lucide-react";

export function EmptyState({ onCreate, hasRooms }: { onCreate: () => void; hasRooms: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-3xl border border-dashed border-border bg-card/40 backdrop-blur-xl p-12 text-center"
        >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-fuchsia-500/5" />
            <div className="relative mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-lg">
                <Code2 className="h-8 w-8" />
            </div>
            <h3 className="relative mt-5 text-xl font-semibold">
                {hasRooms ? "No rooms match your filters" : "No rooms yet"}
            </h3>
            <p className="relative mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                {hasRooms
                    ? "Try clearing your search or switching filters to see more rooms."
                    : "Create your first collaborative room and invite your team to start coding together in real time."}
            </p>
            {!hasRooms && (
                <Button
                    onClick={onCreate}
                    className="relative mt-6 gap-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white border-0 cursor-pointer"
                >
                    <Plus className="h-4 w-4" /> Create your first room
                </Button>
            )}
        </motion.div>
    );
}
