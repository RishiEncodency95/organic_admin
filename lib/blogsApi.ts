import { api } from "./api";

export interface BlogPostItem {
  _id?: string;
  id?: number | string;
  title: string;
  h1Title?: string;
  slug: string;
  excerpt?: string;
  content: string;
  category: string;
  author: string;
  tags?: string[] | string;
  status: "published" | "draft" | "scheduled" | "archived" | string;
  showOnHome: boolean;
  featured: boolean;
  scheduledDate?: string | null;
  readTime: string;
  image: string;
  imageAlt?: string;
  views: number;
  publishDate?: string | Date;

  // SEO Fields
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  canonicalUrl?: string;
  canonicalTag?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  openGraphTags?: string;
  schemaMarkup?: string;

  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface GetBlogsResponse {
  posts: BlogPostItem[];
  total: number;
  page: number;
  totalPages: number;
}

export const blogsApi = {
  list: (params?: {
    status?: string;
    showOnHome?: boolean | string;
    featured?: boolean | string;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.showOnHome !== undefined) query.set("showOnHome", String(params.showOnHome));
    if (params?.featured !== undefined) query.set("featured", String(params.featured));
    if (params?.category) query.set("category", params.category);
    if (params?.search) query.set("search", params.search);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));

    const qs = query.toString();
    return api.get<GetBlogsResponse>(`/blogs${qs ? `?${qs}` : ""}`);
  },

  getByIdOrSlug: (idOrSlug: string) => {
    return api.get<BlogPostItem>(`/blogs/${idOrSlug}`);
  },

  create: (data: Partial<BlogPostItem>) => {
    return api.post<BlogPostItem>("/blogs", data);
  },

  update: (id: string, data: Partial<BlogPostItem>) => {
    return api.put<BlogPostItem>(`/blogs/${id}`, data);
  },

  delete: (id: string) => {
    return api.delete<{ deleted: boolean }>(`/blogs/${id}`);
  },
};
