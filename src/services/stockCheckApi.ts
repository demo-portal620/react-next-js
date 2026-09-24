import { apiGet, apiPost, apiPut, apiGetBlob } from "@/services/apiClient";

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
  // null means "not enough information to judge" - only ever true/false once location and a work site both exist.
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

// Mirrors ap-be's com.admin.entity.stockcheck.StockCheckTaskPhoto field-for-field.
export interface StockCheckTaskPhoto {
  id: string;
  taskId: string;
  storageKey: string;
  contentType: string;
  uploadedBy?: string;
  createdDate?: string;
}

// Metadata only - use fetchStockCheckTaskPhotoBlobUrl for the actual image bytes.
export async function fetchStockCheckTaskPhotos(taskId: string): Promise<StockCheckTaskPhoto[]> {
  return apiGet<StockCheckTaskPhoto[]>(`${STOCK_CHECKS_BASE}/${taskId}/photos`);
}

// Auth-gated, so this can't just be an <img src> URL - fetches the bytes as
// a Blob and hands back an object URL the caller must revoke
// (URL.revokeObjectURL) when done with it.
export async function fetchStockCheckTaskPhotoBlobUrl(taskId: string, photoId: string): Promise<string> {
  const blob = await apiGetBlob(`${STOCK_CHECKS_BASE}/${taskId}/photos/${photoId}`);
  return URL.createObjectURL(blob);
}
