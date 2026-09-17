"use client";

import { Suspense, useEffect, useState } from "react";
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
import { MailCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import { verifyEmail, resendVerification } from "@/services/authApi";

type Status = "verifying" | "success" | "error";

function VerifyEmailContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>("verifying");
  const [error, setError] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resendSubmitted, setResendSubmitted] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError(t("VERIFY_EMAIL_MISSING_TOKEN"));
      return;
    }

    verifyEmail(token)
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setError(err instanceof Error ? err.message : t("VERIFY_EMAIL_ERROR_EXPIRED"));
      });
    // Only ever run once per page load - re-running on every token identity
    // change isn't a real scenario here (the token comes from the URL and
    // doesn't change while this page is mounted).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleResend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!resendEmail) return;

    setResendLoading(true);
    try {
      await resendVerification(resendEmail);
      // Always show the same message whether or not the email matches an
      // unverified account - the backend responds success either way, on
      // purpose, so this never leaks account existence.
      setResendSubmitted(true);
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md bg-white/95 backdrop-blur shadow-xl border-0 relative">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <MailCheck className="h-8 w-8 text-white" />
          </div>
        </div>

        <CardTitle className="text-2xl font-bold text-center text-gray-800">
          {t("VERIFY_EMAIL_TITLE")}
        </CardTitle>
        <CardDescription className="text-center text-gray-600">
          {t("VERIFY_EMAIL_SUBTITLE")}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {status === "verifying" && (
          <p className="text-center text-sm text-gray-600">{t("VERIFY_EMAIL_VERIFYING")}</p>
        )}

        {status === "success" && (
          <>
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                {t("VERIFY_EMAIL_SUCCESS")}
              </AlertDescription>
            </Alert>
            <Button
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              onClick={() => router.push("/login")}
            >
              {t("VERIFY_EMAIL_GO_LOGIN")}
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>

            {resendSubmitted ? (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  {t("VERIFY_EMAIL_RESEND_SUCCESS")}
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleResend} className="space-y-3">
                <p className="text-sm text-gray-600">
                  {t("VERIFY_EMAIL_RESEND_PROMPT")}
                </p>
                <div className="space-y-2">
                  <Label htmlFor="resend-email">{t("VERIFY_EMAIL_LABEL")}</Label>
                  <Input
                    id="resend-email"
                    type="email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    disabled={resendLoading}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  disabled={resendLoading}
                >
                  {resendLoading ? t("VERIFY_EMAIL_RESEND_SUBMIT_LOADING") : t("VERIFY_EMAIL_RESEND_SUBMIT")}
                </Button>
              </form>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* useSearchParams() requires a Suspense boundary for Next.js to
          statically prerender this page - without it, `next build` fails. */}
      <Suspense fallback={null}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
