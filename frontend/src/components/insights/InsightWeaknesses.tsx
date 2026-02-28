import { Insights } from "../../types/insights";
import { Card } from "../ui/Card";

type InsightWeaknessesProps = {
  insights?: Insights;
};

export function InsightWeaknesses({ insights }: InsightWeaknessesProps) {
  const weaknesses = insights?.weaknesses ?? [];

  return (
    <Card className="space-y-2">
      <h3 className="text-lg font-semibold text-slate-900">Weaknesses</h3>
      {weaknesses.length === 0 ? (
        <p className="text-sm text-slate-600">No weaknesses available yet.</p>
      ) : (
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
          {weaknesses.map((weakness, index) => (
            <li key={`${weakness}-${index}`}>{weakness}</li>
          ))}
        </ul>
      )}
    </Card>
  );
}
