const API_BASE = "https://localhost:7106/api/UserRest";

export async function fetchUsers(
  page: number,
  pageSize: number,
  search: string
) {
  const url = `${API_BASE}?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(
    search
  )}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch users");
  return await res.json();
}

export async function fetchUserById(id: number) {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch user with id ${id}`);
  return await res.json();
}

export async function createUser(userData: any) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error("Failed to create user");
  return await res.json();
}

export async function updateUser(id: number, userData: any) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error("Failed to update user");
  return await res.json();
}

export async function deleteUser(id: number) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete user");
}

export async function fetchSelectOptions() {
  const res = await fetch("https://localhost:7106/api/UserRest/select-options");
  if (!res.ok) throw new Error("Failed to fetch select options");
  return await res.json();
}
