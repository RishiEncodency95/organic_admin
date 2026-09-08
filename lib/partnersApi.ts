import { api } from "./api";
import { Partner, PartnerType, PartnerStatus } from "./types";

export interface PartnerInput {
  name: string;
  type: PartnerType;
  status: PartnerStatus;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  agreementDetails?: string;
  notes?: string;
}

export const partnersApi = {
  list: () => api.get<Partner[]>("/partners/admin"),
  create: (input: PartnerInput) => api.post<Partner>("/partners/admin", input),
  update: (id: string, input: Partial<PartnerInput>) => api.put<Partner>(`/partners/admin/${id}`, input),
};
