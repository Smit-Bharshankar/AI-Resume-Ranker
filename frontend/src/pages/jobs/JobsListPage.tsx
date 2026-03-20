import { Link } from "react-router-dom";
import { ErrorState } from "../../components/common/ErrorState";
import { EmptyState } from "../../components/common/EmptyState";
import { Loader } from "../../components/common/Loader";
import { JobCard } from "../../components/jobs/JobCard";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "../../components/ui/Breadcrumb";
import { Button } from "../../components/ui/Button";
import { Job } from "../../types/job";
import { useDeleteJob } from "../../hooks/jobs/useDeleteJob";
import { useJobs } from "../../hooks/jobs/useJobs";
import { useUsage } from "../../hooks/users/useUsage";
import { Card } from "../../components/ui/Card";

export function JobsListPage() {
  const jobsQuery = useJobs();
  const usageQuery = useUsage();
  const deleteJobMutation = useDeleteJob();
  const jobs = Array.isArray(jobsQuery.data) ? jobsQuery.data : [];

  const handleDeleteJob = async (job: Job) => {
    await deleteJobMutation.mutateAsync({ jobId: job.id, confirm: true });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 pt-8 sm:px-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Home</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Jobs</h1>
          <p className="text-sm text-muted-foreground">
            Manage job descriptions, activate workflows, and track progress.
          </p>
        </div>
        <Link to="/jobs/create">
          <Button>Create Job</Button>
        </Link>
      </div>

      {usageQuery.isSuccess ? (
        <Card className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground tracking-tight">Account Usage</h3>
            <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-secondary text-secondary-foreground rounded-full border border-border">
              Free Tier
            </span>
          </div>

          <div className="space-y-6">
      {/* Active Jobs Section */}
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <span className="text-xs text-muted-foreground font-medium">Active Job Slots</span>
          <span className="text-xs font-mono font-semibold">
            {usageQuery.data.jobs.currentCount} <span className="text-muted-foreground">/ {usageQuery.data.jobs.currentLimit}</span>
          </span>
        </div>
        
        {/* Custom Progress Bar */}
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-in-out" 
            style={{ width: `${Math.min((usageQuery.data.jobs.currentCount / usageQuery.data.jobs.currentLimit) * 100, 100)}%` }}
          />
        </div>
        <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
          Deleting a job frees up a slot immediately.
        </p>
      </div>

      {/* Thin Divider Line */}
      <div className="h-px w-full bg-border/60" />

      {/* Lifetime Resumes Section */}
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <span className="text-xs text-muted-foreground font-medium">Monthly Capacity</span>
          <span className="text-xs font-mono font-semibold text-foreground">
            {usageQuery.data.resumes.completedCount + usageQuery.data.resumes.inFlightCount} 
            <span className="text-muted-foreground"> / {usageQuery.data.resumes.lifetimeLimit}</span>
          </span>
        </div>

        {/* Custom Progress Bar */}
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary/60 transition-all duration-500 ease-in-out" 
            style={{ width: `${Math.min(((usageQuery.data.resumes.completedCount + usageQuery.data.resumes.inFlightCount) / usageQuery.data.resumes.lifetimeLimit) * 100, 100)}%` }}
          />
        </div>

        <div className="mt-3 space-y-2">
          <p className="text-[11px] text-muted-foreground">
            Current activity: <span className="text-foreground font-medium">{usageQuery.data.resumes.inFlightCount} processing</span>.
          </p>
          
          {/* Subtle Warning/Info Box */}
          <div className="p-2 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100/50 dark:border-amber-900/30 rounded-lg">
            <p className="text-[10px] leading-normal text-amber-700 dark:text-amber-400">
              <span className="font-bold">Note:</span> Completed resumes ({usageQuery.data.resumes.completedCount}) are permanent and do not decrease if deleted.
            </p>
          </div>
        </div>
      </div>
    </div>
        </Card>
      ) : null}

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
