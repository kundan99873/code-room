import { ArrowRight, FileJson, Play, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import FloatingCode from "./floatingCode";
import { useAuth } from "@/lib/auth";

export default function HeroSection() {
  const { user } = useAuth();
  return (
    <div>
      <section className="relative overflow-hidden">
        {/* Background glow + grid */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.18),transparent_60%)]" />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />
          <motion.div
            className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/25 blur-3xl"
            animate={{ x: [0, 60, 0], y: [0, 30, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-40 -right-32 h-112 w-md rounded-full bg-violet-500/20 blur-3xl"
            animate={{ x: [0, -50, 0], y: [0, -40, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <FloatingCode className="left-6 top-32 w-56 -rotate-6">{`// realtime sync
room.on("edit", (op) => {
  editor.apply(op);
});`}</FloatingCode>
        <FloatingCode className="right-8 top-40 w-60 rotate-3">{`def fib(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a+b
    return a`}</FloatingCode>
        <FloatingCode className="left-10 bottom-12 w-52 rotate-2">{`{
  "ok": true,
  "ms": 42
}`}</FloatingCode>

        <div className="mx-auto max-w-5xl px-4 pt-20 md:pt-28 pb-20 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 backdrop-blur px-3 py-1 text-xs text-muted-foreground"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Free runner · 15+ languages · Realtime collab
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-6 text-5xl md:text-7xl font-bold tracking-tight"
          >
            Code, run, and{" "}
            <span className="bg-linear-to-r from-primary via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              collaborate
            </span>
            <br className="hidden md:block" />
            in your browser.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 mx-auto max-w-2xl text-muted-foreground text-lg"
          >
            A modern online IDE — VS Code-style editor, instant code execution
            in 15+ languages, a JSON toolkit, and realtime rooms for pair
            programming.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              to="/playground"
              className="group inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground font-medium px-6 py-3 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition"
            >
              <Play className="h-4 w-4" /> Open Playground
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/json"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/70 backdrop-blur px-6 py-3 font-medium hover:bg-accent transition"
            >
              <FileJson className="h-4 w-4 text-primary" /> JSON Tools
            </Link>
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium text-muted-foreground hover:text-foreground transition"
              >
                Go to Dashboard →
              </Link>
            ) : (
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium text-muted-foreground hover:text-foreground transition"
              >
                Sign in to create rooms →
              </Link>
            )}
          </motion.div>

          {/* Mock IDE preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mt-16 mx-auto max-w-5xl rounded-2xl border border-border bg-card/80 backdrop-blur-xl shadow-2xl shadow-primary/10 overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/40">
              <span className="h-3 w-3 rounded-full bg-rose-500/80" />
              <span className="h-3 w-3 rounded-full bg-amber-500/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
              <span className="ml-3 text-xs text-muted-foreground font-mono">
                main.py — coderoom
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 text-left">
              <pre className="p-5 font-mono text-[13px] leading-relaxed text-foreground bg-background/40 border-r border-border overflow-hidden">
                {`def greet(name):
    return f"Hello, {name}!"

for who in ["world", "Coderoom"]:
    print(greet(who))
`}
              </pre>
              <div className="p-5 bg-[#0d1117] text-[13px] font-mono">
                <div className="text-emerald-400/80 mb-2">
                  › executing Python…
                </div>
                <div className="text-zinc-100">Hello, world!</div>
                <div className="text-zinc-100">Hello, Coderoom!</div>
                <div className="text-emerald-400/80 mt-3">✓ ran in 38ms</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
