import { ResumeStatus } from "../../types/resume";
import {
  isResumeCompletedStatus,
  isResumeFailedStatus,
  isResumeProcessingStatus,
} from "../../utils/resumeStatusUtils";
import { Badge } from "../ui/Badge";

type CandidateStatusBadgeProps = {
  status: ResumeStatus;
};

const formatStatusLabel = (status: ResumeStatus): string =>
  status.replace(/_/g, " ");

export function CandidateStatusBadge({ status }: CandidateStatusBadgeProps) {
  if (isResumeProcessingStatus(status)) {
    return <Badge variant="warning">{formatStatusLabel(status)}</Badge>;
  }

  if (isResumeCompletedStatus(status)) {
    return <Badge variant="success">{formatStatusLabel(status)}</Badge>;
  }

  if (isResumeFailedStatus(status)) {
    return <Badge variant="destructive">{formatStatusLabel(status)}</Badge>;
  }

  return <Badge variant="secondary">{formatStatusLabel(status)}</Badge>;
}
