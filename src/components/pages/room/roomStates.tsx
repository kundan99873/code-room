import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Lock, ShieldCheck } from "lucide-react";

export function RoomNotFound({ onBack }: { onBack: () => void }) {
    return (
        <div className="min-h-screen grid place-items-center bg-background p-6">
            <div className="max-w-md text-center rounded-2xl border border-border bg-card p-8 shadow-sm">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-destructive/10 text-destructive mb-3">
                    <Lock className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold">Room not found</h2>
                <p className="text-sm text-muted-foreground mt-1">This room doesn't exist or has been deleted.</p>
                <Button className="mt-4 cursor-pointer" onClick={onBack}>Back to dashboard</Button>
            </div>
        </div>
    );
}

export function PrivateRoomRequest({
    status,
    onBack,
    onRequest,
}: {
    status: "idle" | "sent" | "pending" | "rejected";
    onBack: () => void;
    onRequest: () => void;
}) {
    return (
        <div className="min-h-screen grid place-items-center bg-background p-6 relative overflow-hidden">
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
                <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />
            </div>
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full text-center rounded-2xl border border-border bg-card/80 backdrop-blur-xl p-8 shadow-xl"
            >
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-lg mb-4">
                    <ShieldCheck className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-semibold">This is a private room</h2>
                <p className="text-sm text-muted-foreground mt-2">
                    {status === "pending" || status === "sent"
                        ? "Your request has been sent. You'll get access as soon as an admin approves it."
                        : status === "rejected"
                            ? "Your previous request was rejected. You can ask again."
                            : "Send a join request and an admin will let you in."}
                </p>
                <div className="mt-6 flex gap-2 justify-center">
                    <Button variant="outline" onClick={onBack} className="cursor-pointer">
                        <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
                    </Button>
                    {status === "pending" || status === "sent" ? (
                        <Button disabled className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white border-0">
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Waiting…
                        </Button>
                    ) : (
                        <Button onClick={onRequest} className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white border-0 cursor-pointer">
                            Request to join
                        </Button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
