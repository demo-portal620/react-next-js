"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { User as UserIcon, AlertCircle, Camera, ShieldCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchCurrentUser, uploadProfilePicture, profilePictureUrl, User } from "@/services/userApi";
import { fetchTotpStatus, disableTotp } from "@/services/totpApi";
import { useAuth } from "@/context/AuthContext";

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="font-medium">{value || "-"}</div>
    </div>
  );
}

export default function ProfilePage() {
  const { t } = useTranslation();
  const { refreshCurrentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [totpEnabled, setTotpEnabled] = useState<boolean | null>(null);
  const [totpLoading, setTotpLoading] = useState(true);
  const [disablingTotp, setDisablingTotp] = useState(false);
  const [totpPassword, setTotpPassword] = useState("");
  const [totpError, setTotpError] = useState("");
  const [totpSubmitting, setTotpSubmitting] = useState(false);

  useEffect(() => {
    fetchCurrentUser()
      .then(setUser)
      .catch((err) => setError(err.message || t("PROFILE_LOAD_ERROR")))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchTotpStatus()
      .then((status) => setTotpEnabled(status.enabled))
      .catch(() => setTotpEnabled(null))
      .finally(() => setTotpLoading(false));
  }, []);

  async function handleDisableTotp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!totpPassword) {
      setTotpError(t("PROFILE_TOTP_PASSWORD_REQUIRED"));
      return;
    }
    setTotpError("");
    setTotpSubmitting(true);
    try {
      await disableTotp(totpPassword);
      setTotpEnabled(false);
      setDisablingTotp(false);
      setTotpPassword("");
    } catch (err) {
      setTotpError(err instanceof Error ? err.message : t("PROFILE_TOTP_DISABLE_ERROR"));
    } finally {
      setTotpSubmitting(false);
    }
  }

  // Revoke the object URL once it's no longer needed, rather than leaking
  // it for the lifetime of the page.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(t("PROFILE_IMAGE_ONLY"));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError(t("PROFILE_IMAGE_TOO_LARGE"));
      return;
    }

    setError("");
    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    try {
      const updated = await uploadProfilePicture(file);
      setUser(updated);
      await refreshCurrentUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("PROFILE_UPLOAD_ERROR"));
    } finally {
      setUploading(false);
      setPreviewUrl(null);
    }
  }

  const avatarSrc = previewUrl || (user ? profilePictureUrl(user.id, user.profilePictureKey) : null);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("NAVBAR_MY_PROFILE")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("PROFILE_SUBTITLE")}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelected}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="group relative h-12 w-12 shrink-0 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden disabled:opacity-60"
              title={t("PROFILE_CHANGE_PHOTO")}
            >
              {avatarSrc ? (
                // eslint-disable-next-line @next/next/no-img-element -- backend-streamed/blob preview, not a static asset
                <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
              ) : (
                <UserIcon className="h-6 w-6 text-primary" />
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-4 w-4 text-white" />
              </span>
            </button>
            <div>
              <CardTitle>{user?.username || (loading ? t("COMMON_LOADING") : t("PROFILE_UNKNOWN_USER"))}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">{t("COMMON_LOADING")}</p>
          ) : user ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={t("PROFILE_FIELD_USERNAME")} value={user.username} />
              <Field label={t("PROFILE_FIELD_EMAIL")} value={user.email} />
              <Field label={t("PROFILE_FIELD_FIRSTNAME")} value={user.firstname} />
              <Field label={t("PROFILE_FIELD_LASTNAME")} value={user.lastname} />
              <Field label={t("PROFILE_FIELD_PHONE")} value={user.phoneNumber} />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-base">{t("PROFILE_TOTP_TITLE")}</CardTitle>
              <CardDescription>
                {totpLoading
                  ? t("COMMON_LOADING")
                  : totpEnabled
                  ? t("PROFILE_TOTP_ENABLED_DESC")
                  : t("PROFILE_TOTP_DISABLED_DESC")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        {!totpLoading && totpEnabled && (
          <CardContent className="space-y-3">
            {totpError && (
              <Alert variant="destructive">
                <AlertDescription>{totpError}</AlertDescription>
              </Alert>
            )}
            {disablingTotp ? (
              <form onSubmit={handleDisableTotp} className="flex items-end gap-3">
                <div className="space-y-1.5 flex-1">
                  <Label htmlFor="totp-disable-password">{t("PROFILE_TOTP_CURRENT_PASSWORD")}</Label>
                  <Input
                    id="totp-disable-password"
                    type="password"
                    value={totpPassword}
                    onChange={(e) => setTotpPassword(e.target.value)}
                    disabled={totpSubmitting}
                  />
                </div>
                <Button type="submit" variant="destructive" disabled={totpSubmitting}>
                  {totpSubmitting ? t("PROFILE_TOTP_DISABLING") : t("PROFILE_TOTP_CONFIRM")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={totpSubmitting}
                  onClick={() => {
                    setDisablingTotp(false);
                    setTotpPassword("");
                    setTotpError("");
                  }}
                >
                  {t("COMMON_CANCEL")}
                </Button>
              </form>
            ) : (
              <Button variant="outline" onClick={() => setDisablingTotp(true)}>
                {t("PROFILE_TOTP_DISABLE")}
              </Button>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
