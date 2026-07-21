const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
const APK_BASE = `${API_BASE_URL}/api/apk`;

// Shape returned by the Spring Boot backend's BaseResponse<T> wrapper
interface BaseResponse<T> {
  success: boolean;
  data: T;
  messages?: { code: string }[];
  statusCode: number;
}

export interface ApkVersion {
  id: string;
  appCode: string;
  versionCode: number;
  versionName: string;
  fileName: string;
  fileSize: number;
  releaseNotes?: string;
  active: boolean;
  createdDate?: string;
}

export interface ApkVersionsResponse {
  versions: ApkVersion[];
  total: number;
  page: number;
  pageSize: number;
}

function authHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function unwrap<T>(res: Response): Promise<T> {
  const body: BaseResponse<T> = await res.json();
  if (!res.ok || body.success === false) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return body.data;
}

export async function fetchApkVersions(
  appCode: string,
  page: number,
  pageSize: number
): Promise<ApkVersionsResponse> {
  const url = `${APK_BASE}/versions?appCode=${encodeURIComponent(
    appCode
  )}&page=${page}&pageSize=${pageSize}`;
  const res = await fetch(url, { headers: { ...authHeaders() } });
  return unwrap<ApkVersionsResponse>(res);
}

export async function uploadApkVersion(payload: {
  file: File;
  appCode: string;
  versionName: string;
  versionCode: number;
  releaseNotes: string;
}): Promise<ApkVersion> {
  const formData = new FormData();
  formData.append("file", payload.file);
  formData.append("appCode", payload.appCode);
  formData.append("versionName", payload.versionName);
  formData.append("versionCode", String(payload.versionCode));
  if (payload.releaseNotes) {
    formData.append("releaseNotes", payload.releaseNotes);
  }

  const res = await fetch(`${APK_BASE}/versions`, {
    method: "POST",
    headers: { ...authHeaders() }, // no Content-Type - browser sets the multipart boundary
    body: formData,
  });
  return unwrap<ApkVersion>(res);
}

export async function setApkVersionActive(id: string, active: boolean): Promise<void> {
  const res = await fetch(`${APK_BASE}/versions/${id}/active?active=${active}`, {
    method: "PATCH",
    headers: { ...authHeaders() },
  });
  await unwrap<void>(res);
}

export async function deleteApkVersion(id: string): Promise<void> {
  const res = await fetch(`${APK_BASE}/versions/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  await unwrap<void>(res);
}

export function apkDownloadUrl(id: string): string {
  return `${APK_BASE}/versions/${id}/download`;
}

export function formatApkSize(bytes: number): string {
  if (!bytes) return "0 MB";
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}
