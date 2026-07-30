import { apiGet, apiPost } from "@/services/apiClient";

const COMPLAINTS_BASE = "/api/complaints";

// Mirrors ap-be's com.admin.entity.complaint.Complaint field-for-field.
export interface Complaint {
  id: string;
  raisedBy: string;
  category: string;
  subject: string;
  message: string;
  status: "OPEN" | "RESOLVED";
  resolvedBy?: string;
  resolvedDate?: string;
  createdBy?: string;
  createdDate?: string;
}

// Mirrors ap-be's com.admin.entity.complaint.ComplaintComment.
export interface ComplaintComment {
  id: string;
  complaintId: string;
  authorId: string;
  message: string;
  createdDate?: string;
}

export interface ComplaintsResponse {
  complaints: Complaint[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ComplaintDetail {
  complaint: Complaint;
  comments: ComplaintComment[];
}

export async function createComplaint(payload: {
  category: string;
  subject: string;
  message: string;
}): Promise<Complaint> {
  return apiPost<Complaint>(COMPLAINTS_BASE, payload);
}

export async function fetchMyComplaints(): Promise<Complaint[]> {
  return apiGet<Complaint[]>(`${COMPLAINTS_BASE}/mine`);
}

export async function fetchComplaintInbox(
  page: number,
  pageSize: number,
  search: string
): Promise<ComplaintsResponse> {
  return apiGet<ComplaintsResponse>(`${COMPLAINTS_BASE}/inbox`, { page, pageSize, search });
}

export async function fetchComplaintDetail(id: string): Promise<ComplaintDetail> {
  return apiGet<ComplaintDetail>(`${COMPLAINTS_BASE}/${id}`);
}

export async function addComplaintComment(id: string, message: string): Promise<ComplaintComment> {
  return apiPost<ComplaintComment>(`${COMPLAINTS_BASE}/${id}/comments`, { message });
}

export async function resolveComplaint(id: string): Promise<Complaint> {
  return apiPost<Complaint>(`${COMPLAINTS_BASE}/${id}/resolve`);
}
