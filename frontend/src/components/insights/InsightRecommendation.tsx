import { memo } from "react";
import { Insights } from "../../types/insights";
import { Badge } from "../ui/Badge";
import { InsightSection } from "./InsightSection";

type InsightRecommendationProps = {
  insights?: Insights;
  isGenerating?: boolean;
  className?: string;
};

const getVariant = (
  recommendation: Insights["recommendation"] | undefined
): "secondary" | "success" | "warning" | "destructive" => {
  if (!recommendation) {
    return "secondary";
  }

  if (recommendation === "STRONG_FIT" || recommendation === "GOOD_FIT") {
    return "success";
  }

  if (recommendation === "MODERATE_FIT") {
    return "warning";
  }

  return "destructive";
};

const toDisplayRecommendation = (
  recommendation: Insights["recommendation"] | undefined
): string => {
  if (!recommendation) {
    return "";
  }

  if (recommendation === "STRONG_FIT") {
    return "Strong Fit";
  }

  if (recommendation === "GOOD_FIT") {
    return "Good Fit";
  }

  if (recommendation === "MODERATE_FIT") {
    return "Moderate Fit";
  }

  return "Weak Fit";
};

function InsightRecommendationComponent({
  insights,
  isGenerating = false,
  className,
}: InsightRecommendationProps) {
  const recommendation = insights?.recommendation;
  const displayRecommendation = toDisplayRecommendation(recommendation);

  return (
    <InsightSection
      title="Recommendation"
      isGenerating={isGenerating}
      generatingLabel="Generating recommendation..."
      emptyLabel="Recommendation will appear once insights are ready."
      hasContent={displayRecommendation.length > 0}
      className={className}
    >
      <Badge variant={getVariant(recommendation)}>{displayRecommendation}</Badge>
    </InsightSection>
  );
}

export const InsightRecommendation = memo(InsightRecommendationComponent);
