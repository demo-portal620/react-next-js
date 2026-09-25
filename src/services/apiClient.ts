import axios, { AxiosError } from "axios";
import { authUtils } from "@/utils/auth";

// Shared axios instance - centralizes what every *Api.ts file used to
// duplicate by hand: attaching the auth header, and redirecting to /login
// on a 401 instead of each page silently failing with "Failed to load X".
// Ported from an earlier scaffold's apiClient.ts/request.ts pattern
// (heycloud/fe), adapted to this project's BaseResponse<T> shape.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export interface BaseResponse<T> {
  success: boolean;
  data: T;
  messages?: { code: string; text?: string; args?: unknown[] }[];
  statusCode: number;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = authUtils.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function extractMessage(body: BaseResponse<unknown> | undefined, fallback: string): string {
  const first = body?.messages?.[0];
  return first?.text || first?.code || fallback;
}

apiClient.interceptors.response.use(
  (response) => {
    const body = response.data as BaseResponse<unknown>;
    // Many endpoints here return a "logical" failure (BaseResponse.success
    // === false, e.g. 404/400) as a plain 200 response rather than a
    // ResponseEntity with a real HTTP status - so this has to be checked
    // even on the success path, not just in the error interceptor below.
    if (body && body.success === false) {
      return Promise.reject(new Error(extractMessage(body, "Request failed")));
    }
    return response;
  },
  (error: AxiosError<BaseResponse<unknown>>) => {
    if (error.response?.status === 401) {
      authUtils.removeToken();
      authUtils.redirectToLogin();
    }
    const message = extractMessage(error.response?.data, error.message || "Request failed");
    return Promise.reject(new Error(message));
  }
);

export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const res = await apiClient.get<BaseResponse<T>>(url, { params });
  return res.data.data;
}

export async function apiPost<T>(url: string, data?: unknown): Promise<T> {
  const res = await apiClient.post<BaseResponse<T>>(url, data);
  return res.data.data;
}

export async function apiPut<T>(url: string, data?: unknown): Promise<T> {
  const res = await apiClient.put<BaseResponse<T>>(url, data);
  return res.data.data;
}

export async function apiDelete<T>(url: string): Promise<T> {
  const res = await apiClient.delete<BaseResponse<T>>(url);
  return res.data.data;
}

// For endpoints that stream raw bytes instead of a BaseResponse envelope
// (e.g. maintenance/stock-check photos) - these are auth-gated, unlike the
// profile-picture endpoint, so a plain <img src> can't reach them; the
// caller wraps the Blob in URL.createObjectURL() to get something an <img>
// can use, and must revoke it on unmount.
export async function apiGetBlob(url: string): Promise<Blob> {
  const res = await apiClient.get<Blob>(url, { responseType: "blob" });
  return res.data;
}

// For multipart file uploads (e.g. property showcase photos). The instance
// default Content-Type of application/json must be cleared per-request so
// axios can set the correct multipart/form-data boundary itself.
export async function apiPostMultipart<T>(url: string, formData: FormData): Promise<T> {
  const res = await apiClient.post<BaseResponse<T>>(url, formData, {
    headers: { "Content-Type": undefined },
  });
  return res.data.data;
}
