"use client";

import { useBackendStatus } from "@/context/BackendStatusContext";

export default function BackendStatusOverlay() {
  const { status, justRecovered, takingLong } = useBackendStatus();

  if (status === "down") {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/95 backdrop-blur-sm">
        <div className="max-w-sm px-6 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Waking up the server</h2>
          <p className="mt-2 text-sm text-gray-600">
            This demo runs on a free-tier host that goes to sleep when idle -
            it can take up to a minute to start back up. This page will
            continue automatically once it&apos;s ready, no need to refresh.
          </p>
          {takingLong && (
            <p className="mt-3 text-sm text-amber-600">
              Still not responding after a couple of minutes - this is
              longer than a normal wake-up. Feel free to try refreshing the
              page.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (justRecovered) {
    return (
      <div className="fixed top-4 left-1/2 z-[9999] -translate-x-1/2 rounded-md bg-green-600 px-4 py-2 text-sm text-white shadow-lg">
        Server is ready.
      </div>
    );
  }

  return null;
}
