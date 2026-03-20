import type { Metadata } from "next";

import PricingPage from "@/components/pricing-page";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Sortres beta pricing for recruiters and hiring teams. Free tier is available now, with Pro and Team plans coming soon.",
  alternates: {
    canonical: "/pricing",
  },
};

export default function PricingRoutePage() {
  return <PricingPage />;
}
