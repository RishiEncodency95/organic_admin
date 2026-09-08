import { api } from "./api";

/**
 * Mirrors the backend's own buildAdminCrudHandlers shape (GET/POST /admin, GET/PUT/DELETE
 * /admin/:id). Use this for any resource whose admin surface is plain CRUD — Services, Pandits,
 * Drivers, Blog, Gallery, Testimonials, FAQs all qualify. Resources with extra actions (Bookings'
 * assign/status, Donations' summary) get their own small api module instead of forcing it in here.
 */
export function createCrudApi<T>(resource: string) {
  const base = `/${resource}/admin`;
  return {
    list: () => api.get<T[]>(base),
    getById: (id: string) => api.get<T>(`${base}/${id}`),
    create: (payload: Partial<T>) => api.post<T>(base, payload),
    update: (id: string, payload: Partial<T>) => api.put<T>(`${base}/${id}`, payload),
    remove: (id: string) => api.delete<T>(`${base}/${id}`),
  };
}
