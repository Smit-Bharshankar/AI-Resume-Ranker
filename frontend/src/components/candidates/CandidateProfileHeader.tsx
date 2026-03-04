import { memo } from "react";
import { Insights } from "../../types/insights";
import { ResumeStatus } from "../../types/resume";
import { isResumeProcessingStatus } from "../../utils/resumeStatusUtils";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { CandidateStatusBadge } from "./CandidateStatusBadge";

type CandidateProfileHeaderProps = {
  candidateId: string;
  jobTitle?: string;
  score?: number;
  status: ResumeStatus;
  recommendation?: Insights["recommendation"];
  className?: string;
};

const getRecommendationTone = (
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

const toRecommendationLabel = (
  recommendation: Insights["recommendation"] | undefined
): string => {
  if (!recommendation) {
    return "Pending";
  }

  return recommendation.replace(/_/g, " ");
};

function CandidateProfileHeaderComponent({
  candidateId,
  jobTitle,
  score,
  status,
  recommendation,
  className,
}: CandidateProfileHeaderProps) {
  const isProcessing = isResumeProcessingStatus(status);

  return (
    <Card className={className}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">{candidateId}</h1>
          <p className="text-sm text-slate-600">
            {jobTitle && jobTitle.trim().length > 0 ? jobTitle : "Job title unavailable"}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <CandidateStatusBadge status={status} />
            {isProcessing ? <Badge tone="info">Processing</Badge> : null}
          </div>
        </div>

        <div className="grid gap-2 text-sm text-slate-700">
          <p>
            <span className="font-semibold text-slate-900">Score:</span>{" "}
            {typeof score === "number" ? `${Math.round(score)} / 100` : "-- / --"}
          </p>
          <p className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">Recommendation:</span>
            <Badge tone={getRecommendationTone(recommendation)}>
              {toRecommendationLabel(recommendation)}
            </Badge>
          </p>
        </div>
      </div>
    </Card>
  );
}

export const CandidateProfileHeader = memo(CandidateProfileHeaderComponent);
