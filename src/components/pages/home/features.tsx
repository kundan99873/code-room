import { FEATURES } from "@/lib/data";
import { motion } from "motion/react";

export default function Features() {
  return (
    <div>
      {" "}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Built for developers, by developers
          </h2>
          <p className="mt-3 text-muted-foreground">
            Everything you need in a single browser tab — no extensions, no
            setup.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, body }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="group rounded-2xl border border-border bg-card/60 backdrop-blur p-6 transition hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 grid place-items-center group-hover:bg-primary/20 transition">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
