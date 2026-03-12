"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Link from "next/link";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const faqItems = [
  {
    value: "what-does-sortres-do",
    question: "What does Sortres do?",
    answer:
      "Sortres helps recruiters screen resumes faster by analyzing resumes against a job description and generating ranked, structured candidate insights.",
  },
  {
    value: "does-ai-make-hiring-decisions",
    question: "Does the AI make hiring decisions?",
    answer:
      "No. AI helps prioritize and summarize candidates, while final hiring decisions remain with your team.",
  },
  {
    value: "types-of-resumes-supported",
    question: "What types of resumes are supported?",
    answer:
      "Sortres currently supports PDF resume uploads for analysis and candidate scoring.",
  },
  {
    value: "how-is-data-handled",
    question: "How is candidate data handled?",
    answer:
      "Candidate data is processed securely with restricted access and privacy-focused handling for resumes and job descriptions.",
  },
  {
    value: "can-i-delete-resumes",
    question: "Can I delete resumes?",
    answer:
      "Yes. You can delete uploaded resumes and candidate records based on your retention and compliance requirements.",
  },
  {
    value: "how-accurate-insights",
    question: "How accurate are AI insights?",
    answer:
      "AI insights are designed to support faster screening, but they are not perfect. Recruiters should review results and apply human judgment.",
  },
  {
    value: "is-there-a-free-plan",
    question: "Is there a free plan?",
    answer:
      "Yes. Sortres offers a Free plan for smaller hiring workflows, with paid plans for higher volume and advanced needs.",
  },
  {
    value: "how-many-resumes",
    question: "How many resumes can I upload?",
    answer:
      "Upload limits depend on your plan. Free, Pro, and Team tiers each include different monthly resume processing limits.",
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

export default function FAQPage() {
  return (
    <main className="relative overflow-hidden px-6 py-16 md:px-10">
      <div className="pointer-events-none absolute -top-20 -left-10 size-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -top-16 right-0 size-72 rounded-full bg-blue-400/20 blur-3xl" />

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
        <motion.section variants={reveal} initial="hidden" animate="show" className="space-y-5 text-center">
          <Badge variant="outline" className="mx-auto gap-1.5">
            <Sparkles className="size-3.5" />
            Frequently Asked Questions
          </Badge>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">FAQ for recruiting teams</h1>
          <p className="mx-auto max-w-2xl text-muted-foreground sm:text-lg">
            Quick answers about how Sortres works, how AI insights are used, and how candidate data is handled.
          </p>
        </motion.section>

        <motion.section variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
          <Card className="border-border/70 bg-background/90">
            <CardContent className="pt-4">
              <Accordion type="single" collapsible>
                {faqItems.map((item) => (
                  <AccordionItem key={item.value} value={item.value}>
                    <AccordionTrigger className="text-base">{item.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="rounded-2xl border border-primary/20 bg-linear-to-r from-primary/10 via-background to-cyan-500/10 p-8 text-center"
        >
          <h2 className="text-2xl font-semibold tracking-tight">Need a specific answer?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Reach out and we can help with plan selection, data questions, or workflow setup.
          </p>
          <div className="mt-6 flex justify-center">
            <Button asChild>
              <Link href="/contact">Contact Sortres</Link>
            </Button>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
