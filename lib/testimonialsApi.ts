import { api } from "./api";
import { Testimonial } from "./types";

export const testimonialsApi = {
  getAll: () => api.get<Testimonial[]>("/testimonials/admin"),
  create: (data: Partial<Testimonial>) => api.post<Testimonial>("/testimonials/admin", data),
  update: (id: string, data: Partial<Testimonial>) => api.put<Testimonial>(`/testimonials/admin/${id}`, data),
  delete: (id: string) => api.delete<void>(`/testimonials/admin/${id}`),
};
