import { LANGS } from "@/lib/data";
import { motion } from "motion/react";

export default function LanguageStrip() {
  return (
    <div>
      {" "}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-6">
            Supported languages
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {LANGS.map((l, i) => (
              <motion.span
                key={l.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className={`text-xs font-medium px-3 py-1.5 rounded-full text-white bg-linear-to-r ${l.color} shadow-sm`}
              >
                {l.name}
              </motion.span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
