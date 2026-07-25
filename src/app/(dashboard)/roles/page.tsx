"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Role, fetchRoles, deleteRole } from "@/services/roleApi";
import { useToast } from "@/hooks/use-toast";
import AppDialog from "@/components/custom-ui/app-dialog";
import DataTable, { DataTableColumn } from "@/components/DataTable/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertCircle,
  History,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

export default function RoleListPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    fetchRoles(page, pageSize, search)
      .then((data) => {
        setRoles(data.roles);
        setTotalCount(data.total);
      })
      .catch((err) => setError(err.message || "Failed to load roles"))
      .finally(() => setLoading(false));
  }, [page, pageSize, search]);

  useEffect(() => {
    load();
  }, [load]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteRole(deleteTarget.id);
      toast({ description: "Role deleted." });
      load();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to delete role",
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setDeleteTarget(null);
    }
  }

  const columns: DataTableColumn<Role>[] = [
    {
      key: "name",
      header: "Name",
      className: "px-4 py-3 font-medium",
      render: (role) => role.name,
    },
    {
      key: "description",
      header: "Description",
      className: "px-4 py-3 text-muted-foreground",
      render: (role) => role.description || "-",
    },
    {
      key: "permissions",
      header: "Permissions",
      render: (role) => (
        <div className="flex flex-wrap gap-1">
          {role.permissions.length === 0 ? (
            <span className="text-muted-foreground">-</span>
          ) : (
            role.permissions.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium"
              >
                {p.name}
              </span>
            ))
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Roles</h1>
          <p className="text-sm text-muted-foreground">
            Manage roles and the permissions each one grants. Assign roles to users from the user detail page.
          </p>
        </div>
        <Button onClick={() => router.push("/roles/new")}>
          <Plus className="h-4 w-4" />
          Add Role
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search</CardTitle>
          <CardDescription>Search by role name</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by role name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="secondary">
              {t("COMMON_SEARCH")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <DataTable
        columns={columns}
        rows={roles}
        getRowKey={(role) => role.id}
        loading={loading}
        emptyMessage="No roles found."
        itemLabel="role"
        page={page}
        pageSize={pageSize}
        total={totalCount}
        onPageChange={setPage}
        actions={(role) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/roles/${role.id}`)}>
                <Pencil className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/roles/${role.id}/history`)}>
                <History className="h-4 w-4" />
                History
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(role)}>
                <Trash2 className="h-4 w-4" />
                {t("COMMON_DELETE")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      <AppDialog
        title="Delete role"
        show={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onSave={confirmDelete}
        saveLabel={t("COMMON_DELETE")}
        saveVariant="destructive"
        cancelLabel={t("COMMON_CANCEL")}
      >
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete <span className="font-medium text-foreground">{deleteTarget?.name}</span>?
          Any user holding it will immediately lose the permissions it grants.
        </p>
      </AppDialog>
    </div>
  );
}
