"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { fetchProperties, Property } from "@/services/propertiesApi";
import DataTable, { DataTableColumn } from "@/components/DataTable/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Eye, Plus, Search } from "lucide-react";

export default function PropertyListPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    fetchProperties(page, pageSize, search)
      .then((data) => {
        setProperties(data.properties);
        setTotalCount(data.total);
      })
      .catch((err) => setError(err instanceof Error ? err.message : t("PROPERTY_LOAD_ERROR")))
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

  const columns: DataTableColumn<Property>[] = [
    { key: "name", header: t("PROPERTY_COL_NAME"), className: "px-4 py-3 font-medium" },
    { key: "address", header: t("PROPERTY_COL_ADDRESS"), className: "px-4 py-3 text-muted-foreground" },
    {
      key: "type",
      header: t("PROPERTY_COL_TYPE"),
      render: (p) => (
        <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">
          {p.type}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("PROPERTY_TITLE")}</h1>
          <p className="text-sm text-muted-foreground">{t("PROPERTY_SUBTITLE")}</p>
        </div>
        <Button onClick={() => router.push("/properties/new")}>
          <Plus className="h-4 w-4" />
          {t("PROPERTY_ADD")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("COMMON_SEARCH")}</CardTitle>
          <CardDescription>{t("PROPERTY_SEARCH_DESC")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("PROPERTY_SEARCH_PLACEHOLDER")}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>
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
        rows={properties}
        getRowKey={(p) => p.id}
        loading={loading}
        emptyMessage={t("PROPERTY_EMPTY")}
        itemLabel="property"
        exportFileName="properties"
        page={page}
        pageSize={pageSize}
        total={totalCount}
        onPageChange={setPage}
        actions={(p) => (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => router.push(`/properties/${p.id}`)}
            title={t("COMMON_VIEW")}
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}
      />
    </div>
  );
}
