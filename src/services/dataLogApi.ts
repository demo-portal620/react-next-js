import { apiGet } from "@/services/apiClient";

const DATA_LOG_BASE = "/api/data-log";

// One row per create/update/delete on the record, reconstructed to a full
// snapshot as of that point in time - every tracked field's value plus
// C_<field> markers for cells that changed in that specific operation.
export interface DataLogRow {
  operationType: number; // 1=INSERT, 2=UPDATE, 3=DELETE
  operationBy?: string;
  operationTime?: string;
  [key: string]: unknown;
}

export interface DataLogListResult {
  columns: string[];
  columnTitleKeys: string[];
  datas: DataLogRow[];
}

export async function fetchDataLog(
  tableName: string,
  pkValue: string
): Promise<DataLogListResult> {
  return apiGet<DataLogListResult>(DATA_LOG_BASE, { tableName, pkValue });
}
