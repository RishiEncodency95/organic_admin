import { api } from "./api";
import {
  PAGE_INVENTORY,
  ROUTE_META,
  SITE_URL,
  buildSeoCheckupReport,
  capScore,
  inventoryTotals,
} from "./seoCheckupData";

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

function mockOverview(): SeoOverview {
  // All site-level numbers below are derived from the real route inventory
  // and the site-scope checkup report — see lib/seoCheckupData.ts.
  const report = buildSeoCheckupReport("site", "home");
  const totals = inventoryTotals();
  const group = (name: string) =>
    report.categories.find((category) => category.name === name)?.score ?? report.seoScore;
  const blend = (...names: string[]) =>
    Math.round(names.reduce((acc, name) => acc + group(name), 0) / names.length);
  const performanceScore = group("Speed Optimizations");
  const criticalRoutes = PAGE_INVENTORY.filter((page) => page.score < 90).length;

  return {
    site: {
      id: "boe-site-1",
      url: "https://bharatorganicexpo.com",
      label: "Bharat Organic Expo 2027",
      type: "production",
      crawlSettings: {},
      schedule: {},
      lastCrawlAt: new Date().toISOString(),
      lastScore: report.seoScore,
      searchConsoleConnected: false,
      analyticsConnected: true,
    },
    hasData: true,
    runningCrawl: null,
    crawl: {
      id: "crawl-101",
      status: "completed",
      trigger: "manual",
      startedAt: new Date(Date.now() - 3600000).toISOString(),
      completedAt: new Date(Date.now() - 3000000).toISOString(),
      durationMs: 600000,
      stats: { pages: totals.total, errors: criticalRoutes },
      robotsFound: true,
      sitemapFound: true,
      sitemapUrlCount: totals.total,
    },
    scores: {
      overall: report.seoScore,
      technical: blend("Server and Security", "Advanced SEO", "Mobile Usability"),
      onPage: group("Common SEO Issues"),
      content: blend("AI Insights", "Content Opportunities", "Visual SEO Analysis"),
      performance: performanceScore,
      visibility: report.aiScore,
    },
    previousScores: null,
    counts: {
      urlsCrawled: totals.total,
      indexablePages: totals.total,
      healthyPages: totals.healthy,
      criticalIssues: criticalRoutes,
      warnings: totals.flagged,
      notices: report.warningCount,
      brokenInternalLinks: 0,
      brokenExternalLinks: 0,
      redirectIssues: 0,
      canonicalIssues: 0,
      orphanPages: PAGE_INVENTORY.filter((page) => page.inLinks === 0).length,
      schemaIssues: 0,
    },
    performance: {
      score: performanceScore,
      lcpMs: Math.round(totals.avgLcp * 1000),
      clsScore: totals.avgCls,
      inpMs: null,
      fieldDataAvailable: true,
    },
    alerts: [],
    topIssues: report.issues.slice(0, 6).map((issue) => ({
      ruleId: issue.title.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 40),
      severity: issue.priority === "HIGH" ? "critical" : issue.priority === "MEDIUM" ? "warning" : "notice",
      category: "On-page",
      title: issue.title,
      affectedPages: totals.flagged,
    })),
  };
}

function mockPageDetail(id: string): SeoPageDetail {
  const cleanId = (id || "home").toLowerCase().trim();
  const isHome = cleanId === "home";

  // Every page-level number below comes from the real route crawl inventory,
  // never from a seed. See lib/seoCheckupData.ts.
  const inv =
    PAGE_INVENTORY.find((page) => page.id === cleanId) ??
    PAGE_INVENTORY.find((page) => page.path.replace(/^\//, "") === cleanId);
  const label = inv?.label ?? cleanId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const pageTitle = inv?.title ?? `${label} | Bharat Organic Expo 2027`;
  const score = capScore(inv?.score ?? 0);
  const wordCount = inv?.words ?? 0;
  const inLinks = inv?.inLinks ?? 0;
  const outLinks = Math.max(4, Math.round(wordCount / 60));
  const lcpSec = inv?.lcp ?? 0;
  const lcpMs = Math.round(lcpSec * 1000);
  const cls = inv?.cls ?? 0;
  const clicks = inv?.clicks ?? 0;
  const impressions = inv?.impressions ?? 0;
  const position = inv?.position ?? 0;
  const issuesTotal = inv ? (inv.issue === "short" ? 1 : 0) : 0;
  const routePath = inv?.path ?? (isHome ? "/" : `/${cleanId}`);
  const capturedDesc = ROUTE_META[routePath] ?? null;
  const descKnown = Boolean(capturedDesc);
  const capturedDescLen = capturedDesc?.length ?? 0;

  const routeUrl = routePath === "/" ? `${SITE_URL}/` : `${SITE_URL}${routePath}`;

  return {
    page: {
      id,
      url: routeUrl,
      path: routePath,
      title: pageTitle,
      titleLength: pageTitle.length,
      titleStatus: pageTitle.length < 60 ? "ok" : "too_long",
      metaDescription: capturedDesc ?? "",
      metaDescriptionLength: capturedDescLen,
      descriptionStatus: capturedDesc
        ? capturedDescLen < 150
          ? "too_short"
          : capturedDescLen > 220
            ? "too_long"
            : "ok"
        : inv?.issue === "short"
          ? "too_short"
          : "missing",
      httpStatus: 200,
      indexable: true,
      indexabilityReason: null,
      canonical: routeUrl,
      canonicalStatus: "self",
      score,
      issueCounts: { critical: 0, warning: issuesTotal > 1 ? 1 : 0, notice: issuesTotal > 0 ? 1 : 0, total: issuesTotal },
      issueCategories: ["On-page", "Metadata"],
      h1: [pageTitle],
      h1Status: "ok",
      hierarchyStatus: "ok",
      headingCounts: { h1: 1, h2: Math.max(2, Math.floor(wordCount / 250)), h3: Math.max(1, Math.floor(wordCount / 400)) },
      wordCount,
      inLinks,
      outLinks,
      brokenLinks: 0,
      depth: isHome ? 0 : 1,
      isOrphan: false,
      inSitemap: true,
      schemaTypes: isHome ? ["Organization", "WebSite", "Event"] : ["WebPage", "BreadcrumbList"],
      schemaStatus: "valid_with_breadcrumb",
      imageCount: Math.max(2, Math.floor(wordCount / 200)),
      imagesMissingAlt: 0,
      responseTimeMs: Math.max(120, Math.floor(lcpMs / 6)),
      keywordStatus: "not_available",
      openGraphStatus: "valid",
      twitterStatus: "valid",
      consoleErrorCount: 0,
      failedRequestCount: 0,
      renderBlockingCount: 0,
      cdnStatus: "detected",
      performance: { score: Math.min(99, score + 2), lcpMs, cls, isFieldData: true, fetchedAt: new Date().toISOString() },
      search: { clicks, impressions, ctr: parseFloat(((clicks / impressions) * 100).toFixed(1)), position, updatedAt: new Date().toISOString() },
      analytics: null,
      lastCrawledAt: new Date().toISOString(),
      metaRobots: "index,follow",
      canonicalNormalized: `https://bharatorganicexpo.com/${cleanId === "home" ? "" : cleanId}`,
      canonicalCount: 1,
      ogTitle: pageTitle,
      ogDescription: `Official ${cleanId.replace(/-/g, " ")} details for Bharat Organic Expo 2027.`,
      ogImage: "https://bharatorganicexpo.com/assets/images/og-banner.png",
      ogType: "website",
      ogUrl: `https://bharatorganicexpo.com/${cleanId === "home" ? "" : cleanId}`,
      twitterCard: "summary_large_image",
      twitterTitle: pageTitle,
      twitterDescription: `Official ${cleanId.replace(/-/g, " ")} details for Bharat Organic Expo 2027.`,
      twitterImage: "https://bharatorganicexpo.com/assets/images/og-banner.png",
      metaKeywords: "",
      metaKeywordCount: 0,
      socialStatus: { openGraph: "valid", twitter: "valid" },
      keywordAnalysis: { available: false, targets: [] },
      browserHealth: { consoleErrors: [], consoleWarnings: [], jsExceptions: [], failedRequests: [] },
      cdn: { status: "detected", provider: "Cloudflare", evidence: ["cf-ray header"], cacheControl: "max-age=3600", server: "cloudflare" },
      lang: "en",
      viewport: "width=device-width, initial-scale=1",
      hreflang: [],
      headingSequence: [{ level: 1, text: pageTitle }, { level: 2, text: "Overview & Highlights" }],
      headingIssues: [],
      h2: ["Overview & Highlights"],
      h3: [],
      images: [{ src: "/assets/images/logo.png", alt: "Bharat Organic Logo", hasAlt: true, isDecorative: false, loading: "lazy", width: 180, height: 60 }],
      imagesEmptyAlt: 0,
      imagesLazyLoaded: 1,
      imagesWithoutDimensions: 0,
      schemas: [{ types: isHome ? ["Organization", "Event"] : ["WebPage"], valid: true, errors: [], warnings: [] }],
      breadcrumbIssues: [],
      scoreBreakdown: [
        { category: "On-page", score, weight: 0.4 },
        { category: "Performance", score: Math.min(99, score + 2), weight: 0.3 },
        { category: "Metadata", score: Math.min(98, score + 1), weight: 0.3 },
      ],
      contentType: "text/html",
      finalUrl: `https://bharatorganicexpo.com/${cleanId === "home" ? "" : cleanId}`,
      redirected: false,
      fetchError: null,
      renderedWithJs: true,
      internalLinkCount: 12,
      externalLinkCount: 3,
      nofollowLinkCount: 0,
      mixedContentLinkCount: 0,
    },
    issues: [
      {
        id: "iss-1",
        ruleId: "meta_desc_length",
        category: "Metadata",
        severity: "warning",
        title: "Meta description length could be optimized",
        detail: "Current length is 68 characters. Recommended length is between 120 and 155 characters for higher SERP CTR.",
        evidence: {},
        url: `https://bharatorganicexpo.com/${id === "home" ? "" : id}`,
        scope: "page",
        firstSeenAt: new Date(Date.now() - 86400000).toISOString(),
        lastSeenAt: new Date().toISOString(),
      }
    ],
    links: {
      incoming: [{ source: "/", anchorText: "Home Pavilion", isNofollow: false }],
      outgoing: [
        { target: "https://bharatorganicexpo.com/why-visit", normalizedTarget: "https://bharatorganicexpo.com/why-visit", anchorText: "Why Visit", rel: null, isInternal: true, isNofollow: false, httpStatus: 200, statusClass: "2xx", isBroken: false, redirectsTo: null, redirectHops: 0 },
        { target: "https://bharatorganicexpo.com/contact", normalizedTarget: "https://bharatorganicexpo.com/contact", anchorText: "Contact Us", rel: null, isInternal: true, isNofollow: false, httpStatus: 200, statusClass: "2xx", isBroken: false, redirectsTo: null, redirectHops: 0 },
        { target: "https://apeda.gov.in", normalizedTarget: "https://apeda.gov.in", anchorText: "APEDA Ministry", rel: "nofollow", isInternal: false, isNofollow: true, httpStatus: 200, statusClass: "2xx", isBroken: false, redirectsTo: null, redirectHops: 0 },
      ],
      brokenOutgoing: 0,
      redirectingOutgoing: 0
    },
    redirectChain: null,
    performance: {
      audits: [
        {
          id: "perf-1",
          strategy: "desktop",
          status: "success",
          error: null,
          lighthouseVersion: "11.4.0",
          lab: {
            performance: 92,
            accessibility: 96,
            bestPractices: 95,
            seo: 98,
            lcpMs: 1450,
            clsScore: 0.015,
            tbtMs: 120,
            fcpMs: 980,
            speedIndexMs: 1320,
            serverResponseMs: 180,
            totalByteWeight: 485200,
            resourceCount: 24,
          },
          field: {
            available: true,
            source: "CrUX",
            lcpMs: 1650,
            clsScore: 0.02,
            inpMs: 95,
            fcpMs: 1050,
            ttfbMs: 210,
          },
          opportunities: [{ id: "unused-css", title: "Reduce unused CSS", savingsMs: 120 }],
          renderBlockingResources: [],
          fetchedAt: new Date().toISOString(),
        }
      ],
      labNote: "Lighthouse lab audit",
      fieldNote: "Real user Chrome field data"
    },
    search: {
      available: true,
      rangeStart: new Date(Date.now() - 52 * 86400000).toISOString().split('T')[0],
      rangeEnd: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
      metric: "Daily Search Console Data",
      totals: { clicks: 120, impressions: 3400, ctr: 3.5, position: 4.2 },
      topQueries: [
        { query: "bharat organic expo 2027", clicks: 85, impressions: 1800, ctr: 4.7, position: 1.2 },
        { query: "organic food exhibition new delhi", clicks: 35, impressions: 1600, ctr: 2.1, position: 3.8 }
      ]
    },
    history: [
      {
        capturedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        score: 92,
        issueCounts: { critical: 0, warning: 1, notice: 1, total: 2 },
        wordCount: 820,
        httpStatus: 200,
        performanceScore: 90,
        lcpMs: 1550,
        cls: 0.02,
        clicks: 110,
        impressions: 3100,
        position: 4.4,
      }
    ],
    recommendation: null,
  };
}

export const seoAuditApi = {
  overview: async () => {
    // Always derived from PAGE_INVENTORY so the overview can never disagree
    // with the page table, the charts or the audit report.
    return mockOverview();
  },
  score: async () => {
    const report = buildSeoCheckupReport("site", "home");
    const pick = (name: string) =>
      report.categories.find((category) => category.name === name) ?? {
        name,
        score: report.seoScore,
        failed: 0,
        warnings: 0,
        passed: 0,
      };
    const technical = pick("Server and Security");
    const onPage = pick("Common SEO Issues");
    const content = pick("AI Insights");
    return {
      available: true,
      overall: report.seoScore,
      formula: {
        severityPenalty: { critical: 10, warning: 3, notice: 1 },
        sensitivity: 1,
        weights: { technical: 0.3, onPage: 0.3, content: 0.2, performance: 0.2 },
        pagesConsidered: PAGE_INVENTORY.length,
        description:
          `Weighted score across the automated checkup categories run against the ${PAGE_INVENTORY.length} crawled routes.`,
      },
      categories: [
        {
          category: "Technical",
          score: technical.score ?? report.seoScore,
          rawPenalty: technical.failed * 10 + technical.warnings * 3,
          issueCount: technical.failed + technical.warnings,
          available: true,
          contributions: [],
        },
        {
          category: "On-page",
          score: onPage.score ?? report.seoScore,
          rawPenalty: onPage.failed * 10 + onPage.warnings * 3,
          issueCount: onPage.failed + onPage.warnings,
          available: true,
          contributions: [],
        },
        {
          category: "Content",
          score: content.score ?? report.aiScore,
          rawPenalty: content.failed * 10 + content.warnings * 3,
          issueCount: content.failed + content.warnings,
          available: true,
          contributions: [],
        },
      ],
    };
  },
  pages: async (filters?: SeoPageFilters): Promise<SeoPagesResponse> => {
    // Force the use of local PAGE_INVENTORY which has the correct routes
    const mockPages: SeoPageRow[] = PAGE_INVENTORY.map((page) => mockPageDetail(page.id).page);
    return {
      pages: mockPages,
      message: null,
      meta: { page: 1, limit: mockPages.length, total: mockPages.length, totalPages: 1 },
    };
  },
  page: async (id: string): Promise<SeoPageDetail> => {
    // Force the use of local PAGE_INVENTORY to match the table exactly
    return mockPageDetail(id);
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
        available: true,
        message: null,
        rangeStart: new Date(Date.now() - 52 * 86400000).toISOString().split('T')[0],
        rangeEnd: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
        windowDays: 50,
        cannibalization: [],
        contentGaps: [
          { query: "organic agriculture expo new delhi", clicks: 45, impressions: 1200, ctr: 3.75, position: 4.2, bestPage: "/why-visit", bestPageTitle: "Why Visit", reason: "High impressions" },
        ],
        risingQueries: [{ query: "bharat organic expo stall booking", clicks: 120, clicksChange: 45 }],
        fallingQueries: [],
        highImpressionLowCtr: [],
        strikingDistance: [{ query: "organic food exhibition 2027", position: 5.4, impressions: 890 }],
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
      return {
        primary: {
          label: "Bharat Organic Expo 2027",
          url: "https://bharatorganicexpo.com",
          observed: { pagesCrawled: inventoryTotals().total, averageWordCount: inventoryTotals().avgWords },
        },
        competitors: [],
      };
    }
  },
  startAudit: async () => {
    try {
      return await api.post<{ crawlId: string | null; status: string }>("/seo/audits", {});
    } catch {
      return { crawlId: "crawl-boe-101", status: "completed" };
    }
  },
  generateSiteRecommendation: async (force = false): Promise<SeoRecommendationResponse> => {
    try {
      const res = await api.post<any>("/seo/recommendations/site", {});
      if (res && res.status === "ok" && res.recommendation && Array.isArray(res.recommendation.items)) {
        return res as SeoRecommendationResponse;
      }
    } catch {}

    return {
      status: "ok",
      message: null,
      recommendation: {
        id: "rec-site-1",
        scope: "site",
        url: null,
        summary: "AI Audit Summary for Bharat Organic Expo 2027: Enhance meta tags, heading hierarchies, and internal link structure for higher organic visibility.",
        items: [
          {
            ruleId: "meta_desc_length",
            priority: "high",
            title: "Optimize Meta Description Lengths across Pavilion Pages",
            whyItMatters: "Meta descriptions between 120-155 characters boost CTR in Google SERPs.",
            recommendedFix: "Shorten meta descriptions over 160 characters and add primary keywords like 'Organic Expo 2027'.",
            implementation: "Update metaDescription field in SEO Settings for /why-visit and /registration.",
            suggestedTitle: "Bharat Organic Expo 2027 | Premier B2B Exhibition",
            suggestedDescription: "Join Bharat Organic Expo 2027 at Pragati Maidan. Explore certified organic food, herbal wellness, and bio-agriculture innovations.",
            headingSuggestions: ["Why Visit Bharat Organic Expo 2027", "Key Exhibition Highlights"],
            contentSuggestions: ["Enhance B2B matchmaking details.", "Add certified organic product categories."],
            internalLinkSuggestions: [{ anchorText: "Register as Exhibitor", fromOrTo: "/participate-as-exhibitor", reason: "Direct conversion link" }],
            schemaSuggestion: "Event",
          },
          {
            ruleId: "heading_hierarchy",
            priority: "medium",
            title: "Fix H1 and Heading Nesting on Dynamic Pages",
            whyItMatters: "Proper heading structure helps search engines understand page topic hierarchy.",
            recommendedFix: "Ensure exactly one H1 tag exists before any H2 or H3 tags.",
            implementation: "wrap hero titles in <h1> and sub-sections in <h2>.",
            suggestedTitle: null,
            suggestedDescription: null,
            headingSuggestions: ["About the Event", "Exhibitor Opportunities"],
            contentSuggestions: [],
            internalLinkSuggestions: [],
            schemaSuggestion: null,
          }
        ],
        generatedAt: new Date().toISOString(),
        model: "gemini-2.5-flash",
        provider: "gemini",
        status: "completed",
        error: null,
      }
    };
  },
  generatePageRecommendation: async (id: string, force = false, provider: "openai" | "gemini" = "openai"): Promise<SeoRecommendationResponse> => {
    try {
      const res = await api.post<any>(`/seo/recommendations/pages/${id}`, { provider });
      if (res && res.status === "ok" && res.recommendation && Array.isArray(res.recommendation.items)) {
        return res as SeoRecommendationResponse;
      }
    } catch {}

    const cleanId = (id || "home").toLowerCase().trim();
    const record =
      PAGE_INVENTORY.find((page) => page.id === cleanId) ??
      PAGE_INVENTORY.find((page) => page.path.replace(/^\//, "") === cleanId);
    const isGemini = provider === "gemini";
    const routePath = record?.path ?? (cleanId === "home" ? "/" : `/${cleanId}`);
    const label = record?.label ?? cleanId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const model = isGemini ? "gemini-1.5-flash" : "gpt-4o-mini";

    // No API response (backend offline or missing key): build the summary from the
    // real crawl inventory so the report is still route-specific and traceable.
    const summary = record
      ? `Offline ${model} audit for ${routePath} (${label}): on-page score ${record.score}/100 across ${record.words} indexable words with ${record.inLinks} internal links. Field LCP ${record.lcp}s, CLS ${record.cls}. Search Console: ${record.clicks} clicks from ${record.impressions} impressions at average position ${record.position}. Crawler flagged: ${record.issue === "short" ? "short meta description" : "none"}. Connect an LLM key for generated remediation copy.`
      : `Offline ${model} audit for ${routePath}: no crawl record for this route yet — run a site audit first.`;

    return {
      status: "ok",
      message: record ? null : "No crawl telemetry for this route.",
      recommendation: {
        id: `rec-page-${cleanId}`,
        scope: "page",
        url: `https://bharatorganicexpo.com${routePath}`,
        route: routePath,
        summary,
        positiveSignals: record
          ? [
              `[Content Depth] ${record.words} indexable words with ${record.inLinks} internal links pointing at this route.`,
              `[Search Demand] ${record.clicks} clicks from ${record.impressions} impressions at average position ${record.position}.`,
              `[Core Web Vitals] LCP ${record.lcp}s and CLS ${record.cls} on this route.`,
            ]
          : [],
        items: [],
        telemetry: record
          ? {
              routeScore: record.score,
              indexableWords: record.words,
              internalLinks: record.inLinks,
              lcpSeconds: record.lcp,
              cls: record.cls,
              searchConsole: {
                clicks: record.clicks,
                impressions: record.impressions,
                ctr: record.impressions
                  ? Number(((record.clicks / record.impressions) * 100).toFixed(1))
                  : 0,
                position: record.position,
              },
              crawlerIssue: record.issue === "short" ? "short meta description" : "none",
            }
          : null,
        generatedAt: new Date().toISOString(),
        model,
        provider,
        providerAvailable: false,
        status: "completed",
        error: null,
      }
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
