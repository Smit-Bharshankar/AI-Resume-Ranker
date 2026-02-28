import { Insights } from "../../types/insights";
import { Card } from "../ui/Card";

type InsightSummaryProps = {
  insights?: Insights;
  isGenerating?: boolean;
};

export function InsightSummary({
  insights,
  isGenerating = false,
}: InsightSummaryProps) {
  if (isGenerating) {
    return (
      <Card>
        <p className="text-sm text-slate-600">Generating insight summary...</p>
      </Card>
    );
  }

  if (!insights?.summary) {
    return (
      <Card>
        <p className="text-sm text-slate-600">Summary will appear once insights are ready.</p>
      </Card>
    );
  }

  return (
    <Card className="space-y-2">
      <h3 className="text-lg font-semibold text-slate-900">Summary</h3>
      <p className="text-sm text-slate-700">{insights.summary}</p>
    </Card>
  );
}
