import { useQuery } from "@tanstack/react-query";
import { getJob } from "../../api/jobsApi";
import { Job } from "../../types/job";
import { isExtractingRequirements } from "../../utils/statusUtils";
import { jobQueryKeys } from "./useJobs";

export const useJobPolling = (jobId: string, shouldPoll: boolean) => {
  return useQuery<Job, Error>({
    queryKey: jobQueryKeys.detail(jobId),
    queryFn: () => getJob(jobId),
    enabled: Boolean(jobId) && shouldPoll,
    retry: 2,
    refetchInterval: (query) => {
      if (!shouldPoll) {
        return false;
      }

      const job = query.state.data as Job | undefined;
      if (!job) {
        return 2000;
      }

      return isExtractingRequirements(job.status) ? 2000 : false;
    },
    refetchIntervalInBackground: true,
  });
};
