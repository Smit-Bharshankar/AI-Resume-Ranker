"use client";

import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, FileSearch2, Files, ListChecks, MessageSquareText, Sparkles, UserRound } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const workflowSteps = [
  "Paste job description",
  "Upload resumes",
  "AI analyzes resumes",
  "Candidates are scored and ranked",
  "Recruiters review insights",
];

const features = [
  {
    title: "AI Resume Structuring",
    description:
      "Convert unstructured resumes into clean candidate data with extracted skills, experience, and role history for faster review.",
    icon: FileSearch2,
  },
  {
    title: "Candidate Scoring",
    description:
      "Score candidates against job requirements using a consistent framework so recruiters can prioritize the strongest matches quickly.",
    icon: ListChecks,
  },
  {
    title: "Recruiter Insights",
    description:
      "Get concise summaries, strengths, and potential gaps for each candidate so your team can move from screening to interviews faster.",
    icon: BrainCircuit,
  },
  {
    title: "Interview Question Suggestions",
    description:
      "Generate targeted interview prompts based on each resume and job role to improve interview quality and consistency.",
    icon: MessageSquareText,
  },
  {
    title: "Bulk Resume Processing",
    description:
      "Upload resume batches and process high application volumes in minutes instead of manually reviewing files one by one.",
    icon: Files,
  },
  {
    title: "Candidate Profile View",
    description:
      "View each candidate in a single profile with score, skills match, summary, and interview-ready context for decision discussions.",
    icon: UserRound,
  },
];

const reveal = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" as const },
  },
};

export default function FeaturesPage() {
  return (
    <main className="relative overflow-hidden px-6 py-16 md:px-10">
      <div className="pointer-events-none absolute -top-20 -left-10 size-72 rounded-full bg-sky-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -top-16 right-0 size-72 rounded-full bg-indigo-400/20 blur-3xl" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-14">
        <motion.section variants={reveal} initial="hidden" animate="show" className="space-y-5 text-center">
          <Badge variant="outline" className="mx-auto gap-1.5">
            <Sparkles className="size-3.5" />
            Product Features
          </Badge>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Screen resumes faster and focus on top candidates
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground sm:text-lg">
            Sortres helps recruiters turn raw applications into ranked shortlists with actionable AI insights.
          </p>
        </motion.section>

        <motion.section
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="space-y-6"
        >
          <h2 className="text-center text-2xl font-semibold tracking-tight">How Sortres works</h2>
          <div className="grid gap-3 md:grid-cols-5">
            {workflowSteps.map((step, index) => (
              <div key={step} className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/90 p-4">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {index + 1}
                </span>
                <p className="text-sm font-medium">{step}</p>
                {index < workflowSteps.length - 1 ? <ArrowRight className="ml-auto hidden size-4 text-muted-foreground md:block" /> : null}
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="space-y-6"
        >
          <h2 className="text-center text-2xl font-semibold tracking-tight">Core capabilities</h2>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="border-border/70 bg-background/90">
                  <CardHeader className="space-y-3">
                    <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
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
          className="rounded-2xl border border-border/70 bg-background/85 p-8 md:p-10"
        >
          <h2 className="text-2xl font-semibold tracking-tight">Save hours on every hiring cycle</h2>
          <p className="mt-3 text-muted-foreground">
            Recruiters no longer need to manually scan every resume line by line. Sortres automates first-pass analysis,
            highlights top matches, and provides structured insights so teams can review more candidates in less time.
          </p>
        </motion.section>

        <motion.section
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="rounded-2xl border border-primary/20 bg-linear-to-r from-primary/10 via-background to-cyan-500/10 p-8 md:p-10"
        >
          <h2 className="text-2xl font-semibold tracking-tight">AI assistance, human decisions</h2>
          <p className="mt-3 text-muted-foreground">
            Sortres is built to support recruiters, not replace them. AI helps surface patterns, summarize candidates, and
            suggest interview angles, while final hiring decisions remain with your team.
          </p>
        </motion.section>

        <motion.section
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="rounded-2xl border border-border/70 bg-background/90 p-8 text-center md:p-10"
        >
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Try Sortres for your next hiring sprint</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Start free and see how quickly your team can move from resume pile to interview-ready shortlist.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
