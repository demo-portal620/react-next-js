"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
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
import { Lock, AlertCircle } from "lucide-react";
import { confirmPasswordReset } from "@/services/authApi";

function ResetPasswordForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!token) {
      setError(t("RESET_PASSWORD_ERROR_MISSING_TOKEN"));
      return;
    }
    if (newPassword.length < 8) {
      setError(t("RESET_PASSWORD_ERROR_TOO_SHORT"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t("RESET_PASSWORD_ERROR_MISMATCH"));
      return;
    }

    setIsLoading(true);
    try {
      await confirmPasswordReset(token, newPassword);
      router.push("/login?reset=success");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("RESET_PASSWORD_ERROR_GENERIC"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md bg-white/95 backdrop-blur shadow-xl border-0 relative">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Lock className="h-8 w-8 text-white" />
          </div>
        </div>

        <CardTitle className="text-2xl font-bold text-center text-gray-800">
          {t("RESET_PASSWORD_TITLE")}
        </CardTitle>
        <CardDescription className="text-center text-gray-600">
          {t("RESET_PASSWORD_SUBTITLE")}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {!token && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t("RESET_PASSWORD_MISSING_TOKEN")}{" "}
              <button
                type="button"
                onClick={() => router.push("/forgot-password")}
                className="underline font-medium"
              >
                {t("RESET_PASSWORD_REQUEST_NEW")}
              </button>
              .
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="newPassword">{t("RESET_PASSWORD_NEW_LABEL")}</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isLoading || !token}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t("RESET_PASSWORD_CONFIRM_LABEL")}</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading || !token}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            disabled={isLoading || !token}
          >
            {isLoading ? t("RESET_PASSWORD_SUBMIT_LOADING") : t("RESET_PASSWORD_SUBMIT")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* useSearchParams() requires a Suspense boundary for Next.js to
          statically prerender this page - without it, `next build` fails. */}
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
