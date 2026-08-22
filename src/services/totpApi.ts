import { apiGet, apiPost } from "@/services/apiClient";

const BASE = "/users/me/totp";

export interface TotpStatus {
  enabled: boolean;
}

export async function fetchTotpStatus(): Promise<TotpStatus> {
  return apiGet<TotpStatus>(`${BASE}/status`);
}

// Enrollment itself happens from the admin-portal Android app's
// Authenticator screen (it needs to store the secret on-device to generate
// codes) - the web side only shows status and offers disabling.
export async function disableTotp(password: string): Promise<void> {
  await apiPost<void>(`${BASE}/disable`, { password });
}
