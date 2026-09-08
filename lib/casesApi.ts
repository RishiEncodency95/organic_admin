import { api } from "./api";
import {
  CaseSummary,
  CaseDetail,
  CaseStatus,
  CasePriority,
  VerificationStatus,
  DocumentType,
  ExpenseStatus,
  PaymentMode,
  CaseDocumentItem,
  CaseExpenseItem,
} from "./types";

export const casesApi = {
  list: (filters?: { status?: CaseStatus; city?: string; priority?: CasePriority }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.city) params.set("city", filters.city);
    if (filters?.priority) params.set("priority", filters.priority);
    const query = params.toString();
    return api.get<CaseSummary[]>(`/cases/admin${query ? `?${query}` : ""}`);
  },
  getById: (id: string) => api.get<CaseDetail>(`/cases/admin/${id}`),
  transitionStatus: (id: string, toStatus: CaseStatus, note?: string) =>
    api.patch<CaseSummary>(`/cases/admin/${id}/status`, { toStatus, note }),
  verify: (id: string, input: { outcome: VerificationStatus; method: string; note: string }) =>
    api.patch<CaseSummary>(`/cases/admin/${id}/verify`, input),
  addDocument: (id: string, file: File, docType: DocumentType, isProof: boolean) => {
    const form = new FormData();
    form.append("file", file);
    form.append("docType", docType);
    form.append("isProof", String(isProof));
    return api.postForm<CaseDocumentItem>(`/cases/admin/${id}/documents`, form);
  },
  addExpense: (
    id: string,
    input: { categoryId: string; amount: number; expenseDate: string; paymentMode: PaymentMode; payeeName?: string; referenceNo?: string }
  ) => api.post<CaseExpenseItem>(`/cases/admin/${id}/expenses`, input),
  decideExpense: (id: string, expenseId: string, decision: Extract<ExpenseStatus, "APPROVED" | "REJECTED">, remark?: string) =>
    api.patch<CaseExpenseItem>(`/cases/admin/${id}/expenses/${expenseId}`, { decision, remark }),
  cancel: (id: string, reason: string) => api.patch<CaseSummary>(`/cases/admin/${id}/cancel`, { reason }),
  withdrawAssignment: (id: string, assignmentId: string, reason?: string) =>
    api.patch(`/cases/admin/${id}/volunteers/${assignmentId}/withdraw`, { reason }),
  summaryHtml: (id: string) => api.getHtml(`/cases/admin/${id}/summary`),
  slaBreaches: () => api.get<SlaBreach[]>("/cases/admin/sla-breaches"),
  mapData: () => api.get<CaseMapPin[]>("/cases/admin/map-data"),
  nearestVolunteers: (id: string) => api.get<NearestVolunteer[]>(`/cases/admin/${id}/nearest-volunteers`),
};

export interface SlaBreach {
  _id: string;
  caseId: string;
  status: CaseStatus;
  priority: CasePriority;
  city: string;
  createdAt: string;
  breachReason: string;
  thresholdHours: number;
}

export interface CaseMapPin {
  _id: string;
  caseId: string;
  status: CaseStatus;
  priority: CasePriority;
  city: string;
  lat: number;
  lng: number;
}

export interface NearestVolunteer {
  _id: string;
  name?: string;
  phone?: string;
  city: string;
  availability: "AVAILABLE" | "BUSY" | "UNAVAILABLE";
  totalAssignments: number;
  distanceKm: number | null;
}
