import { ScoreBreakdown as ScoreBreakdownType } from "../../types/resume";
import { Card } from "../ui/Card";

type ScoreBreakdownProps = {
  scoreBreakdown?: ScoreBreakdownType;
};

const toPercent = (value: number): string => `${Math.round(value * 100)}%`;

export function ScoreBreakdown({ scoreBreakdown }: ScoreBreakdownProps) {
  if (!scoreBreakdown) {
    return (
      <Card>
        <p className="text-sm text-slate-600">
          Score breakdown will appear when candidate scoring is completed.
        </p>
      </Card>
    );
  }

  const requiredRatio =
    scoreBreakdown.required.total > 0
      ? scoreBreakdown.required.matched / scoreBreakdown.required.total
      : 0;
  const preferredRatio =
    scoreBreakdown.preferred.total > 0
      ? scoreBreakdown.preferred.matched / scoreBreakdown.preferred.total
      : 0;

  return (
    <Card className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Score Breakdown</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-md bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Required Skills
          </p>
          <p className="mt-1 text-sm text-slate-800">
            {scoreBreakdown.required.matched}/{scoreBreakdown.required.total} matched (
            {toPercent(requiredRatio)})
          </p>
        </div>
        <div className="rounded-md bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Preferred Skills
          </p>
          <p className="mt-1 text-sm text-slate-800">
            {scoreBreakdown.preferred.matched}/{scoreBreakdown.preferred.total} matched (
            {toPercent(preferredRatio)})
          </p>
        </div>
        <div className="rounded-md bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Experience Score
          </p>
          <p className="mt-1 text-sm text-slate-800">
            {toPercent(scoreBreakdown.experience.score)} (
            {scoreBreakdown.experience.candidate_years} yrs / required{" "}
            {scoreBreakdown.experience.required_years} yrs)
          </p>
        </div>
        <div className="rounded-md bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Final Score
          </p>
          <p className="mt-1 text-sm text-slate-800">{scoreBreakdown.final_score}</p>
        </div>
      </div>
    </Card>
  );
}
