import { motion } from "framer-motion";

export function StatCard({
    icon, label, value, tint,
}: { icon: React.ReactNode; label: string; value: number; tint: string }) {
    return (
        <motion.div
            whileHover={{ y: -2 }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-4 shadow-sm"
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${tint} opacity-60 pointer-events-none`} />
            <div className="relative flex items-center justify-between">
                <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
                </div>
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-background/70 border border-border text-primary group-hover:scale-110 transition">
                    {icon}
                </div>
            </div>
        </motion.div>
    );
}
