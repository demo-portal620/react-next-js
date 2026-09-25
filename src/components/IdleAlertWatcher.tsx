"use client";

import { useEffect } from "react";
import { startIdleWatcher } from "@/lib/idleAlert";

// Mounted once in the root layout - no UI, just starts the idle-detection
// timer described in idleAlert.ts.
export default function IdleAlertWatcher() {
  useEffect(() => {
    startIdleWatcher();
  }, []);

  return null;
}
