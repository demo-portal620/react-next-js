"use client";

import { useEffect, useState, useCallback } from "react";
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
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load whitelist"))
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
      toast({ description: config.enabled ? "IP whitelist enabled." : "IP whitelist disabled." });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update whitelist");
    } finally {
      setToggling(false);
    }
  }

  async function handleAdd() {
    if (!ipOrCidr.trim()) {
      setError("Enter an IP address or CIDR range.");
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
      setError(err instanceof Error ? err.message : "Failed to add entry");
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
        title: "Failed to remove entry",
        description: err instanceof Error ? err.message : undefined,
      });
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">IP Whitelist</h1>
        <p className="text-sm text-muted-foreground">
          Demo of a network-level access gate, common in admin panels for regulated industries
          (e.g. iGaming) - blocks logins and API access from any network not on this list.
        </p>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Disabled by default on purpose - enabling this without your current IP on the list
          below will lock you out. Recovery doesn&apos;t require the portal: set{" "}
          <code className="text-xs">IP_WHITELIST_ENABLED=false</code> as an environment variable
          on the backend host and redeploy (on Render, use &ldquo;Save and Deploy&rdquo;, not
          &ldquo;Save Only&rdquo;) to restore access regardless of what&apos;s configured here.
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
                <CardTitle className="text-base">Whitelist enforcement</CardTitle>
                <CardDescription>
                  Currently <span className="font-medium">{enabled ? "ON" : "OFF"}</span>
                </CardDescription>
              </div>
            </div>
            <Button
              variant={enabled ? "destructive" : "default"}
              onClick={handleToggle}
              disabled={loading || toggling}
            >
              {toggling ? "Updating..." : enabled ? "Disable" : "Enable"}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Allowed networks</CardTitle>
          <CardDescription>Plain IPs or CIDR ranges (e.g. 203.0.113.42 or 203.0.113.0/24).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] items-end">
            <div className="space-y-1.5">
              <Label htmlFor="ip-entry">IP or CIDR</Label>
              <Input
                id="ip-entry"
                value={ipOrCidr}
                onChange={(e) => setIpOrCidr(e.target.value)}
                placeholder="203.0.113.42"
                disabled={adding}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ip-description">Description (optional)</Label>
              <Input
                id="ip-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Home office"
                disabled={adding}
              />
            </div>
            <Button onClick={handleAdd} disabled={adding}>
              {adding ? "Adding..." : "Add"}
            </Button>
          </div>

          <div className="divide-y rounded-md border">
            {loading ? (
              <p className="p-4 text-sm text-muted-foreground">Loading...</p>
            ) : entries.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No entries yet - the whitelist is empty.</p>
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
