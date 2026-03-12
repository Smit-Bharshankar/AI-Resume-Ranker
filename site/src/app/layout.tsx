import CursorSpotlight from "@/components/cursor-spotlight";
import SiteShell from "@/components/site-shell";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.sortres.com"),
  title: {
    default: "SortRes | AI Resume Screening Platform",
    template: "%s | SortRes",
  },
  description:
    "Upload resumes, rank candidates with AI, and give hiring teams recruiter-ready insights in minutes.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SortRes | AI Resume Screening Platform",
    description:
      "Screen resumes faster with AI-powered candidate ranking, summaries, and hiring insights.",
    url: "/",
    siteName: "SortRes",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SortRes | AI Resume Screening Platform",
    description:
      "Screen resumes faster with AI-powered candidate ranking, summaries, and hiring insights.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <CursorSpotlight />
        <SiteShell>{children}</SiteShell>

        {/* Vercel traffic analytics */}
        <Analytics />

        {/* Core Web Vitals monitoring */}
        <SpeedInsights />
      </body>
    </html>
  );
}
