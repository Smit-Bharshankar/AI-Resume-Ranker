"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Cloud, Database, Lock, Scale, ShieldCheck, Sparkles } from "lucide-react";
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

export default function SecurityPage() {
  return (
    <main className="relative overflow-hidden px-6 py-16 md:px-10">
      <div className="pointer-events-none absolute -top-20 -left-10 size-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -top-16 right-0 size-72 rounded-full bg-blue-400/20 blur-3xl" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12">
        <motion.section variants={reveal} initial="hidden" animate="show" className="space-y-5 text-center">
          <Badge variant="outline" className="mx-auto gap-1.5">
            <Sparkles className="size-3.5" />
            Security & Trust
          </Badge>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Built to protect candidate data and support responsible hiring
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground sm:text-lg">
            Sortres handles resumes and job descriptions with care, using security best practices and transparent AI
            workflows.
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
                <Lock className="size-5" />
              </div>
              <CardTitle className="text-xl">Data Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Resume and job description data is stored securely, and access is limited to authorized systems and team
                members who need it to operate the product.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-background/90">
            <CardHeader className="space-y-3">
              <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Database className="size-5" />
              </div>
              <CardTitle className="text-xl">Data Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                You control the resumes and job data you upload. You can remove candidate records and uploaded files at any
                time based on your internal policies and workflow needs.
              </p>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="rounded-2xl border border-border/70 bg-background/90 p-8 md:p-10"
        >
          <div className="flex items-center gap-3">
            <Cloud className="size-5 text-primary" />
            <h2 className="text-2xl font-semibold tracking-tight">Infrastructure</h2>
          </div>
          <p className="mt-4 text-muted-foreground">
            Sortres runs on secure cloud infrastructure and follows modern web security practices, including encrypted
            traffic over HTTPS and controlled access to production services.
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
            <ShieldCheck className="size-5 text-primary" />
            <h2 className="text-2xl font-semibold tracking-tight">AI Processing Transparency</h2>
          </div>
          <p className="mt-4 text-muted-foreground">
            AI models are used to analyze resumes and job descriptions to generate recruiter insights such as summaries,
            strengths, weaknesses, scoring, and interview question suggestions.
          </p>
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
            <h2 className="text-2xl font-semibold tracking-tight">Responsible Use</h2>
          </div>
          <p className="mt-4 text-muted-foreground">
            Sortres is designed to assist screening workflows, not make hiring decisions. Recruiters and hiring teams
            remain responsible for final evaluation, interviews, and selection outcomes.
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
            <AlertTriangle className="size-5 text-primary" />
            <h2 className="text-2xl font-semibold tracking-tight">Reporting Security Issues</h2>
          </div>
          <p className="mt-4 text-muted-foreground">
            If you discover a security concern, please report it to us at <strong>security@yourdomain.com</strong> with
            relevant details. We review reports promptly and work to address confirmed issues as quickly as possible.
          </p>
          <div className="mt-6">
            <Button asChild variant="outline">
              <Link href="/contact">Contact the Sortres Team</Link>
            </Button>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
