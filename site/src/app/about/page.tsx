import type { Metadata } from "next";

import AboutPage from "@/components/about-page";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Sortres, our mission, and how we use responsible AI to help recruiters evaluate candidates faster.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutRoutePage() {
  return <AboutPage />;
}
