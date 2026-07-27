import { apiClient, apiGet, apiPost, apiPut, apiDelete } from "@/services/apiClient";

const PRODUCTS_BASE = "/api/products";

// Mirrors ap-be's com.admin.entity.stock.Product field-for-field.
export interface Product {
  id: string;
  name: string;
  sku: string;
  category?: string;
  quantity: number;
  reorderThreshold: number;
  unitPrice?: number;
  deleteFlag: boolean;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
}

// Mirrors ap-be's com.admin.entity.stock.ProductImportResult.
export interface ProductImportResult {
  created: number;
  updated: number;
  failed: number;
  errors: string[];
}

export async function fetchProducts(
  page: number,
  pageSize: number,
  search: string
): Promise<ProductsResponse> {
  return apiGet<ProductsResponse>(PRODUCTS_BASE, { page, pageSize, search });
}

export async function fetchProductById(id: string): Promise<Product> {
  return apiGet<Product>(`${PRODUCTS_BASE}/${id}`);
}

export async function createProduct(payload: {
  name: string;
  sku: string;
  category?: string;
  quantity: number;
  reorderThreshold: number;
  unitPrice?: number;
}): Promise<Product> {
  return apiPost<Product>(PRODUCTS_BASE, payload);
}

export async function updateProduct(
  id: string,
  payload: {
    name: string;
    sku: string;
    category?: string;
    quantity: number;
    reorderThreshold: number;
    unitPrice?: number;
  }
): Promise<void> {
  return apiPut<void>(`${PRODUCTS_BASE}/${id}`, payload);
}

export async function deleteProduct(id: string): Promise<void> {
  return apiDelete<void>(`${PRODUCTS_BASE}/${id}`);
}

// Not routed through apiPost - axios's instance-level default
// Content-Type: application/json header can otherwise fight its automatic
// multipart boundary detection for a FormData body. Explicitly unsetting
// it for just this call lets the browser set the correct
// "multipart/form-data; boundary=..." header itself.
export async function importProducts(file: File): Promise<ProductImportResult> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await apiClient.post<{ data: ProductImportResult }>(
    `${PRODUCTS_BASE}/import`,
    formData,
    { headers: { "Content-Type": undefined } }
  );
  return res.data.data;
}
