import { motion } from "motion/react";

export default function FloatingCode({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <motion.pre
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 0.85, y: 0 }}
      transition={{ duration: 1.2 }}
      className={`absolute hidden lg:block font-mono text-[11px] leading-relaxed text-primary/70
        rounded-xl border border-border bg-card/60 backdrop-blur-md shadow-2xl px-4 py-3 ${className}`}
    >
      {children}
    </motion.pre>
  );
}
