const API_BASE = "https://localhost:7106/api/UserRest";

// Define interfaces for type safety
export interface User {
  id: number;
  name: string;
  email: string;
  // Add other user properties based on your API response
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  // Add other required fields for creating a user
  password?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  // Add other fields that can be updated (all optional)
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
  // Add other pagination/response properties
}

export interface SelectOption {
  value: string | number;
  label: string;
}

export async function fetchUsers(
  page: number,
  pageSize: number,
  search: string
): Promise<UsersResponse> {
  const url = `${API_BASE}?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(
    search
  )}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch users");
  return await res.json();
}

export async function fetchUserById(id: number): Promise<User> {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch user with id ${id}`);
  return await res.json();
}

export async function createUser(userData: CreateUserData): Promise<User> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error("Failed to create user");
  return await res.json();
}

export async function updateUser(
  id: number,
  userData: UpdateUserData
): Promise<User> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error("Failed to update user");
  return await res.json();
}

export async function deleteUser(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete user");
}

export async function fetchSelectOptions(): Promise<SelectOption[]> {
  const res = await fetch("https://localhost:7106/api/UserRest/select-options");
  if (!res.ok) throw new Error("Failed to fetch select options");
  return await res.json();
}
