import { api } from "./api";

export interface ISeoOptions {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  schemaMarkup?: string;
  h1Tag?: string;
  breadcrumbName?: string;
  internalLinks?: { label: string; url: string }[];
  robotsIndex?: boolean;
  robotsFollow?: boolean;
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  author: string;
  tags: string[];
  isPublished: boolean;
  publishedAt?: string;
  seo?: ISeoOptions;
  createdAt: string;
  updatedAt: string;
}

export const blogsApi = {
  getAll: async () => {
    return await api.get<BlogPost[]>("/blog/admin");
  },
  create: async (data: Partial<BlogPost>) => {
    return await api.post<BlogPost>("/blog/admin", data);
  },
  update: async (id: string, data: Partial<BlogPost>) => {
    return await api.put<BlogPost>(`/blog/admin/${id}`, data);
  },
  delete: async (id: string) => {
    return await api.delete<void>(`/blog/admin/${id}`);
  },
};
