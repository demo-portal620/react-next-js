"use client";

import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import enLabels from "@/locales/en/labels";
import zhLabels from "@/locales/zh/labels";

export const LANGUAGE_STORAGE_KEY = "language";

// SSR renders this "use client" module on the server too for the initial
// HTML, where localStorage doesn't exist - fall back to "en" there, the
// client re-render right after picks up the real stored preference.
function getInitialLanguage(): string {
  if (typeof window === "undefined") return "en";
  return localStorage.getItem(LANGUAGE_STORAGE_KEY) || "en";
}

if (!i18next.isInitialized) {
  i18next.use(initReactI18next).init({
    lng: getInitialLanguage(),
    fallbackLng: "en",
    resources: {
      en: { labels: enLabels },
      zh: { labels: zhLabels },
    },
    defaultNS: "labels",
    interpolation: { escapeValue: false },
  });
}

export default i18next;
