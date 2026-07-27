"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  const [detail, setDetail] = useState<StockCheckTaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signingOff, setSigningOff] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    fetchStockCheckTaskDetail(params.id)
      .then(setDetail)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load task"))
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSignOff() {
    if (!confirm("Sign off on this stock check? Inventory quantities will be updated to match the counted values.")) {
      return;
    }
    setSigningOff(true);
    try {
      await signOffStockCheckTask(params.id);
      toast({ description: "Task signed off - inventory reconciled." });
      load();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Sign-off failed",
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSigningOff(false);
    }
  }

  if (loading) {
    return <div className="p-6 max-w-4xl mx-auto text-muted-foreground">Loading...</div>;
  }

  if (error || !detail) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Task not found."}</AlertDescription>
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
        Back to Stock Checks
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {task.title || "(untitled task)"}
          </h1>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium mt-1",
              statusStyle[task.status] ?? statusStyle.PENDING
            )}
          >
            {task.status}
          </span>
        </div>
        {canSignOff && (
          <Button onClick={handleSignOff} disabled={signingOff}>
            <CheckCircle2 className="h-4 w-4" />
            {signingOff ? "Signing off..." : "Sign Off"}
          </Button>
        )}
      </div>

      <Card className="py-0 overflow-hidden">
        <CardHeader className="pt-4">
          <CardTitle className="text-base">Checklist</CardTitle>
          <CardDescription>
            {task.status === "PENDING"
              ? "Waiting for the assigned worker to scan and submit counts."
              : "Rows in red don't match the expected quantity."}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">SKU</th>
                  <th className="px-4 py-3 font-medium">Expected</th>
                  <th className="px-4 py-3 font-medium">Counted</th>
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
