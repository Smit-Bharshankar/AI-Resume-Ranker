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
    return <Badge variant="secondary">DRAFT</Badge>;
  }

  if (isExtractingRequirements(status)) {
    return <Badge variant="warning">EXTRACTING REQUIREMENTS</Badge>;
  }

  if (isRequirementsStructured(status)) {
    return <Badge variant="info">REQUIREMENTS STRUCTURED</Badge>;
  }

  if (isJobActive(status)) {
    return <Badge variant="success">ACTIVE</Badge>;
  }

  return <Badge variant="destructive">FAILED STRUCTURE</Badge>;
}
