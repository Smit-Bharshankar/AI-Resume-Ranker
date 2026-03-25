import { memo } from "react";
import { Resume } from "../../types/resume";
import { Badge } from "../ui/Badge";
import { InsightSection } from "./InsightSection";

type InsightRecommendationProps = {
  recommendation?: Resume["recommendation"];
  isGenerating?: boolean;
  className?: string;
};

const getVariant = (
  recommendation: Resume["recommendation"] | undefined
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
  recommendation: Resume["recommendation"] | undefined
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
  recommendation,
  isGenerating = false,
  className,
}: InsightRecommendationProps) {
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
