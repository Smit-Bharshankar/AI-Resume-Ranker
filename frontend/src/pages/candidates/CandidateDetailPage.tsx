import { lazy, Suspense, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { CandidateProfileHeader } from "../../components/candidates/CandidateProfileHeader";
import { CandidateSkillsMatch } from "../../components/candidates/CandidateSkillsMatch";
import { ErrorState } from "../../components/common/ErrorState";
import { Loader } from "../../components/common/Loader";
import { InsightInterviewQuestions } from "../../components/insights/InsightInterviewQuestions";
import { InsightRecommendation } from "../../components/insights/InsightRecommendation";
import { InsightStrengths } from "../../components/insights/InsightStrengths";
import { InsightSummary } from "../../components/insights/InsightSummary";
import { InsightWeaknesses } from "../../components/insights/InsightWeaknesses";
import { ScoreBreakdown } from "../../components/scoring/ScoreBreakdown";
import { ScoreDisplay } from "../../components/scoring/ScoreDisplay";
import { Card } from "../../components/ui/Card";
import { useJob } from "../../hooks/jobs/useJob";
import { useCandidateResumeDetail } from "../../hooks/resumes/useCandidateResumeDetail";
import { useUpdateCandidateStage } from "../../hooks/resumes/useUpdateCandidateStage";
import { CandidateStage } from "../../types/resume";
import {
  isResumeFailedStatus,
  isResumeProcessingStatus,
} from "../../utils/resumeStatusUtils";

const ResumeViewer = lazy(() =>
  import("../../components/resume/ResumeViewer").then((module) => ({
    default: module.ResumeViewer,
  }))
);

export function CandidateDetailPage() {
  const { resumeId } = useParams<{ resumeId: string }>();
  const safeResumeId = resumeId ?? "";

  const resumeQuery = useCandidateResumeDetail(safeResumeId);
  const updateCandidateStageMutation = useUpdateCandidateStage();
  const resume = resumeQuery.data;
  const jobQuery = useJob(resume?.jobId ?? "");

  const isProcessing = useMemo(
    () => (resume ? isResumeProcessingStatus(resume.status) : false),
    [resume]
  );
  const isInsightsGenerating = resume?.status === "INSIGHTS_GENERATING";
  const isFailed = resume ? isResumeFailedStatus(resume.status) : false;

  const handleStageChange = (stage: CandidateStage) => {
    if (!resume) {
      return;
    }

    updateCandidateStageMutation.mutate({
      resumeId: resume.id,
      stage,
    });
  };

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
        <h1 className="text-2xl font-bold text-slate-900">Candidate Profile</h1>
        <Link className="text-sm text-slate-600 underline" to={`/jobs/${resume.jobId}/candidates`}>
          Back to Candidates
        </Link>
      </div>

      <CandidateProfileHeader
        candidateId={resume.id}
        candidateName={resume.structuredData?.name}
        jobTitle={jobQuery.data?.title}
        score={resume.score}
        status={resume.status}
        stage={resume.stage}
        onStageChange={handleStageChange}
        isStageUpdating={
          updateCandidateStageMutation.isPending &&
          updateCandidateStageMutation.variables?.resumeId === resume.id
        }
        recommendation={resume.insights?.recommendation}
      />

      {isProcessing ? (
        <Card>
          <Loader label="Candidate processing in progress. Refreshing every 2 seconds..." />
        </Card>
      ) : null}

      {isFailed ? (
        <ErrorState
          title="Candidate processing failed"
          message={`Processing ended with status: ${resume.status.replace(/_/g, " ")}.`}
        />
      ) : null}

      {jobQuery.isError ? (
        <ErrorState
          title="Failed to load job details"
          message={jobQuery.error.message}
          onRetry={() => {
            void jobQuery.refetch();
          }}
        />
      ) : null}

      {resumeQuery.isError && resume ? (
        <ErrorState
          title="Live refresh interrupted"
          message={resumeQuery.error.message}
          onRetry={() => {
            void resumeQuery.refetch();
          }}
        />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Suspense
            fallback={
              <Card>
                <Loader label="Loading resume viewer..." />
              </Card>
            }
          >
            <ResumeViewer resumeId={resume.id} />
          </Suspense>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <ScoreDisplay score={resume.score} isGenerating={isProcessing} />
          <ScoreBreakdown
            scoreBreakdown={resume.scoreBreakdown}
            isGenerating={isProcessing}
          />
          <InsightSummary insights={resume.insights} isGenerating={isInsightsGenerating} />
          <InsightStrengths insights={resume.insights} isGenerating={isInsightsGenerating} />
          <InsightWeaknesses insights={resume.insights} isGenerating={isInsightsGenerating} />
          <InsightInterviewQuestions
            insights={resume.insights}
            isGenerating={isInsightsGenerating}
          />
          <InsightRecommendation
            insights={resume.insights}
            isGenerating={isInsightsGenerating}
          />
          <CandidateSkillsMatch
            requiredSkills={jobQuery.data?.structuredRequirements?.required_skills}
            candidateSkills={resume.structuredData?.skills}
            isGenerating={isProcessing || jobQuery.isLoading}
          />
        </div>
      </div>
    </div>
  );
}
