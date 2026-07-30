"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { fetchNotifications, markNotificationRead, Notification } from "@/services/notificationApi";
import { useNotifications } from "@/context/NotificationContext";
import DataTable, { DataTableColumn } from "@/components/DataTable/DataTable";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { markAllRead, refetch } = useNotifications();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const load = useCallback(() => {
    setLoading(true);
    fetchNotifications(page, pageSize)
      .then((data) => {
        setNotifications(data.notifications);
        setTotal(data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, pageSize]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSelect(n: Notification) {
    if (!n.read) {
      await markNotificationRead(n.id);
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      refetch();
    }
    if (n.linkUrl) {
      router.push(n.linkUrl);
    }
  }

  async function handleMarkAllRead() {
    await markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  const columns: DataTableColumn<Notification>[] = [
    {
      key: "title",
      header: "Notification",
      className: "px-4 py-3",
      render: (n) => (
        <button
          type="button"
          className={cn("text-left w-full", !n.read && "font-semibold")}
          onClick={() => handleSelect(n)}
        >
          <div>{n.title}</div>
          {n.body && <div className="text-xs text-muted-foreground font-normal">{n.body}</div>}
        </button>
      ),
    },
    {
      key: "createdDate",
      header: "When",
      className: "px-4 py-3 text-muted-foreground",
      render: (n) => (n.createdDate ? new Date(n.createdDate).toLocaleString() : "-"),
    },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{t("NOTIFICATIONS_TITLE")}</h1>
        <Button variant="outline" onClick={handleMarkAllRead}>
          {t("NOTIFICATIONS_MARK_ALL_READ")}
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={notifications}
        getRowKey={(n) => n.id}
        loading={loading}
        emptyMessage={t("NOTIFICATIONS_EMPTY")}
        itemLabel="notification"
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
      />
    </div>
  );
}
