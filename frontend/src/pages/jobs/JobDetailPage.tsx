import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ErrorState } from "../../components/common/ErrorState";
import { Loader } from "../../components/common/Loader";
import { ActivateJobButton } from "../../components/jobs/ActivateJobButton";
import { ExtractRequirementsButton } from "../../components/jobs/ExtractRequirementsButton";
import { JobStatusBadge } from "../../components/jobs/JobStatusBadge";
import { RequirementsEditor } from "../../components/jobs/RequirementsEditor";
import { Card } from "../../components/ui/Card";
import { useJob } from "../../hooks/jobs/useJob";
import { useJobPolling } from "../../hooks/jobs/useJobPolling";
import {
  isDraft,
  isExtractingRequirements,
  isJobActive,
  isRequirementsStructured,
} from "../../utils/statusUtils";

export function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const safeJobId = jobId ?? "";
  const [forcePolling, setForcePolling] = useState<boolean>(false);

  const jobQuery = useJob(safeJobId);
  const shouldPollFromStatus = useMemo(() => {
    if (!jobQuery.data) {
      return false;
    }
    return isExtractingRequirements(jobQuery.data.status);
  }, [jobQuery.data]);
  const pollingQuery = useJobPolling(safeJobId, forcePolling || shouldPollFromStatus);

  const job = pollingQuery.data ?? jobQuery.data;

  useEffect(() => {
    if (job && !isExtractingRequirements(job.status)) {
      setForcePolling(false);
    }
  }, [job]);

  if (!jobId) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <ErrorState title="Invalid route" message="Job ID is missing from URL." />
      </div>
    );
  }

  if (jobQuery.isLoading && !job) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <Loader label="Loading job details..." />
      </div>
    );
  }

  if (jobQuery.isError && !job) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <ErrorState
          title="Failed to load job"
          message={jobQuery.error.message}
          onRetry={() => jobQuery.refetch()}
        />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <ErrorState title="Job not available" message="No job data was returned." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
          <JobStatusBadge status={job.status} />
        </div>
        <Link className="text-sm text-slate-600 underline" to="/jobs">
          Back to Jobs
        </Link>
      </div>

       {isJobActive(job.status) ? (
        <Card>
          <div className="space-y-3">
            <p className="text-sm font-medium text-emerald-700">
              This job is active and ready for candidate workflows.
            </p>
            <Link className="text-sm text-slate-700 underline" to={`/jobs/${job.id}/candidates`}>
              Open Candidates
            </Link>
          </div>
        </Card>
      ) : null}

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Raw Description</h2>
        <p className="whitespace-pre-wrap text-sm text-slate-700">{job.rawDescription}</p>
      </Card>

      {isDraft(job.status) ? (
        <ExtractRequirementsButton
          jobId={job.id}
          onTriggered={() => {
            setForcePolling(true);
          }}
        />
      ) : null}

      {isExtractingRequirements(job.status) ? (
        <Card>
          <Loader label="Extracting structured requirements..." />
        </Card>
      ) : null}

      {isRequirementsStructured(job.status) ? (
        <div className="space-y-4">
          <RequirementsEditor jobId={job.id} initialRequirements={job.structuredRequirements} />
          <ActivateJobButton jobId={job.id} />
        </div>
      ) : null}

      {pollingQuery.isError ? (
        <ErrorState
          title="Polling interrupted"
          message={pollingQuery.error.message}
          onRetry={() => pollingQuery.refetch()}
        />
      ) : null}
    </div>
  );
}
