import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteResume,
  DeleteResumeInput,
  DeleteResumeResponse,
} from "../../api/resumesApi";
import { ApiClientError } from "../../api/axiosClient";
import { resumeQueryKeys } from "./useResumes";
import { toast } from "sonner";
import { usageQueryKeys } from "../users/useUsage";

const mapDeleteResumeErrorMessage = (error: Error): string => {
  if (!(error instanceof ApiClientError)) {
    return "Unable to delete resume. Please try again.";
  }

  if (error.statusCode === 404) {
    return "Resume not found or already deleted.";
  }

  if (error.statusCode === 403) {
    return "You do not have permission to delete this resume.";
  }

  if (error.statusCode === 409) {
    return "This resume is still processing. Confirm deletion to continue.";
  }

  return error.message || "Unable to delete resume. Please try again.";
};

type DeleteResumeMutationInput = DeleteResumeInput & {
  jobId: string;
};

export const useDeleteResume = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteResumeResponse, Error, DeleteResumeMutationInput>({
    mutationFn: ({ resumeId, confirm }) => deleteResume({ resumeId, confirm }),
    onSuccess: async (result, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: resumeQueryKeys.byJob(variables.jobId),
        }),
        queryClient.invalidateQueries({
          queryKey: resumeQueryKeys.detail(variables.resumeId),
        }),
        queryClient.invalidateQueries({
          queryKey: usageQueryKeys.me(),
        }),
      ]);

      toast.success(result.message || "Resume deleted successfully.");
    },
    onError: (error) => {
      toast.error(mapDeleteResumeErrorMessage(error));
    },
    retry: 0,
  });
};
