"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useNavbarScroll } from "@/hooks/use-navbar-scroll";
import { APP_BASE_URL, APP_LOGIN_URL } from "@/lib/urls";
import { cn } from "@/lib/utils";

import { Button } from "./ui/button";

const navLinks = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/security", label: "Security" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { hasPassedHero, isHidden } = useNavbarScroll({ heroId: "hero-section" });

  const isGlass = hasPassedHero;

  return (
    <>
      <motion.header
        initial={false}
        animate={{ y: isHidden ? -110 : 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-6"
      >
        <div
          className={cn(
            "mx-auto flex w-full max-w-6xl items-center justify-between rounded-2xl px-4 py-3 transition-all duration-300 md:px-6",
            isGlass
              ? "border border-white/20 bg-white/60 text-foreground shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-black/40"
              : "border border-transparent bg-transparent text-foreground dark:text-white"
          )}
        >
          <Link href="/" className="logo-wordmark text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Sortres<span className="ml-0.5 text-red-700">.</span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative text-sm transition-colors group", // Added 'relative' and 'group'
                  "after:absolute after:bottom-[-1.5] after:left-0 after:h-0.5 after:w-0 after:bg-current after:transition-all after:duration-300 hover:after:w-full", // The animation logic
                  isGlass
                    ? "text-foreground/80 hover:text-foreground"
                    : "text-foreground/85 hover:text-foreground dark:text-white/85 dark:hover:text-white"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Button
              variant={isGlass ? "outline" : "ghost"}
              className={cn(isGlass ? "" : "text-foreground hover:bg-black/10 hover:text-foreground dark:text-white dark:hover:bg-white/15 dark:hover:text-white")}
              asChild
            >
              <Link href={APP_LOGIN_URL}>Login</Link>
            </Button>
            <Button className="shadow-sm" asChild>
              <Link href={APP_BASE_URL}>Try Free Beta</Link>
            </Button>
          </div>

          <button
            type="button"
            aria-label="Open navigation menu"
            className={cn(
              "inline-flex items-center justify-center rounded-md p-2 transition lg:hidden",
              isGlass ? "text-foreground hover:bg-black/5 dark:hover:bg-white/10" : "text-foreground hover:bg-black/10 dark:text-white dark:hover:bg-white/15"
            )}
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="size-5" />
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMobileMenuOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation menu backdrop"
              className="fixed inset-0 z-50 bg-black/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed top-0 right-0 z-60 flex h-full w-72 flex-col border-l border-border/70 bg-background p-5"
            >
              <div className="mb-6 flex items-center justify-between">
                <p className="logo-wordmark text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  Sortres<span className="text-red-700">.</span>
                </p>
                <button
                  type="button"
                  aria-label="Close navigation menu"
                  className="rounded-md p-2 text-muted-foreground hover:bg-muted"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="size-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-6 flex flex-col gap-2">
                <Button variant="outline" asChild>
                  <Link href={APP_LOGIN_URL} onClick={() => setIsMobileMenuOpen(false)}>
                    Login
                  </Link>
                </Button>
                <Button asChild>
                  <Link href={APP_BASE_URL} onClick={() => setIsMobileMenuOpen(false)}>
                    Try Free Beta
                  </Link>
                </Button>
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
