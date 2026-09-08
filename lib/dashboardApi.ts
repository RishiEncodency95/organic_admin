import { api } from "./api";

export type DashboardSourceStatus = "connected" | "not_connected" | "error";

export interface DashboardSource<T> {
  status: DashboardSourceStatus;
  updatedAt: string;
  message?: string;
  data: T | null;
}

export interface LiveDashboardOverview {
  generatedAt: string;
  sources: {
    internal: DashboardSource<{
      totalPages: number;
      totalPosts: number;
      totalEnquiries: number;
      enquiriesMtd: number;
      totalRequests: number;
      growth: { posts: number | null; enquiriesMtd: number | null };
      recentSubmissions: Array<{ id: string; name: string; type: string; city?: string; createdAt: string }>;
      topLocations: Array<{ city: string; count: number }>;
      donations: { total: number; mtd: number; totalAmount: number };
      volunteers: { total: number; active: number };
      cases: { total: number; open: number };
      newsletter: { total: number; mtd: number };
      campaigns: { total: number; active: number };
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
      growth: { users: number | null; sessions: number | null; pageViews: number | null; averageSession: number | null; bounceRate: number | null; conversionRate: number | null };
    }>;
    searchConsole: DashboardSource<{
      clicks: number;
      impressions: number;
      ctr: number;
      position: number;
      growth: { clicks: number | null; impressions: number | null; ctr: number | null; position: number | null };
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
  overview: () => api.get<LiveDashboardOverview>("/dashboard/admin/overview"),
  pageSpeed: () => api.get<LiveDashboardOverview["sources"]["pageSpeed"]>("/dashboard/admin/page-speed"),
  indexCoverage: () => api.get<LiveDashboardOverview["sources"]["indexCoverage"]>("/dashboard/admin/index-coverage"),
  siteStatus: () => api.get<LiveDashboardOverview["sources"]["siteStatus"]>("/dashboard/admin/site-status"),
};
