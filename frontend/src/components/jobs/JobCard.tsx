import { Link } from "react-router-dom";
import { Job } from "../../types/job";
import { isDraft, isJobActive, isRequirementsStructured } from "../../utils/statusUtils";
import { Card } from "../ui/Card";
import { ActivateJobButton } from "./ActivateJobButton";
import { ExtractRequirementsButton } from "./ExtractRequirementsButton";
import { JobStatusBadge } from "./JobStatusBadge";

type JobCardProps = {
  job: Job;
};

export function JobCard({ job }: JobCardProps) {
  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
          <Link className="text-sm text-slate-600 underline" to={`/jobs/${job.id}`}>
            View details
          </Link>
        </div>
        <JobStatusBadge status={job.status} />
      </div>

      {isDraft(job.status) ? <ExtractRequirementsButton jobId={job.id} /> : null}
      {isRequirementsStructured(job.status) ? (
        <ActivateJobButton jobId={job.id} />
      ) : null}
      {isJobActive(job.status) ? (
        <p className="text-sm font-medium text-emerald-700">Job is active.</p>
      ) : null}
    </Card>
  );
}
