"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createUser } from "@/services/userApi";
import { fetchRoles, Role } from "@/services/roleApi";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";

// Which roles the currently logged-in admin is allowed to grant here - a
// UX-only restriction, matching what UserServiceImpl.canGrantRole actually
// enforces server-side (SUPERADMIN -> ADMIN or WORKER, ADMIN -> WORKER
// only, nobody can grant SUPERADMIN through this form at all).
function grantableRoleNames(isSuperAdmin: boolean): string[] {
  return isSuperAdmin ? ["ADMIN", "WORKER"] : ["WORKER"];
}

export default function NewUserPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const isSuperAdmin = currentUser?.roles?.some((r) => r.name === "SUPERADMIN") ?? false;

  const [roles, setRoles] = useState<Role[]>([]);
  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    firstname: "",
    lastname: "",
    phoneNumber: "",
    roleId: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRoles(1, 50, "")
      .then((data) =>
        setRoles(data.roles.filter((r) => grantableRoleNames(isSuperAdmin).includes(r.name)))
      )
      .catch(() => setRoles([]));
  }, [isSuperAdmin]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.username || !form.password || !form.email || !form.roleId) {
      setError("Username, password, email and role are required.");
      return;
    }
    setSaving(true);
    try {
      await createUser({
        username: form.username,
        password: form.password,
        email: form.email,
        firstname: form.firstname || undefined,
        lastname: form.lastname || undefined,
        phoneNumber: form.phoneNumber || undefined,
        roleId: form.roleId,
      });
      router.push("/users");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <Button variant="ghost" size="sm" onClick={() => router.push("/users")}>
        <ArrowLeft className="h-4 w-4" />
        Back to Users
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Add User</CardTitle>
          <CardDescription>
            Creates an account with a role already assigned - unlike public self-registration,
            which starts with no access at all.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="new-username">Username</Label>
              <Input
                id="new-username"
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new-password">Password</Label>
              <Input
                id="new-password"
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new-email">Email</Label>
              <Input
                id="new-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="new-firstname">First name</Label>
                <Input
                  id="new-firstname"
                  value={form.firstname}
                  onChange={(e) => setForm((f) => ({ ...f, firstname: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-lastname">Last name</Label>
                <Input
                  id="new-lastname"
                  value={form.lastname}
                  onChange={(e) => setForm((f) => ({ ...f, lastname: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new-phone">Phone</Label>
              <Input
                id="new-phone"
                value={form.phoneNumber}
                onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select
                value={form.roleId}
                onValueChange={(value) => setForm((f) => ({ ...f, roleId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? "Creating..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
