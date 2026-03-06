"use client";

import { motion } from "framer-motion";
import { ClipboardList, Scale, TriangleAlert } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const problems = [
  {
    title: "Manual Screening",
    description: "Recruiters spend hours reviewing resumes manually.",
    icon: ClipboardList,
  },
  {
    title: "Hard to Compare Candidates",
    description: "It's difficult to evaluate candidates consistently.",
    icon: Scale,
  },
  {
    title: "Important Skills Get Missed",
    description: "Key qualifications can easily be overlooked.",
    icon: TriangleAlert,
  },
];

export default function Problem() {
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
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Hiring teams waste hours manually screening resumes
          </h2>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3">
          {problems.map((problem, index) => {
            const Icon = problem.icon;

            return (
              <motion.div
                key={problem.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
                viewport={{ once: true, amount: 0.3 }}
              >
                <Card className="h-full rounded-xl border border-white/60 bg-white/60 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <CardHeader className="space-y-3">
                    <div className="flex size-11 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-500 text-white shadow-md">
                      <Icon className="size-5" />
                    </div>
                    <CardTitle className="text-lg">{problem.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">{problem.description}</p>
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

