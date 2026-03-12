"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";

export default function Footer() {
  const { resolvedTheme, setTheme } = useTheme();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(resolvedTheme === "dark");
  }, [resolvedTheme]);

  return (
    <footer className="relative z-20 mt-10 border-t border-border/70 bg-background px-6 pb-12 pt-8 md:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-10">
          <p className="text-2xl font-semibold tracking-tight">Sortres</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Product</p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/features" className="transition-colors hover:text-foreground">
                Features
              </Link>
              <Link href="/pricing" className="transition-colors hover:text-foreground">
                Pricing
              </Link>
              <Link href="/security" className="transition-colors hover:text-foreground">
                Security
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Company</p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/about" className="transition-colors hover:text-foreground">
                About
              </Link>
              <Link href="/blog" className="transition-colors hover:text-foreground">
                Blog
              </Link>
              <Link href="/contact" className="transition-colors hover:text-foreground">
                Contact
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Legal</p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/privacy-policy" className="transition-colors hover:text-foreground">
                Privacy Policy
              </Link>
              <Link href="/terms" className="transition-colors hover:text-foreground">
                Terms of Service
              </Link>
              <Link href="/ai-transparency" className="transition-colors hover:text-foreground">
                AI Transparency
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">CTA</p>
            <div className="flex flex-col gap-2">
              <Button asChild>
                <Link href="/pricing">Try Sortres</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/contact">Login</Link>
              </Button>
            </div>
            <div className="pt-2">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Theme</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  const nextIsDark = !isDark;
                  setIsDark(nextIsDark);
                  setTheme(nextIsDark ? "dark" : "light");
                }}
                className="gap-2"
              >
                {isDark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
                {/* {isDark ? "Switch to Light" : "Switch to Dark"} */}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
