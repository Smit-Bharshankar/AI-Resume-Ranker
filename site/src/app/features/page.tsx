import type { Metadata } from "next";

import FeaturesPage from "@/components/features-page";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Explore Sortres features for AI resume structuring, candidate scoring, recruiter insights, and faster hiring workflows.",
  alternates: {
    canonical: "/features",
  },
};

export default function FeaturesRoutePage() {
  return <FeaturesPage />;
}
