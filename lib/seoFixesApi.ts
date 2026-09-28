import { api } from "./api";
import type { ReportMetaOverride } from "./seoCheckupData";

export interface SeoFixState {
  _id?: string;
  pageKey: string;
  route?: string;
  testId: string;
  group?: string;
  before?: string;
  fixedBy?: string;
  fixedAt?: string;
}

export type { SeoFixState as default };

export interface ApplySeoFixInput {
  pageKey: string;
  route?: string;
  testId: string;
  group?: string;
  before?: string;
  fixedBy?: string;
}

/** Normalize a report route ("/about", "home", "/") to the backend page key. */
export function toPageKey(route?: string): string {
  const cleaned = (route || "home").toLowerCase().trim().replace(/^\/+|\/+$/g, "");
  return !cleaned || cleaned === "index" ? "home" : cleaned;
}

export const seoFixesApi = {
  /** Every fix recorded for this page (empty list when nothing was fixed yet). */
  listFixes: async (pageKey: string, fresh = false): Promise<SeoFixState[]> => {
    try {
      const query = `pageKey=${encodeURIComponent(pageKey)}${fresh ? `&_t=${Date.now()}` : ""}`;
      const data = await api.get<SeoFixState[]>(`/seo/fixes?${query}`);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  /** Apply a fix for one audit check; rewrites real SEO data for DB-backed checks. */
  applyFix: (input: ApplySeoFixInput): Promise<SeoFixState> =>
    api.post<SeoFixState>("/seo/fixes", input),

  /**
   * Live meta tags for one page straight from the backend database.
   * Returns null when the page has no stored SEO record (nothing to override),
   * so the report keeps using its captured route meta instead.
   */
  getLiveMeta: async (pageKey: string): Promise<ReportMetaOverride | null> => {
    try {
      const data = await api.get<{
        metaTitle?: string;
        metaDescription?: string;
        metaSource?: string;
      }>(`/seo/${pageKey}?envType=live&_t=${Date.now()}`);
      if (!data || data.metaSource !== "stored") return null;
      return {
        title: data.metaTitle || null,
        description: data.metaDescription || null,
      };
    } catch {
      return null;
    }
  },
};
