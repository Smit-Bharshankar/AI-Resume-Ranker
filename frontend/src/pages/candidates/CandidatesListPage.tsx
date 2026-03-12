import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
    <div className="mx-auto max-w-6xl space-y-6 p-6">
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
          <h1 className="text-2xl font-bold text-slate-900">Candidates</h1>
          <p className="text-sm text-slate-600">Job ID: {jobId}</p>
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
        <Card>
          <div className="flex items-center justify-between gap-3">
            <Loader label="Processing resumes. Refreshing list every 2 seconds..." />
            <button
              type="button"
              className="text-sm text-slate-700 underline"
              onClick={() => {
                void resumesQuery.refetch();
              }}
            >
              Refresh now
            </button>
          </div>
        </Card>
      ) : null}

      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-slate-900">Filter by stage:</span>
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
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
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
