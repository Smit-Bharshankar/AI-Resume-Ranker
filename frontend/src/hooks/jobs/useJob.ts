import { useQuery } from "@tanstack/react-query";
import { getJob } from "../../api/jobsApi";
import { Job } from "../../types/job";
import { jobQueryKeys } from "./useJobs";

export const useJob = (jobId: string) => {
  return useQuery<Job, Error>({
    queryKey: jobQueryKeys.detail(jobId),
    queryFn: () => getJob(jobId),
    enabled: Boolean(jobId),
    retry: 2,
  });
};
