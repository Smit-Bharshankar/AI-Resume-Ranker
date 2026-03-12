import type { Metadata } from "next";

import CaseStudiesPage from "@/components/case-studies-page";

export const metadata: Metadata = {
  title: "Customers & Case Studies",
  description:
    "Explore Sortres case studies and realistic recruiter workflows for faster resume screening and candidate evaluation.",
  alternates: {
    canonical: "/case-studies",
  },
};

export default function CaseStudiesRoutePage() {
  return <CaseStudiesPage />;
}
