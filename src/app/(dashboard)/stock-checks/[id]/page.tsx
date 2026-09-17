"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  StockCheckTaskDetail,
  fetchStockCheckTaskDetail,
  signOffStockCheckTask,
} from "@/services/stockCheckApi";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const statusStyle: Record<string, string> = {
  PENDING: "bg-muted text-muted-foreground",
  SUBMITTED: "bg-amber-100 text-amber-700",
  APPROVED: "bg-primary/10 text-primary",
};

export default function StockCheckDetailPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { hasPermission } = useAuth();
  const { toast } = useToast();

  const statusLabels: Record<string, string> = {
    PENDING: t("STOCK_STATUS_PENDING"),
    SUBMITTED: t("STOCK_STATUS_SUBMITTED"),
    APPROVED: t("STOCK_STATUS_APPROVED"),
  };
  const [detail, setDetail] = useState<StockCheckTaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signingOff, setSigningOff] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    fetchStockCheckTaskDetail(params.id)
      .then(setDetail)
      .catch((err) => setError(err instanceof Error ? err.message : t("STOCK_CHECK_DETAIL_LOAD_ERROR")))
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSignOff() {
    if (!confirm(t("STOCK_CHECK_DETAIL_CONFIRM_SIGNOFF"))) {
      return;
    }
    setSigningOff(true);
    try {
      await signOffStockCheckTask(params.id);
      toast({ description: t("STOCK_CHECK_DETAIL_SIGNOFF_SUCCESS") });
      load();
    } catch (err) {
      toast({
        variant: "destructive",
        title: t("STOCK_CHECK_DETAIL_SIGNOFF_ERROR_TITLE"),
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSigningOff(false);
    }
  }

  if (loading) {
    return <div className="p-6 max-w-4xl mx-auto text-muted-foreground">{t("COMMON_LOADING")}</div>;
  }

  if (error || !detail) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || t("STOCK_CHECK_DETAIL_NOT_FOUND")}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const { task, items } = detail;
  const canSignOff = task.status === "SUBMITTED" && hasPermission("MANAGE_STOCK");

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <Button variant="ghost" size="sm" onClick={() => router.push("/stock-checks")}>
        <ArrowLeft className="h-4 w-4" />
        {t("STOCK_CHECK_DETAIL_BACK")}
      </Button>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {task.title || t("STOCK_CHECK_DETAIL_UNTITLED")}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                statusStyle[task.status] ?? statusStyle.PENDING
              )}
            >
              {statusLabels[task.status] ?? task.status}
            </span>
            {task.offSite === true && (
              <span className="inline-flex items-center rounded-full bg-destructive/10 text-destructive px-2.5 py-0.5 text-xs font-medium">
                {t("STOCK_CHECK_DETAIL_OFFSITE_BADGE")}
              </span>
            )}
          </div>
        </div>
        {canSignOff && (
          <Button onClick={handleSignOff} disabled={signingOff}>
            <CheckCircle2 className="h-4 w-4" />
            {signingOff ? t("STOCK_CHECK_DETAIL_SIGNING_OFF") : t("STOCK_CHECK_DETAIL_SIGN_OFF")}
          </Button>
        )}
      </div>

      <Card className="py-0 overflow-hidden">
        <CardHeader className="pt-4">
          <CardTitle className="text-base">{t("STOCK_CHECK_DETAIL_CHECKLIST_TITLE")}</CardTitle>
          <CardDescription>
            {task.status === "PENDING"
              ? t("STOCK_CHECK_DETAIL_WAITING")
              : t("STOCK_CHECK_DETAIL_MISMATCH_HINT")}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">{t("STOCK_CHECK_DETAIL_COL_PRODUCT")}</th>
                  <th className="px-4 py-3 font-medium">{t("STOCK_CHECK_DETAIL_COL_SKU")}</th>
                  <th className="px-4 py-3 font-medium">{t("STOCK_CHECK_DETAIL_COL_EXPECTED")}</th>
                  <th className="px-4 py-3 font-medium">{t("STOCK_CHECK_DETAIL_COL_COUNTED")}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const mismatch =
                    item.countedQuantity !== null && item.countedQuantity !== item.expectedQuantity;
                  return (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">{item.productName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{item.productSku}</td>
                      <td className="px-4 py-3">{item.expectedQuantity}</td>
                      <td className={cn("px-4 py-3 font-medium", mismatch && "text-destructive")}>
                        {item.countedQuantity ?? "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
