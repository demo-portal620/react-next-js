"use client";

import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/context/NotificationContext";
import { Notification } from "@/services/notificationApi";
import { cn } from "@/lib/utils";

export default function NotificationBell() {
  const router = useRouter();
  const { t } = useTranslation();
  const { unreadCount, recentNotifications, markRead, markAllRead } = useNotifications();

  function handleSelect(notification: Notification) {
    if (!notification.read) {
      markRead(notification.id);
    }
    if (notification.linkUrl) {
      router.push(notification.linkUrl);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative p-2">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">{t("NOTIFICATIONS_TITLE")}</DropdownMenuLabel>
          {unreadCount > 0 && (
            <button
              type="button"
              className="text-xs text-primary hover:underline"
              onClick={() => markAllRead()}
            >
              {t("NOTIFICATIONS_MARK_ALL_READ")}
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        {recentNotifications.length === 0 ? (
          <p className="px-2 py-4 text-center text-sm text-muted-foreground">
            {t("NOTIFICATIONS_EMPTY")}
          </p>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {recentNotifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className={cn("flex flex-col items-start gap-0.5 whitespace-normal py-2", !n.read && "bg-muted/50")}
                onClick={() => handleSelect(n)}
              >
                <span className="text-sm font-medium">{n.title}</span>
                {n.body && <span className="text-xs text-muted-foreground line-clamp-2">{n.body}</span>}
                {n.createdDate && (
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(n.createdDate).toLocaleString()}
                  </span>
                )}
              </DropdownMenuItem>
            ))}
          </div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/notifications")} className="justify-center text-sm">
          {t("NOTIFICATIONS_VIEW_ALL")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
