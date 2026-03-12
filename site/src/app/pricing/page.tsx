import type { Metadata } from "next";

import PricingPage from "@/components/pricing-page";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Sortres pricing for recruiters and hiring teams. Start free, scale with Pro, and collaborate with Team plans.",
  alternates: {
    canonical: "/pricing",
  },
};

export default function PricingRoutePage() {
  return <PricingPage />;
}
