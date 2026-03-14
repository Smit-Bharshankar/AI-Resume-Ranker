import { memo } from "react";
import { Insights } from "../../types/insights";
import { InsightSection } from "./InsightSection";

type InsightStrengthsProps = {
  insights?: Insights;
  isGenerating?: boolean;
  className?: string;
};

function InsightStrengthsComponent({
  insights,
  isGenerating = false,
  className,
}: InsightStrengthsProps) {
  const strengths = (insights?.strengths ?? []).filter(
    (strength) => strength.trim().length > 0
  );

  return (
    <InsightSection
      title="Strengths"
      isGenerating={isGenerating}
      generatingLabel="Generating strengths..."
      emptyLabel="No strengths available yet."
      hasContent={strengths.length > 0}
      className={className}
    >
      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        {strengths.map((strength, index) => (
          <li key={`${strength}-${index}`}>{strength}</li>
        ))}
      </ul>
    </InsightSection>
  );
}

export const InsightStrengths = memo(InsightStrengthsComponent);
