import { api } from "./api";

export type DashboardSourceStatus = "connected" | "not_connected" | "error";

export type DashboardRangeKey =
  | "1h"
  | "24h"
  | "7d"
  | "28d"
  | "30d"
  | "90d"
  | "this_month"
  | "prev_month";

export interface DashboardSource<T> {
  status: DashboardSourceStatus;
  provider?: string;
  updatedAt: string;
  message?: string;
  data: T | null;
}

export interface LiveDashboardOverview {
  generatedAt: string;
  range?: {
    key: DashboardRangeKey;
    label: string;
    start: string;
    end: string;
    granularity: "minute" | "hour" | "day";
  };
  sources: {
    internal: DashboardSource<{
      totalPages: number;
      totalPosts: number;
      totalEnquiries: number;
      enquiriesMtd: number;
      previousEnquiries?: number;
      totalRequests: number;
      conversionRate?: number | null;
      growth: { posts: number | null; enquiriesMtd: number | null };
      recentSubmissions: Array<{ id: string; name: string; type: string; city?: string; createdAt: string }>;
      topLocations: Array<{ city: string; count: number }>;
      actionRequired?: {
        exhibitor: number;
        buyer: number;
        sponsor: number;
        visitor: number;
      };
    }>;
    analytics: DashboardSource<{
      users: number;
      sessions: number;
      pageViews: number;
      averageSessionSeconds: number;
      bounceRate: number;
      conversions: number;
      daily: Array<{ date: string; users: number; pageViews: number }>;
      pages: Array<{ path: string; views: number; visitors: number; averageSessionSeconds: number; bounceRate: number }>;
      growth: {
        users: number | null;
        sessions: number | null;
        pageViews: number | null;
        averageSession: number | null;
        bounceRate: number | null;
        conversionRate: number | null;
      };
    }>;
    searchConsole: DashboardSource<{
      clicks: number;
      impressions: number;
      ctr: number;
      position: number;
      growth: { clicks: number | null; impressions: number | null; ctr: number | null; position: number | null };
      daily?: Array<{ date: string; clicks: number; impressions: number }>;
      queries: Array<{ query: string; clicks: number; impressions: number; ctr: number; position: number }>;
    }>;
    pageSpeed: DashboardSource<{
      strategy: "mobile" | "desktop";
      lighthouseAvailable: boolean;
      performanceScore: number;
      seoScore: number;
      lcp: number | null;
      inp: number | null;
      cls: number | null;
      fcp: number | null;
      ttfb: number | null;
      tbt: number | null;
      desktop?: {
        performanceScore: number | null;
        lcp: number | null;
        inp: number | null;
        cls: number | null;
        fcp: number | null;
        tbt: number | null;
        ttfb: number | null;
      } | null;
      mobile?: {
        performanceScore: number | null;
        lcp: number | null;
        inp: number | null;
        cls: number | null;
        fcp: number | null;
        tbt: number | null;
        ttfb: number | null;
      } | null;
      seoChecks: Array<{
        key: string;
        label: string;
        status: "good" | "needs_work" | "not_checked";
        score: number | null;
      }>;
    }>;
    indexCoverage: DashboardSource<{
      indexed: number;
      total: number;
      notIndexed: number;
      submittedPages?: number | null;
      indexedPages?: number | null;
      crawlErrors?: number | null;
      sitemapUrlCount?: number | null;
      sitemapValid?: boolean | null;
      robotsValid?: boolean | null;
      gscConnected?: boolean;
      urls: Array<{ url: string; indexed: boolean; coverageState?: string }>;
    }>;
    siteStatus: DashboardSource<{
      online: boolean;
      responseTimeMs: number;
      httpStatus: number;
      sslValid: boolean;
      sslExpiresAt: string | null;
      sslIssuer: string | null;
      certificateDaysRemaining: number | null;
      finalUrl: string;
      redirected: boolean;
      ipAddress: string | null;
      securityHeaders: { present: number; total: number };
      nodeVersion: string;
    }>;
  };
}

export const dashboardApi = {
  overview: async (range: DashboardRangeKey = "7d", refresh = false): Promise<LiveDashboardOverview> => {
    const qs = new URLSearchParams({ range });
    if (refresh) qs.set("refresh", "1");
    return api.get<LiveDashboardOverview>(`/dashboard/overview?${qs.toString()}`);
  },
  pageSpeed: async (refresh = false): Promise<LiveDashboardOverview["sources"]["pageSpeed"]> => {
    return api.get<LiveDashboardOverview["sources"]["pageSpeed"]>(
      `/dashboard/page-speed${refresh ? "?refresh=1" : ""}`
    );
  },
  indexCoverage: async (refresh = false): Promise<LiveDashboardOverview["sources"]["indexCoverage"]> => {
    return api.get<LiveDashboardOverview["sources"]["indexCoverage"]>(
      `/dashboard/index-coverage${refresh ? "?refresh=1" : ""}`
    );
  },
  siteStatus: async (refresh = false): Promise<LiveDashboardOverview["sources"]["siteStatus"]> => {
    return api.get<LiveDashboardOverview["sources"]["siteStatus"]>(
      `/dashboard/site-status${refresh ? "?refresh=1" : ""}`
    );
  },
};
