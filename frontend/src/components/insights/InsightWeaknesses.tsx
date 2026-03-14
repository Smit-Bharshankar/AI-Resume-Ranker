import { memo } from "react";
import { Insights } from "../../types/insights";
import { InsightSection } from "./InsightSection";

type InsightWeaknessesProps = {
  insights?: Insights;
  isGenerating?: boolean;
  className?: string;
};

function InsightWeaknessesComponent({
  insights,
  isGenerating = false,
  className,
}: InsightWeaknessesProps) {
  const weaknesses = (insights?.weaknesses ?? []).filter(
    (weakness) => weakness.trim().length > 0
  );

  return (
    <InsightSection
      title="Weaknesses"
      isGenerating={isGenerating}
      generatingLabel="Generating weaknesses..."
      emptyLabel="No weaknesses available yet."
      hasContent={weaknesses.length > 0}
      className={className}
    >
      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        {weaknesses.map((weakness, index) => (
          <li key={`${weakness}-${index}`}>{weakness}</li>
        ))}
      </ul>
    </InsightSection>
  );
}

export const InsightWeaknesses = memo(InsightWeaknessesComponent);
