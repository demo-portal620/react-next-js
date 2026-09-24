"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { API_BASE_URL } from "@/services/apiClient";

// Render's free tier spins the backend down after idling and cold-starts it
// on the next request - that can take up to a minute, during which every
// API call just hangs or fails with no indication of why. This pings a
// lightweight, unauthenticated /health endpoint on mount; if it doesn't
// answer quickly, the backend is treated as "waking up" and polled every
// few seconds until it responds, so the UI can say something useful
// instead of leaving the user staring at a blank/broken page.

type BackendStatus = "checking" | "up" | "down";

interface BackendStatusContextValue {
  status: BackendStatus;
  /** True for a few seconds right after a down->up transition, so the UI can show a brief "back online" confirmation. */
  justRecovered: boolean;
  /** True once "down" has persisted well past a normal cold-start, so the UI can suggest a manual refresh instead of implying it's still routine. */
  takingLong: boolean;
}

const BackendStatusContext = createContext<BackendStatusContextValue>({
  status: "checking",
  justRecovered: false,
  takingLong: false,
});

const INITIAL_CHECK_TIMEOUT_MS = 6000;
const POLL_TIMEOUT_MS = 8000;
const POLL_INTERVAL_MS = 5000;
const RECOVERED_BANNER_MS = 4000;
// A Render free-tier cold start is normally done well under this - past it,
// something other than a routine wake-up may be going on.
const TAKING_LONG_MS = 90_000;

async function pingHealth(timeoutMs: number): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { signal: controller.signal });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export function BackendStatusProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<BackendStatus>("checking");
  const [justRecovered, setJustRecovered] = useState(false);
  const [takingLong, setTakingLong] = useState(false);
  const wasDownRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let pollTimer: ReturnType<typeof setTimeout> | null = null;
    let recoveredTimer: ReturnType<typeof setTimeout> | null = null;
    let takingLongTimer: ReturnType<typeof setTimeout> | null = null;

    function clearTakingLongTimer() {
      if (takingLongTimer) {
        clearTimeout(takingLongTimer);
        takingLongTimer = null;
      }
    }

    function clearPollTimer() {
      if (pollTimer) {
        clearTimeout(pollTimer);
        pollTimer = null;
      }
    }

    function markUp() {
      if (cancelled) return;
      setStatus("up");
      setTakingLong(false);
      clearTakingLongTimer();
      clearPollTimer();
      if (wasDownRef.current) {
        wasDownRef.current = false;
        setJustRecovered(true);
        recoveredTimer = setTimeout(() => {
          if (!cancelled) setJustRecovered(false);
        }, RECOVERED_BANNER_MS);
      }
    }

    // Self-scheduling rather than setInterval: a real Render cold start can
    // leave a request hanging for tens of seconds (nothing like killing a
    // local process, which fails instantly with ECONNREFUSED), so a fixed
    // setInterval would stack up overlapping in-flight pings for the whole
    // cold-start window. This waits for each ping to actually settle before
    // scheduling the next one.
    async function pollLoop() {
      if (cancelled) return;
      const ok = await pingHealth(POLL_TIMEOUT_MS);
      if (cancelled) return;
      if (ok) {
        markUp();
        return;
      }
      pollTimer = setTimeout(pollLoop, POLL_INTERVAL_MS);
    }

    function markDown() {
      if (cancelled) return;
      wasDownRef.current = true;
      setStatus("down");
      if (!takingLongTimer) {
        takingLongTimer = setTimeout(() => {
          if (!cancelled) setTakingLong(true);
        }, TAKING_LONG_MS);
      }
      if (!pollTimer) {
        pollTimer = setTimeout(pollLoop, POLL_INTERVAL_MS);
      }
    }

    pingHealth(INITIAL_CHECK_TIMEOUT_MS).then((ok) => {
      if (cancelled) return;
      if (ok) markUp();
      else markDown();
    });

    return () => {
      cancelled = true;
      clearPollTimer();
      if (recoveredTimer) clearTimeout(recoveredTimer);
      clearTakingLongTimer();
    };
  }, []);

  return (
    <BackendStatusContext.Provider value={{ status, justRecovered, takingLong }}>
      {children}
    </BackendStatusContext.Provider>
  );
}

export function useBackendStatus(): BackendStatusContextValue {
  return useContext(BackendStatusContext);
}
