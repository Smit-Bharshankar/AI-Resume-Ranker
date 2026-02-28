import axios, { AxiosError, AxiosResponse } from "axios";

type ApiSuccessEnvelope<T> = {
  success: true;
  data: T;
};

type ApiErrorEnvelope = {
  success: false;
  error: string;
};

type ErrorPayload = {
  message: string;
  statusCode?: number;
};

export class ApiClientError extends Error {
  statusCode?: number;

  constructor({ message, statusCode }: ErrorPayload) {
    super(message);
    this.name = "ApiClientError";
    this.statusCode = statusCode;
  }
}

const parseErrorMessage = (error: AxiosError<ApiErrorEnvelope>): ErrorPayload => {
  const statusCode = error.response?.status;
  const message =
    error.response?.data?.error ??
    error.message ??
    "Unexpected network error. Please try again.";

  return { message, statusCode };
};

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const parseApiResponse = <T>(response: AxiosResponse<unknown>): T => {
  const payload = response.data;

  if (typeof payload === "object" && payload !== null && "success" in payload) {
    if (
      (payload as Partial<ApiErrorEnvelope | ApiSuccessEnvelope<unknown>>).success ===
      false
    ) {
      throw new ApiClientError({
        message: String((payload as Partial<ApiErrorEnvelope>).error ?? "Request failed"),
        statusCode: response.status,
      });
    }

    if ("data" in (payload as object)) {
      return (payload as ApiSuccessEnvelope<T>).data;
    }
  }

  return payload as T;
};

axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorEnvelope>) => {
    throw new ApiClientError(parseErrorMessage(error));
  }
);
