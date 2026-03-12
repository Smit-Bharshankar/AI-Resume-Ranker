import { Link } from "react-router-dom";
import { CandidateStage, Resume } from "../../types/resume";
import { Button } from "../ui/Button";
import { CandidateStatusBadge } from "./CandidateStatusBadge";
import { CandidateStageSelector } from "../workflow/CandidateStageSelector";
import { DeleteConfirmButton } from "../common/DeleteConfirmButton";

type CandidateRowProps = {
  resume: Resume;
  onStageChange: (resumeId: string, stage: CandidateStage) => void;
  onDelete?: (resume: Resume) => void;
  isDeleting?: boolean;
  isStageUpdating?: boolean;
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
  isDeleting = false,
  isStageUpdating = false,
}: CandidateRowProps) {
  return (
    <tr className="border-t border-slate-200">
      <td className="px-4 py-3 text-sm font-medium text-slate-900">{toDisplayName(resume)}</td>
      <td className="px-4 py-3">
        <CandidateStatusBadge status={resume.status} />
      </td>
      <td className="px-4 py-3 text-sm text-slate-700">{toScoreLabel(resume.score)}</td>
      <td className="px-4 py-3 text-sm text-slate-700">{toRecommendationLabel(resume)}</td>
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
