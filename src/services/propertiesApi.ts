import { apiGet, apiPost, apiPut, apiDelete } from "@/services/apiClient";

const PROPERTIES_BASE = "/api/properties";

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
