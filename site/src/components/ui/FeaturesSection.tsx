"use client";

import { motion } from "framer-motion";

const previewViewport = { once: false, amount: 0.35 };
const previewShellClassName =
  "h-56 rounded-lg bg-white/80 p-4 pt-10 [mask-image:linear-gradient(to_bottom,black_0%,black_84%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_84%,transparent_100%)] dark:bg-neutral-900/80 sm:h-60";

const ResumeStructuringPreview = () => {
  return (
    <div className="flex scale-110 origin-center items-center justify-between gap-5">
      <motion.div className="flex-1">
        <div className="relative rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950">
          <div className="mb-3 border-b border-neutral-200 pb-2 dark:border-neutral-800">
            <motion.div
              className="h-2 w-20 rounded bg-neutral-300"
              whileInView={{ opacity: [0.6, 0.4, 0.6] }}
              viewport={previewViewport}
              transition={{ duration: 2.4, repeat: Infinity }}
            />
          </div>

          <div className="space-y-2">
            <motion.svg
              width="100%"
              height="32"
              viewBox="0 0 100 32"
              whileInView={{ opacity: [0.5, 0.7, 0.5] }}
              viewport={previewViewport}
              transition={{ duration: 2.4, repeat: Infinity }}
            >
              <path
                d="M 0,16 Q 10,10 20,16 T 40,16 T 60,16 T 80,16 T 100,16"
                stroke="url(#grad1)"
                strokeWidth="2"
                fill="none"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M 0,22 Q 15,18 30,22 T 60,22 T 90,22"
                stroke="url(#grad2)"
                strokeWidth="1.5"
                fill="none"
                vectorEffect="non-scaling-stroke"
              />
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgb(229, 231, 235)" />
                  <stop offset="100%" stopColor="rgb(209, 213, 219)" />
                </linearGradient>
                <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgb(229, 231, 235)" />
                  <stop offset="100%" stopColor="rgb(209, 213, 219)" />
                </linearGradient>
              </defs>
            </motion.svg>
          </div>
        </div>
        <p className="mt-2 text-center text-xs text-neutral-400 dark:text-neutral-500">
          Unstructured Resume
        </p>
      </motion.div>

      <motion.div
        className="flex items-center gap-1"
        whileInView={{ x: [0, 4, 0] }}
        viewport={previewViewport}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="h-px w-3 bg-red-300" />
        <div className="h-2 w-2 rounded-full bg-red-500" />
        <div className="h-px w-3 bg-red-300" />
      </motion.div>

      <motion.div
        className="flex-1 space-y-2"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={previewViewport}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        {["Skills", "Experience", "Role History"].map((label, index) => (
          <motion.div
            key={label}
            initial={{ y: 10, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={previewViewport}
            transition={{ delay: 0.5 + index * 0.15, duration: 0.5 }}
            className="rounded-lg bg-white p-2.5 dark:bg-neutral-950"
          >
            <p className="text-xs font-semibold text-red-600">{label}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

const BulkProcessingPreview = () => {
  return (
    <div className="flex h-full flex-col justify-between overflow-hidden">
      <div className="rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              className="h-3 w-3 rounded-full border border-amber-300 bg-amber-100"
              whileInView={{ scale: [1, 1.06, 1] }}
              viewport={previewViewport}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
            <div>
              <p className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-200">
                Batch Upload
              </p>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                Processing resumes in parallel
              </p>
            </div>
          </div>

          <motion.div
            className="rounded-md bg-emerald-50 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-emerald-700"
            whileInView={{ opacity: [0.65, 1, 0.65] }}
            viewport={previewViewport}
            transition={{ duration: 1.6, repeat: Infinity }}
          >
            Live
          </motion.div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {["PDF 1", "PDF 2", "PDF 3"].map((file, index) => (
            <motion.div
              key={file}
              className="rounded-lg bg-neutral-50 p-2 dark:bg-neutral-900"
              initial={{ y: 8, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={previewViewport}
              transition={{ delay: 0.18 + index * 0.12, duration: 0.35 }}
            >
              <div className="rounded-md border border-dashed border-neutral-300 bg-white px-2 py-3 text-center dark:border-neutral-700 dark:bg-neutral-950">
                <div className="text-[10px] font-semibold text-neutral-600 dark:text-neutral-300">
                  {file}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-3 rounded-xl bg-neutral-50 p-2.5 dark:bg-neutral-900"
          whileInView={{ opacity: [0.75, 1, 0.75] }}
          viewport={previewViewport}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-neutral-100 dark:bg-neutral-800">
              <div className="h-2 w-2 rounded-full bg-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-medium text-neutral-600 dark:text-neutral-300">
                Analysing files
              </p>
              <div className="mt-2 flex gap-1">
                {[0, 1, 2, 3, 4].map((dot) => (
                  <motion.div
                    key={dot}
                    className={`h-1.5 w-1.5 rounded-full ${
                      dot === 2
                        ? "bg-neutral-500 dark:bg-neutral-400"
                        : "bg-neutral-300 dark:bg-neutral-600"
                    }`}
                    whileInView={{ opacity: [0.25, 1, 0.25] }}
                    viewport={previewViewport}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: dot * 0.12,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          { value: "Parsed", label: "Status" },
          { value: "Queued", label: "Pipeline" },
          { value: "Ready", label: "Output" },
        ].map((item, index) => (
          <motion.div
            key={item.label}
            className="rounded-xl bg-white p-2.5 text-center dark:bg-neutral-950"
            initial={{ y: 8, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={previewViewport}
            transition={{ delay: 0.55 + index * 0.08, duration: 0.3 }}
          >
            <p className="text-[12px] font-semibold text-neutral-800 dark:text-neutral-100">
              {item.value}
            </p>
            <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.14em] text-neutral-400 dark:text-neutral-500">
              {item.label}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const RecruiterInsightsPreview = () => {
  return (
    <div className="flex h-full flex-col justify-between overflow-hidden">
      <div className="rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400 dark:text-neutral-500">
              Insight Snapshot
            </p>
            <div className="mt-2 flex items-center gap-2">
              <motion.div
                className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-[10px] font-semibold text-emerald-700"
                whileInView={{ scale: [1, 1.05, 1] }}
                viewport={previewViewport}
                transition={{ duration: 1.8, repeat: Infinity }}
              >
                RS
              </motion.div>
              <div>
                <div className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-200">
                  Candidate Profile
                </div>
                <div className="text-[10px] text-neutral-500 dark:text-neutral-400">
                  Customer Success Lead
                </div>
              </div>
            </div>
          </div>

          <motion.div
            className="rounded-md bg-amber-50 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-amber-700"
            whileInView={{ y: [0, -2, 0] }}
            viewport={previewViewport}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Review
          </motion.div>
        </div>

        <div className="mt-4 rounded-xl bg-neutral-50 p-3 dark:bg-neutral-900">
          <div className="flex items-start gap-2">
            <motion.div
              className="mt-0.5 h-2 w-2 rounded-full bg-red-400"
              whileInView={{ scale: [1, 1.2, 1] }}
              viewport={previewViewport}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
            <div className="flex-1">
              <p className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-200">
                Strong communication and product thinking
              </p>
              <motion.div
                className="mt-2 h-2 w-full rounded bg-neutral-200 dark:bg-neutral-800"
                whileInView={{ opacity: [0.45, 0.75, 0.45] }}
                viewport={previewViewport}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="mt-1.5 h-2 w-5/6 rounded bg-neutral-200 dark:bg-neutral-800"
                whileInView={{ opacity: [0.45, 0.75, 0.45] }}
                viewport={previewViewport}
                transition={{ duration: 2, repeat: Infinity, delay: 0.12 }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {[
          {
            label: "Strength",
            dotClassName: "bg-emerald-500",
            text: "Clear ownership in cross-functional launches.",
          },
          {
            label: "Watchout",
            dotClassName: "bg-amber-500",
            text: "Needs deeper platform-scale experience.",
          },
        ].map((item, index) => (
          <motion.div
            key={item.label}
            className="rounded-xl bg-white p-3 dark:bg-neutral-950"
            initial={{ y: 8, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={previewViewport}
            transition={{ delay: 0.25 + index * 0.13, duration: 0.4 }}
          >
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${item.dotClassName}`} />
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
                {item.label}
              </p>
            </div>
            <p className="mt-2 text-[11px] leading-4 text-neutral-700 dark:text-neutral-300">
              {item.text}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const InterviewQuestionSuggestionsPreview = () => {
  return (
    <div className="flex h-full flex-col justify-between overflow-hidden">
      <div className="rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              className="flex h-8 w-8 items-center justify-center rounded-md bg-red-50 text-sm font-semibold text-red-600"
              whileInView={{ rotate: [0, -8, 0] }}
              viewport={previewViewport}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ?
            </motion.div>
            <div>
              <p className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-200">
                Interview Prompts
              </p>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                Tailored to role and resume
              </p>
            </div>
          </div>

          <div className="rounded-md bg-emerald-50 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Role
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {[
            "How would you debug a production issue affecting API latency?",
            "Walk us through a system you built that had to scale reliably.",
            "How do you review pull requests when architecture tradeoffs are unclear?",
          ].map((question, index) => (
            <motion.div
              key={question}
              className="rounded-xl bg-neutral-50 p-2.5 dark:bg-neutral-900"
              initial={{ x: -10, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={previewViewport}
              transition={{ delay: 0.2 + index * 0.12, duration: 0.35 }}
            >
              <div className="flex gap-2">
                <div className="pt-0.5 text-[10px] font-semibold text-red-600">
                  Q{index + 1}
                </div>
                <p className="text-[11px] leading-4 text-neutral-700 dark:text-neutral-300">
                  {question}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        {[
          { tag: "Backend", className: "bg-red-50 text-red-600" },
          { tag: "Systems", className: "bg-emerald-50 text-emerald-700" },
          {
            tag: "Code Review",
            className:
              "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
          },
        ].map((item, index) => (
          <motion.div
            key={item.tag}
            className={`rounded-md px-2 py-1 ${item.className}`}
            initial={{ y: 8, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={previewViewport}
            transition={{ delay: 0.55 + index * 0.1, duration: 0.3 }}
          >
            <span className="text-[9px] font-medium">{item.tag}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const CandidateScoringPreview = () => {
  return (
    <div className="flex h-full origin-top scale-[0.94] flex-col gap-2 overflow-hidden px-1 pb-1">
      <div className="rounded-xl border border-neutral-200 bg-white p-2.5 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              className="h-3 w-3 rounded-full border border-emerald-300 bg-emerald-100"
              whileInView={{ scale: [1, 1.05, 1] }}
              viewport={previewViewport}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
            <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
              Candidate Match
            </div>
          </div>

          <motion.div
            className="rounded-md bg-amber-50 px-2 py-px"
            whileInView={{ scale: [1, 1.04, 1] }}
            viewport={previewViewport}
            transition={{ duration: 1.8, repeat: Infinity }}
          >
            <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-amber-700">
              Match
            </span>
          </motion.div>
        </div>

        <div className="mt-2.5 grid grid-cols-3 gap-1.5">
          {[
            { label: "Skills", width: "84%" },
            { label: "Experience", width: "72%" },
            { label: "Keywords", width: "91%" },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              className="rounded-lg bg-neutral-50 p-1.5 dark:bg-neutral-900"
              initial={{ y: 8, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={previewViewport}
              transition={{ delay: 0.2 + index * 0.12, duration: 0.4 }}
            >
              <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400 dark:text-neutral-500">
                {item.label}
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800">
                <motion.div
                  className="h-full rounded-full bg-red-400"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: [0, 1] }}
                  viewport={previewViewport}
                  transition={{
                    delay: 0.45 + index * 0.12,
                    duration: 0.6,
                    ease: "easeOut",
                  }}
                  style={{ width: item.width, originX: 0 }}
                />
              </div>
              <div className="mt-1.5 text-[10px] font-semibold text-neutral-500 dark:text-neutral-400">
                {item.width}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        className="rounded-xl bg-white p-2 dark:bg-neutral-950"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={previewViewport}
        transition={{ delay: 0.35, duration: 0.7 }}
      >
        <div className="flex items-center justify-between">
          <motion.div
            className="flex items-center gap-1"
            whileInView={{ opacity: [0.5, 0.85, 0.5] }}
            viewport={previewViewport}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            <div className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
              Backend Engineer
            </div>
          </motion.div>

          <motion.div
            className="text-xl font-semibold tracking-tight text-red-600"
            whileInView={{ opacity: [0.7, 1, 0.7] }}
            viewport={previewViewport}
            transition={{ duration: 1.8, repeat: Infinity }}
          >
            92%
          </motion.div>
        </div>

        <div className="mt-2 h-2 rounded-full bg-neutral-100 dark:bg-neutral-800">
          <motion.div
            className="h-full rounded-full bg-red-400"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: [0, 0.92] }}
            viewport={previewViewport}
            transition={{ delay: 0.55, duration: 0.8, ease: "easeOut" }}
            style={{ originX: 0 }}
          />
        </div>

        <div className="mt-1.5 flex gap-1.5">
          {[
            { tag: "Strong fit", className: "bg-amber-50 text-amber-700" },
            { tag: "Priority", className: "bg-emerald-50 text-emerald-700" },
            { tag: "Ready", className: "bg-red-50 text-red-600" },
          ].map((item, index) => (
            <motion.div
              key={item.tag}
              className={`rounded-md px-1.5 py-0.5 ${item.className}`}
              initial={{ y: 8, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={previewViewport}
              transition={{ delay: 0.65 + index * 0.1, duration: 0.35 }}
            >
              <span className="text-[9px] font-medium">{item.tag}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const CandidateProfilePreview = () => {
  return (
    <div className="flex h-full flex-col justify-between overflow-hidden">
      <div className="rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-start gap-3">
          <motion.div
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-[11px] font-semibold text-emerald-700"
            whileInView={{ scale: [1, 1.04, 1] }}
            viewport={previewViewport}
            transition={{ duration: 1.8, repeat: Infinity }}
          >
            CP
          </motion.div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-100">
                  Candidate Profile
                </p>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                  Full hiring snapshot
                </p>
              </div>
              <div className="rounded-md bg-amber-50 px-2 py-1 text-[9px] font-semibold text-amber-700">
                89%
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {[
                { tag: "React", className: "bg-amber-50 text-amber-700" },
                { tag: "Node", className: "bg-emerald-50 text-emerald-700" },
                { tag: "System Design", className: "bg-red-50 text-red-600" },
              ].map((item, index) => (
                <motion.div
                  key={item.tag}
                  className={`rounded-md px-2 py-1 ${item.className}`}
                  initial={{ y: 6, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={previewViewport}
                  transition={{ delay: 0.2 + index * 0.08, duration: 0.3 }}
                >
                  <span className="text-[9px] font-medium">{item.tag}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {[
            {
              label: "Summary",
              text: "Strong technical depth and clear ownership.",
            },
            {
              label: "Interview",
              text: "Recommended for next-round technical screen.",
            },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              className="rounded-xl bg-neutral-50 p-2.5 dark:bg-neutral-900"
              initial={{ y: 8, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={previewViewport}
              transition={{ delay: 0.35 + index * 0.12, duration: 0.35 }}
            >
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400 dark:text-neutral-500">
                {item.label}
              </p>
              <p className="mt-2 text-[11px] leading-4 text-neutral-700 dark:text-neutral-300">
                {item.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        {[
          { label: "Score", value: "High" },
          { label: "Experience", value: "Senior" },
          { label: "Stage", value: "Interview" },
        ].map((item, index) => (
          <motion.div
            key={item.label}
            className="flex-1 rounded-xl bg-white p-2.5 text-center dark:bg-neutral-950"
            initial={{ y: 8, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={previewViewport}
            transition={{ delay: 0.55 + index * 0.08, duration: 0.3 }}
          >
            <p className="text-[12px] font-semibold text-neutral-800 dark:text-neutral-100">
              {item.value}
            </p>
            <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.14em] text-neutral-400 dark:text-neutral-500">
              {item.label}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const featureCards = [
  {
    title: "AI Resume Structuring",
    description:
      "Convert unstructured resumes into clean candidate data with extracted skills, experience, and role history for faster review.",
    Preview: ResumeStructuringPreview,
  },
  {
    title: "Candidate Scoring",
    description:
      "Score candidates against job requirements using a consistent framework so recruiters can prioritize the strongest matches quickly.",
    Preview: BulkProcessingPreview,
  },
  {
    title: "Recruiter Insights",
    description:
      "Get concise summaries, strengths, and potential gaps for each candidate so your team can move from screening to interviews faster.",
    Preview: RecruiterInsightsPreview,
  },
  {
    title: "Interview Question Suggestions",
    description:
      "Generate targeted interview prompts based on each resume and job role to improve interview quality and consistency.",
    Preview: InterviewQuestionSuggestionsPreview,
  },
  {
    title: "Bulk Resume Processing",
    description:
      "Upload resume batches and process high application volumes in minutes instead of manually reviewing files one by one.",
    Preview: CandidateScoringPreview,
  },
  {
    title: "Candidate Profile View",
    description:
      "View each candidate in a single profile with score, skills match, summary, and interview-ready context for decision discussions.",
    Preview: CandidateProfilePreview,
  },
] as const;

const FeaturesSection = () => {
  return (
    <section id="features" className="scroll-mt-24 px-2 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-500">
          Features
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 md:text-5xl">
          Built for recruiters and hiring teams
          <span aria-hidden="true" className="text-red-700">
            .
          </span>
        </h2>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featureCards.map(({ title, description, Preview }) => (
            <article
              key={title}
              className="rounded-xl border border-black/10 bg-white/70 p-5 sm:p-6 dark:border-white/10 dark:bg-neutral-900/70"
            >
              <div className={previewShellClassName}>
                <Preview />
              </div>
              <h3 className="mt-5 text-lg font-semibold leading-tight tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-xl">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-[0.95rem]">
                {description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
