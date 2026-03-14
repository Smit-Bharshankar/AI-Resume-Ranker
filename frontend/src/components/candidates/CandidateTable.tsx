import { CandidateStage, Resume } from "../../types/resume";
import { Card } from "../ui/Card";
import { CandidateRow } from "./CandidateRow";

type CandidateTableProps = {
  resumes: Resume[];
  onStageChange: (resumeId: string, stage: CandidateStage) => void;
  onDeleteResume?: (resume: Resume) => void;
  deletingResumeId?: string;
  updatingResumeId?: string;
};

export function CandidateTable({
  resumes,
  onStageChange,
  onDeleteResume,
  deletingResumeId,
  updatingResumeId,
}: CandidateTableProps) {
  if (resumes.length === 0) {
    return (
      <Card className="rounded-xl border-border/70 p-0">
        <div className="border-b bg-muted/30 px-4 py-3">
          <p className="text-sm font-medium text-foreground">0 candidates</p>
        </div>
        <div className="px-6 py-10 text-center">
          <h3 className="text-base font-semibold text-foreground">No candidates yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload one or more PDF resumes to start processing candidates.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden rounded-xl p-0">
      <div className="border-b bg-muted/30 px-4 py-3">
        <p className="text-sm font-medium text-foreground">
          {resumes.length} candidate{resumes.length === 1 ? "" : "s"}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="text-left">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Candidate
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Status
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Score
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Recommendation
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Stage
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {resumes.map((resume) => (
              <CandidateRow
                key={resume.id}
                resume={resume}
                onStageChange={onStageChange}
                onDelete={onDeleteResume}
                isDeleting={deletingResumeId === resume.id}
                isStageUpdating={updatingResumeId === resume.id}
              />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
