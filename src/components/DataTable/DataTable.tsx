"use client";

import { ReactNode } from "react";
import {
  Card,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { downloadCsv, CsvCell } from "@/lib/csv";

// Generic paginated table - replaces the near-identical table/pagination markup each feature page used to copy-paste. Search/filter UI is deliberately not part of this component; it only owns the table body and pagination footer.
export interface DataTableColumn<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  /** CSV export value - needed when render() produces JSX with no plain-string representation. Defaults to row[key]. */
  csvValue?: (row: T) => CsvCell;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  loading?: boolean;
  emptyMessage?: string;
  /** Renders a trailing actions column (e.g. a row's edit/delete dropdown) - omit for none. */
  actions?: (row: T) => ReactNode;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  /** Singular label used in the "N role(s) total" footer line, e.g. "role". Defaults to "item". */
  itemLabel?: string;
  /** Shows an "Export CSV" button (downloaded as this filename) when provided. */
  exportFileName?: string;
}

export default function DataTable<T>({
  columns,
  rows,
  getRowKey,
  loading = false,
  emptyMessage = "No results found.",
  actions,
  page,
  pageSize,
  total,
  onPageChange,
  itemLabel = "item",
  exportFileName,
}: DataTableProps<T>) {
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const colSpan = columns.length + (actions ? 1 : 0);

  // Exports only the rows currently loaded, not every page matching the filter - the button label below is explicit about that scope.
  function handleExport() {
    if (!exportFileName) return;
    const headers = columns.map((col) => col.header);
    const csvRows = rows.map((row) =>
      columns.map((col) =>
        col.csvValue ? col.csvValue(row) : ((row as Record<string, unknown>)[col.key] as CsvCell)
      )
    );
    downloadCsv(exportFileName, headers, csvRows);
  }

  return (
    <div className="space-y-4">
      {exportFileName && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={rows.length === 0}
            title="Exports the rows currently shown on this page, not every page"
          >
            <Download className="h-4 w-4" />
            Export this page (CSV)
          </Button>
        </div>
      )}
      <Card className="py-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-muted-foreground">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={col.headerClassName ?? "px-4 py-3 font-medium"}
                  >
                    {col.header}
                  </th>
                ))}
                {actions && <th className="px-4 py-3 font-medium w-12" />}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={colSpan} className="px-4 py-8 text-center text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={colSpan} className="px-4 py-8 text-center text-muted-foreground">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={getRowKey(row)} className="border-b last:border-0 hover:bg-muted/30">
                    {columns.map((col) => (
                      <td key={col.key} className={col.className ?? "px-4 py-3"}>
                        {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? "")}
                      </td>
                    ))}
                    {actions && (
                      <td className="px-4 py-3 text-right">{actions(row)}</td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {total} {itemLabel}
          {total === 1 ? "" : "s"} total
        </p>
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(page - 1, 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page < totalPages ? page + 1 : page)}
            disabled={page >= totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
