"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  fetchRoleById,
  fetchAllPermissions,
  createRole,
  updateRole,
  Permission,
} from "@/services/roleApi";
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
import { AlertCircle, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

function TogglePill({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        selected
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background text-muted-foreground border-input hover:bg-accent hover:text-accent-foreground"
      )}
    >
      {label}
    </button>
  );
}

export default function RoleFormPage() {
  const router = useRouter();
  const params = useParams();
  const idParam = params?.id as string;
  const isEditMode = idParam !== "new";

  const [form, setForm] = useState({
    name: "",
    description: "",
    permissionIds: [] as string[],
  });

  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const permissions = await fetchAllPermissions();
        setAvailablePermissions(permissions);

        if (isEditMode) {
          const role = await fetchRoleById(idParam);
          setForm({
            name: role.name,
            description: role.description || "",
            permissionIds: role.permissions.map((p) => p.id),
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load form data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [idParam, isEditMode]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function togglePermission(id: string) {
    setForm((prev) => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(id)
        ? prev.permissionIds.filter((p) => p !== id)
        : [...prev.permissionIds, id],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (isEditMode) {
        await updateRole(idParam, form);
      } else {
        await createRole(form);
      }
      router.push("/roles");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save role");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/roles")}
        className="-ml-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to list
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? "Edit Role" : "Create Role"}</CardTitle>
          <CardDescription>
            {isEditMode
              ? "Update this role's name, description and the permissions it grants."
              : "Define a new role and the permissions it grants to whoever holds it."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  placeholder="e.g. ADMIN"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  placeholder="What this role is for"
                />
              </div>

              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="flex flex-wrap gap-2">
                  {availablePermissions.length === 0 && (
                    <p className="text-sm text-muted-foreground">No permissions available.</p>
                  )}
                  {availablePermissions.map((perm) => (
                    <TogglePill
                      key={perm.id}
                      label={perm.name}
                      selected={form.permissionIds.includes(perm.id)}
                      onClick={() => togglePermission(perm.id)}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : isEditMode ? "Update" : "Create"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/roles")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
