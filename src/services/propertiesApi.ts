import { apiGet, apiPost, apiPut, apiDelete, apiGetBlob } from "@/services/apiClient";

const PROPERTIES_BASE = "/api/properties";
const MAINTENANCE_REQUESTS_BASE = "/api/maintenance-requests";

// Mirrors ap-be's com.admin.entity.property.Property field-for-field.
export interface Property {
  id: string;
  name: string;
  address: string;
  type: "RESIDENTIAL" | "COMMERCIAL";
  createdBy?: string;
  createdDate?: string;
  updatedBy?: string;
  updatedDate?: string;
  deleteFlag: boolean;
}

export interface PropertiesResponse {
  properties: Property[];
  total: number;
  page: number;
  pageSize: number;
}

// Mirrors ap-be's com.admin.entity.property.Unit field-for-field.
export interface Unit {
  id: string;
  propertyId: string;
  unitNumber: string;
  floor?: string;
  bedrooms: number;
  baseRent?: number;
  status: "VACANT" | "OCCUPIED" | "MAINTENANCE";
  createdBy?: string;
  createdDate?: string;
  updatedBy?: string;
  updatedDate?: string;
  deleteFlag: boolean;
}

export interface PropertyPayload {
  name: string;
  address: string;
  type: "RESIDENTIAL" | "COMMERCIAL";
}

export interface UnitPayload {
  unitNumber: string;
  floor?: string;
  bedrooms: number;
  baseRent?: number;
  status: "VACANT" | "OCCUPIED" | "MAINTENANCE";
}

export async function fetchProperties(
  page: number,
  pageSize: number,
  search: string
): Promise<PropertiesResponse> {
  return apiGet<PropertiesResponse>(PROPERTIES_BASE, { page, pageSize, search });
}

export async function fetchPropertyById(id: string): Promise<Property> {
  return apiGet<Property>(`${PROPERTIES_BASE}/${id}`);
}

export async function createProperty(payload: PropertyPayload): Promise<Property> {
  return apiPost<Property>(PROPERTIES_BASE, payload);
}

export async function updateProperty(id: string, payload: PropertyPayload): Promise<void> {
  return apiPut<void>(`${PROPERTIES_BASE}/${id}`, payload);
}

export async function deleteProperty(id: string): Promise<void> {
  return apiDelete<void>(`${PROPERTIES_BASE}/${id}`);
}

export async function fetchUnits(propertyId: string): Promise<Unit[]> {
  return apiGet<Unit[]>(`${PROPERTIES_BASE}/${propertyId}/units`);
}

export async function createUnit(propertyId: string, payload: UnitPayload): Promise<Unit> {
  return apiPost<Unit>(`${PROPERTIES_BASE}/${propertyId}/units`, payload);
}

export async function updateUnit(
  propertyId: string,
  unitId: string,
  payload: UnitPayload
): Promise<void> {
  return apiPut<void>(`${PROPERTIES_BASE}/${propertyId}/units/${unitId}`, payload);
}

export async function deleteUnit(propertyId: string, unitId: string): Promise<void> {
  return apiDelete<void>(`${PROPERTIES_BASE}/${propertyId}/units/${unitId}`);
}

// Mirrors ap-be's com.admin.entity.property.MaintenanceRequest field-for-field.
export interface MaintenanceRequest {
  id: string;
  unitId: string;
  title: string;
  description?: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  assignedTo?: string;
  reportedBy?: string;
  resolutionNote?: string;
  resolvedDate?: string;
  submittedLatitude?: number;
  submittedLongitude?: number;
  createdBy?: string;
  createdDate?: string;
  updatedBy?: string;
  updatedDate?: string;
  deleteFlag: boolean;
}

export interface MaintenanceRequestPayload {
  title: string;
  description?: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status?: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  assignedTo?: string;
  reportedBy?: string;
}

// Aggregates across every unit of the property - the manager's property-level ticket view.
export async function fetchMaintenanceRequestsForProperty(propertyId: string): Promise<MaintenanceRequest[]> {
  return apiGet<MaintenanceRequest[]>(`${PROPERTIES_BASE}/${propertyId}/maintenance-requests`);
}

export async function createMaintenanceRequest(
  propertyId: string,
  unitId: string,
  payload: MaintenanceRequestPayload
): Promise<MaintenanceRequest> {
  return apiPost<MaintenanceRequest>(
    `${PROPERTIES_BASE}/${propertyId}/units/${unitId}/maintenance-requests`,
    payload
  );
}

export async function updateMaintenanceRequest(
  propertyId: string,
  unitId: string,
  requestId: string,
  payload: MaintenanceRequestPayload
): Promise<void> {
  return apiPut<void>(
    `${PROPERTIES_BASE}/${propertyId}/units/${unitId}/maintenance-requests/${requestId}`,
    payload
  );
}

export async function deleteMaintenanceRequest(
  propertyId: string,
  unitId: string,
  requestId: string
): Promise<void> {
  return apiDelete<void>(`${PROPERTIES_BASE}/${propertyId}/units/${unitId}/maintenance-requests/${requestId}`);
}

// Mirrors ap-be's com.admin.entity.property.MaintenanceRequestPhoto field-for-field.
export interface MaintenanceRequestPhoto {
  id: string;
  requestId: string;
  storageKey: string;
  contentType: string;
  uploadedBy?: string;
  createdDate?: string;
}

// Metadata only - use maintenanceRequestPhotoBlobUrl for the actual image bytes.
export async function fetchMaintenanceRequestPhotos(requestId: string): Promise<MaintenanceRequestPhoto[]> {
  return apiGet<MaintenanceRequestPhoto[]>(`${MAINTENANCE_REQUESTS_BASE}/${requestId}/photos`);
}

// Auth-gated (unlike profile pictures), so this can't just be an <img src>
// URL - fetches the bytes as a Blob and hands back an object URL the
// caller must revoke (URL.revokeObjectURL) when done with it.
export async function fetchMaintenanceRequestPhotoBlobUrl(requestId: string, photoId: string): Promise<string> {
  const blob = await apiGetBlob(`${MAINTENANCE_REQUESTS_BASE}/${requestId}/photos/${photoId}`);
  return URL.createObjectURL(blob);
}
