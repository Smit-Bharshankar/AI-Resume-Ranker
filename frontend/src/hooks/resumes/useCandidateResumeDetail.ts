import { useQuery } from "@tanstack/react-query";
import { getResume } from "../../api/resumesApi";
import { Resume } from "../../types/resume";
import { shouldPollResumeStatus } from "../../utils/resumeStatusUtils";
import { resumeQueryKeys } from "./useResumes";

const RESUME_POLL_INTERVAL_MS = 2000;

export const useCandidateResumeDetail = (resumeId: string) => {
  return useQuery<Resume, Error>({
    queryKey: resumeQueryKeys.detail(resumeId),
    queryFn: () => getResume(resumeId),
    enabled: Boolean(resumeId),
    retry: 2,
    refetchInterval: (query) => {
      const resume = query.state.data;
      if (!resume) {
        return RESUME_POLL_INTERVAL_MS;
      }

      return shouldPollResumeStatus(resume.status)
        ? RESUME_POLL_INTERVAL_MS
        : false;
    },
    refetchIntervalInBackground: true,
  });
};
