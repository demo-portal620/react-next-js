const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
const FREELANCERS_BASE = `${API_BASE_URL}/api/freelancers`;

// Shape returned by the Spring Boot backend's BaseResponse<T> wrapper
interface BaseResponse<T> {
  success: boolean;
  data: T;
  messages?: { code: string }[];
  statusCode: number;
}

export interface Freelancer {
  id: string;
  username: string;
  email: string;
  phoneNumber?: string;
  archived: boolean;
  skillsetIds?: string[];
  hobbyIds?: string[];
}

export interface FreelancersResponse {
  freelancers: Freelancer[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Option {
  id: string;
  name: string;
  description?: string;
}

export interface SelectOptions {
  skillsets: Option[];
  hobbies: Option[];
}

async function unwrap<T>(res: Response): Promise<T> {
  const body: BaseResponse<T> = await res.json();
  if (!res.ok || body.success === false) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return body.data;
}

export async function fetchFreelancers(
  page: number,
  pageSize: number,
  search: string
): Promise<FreelancersResponse> {
  const url = `${FREELANCERS_BASE}?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(
    search
  )}`;
  const res = await fetch(url);
  return unwrap<FreelancersResponse>(res);
}

export async function fetchFreelancerById(id: string): Promise<Freelancer> {
  const res = await fetch(`${FREELANCERS_BASE}/${id}`);
  return unwrap<Freelancer>(res);
}

export async function fetchSelectOptions(): Promise<SelectOptions> {
  const res = await fetch(`${FREELANCERS_BASE}/select-options`);
  return unwrap<SelectOptions>(res);
}

export async function createFreelancer(payload: {
  username: string;
  email: string;
  phoneNumber: string;
  skillsetIds: string[];
  hobbyIds: string[];
}): Promise<Freelancer> {
  const res = await fetch(FREELANCERS_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return unwrap<Freelancer>(res);
}

export async function updateFreelancer(
  id: string,
  payload: {
    username: string;
    email: string;
    phoneNumber: string;
    skillsetIds: string[];
    hobbyIds: string[];
  }
): Promise<void> {
  const res = await fetch(`${FREELANCERS_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...payload }),
  });
  await unwrap<void>(res);
}

export async function deleteFreelancer(id: string): Promise<void> {
  const res = await fetch(`${FREELANCERS_BASE}/${id}`, { method: "DELETE" });
  await unwrap<void>(res);
}

export async function toggleArchiveFreelancer(id: string): Promise<boolean> {
  const res = await fetch(`${FREELANCERS_BASE}/${id}/archive`, { method: "PATCH" });
  const data = await unwrap<{ archived: boolean }>(res);
  return data.archived;
}
