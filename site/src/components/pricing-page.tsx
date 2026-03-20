"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_BASE_URL } from "@/lib/urls";

type Plan = {
  name: "Free" | "Pro" | "Team";
  subtitle: string;
  price: string;
  resumesPerMonth: string;
  support: string;
  featured?: boolean;
  features: string[];
  cta: string;
};

const plans: Plan[] = [
  {
    name: "Free",
    subtitle: "Available now during beta",
    price: "$0",
    featured: true,
    resumesPerMonth: "Up to 100 resumes / month",
    support: "Community support",
    features: [
      "AI candidate scoring",
      "Candidate ranking for each role",
      "Basic recruiter insights",
      "3 resume bulk uploads",
      "5 active job role at a time",
    ],
    cta: "Try Free Beta",
  },
  {
    name: "Pro",
    subtitle: "For active recruiters and growing teams (coming soon)",
    price: "$12",
    resumesPerMonth: "Up to 1000 resumes / month",
    support: "Priority email support",
    features: [
      "Everything in Free",
      "Advanced recruiter insights",
      "Strengths and weaknesses analysis",
      "Suggested interview questions",
      "Bulk resume uploads",
      "Up to 10 active job roles",
    ],
    cta: "Pro Plan Waitlist",
  },
  {
    name: "Team",
    subtitle: "For organizations with high hiring volume (coming soon)",
    price: "$24",
    resumesPerMonth: "Up to 2,500 resumes / month",
    support: "Dedicated onboarding + SLA support",
    features: [
      "Everything in Pro",
      "Multi-user access and permissions",
      "Shared hiring pipelines",
      "Team usage analytics",
      "Export candidate summaries",
      "Custom limits and add-ons",
    ],
    cta: "Team Plan Waitlist",
  },
];

const faqItems = [
  {
    question: "How does Sortres pricing work?",
    answer:
      "Pricing is based on resume volume processed each month. Every uploaded resume that is analyzed counts toward your monthly quota.",
  },
  {
    question: "What happens if I exceed my monthly resume limit?",
    answer:
      "You can upgrade your plan anytime or add extra resume credits. We notify you before reaching your cap.",
  },
  {
    question: "Can I switch plans later?",
    answer:
      "Yes. You can upgrade immediately, and downgrades apply from the next billing cycle.",
  },
  {
    question: "Do you offer annual billing?",
    answer:
      "Yes. Annual plans include a discount compared to monthly billing for Pro and Team.",
  },
];

const container = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

export default function PricingPage() {
  const [betaNotice, setBetaNotice] = useState<string | null>(null);
  const [showFreeBetaLink, setShowFreeBetaLink] = useState(false);

  const handlePlanClick = (planName: Plan["name"]) => {
    if (planName === "Free") {
      setShowFreeBetaLink(true);
      setBetaNotice(
        "Sortres is currently in beta. Only the Free tier is live today. You can start now at app.sortres.com."
      );
      return;
    }

    setShowFreeBetaLink(true);
    setBetaNotice(
      "Sortres is currently in beta and not fully launched. Pro and Team plans are not yet available. You can try the Free tier for now."
    );
  };

  return (
    <main className="relative overflow-hidden px-6 py-16 md:px-10">
      <div className="pointer-events-none absolute -top-20 -left-12 size-72 rounded-full bg-blue-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -top-16 -right-8 size-72 rounded-full bg-cyan-400/20 blur-3xl" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-14">
        <motion.section variants={container} initial="hidden" animate="show" className="space-y-5 text-center">
          <Badge variant="outline" className="mx-auto gap-1.5">
            <Sparkles className="size-3.5" />
            Straightforward pricing
          </Badge>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Scale hiring faster with AI resume screening
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground sm:text-lg">
            Sortres is in beta. Start with the Free tier today, with Pro and Team plans launching soon.
          </p>
        </motion.section>

        {betaNotice ? (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/30 dark:text-amber-200"
          >
            <p className="font-medium">Beta availability update</p>
            <p className="mt-1">{betaNotice}</p>
            {showFreeBetaLink ? (
              <div className="mt-3">
                <Button size="sm" asChild>
                  <Link href={APP_BASE_URL}>Continue to Free Beta</Link>
                </Button>
              </div>
            ) : null}
          </motion.div>
        ) : null}

        <motion.section
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-6 lg:grid-cols-3"
        >
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={
                plan.featured
                  ? "flex h-full flex-col border-primary/50 bg-linear-to-b from-primary/5 to-transparent shadow-lg"
                  : "flex h-full flex-col border-border/80 bg-background/90"
              }
            >
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  {plan.featured ? <Badge>Most Popular</Badge> : null}
                </div>
                <p className="text-sm text-muted-foreground">{plan.subtitle}</p>
                <div className="flex items-end gap-2">
                  <p className="text-3xl font-semibold">{plan.price}</p>
                  <p className="pb-1 text-sm text-muted-foreground">/month</p>
                </div>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col space-y-5">
                <div className="space-y-1 rounded-lg border border-border/70 bg-muted/30 p-3 text-sm">
                  <p className="font-medium">{plan.resumesPerMonth}</p>
                  <p className="text-muted-foreground">{plan.support}</p>
                </div>

                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 size-4 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className={plan.name === "Free" ? "pt-8" : "pt-6"}>
                <Button
                  className="w-full"
                  variant={plan.featured ? "default" : "outline"}
                  size="lg"
                  onClick={() => handlePlanClick(plan.name)}
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </motion.section>

        <motion.section
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="rounded-2xl border border-border/70 bg-background/80 p-7 md:p-10"
        >
          <h2 className="text-2xl font-semibold tracking-tight">How pricing works</h2>
          <p className="mt-3 text-muted-foreground">
            Sortres uses usage-based tiers based on resumes processed monthly. Each analyzed resume counts as one credit.
            Your plan includes a monthly credit allowance, and you can upgrade or add credits as hiring demand changes.
          </p>
        </motion.section>

        <motion.section variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
          <h2 className="text-center text-2xl font-semibold tracking-tight">Billing FAQ</h2>
          <Card className="mx-auto mt-6 max-w-3xl border-border/70 bg-background/90">
            <CardContent className="pt-4">
              <Accordion type="single" collapsible>
                {faqItems.map((item) => (
                  <AccordionItem key={item.question} value={item.question}>
                    <AccordionTrigger>{item.question}</AccordionTrigger>
                    <AccordionContent>{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="rounded-2xl border border-primary/20 bg-linear-to-r from-primary/10 via-background to-cyan-500/10 p-8 text-center md:p-10"
        >
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Start screening smarter with Sortres</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Try free beta access today and move from manual screening to AI-powered shortlists in minutes.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href={APP_BASE_URL}>Try Free Beta</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">Talk to Sales</Link>
            </Button>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
