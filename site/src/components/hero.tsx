"use client";

import { motion } from "framer-motion";
import { PlayCircle, Sparkles, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const reveal = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" as const },
  viewport: { once: true, amount: 0.25 },
};

export default function Hero() {
  return (
    <section id="hero-section" className="relative px-6 pt-24 md:px-10 md:pt-28">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-2">
        <motion.div {...reveal} className="relative z-10 space-y-6">
          <div className="inline-flex items-center rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur-md">
            AI Resume Screening Platform
          </div>
          <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-balance text-4xl font-semibold tracking-tight text-transparent sm:text-5xl lg:text-6xl">
            Screen hundreds of resumes in minutes with AI
          </h1>
          <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
            Upload resumes, instantly rank candidates, and get recruiter-ready insights.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transition-transform duration-300 hover:scale-105 hover:from-blue-500 hover:to-purple-500"
            >
              Join Beta
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
              <PlayCircle className="size-4" />
              Explore Workflow
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">Built for recruiters and hiring teams</p>
        </motion.div>

        <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.1 }} className="relative z-10">
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-blue-500/15 to-purple-500/15 blur-3xl" />
          <motion.div
            className="pointer-events-none absolute -left-4 top-10 size-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 opacity-70 blur-[1px]"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />
          <motion.div
            className="pointer-events-none absolute right-6 -top-3 size-3 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 opacity-70 blur-[1px]"
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 2.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.35 }}
          />
          <motion.div
            className="pointer-events-none absolute -bottom-2 right-12 size-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 opacity-60 blur-[1px]"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.15 }}
          />

          <Card className="border border-white/60 bg-white/60 shadow-lg backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-lg">Workflow Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-white/50 bg-white/70 p-4 backdrop-blur-sm">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <UploadCloud className="size-4 text-primary" />
                  Upload Resumes
                </div>
                <p className="text-sm text-muted-foreground">132 resumes processed</p>
              </div>

              <div className="rounded-lg border border-white/50 bg-white/70 p-4 backdrop-blur-sm">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Sparkles className="size-4 text-primary" />
                  AI Candidate Ranking
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
                    <span>Alex Morgan</span>
                    <span className="font-medium text-foreground">92</span>
                  </div>
                  <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
                    <span>Sam Patel</span>
                    <span className="font-medium text-foreground">89</span>
                  </div>
                  <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
                    <span>Jordan Lee</span>
                    <span className="font-medium text-foreground">86</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

