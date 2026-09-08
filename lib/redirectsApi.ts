import { api } from "./api";

export interface Redirect {
  _id: string;
  source: string;
  destination: string;
  permanent: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const redirectsApi = {
  getAll: async () => {
    return await api.get<Redirect[]>("/redirects");
  },
  create: async (data: Partial<Redirect>) => {
    return await api.post<Redirect>("/redirects", data);
  },
  update: async (id: string, data: Partial<Redirect>) => {
    return await api.patch<Redirect>(`/redirects/${id}`, data);
  },
  delete: async (id: string) => {
    return await api.delete<void>(`/redirects/${id}`);
  },
};
