import { apiGet } from "@/services/apiClient";

const BASE = "/api/telegram";

// Throws if Telegram alerting isn't configured on the backend (E0012), or
// if the bot doesn't have "Invite users via link" rights in the alert
// group - both surface as a normal Error via apiClient, same as any other
// endpoint.
export async function fetchTelegramInviteLink(): Promise<string> {
  return apiGet<string>(`${BASE}/invite-link`);
}
