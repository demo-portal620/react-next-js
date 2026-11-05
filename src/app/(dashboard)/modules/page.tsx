"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle } from "lucide-react";
import { AppModule, ModuleKey, fetchModules, setModuleEnabled } from "@/services/modulesApi";
import { useModules } from "@/context/ModulesContext";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { LabelKey } from "@/locales/en/labels";

export default function ModulesPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { refresh } = useModules();
  const [modules, setModules] = useState<AppModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingKey, setSavingKey] = useState<ModuleKey | null>(null);

  useEffect(() => {
    fetchModules()
      .then(setModules)
      .catch((err) => setError(err instanceof Error ? err.message : t("MODULES_LOAD_ERROR")))
      .finally(() => setLoading(false));
  }, [t]);

  async function handleToggle(module: AppModule, enabled: boolean) {
    setSavingKey(module.moduleKey);
    try {
      const updated = await setModuleEnabled(module.moduleKey, enabled);
      setModules((prev) => prev.map((m) => (m.moduleKey === updated.moduleKey ? updated : m)));
      // Sidebar, dashboard and route guards all read the shared context, so they pick this up immediately.
      await refresh();
    } catch (err) {
      toast({
        variant: "destructive",
        description: err instanceof Error ? err.message : t("MODULES_SAVE_ERROR"),
      });
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("MODULES_TITLE")}</h1>
        <p className="text-sm text-muted-foreground">{t("MODULES_SUBTITLE")}</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("MODULES_LIST_TITLE")}</CardTitle>
          <CardDescription>{t("MODULES_CORE_NOTE")}</CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          {loading && <p className="text-sm text-muted-foreground">{t("COMMON_LOADING")}</p>}
          {modules.map((module) => (
            <label
              key={module.moduleKey}
              className="flex items-start gap-3 py-3 cursor-pointer first:pt-0 last:pb-0"
            >
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-input"
                checked={module.enabled}
                disabled={savingKey === module.moduleKey}
                onChange={(e) => handleToggle(module, e.target.checked)}
              />
              <span>
                <span className="block text-sm font-medium">{t(`MODULE_NAME_${module.moduleKey}` as LabelKey)}</span>
                <span className="block text-xs text-muted-foreground">
                  {t(`MODULE_DESC_${module.moduleKey}` as LabelKey)}
                </span>
              </span>
            </label>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
