import type { Metadata } from "next";

import BlogPage from "@/components/blog-page";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Read Sortres insights on recruiting, resume screening, hiring workflows, AI in hiring, and recruiter productivity.",
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogRoutePage() {
  return <BlogPage />;
}
