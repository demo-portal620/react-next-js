"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { fetchUserById, updateUser, setUserRoles, resetPasswordForUser, User } from "@/services/userApi";
import { fetchAllRoles, Role } from "@/services/roleApi";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, KeyRound, Pencil, X } from "lucide-react";

function TogglePill({
  label,
  selected,
  onClick,
  disabled,
}: {
  label: string;
  selected: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50",
        selected
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background text-muted-foreground border-input hover:bg-accent hover:text-accent-foreground",
        !onClick && "cursor-default hover:bg-background hover:text-muted-foreground"
      )}
    >
      {label}
    </button>
  );
}

const emptyForm = { firstname: "", lastname: "", email: "", phoneNumber: "" };

export default function UserDetailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const idParam = params?.id as string;
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  const canEditFields = hasPermission("EDIT_USER");
  const canManageRoles = hasPermission("MANAGE_ROLE");
  const canEdit = canEditFields || canManageRoles;

  const [user, setUser] = useState<User | null>(null);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [stagedRoleIds, setStagedRoleIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [sendingReset, setSendingReset] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError("");
    // The full role catalog is only fetchable by someone holding
    // MANAGE_ROLE - a caller without it (e.g. an ADMIN with just
    // VIEW_USER/EDIT_USER) previously still triggered this fetch
    // unconditionally, which the backend correctly rejects but this page
    // had no graceful handling for. Skipping it entirely for a caller who
    // can't use it anyway avoids that failure and matches what they're
    // actually allowed to see.
    const rolesPromise = canManageRoles ? fetchAllRoles() : Promise.resolve([]);
    Promise.all([fetchUserById(idParam), rolesPromise])
      .then(([userData, roles]) => {
        setUser(userData);
        setAvailableRoles(roles);
      })
      .catch((err) => setError(err.message || t("USER_DETAIL_LOAD_ERROR")))
      .finally(() => setLoading(false));
  }, [idParam, canManageRoles]);

  function startEdit() {
    if (!user) return;
    setForm({
      firstname: user.firstname || "",
      lastname: user.lastname || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
    });
    setStagedRoleIds(new Set((user.roles || []).map((r) => r.id)));
    setSaveError("");
    setIsEditing(true);
  }

  function cancelEdit() {
    setIsEditing(false);
    setSaveError("");
  }

  function toggleStagedRole(roleId: string) {
    setStagedRoleIds((prev) => {
      const next = new Set(prev);
      if (next.has(roleId)) next.delete(roleId);
      else next.add(roleId);
      return next;
    });
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setSaveError("");
    try {
      let updated = user;
      if (canEditFields) {
        updated = await updateUser(idParam, {
          email: form.email.trim(),
          firstname: form.firstname.trim() || undefined,
          lastname: form.lastname.trim() || undefined,
          phoneNumber: form.phoneNumber.trim() || undefined,
        });
      }
      if (canManageRoles) {
        updated = await setUserRoles(idParam, Array.from(stagedRoleIds));
      }
      setUser(updated);
      setIsEditing(false);
      toast({ description: t("USER_DETAIL_UPDATED_TOAST") });
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : t("USER_DETAIL_SAVE_ERROR"));
    } finally {
      setSaving(false);
    }
  }

  async function handleSendReset() {
    if (!user) return;
    setSendingReset(true);
    try {
      await resetPasswordForUser(idParam);
      toast({ description: t("USER_DETAIL_RESET_EMAIL_SENT", { email: user.email }) });
    } catch (err) {
      toast({
        variant: "destructive",
        title: t("USER_DETAIL_RESET_FAILED_TITLE"),
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSendingReset(false);
    }
  }

  if (loading) return <div className="p-6 max-w-2xl mx-auto">{t("COMMON_LOADING")}</div>;

  if (error) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => router.push("/users")}>
          <ArrowLeft className="h-4 w-4" />
          {t("USER_DETAIL_BACK")}
        </Button>
      </div>
    );
  }

  const assignedRoleIds = new Set((user?.roles || []).map((r) => r.id));
  const displayedRoleIds = isEditing ? stagedRoleIds : assignedRoleIds;
  const effectivePermissions = Array.from(
    new Map(
      (user?.roles || []).flatMap((r) => r.permissions).map((p) => [p.id, p])
    ).values()
  );

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("USER_DETAIL_TITLE")}</h1>
          <p className="text-sm text-muted-foreground">{user?.username}</p>
        </div>
        {!isEditing && (
          <div className="flex gap-2">
            {canEditFields && (
              <Button variant="outline" onClick={handleSendReset} disabled={sendingReset}>
                <KeyRound className="h-4 w-4" />
                {sendingReset ? t("USER_DETAIL_SENDING") : t("USER_DETAIL_RESET_PASSWORD")}
              </Button>
            )}
            {canEdit && (
              <Button onClick={startEdit}>
                <Pencil className="h-4 w-4" />
                {t("COMMON_EDIT")}
              </Button>
            )}
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("USER_DETAIL_ACCOUNT_DETAILS")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {saveError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{saveError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label>{t("USER_DETAIL_USERNAME")}</Label>
            <div className="text-sm py-1.5">{user?.username}</div>
          </div>

          {isEditing && canEditFields ? (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="u-firstname">{t("USER_DETAIL_FIRSTNAME")}</Label>
                  <Input
                    id="u-firstname"
                    value={form.firstname}
                    onChange={(e) => setForm((f) => ({ ...f, firstname: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="u-lastname">{t("USER_DETAIL_LASTNAME")}</Label>
                  <Input
                    id="u-lastname"
                    value={form.lastname}
                    onChange={(e) => setForm((f) => ({ ...f, lastname: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="u-email">{t("USER_DETAIL_EMAIL")}</Label>
                <Input
                  id="u-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="u-phone">{t("USER_DETAIL_PHONE")}</Label>
                <Input
                  id="u-phone"
                  value={form.phoneNumber}
                  onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label>{t("USER_DETAIL_NAME")}</Label>
                <div className="text-sm py-1.5">
                  {[user?.firstname, user?.lastname].filter(Boolean).join(" ") || "-"}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t("USER_DETAIL_EMAIL")}</Label>
                <div className="text-sm py-1.5">{user?.email}</div>
              </div>
              <div className="space-y-1.5">
                <Label>{t("USER_DETAIL_PHONE")}</Label>
                <div className="text-sm py-1.5">{user?.phoneNumber || "-"}</div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("USER_DETAIL_ROLES_TITLE")}</CardTitle>
        </CardHeader>
        <CardContent>
          {canManageRoles ? (
            <div className="flex flex-wrap gap-2">
              {availableRoles.length === 0 && (
                <p className="text-sm text-muted-foreground">{t("USER_DETAIL_NO_ROLES_EXIST")}</p>
              )}
              {availableRoles.map((role) => (
                <TogglePill
                  key={role.id}
                  label={role.name}
                  selected={displayedRoleIds.has(role.id)}
                  onClick={isEditing ? () => toggleStagedRole(role.id) : undefined}
                />
              ))}
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mb-2">
                {t("USER_DETAIL_NO_MANAGE_ROLES")}
              </p>
              <div className="flex flex-wrap gap-2">
                {(user?.roles || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("USER_DETAIL_NO_ROLES_ASSIGNED")}</p>
                ) : (
                  (user?.roles || []).map((role) => (
                    <TogglePill key={role.id} label={role.name} selected />
                  ))
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("USER_DETAIL_PERMISSIONS_TITLE")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {effectivePermissions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("USER_DETAIL_NO_PERMISSIONS")}
              </p>
            ) : (
              effectivePermissions.map((p) => (
                <span
                  key={p.id}
                  className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium"
                >
                  {p.name}
                </span>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        {isEditing ? (
          <>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? t("USER_DETAIL_SAVING") : t("COMMON_SAVE")}
            </Button>
            <Button variant="outline" onClick={cancelEdit} disabled={saving}>
              <X className="h-4 w-4" />
              {t("COMMON_CANCEL")}
            </Button>
          </>
        ) : (
          <Button variant="outline" onClick={() => router.push("/users")}>
            <ArrowLeft className="h-4 w-4" />
            {t("USER_DETAIL_BACK")}
          </Button>
        )}
      </div>
    </div>
  );
}
