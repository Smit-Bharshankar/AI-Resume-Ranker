"use client";

import { usePathname } from "next/navigation";

import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

type SiteShellProps = {
  children: React.ReactNode;
};

export default function SiteShell({ children }: SiteShellProps) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <div className="relative min-h-screen">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-size-[40px_40px]"
      />
      <div className="relative z-10">
        <Navbar />
        <div className={isHomePage ? "" : "pt-24"}>{children}</div>
        <Footer />
      </div>
    </div>
  );
}
