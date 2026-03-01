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
    return <Badge tone="warning">{formatStatusLabel(status)}</Badge>;
  }

  if (isResumeCompletedStatus(status)) {
    return <Badge tone="success">{formatStatusLabel(status)}</Badge>;
  }

  if (isResumeFailedStatus(status)) {
    return <Badge tone="danger">{formatStatusLabel(status)}</Badge>;
  }

  return <Badge tone="neutral">{formatStatusLabel(status)}</Badge>;
}
