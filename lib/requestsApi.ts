import { api } from "./api";
import { AssistanceRequest, CaseSummary, CasePriority } from "./types";

export const requestsApi = {
  list: (status?: string) => api.get<AssistanceRequest[]>(`/requests/admin${status ? `?status=${status}` : ""}`),
  getById: (id: string) => api.get<AssistanceRequest>(`/requests/admin/${id}`),
  create: (data: Partial<AssistanceRequest>) => api.post<AssistanceRequest>("/requests/admin", data),
  reject: (id: string) => api.put<AssistanceRequest>(`/requests/admin/${id}/reject`, {}),
  convertToCase: (id: string, priority?: CasePriority) =>
    api.post<CaseSummary>(`/requests/admin/${id}/convert`, { priority }),
};
