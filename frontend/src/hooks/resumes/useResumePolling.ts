import { useQuery } from "@tanstack/react-query";
import { getResume } from "../../api/resumesApi";
import { Resume } from "../../types/resume";
import { shouldPollResumeStatus } from "../../utils/resumeStatusUtils";
import { resumeQueryKeys } from "./useResumes";

export const useResumePolling = (resumeId: string, shouldPoll: boolean) => {
  return useQuery<Resume, Error>({
    queryKey: resumeQueryKeys.detail(resumeId),
    queryFn: () => getResume(resumeId),
    enabled: Boolean(resumeId) && shouldPoll,
    retry: 2,
    refetchInterval: (query) => {
      if (!shouldPoll) {
        return false;
      }

      const resume = query.state.data;
      if (!resume) {
        return 2000;
      }

      return shouldPollResumeStatus(resume.status) ? 2000 : false;
    },
    refetchIntervalInBackground: true,
  });
};
