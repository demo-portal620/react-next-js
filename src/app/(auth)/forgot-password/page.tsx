"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { KeyRound, AlertCircle, CheckCircle2 } from "lucide-react";
import { requestPasswordReset } from "@/services/authApi";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!email) {
      setError(t("FORGOT_PASSWORD_ERROR_REQUIRED"));
      return;
    }

    setIsLoading(true);
    try {
      await requestPasswordReset(email);
      // Always show the same message whether or not the email is actually
      // registered - the backend responds success either way, on purpose,
      // so this never leaks account existence.
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("FORGOT_PASSWORD_ERROR_GENERIC"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur shadow-xl border-0 relative">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <KeyRound className="h-8 w-8 text-white" />
            </div>
          </div>

          <CardTitle className="text-2xl font-bold text-center text-gray-800">
            {t("FORGOT_PASSWORD_TITLE")}
          </CardTitle>
          <CardDescription className="text-center text-gray-600">
            {t("FORGOT_PASSWORD_SUBTITLE")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {submitted ? (
            <div className="space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  {t("FORGOT_PASSWORD_SUCCESS")}
                </AlertDescription>
              </Alert>
              <Button
                type="button"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                onClick={() => router.push("/login")}
              >
                {t("FORGOT_PASSWORD_BACK_TO_SIGNIN")}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">{t("FORGOT_PASSWORD_EMAIL_LABEL")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("FORGOT_PASSWORD_EMAIL_PLACEHOLDER")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                disabled={isLoading}
              >
                {isLoading ? t("FORGOT_PASSWORD_SUBMIT_LOADING") : t("FORGOT_PASSWORD_SUBMIT")}
              </Button>

              <p className="text-center text-sm text-gray-600">
                {t("FORGOT_PASSWORD_REMEMBERED")}{" "}
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {t("FORGOT_PASSWORD_SIGNIN")}
                </button>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
