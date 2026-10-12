import { api } from "./api";

export type BlogUpdateStatus = "published" | "hidden";

export interface BlogUpdate {
  _id: string;
  tag: string;
  title: string;
  description: string;
  /** Image URL; empty shows one of the website's default update images */
  image: string;
  /** ISO date shown on the card */
  date: string;
  readMinutes: number;
  /** A site path (/blog/…) or a full https:// link; empty = card not clickable */
  link: string;
  status: BlogUpdateStatus;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type BlogUpdateInput = Omit<BlogUpdate, "_id" | "createdAt" | "updatedAt">;

/** Same limits as the backend (blogUpdate.service.ts) */
export const BLOG_UPDATE_LIMITS = { tag: 30, title: 120, description: 300 } as const;

const BASE = "/blog-updates";

export const blogUpdatesApi = {
  // Cache-busting query keeps the list fresh after a change
  list: () => api.get<BlogUpdate[]>(`${BASE}/admin?_=${Date.now()}`).then((res) => res ?? []),
  create: (data: BlogUpdateInput) => api.post<BlogUpdate>(BASE, data),
  update: (id: string, data: Partial<BlogUpdateInput>) => api.patch<BlogUpdate>(`${BASE}/${id}`, data),
  remove: (id: string) => api.delete<{ deleted: boolean }>(`${BASE}/${id}`),
};
