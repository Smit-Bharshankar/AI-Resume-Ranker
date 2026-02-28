import { AxiosResponse } from "axios";
import { ApiClientError, axiosClient, parseApiResponse } from "./axiosClient";
import {
  CreateJobInput,
  Job,
  StructuredRequirements,
  UpdateRequirementsInput,
} from "../types/job";

export type ExtractRequirementsResponse = {
  success: boolean;
  message: string;
};

const request = async <T>(promise: Promise<AxiosResponse<unknown>>): Promise<T> => {
  return parseApiResponse<T>(await promise);
};

const isJobShape = (payload: unknown): payload is Job => {
  if (typeof payload !== "object" || payload === null) {
    return false;
  }

  const candidate = payload as Partial<Job>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.rawDescription === "string" &&
    typeof candidate.status === "string"
  );
};

export const getJobs = async (): Promise<Job[]> => {
  const payload = await request<unknown>(
    axiosClient.get<unknown>("/jobs/069e07b6-413c-4244-bf5c-b3875643f572")
  );

  if (Array.isArray(payload)) {
    return payload as Job[];
  }

  if (isJobShape(payload)) {
    return [payload];
  }

  if (
    typeof payload === "object" &&
    payload !== null &&
    "jobs" in payload &&
    Array.isArray((payload as { jobs: unknown }).jobs)
  ) {
    return (payload as { jobs: Job[] }).jobs;
  }

  throw new ApiClientError({
    message:
      "Invalid jobs list response format from API. Expected a job array or a single job object.",
  });
};

export const getJob = async (jobId: string): Promise<Job> => {
  return request<Job>(axiosClient.get<Job>(`/jobs/${jobId}`));
};

export const createJob = async (data: CreateJobInput): Promise<Job> => {
  return request<Job>(axiosClient.post<Job>("/jobs", data));
};

export const extractRequirements = async (
  jobId: string
): Promise<ExtractRequirementsResponse> => {
  return request<ExtractRequirementsResponse>(
    axiosClient.post<ExtractRequirementsResponse>(`/jobs/${jobId}/extract`)
  );
};

export const activateJob = async (jobId: string): Promise<Job> => {
  return request<Job>(axiosClient.patch<Job>(`/jobs/${jobId}/activate`));
};

export const updateRequirements = async (
  jobId: string,
  data: UpdateRequirementsInput
): Promise<Job> => {
  const payload: StructuredRequirements = {
    required_skills: data.required_skills,
    preferred_skills: data.preferred_skills,
    mandatory_keywords: data.mandatory_keywords,
    minimum_experience_years: data.minimum_experience_years,
  };

  return request<Job>(
    axiosClient.patch<Job>(`/jobs/${jobId}/requirements`, payload)
  );
};
