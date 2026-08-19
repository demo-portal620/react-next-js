"use client";

import { useState } from "react";
import { fetchTelegramInviteLink } from "@/services/telegramApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Copy, ExternalLink, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TelegramAlertsPage() {
  const { toast } = useToast();
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    setLoading(true);
    setError("");
    try {
      const inviteLink = await fetchTelegramInviteLink();
      setLink(inviteLink);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate invite link");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link);
      toast({ description: "Invite link copied." });
    } catch {
      toast({ variant: "destructive", description: "Couldn't copy - copy it manually instead." });
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Telegram Alerts</h1>
        <p className="text-sm text-muted-foreground">
          Backend system errors (500s and unhandled exceptions) are pushed to a Telegram group in
          real time, so DevOps hears about it without watching logs.
        </p>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Generating a link doesn&apos;t notify anyone or add them automatically - Telegram
          requires each person to open the link and join themselves. Share it directly with
          whoever should receive alerts.
        </AlertDescription>
      </Alert>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Send className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-base">Alert group invite</CardTitle>
              <CardDescription>Get an invite link to the DevOps alert group.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? "Generating..." : "Get invite link"}
          </Button>

          {link && (
            <div className="flex items-center gap-2">
              <Input value={link} readOnly className="font-mono text-sm" />
              <Button variant="outline" size="icon" onClick={handleCopy} title="Copy">
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" asChild title="Open in Telegram">
                <a href={link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
