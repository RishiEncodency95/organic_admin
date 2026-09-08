import { api } from "./api";

export interface Faq {
  _id: string;
  question: string;
  answer: string;
  category?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const faqsApi = {
  getAll: async () => {
    return await api.get<Faq[]>("/faqs/admin");
  },
  create: async (data: Partial<Faq>) => {
    return await api.post<Faq>("/faqs/admin", data);
  },
  update: async (id: string, data: Partial<Faq>) => {
    return await api.put<Faq>(`/faqs/admin/${id}`, data);
  },
  delete: async (id: string) => {
    return await api.delete<void>(`/faqs/admin/${id}`);
  },
};
