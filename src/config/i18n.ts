"use client";

import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import enLabels from "@/locales/en/labels";

if (!i18next.isInitialized) {
  i18next.use(initReactI18next).init({
    lng: "en",
    fallbackLng: "en",
    resources: {
      en: { labels: enLabels },
    },
    defaultNS: "labels",
    interpolation: { escapeValue: false },
  });
}

export default i18next;
