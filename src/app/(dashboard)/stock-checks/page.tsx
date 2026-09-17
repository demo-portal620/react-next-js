"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  StockCheckTask,
  fetchStockCheckTasks,
  createStockCheckTask,
  fetchWorkSiteConfig,
  updateWorkSiteConfig,
} from "@/services/stockCheckApi";
import { fetchUsers, User } from "@/services/userApi";
import { Product, fetchProducts } from "@/services/stockApi";
import DataTable, { DataTableColumn } from "@/components/DataTable/DataTable";
import AppDialog from "@/components/custom-ui/app-dialog";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, LocateFixed, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const statusStyle: Record<string, string> = {
  PENDING: "bg-muted text-muted-foreground",
  SUBMITTED: "bg-amber-100 text-amber-700",
  APPROVED: "bg-primary/10 text-primary",
};

export default function StockChecksPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { toast } = useToast();

  const statusLabels: Record<string, string> = {
    PENDING: t("STOCK_STATUS_PENDING"),
    SUBMITTED: t("STOCK_STATUS_SUBMITTED"),
    APPROVED: t("STOCK_STATUS_APPROVED"),
  };
  const [tasks, setTasks] = useState<StockCheckTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [workers, setWorkers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [workerSearch, setWorkerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [title, setTitle] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [siteLatitude, setSiteLatitude] = useState("");
  const [siteLongitude, setSiteLongitude] = useState("");
  const [siteRadius, setSiteRadius] = useState("200");
  const [savingSite, setSavingSite] = useState(false);

  const loadSite = useCallback(() => {
    fetchWorkSiteConfig()
      .then((site) => {
        setSiteLatitude(site.latitude != null ? String(site.latitude) : "");
        setSiteLongitude(site.longitude != null ? String(site.longitude) : "");
        setSiteRadius(String(site.radiusMeters));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadSite();
  }, [loadSite]);

  function useCurrentLocationForSite() {
    if (!navigator.geolocation) {
      toast({ variant: "destructive", title: t("STOCK_CHECKS_GEO_UNAVAILABLE") });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSiteLatitude(String(position.coords.latitude));
        setSiteLongitude(String(position.coords.longitude));
      },
      (err) => {
        toast({ variant: "destructive", title: t("STOCK_CHECKS_GEO_ERROR"), description: err.message });
      }
    );
  }

  async function handleSaveSite() {
    const latitude = Number(siteLatitude);
    const longitude = Number(siteLongitude);
    const radiusMeters = Number(siteRadius);
    if (!siteLatitude || !siteLongitude || Number.isNaN(latitude) || Number.isNaN(longitude)) {
      toast({ variant: "destructive", title: t("STOCK_CHECKS_LATLNG_REQUIRED") });
      return;
    }
    setSavingSite(true);
    try {
      await updateWorkSiteConfig({ latitude, longitude, radiusMeters });
      toast({ description: t("STOCK_CHECKS_SITE_UPDATED") });
    } catch (err) {
      toast({
        variant: "destructive",
        title: t("STOCK_CHECKS_SITE_UPDATE_ERROR"),
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSavingSite(false);
    }
  }

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    fetchStockCheckTasks(page, pageSize, "")
      .then((data) => {
        setTasks(data.tasks);
        setTotalCount(data.total);
      })
      .catch((err) => setError(err instanceof Error ? err.message : t("STOCK_CHECKS_LOAD_ERROR")))
      .finally(() => setLoading(false));
  }, [page, pageSize]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreateDialog() {
    setFormError("");
    setTitle("");
    setAssignedTo("");
    setSelectedProductIds([]);
    setSelectedProducts([]);
    setWorkerSearch("");
    setProductSearch("");
    setShowCreateDialog(true);
  }

  // Debounced, search-driven fetch instead of a flat top-100 pull - these
  // run whenever the dialog is open and the search text changes (including
  // on open, when both are empty, to seed the initial page).
  useEffect(() => {
    if (!showCreateDialog) return;
    const handle = setTimeout(() => {
      fetchUsers(1, 20, workerSearch)
        .then((data) => setWorkers(data.users.filter((u) => u.roles?.some((r) => r.name === "WORKER"))))
        .catch(() => setWorkers([]));
    }, 300);
    return () => clearTimeout(handle);
  }, [showCreateDialog, workerSearch]);

  useEffect(() => {
    if (!showCreateDialog) return;
    const handle = setTimeout(() => {
      fetchProducts(1, 20, productSearch)
        .then((data) => setProducts(data.products))
        .catch(() => setProducts([]));
    }, 300);
    return () => clearTimeout(handle);
  }, [showCreateDialog, productSearch]);

  function toggleProduct(product: Product) {
    setSelectedProductIds((prev) =>
      prev.includes(product.id) ? prev.filter((p) => p !== product.id) : [...prev, product.id]
    );
    setSelectedProducts((prev) =>
      prev.some((p) => p.id === product.id)
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product]
    );
  }

  // Union of the current search results and whatever's already checked, so
  // picking a product then typing a new search doesn't visually "lose" it.
  const checklistCandidates = [
    ...selectedProducts,
    ...products.filter((p) => !selectedProductIds.includes(p.id)),
  ];

  async function handleCreate() {
    setFormError("");
    if (!assignedTo) {
      setFormError(t("STOCK_CHECKS_ASSIGN_REQUIRED"));
      return;
    }
    if (selectedProductIds.length === 0) {
      setFormError(t("STOCK_CHECKS_PRODUCTS_REQUIRED"));
      return;
    }
    setSaving(true);
    try {
      await createStockCheckTask({
        title: title.trim() || undefined,
        assignedTo,
        productIds: selectedProductIds,
      });
      setShowCreateDialog(false);
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("STOCK_CHECKS_CREATE_ERROR"));
    } finally {
      setSaving(false);
    }
  }

  const columns: DataTableColumn<StockCheckTask>[] = [
    {
      key: "title",
      header: t("STOCK_CHECKS_COL_TITLE"),
      className: "px-4 py-3 font-medium",
      render: (task) => task.title || t("STOCK_CHECKS_UNTITLED"),
    },
    {
      key: "status",
      header: t("STOCK_CHECKS_COL_STATUS"),
      render: (task) => (
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            statusStyle[task.status] ?? statusStyle.PENDING
          )}
        >
          {statusLabels[task.status] ?? task.status}
        </span>
      ),
    },
    {
      key: "offSite",
      header: t("STOCK_CHECKS_COL_LOCATION"),
      render: (task) =>
        task.offSite === true ? (
          <span className="inline-flex items-center rounded-full bg-destructive/10 text-destructive px-2.5 py-0.5 text-xs font-medium">
            {t("STOCK_CHECKS_OFFSITE")}
          </span>
        ) : task.offSite === false ? (
          <span className="text-muted-foreground text-xs">{t("STOCK_CHECKS_ONSITE")}</span>
        ) : (
          <span className="text-muted-foreground text-xs">-</span>
        ),
    },
    {
      key: "createdDate",
      header: t("STOCK_CHECKS_COL_CREATED"),
      className: "px-4 py-3 text-muted-foreground",
      render: (task) => (task.createdDate ? new Date(task.createdDate).toLocaleString() : "-"),
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("STOCK_CHECKS_TITLE")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("STOCK_CHECKS_SUBTITLE")}
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          {t("STOCK_CHECKS_CREATE")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("STOCK_CHECKS_SITE_TITLE")}</CardTitle>
          <CardDescription>
            {t("STOCK_CHECKS_SITE_DESC")}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-4 items-end">
          <div className="space-y-1.5">
            <Label htmlFor="site-lat">{t("STOCK_CHECKS_LATITUDE")}</Label>
            <Input
              id="site-lat"
              value={siteLatitude}
              onChange={(e) => setSiteLatitude(e.target.value)}
              placeholder="1.3521"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="site-lng">{t("STOCK_CHECKS_LONGITUDE")}</Label>
            <Input
              id="site-lng"
              value={siteLongitude}
              onChange={(e) => setSiteLongitude(e.target.value)}
              placeholder="103.8198"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="site-radius">{t("STOCK_CHECKS_RADIUS")}</Label>
            <Input
              id="site-radius"
              type="number"
              value={siteRadius}
              onChange={(e) => setSiteRadius(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={useCurrentLocationForSite}
              title={t("STOCK_CHECKS_USE_MY_LOCATION_TITLE")}
            >
              <LocateFixed className="h-4 w-4" />
              {t("STOCK_CHECKS_USE_MY_LOCATION")}
            </Button>
            <Button type="button" onClick={handleSaveSite} disabled={savingSite}>
              {savingSite ? t("STOCK_CHECKS_SAVING") : t("COMMON_SAVE")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <DataTable
        columns={columns}
        rows={tasks}
        getRowKey={(t) => t.id}
        loading={loading}
        emptyMessage={t("STOCK_CHECKS_EMPTY")}
        itemLabel="task"
        page={page}
        pageSize={pageSize}
        total={totalCount}
        onPageChange={setPage}
        actions={(task) => (
          <Button variant="ghost" size="sm" onClick={() => router.push(`/stock-checks/${task.id}`)}>
            {t("COMMON_VIEW")}
          </Button>
        )}
      />

      <AppDialog
        title={t("STOCK_CHECKS_DIALOG_TITLE")}
        show={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSave={handleCreate}
        saveLabel={saving ? t("STOCK_CHECKS_CREATING") : t("STOCK_CHECKS_CREATE_SUBMIT")}
        width="480px"
      >
        <div className="space-y-3">
          {formError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="task-title">{t("STOCK_CHECKS_TASK_TITLE_LABEL")}</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("STOCK_CHECKS_TASK_TITLE_PLACEHOLDER")}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("STOCK_CHECKS_ASSIGN_TO")}</Label>
            <Input
              value={workerSearch}
              onChange={(e) => setWorkerSearch(e.target.value)}
              placeholder={t("STOCK_CHECKS_WORKER_SEARCH_PLACEHOLDER")}
            />
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger>
                <SelectValue placeholder={t("STOCK_CHECKS_WORKER_PLACEHOLDER")} />
              </SelectTrigger>
              <SelectContent>
                {workers.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    {workerSearch ? t("STOCK_CHECKS_NO_MATCHING_WORKERS") : t("STOCK_CHECKS_NO_WORKERS")}
                  </div>
                ) : (
                  workers.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.username}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("STOCK_CHECKS_CHECKLIST")}{selectedProductIds.length > 0 ? ` (${t("STOCK_CHECKS_CHECKLIST_SELECTED", { count: selectedProductIds.length })})` : ""}</Label>
            <Input
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder={t("STOCK_CHECKS_PRODUCT_SEARCH_PLACEHOLDER")}
            />
            <Card className="max-h-56 overflow-y-auto">
              <CardContent className="p-2 space-y-1">
                {checklistCandidates.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-2">
                    {productSearch ? t("STOCK_CHECKS_NO_MATCHING_PRODUCTS") : t("STOCK_CHECKS_NO_PRODUCTS")}
                  </p>
                ) : (
                  checklistCandidates.map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted/50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedProductIds.includes(p.id)}
                        onChange={() => toggleProduct(p)}
                      />
                      <span className="flex-1">{p.name}</span>
                      <span className="text-muted-foreground">{p.sku}</span>
                    </label>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </AppDialog>
    </div>
  );
}
