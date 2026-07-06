const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
const USERS_BASE = `${API_BASE_URL}/users`;

// Shape returned by the Spring Boot backend's BaseResponse<T> wrapper
interface BaseResponse<T> {
  success: boolean;
  data: T;
  messages?: { code: string }[];
  statusCode: number;
}

export interface User {
  id: string;
  username: string;
  firstname?: string;
  lastname?: string;
  email: string;
  phoneNumber?: string;
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
