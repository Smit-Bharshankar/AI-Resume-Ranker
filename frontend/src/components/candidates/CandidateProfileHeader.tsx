import { memo } from "react";
import { Insights } from "../../types/insights";
import { CandidateStage, ResumeStatus } from "../../types/resume";
import { isResumeProcessingStatus } from "../../utils/resumeStatusUtils";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { CandidateStageBadge } from "../workflow/CandidateStageBadge";
import { CandidateStageSelector } from "../workflow/CandidateStageSelector";
import { CandidateStatusBadge } from "./CandidateStatusBadge";

type CandidateProfileHeaderProps = {
  candidateId: string;
  candidateName?: string;
  jobTitle?: string;
  score?: number;
  status: ResumeStatus;
  stage: CandidateStage;
  onStageChange?: (stage: CandidateStage) => void;
  isStageUpdating?: boolean;
  recommendation?: Insights["recommendation"];
  className?: string;
};

const getRecommendationVariant = (
  recommendation: Insights["recommendation"] | undefined
): "secondary" | "success" | "warning" | "destructive" => {
  if (!recommendation) {
    return "secondary";
  }

  if (recommendation === "STRONG_FIT" || recommendation === "GOOD_FIT") {
    return "success";
  }

  if (recommendation === "MODERATE_FIT") {
    return "warning";
  }

  return "destructive";
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
  candidateName,
  jobTitle,
  score,
  status,
  stage,
  onStageChange,
  isStageUpdating = false,
  recommendation,
  className,
}: CandidateProfileHeaderProps) {
  const isProcessing = isResumeProcessingStatus(status);
  const displayName =
    candidateName && candidateName.trim().length > 0 ? candidateName.trim() : candidateId;

  return (
    <Card className={className}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">{displayName}</h1>
          <p className="text-xs text-slate-500">Candidate ID: {candidateId}</p>
          <p className="text-sm text-slate-600">
            {jobTitle && jobTitle.trim().length > 0 ? jobTitle : "Job title unavailable"}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <CandidateStatusBadge status={status} />
            {isProcessing ? <Badge variant="info">Processing</Badge> : null}
          </div>
        </div>

        <div className="grid gap-2 text-sm text-slate-700">
          <p>
            <span className="font-semibold text-slate-900">Score:</span>{" "}
            {typeof score === "number" ? `${Math.round(score)} / 100` : "-- / --"}
          </p>
          <p className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">Recommendation:</span>
            <Badge variant={getRecommendationVariant(recommendation)}>
              {toRecommendationLabel(recommendation)}
            </Badge>
          </p>
          <p className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-900">Stage:</span>
            <CandidateStageBadge stage={stage} />
            {onStageChange ? (
              <CandidateStageSelector
                value={stage}
                onChange={onStageChange}
                isUpdating={isStageUpdating}
                ariaLabel="Candidate stage"
                className="min-w-36"
              />
            ) : null}
          </p>
        </div>
      </div>
    </Card>
  );
}

export const CandidateProfileHeader = memo(CandidateProfileHeaderComponent);
