// Plain CSV export, deliberately not Excel - opens fine in any spreadsheet app, zero dependencies, no backend endpoint needed.
export type CsvCell = string | number | boolean | null | undefined;

function escapeCsvCell(value: CsvCell): string {
  const str = value === null || value === undefined ? "" : String(value);
  // Quote whenever the value could otherwise be misread as a delimiter,
  // a line break, or run into a following cell.
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsv(headers: string[], rows: CsvCell[][]): string {
  const lines = [headers, ...rows].map((line) => line.map(escapeCsvCell).join(","));
  // \r\n per RFC 4180 - some spreadsheet apps mis-render bare \n.
  return lines.join("\r\n");
}

// UTF-8 BOM makes Excel on Windows detect UTF-8 instead of mangling non-ASCII text; browsers ignore it silently.
export function downloadCsv(filename: string, headers: string[], rows: CsvCell[][]): void {
  const csv = "﻿" + toCsv(headers, rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
