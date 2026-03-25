import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiClientError } from "../../api/axiosClient";
import { retryResume, RetryResumeResponse } from "../../api/resumesApi";
import { resumeQueryKeys } from "./useResumes";
import { toast } from "sonner";

const mapRetryResumeErrorMessage = (error: Error): string => {
  if (!(error instanceof ApiClientError)) {
    return "Unable to retry right now. Please try again.";
  }

  if (error.statusCode === 404) {
    return "This resume was not found.";
  }

  if (error.statusCode === 403) {
    return "You do not have permission to retry this resume.";
  }

  if (error.statusCode === 409) {
    return "This resume is already processing or not eligible for retry.";
  }

  if (error.statusCode === 429) {
    return "System is temporarily busy. Please retry in a minute.";
  }

  return "Retry could not be started. Please try again.";
};

type RetryResumeInput = {
  resumeId: string;
  jobId: string;
};

export const useRetryResume = () => {
  const queryClient = useQueryClient();

  return useMutation<RetryResumeResponse, Error, RetryResumeInput>({
    mutationFn: ({ resumeId }) => retryResume(resumeId),
    onSuccess: async (_result, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: resumeQueryKeys.byJob(variables.jobId),
        }),
        queryClient.invalidateQueries({
          queryKey: resumeQueryKeys.detail(variables.resumeId),
        }),
      ]);

      toast.success("Retry started. We are processing this resume again.");
    },
    onError: (error) => {
      toast.error(mapRetryResumeErrorMessage(error));
    },
    retry: 0,
  });
};
