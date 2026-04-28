"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// const demoVideoUrl = "https://youtu.be/Kt7pyrrH1No?si=EQJXNNUU9aVnJePO";
const demoVideoUrl = "https://youtu.be/TOcQavoA5jQ?si=H6utZ8l6pyDNAiGj";

const demoVideoTitle = "Sortres product demo";

const getYouTubeVideoId = (input: string) => {
  const value = input.trim();

  if (/^[\w-]{11}$/.test(value)) {
    return value;
  }

  try {
    const url = new URL(value);
    const videoId = url.searchParams.get("v");

    if (videoId && /^[\w-]{11}$/.test(videoId)) {
      return videoId;
    }

    const videoIdMatch = url.pathname.match(
      /^\/(?:embed\/|shorts\/)?([\w-]{11})/,
    );

    if (videoIdMatch?.[1]) {
      return videoIdMatch[1];
    }
  } catch {
    const videoIdMatch = value.match(
      /(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/,
    );

    if (videoIdMatch?.[1]) {
      return videoIdMatch[1];
    }
  }

  return "";
};

const demoVideoId = getYouTubeVideoId(demoVideoUrl);
const demoThumbnailUrl = `https://img.youtube.com/vi/${demoVideoId}/hqdefault.jpg`;
const demoEmbedUrl = `https://www.youtube-nocookie.com/embed/${demoVideoId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`;

const DemoSection = () => {
  const urlText = "www.sortres.com";
  const [typedCount, setTypedCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    if (!isDeleting && typedCount < urlText.length) {
      timeoutId = setTimeout(() => setTypedCount((prev) => prev + 1), 90);
    } else if (!isDeleting && typedCount === urlText.length) {
      timeoutId = setTimeout(() => setIsDeleting(true), 1400);
    } else if (isDeleting && typedCount > 0) {
      timeoutId = setTimeout(() => setTypedCount((prev) => prev - 1), 45);
    } else {
      timeoutId = setTimeout(() => setIsDeleting(false), 350);
    }

    return () => clearTimeout(timeoutId);
  }, [typedCount, isDeleting, urlText.length]);

  useEffect(() => {
    if (!isVideoOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsVideoOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVideoOpen]);

  const openVideo = () => {
    setIsVideoLoading(true);
    setIsVideoOpen(true);
  };

  return (
    <section id="demo" className="scroll-mt-24 px-2 py-20 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-medium tracking-wide text-neutral-600 dark:border-white/10 dark:bg-neutral-900/70 dark:text-neutral-300">
          <span className="h-1.5 w-1.5 rounded-full bg-red-700" />
          Product Demo
        </div>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 md:text-5xl">
          See Sortres in a 60-second walkthrough
          <span aria-hidden="true" className="text-red-700">
            .
          </span>
        </h2>
        <div
          id="demo-video-container"
          className="mt-10 overflow-hidden rounded-xl border border-black/20 bg-neutral-100 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:-translate-y-0.5 will-change-transform dark:border-white/10 dark:bg-neutral-900 dark:shadow-[0_24px_80px_-42px_rgba(0,0,0,0.8)]"
        >
          <div className="relative flex h-11 items-center border-b border-black/10 bg-white/80 px-3 dark:border-white/10 dark:bg-neutral-950/80">
            <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-full border border-black/15 bg-white px-4 py-1 text-xs text-neutral-500 dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-400">
              {urlText.slice(0, typedCount)}
              <motion.span
                aria-hidden="true"
                className="ml-0.5 inline-block will-change-opacity"
                animate={{ opacity: [0, 1, 0] }}
                transition={{
                  duration: 0.9,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                |
              </motion.span>
            </div>
            <div className="flex items-center gap-2">
              <motion.span
                className="h-2.5 w-2.5 rounded-full border border-red-300 bg-red-100 will-change-transform"
                animate={{ y: [0, -3, 0], scale: [1, 1.08, 1] }}
                transition={{
                  duration: 1.7,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.span
                className="h-2.5 w-2.5 rounded-full border border-amber-300 bg-amber-100 will-change-transform"
                animate={{ y: [0, -3, 0], scale: [1, 1.08, 1] }}
                transition={{
                  duration: 1.7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.18,
                }}
              />
              <motion.span
                className="h-2.5 w-2.5 rounded-full border border-emerald-300 bg-emerald-100 will-change-transform"
                animate={{ y: [0, -3, 0], scale: [1, 1.08, 1] }}
                transition={{
                  duration: 1.7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.36,
                }}
              />
            </div>
          </div>
          <div className="relative aspect-video w-full overflow-hidden bg-neutral-950">
            <div
              aria-hidden="true"
              className="absolute -inset-1 bg-cover bg-center blur-[2px]"
              style={{ backgroundImage: `url(${demoThumbnailUrl})` }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 dark:bg-neutral-950/10"
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <button
                type="button"
                aria-label="Play Sortres demo video"
                onClick={openVideo}
                className="flex cursor-pointer items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2.5 text-base font-semibold text-white shadow-[0_18px_45px_-22px_rgba(0,0,0,0.85)] transition-colors duration-200 hover:bg-neutral-950 focus:outline-none sm:gap-3 sm:px-5 sm:py-3 sm:text-lg"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 sm:h-6 sm:w-6"
                  fill="none"
                >
                  <path
                    d="M7 4v16l13 -8l-13 -8"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
                Play
              </button>
            </span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isVideoOpen ? (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-3 py-6 backdrop-blur-sm sm:px-6"
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsVideoOpen(false)}
          >
            <motion.div
              className="w-full max-w-5xl"
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 18 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-3 flex justify-end">
                <button
                  type="button"
                  aria-label="Close demo video"
                  onClick={() => setIsVideoOpen(false)}
                  className="z-20 flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-black/10 bg-white text-neutral-950 shadow-sm transition hover:bg-neutral-100 focus:outline-none"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                  >
                    <path
                      d="m6 6 12 12M18 6 6 18"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                    />
                  </svg>
                </button>
              </div>
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="demo-video-title"
                className="relative overflow-hidden rounded-lg border border-white/20 bg-neutral-950 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.85)]"
              >
                <h3 id="demo-video-title" className="sr-only">
                  {demoVideoTitle}
                </h3>
                <div className="relative aspect-video w-full bg-neutral-950">
                {isVideoLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/25 border-t-white" />
                  </div>
                ) : null}
                <iframe
                  src={demoEmbedUrl}
                  title={demoVideoTitle}
                  className="relative z-0 aspect-video w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  onLoad={() => setIsVideoLoading(false)}
                  allowFullScreen
                />
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
};

export default DemoSection;
