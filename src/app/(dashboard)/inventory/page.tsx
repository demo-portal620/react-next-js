"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Product,
  fetchProducts,
  createProduct,
  importProducts,
} from "@/services/stockApi";
import DataTable, { DataTableColumn } from "@/components/DataTable/DataTable";
import AppDialog from "@/components/custom-ui/app-dialog";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

const emptyForm = {
  name: "",
  sku: "",
  category: "",
  quantity: "0",
  reorderThreshold: "0",
  unitPrice: "",
};

export default function InventoryPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    fetchProducts(page, pageSize, search)
      .then((data) => {
        setProducts(data.products);
        setTotalCount(data.total);
      })
      .catch((err) => setError(err instanceof Error ? err.message : t("INVENTORY_LOAD_ERROR")))
      .finally(() => setLoading(false));
  }, [page, pageSize, search]);

  useEffect(() => {
    load();
  }, [load]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  }

  async function handleAddProduct() {
    setFormError("");
    if (!form.name.trim() || !form.sku.trim()) {
      setFormError(t("INVENTORY_ADD_REQUIRED"));
      return;
    }
    setSaving(true);
    try {
      await createProduct({
        name: form.name.trim(),
        sku: form.sku.trim(),
        category: form.category.trim() || undefined,
        quantity: Number(form.quantity) || 0,
        reorderThreshold: Number(form.reorderThreshold) || 0,
        unitPrice: form.unitPrice ? Number(form.unitPrice) : undefined,
      });
      setShowAddDialog(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("INVENTORY_ADD_ERROR"));
    } finally {
      setSaving(false);
    }
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file) return;

    setImporting(true);
    try {
      const result = await importProducts(file);
      toast({
        description: `Imported: ${result.created} created, ${result.updated} updated${
          result.failed > 0 ? `, ${result.failed} failed` : ""
        }.`,
        ...(result.failed > 0 ? { variant: "destructive" as const } : {}),
      });
      if (result.errors.length > 0) {
        console.warn("Import row errors:", result.errors);
      }
      load();
    } catch (err) {
      toast({
        variant: "destructive",
        title: t("INVENTORY_IMPORT_FAILED_TITLE"),
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setImporting(false);
    }
  }

  const columns: DataTableColumn<Product>[] = [
    { key: "name", header: t("INVENTORY_COL_NAME"), className: "px-4 py-3 font-medium" },
    { key: "sku", header: t("INVENTORY_COL_SKU"), className: "px-4 py-3 text-muted-foreground" },
    {
      key: "category",
      header: t("INVENTORY_COL_CATEGORY"),
      className: "px-4 py-3 text-muted-foreground",
      render: (p) => p.category || "-",
    },
    {
      key: "quantity",
      header: t("INVENTORY_COL_QUANTITY"),
      render: (p) => (
        <span
          className={cn(
            "font-medium",
            p.quantity <= p.reorderThreshold ? "text-destructive" : ""
          )}
        >
          {p.quantity}
        </span>
      ),
    },
    { key: "reorderThreshold", header: t("INVENTORY_COL_REORDER"), className: "px-4 py-3 text-muted-foreground" },
    {
      key: "unitPrice",
      header: t("INVENTORY_COL_UNIT_PRICE"),
      className: "px-4 py-3 text-muted-foreground",
      render: (p) => (p.unitPrice != null ? `$${p.unitPrice.toFixed(2)}` : "-"),
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("INVENTORY_TITLE")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("INVENTORY_SUBTITLE")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleImportFile}
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
          >
            <Upload className="h-4 w-4" />
            {importing ? t("INVENTORY_IMPORTING") : t("INVENTORY_IMPORT")}
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4" />
            {t("INVENTORY_ADD")}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("COMMON_SEARCH")}</CardTitle>
          <CardDescription>{t("INVENTORY_SEARCH_DESC")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <Input
              placeholder={t("INVENTORY_SEARCH_PLACEHOLDER")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <Button type="submit" variant="secondary">
              {t("COMMON_SEARCH")}
            </Button>
          </form>
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
        rows={products}
        getRowKey={(p) => p.id}
        loading={loading}
        emptyMessage={t("INVENTORY_EMPTY")}
        itemLabel="product"
        exportFileName="inventory"
        page={page}
        pageSize={pageSize}
        total={totalCount}
        onPageChange={setPage}
      />

      <AppDialog
        title={t("INVENTORY_DIALOG_TITLE")}
        show={showAddDialog}
        onClose={() => {
          setShowAddDialog(false);
          setForm(emptyForm);
          setFormError("");
        }}
        onSave={handleAddProduct}
        saveLabel={saving ? t("INVENTORY_SAVING") : t("COMMON_SAVE")}
      >
        <div className="space-y-3">
          {formError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="p-name">{t("INVENTORY_FIELD_NAME")}</Label>
            <Input
              id="p-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-sku">{t("INVENTORY_FIELD_SKU")}</Label>
            <Input
              id="p-sku"
              value={form.sku}
              onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-category">{t("INVENTORY_FIELD_CATEGORY")}</Label>
            <Input
              id="p-category"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="p-quantity">{t("INVENTORY_FIELD_QUANTITY")}</Label>
              <Input
                id="p-quantity"
                type="number"
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-reorder">{t("INVENTORY_FIELD_REORDER")}</Label>
              <Input
                id="p-reorder"
                type="number"
                value={form.reorderThreshold}
                onChange={(e) => setForm((f) => ({ ...f, reorderThreshold: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-price">{t("INVENTORY_FIELD_UNIT_PRICE")}</Label>
            <Input
              id="p-price"
              type="number"
              step="0.01"
              value={form.unitPrice}
              onChange={(e) => setForm((f) => ({ ...f, unitPrice: e.target.value }))}
            />
          </div>
        </div>
      </AppDialog>
    </div>
  );
}
