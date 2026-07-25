"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchUserById, setUserRoles, User } from "@/services/userApi";
import { fetchRoles, Role } from "@/services/roleApi";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

function TogglePill({
  label,
  selected,
  onClick,
  disabled,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
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
          : "bg-background text-muted-foreground border-input hover:bg-accent hover:text-accent-foreground"
      )}
    >
      {label}
    </button>
  );
}

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const idParam = params?.id as string;
  const { hasPermission } = useAuth();
  const canManageRoles = hasPermission("MANAGE_ROLE");

  const [user, setUser] = useState<User | null>(null);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rolesError, setRolesError] = useState("");
  const [savingRoles, setSavingRoles] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.all([fetchUserById(idParam), fetchRoles(1, 100, "")])
      .then(([userData, rolesData]) => {
        setUser(userData);
        setAvailableRoles(rolesData.roles);
      })
      .catch((err) => setError(err.message || "Failed to load user"))
      .finally(() => setLoading(false));
  }, [idParam]);

  async function toggleRole(roleId: string) {
    if (!user) return;
    const currentRoleIds = (user.roles || []).map((r) => r.id);
    const nextRoleIds = currentRoleIds.includes(roleId)
      ? currentRoleIds.filter((id) => id !== roleId)
      : [...currentRoleIds, roleId];

    setSavingRoles(true);
    setRolesError("");
    try {
      const updated = await setUserRoles(idParam, nextRoleIds);
      setUser(updated);
    } catch (err) {
      setRolesError(err instanceof Error ? err.message : "Failed to update roles");
    } finally {
      setSavingRoles(false);
    }
  }

  if (loading) return <div className="p-4">Loading...</div>;

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => router.push("/users")}
          className="bg-gray-500 text-white px-3 py-1 rounded"
        >
          Back to list
        </button>
      </div>
    );
  }

  const assignedRoleIds = new Set((user?.roles || []).map((r) => r.id));
  const effectivePermissions = Array.from(
    new Map(
      (user?.roles || []).flatMap((r) => r.permissions).map((p) => [p.id, p])
    ).values()
  );

  return (
    <div className="p-4 max-w-lg">
      <h1 className="text-xl font-bold mb-4">User Detail</h1>

      <div className="space-y-3">
        <div>
          <div className="text-sm text-gray-500">Username</div>
          <div>{user?.username}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Name</div>
          <div>{[user?.firstname, user?.lastname].filter(Boolean).join(" ") || "-"}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Email</div>
          <div>{user?.email}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Phone</div>
          <div>{user?.phoneNumber || "-"}</div>
        </div>
      </div>

      <div className="mt-6">
        <div className="text-sm text-gray-500 mb-2">Roles</div>
        {!canManageRoles && (
          <p className="text-xs text-gray-400 mb-2">
            You don&apos;t have permission to change role assignments.
          </p>
        )}
        {rolesError && <p className="text-red-600 text-sm mb-2">{rolesError}</p>}
        <div className="flex flex-wrap gap-2">
          {availableRoles.length === 0 && (
            <p className="text-sm text-gray-500">No roles exist yet.</p>
          )}
          {availableRoles.map((role) => (
            <TogglePill
              key={role.id}
              label={role.name}
              selected={assignedRoleIds.has(role.id)}
              onClick={() => toggleRole(role.id)}
              disabled={savingRoles || !canManageRoles}
            />
          ))}
        </div>
      </div>

      <div className="mt-6">
        <div className="text-sm text-gray-500 mb-2">Effective permissions (from roles above)</div>
        <div className="flex flex-wrap gap-2">
          {effectivePermissions.length === 0 ? (
            <p className="text-sm text-gray-500">
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
      </div>

      <button
        onClick={() => router.push("/users")}
        className="mt-6 bg-gray-500 text-white px-3 py-1 rounded"
      >
        Back to list
      </button>
    </div>
  );
}
