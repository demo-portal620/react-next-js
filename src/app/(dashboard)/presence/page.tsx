"use client";

import { useTranslation } from "react-i18next";
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

export default function PresencePage() {
  const { t } = useTranslation();
  const { hasPermission } = useAuth();
  const canView = hasPermission("VIEW_PRESENCE");
  const { users, connected } = usePresence("Roles/Presence dashboard");

  const columns: DataTableColumn<PresenceUser>[] = [
    {
      key: "username",
      header: t("PRESENCE_COL_USER"),
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
      header: t("PRESENCE_COL_PLATFORM"),
      className: "px-4 py-3 text-muted-foreground capitalize",
      render: (u) => u.platform || "-",
    },
    {
      key: "activity",
      header: t("PRESENCE_COL_ACTIVITY"),
      className: "px-4 py-3 text-muted-foreground",
      render: (u) => u.activity || "-",
    },
    {
      key: "connectedAt",
      header: t("PRESENCE_COL_CONNECTED_SINCE"),
      className: "px-4 py-3 text-muted-foreground",
      render: (u) => (u.connectedAt ? new Date(u.connectedAt).toLocaleTimeString() : "-"),
    },
  ];

  if (!canView) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{t("FORBIDDEN_MESSAGE")}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("SIDEBAR_WHOS_ONLINE")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("PRESENCE_SUBTITLE")}{" "}
          {!connected && <span className="text-destructive">{t("PRESENCE_RECONNECTING")}</span>}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("PRESENCE_ONLINE_COUNT", { count: users.length })}</CardTitle>
          <CardDescription>{t("PRESENCE_ONLINE_DESC")}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            rows={users}
            getRowKey={(u) => `${u.username ?? "?"}-${u.connectedAt ?? ""}`}
            emptyMessage={t("PRESENCE_EMPTY")}
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
