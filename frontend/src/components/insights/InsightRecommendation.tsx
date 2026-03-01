import { Insights } from "../../types/insights";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

type InsightRecommendationProps = {
  insights?: Insights;
  isGenerating?: boolean;
};

const getTone = (
  recommendation: Insights["recommendation"] | undefined
): "neutral" | "success" | "warning" | "danger" => {
  if (!recommendation) {
    return "neutral";
  }

  if (recommendation === "STRONG_FIT" || recommendation === "GOOD_FIT") {
    return "success";
  }

  if (recommendation === "MODERATE_FIT") {
    return "warning";
  }

  return "danger";
};

export function InsightRecommendation({
  insights,
  isGenerating = false,
}: InsightRecommendationProps) {
  if (isGenerating) {
    return (
      <Card>
        <p className="text-sm text-slate-600">Generating recommendation...</p>
      </Card>
    );
  }

  const recommendation = insights?.recommendation;
  if (!recommendation) {
    return (
      <Card>
        <p className="text-sm text-slate-600">
          Recommendation will appear once insights are ready.
        </p>
      </Card>
    );
  }

  return (
    <Card className="space-y-2">
      <h3 className="text-lg font-semibold text-slate-900">Recommendation</h3>
      <Badge tone={getTone(recommendation)}>{recommendation.replace(/_/g, " ")}</Badge>
    </Card>
  );
}
