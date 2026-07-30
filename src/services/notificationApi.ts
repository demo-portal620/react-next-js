import { apiGet, apiPost } from "@/services/apiClient";

const NOTIFICATIONS_BASE = "/api/notifications";

// Mirrors ap-be's com.admin.entity.notification.Notification field-for-field.
export interface Notification {
  id: string;
  recipientUserId: string;
  type: string;
  title: string;
  body?: string;
  linkUrl?: string;
  read: boolean;
  createdDate?: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  page: number;
  pageSize: number;
}

export async function fetchNotifications(page: number, pageSize: number): Promise<NotificationsResponse> {
  return apiGet<NotificationsResponse>(NOTIFICATIONS_BASE, { page, pageSize });
}

export async function fetchUnreadCount(): Promise<number> {
  return apiGet<number>(`${NOTIFICATIONS_BASE}/unread-count`);
}

export async function markNotificationRead(id: string): Promise<void> {
  return apiPost<void>(`${NOTIFICATIONS_BASE}/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  return apiPost<void>(`${NOTIFICATIONS_BASE}/read-all`);
}
