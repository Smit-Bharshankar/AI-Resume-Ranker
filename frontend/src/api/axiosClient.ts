import axios, { AxiosError, AxiosResponse } from "axios";
import { supabase } from "../lib/supabaseClient";

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
  let message =
    error.response?.data?.error ??
    error.message ??
    "Unexpected network error. Please try again.";

  if (statusCode === 401) {
    message = "Your session has expired. Please log in again.";
  }

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

axiosClient.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorEnvelope>) => {
    if (error.response?.status === 401) {
      await supabase.auth.signOut();
      if (window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    }

    throw new ApiClientError(parseErrorMessage(error));
  }
);
