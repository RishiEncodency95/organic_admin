import { api } from "./api";
import { VolunteerSummary, VolunteerStatus, CaseVolunteerAssignment, AssignmentRole } from "./types";

export const volunteersApi = {
  list: (filters?: { status?: VolunteerStatus; city?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.city) params.set("city", filters.city);
    const query = params.toString();
    return api.get<VolunteerSummary[]>(`/volunteers/admin${query ? `?${query}` : ""}`);
  },
  getById: (id: string) => api.get<VolunteerSummary>(`/volunteers/admin/${id}`),
  print: (id: string) => api.getHtml(`/volunteers/admin/${id}/print`),
  pdf: (id: string) => api.getBlob(`/volunteers/admin/${id}/pdf`),
  create: (input: Record<string, unknown>) =>
    api.post<VolunteerSummary>(`/volunteers/admin`, input),
  updateStatus: (id: string, status: VolunteerStatus) =>
    api.patch<VolunteerSummary>(`/volunteers/admin/${id}/status`, { status }),
  updateOfficeUse: (id: string, input: { verified?: boolean; assignedRole?: string; assignedArea?: string; joiningDate?: string | null }) =>
    api.patch<VolunteerSummary>(`/volunteers/admin/${id}/office-use`, input),
  assignToCase: (caseId: string, volunteerId: string, role: AssignmentRole, note?: string) =>
    api.post<CaseVolunteerAssignment>(`/cases/admin/${caseId}/volunteers`, { volunteerId, role, note }),
  remove: (id: string) => api.delete<null>(`/volunteers/admin/${id}`),
};
