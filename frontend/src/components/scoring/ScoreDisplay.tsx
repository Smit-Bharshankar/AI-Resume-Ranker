import { memo } from "react";
import { Card } from "../ui/Card";

type ScoreDisplayProps = {
  score?: number;
  maxScore?: number;
  isGenerating?: boolean;
  title?: string;
  className?: string;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

function ScoreDisplayComponent({
  score,
  maxScore = 100,
  isGenerating = false,
  title = "Score",
  className,
}: ScoreDisplayProps) {
  const hasScore = typeof score === "number";
  const safeMaxScore = maxScore > 0 ? maxScore : 100;
  const normalizedScore = hasScore ? clamp(score, 0, safeMaxScore) : 0;
  const progressPercent = Math.round((normalizedScore / safeMaxScore) * 100);

  return (
    <Card className={`rounded-xl border-border/70 ${className ?? ""}`.trim()}>
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
        <p className="text-3xl font-semibold tracking-tight text-foreground">
          {hasScore ? `${normalizedScore} / ${safeMaxScore}` : "-- / --"}
        </p>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-muted"
          aria-hidden="true"
        >
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${hasScore ? progressPercent : 0}%` }}
          />
        </div>
        {!hasScore && isGenerating ? (
          <p className="text-sm text-muted-foreground">
            Score is being generated. This section updates automatically.
          </p>
        ) : null}
        {!hasScore && !isGenerating ? (
          <p className="text-sm text-muted-foreground">
            Score will appear after candidate scoring completes.
          </p>
        ) : null}
        {hasScore ? (
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {progressPercent}% match score
          </p>
        ) : null}
      </div>
    </Card>
  );
}

export const ScoreDisplay = memo(ScoreDisplayComponent);
