"use client";

import { motion } from "framer-motion";
import { Eye, HeartHandshake, Lightbulb, Scale, Sparkles, Target, Users } from "lucide-react";
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

const problems = [
  "Recruiters spend too much time manually screening resumes.",
  "Important skills and relevant experience can be overlooked.",
  "Comparing candidates consistently becomes difficult at scale.",
];

export default function AboutPage() {
  return (
    <main className="relative overflow-hidden px-6 py-16 md:px-10">
      <div className="pointer-events-none absolute -top-20 -left-10 size-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -top-16 right-0 size-72 rounded-full bg-blue-400/20 blur-3xl" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12">
        <motion.section variants={reveal} initial="hidden" animate="show" className="space-y-5 text-center">
          <Badge variant="outline" className="mx-auto gap-1.5">
            <Sparkles className="size-3.5" />
            About Sortres
          </Badge>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Helping recruiters make faster, better hiring decisions
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground sm:text-lg">
            Sortres was created to make resume screening less manual and more meaningful, so hiring teams can spend more
            time with the right candidates.
          </p>
        </motion.section>

        <motion.section
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="rounded-2xl border border-border/70 bg-background/90 p-8 md:p-10"
        >
          <div className="flex items-center gap-3">
            <Target className="size-5 text-primary" />
            <h2 className="text-2xl font-semibold tracking-tight">The problem we are solving</h2>
          </div>
          <ul className="mt-4 space-y-3 text-muted-foreground">
            {problems.map((item) => (
              <li key={item} className="rounded-lg border border-border/70 bg-muted/30 px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
        </motion.section>

        <motion.section
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-5 md:grid-cols-2"
        >
          <Card className="border-border/70 bg-background/90">
            <CardHeader className="space-y-3">
              <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Lightbulb className="size-5" />
              </div>
              <CardTitle className="text-xl">The idea behind Sortres</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We use AI to extract structured information from resumes and compare it against job requirements, helping
                recruiters evaluate candidate fit faster and with more consistency.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-background/90">
            <CardHeader className="space-y-3">
              <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Users className="size-5" />
              </div>
              <CardTitle className="text-xl">Our product philosophy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                AI should assist recruiters, not replace them. Sortres is designed to reduce repetitive screening work while
                keeping human judgment at the center of hiring decisions.
              </p>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="rounded-2xl border border-primary/20 bg-linear-to-r from-primary/10 via-background to-cyan-500/10 p-8 md:p-10"
        >
          <div className="flex items-center gap-3">
            <Scale className="size-5 text-primary" />
            <h2 className="text-2xl font-semibold tracking-tight">Responsible AI and transparency</h2>
          </div>
          <p className="mt-4 text-muted-foreground">
            We are transparent about how AI is used in Sortres. Our models help generate scores, summaries, and suggestions,
            but they do not make final hiring decisions. Recruiters stay in control, and every insight is meant to support,
            not replace, professional review.
          </p>
        </motion.section>

        <motion.section
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-5 md:grid-cols-2"
        >
          <Card className="border-border/70 bg-background/90">
            <CardHeader className="space-y-3">
              <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Eye className="size-5" />
              </div>
              <CardTitle className="text-xl">What we are building next</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Our vision is a recruiter workspace where AI handles first-pass analysis and teams focus on conversations,
                context, and final decisions. We are continuously improving insight quality, workflow speed, and usability.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-background/90">
            <CardHeader className="space-y-3">
              <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <HeartHandshake className="size-5" />
              </div>
              <CardTitle className="text-xl">Built with recruiters in mind</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Sortres is shaped by real recruiting workflows. We care about practical outcomes: better shortlists, faster
                turnaround, and a hiring process that feels fair and intentional.
              </p>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="rounded-2xl border border-border/70 bg-background/90 p-8 text-center md:p-10"
        >
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Join us as we shape the future of hiring</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            We are building Sortres to help teams hire with more clarity, speed, and confidence.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/">Try Sortres</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
