import type { Metadata } from "next";

import SecurityPage from "@/components/security-page";

export const metadata: Metadata = {
  title: "Security & Trust",
  description:
    "Learn how Sortres handles resume data security, privacy, infrastructure, and responsible AI use.",
  alternates: {
    canonical: "/security",
  },
};

export default function SecurityRoutePage() {
  return <SecurityPage />;
}
