import { Link } from "react-router-dom";
import { CandidateStage, Resume } from "../../types/resume";
import { Button } from "../ui/Button";
import { CandidateStatusBadge } from "./CandidateStatusBadge";
import { CandidateStageSelector } from "../workflow/CandidateStageSelector";
import { DeleteConfirmButton } from "../common/DeleteConfirmButton";
import { isResumeFailedStatus } from "../../utils/resumeStatusUtils";
import { RotateCw } from "lucide-react";

type CandidateRowProps = {
  resume: Resume;
  onStageChange: (resumeId: string, stage: CandidateStage) => void;
  onDelete?: (resume: Resume) => void;
  onRetry?: (resume: Resume) => void;
  isDeleting?: boolean;
  isStageUpdating?: boolean;
  isRetrying?: boolean;
};

const toDisplayName = (resume: Resume): string => {
  const name = resume.structuredData?.name?.trim();
  return name && name.length > 0 ? name : resume.id;
};

const toScoreLabel = (score?: number): string => {
  return typeof score === "number" ? `${score}` : "-";
};

const toRecommendationLabel = (resume: Resume): string => {
  const recommendation = resume.insights?.recommendation;
  return recommendation ? recommendation.replace(/_/g, " ") : "-";
};

export function CandidateRow({
  resume,
  onStageChange,
  onDelete,
  onRetry,
  isDeleting = false,
  isStageUpdating = false,
  isRetrying = false,
}: CandidateRowProps) {
  const showRetryAction = isResumeFailedStatus(resume.status) && Boolean(onRetry);

  return (
    <tr className="border-t border-border/70">
      <td className="px-4 py-3 text-sm font-medium text-foreground">{toDisplayName(resume)}</td>
      <td className="px-4 py-3">
        <CandidateStatusBadge status={resume.status} />
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">{toScoreLabel(resume.score)}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">{toRecommendationLabel(resume)}</td>
      <td className="px-4 py-3">
        <CandidateStageSelector
          value={resume.stage}
          onChange={(stage) => {
            onStageChange(resume.id, stage);
          }}
          isUpdating={isStageUpdating}
          ariaLabel={`Stage for ${toDisplayName(resume)}`}
          className="min-w-36"
        />
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-2">
          <Link to={`/candidates/${resume.id}`}>
            <Button variant="secondary">View Details</Button>
          </Link>
          {showRetryAction ? (
            <button
              type="button"
              onClick={() => onRetry?.(resume)}
              disabled={isRetrying}
              title="Retry analysis"
              aria-label={`Retry analysis for ${toDisplayName(resume)}`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RotateCw className={`h-4 w-4 ${isRetrying ? "animate-spin" : ""}`} aria-hidden="true" />
            </button>
          ) : null}
          {onDelete ? (
            <DeleteConfirmButton
              disabled={isDeleting}
              isPending={isDeleting}
              confirmTitle="Delete this resume?"
              confirmDescription="This will permanently delete the resume and related analysis."
              onConfirm={() => onDelete(resume)}
            />
          ) : null}
        </div>
      </td>
    </tr>
  );
}
