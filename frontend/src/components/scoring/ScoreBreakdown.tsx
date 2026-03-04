import { memo } from "react";
import { ScoreBreakdown as ScoreBreakdownType } from "../../types/resume";
import { Card } from "../ui/Card";

type ScoreBreakdownProps = {
  scoreBreakdown?: ScoreBreakdownType;
  isGenerating?: boolean;
  className?: string;
};

type BreakdownItemProps = {
  label: string;
  value: string;
};

const toPercent = (value: number): string =>
  `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%`;

function BreakdownItem({ label, value }: BreakdownItemProps) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm text-slate-800">{value}</p>
    </div>
  );
}

function ScoreBreakdownComponent({
  scoreBreakdown,
  isGenerating = false,
  className,
}: ScoreBreakdownProps) {
  if (!scoreBreakdown) {
    return (
      <Card className={className}>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-slate-900">Score Breakdown</h3>
          <p className="text-sm text-slate-600">
            {isGenerating
              ? "Score breakdown is being generated and will appear automatically."
              : "Score breakdown will appear when candidate scoring is completed."}
          </p>
        </div>
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
    <Card className={className}>
      <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Score Breakdown</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <BreakdownItem
          label="Required Skills Score"
          value={`${scoreBreakdown.required.matched}/${scoreBreakdown.required.total} matched (${toPercent(
            requiredRatio
          )})`}
        />
        <BreakdownItem
          label="Preferred Skills Score"
          value={`${scoreBreakdown.preferred.matched}/${scoreBreakdown.preferred.total} matched (${toPercent(
            preferredRatio
          )})`}
        />
        <BreakdownItem
          label="Experience Score"
          value={`${toPercent(scoreBreakdown.experience.score)} (${scoreBreakdown.experience.candidate_years} yrs / required ${scoreBreakdown.experience.required_years} yrs)`}
        />
        <BreakdownItem
          label="Final Score"
          value={`${Math.round(scoreBreakdown.final_score)} / 100`}
        />
      </div>
      </div>
    </Card>
  );
}

export const ScoreBreakdown = memo(ScoreBreakdownComponent);
