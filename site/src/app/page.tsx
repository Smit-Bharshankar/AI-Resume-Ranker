import BetaCTA from "@/components/beta-cta";
import FAQ from "@/components/faq";
import Features from "@/components/features";
import Footer from "@/components/footer";
import Hero from "@/components/hero";
import HowItWorks from "@/components/how-it-works";
import Problem from "@/components/problem";
import ProductPreview from "@/components/product-preview";
import Stats from "@/components/stats";
import Workflow from "@/components/workflow";

function SectionDivider() {
  return <div className="my-24 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />;
}

export default function Home() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-white to-gray-100">
      <div className="pointer-events-none absolute -top-24 -left-16 size-72 rounded-full bg-blue-400/25 blur-3xl" />
      <div className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-purple-400/25 blur-3xl" />

      <main className="relative z-10 flex flex-col">
        <Hero />
        <SectionDivider />
        <Workflow />
        <SectionDivider />
        <Problem />
        <SectionDivider />
        <HowItWorks />
        <SectionDivider />
        <ProductPreview />
        <SectionDivider />
        <Features />
        <SectionDivider />
        <Stats />
        <SectionDivider />
        <BetaCTA />
        <SectionDivider />
        <FAQ />
        <Footer />
      </main>
    </div>
  );
}

