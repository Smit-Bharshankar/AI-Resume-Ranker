"use client";

import { motion } from "framer-motion";
import { Brain, ListOrdered, Sparkles, Upload } from "lucide-react";

const pipelineSteps = [
  {
    title: "Resume Upload",
    description: "Bulk upload resumes in one click.",
    icon: Upload,
  },
  {
    title: "Skill Extraction",
    description: "AI parses and structures key skills.",
    icon: Sparkles,
  },
  {
    title: "AI Analysis",
    description: "Model evaluates role-fit and relevance.",
    icon: Brain,
  },
  {
    title: "Candidate Ranking",
    description: "Top candidates are prioritized instantly.",
    icon: ListOrdered,
  },
];

export default function AIPipeline() {
  return (
    <section className="px-6 md:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.25 }}
          className="mb-8 space-y-2"
        >
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">AI processing pipeline</h2>
          <p className="text-muted-foreground">From raw resumes to ranked candidates in a continuous flow.</p>
        </motion.div>

        <div className="relative">
          <div className="pointer-events-none absolute top-6 right-0 left-0 hidden h-px bg-[linear-gradient(to_right,transparent,var(--brand-line),transparent)] md:block" />
          <div className="pointer-events-none absolute top-0 bottom-0 left-6 block w-px bg-[linear-gradient(to_bottom,transparent,var(--brand-line),transparent)] md:hidden" />

          <motion.div
            className="pointer-events-none absolute top-4 hidden size-4 rounded-full brand-bg-gradient-br shadow-[0_0_20px_var(--brand-glow)] md:block"
            animate={{ x: ["0%", "96%", "0%"] }}
            transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />
          <motion.div
            className="pointer-events-none absolute left-4 block size-4 rounded-full brand-bg-gradient-br shadow-[0_0_20px_var(--brand-glow)] md:hidden"
            animate={{ y: ["0%", "96%", "0%"] }}
            transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />

          <div className="grid gap-4 md:grid-cols-4">
            {pipelineSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: index * 0.06, ease: "easeOut" }}
                  viewport={{ once: true, amount: 0.25 }}
                  className="relative"
                >
                  <motion.div
                    className="absolute inset-0 -z-10 rounded-xl bg-[linear-gradient(to_right,color-mix(in_srgb,var(--brand-accent)_22%,transparent),color-mix(in_srgb,var(--brand-accent-strong)_22%,transparent))] blur-xl"
                    animate={{ opacity: [0.2, 0.55, 0.2] }}
                    transition={{
                      duration: 4,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                      delay: index * 0.45,
                    }}
                  />
                  <div className="h-full rounded-xl border border-border/70 bg-background/75 p-5 shadow-lg backdrop-blur-md">
                    <div className="brand-bg-gradient-br mb-4 inline-flex size-10 items-center justify-center rounded-full text-white">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="text-base font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
