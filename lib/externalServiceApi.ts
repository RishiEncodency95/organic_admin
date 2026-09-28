import { createCrudApi } from "./crudApi";
import { api } from "./api";
import { ExternalService } from "./types";

export type SystemServiceApprover = { id: string; name: string; email?: string; roleSlug: "admin" | "super_admin" };
export type SystemServiceAccessRequirements = {
  expiresInMinutes: number;
  requiredRoles: Array<"self" | "admin" | "super_admin">;
  requester: { id: string; name: string; email?: string; phone?: string; twoFactorEnabled: boolean } | null;
  approvers: SystemServiceApprover[];
};

export const externalServiceApi = {
  ...createCrudApi<ExternalService>("system-services"),
  summary: () => api.get<ExternalService[]>("/system-services/summary"),
  accessRequirements: () => api.get<SystemServiceAccessRequirements>("/system-services/access/requirements"),
  sendOtp: (phone: string, name?: string) =>
    api.post<{ success: boolean; message: string }>("/system-services/access/send-otp", { phone, name }),
  verifyAccess: (approvals: Array<{ userId: string; code: string }>) =>
    api.post<{ token: string; expiresAt: string; expiresInMinutes: number }>("/system-services/access/verify", { approvals }),
  accessStatus: () => api.get<{ valid: boolean; expiresAt: string }>("/system-services/access/status"),
};
