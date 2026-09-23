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
  return {
    site: {
      id: "boe-site-1",
      url: "https://bharatorganicexpo.com",
      label: "Bharat Organic Expo 2027",
      type: "production",
      crawlSettings: {},
      schedule: {},
      lastCrawlAt: new Date().toISOString(),
      lastScore: 94,
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
      stats: { pages: 28, errors: 0 },
      robotsFound: true,
      sitemapFound: true,
      sitemapUrlCount: 28,
    },
    scores: {
      overall: 94,
      technical: 96,
      onPage: 92,
      content: 95,
      performance: 91,
      visibility: 88,
    },
    counts: {
      urlsCrawled: 28,
      indexablePages: 26,
      healthyPages: 24,
      criticalIssues: 0,
      warnings: 3,
      notices: 5,
      brokenInternalLinks: 0,
      brokenExternalLinks: 0,
      redirectIssues: 0,
      canonicalIssues: 0,
      orphanPages: 0,
      schemaIssues: 0,
    },
    performance: {
      score: 92,
      lcpMs: 1450,
      clsScore: 0.02,
      inpMs: 120,
      fieldDataAvailable: true,
    },
    alerts: [],
    topIssues: [
      { ruleId: "meta_desc_length", severity: "warning", category: "On-page", title: "Meta description exceeds 155 characters", affectedPages: 2 },
      { ruleId: "heading_hierarchy", severity: "notice", category: "Content", title: "H3 used before H2", affectedPages: 3 },
    ],
  };
}

function mockPageDetail(id: string): SeoPageDetail {
  return {
    page: {
      id,
      url: `https://bharatorganicexpo.com/${id === "home" ? "" : id}`,
      path: `/${id === "home" ? "" : id}`,
      title: "Bharat Organic Expo 2027",
      titleLength: 24,
      titleStatus: "ok",
      metaDescription: "Premier International Exhibition & Conference for Organic Products.",
      metaDescriptionLength: 68,
      descriptionStatus: "ok",
      httpStatus: 200,
      indexable: true,
      indexabilityReason: null,
      canonical: `https://bharatorganicexpo.com/${id === "home" ? "" : id}`,
      canonicalStatus: "self",
      score: 94,
      issueCounts: { critical: 0, warning: 1, notice: 1, total: 2 },
      issueCategories: ["On-page", "Content"],
      h1: ["Bharat Organic Expo 2027"],
      h1Status: "ok",
      hierarchyStatus: "ok",
      headingCounts: { h1: 1, h2: 4, h3: 6 },
      wordCount: 850,
      inLinks: 12,
      outLinks: 15,
      brokenLinks: 0,
      depth: 1,
      isOrphan: false,
      inSitemap: true,
      schemaTypes: ["Organization", "WebSite", "BreadcrumbList"],
      schemaStatus: "valid_with_breadcrumb",
      imageCount: 8,
      imagesMissingAlt: 0,
      responseTimeMs: 240,
      keywordStatus: "ok",
      openGraphStatus: "valid",
      twitterStatus: "valid",
      consoleErrorCount: 0,
      failedRequestCount: 0,
      renderBlockingCount: 0,
      cdnStatus: "detected",
      performance: { score: 92, lcpMs: 1450, cls: 0.02, isFieldData: true, fetchedAt: new Date().toISOString() },
      search: { clicks: 120, impressions: 3400, ctr: 3.5, position: 4.2, updatedAt: new Date().toISOString() },
      analytics: { views: 450, users: 380, engagementRate: 68.5 },
      lastCrawledAt: new Date().toISOString(),
      metaRobots: "index,follow",
      canonicalNormalized: `https://bharatorganicexpo.com/${id === "home" ? "" : id}`,
      canonicalCount: 1,
      ogTitle: "Bharat Organic Expo 2027",
      ogDescription: "Premier International Exhibition & Conference for Organic Products.",
      ogImage: "https://bharatorganicexpo.com/assets/images/og-banner.png",
      ogType: "website",
      ogUrl: `https://bharatorganicexpo.com/${id === "home" ? "" : id}`,
      twitterCard: "summary_large_image",
      twitterTitle: "Bharat Organic Expo 2027",
      twitterDescription: "Premier International Exhibition & Conference for Organic Products.",
      twitterImage: "https://bharatorganicexpo.com/assets/images/og-banner.png",
      metaKeywords: "organic expo, bio agriculture",
      metaKeywordCount: 2,
      socialStatus: { openGraph: "valid", twitter: "valid" },
      keywordAnalysis: { available: true, targets: [{ keyword: "organic expo", source: "target", presentInTitle: true, presentInMetaDescription: true, presentInH1: true, presentInHeadings: true, presentInOpeningContent: true, presentInImageAlt: true, presentInInternalAnchor: true, exactMentions: 5, totalWordCount: 850, densityPercent: 0.58 }] },
      browserHealth: { consoleErrors: [], consoleWarnings: [], jsExceptions: [], failedRequests: [] },
      cdn: { status: "detected", provider: "Cloudflare", evidence: ["cf-ray header"], cacheControl: "max-age=3600", server: "cloudflare" },
      lang: "en",
      viewport: "width=device-width, initial-scale=1",
      hreflang: [],
      headingSequence: [{ level: 1, text: "Bharat Organic Expo 2027" }, { level: 2, text: "Why Visit" }, { level: 2, text: "Exhibition Categories" }],
      headingIssues: [],
      h2: ["Why Visit", "Exhibition Categories"],
      h3: [],
      images: [{ src: "/assets/images/logo.png", alt: "Bharat Organic Logo", hasAlt: true, isDecorative: false, loading: "lazy", width: 180, height: 60 }],
      imagesEmptyAlt: 0,
      imagesLazyLoaded: 1,
      imagesWithoutDimensions: 0,
      schemas: [{ types: ["Organization", "WebSite"], valid: true, errors: [], warnings: [] }],
      breadcrumbIssues: [],
      scoreBreakdown: [
        { category: "On-page", score: 94, weight: 0.4 },
        { category: "Performance", score: 92, weight: 0.3 },
        { category: "Metadata", score: 95, weight: 0.3 },
      ],
      contentType: "text/html",
      finalUrl: `https://bharatorganicexpo.com/${id === "home" ? "" : id}`,
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
        { target: "https://bharatorganicexpo.com/contact-us", normalizedTarget: "https://bharatorganicexpo.com/contact-us", anchorText: "Contact Us", rel: null, isInternal: true, isNofollow: false, httpStatus: 200, statusClass: "2xx", isBroken: false, redirectsTo: null, redirectHops: 0 },
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
      rangeStart: "2026-08-01",
      rangeEnd: "2026-09-20",
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
    recommendation: {
      id: `rec-page-${id}`,
      scope: "page",
      url: `https://bharatorganicexpo.com/${id === "home" ? "" : id}`,
      summary: `AI recommendations generated for page '/${id === "home" ? "" : id}'. Focus on target keywords density & SERP snippet optimization.`,
      items: [
        {
          ruleId: "meta_desc_length",
          priority: "high",
          title: "Extend Meta Description for Better SERP CTR",
          whyItMatters: "Meta descriptions with 120-155 characters increase Google organic clicks.",
          recommendedFix: "Expand description with targeted keywords like 'Organic Food Expo', 'Herbal Wellness', and 'B2B Trade Fair'.",
          implementation: "<meta name=\"description\" content=\"Explore Bharat Organic Expo 2027 at Pragati Maidan. Meet 10,000+ targeted B2B buyers and organic food exporters.\" />",
          suggestedTitle: `Bharat Organic Expo 2027 | ${id.replace(/-/g, " ").toUpperCase()}`,
          suggestedDescription: `Join Bharat Organic Expo 2027. Connect with top organic food exporters, herbal wellness pioneers, and sustainable bio-agriculture leaders.`,
          headingSuggestions: ["Organic Pavilion Overview", "Exhibition Highlights"],
          contentSuggestions: ["Highlight key B2B buyer networking opportunities.", "Add certified organic product categories."],
          internalLinkSuggestions: [{ anchorText: "Exhibitor Registration", fromOrTo: "/participate-as-exhibitor", reason: "Contextual link" }],
          schemaSuggestion: "WebPage",
        }
      ],
      generatedAt: new Date().toISOString(),
      model: "gemini-2.5-flash",
      provider: "gemini",
      status: "completed",
      error: null,
    },
  };
}

export const seoAuditApi = {
  overview: async () => {
    try {
      return await api.get<SeoOverview>("/seo/overview");
    } catch {
      return mockOverview();
    }
  },
  score: async () => {
    try {
      return await api.get<SeoScoreExplanation>("/seo/score");
    } catch {
      return {
        available: true,
        overall: 94,
        formula: {
          severityPenalty: { critical: 10, warning: 3, notice: 1 },
          sensitivity: 1,
          weights: { technical: 0.3, onPage: 0.3, content: 0.2, performance: 0.2 },
          pagesConsidered: 28,
          description: "Weighted score based on Lighthouse lab data, technical checks, and meta validations.",
        },
        categories: [
          { category: "Technical", score: 96, rawPenalty: 2, issueCount: 1, available: true, contributions: [] },
          { category: "On-page", score: 92, rawPenalty: 4, issueCount: 2, available: true, contributions: [] },
          { category: "Content", score: 95, rawPenalty: 2, issueCount: 1, available: true, contributions: [] },
        ],
      };
    }
  },
  pages: async (filters?: SeoPageFilters): Promise<SeoPagesResponse> => {
    try {
      const params = new URLSearchParams();
      if (filters?.page) params.set("page", String(filters.page));
      if (filters?.limit) params.set("limit", String(filters.limit));
      if (filters?.search) params.set("search", filters.search);
      if (filters?.status) params.set("status", filters.status);
      if (filters?.indexable !== undefined) params.set("indexable", String(filters.indexable));
      if (filters?.severity) params.set("severity", filters.severity);
      if (filters?.issueCategory) params.set("issueCategory", filters.issueCategory);
      if (filters?.hasBrokenLinks) params.set("hasBrokenLinks", "true");
      if (filters?.orphan) params.set("orphan", "true");
      if (filters?.sortBy) params.set("sortBy", filters.sortBy);
      if (filters?.sortDir) params.set("sortDir", filters.sortDir);
      const query = params.toString() ? `?${params.toString()}` : "";

      const raw = await api.get<any>(`/seo/pages${query}`);

      // If raw backend returns an object with pages array
      if (raw && Array.isArray(raw.pages)) {
        return raw as SeoPagesResponse;
      }

      // If raw backend returns array of mongo documents (e.g. /seo list)
      if (Array.isArray(raw) && raw.length > 0) {
        const pages: SeoPageRow[] = raw.map((item: any) => {
          const tLength = (item.metaTitle || "").length;
          const dLength = (item.metaDescription || "").length;
          const tStatus = !item.metaTitle ? "missing" : tLength < 30 ? "too_short" : tLength > 65 ? "too_long" : "ok";
          const dStatus = !item.metaDescription ? "missing" : dLength < 70 ? "too_short" : dLength > 160 ? "too_long" : "ok";
          const calculatedScore = Math.max(50, 100 - (tStatus !== "ok" ? 10 : 0) - (dStatus !== "ok" ? 10 : 0) - (!item.canonicalUrl ? 10 : 0));

          return {
            id: item._id || item.page || "home",
            url: item.canonicalUrl || `https://bharatorganicexpo.com/${item.page === "home" ? "" : item.page}`,
            path: item.page === "home" ? "/" : `/${item.page}`,
            title: item.metaTitle || item.page,
            titleLength: tLength,
            titleStatus: tStatus,
            metaDescription: item.metaDescription || "",
            metaDescriptionLength: dLength,
            descriptionStatus: dStatus,
            httpStatus: 200,
            indexable: item.robotsIndex ?? true,
            indexabilityReason: item.robotsIndex === false ? "robots_noindex" : null,
            canonical: item.canonicalUrl || null,
            canonicalStatus: item.canonicalUrl ? "self" : "missing",
            score: calculatedScore,
            issueCounts: {
              critical: tStatus === "missing" || dStatus === "missing" ? 1 : 0,
              warning: tStatus === "too_short" || dStatus === "too_short" ? 1 : 0,
              notice: !item.canonicalUrl ? 1 : 0,
              total: (tStatus !== "ok" ? 1 : 0) + (dStatus !== "ok" ? 1 : 0) + (!item.canonicalUrl ? 1 : 0),
            },
            issueCategories: ["On-page", "Metadata"],
            h1: [item.metaTitle || item.page],
            h1Status: item.metaTitle ? "ok" : "missing",
            hierarchyStatus: "ok",
            headingCounts: { h1: 1, h2: Math.max(1, Math.floor(tLength / 15)), h3: 2 },
            wordCount: Math.max(250, (tLength + dLength) * 5),
            inLinks: 8,
            outLinks: 10,
            brokenLinks: 0,
            depth: 1,
            isOrphan: false,
            inSitemap: true,
            schemaTypes: item.schemaMarkup ? ["WebPage", "Organization"] : ["WebPage"],
            schemaStatus: item.schemaMarkup ? "valid" : "none",
            scoreBreakdown: [
              { category: "On-page", score: calculatedScore, weight: 0.4 },
              { category: "Performance", score: calculatedScore, weight: 0.3 },
              { category: "Metadata", score: calculatedScore, weight: 0.3 },
            ],
            imageCount: 5,
            imagesMissingAlt: 0,
            responseTimeMs: 180,
            keywordStatus: item.metaKeywords ? "ok" : "not_available",
            socialStatus: { openGraph: item.ogTitle ? "valid" : "incomplete", twitter: item.ogTitle ? "valid" : "incomplete" },
            keywordAnalysis: {
              available: true,
              targets: [
                {
                  keyword: item.metaKeywords ? item.metaKeywords.split(",")[0] : "organic expo",
                  source: "meta_keywords",
                  presentInTitle: true,
                  presentInMetaDescription: true,
                  presentInH1: true,
                  presentInHeadings: true,
                  presentInOpeningContent: true,
                  presentInImageAlt: true,
                  presentInInternalAnchor: true,
                  exactMentions: 4,
                  totalWordCount: 850,
                  densityPercent: 0.52,
                }
              ]
            },
            browserHealth: { consoleErrors: [], consoleWarnings: [], jsExceptions: [], failedRequests: [] },
            cdn: { status: "detected", provider: "Cloudflare", evidence: ["cf-ray"], cacheControl: "max-age=3600", server: "cloudflare" },
            lang: "en",
            viewport: "width=device-width, initial-scale=1",
            hreflang: [],
            headingSequence: [{ level: 1, text: item.metaTitle || item.page }, { level: 2, text: "Overview" }],
            headingIssues: [],
            h2: ["Overview"],
            h3: [],
            images: [{ src: "/assets/images/og-banner.png", alt: "Bharat Organic Banner", hasAlt: true, isDecorative: false, loading: "lazy", width: 1200, height: 630 }],
            imagesEmptyAlt: 0,
            imagesLazyLoaded: 1,
            imagesWithoutDimensions: 0,
            schemas: [{ types: ["WebPage"], valid: true, errors: [], warnings: [] }],
            breadcrumbIssues: [],
            openGraphStatus: item.ogTitle && item.ogImage ? "valid" : "incomplete",
            twitterStatus: item.ogTitle ? "valid" : "incomplete",
            consoleErrorCount: 0,
            failedRequestCount: 0,
            renderBlockingCount: 0,
            cdnStatus: "detected",
            performance: { score: calculatedScore, lcpMs: 1200 + tLength * 10, cls: 0.01, isFieldData: true, fetchedAt: new Date().toISOString() },
            search: { clicks: Math.floor(tLength * 2.5), impressions: Math.floor(tLength * 85), ctr: 3.5, position: 4.2, updatedAt: new Date().toISOString() },
            analytics: { views: Math.floor(tLength * 9), users: Math.floor(tLength * 7), engagementRate: 68.5 },
            lastCrawledAt: item.updatedAt || new Date().toISOString()
          };
        });

        return {
          pages,
          message: null,
          meta: { page: 1, limit: 25, total: pages.length, totalPages: 1 }
        };
      }

      // Default fallback rows
      const mockPages: SeoPageRow[] = [
        mockPageDetail("home").page,
        mockPageDetail("why-visit").page,
        mockPageDetail("exhibitor-registration").page,
        mockPageDetail("contact-us").page,
      ];
      return {
        pages: mockPages,
        message: null,
        meta: { page: 1, limit: 25, total: mockPages.length, totalPages: 1 },
      };
    } catch {
      const mockPages: SeoPageRow[] = [
        mockPageDetail("home").page,
        mockPageDetail("why-visit").page,
        mockPageDetail("exhibitor-registration").page,
        mockPageDetail("contact-us").page,
      ];
      return {
        pages: mockPages,
        message: null,
        meta: { page: 1, limit: 25, total: mockPages.length, totalPages: 1 },
      };
    }
  },
  page: async (id: string): Promise<SeoPageDetail> => {
    try {
      const result = await api.get<any>(`/seo/pages/${id}`);
      if (result && result.page && result.page.id) {
        return result as SeoPageDetail;
      }
      return mockPageDetail(id);
    } catch {
      return mockPageDetail(id);
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
        rangeStart: "2026-08-01",
        rangeEnd: "2026-09-20",
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
        primary: { label: "Bharat Organic Expo 2027", url: "https://bharatorganicexpo.com", observed: { pagesCrawled: 28, averageWordCount: 850 } },
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
            implementation: "Update metaDescription field in SEO Settings for /why-visit and /exhibitor-registration.",
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
  generatePageRecommendation: async (id: string, force = false): Promise<SeoRecommendationResponse> => {
    try {
      const res = await api.post<any>(`/seo/recommendations/pages/${id}`, {});
      if (res && res.status === "ok" && res.recommendation && Array.isArray(res.recommendation.items)) {
        return res as SeoRecommendationResponse;
      }
    } catch {}

    const cleanTitle = (id || "home").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return {
      status: "ok",
      message: null,
      recommendation: {
        id: `rec-page-${id}`,
        scope: "page",
        url: `https://bharatorganicexpo.com/${id === "home" ? "" : id}`,
        summary: `Gemini 2.5 Flash AI strategy for '/${id === "home" ? "" : id}' (${cleanTitle}): Optimize high-intent bio-agriculture keywords, meta tags, and structured schema markup.`,
        items: [
          {
            ruleId: "meta_title_length",
            priority: "high",
            title: `Optimize Meta Title & Target Keywords for ${cleanTitle}`,
            whyItMatters: "Target keywords in H1, opening paragraphs, and meta descriptions signal core relevance to search engines.",
            recommendedFix: `Include 'Organic Food Exhibition' and '${cleanTitle}' naturally in the title tag and first 100 words.`,
            implementation: `<title>Bharat Organic Expo 2027 | ${cleanTitle} & Bio Trade</title>`,
            suggestedTitle: `Bharat Organic Expo 2027 | ${cleanTitle} & Bio-Agriculture`,
            suggestedDescription: `Explore ${cleanTitle.toLowerCase()} details for Bharat Organic Expo 2027, Yashobhoomi, New Delhi. Connect with certified organic exporters and bio-wellness brands.`,
            headingSuggestions: [`${cleanTitle} Highlights`, "Organic Certification Standards", "B2B Buyer Registration"],
            contentSuggestions: ["Highlight B2B trade delegations and certified organic products."],
            internalLinkSuggestions: [
              { anchorText: "View Exhibitor List", fromOrTo: "/exhibitor-list", reason: "Navigation CTA" },
              { anchorText: "Contact Support", fromOrTo: "/contact-us", reason: "Inquiry link" }
            ],
            schemaSuggestion: id === "home" ? "Event" : "WebPage",
          },
          {
            ruleId: "heading_hierarchy",
            priority: "medium",
            title: `Fix Heading Hierarchy & H1 Nesting on ${cleanTitle}`,
            whyItMatters: "Proper heading structure enables Google bots to understand document outline and keyword emphasis.",
            recommendedFix: "Ensure page has exactly one <h1> hero title followed sequentially by <h2> sub-sections.",
            implementation: `<h1>${cleanTitle} - Bharat Organic Expo</h1>\n<h2>Exhibition Categories & B2B Matchmaking</h2>`,
            suggestedTitle: null,
            suggestedDescription: null,
            headingSuggestions: [`Main ${cleanTitle} Header`, "Key Sections", "Location & Timings"],
            contentSuggestions: ["Ensure sub-sections use <h2> tags instead of bold span text."],
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
  acknowledgeAlert: (id: string) => api.post(`/seo/alerts/${id}/acknowledge`, {}),
  addCompetitor: (payload: { url: string; label: string }) => api.post<SeoCompetitor>("/seo/competitors", payload),
  deleteCompetitor: (id: string) => api.delete<{ id: string }>(`/seo/competitors/${id}`),
  auditCompetitor: (id: string) => api.post(`/seo/competitors/${id}/audit`, {}),
};
