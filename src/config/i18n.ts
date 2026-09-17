"use client";

import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import enLabels from "@/locales/en/labels";
import zhLabels from "@/locales/zh/labels";

export const LANGUAGE_STORAGE_KEY = "language";

// Always init to "en", matching what the server always renders (it has no
// localStorage access, so its HTML is always English) - if this read the
// stored language instead, the client's first render (the one React
// hydration diffs against the server HTML) would already be "zh" whenever
// that was the saved preference, and hydration would fail on every page
// that renders translated text. The real preference is applied after
// mount instead (see I18nProvider) - a plain post-hydration re-render, not
// a mismatch.
if (!i18next.isInitialized) {
  i18next.use(initReactI18next).init({
    lng: "en",
    fallbackLng: "en",
    resources: {
      en: { labels: enLabels },
      zh: { labels: zhLabels },
    },
    defaultNS: "labels",
    interpolation: { escapeValue: false },
  });
}

export function getStoredLanguage(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LANGUAGE_STORAGE_KEY);
}

export default i18next;
