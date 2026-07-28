"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<StockCheckTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [workers, setWorkers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [title, setTitle] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
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
      toast({ variant: "destructive", title: "Geolocation isn't available in this browser" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSiteLatitude(String(position.coords.latitude));
        setSiteLongitude(String(position.coords.longitude));
      },
      (err) => {
        toast({ variant: "destructive", title: "Couldn't get your location", description: err.message });
      }
    );
  }

  async function handleSaveSite() {
    const latitude = Number(siteLatitude);
    const longitude = Number(siteLongitude);
    const radiusMeters = Number(siteRadius);
    if (!siteLatitude || !siteLongitude || Number.isNaN(latitude) || Number.isNaN(longitude)) {
      toast({ variant: "destructive", title: "Latitude and longitude are required" });
      return;
    }
    setSavingSite(true);
    try {
      await updateWorkSiteConfig({ latitude, longitude, radiusMeters });
      toast({ description: "Work site updated." });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to update work site",
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
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load tasks"))
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
    setShowCreateDialog(true);
    // Fetching a large page as a stand-in for "all" - fine at this app's
    // scale (a demo inventory/user list), not meant to scale to thousands.
    fetchUsers(1, 100, "")
      .then((data) => setWorkers(data.users.filter((u) => u.roles?.some((r) => r.name === "WORKER"))))
      .catch(() => setWorkers([]));
    fetchProducts(1, 100, "")
      .then((data) => setProducts(data.products))
      .catch(() => setProducts([]));
  }

  function toggleProduct(id: string) {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  async function handleCreate() {
    setFormError("");
    if (!assignedTo) {
      setFormError("Choose a worker to assign.");
      return;
    }
    if (selectedProductIds.length === 0) {
      setFormError("Select at least one product for the checklist.");
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
      setFormError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setSaving(false);
    }
  }

  const columns: DataTableColumn<StockCheckTask>[] = [
    {
      key: "title",
      header: "Title",
      className: "px-4 py-3 font-medium",
      render: (t) => t.title || "(untitled)",
    },
    {
      key: "status",
      header: "Status",
      render: (t) => (
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            statusStyle[t.status] ?? statusStyle.PENDING
          )}
        >
          {t.status}
        </span>
      ),
    },
    {
      key: "offSite",
      header: "Location",
      render: (t) =>
        t.offSite === true ? (
          <span className="inline-flex items-center rounded-full bg-destructive/10 text-destructive px-2.5 py-0.5 text-xs font-medium">
            Off-site
          </span>
        ) : t.offSite === false ? (
          <span className="text-muted-foreground text-xs">On-site</span>
        ) : (
          <span className="text-muted-foreground text-xs">-</span>
        ),
    },
    {
      key: "createdDate",
      header: "Created",
      className: "px-4 py-3 text-muted-foreground",
      render: (t) => (t.createdDate ? new Date(t.createdDate).toLocaleString() : "-"),
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Stock Checks</h1>
          <p className="text-sm text-muted-foreground">
            Assign a worker to count a checklist of inventory items, then review and sign off.
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          Create Task
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Work Site</CardTitle>
          <CardDescription>
            The single location submissions are checked against - a task submitted from
            outside this radius gets flagged &ldquo;Off-site&rdquo; below for review, it
            doesn&apos;t get blocked.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-4 items-end">
          <div className="space-y-1.5">
            <Label htmlFor="site-lat">Latitude</Label>
            <Input
              id="site-lat"
              value={siteLatitude}
              onChange={(e) => setSiteLatitude(e.target.value)}
              placeholder="1.3521"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="site-lng">Longitude</Label>
            <Input
              id="site-lng"
              value={siteLongitude}
              onChange={(e) => setSiteLongitude(e.target.value)}
              placeholder="103.8198"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="site-radius">Radius (meters)</Label>
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
              title="Fill in latitude/longitude from this browser's current location"
            >
              <LocateFixed className="h-4 w-4" />
              Use my location
            </Button>
            <Button type="button" onClick={handleSaveSite} disabled={savingSite}>
              {savingSite ? "Saving..." : "Save"}
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
        emptyMessage="No stock-check tasks yet."
        itemLabel="task"
        page={page}
        pageSize={pageSize}
        total={totalCount}
        onPageChange={setPage}
        actions={(t) => (
          <Button variant="ghost" size="sm" onClick={() => router.push(`/stock-checks/${t.id}`)}>
            View
          </Button>
        )}
      />

      <AppDialog
        title="Create stock-check task"
        show={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSave={handleCreate}
        saveLabel={saving ? "Creating..." : "Create"}
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
            <Label htmlFor="task-title">Title (optional)</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Weekly warehouse count"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Assign to</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a worker" />
              </SelectTrigger>
              <SelectContent>
                {workers.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    No WORKER accounts yet.
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
            <Label>Checklist</Label>
            <Card className="max-h-56 overflow-y-auto">
              <CardContent className="p-2 space-y-1">
                {products.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-2">No products in inventory yet.</p>
                ) : (
                  products.map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted/50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedProductIds.includes(p.id)}
                        onChange={() => toggleProduct(p.id)}
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
