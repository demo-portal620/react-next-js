"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ToggleLeft } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useModules } from "@/context/ModulesContext";
import { getModuleForPath, getRequiredPermissionForPath } from "@/lib/routePermissions";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { loaded, isEnabled } = useModules();
  const requiredPermission = getRequiredPermissionForPath(pathname);
  const moduleKey = getModuleForPath(pathname);
  const moduleOff = loaded && !!moduleKey && !isEnabled(moduleKey);

  return (
    <ProtectedRoute requiredPermission={requiredPermission}>
      <AdminLayout>
        {moduleOff ? (
          <div className="p-6 max-w-xl mx-auto mt-10 text-center space-y-3">
            <ToggleLeft className="h-10 w-10 mx-auto text-muted-foreground" />
            <h1 className="text-xl font-semibold">{t("MODULE_OFF_TITLE")}</h1>
            <p className="text-sm text-muted-foreground">{t("MODULE_OFF_BODY")}</p>
            <Link href="/" className="text-sm text-blue-600 hover:underline">
              {t("MODULE_OFF_BACK")}
            </Link>
          </div>
        ) : (
          children
        )}
      </AdminLayout>
    </ProtectedRoute>
  );
}
