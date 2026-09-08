import { api } from "./api";
import { ServiceProvider, ServiceProviderCategory } from "./types";

export interface ServiceProviderInput {
  name: string;
  category: ServiceProviderCategory;
  contactPerson?: string;
  contactPhone: string;
  address?: string;
  isActive: boolean;
  notes?: string;
}

export const serviceProvidersApi = {
  list: () => api.get<ServiceProvider[]>("/service-providers/admin"),
  create: (input: ServiceProviderInput) => api.post<ServiceProvider>("/service-providers/admin", input),
  update: (id: string, input: Partial<ServiceProviderInput>) => api.put<ServiceProvider>(`/service-providers/admin/${id}`, input),
  remove: (id: string) => api.delete<ServiceProvider>(`/service-providers/admin/${id}`),
};
