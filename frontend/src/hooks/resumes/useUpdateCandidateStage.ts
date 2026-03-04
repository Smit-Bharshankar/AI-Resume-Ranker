import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateCandidateStage,
  UpdateCandidateStageInput,
} from "../../api/resumesApi";
import { ApiClientError } from "../../api/axiosClient";
import { Resume } from "../../types/resume";
import { getCandidateStageLabel } from "../../utils/candidateStageUtils";
import { showToast } from "../../utils/toast";
import { resumeQueryKeys } from "./useResumes";

type MutationContext = {
  previousDetail?: Resume;
  previousByJobEntries: Array<[readonly unknown[], Resume[] | undefined]>;
};

const mapStageUpdateErrorMessage = (error: Error): string => {
  if (!(error instanceof ApiClientError)) {
    return "Unable to update candidate stage. Please try again.";
  }

  if (error.statusCode === 401) {
    return "Your session expired. Please log in again.";
  }

  if (error.statusCode === 404) {
    return "Candidate not found or access denied.";
  }

  if (error.statusCode === 409) {
    return "Invalid stage transition. Refresh and try again.";
  }

  if (error.statusCode === 400) {
    return error.message || "Invalid stage value.";
  }

  return error.message || "Unable to update candidate stage. Please try again.";
};

const patchResumeStage = (resume: Resume, nextStage: Resume["stage"]): Resume => ({
  ...resume,
  stage: nextStage,
});

export const useUpdateCandidateStage = () => {
  const queryClient = useQueryClient();

  return useMutation<Resume, Error, UpdateCandidateStageInput, MutationContext>({
    mutationFn: updateCandidateStage,
    onMutate: async ({ resumeId, stage }) => {
      await queryClient.cancelQueries({ queryKey: resumeQueryKeys.all });

      const detailKey = resumeQueryKeys.detail(resumeId);
      const previousDetail = queryClient.getQueryData<Resume>(detailKey);

      queryClient.setQueryData<Resume | undefined>(detailKey, (current) => {
        if (!current) {
          return current;
        }
        return patchResumeStage(current, stage);
      });

      const previousByJobEntries = queryClient.getQueriesData<Resume[]>({
        queryKey: [...resumeQueryKeys.all, "job"],
      });

      previousByJobEntries.forEach(([queryKey]) => {
        queryClient.setQueryData<Resume[] | undefined>(queryKey, (current) => {
          if (!current) {
            return current;
          }

          return current.map((resume) =>
            resume.id === resumeId ? patchResumeStage(resume, stage) : resume
          );
        });
      });

      return {
        previousDetail,
        previousByJobEntries,
      };
    },
    onError: (error, variables, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(
          resumeQueryKeys.detail(variables.resumeId),
          context.previousDetail
        );
      }

      context?.previousByJobEntries.forEach(([queryKey, previousData]) => {
        queryClient.setQueryData(queryKey, previousData);
      });

      showToast({
        message: mapStageUpdateErrorMessage(error),
        tone: "error",
      });
    },
    onSuccess: (updatedResume) => {
      queryClient.setQueryData(resumeQueryKeys.detail(updatedResume.id), updatedResume);
      showToast({
        message: `Stage updated to ${getCandidateStageLabel(updatedResume.stage)}.`,
        tone: "success",
      });
    },
    onSettled: async (_, __, variables) => {
      await queryClient.invalidateQueries({
        queryKey: resumeQueryKeys.detail(variables.resumeId),
      });
      await queryClient.invalidateQueries({
        queryKey: [...resumeQueryKeys.all, "job"],
      });
    },
  });
};
