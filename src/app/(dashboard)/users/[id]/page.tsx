"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchUserById, updateUser, setUserRoles, User } from "@/services/userApi";
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
import { AlertCircle, ArrowLeft, Pencil, X } from "lucide-react";

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

  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.all([fetchUserById(idParam), fetchAllRoles()])
      .then(([userData, roles]) => {
        setUser(userData);
        setAvailableRoles(roles);
      })
      .catch((err) => setError(err.message || "Failed to load user"))
      .finally(() => setLoading(false));
  }, [idParam]);

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
      toast({ description: "User updated." });
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-6 max-w-2xl mx-auto">Loading...</div>;

  if (error) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => router.push("/users")}>
          <ArrowLeft className="h-4 w-4" />
          Back to list
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">User Detail</h1>
          <p className="text-sm text-muted-foreground">{user?.username}</p>
        </div>
        {canEdit && !isEditing && (
          <Button onClick={startEdit}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {saveError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{saveError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label>Username</Label>
            <div className="text-sm py-1.5">{user?.username}</div>
          </div>

          {isEditing && canEditFields ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="u-firstname">First Name</Label>
                  <Input
                    id="u-firstname"
                    value={form.firstname}
                    onChange={(e) => setForm((f) => ({ ...f, firstname: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="u-lastname">Last Name</Label>
                  <Input
                    id="u-lastname"
                    value={form.lastname}
                    onChange={(e) => setForm((f) => ({ ...f, lastname: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="u-email">Email</Label>
                <Input
                  id="u-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="u-phone">Phone</Label>
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
                <Label>Name</Label>
                <div className="text-sm py-1.5">
                  {[user?.firstname, user?.lastname].filter(Boolean).join(" ") || "-"}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <div className="text-sm py-1.5">{user?.email}</div>
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <div className="text-sm py-1.5">{user?.phoneNumber || "-"}</div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Roles</CardTitle>
        </CardHeader>
        <CardContent>
          {!canManageRoles && !isEditing && (
            <p className="text-xs text-muted-foreground mb-2">
              You don&apos;t have permission to change role assignments.
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {availableRoles.length === 0 && (
              <p className="text-sm text-muted-foreground">No roles exist yet.</p>
            )}
            {availableRoles.map((role) => (
              <TogglePill
                key={role.id}
                label={role.name}
                selected={displayedRoleIds.has(role.id)}
                onClick={
                  isEditing && canManageRoles ? () => toggleStagedRole(role.id) : undefined
                }
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Effective permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {effectivePermissions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                None - this user has no roles assigned and cannot access any protected feature.
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
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button variant="outline" onClick={cancelEdit} disabled={saving}>
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </>
        ) : (
          <Button variant="outline" onClick={() => router.push("/users")}>
            <ArrowLeft className="h-4 w-4" />
            Back to list
          </Button>
        )}
      </div>
    </div>
  );
}
