import { AxiosResponse } from "axios";
import { ApiClientError, axiosClient, parseApiResponse } from "./axiosClient";
import { UsageMetrics } from "../types/usage";

const request = async <T>(promise: Promise<AxiosResponse<unknown>>): Promise<T> => {
  return parseApiResponse<T>(await promise);
};

const isUsageShape = (payload: unknown): payload is UsageMetrics => {
  if (typeof payload !== "object" || payload === null) {
    return false;
  }

  const candidate = payload as Partial<UsageMetrics>;
  return (
    typeof candidate.jobs?.currentCount === "number" &&
    typeof candidate.jobs?.currentLimit === "number" &&
    typeof candidate.jobs?.jobsCreatedCount === "number" &&
    typeof candidate.resumes?.completedCount === "number" &&
    typeof candidate.resumes?.inFlightCount === "number" &&
    typeof candidate.resumes?.lifetimeLimit === "number" &&
    typeof candidate.resumes?.perJobLimit === "number"
  );
};

export const getUsage = async (): Promise<UsageMetrics> => {
  const payload = await request<unknown>(axiosClient.get<unknown>("/users/me/usage"));

  if (isUsageShape(payload)) {
    return payload;
  }

  throw new ApiClientError({
    message: "Invalid usage response format from API.",
  });
};
