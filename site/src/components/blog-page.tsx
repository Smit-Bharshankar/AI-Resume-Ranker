"use client";

import { motion } from "framer-motion";
import { ArrowRight, BriefcaseBusiness, GitPullRequestArrow, Sparkles, Workflow, Zap } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const reveal = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" as const },
  },
};

const categories = [
  {
    name: "Recruiting Tips",
    description: "Practical advice for sourcing, screening, and interviewing better candidates.",
    icon: BriefcaseBusiness,
  },
  {
    name: "AI in Hiring",
    description: "Clear guidance on using AI tools responsibly in recruiting workflows.",
    icon: Zap,
  },
  {
    name: "Product Updates",
    description: "New features, improvements, and release notes from the Sortres team.",
    icon: GitPullRequestArrow,
  },
  {
    name: "Hiring Workflows",
    description: "Templates and playbooks to make hiring processes faster and more consistent.",
    icon: Workflow,
  },
];

const articles = [
  "How to Screen 100+ Resumes Without Missing Top Talent",
  "Using AI Candidate Scoring Without Losing Human Judgment",
  "A Practical Resume Review Checklist for Hiring Teams",
  "From Job Description to Shortlist: A Faster Hiring Workflow",
  "What We Learned Building Sortres for Recruiters",
  "How to Structure Interview Questions from Resume Insights",
];

export default function BlogPage() {
  return (
    <main className="relative overflow-hidden px-6 py-16 md:px-10">
      <div className="pointer-events-none absolute -top-20 -left-10 size-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -top-16 right-0 size-72 rounded-full bg-blue-400/20 blur-3xl" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12">
        <motion.section variants={reveal} initial="hidden" animate="show" className="space-y-5 text-center">
          <Badge variant="outline" className="mx-auto gap-1.5">
            <Sparkles className="size-3.5" />
            Sortres Blog
          </Badge>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Insights for modern recruiting teams
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground sm:text-lg">
            The Sortres blog shares practical strategies for resume screening, hiring workflows, and responsible AI in
            recruiting.
          </p>
        </motion.section>

        <motion.section
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="space-y-5"
        >
          <h2 className="text-2xl font-semibold tracking-tight">Categories</h2>
          <div className="grid gap-5 md:grid-cols-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Card key={category.name} className="border-border/70 bg-background/90">
                  <CardHeader className="space-y-3">
                    <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <CardTitle className="text-xl">{category.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">{category.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.section>

        <motion.section
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="rounded-2xl border border-border/70 bg-background/90 p-8 md:p-10"
        >
          <h2 className="text-2xl font-semibold tracking-tight">Featured articles</h2>
          <ul className="mt-5 space-y-3">
            {articles.map((title) => (
              <li key={title} className="rounded-lg border border-border/70 bg-muted/30 p-3">
                <p className="flex items-center justify-between gap-3 text-sm">
                  <span>{title}</span>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                </p>
              </li>
            ))}
          </ul>
        </motion.section>

        <motion.section
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="rounded-2xl border border-primary/20 bg-linear-to-r from-primary/10 via-background to-cyan-500/10 p-8 text-center md:p-10"
        >
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Stay updated with Sortres</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Follow product updates and recruiting insights as we publish new articles. Subscribe to stay informed about
            better hiring workflows.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/contact">Subscribe for Updates</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/features">Explore Sortres</Link>
            </Button>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
