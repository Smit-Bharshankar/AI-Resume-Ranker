"use client";

import { motion } from "framer-motion";
import { Braces, FileText, Link2, Network, Sparkles, Upload } from "lucide-react";
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

export default function IntegrationsPage() {
  return (
    <main className="relative overflow-hidden px-6 py-16 md:px-10">
      <div className="pointer-events-none absolute -top-20 -left-10 size-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -top-16 right-0 size-72 rounded-full bg-blue-400/20 blur-3xl" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12">
        <motion.section variants={reveal} initial="hidden" animate="show" className="space-y-5 text-center">
          <Badge variant="outline" className="mx-auto gap-1.5">
            <Sparkles className="size-3.5" />
            Integrations
          </Badge>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Connect Sortres with the way your team already hires
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground sm:text-lg">
            Today, Sortres supports direct resume and job input. As the product grows, deeper recruiting integrations are
            planned.
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
                <Upload className="size-5" />
              </div>
              <CardTitle className="text-xl">Resume Upload and File Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Recruiters can upload resumes directly into Sortres in PDF format. The platform processes each file to
                extract candidate information and generate screening insights.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-background/90">
            <CardHeader className="space-y-3">
              <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <FileText className="size-5" />
              </div>
              <CardTitle className="text-xl">Job Description Input</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Job descriptions can be pasted directly into the platform, allowing recruiters to quickly define role
                requirements before scoring and ranking candidates.
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
            <Network className="size-5 text-primary" />
            <h2 className="text-2xl font-semibold tracking-tight">Future Integrations</h2>
          </div>
          <p className="mt-4 text-muted-foreground">
            We are exploring integrations with applicant tracking systems (ATS) and recruiting tools so teams can move
            candidate data between systems with fewer manual steps. These integrations are not fully available yet, but they
            are a key part of the roadmap.
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
            <Braces className="size-5 text-primary" />
            <h2 className="text-2xl font-semibold tracking-tight">API Access (Future)</h2>
          </div>
          <p className="mt-4 text-muted-foreground">
            API capabilities may be available in the future for teams that want custom workflows, system-to-system
            automation, or embedded screening experiences.
          </p>
        </motion.section>

        <motion.section
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="rounded-2xl border border-border/70 bg-background/90 p-8 text-center md:p-10"
        >
          <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Link2 className="size-5" />
          </div>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
            Want a specific integration?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Tell us which ATS or recruiting stack your team uses, and we can prioritize what to build next.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/contact">Request an Integration</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/features">Explore Features</Link>
            </Button>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
