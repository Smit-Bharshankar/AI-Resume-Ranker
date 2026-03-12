import type { Metadata } from "next";

import IntegrationsPage from "@/components/integrations-page";

export const metadata: Metadata = {
  title: "Integrations",
  description:
    "Learn about current Sortres integrations and future plans for ATS, recruiting tools, and API access.",
  alternates: {
    canonical: "/integrations",
  },
};

export default function IntegrationsRoutePage() {
  return <IntegrationsPage />;
}
