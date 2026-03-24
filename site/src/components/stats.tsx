"use client";

import CountUp from "react-countup";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";

const stats = [
  {
    value: 500,
    suffix: "+",
    label: "Resumes Processed",
  },
  {
    value: 95,
    suffix: "%",
    label: "Skill Extraction Accuracy",
  },
  {
    value: 10,
    suffix: "x",
    label: "Faster Candidate Screening",
  },
];

export default function Stats() {
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
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            AI-powered resume screening at scale
          </h2>
          <p className="text-muted-foreground">Built for hiring teams processing high candidate volume.</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
              viewport={{ once: true, amount: 0.3 }}
            >
              <Card className="h-full rounded-xl border border-border/70 bg-background/75 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <CardContent className="space-y-2 pt-6">
                  <div className="brand-text-gradient text-4xl font-semibold tracking-tight sm:text-5xl">
                    <CountUp end={stat.value} duration={2} enableScrollSpy scrollSpyOnce />
                    {stat.suffix}
                  </div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
