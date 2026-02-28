import { useQuery } from "@tanstack/react-query";
import { getJobs } from "../../api/jobsApi";
import { Job } from "../../types/job";

export const jobQueryKeys = {
  all: ["jobs"] as const,
  list: () => [...jobQueryKeys.all, "list"] as const,
  detail: (jobId: string) => [...jobQueryKeys.all, "detail", jobId] as const,
};

export const useJobs = () => {
  return useQuery<Job[], Error>({
    queryKey: jobQueryKeys.list(),
    queryFn: getJobs,
    retry: 2,
  });
};
