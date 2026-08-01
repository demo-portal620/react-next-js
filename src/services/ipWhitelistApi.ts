import { apiGet, apiPost, apiPut, apiDelete } from "@/services/apiClient";

const BASE = "/api/ip-whitelist";

// Mirrors ap-be's com.admin.entity.security.IpWhitelistConfig.
export interface IpWhitelistConfig {
  id: string;
  enabled: boolean;
}

// Mirrors ap-be's com.admin.entity.security.IpWhitelistEntry.
export interface IpWhitelistEntry {
  id: string;
  ipOrCidr: string;
  description?: string;
  createdBy?: string;
  createdDate?: string;
}

export async function fetchIpWhitelistConfig(): Promise<IpWhitelistConfig> {
  return apiGet<IpWhitelistConfig>(`${BASE}/config`);
}

export async function setIpWhitelistEnabled(enabled: boolean): Promise<IpWhitelistConfig> {
  // ap-be's endpoint takes `enabled` as a @RequestParam, not a JSON body -
  // apiPut only forwards a body, so it goes on the URL instead.
  return apiPut<IpWhitelistConfig>(`${BASE}/config?enabled=${enabled}`);
}

export async function fetchIpWhitelistEntries(): Promise<IpWhitelistEntry[]> {
  return apiGet<IpWhitelistEntry[]>(`${BASE}/entries`);
}

export async function addIpWhitelistEntry(ipOrCidr: string, description?: string): Promise<IpWhitelistEntry> {
  return apiPost<IpWhitelistEntry>(`${BASE}/entries`, { ipOrCidr, description });
}

export async function removeIpWhitelistEntry(id: string): Promise<void> {
  return apiDelete<void>(`${BASE}/entries/${id}`);
}
