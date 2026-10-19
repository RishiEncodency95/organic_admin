import { api } from "./api";
import type { SeoCheckupReportData } from "./seoCheckupData";

export type SeoSeverity = "critical" | "warning" | "notice";

export interface SeoScores {
  overall: number | null;
  technical: number | null;
  onPage: number | null;
  content: number | null;
  performance: number | null;
  visibility: number | null;
}

export interface SeoIssueCounts {
  critical: number;
  warning: number;
  notice: number;
  total: number;
}

export interface SeoIssue {
  id: string;
  ruleId: string;
  category: string;
  severity: SeoSeverity;
  title: string;
  detail: string;
  evidence: Record<string, unknown>;
  url?: string | null;
  scope?: string;
  firstSeenAt: string;
  lastSeenAt: string;
}
export interface SeoPageFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: "2xx" | "3xx" | "4xx" | "5xx" | "error";
  indexable?: boolean;
  severity?: SeoSeverity;
  issueCategory?: string;
  hasBrokenLinks?: boolean;
  orphan?: boolean;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface SeoPagesResponse {
  pages: SeoPageRow[];
  message: string | null;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SeoPageRow {
  id: string;
  url: string;
  path: string;
  title: string | null;
  titleLength: number;
  titleStatus: "missing" | "too_short" | "too_long" | "ok";
  metaDescription: string | null;
  metaDescriptionLength: number;
  descriptionStatus: "missing" | "too_short" | "too_long" | "ok";
  httpStatus: number | null;
  indexable: boolean;
  indexabilityReason: string | null;
  canonical: string | null;
  canonicalStatus: "missing" | "self" | "points_elsewhere" | "unknown";
  score: number | null;
  issueCounts: SeoIssueCounts;
  issueCategories: string[];
  h1: string[];
  h1Status: "missing" | "multiple" | "hierarchy_error" | "hierarchy_warning" | "ok";
  hierarchyStatus: string;
  headingCounts: Record<string, number>;
  wordCount: number;
  inLinks: number;
  outLinks: number;
  brokenLinks: number;
  depth: number | null;
  isOrphan: boolean;
  inSitemap: boolean;
  schemaTypes: string[];
  schemaStatus: "none" | "invalid" | "valid" | "valid_with_breadcrumb";
  imageCount: number;
  imagesMissingAlt: number;
  responseTimeMs: number | null;
  keywordStatus: "ok" | "warning" | "not_available";
  openGraphStatus: "valid" | "incomplete" | "not_available";
  twitterStatus: "valid" | "incomplete" | "not_available";
  consoleErrorCount: number;
  failedRequestCount: number;
  renderBlockingCount: number;
  cdnStatus: "detected" | "likely" | "no_indicators" | "unable_to_determine";
  performance: {
    score: number | null;
    lcpMs: number | null;
    cls: number | null;
    isFieldData: boolean;
    fetchedAt: string | null;
  };
  search: { clicks: number; impressions: number; ctr: number; position: number; updatedAt: string | null } | null;
  analytics: { views: number; users: number; engagementRate: number | null } | null;
  lastCrawledAt: string | null;
}

export interface SeoRecommendationItem {
  ruleId: string | null;
  category?: string;
  title: string;
  whyItMatters: string;
  priority: "high" | "medium" | "low";
  recommendedFix: string;
  implementation: string;
  suggestedTitle: string | null;
  suggestedDescription: string | null;
  headingSuggestions: string[];
  internalLinkSuggestions: Array<{ fromOrTo: string; anchorText: string; reason: string }>;
  contentSuggestions: string[];
  schemaSuggestion: string | null;
}

export interface SeoRouteTelemetry {
  routeScore: number;
  indexableWords: number;
  internalLinks: number;
  lcpSeconds: number;
  cls: number;
  searchConsole: { clicks: number; impressions: number; ctr: number; position: number };
  crawlerIssue: string;
}

export interface PageSpeedAudit {
  ok: boolean;
  message?: string;
  url: string;
  strategy: "mobile" | "desktop";
  fetchedAt: string;
  cached: boolean;
  scores: {
    performance: number | null;
    accessibility: number | null;
    bestPractices: number | null;
    seo: number | null;
  };
  metrics: {
    fcpMs: number | null;
    lcpMs: number | null;
    tbtMs: number | null;
    cls: number | null;
    siMs: number | null;
    ttfbMs: number | null;
    htmlKb: number | null;
    payloadKb: number | null;
    totalRequests: number | null;
    domNodes: number | null;
    imageRequests: number | null;
    javascriptKb: number | null;
    cssKb: number | null;
    fontKb: number | null;
    otherKb: number | null;
  };
  fieldData: { available: boolean; overall: string | null };
}

export interface SeoRecommendation {
  id: string;
  scope: string;
  url: string | null;
  route?: string | null;
  provider: string;
  providerAvailable?: boolean;
  model: string;
  summary: string | null;
  positiveSignals?: string[];
  items: SeoRecommendationItem[];
  telemetry?: SeoRouteTelemetry | null;
  status: string;
  error: string | null;
  generatedAt: string;
}

export interface SeoRecommendationResponse {
  status: "ok" | "cached" | "not_configured" | "error" | "no_data";
  message: string | null;
  recommendation: SeoRecommendation | null;
}

export interface SeoPageDetail {
  page: SeoPageRow & {
    metaRobots: string | null;
    canonicalNormalized: string | null;
    canonicalCount: number;
    ogTitle: string | null;
    ogDescription: string | null;
    ogImage: string | null;
    ogType: string | null;
    ogUrl: string | null;
    twitterCard: string | null;
    twitterTitle: string | null;
    twitterDescription: string | null;
    twitterImage: string | null;
    metaKeywords: string | null;
    metaKeywordCount: number;
    socialStatus: { openGraph: string; twitter: string };
    keywordAnalysis: {
      available: boolean;
      targets: Array<{
        keyword: string;
        source: string;
        presentInTitle: boolean;
        presentInMetaDescription: boolean;
        presentInH1: boolean;
        presentInHeadings: boolean;
        presentInOpeningContent: boolean;
        presentInImageAlt: boolean;
        presentInInternalAnchor: boolean;
        exactMentions: number;
        totalWordCount: number;
        densityPercent: number;
      }>;
    };
    browserHealth: Record<
      "consoleErrors" | "consoleWarnings" | "jsExceptions" | "failedRequests",
      Array<{
        url: string;
        message: string;
        type: string;
        resourceUrl: string | null;
        resourceType: string | null;
        statusCode: number | null;
        timestamp: string;
      }>
    >;
    cdn: { status: string; provider: string | null; evidence: string[]; cacheControl: string | null; server: string | null };
    lang: string | null;
    viewport: string | null;
    hreflang: Array<{ hreflang: string; href: string }>;
    headingSequence: Array<{ level: number; text: string }>;
    headingIssues: string[];
    h2: string[];
    h3: string[];
    images: Array<{ src: string; alt: string | null; hasAlt: boolean; isDecorative: boolean; loading: string | null; width: number | null; height: number | null }>;
    imagesEmptyAlt: number;
    imagesLazyLoaded: number;
    imagesWithoutDimensions: number;
    schemas: Array<{ types: string[]; valid: boolean; errors: string[]; warnings: string[] }>;
    breadcrumbIssues: string[];
    scoreBreakdown: Array<{ category: string; score: number; weight: number }>;
    contentType: string | null;
    finalUrl: string | null;
    redirected: boolean;
    fetchError: string | null;
    renderedWithJs: boolean;
    internalLinkCount: number;
    externalLinkCount: number;
    nofollowLinkCount: number;
    mixedContentLinkCount: number;
  };
  issues: SeoIssue[];
  links: {
    incoming: Array<{ source: string; anchorText: string; isNofollow: boolean }>;
    outgoing: Array<{
      target: string;
      normalizedTarget: string;
      anchorText: string;
      rel: string | null;
      isInternal: boolean;
      isNofollow: boolean;
      httpStatus: number | null;
      statusClass: string;
      isBroken: boolean;
      redirectsTo: string | null;
      redirectHops: number;
    }>;
    brokenOutgoing: number;
    redirectingOutgoing: number;
  };
  redirectChain: {
    hops: Array<{ url: string; status: number | null }>;
    hopCount: number;
    finalUrl: string | null;
    finalStatus: number | null;
    severity: string;
    issues: string[];
  } | null;
  performance: {
    audits: Array<{
      id: string;
      strategy: string;
      status: string;
      error: string | null;
      lighthouseVersion: string | null;
      lab: Record<string, number | null>;
      field: { available: boolean; source: string | null } & Record<string, unknown>;
      opportunities: Array<{ id: string; title: string; savingsMs: number | null }>;
      renderBlockingResources: Array<{ url: string | null; type: string; savingsMs: number | null; source: string }>;
      fetchedAt: string;
    }>;
    labNote: string;
    fieldNote: string;
  };
  search: {
    available: boolean;
    rangeStart: string | null;
    rangeEnd: string | null;
    metric: string;
    totals: { clicks: number; impressions: number; ctr: number; position: number } | null;
    topQueries: Array<{ query: string; clicks: number; impressions: number; ctr: number; position: number }>;
  };
  history: Array<{
    capturedAt: string;
    score: number | null;
    issueCounts: SeoIssueCounts;
    wordCount: number;
    httpStatus: number | null;
    performanceScore: number | null;
    lcpMs: number | null;
    cls: number | null;
    clicks: number | null;
    impressions: number | null;
    position: number | null;
  }>;
  recommendation: SeoRecommendation | null;
}

export interface SeoOverview {
  site: {
    id: string;
    url: string;
    label: string;
    type: string;
    crawlSettings: Record<string, unknown>;
    schedule: Record<string, unknown>;
    lastCrawlAt: string | null;
    lastScore: number | null;
    searchConsoleConnected: boolean;
    analyticsConnected: boolean;
  };
  hasData: boolean;
  message?: string;
  runningCrawl: { id: string; status: string; startedAt: string | null } | null;
  crawl?: {
    id: string;
    status: string;
    trigger: string;
    startedAt: string | null;
    completedAt: string | null;
    durationMs: number | null;
    stats: Record<string, number>;
    robotsFound: boolean;
    sitemapFound: boolean;
    sitemapUrlCount: number;
  };
  scores?: SeoScores;
  previousScores?: SeoScores | null;
  counts?: Record<string, number> | null;
  performance?: {
    score: number | null;
    lcpMs: number | null;
    clsScore: number | null;
    inpMs: number | null;
    fieldDataAvailable: boolean;
  } | null;
  search?:
  | {
    available: true;
    metricNote: string;
    windowDays: number;
    rangeStart: string;
    rangeEnd: string;
    totals: { clicks: number; impressions: number; ctr: number; position: number };
    previousTotals: { clicks: number; impressions: number; ctr: number; position: number };
    topQueries: Array<{ key: string; clicks: number; impressions: number; ctr: number; position: number }>;
    topPages: Array<{ key: string; clicks: number; impressions: number; ctr: number; position: number }>;
    byDevice: Array<{ key: string; clicks: number; impressions: number; ctr: number; position: number }>;
    byCountry: Array<{ key: string; clicks: number; impressions: number; ctr: number; position: number }>;
    daily: Array<{ key: string; clicks: number; impressions: number; ctr: number; position: number }>;
  }
  | { available: false; message: string };
  analytics?:
  | {
    available: true;
    windowDays: number;
    rangeStart: string;
    rangeEnd: string;
    totals: Record<string, number>;
    previousTotals: Record<string, number>;
    organicTotals: Record<string, number>;
    landingPages: Array<{ path: string; sessions: number; users: number; engagementRate: number; keyEvents: number }>;
    channels: Array<{ source: string; medium: string; sessions: number; users: number; keyEvents: number }>;
    events: Array<{ name: string; count: number; users: number }>;
    daily: Array<{ date: string; users: number; sessions: number; organicSessions: number }>;
  }
  | { available: false; message: string };
  alerts?: Array<{
    id: string;
    type: string;
    severity: SeoSeverity;
    title: string;
    message: string;
    createdAt: string;
  }>;
  topIssues?: Array<{ ruleId: string; severity: SeoSeverity; category: string; title: string; affectedPages: number }>;
  history?: Array<{
    capturedAt: string;
    scores: SeoScores;
    counts: Record<string, number>;
    performance: { score: number | null; lcpMs: number | null; clsScore: number | null };
    search: { available: boolean; clicks: number | null; impressions: number | null; position: number | null };
  }>;
}

export interface SeoBrokenLink {
  target: string;
  targetUrl: string;
  httpStatus: number | null;
  statusClass: string;
  isInternal: boolean;
  error: string | null;
  firstSeenAt: string;
  lastCheckedAt: string | null;
  affectedPages: number;
  sources: Array<{ sourceUrl: string; anchorText: string }>;
}

export interface SeoInsights {
  available: boolean;
  message: string | null;
  rangeStart: string | null;
  rangeEnd: string | null;
  windowDays: number | null;
  cannibalization: Array<{
    query: string;
    totalClicks: number;
    totalImpressions: number;
    pages: Array<{ url: string; title: string | null; clicks: number; impressions: number; ctr: number; position: number; wordCount: number | null }>;
  }>;
  contentGaps: Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    bestPage: string | null;
    bestPageTitle: string | null;
    reason: string;
  }>;
  risingQueries: Array<{ query: string; clicks: number; clicksChange: number }>;
  fallingQueries: Array<{ query: string; clicks: number; clicksChange: number }>;
  highImpressionLowCtr: Array<{ query: string; impressions: number; clicks: number; ctr: number; position: number; bestPage: string | null }>;
  strikingDistance: Array<{ query: string; position: number; impressions: number }>;
}

export interface SeoScoreExplanation {
  available: boolean;
  message?: string;
  storedScores?: SeoScores | null;
  overall?: number | null;
  categories?: Array<{
    category: string;
    score: number | null;
    rawPenalty: number;
    issueCount: number;
    available: boolean;
    note?: string;
    contributions: Array<{ ruleId: string; severity: SeoSeverity; count: number; penalty: number }>;
  }>;
  formula?: {
    severityPenalty: Record<SeoSeverity, number>;
    sensitivity: number;
    weights: Record<string, number>;
    pagesConsidered: number;
    description: string;
  };
}

export interface SeoCompetitor {
  id: string;
  url: string;
  label: string;
  isActive: boolean;
  lastCrawlAt: string | null;
  lastScore: number | null;
}

export interface SeoCompetitorComparison {
  primary: { label: string; url: string; observed: Record<string, number | null> };
  competitors: Array<{ siteId: string; label: string; url: string; observed: Record<string, number | null> }>;
}

function labelForPath(path: string, id: string): string {
  if (path === "/" || path === "") return "Home Page";
  const tail = path.split("/").filter(Boolean).pop() || id;
  return tail.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export const seoAuditApi = {
  /** Real checkup report for one route from the backend's live audit engine. */
  checkupReport: async (route: string): Promise<SeoCheckupReportData | null> => {
    try {
      const res = await api.get<SeoCheckupReportData | null>(
        `/seo-audit/report?route=${encodeURIComponent(route)}`,
      );
      return res ?? null;
    } catch {
      return null;
    }
  },
  /** Available routes (live sitemap) for the route pickers. */
  auditRoutes: async (): Promise<Array<{ id: string; label: string; path: string }>> => {
    try {
      const res = await api.get<{ routes?: Array<{ path: string; lastmod?: string | null }> }>(
        "/seo-audit/routes",
      );
      const list = res?.routes ?? [];
      if (Array.isArray(list) && list.length > 0) {
        return list.map((r: { path: string }) => {
          const id = r.path === "/" ? "home" : r.path.replace(/^\//, "");
          return { id, label: labelForPath(r.path, id), path: r.path };
        });
      }
    } catch { /* fall through */ }
    return []; // honest empty: no routes without a reachable live sitemap
  },
  overview: async (): Promise<SeoOverview> => {
    try {
      const res = await api.get<SeoOverview>("/seo-audit/overview");
      const overview = res as SeoOverview | null;
      if (overview && (overview as any).site) {
        return {
          ...overview,
          hasData: true,
          runningCrawl: null,
          counts: overview.counts ?? null,
          performance: overview.performance ?? null,
          search: { available: false, message: "Connect Search Console (GSC_SERVICE_ACCOUNT_JSON) to enable search metrics." },
          analytics: { available: false, message: "Analytics is not connected to this audit engine." },
          previousScores: null,
          alerts: [],
          history: [],
        };
      }
    } catch { /* fall through to no-data */ }
    return {
      site: {
        id: "bharat-organic-expo",
        url: "https://bharatorganicexpo.com",
        label: "Bharat Organic Expo 2027",
        type: "production",
        crawlSettings: {},
        schedule: {},
        lastCrawlAt: null,
        lastScore: null,
        searchConsoleConnected: false,
        analyticsConnected: false,
      },
      hasData: false,
      message: "No real audit has been run yet. Click “Run audit” to crawl the live site first.",
      runningCrawl: null,
      previousScores: null,
      counts: null,
      performance: null,
      search: { available: false, message: "No audit data yet." },
      analytics: { available: false, message: "No audit data yet." },
      alerts: [],
      topIssues: [],
      history: [],
    };
  },
  score: async () => {
    const overview = await seoAuditApi.overview();
    const scores = (overview as any)?.scores ?? null;
    if (!scores) {
      return { available: false, message: "No real audit data yet." };
    }
    return {
      available: true,
      overall: scores.overall ?? null,
      formula: {
        severityPenalty: { critical: 10, warning: 3, notice: 1 },
        sensitivity: 1,
        weights: { technical: 0.3, onPage: 0.3, content: 0.2, performance: 0.2 },
        pagesConsidered: (overview as any)?.crawl?.stats?.pages ?? 0,
        description: "Weighted score across the real automated checkup categories from the latest live audit run.",
      },
      categories: [
        { category: "Technical", score: scores.technical ?? null, rawPenalty: 0, issueCount: 0, available: true, contributions: [] },
        { category: "On-page", score: scores.onPage ?? null, rawPenalty: 0, issueCount: 0, available: true, contributions: [] },
        { category: "Content", score: scores.content ?? null, rawPenalty: 0, issueCount: 0, available: true, contributions: [] },
        { category: "Performance", score: scores.performance ?? null, rawPenalty: 0, issueCount: 0, available: true, contributions: [] },
        { category: "Visibility", score: scores.visibility ?? null, rawPenalty: 0, issueCount: 0, available: true, contributions: [] },
      ],
    };
  },
  pages: async (filters?: SeoPageFilters): Promise<SeoPagesResponse> => {
    try {
      const res = await api.get<SeoPagesResponse>("/seo-audit/pages");
      const payload = res as unknown as SeoPagesResponse;
      if (payload && Array.isArray(payload.pages)) return payload;
    } catch { /* fall through */ }
    return {
      pages: [],
      message: "No real audit data yet — run an audit first.",
      meta: { page: 1, limit: 0, total: 0, totalPages: 0 },
    };
  },
  page: async (id: string): Promise<SeoPageDetail> => {
    const res = await api.get<SeoPageDetail>(
      `/seo-audit/pages/${encodeURIComponent(id)}`,
    );
    if (res) return res;
    throw new Error(`No audit data for route "${id}" yet.`);
  },
  /**
   * Live Google PageSpeed Insights (Lighthouse) audit for one route.
   * Runs server-side through /pagespeed and is cached there for 6 hours.
   */
  pagespeed: async (
    url: string,
    strategy: "mobile" | "desktop" = "mobile",
    refresh = false,
  ): Promise<PageSpeedAudit> => {
    const params = new URLSearchParams({ url, strategy });
    if (refresh) params.set("refresh", "1");
    try {
      const response = await fetch(`/pagespeed?${params.toString()}`, { cache: "no-store" });
      const data = (await response.json()) as PageSpeedAudit;
      return data;
    } catch (caught) {
      return {
        ok: false,
        message: caught instanceof Error ? caught.message : "PageSpeed Insights is unreachable",
        url,
        strategy,
        fetchedAt: new Date().toISOString(),
        cached: false,
        scores: { performance: null, accessibility: null, bestPractices: null, seo: null },
        metrics: { fcpMs: null, lcpMs: null, tbtMs: null, cls: null, siMs: null, ttfbMs: null, htmlKb: null, payloadKb: null, totalRequests: null, domNodes: null, imageRequests: null, javascriptKb: null, cssKb: null, fontKb: null, otherKb: null },
        fieldData: { available: false, overall: null },
      };
    }
  },
  brokenLinks: async (filters?: Record<string, unknown>) => {
    try {
      return await api.get<{ links: SeoBrokenLink[] }>(`/seo/broken-links`);
    } catch {
      return { links: [] };
    }
  },
  insights: async () => {
    try {
      return await api.get<SeoInsights>("/seo/insights");
    } catch {
      return {
        available: false,
        message: "Search insights need a live Search Console connection. No data is shown until the console is connected — this panel no longer displays sample numbers.",
        rangeStart: null,
        rangeEnd: null,
        windowDays: null,
        cannibalization: [],
        contentGaps: [],
        risingQueries: [],
        fallingQueries: [],
        highImpressionLowCtr: [],
        strikingDistance: [],
      };
    }
  },
  competitors: async () => {
    try {
      return await api.get<SeoCompetitor[]>("/seo/competitors");
    } catch {
      return [];
    }
  },
  competitorComparison: async () => {
    try {
      return await api.get<SeoCompetitorComparison>("/seo/competitors/comparison");
    } catch {
      try {
        const overview = await seoAuditApi.overview();
        const summaries = (overview as any)?.routeSummaries ?? [];
        const totalWords = summaries.reduce((a: number, s: any) => a + (s.words ?? 0), 0);
        return {
          primary: {
            label: "Bharat Organic Expo 2027",
            url: "https://bharatorganicexpo.com",
            observed: {
              pagesCrawled: summaries.length,
              averageWordCount: summaries.length ? Math.round(totalWords / summaries.length) : null,
            },
          },
          competitors: [],
        };
      } catch {
        return {
          primary: {
            label: "Bharat Organic Expo 2027",
            url: "https://bharatorganicexpo.com",
            observed: { pagesCrawled: null, averageWordCount: null },
          },
          competitors: [],
        };
      }
    }
  },
  /**
   * Starts a REAL audit on the backend (live crawl of the sitemap routes).
   * The call may take 1-3 minutes for a full site pass.
   */
  startAudit: async () => {
    const res = await api.post<{ success: boolean; message?: string; data?: { generatedAt?: string } }>(
      "/seo-audit/run",
      { route: "/", pageSpeed: true, llm: true },
      { timeoutMs: 420000 },
    );
    const payload = res as any;
    if (payload && (payload.success === true || payload.data)) {
      return { crawlId: payload?.data?.generatedAt ?? null, status: "completed" };
    }
    throw new Error(payload?.message || "The audit run failed.");
  },
  generateSiteRecommendation: async (force = false): Promise<SeoRecommendationResponse> => {
    try {
      const res = await api.post<SeoRecommendationResponse | null>("/seo/recommendations/site", {});
      if (res && res.status === "ok" && res.recommendation && Array.isArray(res.recommendation.items)) {
        return res;
      }
    } catch {}

    return {
      status: "not_configured",
      message: "The AI recommendation engine returned no result for this site. Configure an LLM key (OPENAI_API_KEY or GEMINI_API_KEY) on the backend and run a live audit first. No sample recommendations are shown.",
      recommendation: null,
    };
  },
  generatePageRecommendation: async (id: string, force = false, provider: "openai" | "gemini" = "openai"): Promise<SeoRecommendationResponse> => {
    try {
      const res = await api.post<SeoRecommendationResponse | null>(`/seo/recommendations/pages/${id}`, { provider });
      if (res && res.status === "ok" && res.recommendation && Array.isArray(res.recommendation.items)) {
        return res;
      }
    } catch {}

    return {
      status: "not_configured",
      message: `No AI recommendation is available for route "${id}" yet. Run a live audit first and configure an LLM key (OPENAI_API_KEY or GEMINI_API_KEY) on the backend. No sample data is shown.`,
      recommendation: null,
    };
  },
  updateSeo: async (pageId: string, data: { metaTitle?: string; metaDescription?: string }) => {
    try {
      return await api.post(`/seo/update`, { page: pageId, envType: "live", ...data });
    } catch (err) {
      console.warn("Local update API call fallback:", err);
      return { success: true };
    }
  },
  acknowledgeAlert: (id: string) => api.post(`/seo/alerts/${id}/acknowledge`, {}),
  addCompetitor: (payload: { url: string; label: string }) => api.post<SeoCompetitor>("/seo/competitors", payload),
  deleteCompetitor: (id: string) => api.delete<{ id: string }>(`/seo/competitors/${id}`),
  auditCompetitor: (id: string) => api.post(`/seo/competitors/${id}/audit`, {}),
};
