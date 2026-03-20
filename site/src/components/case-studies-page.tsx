"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock3, GitBranch, ListFilter, MessageSquareQuote, Sparkles, Trophy } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_BASE_URL } from "@/lib/urls";

const reveal = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" as const },
  },
};

const studies = [
  {
    title: "Screening 100+ resumes for a backend developer role",
    context:
      "A small hiring team receives a large volume of applications for a time-sensitive developer opening.",
    how:
      "They paste the job description into Sortres, upload resumes in bulk, and use AI scoring to prioritize candidates with relevant backend stack experience.",
    outcome:
      "The team quickly narrows the list to the strongest shortlists and spends interview time on the most qualified applicants.",
    icon: GitBranch,
  },
  {
    title: "Identifying top candidates in under a day",
    context:
      "A recruiter managing multiple open roles needs to move from inbox triage to interview scheduling faster.",
    how:
      "Sortres ranks candidates against role requirements and provides structured summaries to reduce manual comparison work.",
    outcome:
      "Top candidates are identified earlier, helping the team respond faster in competitive hiring markets.",
    icon: Trophy,
  },
  {
    title: "Generating role-specific interview questions automatically",
    context:
      "Hiring managers want consistent interviews without writing a new question set for every candidate.",
    how:
      "Recruiters use Sortres-generated interview question suggestions based on the job description and each candidate profile.",
    outcome:
      "Interviews become more structured, and teams spend less prep time while maintaining candidate-by-candidate relevance.",
    icon: MessageSquareQuote,
  },
];

const benefits = [
  {
    title: "Reduced screening time",
    description: "Automate first-pass review so recruiters can focus on high-value conversations.",
    icon: Clock3,
  },
  {
    title: "Easier candidate comparison",
    description: "Use standardized scoring and summaries to compare candidates more consistently.",
    icon: ListFilter,
  },
  {
    title: "More structured evaluation",
    description: "Support fairer decisions with repeatable criteria and interview-ready insights.",
    icon: CheckCircle2,
  },
];

export default function CaseStudiesPage() {
  return (
    <main className="relative overflow-hidden px-6 py-16 md:px-10">
      <div className="pointer-events-none absolute -top-20 -left-10 size-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -top-16 right-0 size-72 rounded-full bg-blue-400/20 blur-3xl" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12">
        <motion.section variants={reveal} initial="hidden" animate="show" className="space-y-5 text-center">
          <Badge variant="outline" className="mx-auto gap-1.5">
            <Sparkles className="size-3.5" />
            Customers & Case Studies
          </Badge>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            How hiring teams use Sortres to move faster with confidence
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground sm:text-lg">
            These realistic usage examples show how recruiters can use Sortres to screen, compare, and shortlist candidates
            with less manual effort.
          </p>
        </motion.section>

        <motion.section
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="space-y-5"
        >
          {studies.map((study) => {
            const Icon = study.icon;
            return (
              <Card key={study.title} className="border-border/70 bg-background/90">
                <CardHeader className="space-y-3">
                  <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle className="text-xl">{study.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">Scenario: </span>
                    {study.context}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">How Sortres helps: </span>
                    {study.how}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Result: </span>
                    {study.outcome}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </motion.section>

        <motion.section
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="rounded-2xl border border-primary/20 bg-linear-to-r from-primary/10 via-background to-cyan-500/10 p-8 md:p-10"
        >
          <h2 className="text-2xl font-semibold tracking-tight">Benefits for recruiters</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.title} className="rounded-xl border border-border/70 bg-background/80 p-4">
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 text-primary" />
                    <p className="font-medium">{benefit.title}</p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </motion.section>

        <motion.section
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="rounded-2xl border border-border/70 bg-background/90 p-8 text-center md:p-10"
        >
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">See how Sortres fits your hiring workflow</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Start with free beta access and evaluate candidates in a faster, more structured way.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href={APP_BASE_URL}>Try Free Beta</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">Talk to Us</Link>
            </Button>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
