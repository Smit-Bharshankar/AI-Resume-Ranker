"use client";

import { motion } from "framer-motion";
import { Brain, DatabaseZap, Layers3, Telescope } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "AI Resume Structuring",
    description: "Turn unstructured resumes into clean, searchable candidate profiles.",
    icon: Layers3,
  },
  {
    title: "Candidate Scoring",
    description: "Score candidate-role match with transparent AI-driven criteria.",
    icon: Brain,
  },
  {
    title: "Recruiter Insights",
    description: "See strengths, gaps, and fit summaries before the first call.",
    icon: Telescope,
  },
  {
    title: "Bulk Resume Processing",
    description: "Analyze large resume batches quickly without manual sorting.",
    icon: DatabaseZap,
  },
];

export default function Features() {
  return (
    <section className="px-6 md:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.25 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Powerful AI hiring features</h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
                viewport={{ once: true, amount: 0.3 }}
              >
                <Card className="h-full rounded-xl border border-border/70 bg-background/75 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <CardHeader className="space-y-3">
                    <div className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-md">
                      <Icon className="size-5" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

