import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAnalyticsEvents } from "../../analytics/events";
import { DeleteConfirmButton } from "../../components/common/DeleteConfirmButton";
import { ErrorState } from "../../components/common/ErrorState";
import { Loader } from "../../components/common/Loader";
import { ActivateJobButton } from "../../components/jobs/ActivateJobButton";
import { ExtractRequirementsButton } from "../../components/jobs/ExtractRequirementsButton";
import { JobStatusBadge } from "../../components/jobs/JobStatusBadge";
import { RequirementsEditor } from "../../components/jobs/RequirementsEditor";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../components/ui/Breadcrumb";
import { Card } from "../../components/ui/Card";
import { useDeleteJob } from "../../hooks/jobs/useDeleteJob";
import { useJob } from "../../hooks/jobs/useJob";
import { useJobPolling } from "../../hooks/jobs/useJobPolling";
import {
  isDraft,
  isExtractingRequirements,
  isJobActive,
  isRequirementsStructured,
} from "../../utils/statusUtils";
import { Button } from "@/components/ui/Button";

export function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const safeJobId = jobId ?? "";
  const [forcePolling, setForcePolling] = useState<boolean>(false);
  const trackedAnalysisCompletions = useRef<Set<string>>(new Set());
  const { trackAnalysisCompleted, trackAnalysisStarted } = useAnalyticsEvents();
  const deleteJobMutation = useDeleteJob();

  const jobQuery = useJob(safeJobId);
  const shouldPollFromStatus = useMemo(() => {
    if (!jobQuery.data) {
      return false;
    }
    return isExtractingRequirements(jobQuery.data.status);
  }, [jobQuery.data]);
  const pollingQuery = useJobPolling(safeJobId, forcePolling || shouldPollFromStatus);

  const job = pollingQuery.data ?? jobQuery.data;

  const handleDeleteJob = async () => {
    if (!job) {
      return;
    }
    await deleteJobMutation.mutateAsync({ jobId: job.id, confirm: true });
    void navigate("/jobs");
  };

  useEffect(() => {
    if (job && !isExtractingRequirements(job.status)) {
      setForcePolling(false);
    }
  }, [job]);

  useEffect(() => {
    if (!job) {
      return;
    }

    const completionKey = `${job.id}:${job.status}`;
    if (trackedAnalysisCompletions.current.has(completionKey)) {
      return;
    }

    if (job.status === "REQUIREMENTS_STRUCTURED") {
      trackedAnalysisCompletions.current.add(completionKey);
      trackAnalysisCompleted("requirements_extraction", job.id, "success");
      return;
    }

    if (job.status === "FAILED_STRUCTURE") {
      trackedAnalysisCompletions.current.add(completionKey);
      trackAnalysisCompleted("requirements_extraction", job.id, "failed");
    }
  }, [job, trackAnalysisCompleted]);

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
    <div className="mx-auto max-w-5xl space-y-6 px-4 pt-8 sm:px-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/jobs">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{job.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">{job.title}</h1>
          <JobStatusBadge status={job.status} />
        </div>
        <div className="flex items-center gap-2">
          <DeleteConfirmButton
            disabled={deleteJobMutation.isPending}
            isPending={deleteJobMutation.isPending}
            confirmTitle="Delete this job?"
            confirmDescription="This will permanently delete the job and all associated resumes."
            onConfirm={handleDeleteJob}
          />
        </div>
      </div>

       {isJobActive(job.status) ? (
        <Card className="rounded-xl">
          <div className="space-y-3">
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              This job is active and ready for candidate workflows.
            </p>
            <Button asChild variant="secondary" size="sm">
              <Link to={`/jobs/${job.id}/candidates`}>
                Open Candidates
              </Link>
            </Button>
          </div>
        </Card>
      ) : null}

      <Card className="space-y-3 rounded-xl">
        <h2 className="text-lg font-semibold">Raw Description</h2>
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">{job.rawDescription}</p>
      </Card>

      {isDraft(job.status) ? (
        <ExtractRequirementsButton
          jobId={job.id}
          onTriggered={() => {
            setForcePolling(true);
            trackAnalysisStarted("requirements_extraction", job.id);
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
