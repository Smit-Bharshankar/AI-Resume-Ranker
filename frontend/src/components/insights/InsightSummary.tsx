import { memo } from "react";
import { Insights } from "../../types/insights";
import { InsightSection } from "./InsightSection";

type InsightSummaryProps = {
  insights?: Insights;
  isGenerating?: boolean;
  className?: string;
};

function InsightSummaryComponent({
  insights,
  isGenerating = false,
  className,
}: InsightSummaryProps) {
  const summary = insights?.summary?.trim() ?? "";

  return (
    <InsightSection
      title="Summary"
      isGenerating={isGenerating}
      generatingLabel="Generating candidate summary..."
      emptyLabel="Summary will appear once insights are ready."
      hasContent={summary.length > 0}
      className={className}
    >
      <p className="text-sm text-slate-700">{summary}</p>
    </InsightSection>
  );
}

export const InsightSummary = memo(InsightSummaryComponent);
