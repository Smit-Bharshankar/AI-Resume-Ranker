import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ErrorState } from "../../components/common/ErrorState";
import { Loader } from "../../components/common/Loader";
import { CandidateStatusBadge } from "../../components/candidates/CandidateStatusBadge";
import { InsightInterviewQuestions } from "../../components/insights/InsightInterviewQuestions";
import { InsightRecommendation } from "../../components/insights/InsightRecommendation";
import { InsightStrengths } from "../../components/insights/InsightStrengths";
import { InsightSummary } from "../../components/insights/InsightSummary";
import { InsightWeaknesses } from "../../components/insights/InsightWeaknesses";
import { ScoreBreakdown } from "../../components/scoring/ScoreBreakdown";
import { ScoreDisplay } from "../../components/scoring/ScoreDisplay";
import { Card } from "../../components/ui/Card";
import { useResume } from "../../hooks/resumes/useResume";
import { useResumePolling } from "../../hooks/resumes/useResumePolling";
import {
  isResumeFailedStatus,
  shouldPollResumeStatus,
} from "../../utils/resumeStatusUtils";

const toDisplayName = (name: string | undefined, fallbackId: string): string => {
  const trimmed = name?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallbackId;
};

export function CandidateDetailPage() {
  const { resumeId } = useParams<{ resumeId: string }>();
  const safeResumeId = resumeId ?? "";
  const [forcePolling, setForcePolling] = useState<boolean>(false);

  const resumeQuery = useResume(safeResumeId);
  const shouldPollFromStatus = useMemo(() => {
    if (!resumeQuery.data) {
      return false;
    }
    return shouldPollResumeStatus(resumeQuery.data.status);
  }, [resumeQuery.data]);
  const pollingQuery = useResumePolling(
    safeResumeId,
    forcePolling || shouldPollFromStatus
  );

  const resume = pollingQuery.data ?? resumeQuery.data;
  const isInsightsGenerating = resume?.status === "INSIGHTS_GENERATING";
  const isFailed = resume ? isResumeFailedStatus(resume.status) : false;

  useEffect(() => {
    if (resume && !shouldPollResumeStatus(resume.status)) {
      setForcePolling(false);
    }
  }, [resume]);

  if (!resumeId) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <ErrorState title="Invalid route" message="Resume ID is missing from URL." />
      </div>
    );
  }

  if (resumeQuery.isLoading && !resume) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <Loader label="Loading candidate details..." />
      </div>
    );
  }

  if (resumeQuery.isError && !resume) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <ErrorState
          title="Failed to load candidate"
          message={resumeQuery.error.message}
          onRetry={() => {
            void resumeQuery.refetch();
          }}
        />
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <ErrorState title="Candidate not available" message="No resume data was returned." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">
            {toDisplayName(resume.structuredData?.name, resume.id)}
          </h1>
          <div className="flex items-center gap-3">
            <CandidateStatusBadge status={resume.status} />
            <span className="text-sm text-slate-600">Resume ID: {resume.id}</span>
          </div>
        </div>
        <Link className="text-sm text-slate-600 underline" to={`/jobs/${resume.jobId}/candidates`}>
          Back to Candidates
        </Link>
      </div>

      {shouldPollResumeStatus(resume.status) ? (
        <Card>
          <Loader label="Candidate is processing. Refreshing every 2 seconds..." />
        </Card>
      ) : null}

      {isFailed ? (
        <ErrorState
          title="Candidate processing failed"
          message={`Processing ended with status: ${resume.status.replaceAll("_", " ")}.`}
        />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <ScoreDisplay score={resume.score} />
        <InsightRecommendation
          insights={resume.insights}
          isGenerating={isInsightsGenerating}
        />
      </div>

      <ScoreBreakdown scoreBreakdown={resume.scoreBreakdown} />

      <InsightSummary insights={resume.insights} isGenerating={isInsightsGenerating} />
      <InsightStrengths insights={resume.insights} />
      <InsightWeaknesses insights={resume.insights} />
      <InsightInterviewQuestions insights={resume.insights} />

      {pollingQuery.isError ? (
        <ErrorState
          title="Polling interrupted"
          message={pollingQuery.error.message}
          onRetry={() => {
            setForcePolling(true);
            void pollingQuery.refetch();
          }}
        />
      ) : null}
    </div>
  );
}
