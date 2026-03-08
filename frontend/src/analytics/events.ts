import { usePostHog } from "@posthog/react";

type AnalyticsValue = string | number | boolean | null;
type AnalyticsProperties = Record<string, AnalyticsValue>;

type PostHogLike = {
  capture: (eventName: string, properties?: AnalyticsProperties) => void;
};

const capture = (
  posthog: PostHogLike | null | undefined,
  eventName: string,
  properties?: AnalyticsProperties,
) => {
  if (!posthog) {
    return;
  }

  posthog.capture(eventName, properties);
};

export const trackSignupCompleted = (
  posthog: PostHogLike | null | undefined,
  authMethod: "email" | "google",
) => {
  capture(posthog, "signup_completed", { auth_method: authMethod });
};

export const trackJobCreated = (posthog: PostHogLike | null | undefined, jobId: string) => {
  capture(posthog, "job_created", { job_id: jobId });
};

export const trackResumeUploaded = (
  posthog: PostHogLike | null | undefined,
  fileType: string,
  fileCount: number,
) => {
  capture(posthog, "resume_uploaded", { file_type: fileType, file_count: fileCount });
};

export const trackAnalysisStarted = (
  posthog: PostHogLike | null | undefined,
  analysisType: "requirements_extraction" | "resume_analysis",
  targetId: string,
) => {
  capture(posthog, "analysis_started", {
    analysis_type: analysisType,
    target_id: targetId,
  });
};

export const trackAnalysisCompleted = (
  posthog: PostHogLike | null | undefined,
  analysisType: "requirements_extraction" | "resume_analysis",
  targetId: string,
  status: "success" | "failed",
) => {
  capture(posthog, "analysis_completed", {
    analysis_type: analysisType,
    target_id: targetId,
    status,
  });
};

export const trackCandidateViewed = (
  posthog: PostHogLike | null | undefined,
  candidateId: string,
) => {
  capture(posthog, "candidate_viewed", { candidate_id: candidateId });
};

export const useAnalyticsEvents = () => {
  const posthog = usePostHog();

  return {
    trackSignupCompleted: (authMethod: "email" | "google") =>
      trackSignupCompleted(posthog, authMethod),
    trackJobCreated: (jobId: string) => trackJobCreated(posthog, jobId),
    trackResumeUploaded: (fileType: string, fileCount: number) =>
      trackResumeUploaded(posthog, fileType, fileCount),
    trackAnalysisStarted: (
      analysisType: "requirements_extraction" | "resume_analysis",
      targetId: string,
    ) => trackAnalysisStarted(posthog, analysisType, targetId),
    trackAnalysisCompleted: (
      analysisType: "requirements_extraction" | "resume_analysis",
      targetId: string,
      status: "success" | "failed",
    ) => trackAnalysisCompleted(posthog, analysisType, targetId, status),
    trackCandidateViewed: (candidateId: string) => trackCandidateViewed(posthog, candidateId),
  };
};
