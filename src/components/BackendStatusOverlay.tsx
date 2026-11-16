"use client";

import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useBackendStatus } from "@/context/BackendStatusContext";
import { QuickStart } from "@/components/GuideSections";
import { getGuideContent } from "@/content/userGuide";

// Pages that make no backend call just to render - the user can read them
// (and see the sign-in form) while the server wakes, so they get a small
// non-blocking notice instead of a full-screen wall.
const BROWSABLE_WHILE_DOWN = ["/login", "/register", "/guide"];

export default function BackendStatusOverlay() {
  const { status, justRecovered, takingLong } = useBackendStatus();
  const pathname = usePathname();
  const { i18n } = useTranslation();
  const guide = getGuideContent(i18n.language);

  if (status === "down") {
    if (BROWSABLE_WHILE_DOWN.includes(pathname)) {
      return (
        <div className="fixed bottom-4 left-1/2 z-[9999] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-lg border border-blue-200 bg-white px-4 py-3 text-sm shadow-lg">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 shrink-0 animate-spin rounded-full border-b-2 border-blue-600" />
            <span className="text-gray-800">{guide.serverWaking}</span>
          </div>
          {takingLong && (
            <p className="mt-2 text-amber-700">
              Still not responding after a couple of minutes - this is longer than a normal wake-up. Feel free to try
              refreshing the page.
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="fixed inset-0 z-[9999] overflow-y-auto bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-10">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Waking up the server</h2>
            <p className="mt-2 text-sm text-gray-600">
              This demo runs on a free-tier host that goes to sleep when idle - it can take up to a minute to start
              back up. This page will continue automatically once it&apos;s ready, no need to refresh.
            </p>
            {takingLong && (
              <p className="mt-3 text-sm text-amber-600">
                Still not responding after a couple of minutes - this is longer than a normal wake-up. Feel free to try
                refreshing the page.
              </p>
            )}
          </div>

          <div className="mt-8 rounded-lg border bg-white p-5 text-left shadow-sm">
            <QuickStart />
          </div>
        </div>
      </div>
    );
  }

  if (justRecovered) {
    return (
      <div className="fixed top-4 left-1/2 z-[9999] -translate-x-1/2 rounded-md bg-green-600 px-4 py-2 text-sm text-white shadow-lg">
        {guide.serverReady}
      </div>
    );
  }

  return null;
}
