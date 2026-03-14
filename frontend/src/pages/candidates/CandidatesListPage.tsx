import { useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ErrorState } from "../../components/common/ErrorState";
import { Loader } from "../../components/common/Loader";
import { CandidateTable } from "../../components/candidates/CandidateTable";
import { UploadResumeDropzone } from "../../components/candidates/UploadResumeDropzone";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../components/ui/Breadcrumb";
import { Card } from "../../components/ui/Card";
import { useDeleteResume } from "../../hooks/resumes/useDeleteResume";
import { useUpdateCandidateStage } from "../../hooks/resumes/useUpdateCandidateStage";
import { useResumes } from "../../hooks/resumes/useResumes";
import { CandidateStage, Resume } from "../../types/resume";
import {
  CANDIDATE_STAGE_FILTERS,
  CandidateStageFilter,
  getCandidateStageLabel,
} from "../../utils/candidateStageUtils";
import {
  shouldPollResumeStatus,
} from "../../utils/resumeStatusUtils";

const sortByScoreDesc = (resumes: Resume[]): Resume[] => {
  return [...resumes].sort((a, b) => {
    const aScore = typeof a.score === "number" ? a.score : -1;
    const bScore = typeof b.score === "number" ? b.score : -1;
    return bScore - aScore;
  });
};

export function CandidatesListPage() {
  const location = useLocation();
  const { jobId } = useParams<{ jobId: string }>();
  const safeJobId = jobId ?? "";
  const resumesQuery = useResumes(safeJobId);
  const deleteResumeMutation = useDeleteResume();
  const updateCandidateStageMutation = useUpdateCandidateStage();
  const [selectedStageFilter, setSelectedStageFilter] =
    useState<CandidateStageFilter>("ALL");

  const resumes = useMemo<Resume[]>(() => {
    if (!resumesQuery.data) {
      return [];
    }

    const filtered =
      selectedStageFilter === "ALL"
        ? resumesQuery.data
        : resumesQuery.data.filter((resume) => resume.stage === selectedStageFilter);

    return sortByScoreDesc(filtered);
  }, [resumesQuery.data, selectedStageFilter]);

  const hasActiveProcessing = useMemo(() => {
    return resumes.some((resume) => shouldPollResumeStatus(resume.status));
  }, [resumes]);
  const jobTitleFromState =
    (location.state as { jobTitle?: string } | null)?.jobTitle?.trim() ?? "";
  const jobLabel = jobTitleFromState || "Selected job";

  const handleStageChange = (resumeId: string, stage: CandidateStage) => {
    updateCandidateStageMutation.mutate({ resumeId, stage });
  };

  const handleDeleteResume = async (resume: Resume) => {
    await deleteResumeMutation.mutateAsync({
      resumeId: resume.id,
      jobId: resume.jobId,
      confirm: true,
    });
  };

  if (!jobId) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <ErrorState title="Invalid route" message="Job ID is missing from URL." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 pt-8 sm:px-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/jobs">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={`/jobs/${jobId}`}>Job</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Candidates</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Candidates</h1>
          <p className="text-sm text-muted-foreground">Job: {jobLabel}</p>
        </div>
      </div>

      <UploadResumeDropzone
        jobId={jobId}
        onUploaded={() => {
          void resumesQuery.refetch();
        }}
      />

      {resumesQuery.isLoading ? <Loader label="Loading candidates..." /> : null}

      {resumesQuery.isError ? (
        <ErrorState
          title="Failed to load candidates"
          message={resumesQuery.error.message}
          onRetry={() => {
            void resumesQuery.refetch();
          }}
        />
      ) : null}

      {hasActiveProcessing ? (
        <Card className="rounded-xl">
          <div className="flex items-center justify-between gap-3">
            <Loader label="Processing resumes. Refreshing list every 2 seconds..." />
            <button
              type="button"
              className="text-sm text-foreground underline"
              onClick={() => {
                void resumesQuery.refetch();
              }}
            >
              Refresh now
            </button>
          </div>
        </Card>
      ) : null}

      <Card className="rounded-xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold">Filter by stage:</span>
          {CANDIDATE_STAGE_FILTERS.map((filterOption) => {
            const isActive = selectedStageFilter === filterOption;
            const label =
              filterOption === "ALL" ? "All" : getCandidateStageLabel(filterOption);

            return (
              <button
                key={filterOption}
                type="button"
                onClick={() => {
                  setSelectedStageFilter(filterOption);
                }}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide transition ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </Card>

      {resumesQuery.isSuccess ? (
        <CandidateTable
          resumes={resumes}
          onStageChange={handleStageChange}
          onDeleteResume={handleDeleteResume}
          deletingResumeId={
            deleteResumeMutation.isPending
              ? deleteResumeMutation.variables?.resumeId
              : undefined
          }
          updatingResumeId={
            updateCandidateStageMutation.isPending
              ? updateCandidateStageMutation.variables?.resumeId
              : undefined
          }
        />
      ) : null}
    </div>
  );
}
