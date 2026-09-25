// Detects the backend going idle and fires a Telegram alert - built after a
// live demo hit a slow Render free-tier cold start with no warning. Render
// spins the backend down after ~15 minutes with no inbound HTTP request, and
// ANY request to it (even a plain health check) wakes it back up - so this
// deliberately never pings ap-be. Instead it tracks how long it's been since
// the last real API response this browser tab saw (bumped from apiClient's
// response interceptor) and, once that gap passes the assumed idle
// threshold, infers the backend has gone to sleep and posts to this
// frontend's own /api/telegram-idle-alert route (a Netlify Function that
// holds the Telegram bot token server-side) - never to ap-be itself.
//
// Per-tab only: each open tab tracks its own activity and fires
// independently, so multiple tabs open past the threshold will each send
// one alert. Not worth coordinating across tabs for a demo-scale feature.

// Render's free-tier idle timeout as documented; if that changes, this
// threshold should move with it.
const IDLE_THRESHOLD_MS = 15 * 60 * 1000;
const CHECK_INTERVAL_MS = 60 * 1000;

let lastActivityAt = Date.now();
let alertedForCurrentIdlePeriod = false;
let timer: ReturnType<typeof setInterval> | null = null;

export function notifyActivity() {
  lastActivityAt = Date.now();
  alertedForCurrentIdlePeriod = false;
}

async function checkIdle() {
  if (alertedForCurrentIdlePeriod) return;
  if (Date.now() - lastActivityAt < IDLE_THRESHOLD_MS) return;

  alertedForCurrentIdlePeriod = true;
  try {
    await fetch("/api/telegram-idle-alert", {
      method: "POST",
      headers: { "X-Alert-Key": process.env.NEXT_PUBLIC_TELEGRAM_ALERT_KEY || "" },
    });
  } catch {
    // Best-effort - nothing else in the app depends on this succeeding.
  }
}

// Idempotent - safe to call from a component that could mount more than
// once (e.g. React StrictMode's double-invoke in dev).
export function startIdleWatcher() {
  if (timer) return;
  notifyActivity();
  timer = setInterval(checkIdle, CHECK_INTERVAL_MS);
}
