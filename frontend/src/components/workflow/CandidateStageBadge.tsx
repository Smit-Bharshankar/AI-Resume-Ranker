import { CandidateStage } from "../../types/resume";
import { getCandidateStageBadgeTone, getCandidateStageLabel } from "../../utils/candidateStageUtils";
import { Badge } from "../ui/Badge";

type CandidateStageBadgeProps = {
  stage: CandidateStage;
  className?: string;
};

export function CandidateStageBadge({ stage, className }: CandidateStageBadgeProps) {
  return (
    <Badge tone={getCandidateStageBadgeTone(stage)} className={className}>
      {getCandidateStageLabel(stage)}
    </Badge>
  );
}
