"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { BookOpen } from "lucide-react";
import { FullGuide } from "@/components/GuideSections";
import { getGuideContent } from "@/content/userGuide";
import { LANGUAGE_STORAGE_KEY } from "@/config/i18n";
import { cn } from "@/lib/utils";

// Public and fully static - deliberately makes no API call, so it reads the
// same whether the backend is awake, asleep or still starting up (the
// BackendStatusOverlay keeps this route reachable instead of blocking it).
export default function GuidePage() {
  const { i18n } = useTranslation();
  const guide = getGuideContent(i18n.language);

  function setLanguage(lang: string) {
    i18n.changeLanguage(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  }

  const isZh = i18n.language?.startsWith("zh");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <span className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <BookOpen className="h-5 w-5 text-blue-600" />
            {guide.pageTitle}
          </span>
          <div className="flex items-center gap-3">
            <div className="flex overflow-hidden rounded-md border text-xs">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={cn("px-2.5 py-1", !isZh ? "bg-blue-600 text-white" : "bg-white text-gray-600")}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage("zh")}
                className={cn("px-2.5 py-1", isZh ? "bg-blue-600 text-white" : "bg-white text-gray-600")}
              >
                中文
              </button>
            </div>
            <Link
              href="/login"
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              {guide.signInNow}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <p className="mb-8 text-gray-600">{guide.pageSubtitle}</p>
        <FullGuide />
      </main>
    </div>
  );
}
