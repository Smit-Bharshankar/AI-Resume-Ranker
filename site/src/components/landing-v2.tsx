"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import FAQ from "@/components/faq";
import { Button } from "@/components/ui/button";
import { APP_BASE_URL, APP_LOGIN_URL } from "@/lib/urls";

type DemoState = "upload" | "match" | "rank";

const proofItems = [
  "Used by fast-scaling hiring teams",
  "Shortlist in minutes, not days",
  "Structured scoring with human control",
];

const flowSteps = [
  { title: "Define Role", description: "Paste JD and success criteria." },
  { title: "Ingest Resumes", description: "Bulk upload with auto parsing." },
  { title: "Score & Explain", description: "Fit scores with rationale." },
  { title: "Shortlist Faster", description: "Take action with confidence." },
];

const featureBlocks = [
  {
    title: "Structured Candidate Intelligence",
    body: "Turn noisy resumes into consistent skill, experience, and role signals your team can trust.",
    points: ["Context-aware extraction", "Recruiter-friendly summaries", "Bias-awareness controls"],
  },
  {
    title: "Ranking That Is Transparent",
    body: "Every score is backed by explainable evidence, so teams align quickly and avoid black-box decisions.",
    points: ["Evidence-linked scores", "Side-by-side comparisons", "Human override always available"],
  },
  {
    title: "Operational Speed At Scale",
    body: "Handle high-volume hiring workflows without adding recruiter headcount or sacrificing quality.",
    points: ["Bulk pipeline processing", "Reusable hiring templates", "Faster interview handoffs"],
  },
];

function FeatureProofWidget({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="h-44 rounded-xl border border-border/70 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--brand-accent)_14%,transparent),transparent_55%)] p-4 dark:bg-[linear-gradient(135deg,color-mix(in_srgb,var(--brand-accent-strong)_34%,#0a0a0a),rgba(10,10,10,0.6)_60%)]">
        <div className="grid h-full grid-cols-2 gap-2">
          <div className="rounded-lg border border-border/70 bg-background/90 p-2.5">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Resume Parsed</p>
            <p className="mt-1 text-sm font-semibold">94% complete</p>
            <p className="mt-1 text-[11px] text-muted-foreground">17 skills, 6 years exp</p>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/80 p-2.5">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Signal Quality</p>
            <p className="mt-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">High Confidence</p>
            <p className="mt-1 text-[11px] text-muted-foreground">2 ambiguity flags</p>
          </div>
          <div className="col-span-2 rounded-lg border border-border/70 bg-background/95 p-2.5">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Normalized Profile</p>
            <div className="mt-1.5 space-y-1 text-[11px] text-muted-foreground">
              <p>skills: React, Node, SQL, Hiring Ops</p>
              <p>industry: SaaS | location: Remote</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="h-44 rounded-xl border border-border/70 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--brand-accent)_14%,transparent),transparent_55%)] p-4 dark:bg-[linear-gradient(135deg,color-mix(in_srgb,var(--brand-accent-strong)_34%,#0a0a0a),rgba(10,10,10,0.6)_60%)]">
        <div className="grid h-full grid-cols-2 gap-2">
          <div className="rounded-lg border border-border/70 bg-background/90 p-2.5">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Fit Breakdown</p>
            <div className="mt-1.5 space-y-1 text-[11px] text-muted-foreground">
              <p>Skills: 40%</p>
              <p>Experience: 35%</p>
              <p>Domain: 25%</p>
            </div>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/80 p-2.5">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Why This Score</p>
            <div className="mt-1.5 space-y-1 text-[11px] text-muted-foreground">
              <p>+ Relevant stack match</p>
              <p>+ Team leadership history</p>
              <p>- Limited fintech exposure</p>
            </div>
          </div>
          <div className="col-span-2 rounded-lg border border-border/70 bg-background/95 p-2.5">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Candidate Compare</p>
            <div className="mt-1.5 grid grid-cols-3 text-[11px]">
              <p className="text-muted-foreground">Alex 92</p>
              <p className="text-center text-muted-foreground">vs</p>
              <p className="text-right text-muted-foreground">Sam 89</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-44 rounded-xl border border-border/70 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--brand-accent)_14%,transparent),transparent_55%)] p-4 dark:bg-[linear-gradient(135deg,color-mix(in_srgb,var(--brand-accent-strong)_34%,#0a0a0a),rgba(10,10,10,0.6)_60%)]">
      <div className="grid h-full grid-cols-2 gap-2">
        <div className="rounded-lg border border-border/70 bg-background/90 p-2.5">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Throughput</p>
          <p className="mt-1 text-sm font-semibold">+132/hr</p>
          <p className="mt-1 text-[11px] text-muted-foreground">parallel processing</p>
        </div>
        <div className="rounded-lg border border-border/70 bg-background/80 p-2.5">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Queue Health</p>
          <p className="mt-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">Stable</p>
          <p className="mt-1 text-[11px] text-muted-foreground">12 pending / 76 done</p>
        </div>
        <div className="col-span-2 rounded-lg border border-border/70 bg-background/95 p-2.5">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Time Saved</p>
          <div className="mt-2 flex items-end gap-1.5">
            {[26, 35, 52, 48, 67, 72, 81].map((v, i) => (
              <div key={i} className="w-4 rounded-sm bg-[color-mix(in_srgb,var(--brand-accent)_70%,transparent)]" style={{ height: `${v / 2}px` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SignalCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || reduceMotion) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mobile = window.innerWidth < 768;
    const particleCount = mobile ? 20 : 36;

    const rootStyles = getComputedStyle(document.documentElement);
    const accent = rootStyles.getPropertyValue("--brand-accent").trim() || "#d42b55";
    const accentStrong = rootStyles.getPropertyValue("--brand-accent-strong").trim() || "#7f1a33";

    const hexToRgba = (hex: string, alpha: number) => {
      const normalized = hex.replace("#", "");
      if (normalized.length !== 6) return `rgba(212,43,85,${alpha})`;
      const r = parseInt(normalized.slice(0, 2), 16);
      const g = parseInt(normalized.slice(2, 4), 16);
      const b = parseInt(normalized.slice(4, 6), 16);
      return `rgba(${r},${g},${b},${alpha})`;
    };

    const dotColor = hexToRgba(accent, 0.45);

    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0018,
      vy: (Math.random() - 0.5) * 0.0018,
      r: Math.random() * 2.2 + 1,
    }));

    let raf = 0;

    const resize = () => {
      const { clientWidth, clientHeight } = canvas;
      canvas.width = Math.floor(clientWidth * dpr);
      canvas.height = Math.floor(clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;

        const px = p.x * w;
        const py = p.y * h;

        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fillStyle = dotColor;
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 0.2) {
            const alpha = (0.2 - dist) * 1.2;
            ctx.beginPath();
            ctx.moveTo(a.x * w, a.y * h);
            ctx.lineTo(b.x * w, b.y * h);
            const isDarkMode = document.documentElement.classList.contains("dark");
            const lineBase = isDarkMode ? "rgba(255,255,255,1)" : "rgba(15,23,42,1)";
            ctx.strokeStyle = lineBase.replace(",1)", `,${Math.max(alpha, 0.08)})`);
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      raf = window.requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [reduceMotion]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}

export default function LandingV2() {
  const reduceMotion = useReducedMotion();
  const [demoState, setDemoState] = useState<DemoState>("upload");
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const commandCenter = useMemo(() => {
    if (demoState === "upload") {
      return {
        title: "Intake in progress",
        summary: "132 resumes parsed and normalized across mixed formats.",
        metricLabel: "Parse confidence",
        metricValue: 94,
        rows: [
          { name: "PDF Resume Batch", value: "48 files", tone: "neutral" },
          { name: "DOCX Resume Batch", value: "62 files", tone: "neutral" },
          { name: "LinkedIn Exports", value: "22 files", tone: "neutral" },
        ],
      };
    }

    if (demoState === "match") {
      return {
        title: "Skill matching active",
        summary: "Top profiles aligned to must-have requirements for this role.",
        metricLabel: "JD alignment",
        metricValue: 87,
        rows: [
          { name: "React + Node Match", value: "96%", tone: "positive" },
          { name: "Leadership Signal", value: "84%", tone: "positive" },
          { name: "Domain Relevance", value: "79%", tone: "warning" },
        ],
      };
    }

    return {
      title: "Shortlist ready",
      summary: "Ranked shortlist prepared with explainable scoring rationale.",
      metricLabel: "Review readiness",
      metricValue: 92,
      rows: [
        { name: "Alex Morgan", value: "92", tone: "positive" },
        { name: "Sam Patel", value: "89", tone: "positive" },
        { name: "Jordan Lee", value: "86", tone: "neutral" },
      ],
    };
  }, [demoState]);

  return (
    <div className="relative overflow-hidden pb-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20 mix-blend-soft-light dark:opacity-25"
        style={{
          backgroundImage: "url('/sm.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_-10%,color-mix(in_srgb,var(--brand-accent)_16%,white),transparent_65%)] dark:bg-[radial-gradient(120%_70%_at_50%_-10%,color-mix(in_srgb,var(--brand-accent-strong)_32%,transparent),transparent_65%)]" />
      <div className="pointer-events-none absolute -left-24 top-40 size-112 rounded-full bg-[color-mix(in_srgb,var(--brand-accent)_22%,transparent)] blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-112 size-112 rounded-full bg-[color-mix(in_srgb,var(--brand-accent-strong)_20%,transparent)] blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-[linear-gradient(to_top,color-mix(in_srgb,var(--brand-accent)_14%,transparent),transparent)] dark:bg-[linear-gradient(to_top,color-mix(in_srgb,var(--brand-accent-strong)_20%,transparent),transparent)]" />
      <section id="hero-section" className="relative px-6 pb-20 pt-28 md:px-10 md:pt-32">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-128 bg-[radial-gradient(85%_60%_at_50%_0%,color-mix(in_srgb,var(--brand-accent)_22%,transparent),transparent)]" />
        <div className="pointer-events-none absolute inset-x-0 top-20 mx-auto h-112 max-w-6xl overflow-hidden rounded-[2rem] opacity-70">
          <SignalCanvas />
        </div>

        <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="space-y-7"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--brand-accent)_26%,var(--border))] bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="size-3.5 text-(--brand-accent)" />
              AI Resume Screening Platform
            </div>

            <h1 className="max-w-2xl text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Build a high-confidence shortlist before your first coffee.
            </h1>

            <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
              Sortres converts unstructured resumes into ranked, explainable candidate insights so hiring teams move faster without losing quality.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="brand-bg-gradient text-white">
                <Link href={APP_BASE_URL}>Start Free Beta</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={APP_LOGIN_URL}>See Live Product</Link>
              </Button>
            </div>

            <div className="grid gap-3 pt-1 sm:grid-cols-3">
              <div className="rounded-xl border border-border/80 bg-background/85 p-3 dark:bg-background/60">
                <p className="text-xl font-semibold tracking-tight">10x</p>
                <p className="text-xs text-muted-foreground">screening speedup</p>
              </div>
              <div className="rounded-xl border border-border/80 bg-background/85 p-3 dark:bg-background/60">
                <p className="text-xl font-semibold tracking-tight">95%</p>
                <p className="text-xs text-muted-foreground">skill extraction accuracy</p>
              </div>
              <div className="rounded-xl border border-border/80 bg-background/85 p-3 dark:bg-background/60">
                <p className="text-xl font-semibold tracking-tight">500+</p>
                <p className="text-xs text-muted-foreground">resumes processed</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: reduceMotion ? 0 : 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: "easeOut" }}
            className="relative"
          >
            <div
              className="rounded-3xl border border-border/70 bg-background/90 p-5 shadow-[0_28px_80px_-36px_rgba(0,0,0,0.55)] backdrop-blur"
              style={{
                transform: `perspective(1200px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
                transformStyle: "preserve-3d",
                transition: "transform 220ms ease-out",
              }}
              onMouseMove={(event) => {
                if (reduceMotion) return;
                const rect = event.currentTarget.getBoundingClientRect();
                const px = (event.clientX - rect.left) / rect.width;
                const py = (event.clientY - rect.top) / rect.height;
                setTilt({ rx: (0.5 - py) * 6, ry: (px - 0.5) * 8 });
              }}
              onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold">Hiring Command Center</p>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:bg-emerald-900/35 dark:text-emerald-300">Live</span>
              </div>

              <div className="mb-4 grid grid-cols-3 gap-2">
                {(["upload", "match", "rank"] as DemoState[]).map((state) => (
                  <button
                    key={state}
                    type="button"
                    onClick={() => setDemoState(state)}
                    className={`rounded-lg border px-2 py-2 text-xs font-medium transition ${
                      demoState === state
                        ? "border-(--brand-accent) bg-[color-mix(in_srgb,var(--brand-accent)_14%,transparent)] text-foreground"
                        : "border-border/80 bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {state === "upload" ? "Upload" : state === "match" ? "Match" : "Rank"}
                  </button>
                ))}
              </div>

              <div className="space-y-3 rounded-2xl border border-border/70 bg-muted/25 p-4">
                <motion.div
                  key={`${demoState}-header`}
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <p className="text-sm font-semibold">{commandCenter.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{commandCenter.summary}</p>
                </motion.div>

                <motion.div
                  key={`${demoState}-metric`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-lg border border-border/70 bg-background/75 p-2.5"
                >
                  <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{commandCenter.metricLabel}</span>
                    <span className="font-medium text-foreground">{commandCenter.metricValue}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      key={`${demoState}-bar`}
                      className="h-full rounded-full bg-[linear-gradient(to_right,var(--brand-gradient-start),var(--brand-gradient-end))]"
                      initial={{ width: 0 }}
                      animate={{ width: `${commandCenter.metricValue}%` }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>

                <div className="space-y-2">
                  {commandCenter.rows.map((row, i) => (
                    <motion.div
                      key={`${demoState}-${row.name}`}
                      className="flex items-center justify-between rounded-lg border border-border/70 bg-background px-3 py-2"
                      initial={{ opacity: 0, x: reduceMotion ? 0 : -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.3 }}
                    >
                      <span className="text-sm">{row.name}</span>
                      <span
                        className={`text-sm font-semibold ${
                          row.tone === "positive"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : row.tone === "warning"
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-foreground"
                        }`}
                      >
                        {row.value}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-6 md:px-10">
        <div className="mx-auto grid w-full max-w-6xl gap-3 rounded-2xl border border-border/80 bg-background/85 p-5 dark:bg-background/60 md:grid-cols-3">
          {proofItems.map((item) => (
            <p key={item} className="text-sm text-muted-foreground">
              <span className="mr-2 text-(--brand-accent)">•</span>
              {item}
            </p>
          ))}
        </div>
      </section>

      <section className="px-6 pt-20 md:px-10">
        <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-red-200/70 bg-red-50/70 p-6 dark:border-red-900/40 dark:bg-red-950/20">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Without structure</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>Manual screening across scattered resume formats</li>
              <li>Inconsistent candidate comparisons between recruiters</li>
              <li>Strong applicants missed in high-volume pipelines</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/70 p-6 dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">With Sortres</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>Role-specific fit scoring with evidence</li>
              <li>Consistent ranking criteria across the hiring team</li>
              <li>Faster shortlists with clearer recruiter decisions</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="px-6 pt-20 md:px-10">
        <div className="mx-auto w-full max-w-6xl">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">How teams move from backlog to shortlist</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {flowSteps.map((step, index) => (
            <div key={step.title} className="relative rounded-xl border border-border/80 bg-background/85 p-4 dark:bg-background/60">
                <div className="mb-3 inline-flex size-7 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--brand-accent)_18%,transparent)] text-sm font-semibold text-foreground">
                  {index + 1}
                </div>
                <h3 className="text-base font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pt-20 md:px-10">
        <div className="mx-auto w-full max-w-6xl space-y-6">
          {featureBlocks.map((feature, index) => (
            <div className="grid gap-5 rounded-2xl border border-border/80 bg-background/85 p-6 dark:bg-background/60 lg:grid-cols-2 lg:items-center" key={feature.title}>
              <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                <h3 className="text-2xl font-semibold tracking-tight">{feature.title}</h3>
                <p className="mt-3 max-w-xl text-muted-foreground">{feature.body}</p>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {feature.points.map((point) => (
                    <li key={point} className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-(--brand-accent)" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                <FeatureProofWidget index={index} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pt-20 md:px-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 rounded-2xl border border-border/80 bg-background/85 p-6 dark:bg-background/60 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ShieldCheck className="size-4 text-(--brand-accent)" />
              Security and data handling first
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">Built for modern hiring ops and privacy expectations.</h3>
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/security">Review Security</Link>
          </Button>
        </div>
      </section>

      <section className="px-6 pt-20 md:px-10">
        <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-3xl border border-border/80 bg-background/85 p-8 text-foreground shadow-lg dark:bg-background/60 sm:p-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-30 mix-blend-soft-light dark:opacity-35"
          />
          <div className="grid items-center gap-6 md:grid-cols-2">
            <div className="relative z-10 text-left">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Your next shortlist can be ready today.</h2>
              <p className="mt-3 max-w-xl text-muted-foreground dark:text-slate-300">
                Cut manual screening overhead and give recruiters a clearer path from resume pile to interview plan.
              </p>
            </div>
            <div className="relative z-10">
              <Button asChild size="lg" className="h-12 w-full">
                <Link href={APP_BASE_URL} className="inline-flex items-center justify-center gap-2">
                  Start Free Beta
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="mt-3 h-12 w-full border-border/80 bg-background/70 text-foreground hover:bg-background dark:bg-background/40 dark:hover:bg-background/55">
                <Link href="/features" className="inline-flex items-center gap-2">
                  Explore Features
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="pt-16">
        <FAQ />
      </div>
    </div>
  );
}
