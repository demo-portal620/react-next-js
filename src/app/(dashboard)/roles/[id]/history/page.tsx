"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { fetchDataLog, DataLogRow } from "@/services/dataLogApi";
import { fetchRoleById, Role } from "@/services/roleApi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function formatColumnHeader(column: string): string {
  return column.charAt(0).toUpperCase() + column.slice(1);
}

export default function RoleHistoryPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const idParam = params?.id as string;

  const operationTypeLabels: Record<number, string> = {
    1: t("ROLE_HISTORY_OP_CREATED"),
    2: t("ROLE_HISTORY_OP_UPDATED"),
    3: t("ROLE_HISTORY_OP_DELETED"),
  };

  const [role, setRole] = useState<Role | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<DataLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.all([fetchRoleById(idParam), fetchDataLog("role", idParam)])
      .then(([roleData, logData]) => {
        setRole(roleData);
        setColumns(logData.columnTitleKeys);
        setRows(logData.datas);
      })
      .catch((err) => setError(err.message || t("ROLE_HISTORY_LOAD_ERROR")))
      .finally(() => setLoading(false));
  }, [idParam]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/roles")}
        className="-ml-2"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("ROLE_HISTORY_BACK")}
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{t("ROLE_HISTORY_TITLE")}{role ? `: ${role.name}` : ""}</CardTitle>
          <CardDescription>
            {t("ROLE_HISTORY_DESC")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm border">
              <thead>
                <tr className="border-b bg-muted/50 text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">{t("ROLE_HISTORY_COL_TIME")}</th>
                  <th className="px-4 py-3 font-medium">{t("ROLE_HISTORY_COL_TYPE")}</th>
                  <th className="px-4 py-3 font-medium">{t("ROLE_HISTORY_COL_BY")}</th>
                  {columns.map((column) => (
                    <th key={column} className="px-4 py-3 font-medium">
                      {formatColumnHeader(column)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3 + columns.length} className="px-4 py-8 text-center text-muted-foreground">
                      {t("COMMON_LOADING")}
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={3 + columns.length} className="px-4 py-8 text-center text-muted-foreground">
                      {t("ROLE_HISTORY_EMPTY")}
                    </td>
                  </tr>
                ) : (
                  rows.map((row, index) => (
                    <tr key={index} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3 text-muted-foreground">
                        {row.operationTime ? new Date(row.operationTime as string).toLocaleString() : "-"}
                      </td>
                      <td className="px-4 py-3">
                        {operationTypeLabels[row.operationType] || row.operationType}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{row.operationBy || "-"}</td>
                      {columns.map((column) => {
                        const hasChange = row[`C_${column}`] != null;
                        return (
                          <td
                            key={column}
                            className={cn("px-4 py-3", hasChange && "bg-yellow-100")}
                          >
                            {formatValue(row[column])}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
