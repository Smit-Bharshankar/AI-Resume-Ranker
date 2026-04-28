import BetaCTA from "@/components/beta-cta";
import AIPipeline from "@/components/ai-pipeline";
import FAQ from "@/components/faq";
import Hero from "@/components/hero";
import HowItWorks from "@/components/how-it-works";
import Problem from "@/components/problem";
import ProductPreview from "@/components/product-preview";
import Stats from "@/components/stats";
import Workflow from "@/components/workflow";
import DemoSection from "@/components/ui/DemoSection";
import FeaturesSection from "@/components/ui/FeaturesSection";

function SectionDivider() {
  return <div className="my-24 h-px bg-linear-to-r from-transparent via-border to-transparent" />;
}

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -left-16 size-72 rounded-full bg-[color-mix(in_srgb,var(--brand-accent)_28%,transparent)] blur-3xl" />
      <div className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-[color-mix(in_srgb,var(--brand-accent-strong)_28%,transparent)] blur-3xl" />

      <main className="relative z-10 flex flex-col">
        <Hero />
        <SectionDivider />
        <DemoSection />
        <SectionDivider />
        <Workflow />
        <SectionDivider />
        <FeaturesSection />
        <SectionDivider />
        <Problem />
        <SectionDivider />
        <HowItWorks />
        <SectionDivider />
        <AIPipeline />
        <SectionDivider />
        <ProductPreview />
        <SectionDivider />
        <Stats />
        <SectionDivider />
        <BetaCTA />
        <SectionDivider />
        <FAQ />
      </main>
    </div>
  );
}
