"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";

type Candidate = {
  id: string;
  name: string;
  score: number;
};

const initialCandidates: Candidate[] = [
  { id: "john", name: "John Anderson", score: 72 },
  { id: "sarah", name: "Sarah Chen", score: 81 },
  { id: "michael", name: "Michael Patel", score: 65 },
  { id: "emma", name: "Emma Rodriguez", score: 88 },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function CandidateRankingDemo() {
  const [candidates, setCandidates] = useState(initialCandidates);

  useEffect(() => {
    const interval = setInterval(() => {
      setCandidates((prev) =>
        prev
          .map((candidate) => ({
            ...candidate,
            score: clamp(candidate.score + Math.floor(Math.random() * 9) - 3, 55, 96),
          }))
          .sort((a, b) => b.score - a.score),
      );
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  const ranked = useMemo(() => [...candidates].sort((a, b) => b.score - a.score), [candidates]);

  return (
    <div className="rounded-2xl border border-border/70 bg-background/75 p-5 shadow-lg backdrop-blur-md">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Live candidate ordering</h3>
        <Badge className="brand-bg-gradient text-white">AI Ranking Demo</Badge>
      </div>

      <motion.ol layout className="space-y-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {ranked.map((candidate, index) => (
            <motion.li
              key={candidate.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.7 }}
              className="rounded-xl border border-border/70 bg-background/80 p-3"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex size-6 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium">{candidate.name}</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{candidate.score}%</span>
              </div>

              <div className="h-2 rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full brand-bg-gradient"
                  initial={false}
                  animate={{ width: `${candidate.score}%` }}
                  transition={{ duration: 0.55, ease: "easeOut" }}
                />
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ol>
    </div>
  );
}
