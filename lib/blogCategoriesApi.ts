import { api } from "./api";

export const BLOG_CATEGORY_ICONS = [
  "newspaper", "sprout", "apple", "package", "recycle", "lightbulb", "file-text", "book-open",
  "leaf", "heart", "users", "megaphone", "calendar", "globe", "award", "trending-up",
] as const;
export const BLOG_CATEGORY_COLORS = [
  "sky", "green", "emerald", "orange", "teal", "amber", "rose", "cyan", "lime", "indigo", "violet", "slate",
] as const;

export type BlogCategoryIcon = (typeof BLOG_CATEGORY_ICONS)[number];
export type BlogCategoryColor = (typeof BLOG_CATEGORY_COLORS)[number];
export type BlogCategoryStatus = "published" | "hidden";

export interface BlogCategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: BlogCategoryIcon;
  color: BlogCategoryColor;
  status: BlogCategoryStatus;
  order: number;
  /** Posts (any status) filed under this category */
  postCount: number;
  createdAt: string;
  updatedAt: string;
}

export type BlogCategoryInput = Pick<BlogCategory, "name" | "slug" | "description" | "icon" | "color" | "status" | "order">;

const BASE = "/blog-categories";

export const blogCategoriesApi = {
  // Cache-busting query keeps the list fresh after a change
  list: () => api.get<BlogCategory[]>(`${BASE}/admin?_=${Date.now()}`).then((res) => res ?? []),
  create: (data: BlogCategoryInput) => api.post<BlogCategory>(BASE, data),
  update: (id: string, data: Partial<BlogCategoryInput>) => api.patch<BlogCategory>(`${BASE}/${id}`, data),
  remove: (id: string) => api.delete<{ deleted: boolean }>(`${BASE}/${id}`),
};
