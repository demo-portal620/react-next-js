"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      setError(err instanceof Error ? err.message : t("TELEGRAM_GENERATE_ERROR"));
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link);
      toast({ description: t("TELEGRAM_COPIED_TOAST") });
    } catch {
      toast({ variant: "destructive", description: t("TELEGRAM_COPY_FAILED_TOAST") });
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("TELEGRAM_TITLE")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("TELEGRAM_SUBTITLE")}
        </p>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {t("TELEGRAM_WARNING")}
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
              <CardTitle className="text-base">{t("TELEGRAM_INVITE_TITLE")}</CardTitle>
              <CardDescription>{t("TELEGRAM_INVITE_DESC")}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? t("TELEGRAM_GENERATING") : t("TELEGRAM_GET_LINK")}
          </Button>

          {link && (
            <div className="flex items-center gap-2">
              <Input value={link} readOnly className="font-mono text-sm" />
              <Button variant="outline" size="icon" onClick={handleCopy} title={t("TELEGRAM_COPY")}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" asChild title={t("TELEGRAM_OPEN")}>
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
