// Plain CSV export - deliberately not Excel. See heycloud/be's tt-actif2-back
// base-excel module for what a "proper" Excel export looked like a few years
// back (raw Apache POI, ~2,300 lines of manual cell-by-cell writes, branching
// on HSSFSheet vs XSSFSheet to support the old binary .xls format): that
// complexity doesn't buy anything here - CSV opens in Excel/Sheets/Numbers
// just fine, needs zero dependencies, and needs no backend endpoint at all
// since the data's already sitting in the browser as JSON once a table has
// loaded. Reach for a real Excel library (e.g. exceljs on the frontend, or
// EasyExcel/FastExcel on the backend, not raw POI) only if a page later
// needs actual spreadsheet features - multiple sheets, cell formatting,
// formulas - that CSV genuinely can't represent.

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

// "﻿" (UTF-8 BOM) makes Excel on Windows detect UTF-8 instead of
// guessing the system codepage and mangling non-ASCII text (e.g. the
// Chinese labels the app now has) - browsers ignore it silently either way.
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
