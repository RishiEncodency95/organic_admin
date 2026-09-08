import { api } from "./api";
import { AuditLogEntry } from "./types";

export interface AuditLogFilters {
  entityType?: string;
  action?: string;
  from?: string;
  to?: string;
}

export const auditApi = {
  list: (filters?: AuditLogFilters) => {
    const params = new URLSearchParams();
    if (filters?.entityType) params.set("entityType", filters.entityType);
    if (filters?.action) params.set("action", filters.action);
    if (filters?.from) params.set("from", filters.from);
    if (filters?.to) params.set("to", filters.to);
    const query = params.toString();
    return api.get<AuditLogEntry[]>(`/audit/admin${query ? `?${query}` : ""}`);
  },
  actionTypes: () => api.get<string[]>("/audit/admin/actions"),
  entityTypes: () => api.get<string[]>("/audit/admin/entity-types"),
};
