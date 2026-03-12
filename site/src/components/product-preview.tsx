"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

import CandidateRankingDemo from "@/components/candidate-ranking-demo";

const bullets = [
  "Candidate ranking dashboard",
  "AI scoring system",
  "Candidate insights",
  "Interview question generation",
];

export default function ProductPreview() {
  return (
    <section className="px-6 md:px-10">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-2 lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.25 }}
          className="relative overflow-hidden rounded-2xl border border-border/70 bg-background/75 p-6 shadow-lg backdrop-blur-md sm:p-8"
        >
          <div className="absolute -top-10 -right-10 size-32 rounded-full bg-blue-500/15 blur-2xl" />
          <div className="absolute -bottom-14 -left-10 size-40 rounded-full bg-purple-500/15 blur-2xl" />
          <div className="relative">
            <CandidateRankingDemo />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.25 }}
          className="space-y-5"
        >
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Product preview</h2>
          <p className="text-muted-foreground">
            A recruiter-first dashboard designed to reduce screening time and increase candidate quality.
          </p>

          <ul className="space-y-3">
            {bullets.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground sm:text-base">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
