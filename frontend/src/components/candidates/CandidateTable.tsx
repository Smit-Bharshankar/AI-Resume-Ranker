import { Resume } from "../../types/resume";
import { EmptyState } from "../common/EmptyState";
import { Card } from "../ui/Card";
import { CandidateRow } from "./CandidateRow";

type CandidateTableProps = {
  resumes: Resume[];
};

export function CandidateTable({ resumes }: CandidateTableProps) {
  if (resumes.length === 0) {
    return (
      <EmptyState
        title="No candidates yet"
        description="Upload one or more PDF resumes to start processing candidates."
      />
    );
  }

  return (
    <Card className="overflow-x-auto p-0">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-slate-50 text-left">
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
              Candidate
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
              Status
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
              Score
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
              Recommendation
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {resumes.map((resume) => (
            <CandidateRow key={resume.id} resume={resume} />
          ))}
        </tbody>
      </table>
    </Card>
  );
}
