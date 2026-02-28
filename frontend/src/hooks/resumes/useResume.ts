import { useQuery } from "@tanstack/react-query";
import { getResume } from "../../api/resumesApi";
import { Resume } from "../../types/resume";
import { resumeQueryKeys } from "./useResumes";

export const useResume = (resumeId: string) => {
  return useQuery<Resume, Error>({
    queryKey: resumeQueryKeys.detail(resumeId),
    queryFn: () => getResume(resumeId),
    enabled: Boolean(resumeId),
    retry: 2,
  });
};
