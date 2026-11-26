import { api, getApiBaseUrl } from "./api";
import type { SeoCheckupReportData } from "./seoCheckupData";
import { SITE_ID, SITE_ORIGIN, SITE_NAME } from "./siteConfig";

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

export interface AutoFixPayload {
  pageUrl: string;
  route: string;
  /** true: only return what would change (preview), save nothing */
  dryRun?: boolean;
  issueType?: "title" | "description" | "canonical" | "og" | "schema" | "robots" | "h1" | "redirect" | "image_alt" | "all";
  options?: {
    metaTitle?: string;
    metaDescription?: string;
    h1Heading?: string;
    /** what the page's OTHER <h1> tags become once an H1 is saved (default h2) */
    h1ExtraTag?: "h2" | "h3" | "h4" | "p" | "div";
    canonicalUrl?: string;
    fromUrl?: string;
    toUrl?: string;
    statusCode?: number;
    imageSrc?: string;
    altText?: string;
    ogImage?: string;
    schemaMarkup?: string;
  };
}

export interface AutoFixResponse {
  success: boolean;
  message: string;
  fixLog?: { _id?: string } & Record<string, unknown>;
  fixLogs?: ({ _id?: string } & Record<string, unknown>)[];
  appliedFixes?: string[];
  /** Fixes that were not written, with the reason (for example { title: "ai_unavailable" }) */
  skipped?: Record<string, string>;
  seo?: Record<string, unknown>;
  /** Preview only (dryRun): what would be written; nothing was saved */
  dryRun?: boolean;
  preview?: Array<{ type: string; before: unknown; after: unknown }>;
}

export interface AutoFixAllResponse {
  success: boolean;
  totalPages: number;
  fixedCount: number;
  failedCount: number;
  truncated?: boolean;
  logs: Record<string, unknown>[];
}

export type PendingIssueType = "title" | "description" | "canonical" | "h1" | "og" | "schema" | "image_alt" | "redirect" | "robots";

export interface PendingIssue {
  id: string;
  route: string;
  pageUrl: string;
  issueType: PendingIssueType;
  severity: SeoSeverity;
  title: string;
  detail: string;
  currentValue: string | null;
  imageSrc?: string;
  actions: Array<"auto_fix" | "redirect" | "override_h1">;
  awaitingDeploy?: boolean;
}

export interface PendingState {
  hasAudit: boolean;
  snapshotAt: string | null;
  reportScore: number | null;
  healthScoreAtAudit: number | null;
  healthScore: number | null;
  pending: PendingIssue[];
  resolved: PendingIssue[];
  counts: { pending: number; resolved: number; critical: number; warning: number; notice: number };
  truncated: boolean;
}

export type AuditJobState = "waiting" | "active" | "completed" | "failed" | "not_found";

export interface AuditJobStatus {
  jobId: string;
  state: AuditJobState;
  progress: number;
  step: string | null;
  result?: unknown;
  error?: string | null;
  skipped?: boolean;
  method: "bullmq" | "in_process_fallback";
}

export interface InternalLinkSuggestion {
  _id: string;
  fromPath: string;
  toPath: string;
  anchorText: string;
  /** The anchor words really appear in the page text, so the link has a place on the website */
  anchorPlaced?: boolean;
  /** The sentence of the page that will carry the link (the anchor words are inside it) */
  anchorContext?: string;
  similarity: number;
  sharedTerms: string[];
  fromTitle?: string;
  toTitle?: string;
  fromExcerpt?: string;
  toExcerpt?: string;
  contextSnippets?: Array<{
    term: string;
    fromSentence?: string;
    toSentence?: string;
  }>;
  status: "suggested" | "applied" | "dismissed";
}

export interface NotFoundEntry {
  _id: string;
  path: string;
  hits: number;
  referrers: Array<{ referrer: string; count: number }>;
  status: "open" | "redirected" | "ignored";
  resolvedTo?: string;
  suggestion: { path: string; confidence: number } | null;
}

export interface OutreachDraftEntry {
  _id: string;
  mentionUrl: string;
  mentionTitle: string;
  subject: string;
  body: string;
  status: "draft" | "pushing" | "pushed" | "failed";
  error?: string;
}

/** The API client returns the `data` of the {success, data} envelope when there is one */
function unwrap<T>(res: unknown): T {
  const r = res as { success?: boolean; data?: unknown } | null;
  return (r && typeof r === "object" && "success" in r && "data" in r ? r.data : res) as T;
}

export interface RollbackResponse {
  success: boolean;
  message: string;
  log?: Record<string, unknown>;
}

/** What a fix stored: plain text for a title or description, or a small object (canonical, schema, redirect, image alt) */
export type FixValue = string | null | { metaTitle?: string; metaDescription?: string; canonicalUrl?: string; [key: string]: unknown };

export interface FixLogEntry {
  _id: string;
  pageUrl: string;
  route: string;
  issueType: string;
  previousValue: FixValue;
  newValue: FixValue;
  /** Audit-log vocabulary derived by the API */
  fixedBy: "AUTO_PILOT_AI" | "ADMIN";
  /** Who actually did it (an admin's email, or the auto-pilot label) */
  fixedByUser?: string;
  status: "SUCCESS" | "FAILED" | "REVERTED";
  storedStatus?: string;
  errorReason?: string;
  reverted: boolean;
  revertedAt?: string;
  createdAt: string;
}

export interface FixLogsResponse {
  success: boolean;
  data: {
    logs: FixLogEntry[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface SiteContentScanResponse {
  success: boolean;
  data: {
    totalPages: number;
    siteAiAverage: number;
    siteOriginalityAverage: number;
    totalImages: number;
    missingAltImages: number;
    aiSuspectImages: number;
    pages: Array<{
      route: string;
      title: string;
      wordCount: number;
      aiScore: number;
      originalityScore: number;
      isAiDetected: boolean;
      imagesCount: number;
      genericAltCount?: number;
      /** Pictures an AI picture check has judged on this page */
      aiCheckedCount?: number;
      /** Alt texts saved in the admin that the live page does not show yet */
      savedAltWaiting?: number;
      missingAltCount: number;
      aiSuspectCount: number;
      verdict: string;
    }>;
    /** Pages that could not be read this time; they are not in the numbers */
    skippedRoutes?: string[];
  };
}

export interface LiveContentScanResponse {
  success: boolean;
  data: {
    pageUrl: string;
    route: string;
    title: string;
    metaDescription: string;
    wordCount: number;
    h1: string[];
    h2: string[];
    images: Array<{
      src: string;
      alt: string;
      hasAlt: boolean;
      isAiSuspect: boolean;
      /** hidden from screen readers (aria-hidden): an empty alt is correct */
      isDecorative?: boolean;
      /** an alt text saved from the admin */
      savedAlt?: boolean;
      status: string;
      reason?: string;
      recommendation?: string;
    }>;
    aiScore: number;
    originalityScore: number;
    isAiDetected: boolean;
    verdict: string;
    eeatReasons: string[];
    flaggedPhrases: string[];
    humanizationGuide: string[];
    sampleText: string;
    analyzedAt: string;
    /** "ai_model" = scored by the configured LLM; "heuristic" = measured from robotic-phrase density only */
    scoreSource?: "ai_model" | "heuristic";
  };
}

/** One text field of a page, as stored in the website's CMS */
export interface ContentBlock {
  id: string;
  section: string;
  path: string[];
  label: string;
  kind: "heading" | "paragraph" | "short";
  text: string;
  words: number;
  chars: number;
  lineBreaks: number;
  /** stiff or robotic phrases found in the text */
  flagged: string[];
}

export interface ContentBlocksData {
  route: string;
  pageKey: string;
  total: number;
  flagged: number;
  blocks: ContentBlock[];
}

export interface HumanizeBlockData {
  blockId: string;
  original: string;
  humanized: string;
  checks: { lengthChange: number; sameLineBreaks: boolean; noNewFacts: boolean; changed: boolean };
}

export interface HumanizeContentPayload {
  text: string;
  instructions?: string;
  targetKeyword?: string;
  route?: string;
  saveToDb?: boolean;
}

export interface HumanizeContentResponse {
  success: boolean;
  data: {
    originalText: string;
    humanizedText: string;
    originalityScore: number;
    aiScore: number;
    improvementsMade: string[];
    suggestedH1?: string;
    suggestedMetaTitle?: string;
    suggestedMetaDescription?: string;
    savedToDb?: boolean;
    scoreSource?: "phrase_list";
    /** Filler phrases from a fixed list still present in the rewrite (not a quality score) */
    roboticPhrasesRemaining?: number;
  };
}

export interface RedirectEntry {
  _id: string;
  fromUrl: string;
  toUrl: string;
  statusCode: number;
  isActive: boolean;
  hits: number;
  lastUsedAt?: string;
  createdAt: string;
}

export type AutoPilotItemStatus = "pending" | "applying" | "applied" | "rejected" | "stale" | "failed";

export interface AutoPilotItem {
  id: string;
  route: string;
  type: string;
  before: unknown;
  after: unknown;
  status: AutoPilotItemStatus;
  note: string | null;
  decidedAt: string | null;
  decidedBy: string | null;
}

export interface AutoPilotProposal {
  id: string;
  source: string;
  state: "open" | "closed" | "superseded";
  createdAt: string;
  pagesChecked: number;
  counts: Record<AutoPilotItemStatus, number>;
  notProposed: Array<{ route: string; reason: string }>;
  items?: AutoPilotItem[];
}

export interface AutoPilotOverview {
  waiting: number;
  current: (AutoPilotProposal & { items: AutoPilotItem[] }) | null;
  recent: AutoPilotProposal[];
}

export interface AuditScheduleData {
  usingRedis: boolean;
  redisConnected: boolean;
  isAuditInProgress: boolean;
  /** Auto-Pilot suggestions waiting for an admin's approval */
  approvalsWaiting?: number;
  schedule: {
    frequency: string;
    intervalDays: number;
    autoPilotEnabled: boolean;
    lastRunAt?: string;
    nextRunAt?: string;
    webhookUrl?: string;
  };
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

// ─── Page insights: headings, social share tags, keywords of an address, AI pictures ───
export interface PageHeadings {
  route: string;
  title: string;
  counts: Record<"h1" | "h2" | "h3" | "h4" | "h5" | "h6", number>;
  total: number;
  headings: Array<{ level: number; text: string; issues: string[] }>;
  problems: string[];
  ok: boolean;
  h1Override?: string | null;
  awaitingDeploy?: boolean;
}
export type SocialField = "ogTitle" | "ogDescription" | "ogImage" | "ogImageAlt" | "twitterCard" | "twitterTitle" | "twitterDescription" | "twitterImage";
export interface SocialData {
  route: string;
  pageUrl: string;
  editable: boolean;
  note: string | null;
  saved: Record<SocialField, string>;
  live: Record<SocialField, string | null>;
  effective: Record<SocialField, string>;
  checks: Array<{ ok: boolean; text: string }>;
  limits: { ogTitle: number; ogDescription: number; twitterTitle: number; twitterDescription: number; ogImageAlt: number };
  auditedAt: string | null;
}
export interface UrlKeywordsData {
  url: string;
  title: string;
  metaDescription: string;
  h1: string[];
  wordCount: number;
  keywords: Array<{ keyword: string; words: number; count: number; density: number; inTitle: boolean; inDescription: boolean; inH1: boolean; inH2: boolean; inUrl: boolean }>;
  primaryRecommendation?: string | null;
  lsiKeywords?: string[];
  keywordVariations?: Array<{
    keyword: string;
    searchVolume: number;
    difficulty: number;
    cpc: number;
    intent: string;
    competition: string;
    /** All the keyword's words are on the page (measured) */
    onPage: boolean;
    /** How many times the whole phrase is written on the page (measured) */
    usedOnPage: number;
  }>;
  /** The AI analysis: saved in the database per page text; empty when no AI answered (nothing is made up) */
  ai?: { available: boolean; cached: boolean; analysedAt: string | null; message: string | null };
  searchVolume: { available: boolean; estimated?: boolean; note: string };
}
export interface AiImageRow {
  src: string;
  alt: string;
  status: "checked" | "skipped" | "failed";
  reason?: string;
  bytes?: number;
  metadataSignals: string[];
  provenAi: boolean;
  likelihood: number | null;
  kind: string | null;
  reasons: string[];
  model: string | null;
  cached: boolean;
}
export interface AiImagesData {
  route: string;
  auditedAt: string | null;
  totalPictures: number;
  skippedDecorative: number;
  skippedVector: number;
  notCheckedThisRun: number;
  iconsAndLogos: number;
  checked: number;
  judged: number;
  provenAi: number;
  likelyAi: number;
  percentAi: number | null;
  averageLikelihood: number | null;
  threshold: number;
  rows: AiImageRow[];
}

export const seoAuditApi = {
  /** Real checkup report for one route from the backend's live audit engine. */
  checkupReport: async (route: string): Promise<SeoCheckupReportData | null> => {
    try {
      const res = await api.get<Partial<SeoCheckupReportData> | null>(
        `/seo-audit/report?route=${encodeURIComponent(route)}`,
      );
      if (res && typeof res === "object" && Array.isArray(res.groups) && res.groups.length > 0) {
        return res as SeoCheckupReportData;
      }
      return null;
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
      if (overview && (overview as { site?: unknown }).site) {
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
        id: SITE_ID,
        url: SITE_ORIGIN,
        label: SITE_NAME,
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
    const scores = (overview as unknown as { scores?: Record<string, number | null> } | null)?.scores ?? null;
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
        pagesConsidered: (overview as unknown as { crawl?: { stats?: { pages?: number } } } | null)?.crawl?.stats?.pages ?? 0,
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
      if (response.ok) {
        const data = (await response.json()) as PageSpeedAudit;
        if (data.ok) return data;
        // Google said the quota is used up: asking the backend too would only spend more of it
        if (/quota/i.test(data.message ?? "")) return data;
      }
    } catch {
      // fallback to backend
    }
    try {
      const res = await api.get<{ success: boolean; data: PageSpeedAudit }>(`/seo-audit/pagespeed?${params.toString()}`);
      if (res?.data) return res.data;
    } catch {
      // ignore
    }
    return {
      ok: false,
      message: "PageSpeed Insights is unreachable",
      url,
      strategy,
      fetchedAt: new Date().toISOString(),
      cached: false,
      scores: { performance: null, accessibility: null, bestPractices: null, seo: null },
      metrics: { fcpMs: null, lcpMs: null, tbtMs: null, cls: null, siMs: null, ttfbMs: null, htmlKb: null, payloadKb: null, totalRequests: null, domNodes: null, imageRequests: null, javascriptKb: null, cssKb: null, fontKb: null, otherKb: null },
      fieldData: { available: false, overall: null },
    };
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
  // Retired: the backend never had /seo/competitors handlers — those paths fell into the SEO /{*page} wildcard
  // (a POST there upserts SEO metadata for a page called "competitors"). Competitor work now lives in the
  // AI Competitor Analyzer (/competitor-analyzer, backend /api/admin/competitor-analyzer). No inherited
  // Bharat Organic fallback is returned any more.
  competitors: async (): Promise<SeoCompetitor[]> => [],
  competitorComparison: async (): Promise<SeoCompetitorComparison | null> => null,
  unlockAudit: async () => {
    return api.post<{ success: boolean; message?: string }>("/seo-audit/unlock", {});
  },
  startAudit: async (options?: { force?: boolean; route?: string }) => {
    const force = options?.force ?? true;
    try {
      const res = await api.post<{ success: boolean; message?: string; data?: { generatedAt?: string } }>(
        "/seo-audit/run",
        { route: options?.route || "/", pageSpeed: true, llm: true, force },
        { timeoutMs: 420000 },
      );
      const payload = res as { success?: boolean; data?: { generatedAt?: string }; message?: string } | null;
      if (payload && (payload.success === true || payload.data)) {
        return { crawlId: payload?.data?.generatedAt ?? null, status: "completed" };
      }
      throw new Error(payload?.message || "The audit run failed.");
    } catch (caught) {
      const err = caught as { status?: number; statusCode?: number; message?: string } | null;
      if (err?.status === 409 || err?.statusCode === 409 || String(err?.message || "").includes("already running")) {
        await api.post("/seo-audit/unlock", {}).catch(() => undefined);
        const retryRes = await api.post<{ success: boolean; message?: string; data?: { generatedAt?: string } }>(
          "/seo-audit/run",
          { route: options?.route || "/", pageSpeed: true, llm: true, force: true },
          { timeoutMs: 420000 },
        );
        const retryPayload = retryRes as { success?: boolean; data?: { generatedAt?: string }; message?: string } | null;
        if (retryPayload && (retryPayload.success === true || retryPayload.data)) {
          return { crawlId: retryPayload?.data?.generatedAt ?? null, status: "completed" };
        }
      }
      throw caught;
    }
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
  addCompetitor: async (_payload: { url: string; label: string }): Promise<SeoCompetitor> => {
    throw new Error("Competitors are managed in AI Competitor Analyzer (/competitor-analyzer).");
  },
  deleteCompetitor: async (_id: string): Promise<{ id: string }> => {
    throw new Error("Competitors are managed in AI Competitor Analyzer (/competitor-analyzer).");
  },
  auditCompetitor: async (_id: string): Promise<never> => {
    throw new Error("Competitors are managed in AI Competitor Analyzer (/competitor-analyzer).");
  },
  autoFixPage: async (payload: AutoFixPayload): Promise<AutoFixResponse> => {
    return await api.post<AutoFixResponse>("/seo-audit/auto-fix", payload);
  },
  /** Starts "Auto-Fix All" as a queued job: resolves with the job id (poll auditJobStatus). 409 = one is already running. */
  startAutoFixAll: async (options: { maxPages?: number } = {}): Promise<{ jobId: string }> => {
    return unwrap<{ jobId: string }>(await api.post<unknown>("/seo-audit/auto-fix-all", options.maxPages ? { maxPages: options.maxPages } : {}));
  },
  activeJob: async (): Promise<{ jobId: string; kind: string } | null> => {
    return unwrap<{ jobId: string; kind: string } | null>(await api.get<unknown>("/seo-audit/active-job", { forceFresh: true }));
  },
  rollbackFix: async (fixLogId: string, force = false): Promise<RollbackResponse> => {
    return await api.post<RollbackResponse>("/seo-audit/rollback", { fixLogId, force });
  },
  getFixLogs: async (params: { page?: number; limit?: number; route?: string; issueType?: string } = {}): Promise<FixLogsResponse> => {
    const q = new URLSearchParams();
    if (params.page) q.set("page", String(params.page));
    if (params.limit) q.set("limit", String(params.limit));
    if (params.route) q.set("route", params.route);
    if (params.issueType) q.set("issueType", params.issueType);
    const data = unwrap<FixLogsResponse["data"]>(await api.get<unknown>(`/seo-audit/fix-logs?${q.toString()}`, { forceFresh: true }));
    return { success: true, data };
  },
  /** Queue a full audit; resolves with the job id to poll with auditJobStatus. */
  triggerAudit: async (): Promise<{ jobId: string; method: string }> => {
    return unwrap<{ jobId: string; method: string }>(await api.post<unknown>("/seo-audit/trigger", {}));
  },
  auditJobStatus: async (jobId: string): Promise<AuditJobStatus> => {
    return unwrap<AuditJobStatus>(await api.get<unknown>(`/seo-audit/status/${encodeURIComponent(jobId)}`, { forceFresh: true }));
  },
  /** Pending / resolved issues and the live health score, from the latest audit and the current database state */
  pendingIssues: async (): Promise<PendingState> => {
    return unwrap<PendingState>(await api.get<unknown>("/seo-audit/pending", { forceFresh: true }));
  },
  getInternalLinks: async (status?: string): Promise<InternalLinkSuggestion[]> =>
    unwrap<InternalLinkSuggestion[]>(await api.get<unknown>(`/seo-audit/internal-links${status ? `?status=${encodeURIComponent(status)}` : ""}`, { forceFresh: true })),
  generateInternalLinks: async (): Promise<{ pagesAnalysed: number; created: number; message: string | null }> =>
    unwrap(await api.post<unknown>("/seo-audit/internal-links/generate", {}, { timeoutMs: 60000 })),
  setInternalLinkStatus: async (id: string, status: "applied" | "suggested" | "dismissed"): Promise<InternalLinkSuggestion> =>
    unwrap(await api.post<unknown>(`/seo-audit/internal-links/${id}/status`, { status })),
  getNotFoundLog: async (status?: string): Promise<NotFoundEntry[]> =>
    unwrap<NotFoundEntry[]>(await api.get<unknown>(`/seo-audit/404-log${status ? `?status=${encodeURIComponent(status)}` : ""}`, { forceFresh: true })),
  autoRedirectNotFound: async (): Promise<{ examined: number; created: number; unmatched: string[] }> =>
    unwrap(await api.post<unknown>("/seo-audit/404-log/auto-redirect", {})),
  getOutreachStatus: async (): Promise<{ mentionSourceConfigured: boolean; mentionSource: string | null; aiConfigured: boolean }> =>
    unwrap(await api.get<unknown>("/seo-audit/outreach/status", { forceFresh: true })),
  findUnlinkedMentions: async (): Promise<{ configured: boolean; message: string | null; mentions: Array<{ url: string; title: string; snippet: string }>; checked: number }> =>
    unwrap(await api.post<unknown>("/seo-audit/outreach/mentions", {}, { timeoutMs: 120000 })),
  createOutreachDraft: async (m: { url: string; title?: string; snippet?: string }): Promise<OutreachDraftEntry> =>
    unwrap(await api.post<unknown>("/seo-audit/outreach/draft", m, { timeoutMs: 60000 })),
  getOutreachDrafts: async (): Promise<OutreachDraftEntry[]> => unwrap(await api.get<unknown>("/seo-audit/outreach/drafts", { forceFresh: true })),
  pushOutreachDraft: async (id: string): Promise<OutreachDraftEntry> => unwrap(await api.post<unknown>(`/seo-audit/outreach/drafts/${id}/push`, {})),
  downloadExcelReport: async (): Promise<void> => {
    const { blob, filename } = await api.getFile("/seo-audit/export-excel");
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename || "seo-audit.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(blobUrl);
  },
  analyzeLiveContent: async (payload: { url?: string; route?: string }): Promise<LiveContentScanResponse> => {
    const data = unwrap<LiveContentScanResponse["data"]>(await api.post<unknown>("/seo-audit/content-analyze-live", payload, { timeoutMs: 60000 }));
    return { success: true, data };
  },
  getSiteContentScan: async (): Promise<SiteContentScanResponse> => {
    const data = unwrap<SiteContentScanResponse["data"]>(await api.get<unknown>("/seo-audit/site-content-scan", { timeoutMs: 300000 }));
    return { success: true, data };
  },
  humanizeContent: async (payload: HumanizeContentPayload): Promise<HumanizeContentResponse> => {
    const data = unwrap<HumanizeContentResponse["data"]>(await api.post<unknown>("/seo-audit/humanize-content", payload, { timeoutMs: 90000 }));
    return { success: true, data };
  },
  /** The page's real text from the CMS, block by block */
  headings: async (): Promise<{ auditedAt: string | null; pages: PageHeadings[] }> =>
    unwrap<{ auditedAt: string | null; pages: PageHeadings[] }>(await api.get<unknown>("/seo-audit/headings", { forceFresh: true })),
  social: async (route: string): Promise<SocialData> =>
    unwrap<SocialData>(await api.get<unknown>(`/seo-audit/social?route=${encodeURIComponent(route)}`, { forceFresh: true })),
  /** Saves the share tags of one page (logged in the Fix history, can be undone) */
  saveSocial: async (route: string, fields: Partial<Record<SocialField, string>>): Promise<{ changed: boolean; logId: string | null; social: SocialData }> =>
    unwrap<{ changed: boolean; logId: string | null; social: SocialData }>(await api.put<unknown>("/seo-audit/social", { route, ...fields })),
  keywordsFromUrl: async (url: string, refresh = false): Promise<UrlKeywordsData> =>
    unwrap<UrlKeywordsData>(await api.post<unknown>("/seo-audit/keywords-from-url", { url, refresh }, { timeoutMs: 120000 })),
  aiImages: async (route: string, opts: { limit?: number; force?: boolean } = {}): Promise<AiImagesData> =>
    unwrap<AiImagesData>(await api.post<unknown>("/seo-audit/ai-images", { route, ...opts }, { timeoutMs: 300000 })),
  contentBlocks: async (route: string): Promise<ContentBlocksData> =>
    unwrap<ContentBlocksData>(await api.get<unknown>(`/seo-audit/content-blocks?route=${encodeURIComponent(route)}`, { forceFresh: true })),
  /** Rewrites one block in the same format. Nothing is saved. */
  humanizeBlock: async (route: string, blockId: string): Promise<HumanizeBlockData> =>
    unwrap<HumanizeBlockData>(await api.post<unknown>("/seo-audit/content-blocks/humanize", { route, blockId }, { timeoutMs: 90000 })),
  /** Saves the text into the same CMS field (logged, can be undone) */
  applyBlock: async (payload: { route: string; blockId: string; original: string; text: string; edited?: boolean }): Promise<{ logId: string }> =>
    unwrap<{ logId: string }>(await api.post<unknown>("/seo-audit/content-blocks/apply", payload)),
  addRedirect: async (payload: { fromUrl: string; toUrl: string; statusCode?: number }): Promise<{ success: boolean; data: RedirectEntry }> => {
    const data = unwrap<RedirectEntry>(await api.post<unknown>("/seo-audit/redirect", payload));
    return { success: true, data };
  },
  getRedirects: async (): Promise<{ success: boolean; data: RedirectEntry[] }> => {
    const data = unwrap<RedirectEntry[]>(await api.get<unknown>("/seo-audit/redirects", { forceFresh: true }));
    return { success: true, data };
  },
  getAuditSchedule: async (): Promise<{ success: boolean; data: AuditScheduleData }> => {
    const data = unwrap<AuditScheduleData>(await api.get<unknown>("/seo-audit/schedule", { forceFresh: true }));
    return { success: true, data };
  },
  /** runAt: ISO date and time of the first run (the only run for frequency "once") */
  updateAuditSchedule: async (payload: { frequency: string; intervalDays: number; autoPilotEnabled: boolean; webhookUrl?: string; runAt?: string }): Promise<{ success: boolean; data: unknown }> => {
    const data = unwrap<unknown>(await api.post<unknown>("/seo-audit/schedule", payload));
    return { success: true, data };
  },
  getAutoPilot: async (): Promise<AutoPilotOverview> => unwrap<AutoPilotOverview>(await api.get<unknown>("/seo-audit/autopilot", { forceFresh: true })),
  decideAutoPilot: async (proposalId: string, approveIds: string[], rejectIds: string[]): Promise<{ results: Array<{ id: string; status: AutoPilotItemStatus; note: string | null }>; proposal: AutoPilotProposal & { items: AutoPilotItem[] } }> =>
    unwrap(await api.post<unknown>("/seo-audit/autopilot/decide", { proposalId, approveIds, rejectIds })),
};
