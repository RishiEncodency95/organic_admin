import { api } from "./api";

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

export interface SeoListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SeoPagesResponse {
  pages: SeoPageRow[];
  crawlId: string | null;
  message: string | null;
  meta: SeoListMeta;
}

export interface SeoPageFilters {
  search?: string;
  status?: "2xx" | "3xx" | "4xx" | "5xx" | "error";
  indexable?: boolean;
  severity?: SeoSeverity;
  issueCategory?: string;
  hasBrokenLinks?: boolean;
  orphan?: boolean;
  inSitemap?: boolean;
  minScore?: number;
  maxScore?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  page?: number;
  limit?: number;
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
    keywordAnalysis: { available: boolean; targets: Array<{
      keyword: string; source: string; presentInTitle: boolean; presentInMetaDescription: boolean;
      presentInH1: boolean; presentInHeadings: boolean; presentInOpeningContent: boolean;
      presentInImageAlt: boolean; presentInInternalAnchor: boolean; exactMentions: number;
      totalWordCount: number; densityPercent: number;
    }> };
    browserHealth: Record<"consoleErrors" | "consoleWarnings" | "jsExceptions" | "failedRequests", Array<{
      url: string; message: string; type: string; resourceUrl: string | null; resourceType: string | null;
      statusCode: number | null; timestamp: string;
    }>>;
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

export interface SeoRecommendationItem {
  ruleId: string | null;
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

export interface SeoRecommendation {
  id: string;
  scope: string;
  url: string | null;
  provider: string;
  model: string;
  summary: string | null;
  items: SeoRecommendationItem[];
  status: string;
  error: string | null;
  generatedAt: string;
}

export interface SeoRecommendationResponse {
  status: "ok" | "cached" | "not_configured" | "error" | "no_data";
  message: string | null;
  recommendation: SeoRecommendation | null;
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

export interface SeoRedirectChainRow {
  id: string;
  source: string;
  hops: Array<{ url: string; status: number | null }>;
  hopCount: number;
  finalUrl: string | null;
  finalStatus: number | null;
  isLoop: boolean;
  endsInError: boolean;
  issues: string[];
  severity: string;
  checkedAt: string;
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
  risingQueries: SeoQueryTrend[];
  fallingQueries: SeoQueryTrend[];
  highImpressionLowCtr: Array<{ query: string; impressions: number; clicks: number; ctr: number; position: number; bestPage: string | null }>;
  strikingDistance: SeoQueryTrend[];
  pagesLosingClicks: Array<{ page: string; clicks: number; previousClicks: number; change: number }>;
}

export interface SeoQueryTrend {
  query: string;
  clicks: number;
  previousClicks: number;
  impressions: number;
  previousImpressions: number;
  position: number;
  previousPosition: number;
  clicksChange: number;
  positionChange: number;
}

export interface SeoCrawlSummary {
  id: string;
  status: string;
  trigger: string;
  startedAt: string | null;
  completedAt: string | null;
  durationMs: number | null;
  stats: Record<string, number>;
  scores: SeoScores;
  error: string | null;
  log: Array<{ at: string; level: string; message: string }>;
}

export interface SeoAlert {
  id: string;
  type: string;
  severity: SeoSeverity;
  title: string;
  message: string;
  data: Record<string, unknown>;
  status: string;
  createdAt: string;
  acknowledgedAt: string | null;
}

export interface SeoCompetitor {
  id: string;
  url: string;
  label: string;
  isActive: boolean;
  lastCrawlAt: string | null;
  lastScore: number | null;
}

export interface SeoCompetitorProfile {
  siteId: string;
  label: string;
  url: string;
  lastCrawlAt: string | null;
  observed: Record<string, number | string[] | null>;
  scores: Record<string, number | null> | null;
  performance: { score: number | null; lcpMs: number | null; clsScore: number | null; fieldDataAvailable: boolean } | null;
}

export interface SeoCompetitorComparison {
  dataSourceNotes: { observed: string; searchAndTraffic: string };
  primary: SeoCompetitorProfile;
  competitors: SeoCompetitorProfile[];
  pendingCrawl: Array<{ siteId: string; label: string }>;
}

function toQuery(filters: Record<string, unknown>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === "") continue;
    params.append(key, String(value));
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export const seoAuditApi = {
  site: () => api.get<SeoOverview["site"] & { thresholds: Record<string, number> }>("/seo/site"),
  updateSite: (payload: Record<string, unknown>) => api.patch<unknown>("/seo/site", payload),

  overview: () => api.get<SeoOverview>("/seo/overview"),
  score: () => api.get<SeoScoreExplanation>("/seo/score"),
  history: () => api.get<SeoOverview["history"]>("/seo/history"),
  insights: () => api.get<SeoInsights>("/seo/insights"),

  startAudit: (options: { skipPerformance?: boolean; skipGoogleData?: boolean } = {}) =>
    api.post<{ crawlId: string | null; status: string }>("/seo/audits", options),
  crawls: () => api.get<SeoCrawlSummary[]>("/seo/audits"),
  crawl: (id: string) => api.get<SeoCrawlSummary>(`/seo/audits/${id}`),

  pages: (filters: SeoPageFilters = {}) =>
    api.get<SeoPagesResponse>(`/seo/pages${toQuery(filters as Record<string, unknown>)}`),
  page: (id: string) => api.get<SeoPageDetail>(`/seo/pages/${id}`),

  issues: (filters: Record<string, unknown> = {}) =>
    api.get<{ issues: SeoIssue[] }>(`/seo/issues${toQuery(filters)}`),
  brokenLinks: (filters: Record<string, unknown> = {}) =>
    api.get<{ links: SeoBrokenLink[] }>(`/seo/broken-links${toQuery(filters)}`),
  redirectChains: () => api.get<SeoRedirectChainRow[]>("/seo/redirect-chains"),

  alerts: (status?: string) => api.get<SeoAlert[]>(`/seo/alerts${status ? `?status=${status}` : ""}`),
  acknowledgeAlert: (id: string) => api.post<unknown>(`/seo/alerts/${id}/acknowledge`, {}),

  recommendations: (scope?: string) =>
    api.get<SeoRecommendation[]>(`/seo/recommendations${scope ? `?scope=${scope}` : ""}`),
  generateSiteRecommendation: (force = false) =>
    api.post<SeoRecommendationResponse>(`/seo/recommendations/site${force ? "?force=true" : ""}`, {}, { timeoutMs: 100_000 }),
  generatePageRecommendation: (id: string, force = false) =>
    api.post<SeoRecommendationResponse>(`/seo/recommendations/pages/${id}${force ? "?force=true" : ""}`, {}, { timeoutMs: 100_000 }),
  generateCannibalization: (force = false) =>
    api.post<SeoRecommendationResponse>(`/seo/recommendations/cannibalization${force ? "?force=true" : ""}`, {}, { timeoutMs: 100_000 }),
  generateContentGap: (force = false) =>
    api.post<SeoRecommendationResponse>(`/seo/recommendations/content-gap${force ? "?force=true" : ""}`, {}, { timeoutMs: 100_000 }),
  competitors: () => api.get<SeoCompetitor[]>("/seo/competitors"),
  addCompetitor: (payload: { url: string; label: string }) => api.post<SeoCompetitor>("/seo/competitors", payload),
  deleteCompetitor: (id: string) => api.delete<{ id: string }>(`/seo/competitors/${id}`),
  auditCompetitor: (id: string) => api.post<{ crawlId: string | null; status: string }>(`/seo/competitors/${id}/audit`, {}),
  competitorComparison: () => api.get<SeoCompetitorComparison>("/seo/competitors/comparison"),
};
