import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteJob, DeleteJobInput, DeleteJobResponse } from "../../api/jobsApi";
import { resumeQueryKeys } from "../resumes/useResumes";
import { jobQueryKeys } from "./useJobs";
import { ApiClientError } from "../../api/axiosClient";
import { toast } from "sonner";

const mapDeleteJobErrorMessage = (error: Error): string => {
  if (!(error instanceof ApiClientError)) {
    return "Unable to delete job. Please try again.";
  }

  if (error.statusCode === 404) {
    return "Job not found or already deleted.";
  }

  if (error.statusCode === 403) {
    return "You do not have permission to delete this job.";
  }

  if (error.statusCode === 409) {
    return "This job still has processing resumes. Confirm deletion to continue.";
  }

  return error.message || "Unable to delete job. Please try again.";
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteJobResponse, Error, DeleteJobInput>({
    mutationFn: deleteJob,
    onSuccess: async (result, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: jobQueryKeys.list() }),
        queryClient.invalidateQueries({ queryKey: jobQueryKeys.detail(variables.jobId) }),
        queryClient.invalidateQueries({ queryKey: resumeQueryKeys.all }),
      ]);

      toast.success(result.message || "Job deleted successfully.");
    },
    onError: (error) => {
      toast.error(mapDeleteJobErrorMessage(error));
    },
    retry: 0,
  });
};
