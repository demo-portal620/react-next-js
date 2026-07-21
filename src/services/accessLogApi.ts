const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

function authHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function currentUsername(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user?.username ?? null;
  } catch {
    return null;
  }
}

// Best-effort pageview ping - fired on every route change. Never throws and
// never blocks navigation; if the backend is briefly unreachable we just
// skip that one pageview rather than surface an error to the user.
export function trackPageView(path: string) {
  const username = currentUsername();
  fetch(`${API_BASE_URL}/api/access-logs/pageview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, ...(username ? { username } : {}) }),
    keepalive: true,
  }).catch(() => {
    /* swallow - tracking failures should never affect navigation */
  });
}

export interface AccessLog {
  id: string;
  type: "API" | "PAGE_VIEW";
  method?: string;
  path: string;
  ipAddress?: string;
  userAgent?: string;
  username?: string;
  statusCode?: number;
  responseTimeMs?: number;
  createdDate: string;
}

interface BaseResponse<T> {
  success: boolean;
  data: T;
  statusCode: number;
}

interface AccessLogsResponse {
  logs: AccessLog[];
  total: number;
  page: number;
  pageSize: number;
}

// Requires an authenticated user (see SecurityConfig - not in the permitAll list).
export async function fetchAccessLogs(
  page: number,
  pageSize: number,
  type = "",
  search = ""
): Promise<AccessLogsResponse> {
  const url = `${API_BASE_URL}/api/access-logs?page=${page}&pageSize=${pageSize}&type=${type}&search=${encodeURIComponent(
    search
  )}`;
  const res = await fetch(url, { headers: { ...authHeaders() } });
  if (!res.ok) throw new Error("Failed to fetch access logs");
  const body: BaseResponse<AccessLogsResponse> = await res.json();
  if (!body.success) throw new Error("Not authorized to view access logs");
  return body.data;
}
