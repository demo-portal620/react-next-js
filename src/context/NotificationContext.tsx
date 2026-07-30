"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { authUtils } from "@/utils/auth";
import {
  Notification,
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/services/notificationApi";

interface UnreadCountMessage {
  type: "UNREAD_COUNT";
  count: number;
}

interface NotificationPushMessage {
  type: "NOTIFICATION";
  notification: Notification;
}

type IncomingMessage = UnreadCountMessage | NotificationPushMessage | { type: string };

interface NotificationContextValue {
  unreadCount: number;
  recentNotifications: Notification[];
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  refetch: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

const RECENT_LIMIT = 20;

/**
 * App-wide, unlike usePresence.ts's per-page pattern - mounted once in
 * AdminLayout.tsx so the /ws/notifications connection (and the unread
 * count/recent list it feeds) survives navigation between dashboard pages
 * instead of reconnecting on every route change.
 */
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const refetch = useCallback(() => {
    fetchNotifications(1, RECENT_LIMIT)
      .then((data) => setRecentNotifications(data.notifications))
      .catch(() => {});
    fetchUnreadCount()
      .then(setUnreadCount)
      .catch(() => {});
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    const token = authUtils.getToken();
    if (!token) return;

    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
    const wsBase = apiBase.replace(/^http/, "ws").replace(/\/$/, "");
    const url = `${wsBase}/ws/notifications?token=${encodeURIComponent(token)}&platform=web`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const message: IncomingMessage = JSON.parse(event.data);
        if (message.type === "UNREAD_COUNT") {
          setUnreadCount((message as UnreadCountMessage).count);
        } else if (message.type === "NOTIFICATION") {
          const notification = (message as NotificationPushMessage).notification;
          setUnreadCount((prev) => prev + 1);
          setRecentNotifications((prev) => [notification, ...prev].slice(0, RECENT_LIMIT));
        }
      } catch {
        // malformed message - ignore
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, []);

  const markRead = useCallback(async (id: string) => {
    await markNotificationRead(id);
    setRecentNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await markAllNotificationsRead();
    setRecentNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  return (
    <NotificationContext.Provider value={{ unreadCount, recentNotifications, markRead, markAllRead, refetch }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
