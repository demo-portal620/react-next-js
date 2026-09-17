"use client";

import { useEffect, useRef, useState } from "react";
import { authUtils } from "@/utils/auth";

// Mirrors ap-be's PresenceUserDto (com.admin.ws.presence).
export interface PresenceUser {
  username?: string;
  platform?: string;
  activity?: string;
  connectedAt?: string;
}

interface PresenceListMessage {
  type: string;
  users?: PresenceUser[];
}

const BASE_RECONNECT_DELAY_MS = 1000;
const MAX_RECONNECT_DELAY_MS = 30000;

// Connects to /ws/presence for the component's lifetime, reporting `activity` and returning everyone else connected.
// Reconnects automatically on an unexpected close with exponential backoff + jitter (capped at 30s), and stops
// retrying once the stored token is missing/expired rather than looping against a connection that can never succeed.
export function usePresence(activity: string) {
  const [users, setUsers] = useState<PresenceUser[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const activityRef = useRef(activity);
  const retryCountRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const manualCloseRef = useRef(false);

  // Keeps the latest activity available to a freshly (re)connected socket's onopen without reconnecting on every change.
  useEffect(() => {
    activityRef.current = activity;
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "ACTIVITY", activity }));
    }
  }, [activity]);

  useEffect(() => {
    manualCloseRef.current = false;

    function scheduleReconnect() {
      if (manualCloseRef.current || !authUtils.isAuthenticated()) return;
      const delay = Math.min(BASE_RECONNECT_DELAY_MS * 2 ** retryCountRef.current, MAX_RECONNECT_DELAY_MS);
      const jitter = delay * (0.5 + Math.random() * 0.5);
      retryCountRef.current += 1;
      reconnectTimerRef.current = setTimeout(connect, jitter);
    }

    function connect() {
      const token = authUtils.getToken();
      if (!token || !authUtils.isAuthenticated()) return;

      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
      const wsBase = apiBase.replace(/^http/, "ws").replace(/\/$/, "");
      const url = `${wsBase}/ws/presence?token=${encodeURIComponent(token)}&platform=web`;

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        retryCountRef.current = 0;
        ws.send(JSON.stringify({ type: "ACTIVITY", activity: activityRef.current }));
      };

      ws.onmessage = (event) => {
        try {
          const message: PresenceListMessage = JSON.parse(event.data);
          if (message.type === "PRESENCE_LIST") {
            setUsers(message.users ?? []);
          }
        } catch {
          // malformed message - ignore
        }
      };

      ws.onclose = () => {
        setConnected(false);
        setUsers([]);
        if (!manualCloseRef.current) {
          scheduleReconnect();
        }
      };

      ws.onerror = () => {
        setConnected(false);
      };
    }

    connect();

    return () => {
      manualCloseRef.current = true;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, []);

  return { users, connected };
}
