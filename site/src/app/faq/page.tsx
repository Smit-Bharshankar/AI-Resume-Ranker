import type { Metadata } from "next";

import FAQPage from "@/components/faq-page";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about Sortres, including AI screening, resume support, data handling, and plan limits.",
  alternates: {
    canonical: "/faq",
  },
};

export default function FAQRoutePage() {
  return <FAQPage />;
}
