const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
const USERS_BASE = `${API_BASE_URL}/users`;

// Shape returned by the Spring Boot backend's BaseResponse<T> wrapper.
// text is the already-resolved human-readable string (see
// com.admin.common.base.exception.Message#getText) - prefer it over the
// bare code, same convention as apiClient.ts's extractMessage.
interface BaseResponse<T> {
  success: boolean;
  data: T;
  messages?: { code: string; text?: string }[];
  statusCode: number;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
}

export interface User {
  id: string;
  username: string;
  firstname?: string;
  lastname?: string;
  email: string;
  phoneNumber?: string;
  roles?: Role[];
  profilePictureKey?: string;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
}

function authHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchUsers(
  page: number,
  pageSize: number,
  search: string
): Promise<UsersResponse> {
  const url = `${USERS_BASE}?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(
    search
  )}`;
  const res = await fetch(url, { headers: { ...authHeaders() } });
  if (!res.ok) throw new Error("Failed to fetch users");
  const body: BaseResponse<UsersResponse> = await res.json();
  return body.data;
}

export async function fetchUserById(id: string): Promise<User> {
  const res = await fetch(`${USERS_BASE}/${id}`, { headers: { ...authHeaders() } });
  if (!res.ok) throw new Error(`Failed to fetch user with id ${id}`);
  const body: BaseResponse<User> = await res.json();
  return body.data;
}

// The currently logged-in user's own profile, resolved from the JWT.
export async function fetchCurrentUser(): Promise<User> {
  const res = await fetch(`${USERS_BASE}/me`, { headers: { ...authHeaders() } });
  if (!res.ok) throw new Error("Failed to fetch current user");
  const body: BaseResponse<User> = await res.json();
  if (!body.success) throw new Error("Not authenticated");
  return body.data;
}

// Admin-initiated account creation - distinct from the public self-service
// /auth/register (authApi.ts). ap-be enforces which role the caller is
// allowed to grant (see UserServiceImpl.canGrantRole); this just surfaces
// whatever error it returns (e.g. "not authorized" if you try to grant a
// role above your own).
export async function createUser(payload: {
  username: string;
  password: string;
  email: string;
  firstname?: string;
  lastname?: string;
  phoneNumber?: string;
  roleId: string;
}): Promise<User> {
  const res = await fetch(USERS_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const body: BaseResponse<User> | null = await res.json().catch(() => null);
  if (!res.ok || !body?.success) {
    throw new Error(body?.messages?.[0]?.text ?? body?.messages?.[0]?.code ?? "Failed to create user");
  }
  return body.data;
}

// Not sent with a Content-Type header - the browser sets the correct
// "multipart/form-data; boundary=..." header itself for a FormData body,
// same reasoning as stockApi.ts's importProducts.
export async function uploadProfilePicture(file: File): Promise<User> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${USERS_BASE}/me/photo`, {
    method: "POST",
    headers: { ...authHeaders() },
    body: formData,
  });
  const body: BaseResponse<User> | null = await res.json().catch(() => null);
  if (!res.ok || !body?.success) {
    throw new Error(body?.messages?.[0]?.text ?? body?.messages?.[0]?.code ?? "Failed to upload photo");
  }
  return body.data;
}

// Public endpoint (no auth header needed) - an <img src> can't attach one
// anyway. ?v= is a required cache-buster, not decoration - the URL is keyed
// by user id, not by the underlying S3 key, so without it the browser keeps
// serving cached bytes after a re-upload.
export function profilePictureUrl(userId: string, profilePictureKey?: string): string | null {
  if (!profilePictureKey) return null;
  return `${USERS_BASE}/${userId}/photo?v=${encodeURIComponent(profilePictureKey)}`;
}

// Editable profile fields only - not username, password, or roles, which
// have their own dedicated paths.
export async function updateUser(
  id: string,
  payload: { email: string; firstname?: string; lastname?: string; phoneNumber?: string }
): Promise<User> {
  const res = await fetch(`${USERS_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const body: BaseResponse<User> | null = await res.json().catch(() => null);
  if (!res.ok || !body?.success) {
    throw new Error(body?.messages?.[0]?.text ?? body?.messages?.[0]?.code ?? "Failed to update user");
  }
  return body.data;
}

// Replaces this user's entire role assignment with the given role ids.
export async function setUserRoles(id: string, roleIds: string[]): Promise<User> {
  const res = await fetch(`${USERS_BASE}/${id}/roles`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ roleIds }),
  });
  if (!res.ok) throw new Error("Failed to update roles");
  const body: BaseResponse<User> = await res.json();
  if (!body.success) throw new Error("Failed to update roles");
  return body.data;
}
