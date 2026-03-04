import { useQuery } from "@tanstack/react-query";
import { getResumeFileUrl } from "../../api/resumesApi";
import { ResumeFileUrl } from "../../types/candidate";
import { resumeQueryKeys } from "./useResumes";

const SIGNED_URL_STALE_TIME_MS = 45 * 1000;

export const useResumeFileUrl = (resumeId: string, enabled = true) => {
  return useQuery<ResumeFileUrl, Error>({
    queryKey: resumeQueryKeys.file(resumeId),
    queryFn: () => getResumeFileUrl(resumeId),
    enabled: Boolean(resumeId) && enabled,
    retry: 1,
    staleTime: SIGNED_URL_STALE_TIME_MS,
  });
};
