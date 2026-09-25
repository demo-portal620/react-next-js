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
import Link from "next/link";
import { Eye, EyeOff, User, Lock, AlertCircle, ShieldCheck, Home } from "lucide-react";
import { loginUser, verifyLoginTotp } from "@/services/authApi";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Set once loginUser() reports requiresTotp: true - switches the form
  // below to the "enter your authenticator code" step instead of resetting
  // back to username/password (the pendingToken already proves the
  // password was correct, so there's no reason to ask for it again).
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Client-side validation
    if (!username || !password) {
      setError(t("LOGIN_ERROR_REQUIRED_FIELDS"));
      setIsLoading(false);
      return;
    }

    try {
      const result = await loginUser(username, password);

      if (result.requiresTotp && result.pendingToken) {
        setPendingToken(result.pendingToken);
        setError("");
        return;
      }

      // Store the token and load the current user into AuthContext
      if (result.token) {
        await login(result.token);
      }

      setError("");
      router.push("/");
    } catch (error) {
      console.error("Login error:", error);
      setError(
        error instanceof Error
          ? error.message
          : t("LOGIN_ERROR_GENERIC")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyTotp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!pendingToken || !totpCode) {
      setError(t("LOGIN_TOTP_ERROR_REQUIRED"));
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyLoginTotp(pendingToken, totpCode);
      if (result.token) {
        await login(result.token);
      }
      setError("");
      router.push("/");
    } catch (error) {
      console.error("TOTP verification error:", error);
      setError(
        error instanceof Error
          ? error.message
          : t("LOGIN_TOTP_ERROR_GENERIC")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="w-full max-w-md relative space-y-3">
      <Card className="bg-white/95 backdrop-blur shadow-xl border-0">
        <CardHeader className="space-y-1 pb-4">
          {/* Logo placeholder */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
          </div>

          <CardTitle className="text-2xl font-bold text-center text-gray-800">
            {t("LOGIN_TITLE")}
          </CardTitle>
          <CardDescription className="text-center text-gray-600">
            {t("LOGIN_SUBTITLE")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {pendingToken ? (
            <form onSubmit={handleVerifyTotp} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="animate-in fade-in-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="totp-code" className="text-sm font-medium text-gray-700">
                  {t("LOGIN_TOTP_LABEL")}
                </Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="totp-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 tracking-widest"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {t("LOGIN_TOTP_HINT")}
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t("LOGIN_TOTP_SUBMIT_LOADING")}</span>
                  </div>
                ) : (
                  t("LOGIN_TOTP_SUBMIT")
                )}
              </Button>

              <button
                type="button"
                className="w-full text-center text-sm text-gray-600 hover:text-gray-800"
                onClick={() => {
                  setPendingToken(null);
                  setTotpCode("");
                  setError("");
                }}
              >
                {t("LOGIN_TOTP_BACK")}
              </button>
            </form>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="animate-in fade-in-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Username Field */}
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-sm font-medium text-gray-700"
              >
                {t("LOGIN_USERNAME_LABEL")}
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder={t("LOGIN_USERNAME_PLACEHOLDER")}
                  className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                {t("LOGIN_PASSWORD_LABEL")}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("LOGIN_PASSWORD_PLACEHOLDER")}
                  className="pl-10 pr-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-10 w-10 p-0 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label
                  htmlFor="remember"
                  className="text-gray-600 cursor-pointer"
                >
                  {t("LOGIN_REMEMBER_ME")}
                </Label>
              </div>
              <button
                type="button"
                className="text-blue-600 hover:text-blue-800 font-medium"
                onClick={() => router.push("/forgot-password")}
              >
                {t("LOGIN_FORGOT_PASSWORD")}
              </button>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t("LOGIN_SUBMIT_LOADING")}</span>
                </div>
              ) : (
                t("LOGIN_SUBMIT")
              )}
            </Button>

            <p className="text-center text-sm text-gray-600">
              {t("LOGIN_NO_ACCOUNT")}{" "}
              <button
                type="button"
                onClick={() => router.push("/register")}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {t("LOGIN_REGISTER")}
              </button>
            </p>
          </form>
          )}
        </CardContent>
      </Card>
      <Link
        href="/homestay"
        className="flex items-center justify-center gap-1.5 text-sm text-gray-600 hover:text-blue-700"
      >
        <Home className="h-3.5 w-3.5" />
        {t("LOGIN_HOMESTAY_LINK")}
      </Link>
      </div>
    </div>
  );
}
