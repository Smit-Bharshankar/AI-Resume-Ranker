import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  extractRequirements,
  ExtractRequirementsResponse,
} from "../../api/jobsApi";
import { jobQueryKeys } from "./useJobs";

export const useExtractRequirements = (jobId: string) => {
  const queryClient = useQueryClient();

  return useMutation<ExtractRequirementsResponse, Error>({
    mutationFn: () => extractRequirements(jobId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: jobQueryKeys.detail(jobId) }),
        queryClient.invalidateQueries({ queryKey: jobQueryKeys.list() }),
      ]);
    },
    retry: 0,
  });
};
