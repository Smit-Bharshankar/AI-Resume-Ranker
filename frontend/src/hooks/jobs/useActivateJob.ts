import { useMutation, useQueryClient } from "@tanstack/react-query";
import { activateJob } from "../../api/jobsApi";
import { Job } from "../../types/job";
import { jobQueryKeys } from "./useJobs";

export const useActivateJob = (jobId: string) => {
  const queryClient = useQueryClient();

  return useMutation<Job, Error>({
    mutationFn: () => activateJob(jobId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: jobQueryKeys.detail(jobId) }),
        queryClient.invalidateQueries({ queryKey: jobQueryKeys.list() }),
      ]);
    },
    retry: 0,
  });
};
