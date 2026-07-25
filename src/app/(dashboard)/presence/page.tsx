"use client";

import { usePresence, PresenceUser } from "@/hooks/usePresence";
import { useAuth } from "@/context/AuthContext";
import DataTable, { DataTableColumn } from "@/components/DataTable/DataTable";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Circle } from "lucide-react";

const columns: DataTableColumn<PresenceUser>[] = [
  {
    key: "username",
    header: "User",
    className: "px-4 py-3 font-medium",
    render: (u) => (
      <span className="inline-flex items-center gap-2">
        <Circle className="h-2 w-2 fill-green-500 text-green-500" />
        {u.username || "-"}
      </span>
    ),
  },
  {
    key: "platform",
    header: "Platform",
    className: "px-4 py-3 text-muted-foreground capitalize",
    render: (u) => u.platform || "-",
  },
  {
    key: "activity",
    header: "Doing",
    className: "px-4 py-3 text-muted-foreground",
    render: (u) => u.activity || "-",
  },
  {
    key: "connectedAt",
    header: "Connected Since",
    className: "px-4 py-3 text-muted-foreground",
    render: (u) => (u.connectedAt ? new Date(u.connectedAt).toLocaleTimeString() : "-"),
  },
];

export default function PresencePage() {
  const { hasPermission } = useAuth();
  const canView = hasPermission("VIEW_PRESENCE");
  const { users, connected } = usePresence("Roles/Presence dashboard");

  if (!canView) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>You don&apos;t have permission to view this page.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Who&apos;s Online</h1>
        <p className="text-sm text-muted-foreground">
          Live - updates automatically as people open/close the admin portal or the Android app.{" "}
          {!connected && <span className="text-destructive">(reconnecting...)</span>}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{users.length} online</CardTitle>
          <CardDescription>Includes this browser session.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            rows={users}
            getRowKey={(u) => `${u.username ?? "?"}-${u.connectedAt ?? ""}`}
            emptyMessage="No one is online right now."
            itemLabel="user"
            page={1}
            pageSize={Math.max(users.length, 1)}
            total={users.length}
            onPageChange={() => {}}
          />
        </CardContent>
      </Card>
    </div>
  );
}
