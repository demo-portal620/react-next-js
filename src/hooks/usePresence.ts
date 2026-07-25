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

/**
 * Connects to /ws/presence for the lifetime of the calling component,
 * reporting `activity` as this browser's current activity and returning
 * the live list of everyone else connected (web or Android). Native
 * browser WebSocket - no client library needed, matching PresenceClient.kt
 * on the Android side and PresenceWebSocketConfig on the backend (plain
 * WebSocket, not STOMP).
 */
export function usePresence(activity: string) {
  const [users, setUsers] = useState<PresenceUser[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const lastActivityRef = useRef<string | null>(null);

  useEffect(() => {
    const token = authUtils.getToken();
    if (!token) return;

    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
    const wsBase = apiBase.replace(/^http/, "ws").replace(/\/$/, "");
    const url = `${wsBase}/ws/presence?token=${encodeURIComponent(token)}&platform=web`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({ type: "ACTIVITY", activity }));
      lastActivityRef.current = activity;
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
    };

    ws.onerror = () => {
      setConnected(false);
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- connect once per mount; activity changes are handled below without reconnecting
  }, []);

  useEffect(() => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN && activity !== lastActivityRef.current) {
      ws.send(JSON.stringify({ type: "ACTIVITY", activity }));
      lastActivityRef.current = activity;
    }
  }, [activity]);

  return { users, connected };
}
