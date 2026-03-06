"use client";

import { motion } from "framer-motion";
import { FileText, FileUp, ScanSearch, Trophy } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  {
    title: "Paste Job Description",
    description: "Define role requirements in seconds.",
    icon: FileText,
  },
  {
    title: "Upload Resumes",
    description: "Add all candidate resumes in one batch.",
    icon: FileUp,
  },
  {
    title: "AI Extracts Skills",
    description: "Structured skills and experience are mapped automatically.",
    icon: ScanSearch,
  },
  {
    title: "Ranked Candidates",
    description: "Get a clear shortlist ordered by fit score.",
    icon: Trophy,
  },
];

export default function Workflow() {
  return (
    <section className="px-6 md:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.25 }}
          className="mb-8 space-y-2"
        >
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">AI-powered hiring workflow</h2>
          <p className="text-muted-foreground">From job criteria to ranked candidates in minutes.</p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
                viewport={{ once: true, amount: 0.3 }}
              >
                <Card className="h-full rounded-xl border border-white/60 bg-white/60 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <CardHeader className="space-y-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-md">
                      <Icon className="size-5" />
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">{step.description}</CardDescription>
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

