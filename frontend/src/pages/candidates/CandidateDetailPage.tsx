import { lazy, Suspense, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAnalyticsEvents } from "../../analytics/events";
import { CandidateProfileHeader } from "../../components/candidates/CandidateProfileHeader";
import { CandidateSkillsMatch } from "../../components/candidates/CandidateSkillsMatch";
import { DeleteConfirmButton } from "../../components/common/DeleteConfirmButton";
import { ErrorState } from "../../components/common/ErrorState";
import { Loader } from "../../components/common/Loader";
import { InsightInterviewQuestions } from "../../components/insights/InsightInterviewQuestions";
import { InsightRecommendation } from "../../components/insights/InsightRecommendation";
import { InsightStrengths } from "../../components/insights/InsightStrengths";
import { InsightSummary } from "../../components/insights/InsightSummary";
import { InsightWeaknesses } from "../../components/insights/InsightWeaknesses";
import { ScoreBreakdown } from "../../components/scoring/ScoreBreakdown";
import { ScoreDisplay } from "../../components/scoring/ScoreDisplay";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../components/ui/Breadcrumb";
import { Card } from "../../components/ui/Card";
import { useJob } from "../../hooks/jobs/useJob";
import { useCandidateResumeDetail } from "../../hooks/resumes/useCandidateResumeDetail";
import { useDeleteResume } from "../../hooks/resumes/useDeleteResume";
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
  const navigate = useNavigate();
  const safeResumeId = resumeId ?? "";

  const resumeQuery = useCandidateResumeDetail(safeResumeId);
  const deleteResumeMutation = useDeleteResume();
  const updateCandidateStageMutation = useUpdateCandidateStage();
  const resume = resumeQuery.data;
  const trackedResumeIds = useRef<Set<string>>(new Set());
  const { trackCandidateViewed } = useAnalyticsEvents();
  const jobQuery = useJob(resume?.jobId ?? "");

  const isProcessing = useMemo(
    () => (resume ? isResumeProcessingStatus(resume.status) : false),
    [resume]
  );
  const isInsightsGenerating = resume?.status === "INSIGHTS_GENERATING";
  const isFailed = resume ? isResumeFailedStatus(resume.status) : false;

  useEffect(() => {
    if (!resume) {
      return;
    }

    if (trackedResumeIds.current.has(resume.id)) {
      return;
    }

    trackedResumeIds.current.add(resume.id);
    trackCandidateViewed(resume.id);
  }, [resume, trackCandidateViewed]);

  const handleStageChange = (stage: CandidateStage) => {
    if (!resume) {
      return;
    }

    updateCandidateStageMutation.mutate({
      resumeId: resume.id,
      stage,
    });
  };

  const handleDeleteResume = async () => {
    if (!resume) {
      return;
    }
    await deleteResumeMutation.mutateAsync({
      resumeId: resume.id,
      jobId: resume.jobId,
      confirm: true,
    });
    void navigate(`/jobs/${resume.jobId}/candidates`);
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
              <Link to={`/jobs/${resume.jobId}`}>Job</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={`/jobs/${resume.jobId}/candidates`}>Candidates</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Candidate Profile</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Candidate Profile</h1>
        <div className="flex items-center gap-2">
          <DeleteConfirmButton
            disabled={deleteResumeMutation.isPending}
            isPending={deleteResumeMutation.isPending}
            confirmTitle="Delete this resume?"
            confirmDescription="This will permanently delete the resume and related analysis."
            onConfirm={handleDeleteResume}
          />
        </div>
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
        <Card className="rounded-xl border-border/70">
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
              <Card className="rounded-xl border-border/70">
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
