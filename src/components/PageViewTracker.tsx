"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/services/accessLogApi";

// Mounted once in the root layout. Fires a best-effort pageview ping to the
// backend every time the route changes, so access_log picks up page views
// (not just API calls, which are captured server-side by AccessLogFilter).
export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      trackPageView(pathname);
    }
  }, [pathname]);

  return null;
}
