import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border/70 mt-5 px-6 py-10 md:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 text-center">
        <p className="text-sm font-medium text-foreground">ResumeRank AI</p>

        <nav className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          <Link href="/privacy-policy" className="transition-colors hover:text-foreground">
            Privacy Policy
          </Link>
          <Link href="/terms" className="transition-colors hover:text-foreground">
            Terms of Service
          </Link>
          <Link href="/ai-transparency" className="transition-colors hover:text-foreground">
            AI Transparency & Responsible Use
          </Link>
          <Link href="/contact" className="transition-colors hover:text-foreground">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
}
