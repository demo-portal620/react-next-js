"use client";

import "@/config/i18n";
import { ReactNode } from "react";

// Importing the config module runs i18next.init() once (guarded by
// isInitialized) - this component exists just to make that a clear, single
// place in the tree it happens, rather than a bare side-effect import
// scattered somewhere. useTranslation() works in any client component
// beneath this without further setup once it's mounted in the root layout.
export default function I18nProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
