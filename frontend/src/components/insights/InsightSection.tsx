import { PropsWithChildren } from "react";
import { Loader } from "../common/Loader";
import { Card } from "../ui/Card";

type InsightSectionProps = PropsWithChildren<{
  title: string;
  isGenerating?: boolean;
  generatingLabel?: string;
  emptyLabel?: string;
  hasContent: boolean;
  className?: string;
}>;

export function InsightSection({
  title,
  isGenerating = false,
  generatingLabel = "Generating insights...",
  emptyLabel = "Insights are not available yet.",
  hasContent,
  className,
  children,
}: InsightSectionProps) {
  return (
    <Card className={`rounded-xl border-border/70 ${className ?? ""}`.trim()}>
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        {isGenerating ? <Loader label={generatingLabel} /> : null}
        {!isGenerating && !hasContent ? (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        ) : null}
        {!isGenerating && hasContent ? children : null}
      </div>
    </Card>
  );
}
