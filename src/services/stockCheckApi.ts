import { apiGet, apiPost, apiPut } from "@/services/apiClient";

const STOCK_CHECKS_BASE = "/api/stock-checks";
const WORK_SITE_BASE = "/api/work-site";

// Mirrors ap-be's com.admin.entity.stockcheck.StockCheckTask field-for-field.
export interface StockCheckTask {
  id: string;
  title?: string;
  assignedTo: string;
  status: "PENDING" | "SUBMITTED" | "APPROVED";
  submittedDate?: string;
  approvedBy?: string;
  approvedDate?: string;
  submittedLatitude?: number;
  submittedLongitude?: number;
  // null (not just false) means "not enough information to judge" - no
  // location captured on the worker's device, or no work site configured
  // yet. Only ever true/false once both exist.
  offSite?: boolean | null;
  createdBy?: string;
  createdDate?: string;
}

// Mirrors ap-be's com.admin.entity.stockcheck.WorkSiteConfig field-for-field.
export interface WorkSiteConfig {
  id: string;
  latitude: number | null;
  longitude: number | null;
  radiusMeters: number;
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

export async function fetchWorkSiteConfig(): Promise<WorkSiteConfig> {
  return apiGet<WorkSiteConfig>(WORK_SITE_BASE);
}

export async function updateWorkSiteConfig(payload: {
  latitude: number;
  longitude: number;
  radiusMeters: number;
}): Promise<WorkSiteConfig> {
  return apiPut<WorkSiteConfig>(WORK_SITE_BASE, payload);
}
