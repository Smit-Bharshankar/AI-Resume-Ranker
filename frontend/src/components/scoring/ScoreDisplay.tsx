import { Resume } from "../../types/resume";
import { Card } from "../ui/Card";

type ScoreDisplayProps = {
  score?: Resume["score"];
};

export function ScoreDisplay({ score }: ScoreDisplayProps) {
  const hasScore = typeof score === "number";

  return (
    <Card className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Total Score
      </p>
      <p className="text-3xl font-bold text-slate-900">{hasScore ? score : "-"}</p>
      {!hasScore ? (
        <p className="text-sm text-slate-600">Score will appear after scoring completes.</p>
      ) : null}
    </Card>
  );
}
