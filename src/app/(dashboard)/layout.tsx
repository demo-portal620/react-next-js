"use client";

import { usePathname } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { getRequiredPermissionForPath } from "@/lib/routePermissions";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const requiredPermission = getRequiredPermissionForPath(pathname);

  return (
    <ProtectedRoute requiredPermission={requiredPermission}>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}
