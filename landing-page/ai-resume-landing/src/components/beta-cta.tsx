"use client";

import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function BetaCTA() {
  return (
    <section className="px-6 md:px-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.25 }}
        className="mx-auto w-full max-w-4xl rounded-2xl border border-border/70 bg-gradient-to-b from-background to-muted/30 p-6 sm:p-8"
      >
        <div className="mb-6 space-y-2 text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Join the beta</h2>
          <p className="text-muted-foreground">
            Be among the first to try AI-powered resume screening.
          </p>
        </div>

        <form className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input id="email" type="email" placeholder="you@company.com" required />
          </div>

          <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
            <div className="grid gap-2">
              <label htmlFor="company" className="text-sm font-medium">
                Company
              </label>
              <Input id="company" type="text" placeholder="Acme Inc." />
            </div>

            <div className="grid gap-2">
              <label htmlFor="hiring-volume" className="text-sm font-medium">
                Hiring volume
              </label>
              <Input id="hiring-volume" type="text" placeholder="e.g. 50 resumes/week" />
            </div>
          </div>

          <Button type="submit" size="lg" className="mt-2 w-full sm:w-fit">
            Request Access
          </Button>
        </form>
      </motion.div>
    </section>
  );
}

