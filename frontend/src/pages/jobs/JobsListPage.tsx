import { Link } from "react-router-dom";
import { ErrorState } from "../../components/common/ErrorState";
import { EmptyState } from "../../components/common/EmptyState";
import { Loader } from "../../components/common/Loader";
import { JobCard } from "../../components/jobs/JobCard";
import { Button } from "../../components/ui/Button";
import { useJobs } from "../../hooks/jobs/useJobs";

export function JobsListPage() {
  const jobsQuery = useJobs();
  const jobs = Array.isArray(jobsQuery.data) ? jobsQuery.data : [];

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
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
