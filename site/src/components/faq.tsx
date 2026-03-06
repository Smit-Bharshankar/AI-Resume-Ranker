"use client";

import { motion } from "framer-motion";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const items = [
  {
    value: "item-1",
    question: "Does AI make hiring decisions?",
    answer:
      "No. AI helps prioritize and summarize candidates, while final hiring decisions remain with your team.",
  },
  {
    value: "item-2",
    question: "How is candidate data handled?",
    answer:
      "Candidate data is processed securely with controlled access and privacy-first handling across your workspace.",
  },
  {
    value: "item-3",
    question: "Can I delete candidate data?",
    answer:
      "Yes. You can request or trigger data deletion workflows for candidate records according to your retention needs.",
  },
];

export default function FAQ() {
  return (
    <section className="px-6 mb-2 md:px-10">
      <div className="mx-auto w-full max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.25 }}
          className="mb-8 text-center"
        >
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">FAQ</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <Accordion type="single" collapsible className="rounded-xl border border-border/70 px-5">
            {items.map((item) => (
              <AccordionItem key={item.value} value={item.value}>
                <AccordionTrigger className="text-base">{item.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}

