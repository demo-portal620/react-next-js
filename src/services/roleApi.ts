import { apiGet, apiPost, apiPut, apiDelete } from "@/services/apiClient";

const ROLES_BASE = "/api/roles";

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

export interface RolesResponse {
  roles: Role[];
  total: number;
  page: number;
  pageSize: number;
}

export async function fetchRoles(
  page: number,
  pageSize: number,
  search: string
): Promise<RolesResponse> {
  return apiGet<RolesResponse>(ROLES_BASE, { page, pageSize, search });
}

// For UIs that toggle every role at once (e.g. a user's role-assignment
// pills) rather than paging through a list - walks every page instead of
// assuming a fixed page size covers all of them.
export async function fetchAllRoles(): Promise<Role[]> {
  const pageSize = 100;
  const first = await fetchRoles(1, pageSize, "");
  const roles = first.roles;
  const totalPages = Math.ceil(first.total / first.pageSize);
  for (let page = 2; page <= totalPages; page++) {
    const next = await fetchRoles(page, first.pageSize, "");
    roles.push(...next.roles);
  }
  return roles;
}

export async function fetchRoleById(id: string): Promise<Role> {
  return apiGet<Role>(`${ROLES_BASE}/${id}`);
}

export async function fetchAllPermissions(): Promise<Permission[]> {
  return apiGet<Permission[]>(`${ROLES_BASE}/permissions`);
}

export async function createRole(payload: {
  name: string;
  description: string;
  permissionIds: string[];
}): Promise<Role> {
  return apiPost<Role>(ROLES_BASE, payload);
}

export async function updateRole(
  id: string,
  payload: { name: string; description: string; permissionIds: string[] }
): Promise<Role> {
  return apiPut<Role>(`${ROLES_BASE}/${id}`, payload);
}

export async function deleteRole(id: string): Promise<void> {
  return apiDelete<void>(`${ROLES_BASE}/${id}`);
}
