"use client";

import i18n, { getStoredLanguage } from "@/config/i18n";
import { ReactNode, useEffect } from "react";

// Importing the config module runs i18next.init() once (guarded by
// isInitialized) - this component exists just to make that a clear, single
// place in the tree it happens, rather than a bare side-effect import
// scattered somewhere. useTranslation() works in any client component
// beneath this without further setup once it's mounted in the root layout.
export default function I18nProvider({ children }: { children: ReactNode }) {
  // Runs after hydration, not during the first render - i18next always
  // inits to "en" (see config/i18n.ts) so that first render matches the
  // server's HTML exactly. Restoring the user's actual saved language here
  // instead is a normal post-mount update, not a hydration mismatch.
  useEffect(() => {
    const stored = getStoredLanguage();
    if (stored && stored !== i18n.language) {
      i18n.changeLanguage(stored);
    }
  }, []);

  return <>{children}</>;
}
