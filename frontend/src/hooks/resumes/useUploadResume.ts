import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { uploadResumes, UploadResumesResult } from "../../api/resumesApi";
import { resumeQueryKeys } from "./useResumes";

type UploadResumeVariables = {
  jobId: string;
  files: File[];
};

type UseUploadResumeResult = {
  uploadProgress: number;
  resetProgress: () => void;
  uploadMutation: ReturnType<
    typeof useMutation<UploadResumesResult, Error, UploadResumeVariables>
  >;
};

export const useUploadResume = (): UseUploadResumeResult => {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const uploadMutation = useMutation<UploadResumesResult, Error, UploadResumeVariables>({
    mutationFn: ({ jobId, files }) =>
      uploadResumes(jobId, files, {
        onUploadProgress: (progressPercent) => {
          setUploadProgress(progressPercent);
        },
      }),
    onMutate: () => {
      setUploadProgress(0);
    },
    onSuccess: async (_, variables) => {
      setUploadProgress(100);
      await queryClient.invalidateQueries({
        queryKey: resumeQueryKeys.byJob(variables.jobId),
      });
    },
    onError: () => {
      setUploadProgress(0);
    },
    retry: 0,
  });

  const resetProgress = () => setUploadProgress(0);

  return {
    uploadProgress,
    resetProgress,
    uploadMutation,
  };
};
