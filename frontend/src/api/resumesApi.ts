import { AxiosProgressEvent, AxiosResponse } from "axios";
import { ApiClientError, axiosClient, parseApiResponse } from "./axiosClient";
import { Resume } from "../types/resume";

export type UploadResumesResult = {
  uploaded: number;
  failed: number;
};

type UploadResumesOptions = {
  onUploadProgress?: (progressPercent: number) => void;
};

const request = async <T>(promise: Promise<AxiosResponse<unknown>>): Promise<T> => {
  return parseApiResponse<T>(await promise);
};

const isResumeShape = (payload: unknown): payload is Resume => {
  if (typeof payload !== "object" || payload === null) {
    return false;
  }

  const candidate = payload as Partial<Resume>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.jobId === "string" &&
    typeof candidate.status === "string"
  );
};

const parseResumesListResponse = (payload: unknown): Resume[] => {
  if (Array.isArray(payload)) {
    return payload as Resume[];
  }

  if (
    typeof payload === "object" &&
    payload !== null &&
    "resumes" in payload &&
    Array.isArray((payload as { resumes: unknown }).resumes)
  ) {
    return (payload as { resumes: Resume[] }).resumes;
  }

  if (isResumeShape(payload)) {
    return [payload];
  }

  throw new ApiClientError({
    message:
      "Invalid resumes list response format from API. Expected an array of resumes.",
  });
};

const parseResumeDetailResponse = (payload: unknown): Resume => {
  if (isResumeShape(payload)) {
    return payload;
  }

  if (
    typeof payload === "object" &&
    payload !== null &&
    "resume" in payload &&
    isResumeShape((payload as { resume: unknown }).resume)
  ) {
    return (payload as { resume: Resume }).resume;
  }

  throw new ApiClientError({
    message:
      "Invalid resume detail response format from API. Expected a resume object.",
  });
};

const parseUploadResponse = (payload: unknown): UploadResumesResult => {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "uploaded" in payload &&
    "failed" in payload &&
    typeof (payload as { uploaded: unknown }).uploaded === "number" &&
    typeof (payload as { failed: unknown }).failed === "number"
  ) {
    const parsed = payload as UploadResumesResult;
    return { uploaded: parsed.uploaded, failed: parsed.failed };
  }

  if (
    typeof payload === "object" &&
    payload !== null &&
    "results" in payload &&
    typeof (payload as { results: unknown }).results === "object" &&
    (payload as { results: object }).results !== null
  ) {
    const nested = (payload as { results: { uploaded?: number; failed?: number } }).results;
    return {
      uploaded: nested.uploaded ?? 0,
      failed: nested.failed ?? 0,
    };
  }

  throw new ApiClientError({
    message:
      "Invalid upload response format from API. Expected uploaded/failed counters.",
  });
};

const toProgressPercent = (event: AxiosProgressEvent): number => {
  if (!event.total || event.total <= 0 || typeof event.loaded !== "number") {
    return 0;
  }

  const raw = Math.round((event.loaded / event.total) * 100);
  return Math.max(0, Math.min(100, raw));
};

export const getResumes = async (jobId: string): Promise<Resume[]> => {
  const payload = await request<unknown>(axiosClient.get<unknown>(`/jobs/${jobId}/resumes`));
  return parseResumesListResponse(payload);
};

export const getResume = async (resumeId: string): Promise<Resume> => {
  const payload = await request<unknown>(axiosClient.get<unknown>(`/resumes/${resumeId}`));
  return parseResumeDetailResponse(payload);
};

export const uploadResumes = async (
  jobId: string,
  files: File[],
  options?: UploadResumesOptions
): Promise<UploadResumesResult> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const payload = await request<unknown>(
    axiosClient.post<unknown>(`/jobs/${jobId}/resumes`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (event) => {
        if (!options?.onUploadProgress) {
          return;
        }
        options.onUploadProgress(toProgressPercent(event));
      },
    })
  );

  return parseUploadResponse(payload);
};
