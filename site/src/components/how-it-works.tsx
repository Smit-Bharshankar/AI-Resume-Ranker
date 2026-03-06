"use client";

import { motion } from "framer-motion";
import { BrainCircuit, FileText, FileUp, LineChart } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  {
    title: "Step 1 - Paste Job Description",
    description: "Add the role description and key requirements to guide AI matching.",
    icon: FileText,
  },
  {
    title: "Step 2 - Upload Resumes",
    description: "Upload candidate resumes in bulk for instant processing.",
    icon: FileUp,
  },
  {
    title: "Step 3 - AI Scores Candidates",
    description: "The model evaluates fit based on skills, experience, and role match.",
    icon: BrainCircuit,
  },
  {
    title: "Step 4 - Get Recruiter Insights",
    description: "Review ranked candidates with clear hiring insights and next-step guidance.",
    icon: LineChart,
  },
];

const container = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function HowItWorks() {
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
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">How it works</h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-4 sm:grid-cols-2"
        >
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <motion.div key={step.title} variants={item}>
                <Card className="h-full border-border/70">
                  <CardHeader className="space-y-3">
                    <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

