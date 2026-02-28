import { Insights } from "../../types/insights";
import { Card } from "../ui/Card";

type InsightStrengthsProps = {
  insights?: Insights;
};

export function InsightStrengths({ insights }: InsightStrengthsProps) {
  const strengths = insights?.strengths ?? [];

  return (
    <Card className="space-y-2">
      <h3 className="text-lg font-semibold text-slate-900">Strengths</h3>
      {strengths.length === 0 ? (
        <p className="text-sm text-slate-600">No strengths available yet.</p>
      ) : (
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
          {strengths.map((strength, index) => (
            <li key={`${strength}-${index}`}>{strength}</li>
          ))}
        </ul>
      )}
    </Card>
  );
}
