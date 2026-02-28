import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ErrorState } from "../../components/common/ErrorState";
import { Loader } from "../../components/common/Loader";
import { CandidateTable } from "../../components/candidates/CandidateTable";
import { UploadResumeDropzone } from "../../components/candidates/UploadResumeDropzone";
import { Card } from "../../components/ui/Card";
import { useResumes } from "../../hooks/resumes/useResumes";
import { Resume } from "../../types/resume";
import { shouldPollResumeStatus } from "../../utils/resumeStatusUtils";

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

  const resumes = useMemo(() => {
    if (!resumesQuery.data) {
      return [];
    }
    return sortByScoreDesc(resumesQuery.data);
  }, [resumesQuery.data]);

  const hasActiveProcessing = useMemo(() => {
    return resumes.some((resume) => shouldPollResumeStatus(resume.status));
  }, [resumes]);

  if (!jobId) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <ErrorState title="Invalid route" message="Job ID is missing from URL." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900">Candidates</h1>
          <p className="text-sm text-slate-600">Job ID: {jobId}</p>
        </div>
        <Link className="text-sm text-slate-600 underline" to={`/jobs/${jobId}`}>
          Back to Job
        </Link>
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

      {resumesQuery.isSuccess ? <CandidateTable resumes={resumes} /> : null}
    </div>
  );
}
