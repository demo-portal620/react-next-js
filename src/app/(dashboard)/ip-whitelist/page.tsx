"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  IpWhitelistEntry,
  fetchIpWhitelistConfig,
  setIpWhitelistEnabled,
  fetchIpWhitelistEntries,
  addIpWhitelistEntry,
  removeIpWhitelistEntry,
} from "@/services/ipWhitelistApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, ShieldAlert, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function IpWhitelistPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(false);
  const [entries, setEntries] = useState<IpWhitelistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const [ipOrCidr, setIpOrCidr] = useState("");
  const [description, setDescription] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([fetchIpWhitelistConfig(), fetchIpWhitelistEntries()])
      .then(([config, entryList]) => {
        setEnabled(config.enabled);
        setEntries(entryList);
      })
      .catch((err) => setError(err instanceof Error ? err.message : t("IP_WHITELIST_LOAD_ERROR")))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleToggle() {
    setToggling(true);
    setError("");
    try {
      const config = await setIpWhitelistEnabled(!enabled);
      setEnabled(config.enabled);
      toast({ description: config.enabled ? t("IP_WHITELIST_ENABLED_TOAST") : t("IP_WHITELIST_DISABLED_TOAST") });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("IP_WHITELIST_TOGGLE_ERROR"));
    } finally {
      setToggling(false);
    }
  }

  async function handleAdd() {
    if (!ipOrCidr.trim()) {
      setError(t("IP_WHITELIST_REQUIRE_IP"));
      return;
    }
    setError("");
    setAdding(true);
    try {
      await addIpWhitelistEntry(ipOrCidr.trim(), description.trim() || undefined);
      setIpOrCidr("");
      setDescription("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("IP_WHITELIST_ADD_ERROR"));
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(id: string) {
    try {
      await removeIpWhitelistEntry(id);
      load();
    } catch (err) {
      toast({
        variant: "destructive",
        title: t("IP_WHITELIST_REMOVE_ERROR_TITLE"),
        description: err instanceof Error ? err.message : undefined,
      });
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("IP_WHITELIST_TITLE")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("IP_WHITELIST_SUBTITLE")}
        </p>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {t("IP_WHITELIST_WARNING_PART1")}{" "}
          <code className="text-xs">IP_WHITELIST_ENABLED=false</code>{" "}
          {t("IP_WHITELIST_WARNING_PART2")}
        </AlertDescription>
      </Alert>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle className="text-base">{t("IP_WHITELIST_ENFORCEMENT_TITLE")}</CardTitle>
                <CardDescription>
                  {t("IP_WHITELIST_CURRENTLY")} <span className="font-medium">{enabled ? t("IP_WHITELIST_ON") : t("IP_WHITELIST_OFF")}</span>
                </CardDescription>
              </div>
            </div>
            <Button
              variant={enabled ? "destructive" : "default"}
              onClick={handleToggle}
              disabled={loading || toggling}
            >
              {toggling ? t("IP_WHITELIST_UPDATING") : enabled ? t("IP_WHITELIST_DISABLE") : t("IP_WHITELIST_ENABLE")}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("IP_WHITELIST_ALLOWED_NETWORKS")}</CardTitle>
          <CardDescription>{t("IP_WHITELIST_ALLOWED_NETWORKS_DESC")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] items-end">
            <div className="space-y-1.5">
              <Label htmlFor="ip-entry">{t("IP_WHITELIST_IP_LABEL")}</Label>
              <Input
                id="ip-entry"
                value={ipOrCidr}
                onChange={(e) => setIpOrCidr(e.target.value)}
                placeholder="203.0.113.42"
                disabled={adding}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ip-description">{t("IP_WHITELIST_DESC_LABEL")}</Label>
              <Input
                id="ip-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("IP_WHITELIST_DESC_PLACEHOLDER")}
                disabled={adding}
              />
            </div>
            <Button onClick={handleAdd} disabled={adding}>
              {adding ? t("IP_WHITELIST_ADDING") : t("IP_WHITELIST_ADD")}
            </Button>
          </div>

          <div className="divide-y rounded-md border">
            {loading ? (
              <p className="p-4 text-sm text-muted-foreground">{t("COMMON_LOADING")}</p>
            ) : entries.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">{t("IP_WHITELIST_EMPTY")}</p>
            ) : (
              entries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between px-4 py-2.5">
                  <div>
                    <div className="font-mono text-sm">{entry.ipOrCidr}</div>
                    {entry.description && (
                      <div className="text-xs text-muted-foreground">{entry.description}</div>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleRemove(entry.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
