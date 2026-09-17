"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  // Looked up per-route from menuConfig.ts, so direct URL navigation can't bypass the Sidebar's permission filtering.
  requiredPermission?: string;
}

export function ProtectedRoute({ children, fallback, requiredPermission }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasPermission } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || null;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900">{t("FORBIDDEN_TITLE")}</h1>
          <p className="mt-2 text-gray-600">{t("FORBIDDEN_MESSAGE")}</p>
          <Button className="mt-4" onClick={() => router.push("/")}>
            {t("FORBIDDEN_BACK")}
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
