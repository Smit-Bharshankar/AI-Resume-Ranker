import { useQuery } from "@tanstack/react-query";
import { getResumes } from "../../api/resumesApi";
import { Resume } from "../../types/resume";
import { shouldPollResumeStatus } from "../../utils/resumeStatusUtils";

export const resumeQueryKeys = {
  all: ["resumes"] as const,
  byJob: (jobId: string) => [...resumeQueryKeys.all, "job", jobId] as const,
  detail: (resumeId: string) =>
    [...resumeQueryKeys.all, "detail", resumeId] as const,
  file: (resumeId: string) =>
    [...resumeQueryKeys.all, "file", resumeId] as const,
};

export const useResumes = (jobId: string) => {
  return useQuery<Resume[], Error>({
    queryKey: resumeQueryKeys.byJob(jobId),
    queryFn: () => getResumes(jobId),
    enabled: Boolean(jobId),
    retry: 2,
    refetchInterval: (query) => {
      const resumes = query.state.data;
      if (!resumes || resumes.length === 0) {
        return false;
      }

      const hasProcessingResume = resumes.some((resume) =>
        shouldPollResumeStatus(resume.status)
      );
      return hasProcessingResume ? 2000 : false;
    },
    refetchIntervalInBackground: true,
  });
};
