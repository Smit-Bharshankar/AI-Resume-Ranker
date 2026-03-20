import { Link } from "react-router-dom";
import { Job } from "../../types/job";
import { isDraft, isJobActive, isRequirementsStructured } from "../../utils/statusUtils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card";
import { ActivateJobButton } from "./ActivateJobButton";
import { ExtractRequirementsButton } from "./ExtractRequirementsButton";
import { JobStatusBadge } from "./JobStatusBadge";
import { DeleteConfirmButton } from "../common/DeleteConfirmButton";
import { Button } from "../ui/Button";

type JobCardProps = {
  job: Job;
  onDelete?: (job: Job) => void;
  isDeleting?: boolean;
};

export function JobCard({ job, onDelete, isDeleting = false }: JobCardProps) {
  const shortDescription =
    job.rawDescription.length > 180
      ? `${job.rawDescription.slice(0, 180).trimEnd()}...`
      : job.rawDescription;

  return (
    <Card className="overflow-hidden rounded-xl border-border/70">
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-xl">{job.title}</CardTitle>
          <CardDescription>
            {job.createdAt ? `Created: ${new Date(job.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric'
            }).replace(/ /g, '/')}` : "Job pipeline"}
          </CardDescription>
        </div>
        <JobStatusBadge status={job.status} />
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{shortDescription}</p>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="secondary" size="sm">
            <Link to={`/jobs/${job.id}`}>View Details</Link>
          </Button>
          {isDraft(job.status) ? <ExtractRequirementsButton jobId={job.id} /> : null}
          {isRequirementsStructured(job.status) ? <ActivateJobButton jobId={job.id} /> : null}
        </div>

        <div className="flex items-center justify-between">
          <div>
            {isJobActive(job.status) ? (
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Job is active.</p>
            ) : null}
          </div>

          {onDelete ? (
            <DeleteConfirmButton
              disabled={isDeleting}
              isPending={isDeleting}
              confirmTitle="Delete this job?"
              confirmDescription="This will permanently delete the job and all associated resumes."
              onConfirm={() => onDelete(job)}
            />
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
