"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { fetchUsers, User } from "@/services/userApi";
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
import { AlertCircle, Eye, Plus, Search } from "lucide-react";

export default function UserListPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    fetchUsers(page, pageSize, search)
      .then((data) => {
        setUsers(data.users);
        setTotalCount(data.total);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load users"))
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

  const columns: DataTableColumn<User>[] = [
    { key: "username", header: "Username", className: "px-4 py-3 font-medium" },
    {
      key: "name",
      header: "Name",
      className: "px-4 py-3 text-muted-foreground",
      csvValue: (user) => [user.firstname, user.lastname].filter(Boolean).join(" "),
      render: (user) => [user.firstname, user.lastname].filter(Boolean).join(" ") || "-",
    },
    { key: "email", header: "Email", className: "px-4 py-3 text-muted-foreground" },
    {
      key: "phoneNumber",
      header: "Phone",
      className: "px-4 py-3 text-muted-foreground",
      render: (user) => user.phoneNumber || "-",
    },
    {
      key: "roles",
      header: "Roles",
      csvValue: (user) => (user.roles || []).map((r) => r.name).join("; "),
      render: (user) => (
        <div className="flex flex-wrap gap-1">
          {(user.roles || []).length === 0 ? (
            <span className="text-muted-foreground">-</span>
          ) : (
            (user.roles || []).map((r) => (
              <span
                key={r.id}
                className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium"
              >
                {r.name}
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
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">
            Manage user accounts, role assignment, and contact details.
          </p>
        </div>
        <Button onClick={() => router.push("/users/new")}>
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search</CardTitle>
          <CardDescription>Search by username, name, or email</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by username, name, or email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="secondary">
              Search
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
        rows={users}
        getRowKey={(user) => user.id}
        loading={loading}
        emptyMessage="No users found."
        itemLabel="user"
        exportFileName="users"
        page={page}
        pageSize={pageSize}
        total={totalCount}
        onPageChange={setPage}
        actions={(user) => (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => router.push(`/users/${user.id}`)}
            title="View"
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}
      />
    </div>
  );
}
