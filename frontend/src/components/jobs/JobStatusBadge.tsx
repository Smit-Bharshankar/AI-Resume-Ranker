import { Badge } from "../ui/Badge";
import { JobStatus } from "../../types/job";
import {
  isDraft,
  isExtractingRequirements,
  isJobActive,
  isRequirementsStructured,
} from "../../utils/statusUtils";

type JobStatusBadgeProps = {
  status: JobStatus;
};

export function JobStatusBadge({ status }: JobStatusBadgeProps) {
  if (isDraft(status)) {
    return <Badge tone="neutral">DRAFT</Badge>;
  }

  if (isExtractingRequirements(status)) {
    return <Badge tone="warning">EXTRACTING REQUIREMENTS</Badge>;
  }

  if (isRequirementsStructured(status)) {
    return <Badge tone="info">REQUIREMENTS STRUCTURED</Badge>;
  }

  if (isJobActive(status)) {
    return <Badge tone="success">ACTIVE</Badge>;
  }

  return <Badge tone="danger">FAILED STRUCTURE</Badge>;
}
