import { Link } from "react-router-dom";
import { ErrorState } from "../../components/common/ErrorState";
import { EmptyState } from "../../components/common/EmptyState";
import { Loader } from "../../components/common/Loader";
import { JobCard } from "../../components/jobs/JobCard";
import { Button } from "../../components/ui/Button";
import { ApiClientError } from "../../api/axiosClient";
import { Job } from "../../types/job";
import { useDeleteJob } from "../../hooks/jobs/useDeleteJob";
import { useJobs } from "../../hooks/jobs/useJobs";

export function JobsListPage() {
  const jobsQuery = useJobs();
  const deleteJobMutation = useDeleteJob();
  const jobs = Array.isArray(jobsQuery.data) ? jobsQuery.data : [];

  const handleDeleteJob = async (job: Job) => {
    const firstConfirm = window.confirm(
      "Delete this job and all associated resumes? This cannot be undone."
    );

    if (!firstConfirm) {
      return;
    }

    try {
      await deleteJobMutation.mutateAsync({ jobId: job.id });
    } catch (error) {
      if (!(error instanceof ApiClientError) || error.statusCode !== 409) {
        return;
      }

      const forceConfirm = window.confirm(
        "Some resumes are still processing. Delete anyway and cancel processing jobs?"
      );

      if (!forceConfirm) {
        return;
      }

      await deleteJobMutation.mutateAsync({ jobId: job.id, confirm: true });
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Jobs</h1>
        <Link to="/jobs/create">
          <Button>Create Job</Button>
        </Link>
      </div>

      {jobsQuery.isLoading ? <Loader label="Loading jobs..." /> : null}

      {jobsQuery.isError ? (
        <ErrorState
          title="Failed to load jobs"
          message={jobsQuery.error.message}
          onRetry={() => jobsQuery.refetch()}
        />
      ) : null}

      {jobsQuery.isSuccess && jobs.length === 0 ? (
        <EmptyState
          title="No jobs found"
          description="Create your first job to start extracting requirements."
          action={
            <Link to="/jobs/create">
              <Button>Create Job</Button>
            </Link>
          }
        />
      ) : null}

      {jobsQuery.isSuccess && jobs.length > 0 ? (
        <div className="space-y-4">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onDelete={handleDeleteJob}
              isDeleting={deleteJobMutation.isPending && deleteJobMutation.variables?.jobId === job.id}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
