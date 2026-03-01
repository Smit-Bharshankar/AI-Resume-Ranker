import { Link } from "react-router-dom";
import { Resume } from "../../types/resume";
import { Button } from "../ui/Button";
import { CandidateStatusBadge } from "./CandidateStatusBadge";

type CandidateRowProps = {
  resume: Resume;
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

export function CandidateRow({ resume }: CandidateRowProps) {
  return (
    <tr className="border-t border-slate-200">
      <td className="px-4 py-3 text-sm font-medium text-slate-900">{toDisplayName(resume)}</td>
      <td className="px-4 py-3">
        <CandidateStatusBadge status={resume.status} />
      </td>
      <td className="px-4 py-3 text-sm text-slate-700">{toScoreLabel(resume.score)}</td>
      <td className="px-4 py-3 text-sm text-slate-700">{toRecommendationLabel(resume)}</td>
      <td className="px-4 py-3 text-right">
        <Link to={`/candidates/${resume.id}`}>
          <Button variant="secondary">View Details</Button>
        </Link>
      </td>
    </tr>
  );
}
