"use client";

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { fetchModules, ModuleKey } from "@/services/modulesApi";

interface ModulesContextValue {
  // False until the first fetch settles - isEnabled() reports true for everything until then, so a slow
  // response never makes a page flash "module off" at someone whose modules are all on.
  loaded: boolean;
  isEnabled: (key: ModuleKey) => boolean;
  refresh: () => Promise<void>;
}

const ModulesContext = createContext<ModulesContextValue>({
  loaded: false,
  isEnabled: () => true,
  refresh: async () => {},
});

export function ModulesProvider({ children }: { children: ReactNode }) {
  const [enabledByKey, setEnabledByKey] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const modules = await fetchModules();
      setEnabledByKey(Object.fromEntries(modules.map((m) => [m.moduleKey, m.enabled])));
    } catch {
      // Backend unreachable (e.g. still waking up) - keep whatever we had; everything reads as on.
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isEnabled = useCallback((key: ModuleKey) => enabledByKey[key] !== false, [enabledByKey]);

  return <ModulesContext.Provider value={{ loaded, isEnabled, refresh }}>{children}</ModulesContext.Provider>;
}

export function useModules() {
  return useContext(ModulesContext);
}
