import { api } from "./api";

export type BlogExpertStatus = "published" | "hidden";

export interface BlogExpert {
  _id: string;
  name: string;
  role: string;
  quote: string;
  /** Photo URL; empty shows the website's default expert photo */
  image: string;
  status: BlogExpertStatus;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type BlogExpertInput = Pick<BlogExpert, "name" | "role" | "quote" | "image" | "status" | "order">;

/** Same limits as the backend (blogExpert.service.ts) */
export const BLOG_EXPERT_LIMITS = { name: 80, role: 100, quote: 220 } as const;

const BASE = "/blog-experts";

export const blogExpertsApi = {
  // Cache-busting query keeps the list fresh after a change
  list: () => api.get<BlogExpert[]>(`${BASE}/admin?_=${Date.now()}`).then((res) => res ?? []),
  create: (data: BlogExpertInput) => api.post<BlogExpert>(BASE, data),
  update: (id: string, data: Partial<BlogExpertInput>) => api.patch<BlogExpert>(`${BASE}/${id}`, data),
  remove: (id: string) => api.delete<{ deleted: boolean }>(`${BASE}/${id}`),
};
