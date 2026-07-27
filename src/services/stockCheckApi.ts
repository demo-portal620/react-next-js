import { apiGet, apiPost } from "@/services/apiClient";

const STOCK_CHECKS_BASE = "/api/stock-checks";

// Mirrors ap-be's com.admin.entity.stockcheck.StockCheckTask field-for-field.
export interface StockCheckTask {
  id: string;
  title?: string;
  assignedTo: string;
  status: "PENDING" | "SUBMITTED" | "APPROVED";
  submittedDate?: string;
  approvedBy?: string;
  approvedDate?: string;
  createdBy?: string;
  createdDate?: string;
}

// Mirrors ap-be's com.admin.entity.stockcheck.StockCheckTaskItemView.
export interface StockCheckTaskItemView {
  id: string;
  taskId: string;
  productId: string;
  productName: string;
  productSku: string;
  expectedQuantity: number;
  countedQuantity: number | null;
}

export interface StockCheckTasksResponse {
  tasks: StockCheckTask[];
  total: number;
  page: number;
  pageSize: number;
}

export interface StockCheckTaskDetail {
  task: StockCheckTask;
  items: StockCheckTaskItemView[];
}

export async function fetchStockCheckTasks(
  page: number,
  pageSize: number,
  search: string
): Promise<StockCheckTasksResponse> {
  return apiGet<StockCheckTasksResponse>(STOCK_CHECKS_BASE, { page, pageSize, search });
}

export async function fetchMyStockCheckTasks(): Promise<StockCheckTask[]> {
  return apiGet<StockCheckTask[]>(`${STOCK_CHECKS_BASE}/mine`);
}

export async function fetchStockCheckTaskDetail(id: string): Promise<StockCheckTaskDetail> {
  return apiGet<StockCheckTaskDetail>(`${STOCK_CHECKS_BASE}/${id}`);
}

export async function createStockCheckTask(payload: {
  title?: string;
  assignedTo: string;
  productIds: string[];
}): Promise<StockCheckTask> {
  return apiPost<StockCheckTask>(STOCK_CHECKS_BASE, payload);
}

export async function signOffStockCheckTask(id: string): Promise<StockCheckTask> {
  return apiPost<StockCheckTask>(`${STOCK_CHECKS_BASE}/${id}/sign-off`);
}
