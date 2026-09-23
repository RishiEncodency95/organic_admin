import { api } from "./api";

export interface ISeoInternalLink {
  label: string;
  url: string;
}

export interface SeoRecord {
  _id?: string;
  page: string;
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
  h1Tag?: string;
  breadcrumbName?: string;
  internalLinks?: ISeoInternalLink[];
  robotsIndex?: boolean;
  robotsFollow?: boolean;
  isActive?: boolean;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const seoApi = {
  getAll: () => api.get<SeoRecord[]>("/seo"),

  getByPage: (page: string, envType: "local" | "live" = "live") => {
    const cleanPage = (page || "home").replace(/^\/+|\/+$/g, "") || "home";
    return api.get<SeoRecord>(`/seo/page/${encodeURIComponent(cleanPage)}?envType=${envType}`);
  },

  upsert: (page: string, data: Partial<SeoRecord>) => {
    const cleanPage = (page || "home").replace(/^\/+|\/+$/g, "") || "home";
    return api.put<SeoRecord>(`/seo/page/${encodeURIComponent(cleanPage)}`, data);
  },

  generate: (page: string, envType: "local" | "live" = "live") => {
    const cleanPage = (page || "home").replace(/^\/+|\/+$/g, "") || "home";
    return api.post<SeoRecord>("/seo/generate", { page: cleanPage, envType });
  },
};
