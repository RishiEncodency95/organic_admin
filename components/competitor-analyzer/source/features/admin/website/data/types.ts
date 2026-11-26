/**
 * Website Intelligence — data contracts.
 *
 * These types are the contract between the UI and whatever supplies the data.
 * Today that is the in-memory mock provider; later it will be the crawler,
 * PageSpeed, GA4, Search Console and monitoring services. Components must only
 * ever depend on the shapes declared here — never on the mock module itself.
 *
 * Everything here describes a website we observe **from the outside**. There is
 * no CMS, no server access and no deployment access, so nothing in this file
 * models editing, publishing or deleting a page.
 */

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

/** ISO-8601 timestamp. Kept as a string so it survives a JSON boundary. */
export type IsoDate = string;

export type Severity = "critical" | "high" | "medium" | "low";

export type IssueStatus = "open" | "resolved" | "ignored";

export type CheckStatus = "pass" | "warning" | "error" | "unknown";

export type VitalBand = "good" | "needs-improvement" | "poor";

export type LiveStatus = "live" | "degraded" | "down" | "unknown";

/** How sure the detector is. Nothing observed from outside is ever certain. */
export type Confidence = "high" | "medium" | "low";

export type IssueCategory =
  | "seo"
  | "performance"
  | "accessibility"
  | "links"
  | "monitoring"
  | "ssl"
  | "forms"
  | "security"
  | "technical";

export type PageType =
  | "standard"
  | "landing"
  | "blog"
  | "legal"
  | "utility"
  | "redirect"
  | "error";

/* ------------------------------------------------------------------ */
/* Capabilities & integrations                                         */
/* ------------------------------------------------------------------ */

/**
 * What we can learn from the URL alone. Every one of these is answerable by
 * fetching public pages, so they are available as soon as a client has a URL.
 */
export type WebsiteCapability =
  | "canCrawlWebsite"
  | "canAuditSEO"
  | "canAuditPerformance"
  | "canAuditAccessibility"
  | "canDetectForms"
  | "canDetectCTAs"
  | "canMonitorUptime"
  | "canCheckSSL"
  | "canDetectTechnologies"
  | "canCheckSecurityHygiene"
  | "canCaptureScreenshots"
  | "canDetectChanges";

export type IntegrationKey = "ga4" | "searchConsole" | "omniTracking" | "ownership";

export type IntegrationStatus =
  | "connected"
  /** Omni Tracking only: the snippet is on the site and reporting. */
  | "installed"
  | "not-connected"
  | "needs-attention"
  | "not-installed"
  | "pending-verification";

export interface IntegrationState {
  key: IntegrationKey;
  name: string;
  status: IntegrationStatus;
  /** Short human explanation of the current status. */
  detail: string;
  /** GA4 property, Search Console property, tracking site id, … */
  property: string | null;
  lastSyncAt: IsoDate | null;
  /** What connecting this integration turns on, for the locked-state copy. */
  unlocks: string[];
}

export interface WebsiteCapabilityState {
  capabilities: Record<WebsiteCapability, boolean>;
  integrations: Record<IntegrationKey, IntegrationState>;
}

/* ------------------------------------------------------------------ */
/* The website itself                                                  */
/* ------------------------------------------------------------------ */

/**
 * The website under observation. The URL is owned by the Client Profile — this
 * module reads it and never edits it.
 */
export interface WebsiteTarget {
  clientId: string;
  clientName: string;
  /** Bare host, e.g. `mokshasewa.org`. */
  domain: string;
  /** Canonical absolute URL, e.g. `https://mokshasewa.org`. */
  url: string;
  https: boolean;
  status: LiveStatus;
  /** Ownership verified via DNS/meta tag — gates Search Console style features. */
  verified: boolean;
  lastScannedAt: IsoDate | null;
  nextScanAt: IsoDate | null;
  /** Where the URL came from, shown in Settings so the source is never a mystery. */
  sourceLabel: string;
}

export interface ScoreSet {
  /**
   * EnCodency Website Health — the mean of the executed technical, on-page and content domain
   * scores. Never a Google score. Null means nothing was measured, not zero.
   */
  health: number | null;
  /** Mean of technical and on-page check pass-rates (severity weighted). */
  seo: number | null;
  /** PageSpeed Insights performance score, only when a real run measured it. */
  performance: number | null;
  /** Not verified by the crawl (needs an automated accessibility audit). */
  accessibility: number | null;
  /** Not measured. */
  bestPractices: number | null;
  technical?: number | null;
  onPage?: number | null;
  content?: number | null;
}

export interface WebsiteSummary {
  target: WebsiteTarget;
  scores: ScoreSet;
  /** Change vs. the previous scan, same order of keys as `scores`. */
  /** Change versus the previous scan; null on the first scan (baseline). */
  scoreDeltas: { [K in keyof ScoreSet]: number | null };
  uptimePct: number | null;
  pagesDiscovered: number;
  criticalIssues: number;
  openIssues: number;
}

export interface TrendPoint {
  date: IsoDate;
  health: number | null;
  seo: number | null;
  performance: number | null;
  uptime: number | null;
}

export interface TechnologyDetection {
  name: string;
  category: string;
  confidence: Confidence;
  /** What gave it away, e.g. `x-powered-by header`. */
  evidence: string;
}

export type ScanType = "full-crawl" | "seo-audit" | "performance" | "uptime" | "page" | "ai";

/** Optional per-run settings for AI analysis scans. */
export interface ScanStartOptions {
  aiMode?: AiMode;
  force?: boolean;
  topN?: number;
}

export type ScanStatus = "queued" | "running" | "completed" | "partially_completed" | "failed" | "cancelled" | "partial";

export interface ScanRecord {
  id: string;
  type: ScanType;
  startedAt: IsoDate;
  durationSeconds: number;
  pagesScanned: number;
  issuesFound: number;
  status: ScanStatus;
  /** Populated when `status` is `failed` or `partial`. */
  note: string | null;
}

/** Live progress of a scan the user just started. */
export interface ScanProgress {
  scanId: string;
  type: ScanType;
  status: "queued" | "running" | "completed" | "partially_completed" | "failed" | "cancelled";
  /** 0–100, derived from completed work units. */
  progress: number;
  stage: string;
  pagesScanned: number;
  startedAt: IsoDate;
  /** Present on live scans: real work-unit counts and failure detail. */
  phase?: string | null;
  totalUnits?: number;
  completedUnits?: number;
  failedUnits?: number;
  completedAt?: IsoDate | null;
  cancelRequested?: boolean;
  /** True when the request was answered with the scan already running for this website. */
  deduplicated?: boolean;
  error?: { code: string; message: string; retryable: boolean } | null;
}

/* ------------------------------------------------------------------ */
/* Pages                                                               */
/* ------------------------------------------------------------------ */

export interface PageRecord {
  id: string;
  title: string;
  /** Path portion, e.g. `/donate`. */
  path: string;
  url: string;
  type: PageType;
  httpStatus: number;
  seoScore: number | null;
  performanceScore: number | null;
  accessibilityScore: number | null;
  wordCount: number;
  issueCount: number;
  criticalIssueCount: number;
  indexable: boolean;
  lastScannedAt: IsoDate;
  /** Transfer size in kilobytes. */
  pageWeightKb: number;
  loadTimeMs: number;
  depth: number;
}

/** One audited assertion about a page. Pass / warning / error, with the evidence. */
export interface AuditCheck {
  id: string;
  label: string;
  status: CheckStatus;
  /** The observed value, e.g. the actual title text or `214 characters`. */
  value: string | null;
  detail: string;
  recommendation: string | null;
}

export interface PageLinkRecord {
  href: string;
  text: string;
  kind: "internal" | "external";
  status: number | null;
  /** Set when the link resolves through one or more redirects. */
  redirectsTo: string | null;
}

export interface PageResourceBreakdown {
  label: string;
  requests: number;
  weightKb: number;
}

export interface PagePerformanceDetail {
  score: number | null;
  lcpMs: number | null;
  inpMs: number | null;
  cls: number | null;
  ttfbMs: number | null;
  pageWeightKb: number | null;
  requests: number | null;
  breakdown: PageResourceBreakdown[];
  thirdParty: { name: string; weightKb: number; blocking: boolean }[];
  note?: string;
}

export interface PageContentDetail {
  wordCount: number;
  thinContent: boolean;
  duplicateSimilarityPct: number;
  duplicateOf: string | null;
  headings: { level: number; text: string }[];
  images: { total: number; missingAlt: number; oversized: number | null };
  videos: number | null;
  ctas: { text: string; kind: CtaKind; destination: string }[];
  readability: { label: string; score: number | null; note: string };
  mainContentBasis?: string;
}

export interface PageScreenshots {
  /** Mock viewport renders — no worker is capturing these yet. */
  available: boolean;
  capturedAt: IsoDate | null;
  note: string;
}

export interface PageAudit {
  page: PageRecord;
  canonical: string | null;
  indexabilityNote: string;
  screenshots: PageScreenshots;
  seoChecks: AuditCheck[];
  technicalChecks: AuditCheck[];
  accessibilityChecks: AuditCheck[];
  content: PageContentDetail;
  links: {
    internal: number;
    external: number;
    broken: number;
    redirected: number;
    orphanRisk: boolean;
    samples: PageLinkRecord[];
  };
  performance: PagePerformanceDetail;
  issueIds: string[];
  /** False for pages scanned before per-page evidence was collected. */
  evidenceAvailable?: boolean;
  legacyNote?: string;
  accessibilityNote?: string;
  scoreBasis?: string;
  scores?: { technical: number | null; onPage: number | null; content: number | null; seo: number | null } | null;
  checksRun?: string[];
  issues?: IssueRecord[];
  structuredData?: { index: number; valid: boolean; types: string[]; error: string | null; missingFields: string[] }[];
  images?: { src: string | null; alt: string | null; hasAltAttribute: boolean }[];
  evidence?: {
    requestedUrl: string; finalUrl: string; redirectChain: { url: string; status: number }[]; contentType: string | null;
    responseTimeMs: number; pageWeightKb: number; lang: string | null; metaRobots: string; xRobotsTag: string | null;
    hreflang: { lang: string; href: string }[]; mixedContent: string[]; inSitemap: boolean; discoveredVia: string; depth: number;
    contentHash: string | null; crawledAt: IsoDate | null; truncated: boolean;
  };
  history?: PageHistoryEntry[];
}

export interface PageHistoryEntry {
  scanId: string;
  at: IsoDate;
  httpStatus: number | null;
  title: string | null;
  wordCount: number;
  issueCount: number;
  scores: { technical: number | null; onPage: number | null; content: number | null };
  responseTimeMs: number;
  /** Null for the first recorded scan: a baseline, nothing to compare with. */
  changes: {
    statusChanged: { from: number | null; to: number | null } | null;
    titleChanged: { from: string | null; to: string | null } | null;
    descriptionChanged: boolean;
    contentChanged: boolean;
    wordCountDelta: number;
    newIssues: string[];
    resolvedIssues: string[];
  } | null;
}

export interface CrawlLimits {
  limits: { maxPages: number; maxDepth: number; maxConcurrency: number; timeoutMs: { min: number; max: number }; externalLinkChecks: number };
  javascriptRendering: { available: boolean; reason: string };
  planEntitlements: { integrated: boolean; note: string };
}

/* ------------------------------------------------------------------ */
/* Issues                                                              */
/* ------------------------------------------------------------------ */

export interface IssueRecord {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  category: IssueCategory;
  status: IssueStatus;
  detectedAt: IsoDate;
  resolvedAt: IsoDate | null;
  resolvedBy: string | null;
  resolutionNotes: string | null;
  /** Page ids this issue was found on. Empty for site-wide issues. */
  affectedPageIds: string[];
  /** Site-wide issues still need a count, e.g. "robots.txt" affects the site. */
  affectedCount: number;
  recommendation: string;
  fixGuideId: string;
  /** e.g. `LCP 4.8s` — the measurement that triggered the issue. */
  evidence: string | null;
  /** Evidence-engine fields (absent on issues from before the audit engine). */
  checkId?: string;
  affectedUrls?: string[];
  evidenceDetail?: { label: string; value: string }[];
  verification?: string[];
  firstDetectedAt?: IsoDate;
  lastSeenAt?: IsoDate;
  reopenedAt?: IsoDate;
  /** Set when a scan could not re-check this issue, so it was left as it was. */
  notRecheckedAt?: IsoDate;
  history?: { at: IsoDate; event: string; scanId?: string; note?: string }[];
}

export interface FixGuide {
  id: string;
  title: string;
  summary: string;
  impact: "high" | "medium" | "low";
  effort: "low" | "medium" | "high";
  steps: string[];
  /** Who normally has to do it — we usually cannot, we have no site access. */
  ownedBy: string;
  reference: { label: string; url: string } | null;
}

/* ------------------------------------------------------------------ */
/* SEO                                                                 */
/* ------------------------------------------------------------------ */

export interface SeoCategoryScore {
  key: string;
  label: string;
  /** Null when none of this category's checks ran. */
  score: number | null;
  passed: number;
  warnings: number;
  errors: number;
  executed?: boolean;
}

export interface SeoOverview {
  score: number | null;
  scoreBasis?: string;
  checksExecuted?: string[];
  checksSkipped?: { checkId: string; reason: string }[];
  pagesCrawled: number;
  indexablePages: number;
  totalPages?: number;
  totalChecks?: number;
  errors: number;
  warnings: number;
  passedChecks: number;
  healthyPages: number;
  warningPages: number;
  criticalPages: number;
  categories: SeoCategoryScore[];
}

export interface SitemapEntry {
  loc: string;
  lastModified: IsoDate | null;
  status: number | null;
  /** Null when the entry is listed but not individually fetched yet. */
  valid: boolean | null;
  note: string | null;
}

export interface SitemapReport {
  detected: boolean;
  url: string | null;
  fetchedAt: IsoDate | null;
  childSitemaps: { url: string; urlCount: number | null }[];
  urlsDiscovered: number;
  invalidUrls: number;
  entries: SitemapEntry[];
  /** Why nothing is shown, e.g. "sitemap.xml returned HTTP 404." */
  note?: string | null;
}

export interface RobotsReport {
  detected: boolean;
  url: string | null;
  fetchedAt: IsoDate | null;
  raw: string;
  allowedPaths: string[];
  blockedPaths: string[];
  sitemapReferences: string[];
  warnings: string[];
  /** Why nothing is shown, e.g. "robots.txt could not be fetched." */
  note?: string | null;
}

export interface SchemaTypeReport {
  type: string;
  pages: number;
  status: CheckStatus;
  issues: string[];
}

export interface SchemaReport {
  detectedTypes: SchemaTypeReport[];
  valid: number;
  warnings: number;
  errors: number;
}

export interface SearchQueryRow {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  /** Same query in the window just before the period; null when it had no impressions then (or no comparison exists). */
  previousPosition?: number | null;
  /** The landing page this query sends the most clicks (then impressions) to. */
  page?: string | null;
}

/** Search Console periods; 12 and 16 months have no previous window inside Google's 16-month retention. */
export type SearchPeriod = "7d" | "28d" | "3m" | "6m" | "12m" | "16m";

export interface SearchQueryDetail {
  query: string;
  period: SearchPeriod;
  range: { start: string; end: string };
  totals: { clicks: number; impressions: number; ctr: number; position: number } | null;
  previous: { clicks: number; impressions: number; ctr: number; position: number } | null;
  daily: { date: IsoDate; clicks: number; impressions: number; ctr: number; position: number }[];
  pages: SearchPageRow[];
  devices: { device: string; clicks: number; impressions: number; ctr: number; position: number }[];
  countries: { country: string; countryName: string; clicks: number; impressions: number; ctr: number; position: number }[];
}

export interface SearchPageRow {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SearchConsoleData {
  period?: SearchPeriod;
  range?: { start: string; end: string };
  previousRange?: { start: string; end: string } | null;
  /** When this report was read from Google. */
  fetchedAt?: IsoDate;
  /** Sections that failed while the totals succeeded; they are empty, not zero. */
  partial?: string[] | null;
  totals: { clicks: number; impressions: number; ctr: number; position: number };
  /** Previous window of the same length; null when it is outside retention or Google has no data for it. */
  previous?: { clicks: number; impressions: number; ctr: number; position: number } | null;
  /** Null when the period has no comparable previous window. */
  deltas: { clicks: number | null; impressions: number | null; ctr: number | null; position: number | null };
  trend: { date: IsoDate; clicks: number; impressions: number; position: number }[];
  queries: SearchQueryRow[];
  pages: SearchPageRow[];
  countries: { country: string; countryName?: string; clicks: number; impressions: number }[];
  devices: { device: string; clicks: number; impressions: number }[];
  /** Index coverage report from Google Search Console */
  indexCoverage: null | {
    submitted: number;
    indexed: number;
    indexedNotSubmitted: number;
    removed: number;
    error: number;
    warning: number;
    excluded: number;
  };
  /** Sitemaps submitted and their status; null when Search Console did not return the list. */
  sitemaps: {
    submitted: number;
    indexed: number;
    pending: number;
    error: number;
    warning: number;
    items?: { path: string; lastDownloaded: string | null; isPending: boolean; errors: number; warnings: number; submittedUrls: number | null }[];
  } | null;
}

export interface KeywordResearchData {
  query: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
  difficulty: number;
  intent: "informational" | "transactional" | "navigational" | "commercial";
  searchVolume?: number;
  /** Same query, previous window of the same length; null when it had no impressions then. */
  previousPosition?: number | null;
  /** Positive = moved up (a lower position number is better). */
  positionChange?: number | null;
  /** The landing page this query sends the most clicks (then impressions) to. */
  page?: string | null;
}

export interface CompetitorData {
  id?: string;
  domain: string;
  url?: string;
  status?: string;
  analyzedAt?: IsoDate | null;
  trafficShare: number | null;
  keywordOverlap: number | null;
  contentGap: number | null;
  backlinkProfile: {
    referringDomains: number | null;
    totalBacklinks: number | null;
    growthRate: number | null;
  };
  technical?: Record<string, unknown> | null;
  suggestions?: { title: string; evidence: string }[];
  evidence?: Record<string, unknown> | null;
  note?: string;
  ai?: CompetitorAiAnalysis | null;
  error?: string | null;
}

export interface CompetitorAiPoint {
  point: string;
  evidence: string;
  url: string;
}

export interface CompetitorAiAction {
  priority: "high" | "medium" | "low";
  action: string;
  reason: string;
  effort: "low" | "medium" | "high";
}

/** Measured from the pages that were read (counts, not estimates). */
export interface CompetitorSiteMetrics {
  pages: number;
  words: number;
  headings: number;
  ctas: number;
  images: number;
  contact: { phone: boolean; email: boolean; whatsapp: boolean; form: boolean };
  social: string[];
  schemaTypes: string[];
  image: string | null;
}

export interface CompetitorScore {
  area: string;
  you: number;
  them: number;
  note: string;
}

/** Generated reading of public pages of both sites; every cited point links to a page that was actually read. */
export interface CompetitorAiAnalysis {
  status: "completed";
  provider: string;
  model: string;
  generatedAt: IsoDate;
  promptVersion: string;
  pagesRead: { own: string[]; competitor: string[] };
  /** Absent on analyses saved before 2026-10-22.2. */
  metrics?: { own: CompetitorSiteMetrics; competitor: CompetitorSiteMetrics };
  dropped: number;
  costUsd: number;
  result: {
    summary: string;
    scores?: CompetitorScore[];
    audience: string;
    offerings: string[];
    positioning: string;
    theyDoBetter: CompetitorAiPoint[];
    youDoBetter: CompetitorAiPoint[];
    contentGaps: { topic: string; why: string; url: string }[];
    keywordThemes: string[];
    conversion: { ctas: string[]; trustSignals: string[] };
    actions: CompetitorAiAction[];
  };
}

export type SheetsDataset = "search" | "competitors" | "all";

/** The customer's own Google Sheet, shared with the platform service account; exports replace fixed tabs in it. */
export interface SheetsStatus {
  serviceAccountEmail: string | null;
  connected: boolean;
  spreadsheetId: string | null;
  url: string | null;
  title: string | null;
  connectedAt: IsoDate | null;
  lastExport: { at: IsoDate; dataset: SheetsDataset; period: SearchPeriod; tabs: { title: string; gid: number; rows: number; url: string }[] } | null;
}

export interface CompetitorAiRun {
  competitorId: string;
  ai: CompetitorAiAnalysis;
  reused: boolean;
}

export interface TrackingSettings {
  trackingEnabled: boolean;
  consentRequired: boolean;
  anonymousMode: boolean;
  respectDnt: boolean;
  respectGpc: boolean;
  retentionDays: number;
}

export interface TrackingSnippetView {
  siteKey: string;
  domain: string;
  status: string;
  lastEventAt: IsoDate | null;
  settings: TrackingSettings;
  disclosure: string;
  snippet: string;
}

export interface BacklinkData {
  referringDomain: string;
  anchorText: string;
  linkType: "internal" | "external" | "no-follow" | "sponsored" | "ugc";
  domainAuthority: number | null;
  url: string;
  firstSeen: IsoDate;
  lastSeen: IsoDate | null;
  sourceUrl?: string;
  targetPage?: string;
  clicks?: number;
  impressions?: number;
  position?: number;
  status?: string;
}

export interface RankTrackingData {
  keyword: string;
  currentPosition: number;
  /** Same query, previous 28 days. Null when the query had no impressions then. */
  previousPosition: number | null;
  positionChange: number | null;
  /** No keyword-volume provider is connected. */
  searchVolume: number | null;
  difficulty: number | null;
  intent: "informational" | "transactional" | "navigational" | "commercial";
  history: { date: IsoDate; position: number }[];
  serpFeatures: string[];
  url: string | null;
  clicks?: number;
  impressions?: number;
  ctr?: number;
}

export interface SeoData {
  overview: SeoOverview;
  sitemap: SitemapReport;
  robots: RobotsReport;
  schema: SchemaReport;
  /** Internal-link view used by the SEO → Links sub-tab. */
  links: {
    internalLinks: number;
    externalLinks: number;
    brokenLinks: number;
    redirectChains: number;
    nofollowLinks: number;
    orphanPages: number;
    broken: { from: string; to: string; status: number; text: string; kind?: "internal" | "external"; error?: string | null }[];
    redirects: { from: string; to: string; hops: number }[];
    weakAnchors?: { source: string; target: string | null; anchor: string; reason: string }[];
    orphanCandidates?: string[];
    unchecked?: { internal: number; external: number };
    externalChecked?: number | null;
    orphanConclusionSound?: boolean;
  };
  duplicates?: { kind: "title" | "description" | "h1" | "exact-content" | "near-content"; value: string; pageIds: string[]; urls: string[]; similarityPct: number | null }[];
  crawl?: {
    complete: boolean; limitReached: boolean; depthLimited: number; discovered: number; attempted: number;
    skippedCounts: Record<string, number>;
    robots: { fetched: boolean; status: number | null; note: string | null; crawlDelaySeconds: number | null; groups: number };
    sitemap: { documents: { url: string; status: number | null; urlCount: number; isIndex: boolean; error: string | null }[]; urls: number; truncated: boolean } | null;
    javascriptRendering: "not_requested" | "requested_but_unavailable";
  } | null;
  engine?: "m2" | "legacy";
  /** Null until Search Console is connected. */
  searchConsole: SearchConsoleData | null;
}

/* ------------------------------------------------------------------ */
/* Performance                                                         */
/* ------------------------------------------------------------------ */

export interface CoreWebVital {
  key: "lcp" | "inp" | "cls" | "ttfb";
  label: string;
  value: number;
  /** Formatted for display, e.g. `2.4 s`. */
  display: string;
  band: VitalBand;
  thresholds: { good: number; poor: number };
  /** Where the value was measured: real-user field data (CrUX) or a Lighthouse lab run. */
  source?: "field" | "lab";
  /** For field data: the URL itself, or the whole origin (never present it as one page). */
  scope?: "url" | "origin" | "lab";
  /** Share of real users in each band. Null when no field distribution exists. */
  distribution: { good: number; needsImprovement: number; poor: number } | null;
}

export interface PerformanceRecommendation {
  id: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  effort: "low" | "medium" | "high";
  /** Lighthouse-reported saving. Null for AI suggestions, which carry no measured saving. */
  estimatedSavingMs: number | null;
  affectedPages: number | null;
  fixGuideId: string;
  source?: "lighthouse" | "ai";
}

export type MeasurementStatus =
  | "measured"
  | "not_configured"
  | "not_authorized"
  | "no_data"
  | "pending"
  | "stale"
  | "rate_limited"
  | "failed";

/* ---- Milestone 3: measurement kinds are separate types on purpose ---------------- */

export type FieldMetricKey = "lcpMs" | "inpMs" | "cls" | "fcpMs" | "ttfbMs";

export interface FieldMetricValue {
  p75: number;
  category: VitalBand | null;
  distribution: { good: number; needsImprovement: number; poor: number } | null;
}

/** Real-user (Chrome UX Report) data. `scope` says whether it describes this URL or the whole origin. */
export interface FieldBlock {
  scope: "url" | "origin";
  source: "psi-loadingExperience" | "crux-api";
  formFactor: string | null;
  overallCategory: VitalBand | null;
  collectionPeriod: { start: string; end: string } | null;
  metrics: Partial<Record<FieldMetricKey, FieldMetricValue>>;
}

export interface LabMetrics {
  fcpMs: number | null;
  lcpMs: number | null;
  speedIndexMs: number | null;
  /** Lab proxy for responsiveness. NOT field INP. */
  tbtMs: number | null;
  cls: number | null;
  ttfbMs: number | null;
}

export interface LighthouseScores {
  performance: number | null;
  accessibility: number | null;
  seo: number | null;
  bestPractices: number | null;
}

export interface DeviceMeasurement {
  pageId: string;
  path: string | null;
  url: string;
  device: "mobile" | "desktop";
  measuredAt: IsoDate;
  lighthouseVersion: string | null;
  scores: LighthouseScores;
  lab: LabMetrics | null;
  field: FieldBlock | null;
  originField: FieldBlock | null;
  resources: { requests: number | null; totalKb: number | null; byType: { type: string; label: string; requests: number; kb: number }[] } | null;
  thirdParty: { name: string; kb: number; blockingMs: number; mainThreadMs: number }[];
  opportunities: { id: string; title: string; savingsMs: number | null; savingsKb: number | null; displayValue: string | null }[];
  diagnostics: { id: string; title: string; displayValue: string | null; score: number | null }[];
  accessibilityFailures: { id: string; title: string; description: string; count: number }[];
}

export interface CruxSnapshotView {
  status: "measured" | "no_data" | "blocked" | "failed" | "rate_limited" | string;
  fetchedAt: IsoDate;
  target: string;
  metrics: FieldBlock | null;
  history: { periodEnd: string; lcpMs: number | null; inpMs: number | null; cls: number | null }[] | null;
  collectionPeriod: { start: string; end: string } | null;
  errorCode: string | null;
  errorMessage: string | null;
}

export interface CruxOverview {
  configured: boolean;
  origin?: string | null;
  urlLevel: { mobile: CruxSnapshotView | null; desktop: CruxSnapshotView | null };
  originLevel: { all: CruxSnapshotView | null; mobile: CruxSnapshotView | null; desktop: CruxSnapshotView | null };
}

export interface PagePerformanceData {
  pageId: string;
  url: string;
  path: string;
  audited: boolean;
  psiConfigured: boolean;
  mobile: PerformanceDeviceBlock;
  desktop: PerformanceDeviceBlock;
  crux: CruxOverview;
  notice: string | null;
}

export interface PerformanceDeviceBlock {
  measured: DeviceMeasurement | null;
  /** A newer attempt that failed; the last good measurement is still in `measured`. */
  lastAttempt: { status: string; at: IsoDate; errorCode: string | null; errorMessage: string | null } | null;
  history: { at: IsoDate; performance: number | null; accessibility: number | null; seo: number | null; bestPractices: number | null; lcpMs: number | null; cls: number | null; tbtMs: number | null }[];
}

export interface PageSearchPerformance {
  property: string;
  pageUrl: string;
  matchedUrl: string | null;
  period: { start: string; end: string };
  previousPeriod: { start: string; end: string };
  totals: { clicks: number; impressions: number; ctr: number; position: number } | null;
  previous: { clicks: number; impressions: number; ctr: number; position: number } | null;
  deltas: { clicks: number | null; impressions: number | null; ctr: number | null; position: number | null } | null;
  queries: { query: string; clicks: number; impressions: number; ctr: number; position: number }[];
  daily: { date: string; clicks: number; impressions: number; ctr: number; position: number }[];
  devices: { device: string; clicks: number; impressions: number; ctr: number; position: number }[];
  countries: { country: string; clicks: number; impressions: number; ctr: number; position: number }[];
  queriesTruncated: boolean;
  note: string | null;
}

export interface PageSearchData {
  status: "available" | "not_configured" | "not_authorized" | "rate_limited" | "failed";
  reason: string | null;
  pageUrl: string;
  search: PageSearchPerformance | null;
  fetchedAt: IsoDate | null;
  cached?: boolean;
  source: string;
}

export interface UrlInspectionView {
  status: "inspected" | "failed" | "not_authorized" | "quota_exceeded" | "not_configured";
  url: string;
  property: string;
  inspectedAt: IsoDate;
  verdict: string | null;
  coverageState: string | null;
  indexingState: string | null;
  robotsTxtState: string | null;
  pageFetchState: string | null;
  lastCrawlTime: IsoDate | null;
  googleCanonical: string | null;
  userCanonical: string | null;
  details: { crawledAs?: string | null; canonicalMismatch?: boolean | null; sitemaps?: string[]; referringUrls?: string[]; mobileUsability?: { verdict: string | null; issues: string[] } | null; richResults?: { verdict: string | null; detected: string[] } | null } | null;
  errorCode: string | null;
  errorMessage: string | null;
  scopeNote: string;
  source: string;
}

export interface PageInspectionState {
  inspection: UrlInspectionView | null;
  connected: boolean;
  property: string | null;
  url: string;
}

export interface PerformanceData {
  /** Present from the M3 backend: the three measurement kinds, kept apart. */
  devices?: { mobile: DeviceMeasurement | null; desktop: DeviceMeasurement | null };
  headlinePage?: { pageId: string; path: string | null; url: string } | null;
  crux?: CruxOverview;
  audits?: { pagesAudited: number; measured: number; lastAttemptFailed: number };
  labels?: { kind: string; label: string; note: string }[];
  /** `measured` only when a real PageSpeed run produced these numbers. */
  status?: MeasurementStatus;
  /** Why the data is unavailable, when it is. */
  reason?: string | null;
  /** Human-readable measurement source, e.g. "Google PageSpeed Insights (Lighthouse mobile)". */
  source?: string | null;
  measuredAt?: IsoDate | null;
  strategy?: string | null;
  score: number | null;
  scoreDelta: number | null;
  vitals: CoreWebVital[];
  avgPageWeightKb: number | null;
  avgRequests: number | null;
  trend: { date: IsoDate; score: number; lcp: number | null; inp: number | null; cls: number | null }[];
  pages: {
    pageId: string;
    path: string;
    score: number;
    lcpMs: number | null;
    inpMs: number | null;
    cls: number | null;
    ttfbMs: number | null;
    pageWeightKb: number | null;
    url?: string;
    mobile?: DeviceMeasurement | null;
    desktop?: DeviceMeasurement | null;
  }[];
  resources: { label: string; weightKb: number; requests: number; share: number }[];
  thirdParty: { name: string; weightKb: number; blockingMs: number; pages: number }[];
  recommendations: PerformanceRecommendation[];
}

/* ------------------------------------------------------------------ */
/* Analytics (GA4) and tracking                                        */
/* ------------------------------------------------------------------ */

export interface AnalyticsKpi {
  key: string;
  label: string;
  value: string;
  raw: number;
  /** Percent change vs the previous equal period; null when unavailable. */
  delta: number | null;
  /** Lower is better for e.g. bounce rate. */
  inverse?: boolean;
}

export interface FunnelStage {
  key: string;
  label: string;
  value: number | null;
  /** Percentage of the previous stage, null when the stage is unavailable. */
  conversionPct: number | null;
  available: boolean;
  /** Why the stage has no data, e.g. "Requires Omni Tracking". */
  unavailableReason: string | null;
}

export interface AnalyticsData {
  period: string;
  kpis: AnalyticsKpi[];
  trend: { date: IsoDate; users: number; sessions: number; views: number }[];
  acquisition: { channel: string; users: number; sessions: number; engagementRate: number }[];
  topPages: { path: string; views: number; users: number; avgEngagementSec: number }[];
  landingPages: { path: string; sessions: number; bounceRate: number; conversions: number }[];
  devices: { device: string; users: number; share: number }[];
  geography: { country: string; users: number; share: number }[];
  newVsReturning: { label: string; users: number; share: number }[];
  events: { name: string; count: number; users: number; source: "ga4" | "omni-tracking" }[];
  conversions: { name: string; count: number; value: number | null; delta: number }[];
  funnel: FunnelStage[];
}

/* ------------------------------------------------------------------ */
/* Forms & CTAs                                                        */
/* ------------------------------------------------------------------ */

export type CtaKind =
  | "button"
  | "whatsapp"
  | "phone"
  | "email"
  | "donation"
  | "booking"
  | "external-checkout"
  | "link";

export interface FormFieldRecord {
  name: string;
  label: string | null;
  type: string;
  required: boolean;
  hasLabel: boolean;
  autocomplete: string | null;
}

export interface FormRecord {
  id: string;
  pageId: string;
  pagePath: string;
  /** Best guess from the fields present, e.g. "Contact", "Donation". */
  formType: string;
  fields: FormFieldRecord[];
  method: "GET" | "POST" | "unknown";
  action: string;
  actionSecure: boolean;
  requiredFields: number;
  /** Null when the snapshot predates markup extraction and no scan has run since. */
  consentDetected: boolean | null;
  captchaDetected: boolean | null;
  httpsPage: boolean;
  accessibilityFindings: string[];
  issueIds: string[];
  detectedAt: IsoDate;
}

export interface CtaRecord {
  id: string;
  pageId: string;
  pagePath: string;
  text: string;
  kind: CtaKind;
  destination: string;
  /** Rough placement, from the DOM position. */
  placement: "above-fold" | "below-fold" | "footer" | "header";
  status: CheckStatus;
  note: string | null;
}

export interface ContactLinkRecord {
  id: string;
  kind: Extract<CtaKind, "whatsapp" | "phone" | "email">;
  value: string;
  pages: number;
  status: CheckStatus;
  note: string | null;
}

export interface FormsData {
  /** "crawl" = read from markup during the last scan; "legacy" = older snapshot. */
  source?: "crawl" | "legacy";
  counts: {
    forms: number;
    ctas: number;
    whatsappLinks: number;
    phoneLinks: number;
    emailLinks: number;
    donationLinks: number;
    bookingLinks: number;
  };
  forms: FormRecord[];
  ctas: CtaRecord[];
  contactLinks: ContactLinkRecord[];
  issueIds: string[];
  /** Explains a partial result, e.g. "Run a scan to fill this in." */
  note?: string | null;
}

/* ------------------------------------------------------------------ */
/* Monitoring                                                          */
/* ------------------------------------------------------------------ */

export interface UptimeIncident {
  id: string;
  startedAt: IsoDate;
  endedAt: IsoDate | null;
  durationMinutes: number;
  kind: "down" | "degraded" | "ssl" | "timeout";
  httpStatus: number | null;
  note: string;
}

export interface UptimeData {
  status: LiveStatus;
  /** Null until a background prober has actually observed that window. */
  uptimePct30d: number | null;
  uptimePct90d: number | null;
  avgResponseMs: number | null;
  lastCheckedAt: IsoDate | null;
  lastDowntimeAt: IsoDate | null;
  /** Null when no scheduled monitoring is running. */
  checkIntervalMinutes: number | null;
  responseTrend: { date: IsoDate; responseMs: number | null; uptimePct: number | null }[];
  /** One entry per day, newest last — drives the uptime bar strip. */
  dailyStatus: { date: IsoDate; uptimePct: number; incidents: number }[];
  incidents: UptimeIncident[];
  /** Why the long-window numbers are missing, shown next to the stats. */
  note?: string | null;
}

export interface SslData {
  httpsEnabled: boolean | null;
  certificateValid: boolean | null;
  issuer: string | null;
  subject: string;
  validFrom: IsoDate | null;
  validTo: IsoDate | null;
  daysRemaining: number | null;
  protocol: string | null;
  hstsEnabled: boolean | null;
  /** Null when mixed content is not measured by the probe. */
  mixedContentPages: number | null;
}

export interface DnsData {
  resolves: boolean | null;
  resolvedIps: string[];
  nameservers: string[];
  records: { type: string; name: string; value: string; status: CheckStatus }[];
  /** Registrar/expiry needs a WHOIS provider we have not connected. */
  registrarDataAvailable: false;
  registrarNote: string;
}

export interface SecurityHeaderCheck {
  header: string;
  present: boolean;
  value: string | null;
  status: CheckStatus;
  recommendation: string;
}

export interface ErrorSample {
  id: string;
  path: string;
  status: number | "timeout" | "redirect-loop" | "unreachable";
  occurrences: number;
  firstSeenAt: IsoDate;
  lastSeenAt: IsoDate;
  referrer: string | null;
}

export interface ChangeRecord {
  id: string;
  path: string;
  field: string;
  previous: string;
  current: string;
  detectedAt: IsoDate;
  impact: "positive" | "negative" | "neutral";
}

export interface MonitoringData {
  uptime: UptimeData;
  ssl: SslData;
  dns: DnsData;
  securityHeaders: SecurityHeaderCheck[];
  errors: ErrorSample[];
  changes: ChangeRecord[];
}

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

export type CrawlFrequency = "manual" | "daily" | "weekly";

export interface CrawlSettings {
  frequency: CrawlFrequency;
  depth: number;
  maxPages: number;
  includePaths: string[];
  excludePaths: string[];
  respectRobots: boolean;
  crawlJs: boolean;
  concurrency?: number;
  requestTimeoutMs?: number;
  /** Empty means the default crawler user agent. */
  userAgent?: string;
  discoverSitemap?: boolean;
  checkExternalLinks?: boolean;
}

export interface MonitoringSettings {
  enabled: boolean;
  intervalMinutes: number;
  responseTimeThresholdMs: number;
  sslExpiryWarningDays: number;
  uptimeAlertThresholdPct: number;
  /** Alert rules, channels, recipients, quiet hours (M6). Absent on websites saved before M6. */
  alerts?: AlertSettings;
}

export interface NotificationSetting {
  key: string;
  label: string;
  description: string;
  email: boolean;
  inApp: boolean;
}

export interface TeamAccessRow {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface ReportSettings {
  scheduleEnabled: boolean;
  frequency: "weekly" | "monthly";
  recipients: string[];
  sections: string[];
  format: "pdf" | "csv";
}

export interface WebsiteSettings {
  crawl: CrawlSettings;
  monitoring: MonitoringSettings;
  notifications: NotificationSetting[];
  team: TeamAccessRow[];
  reports: ReportSettings;
  monitoringArchived: boolean;
}

/** Permissions used by the Team Access table. */
export const WEBSITE_PERMISSIONS = [
  "View Website",
  "Run Scan",
  "View SEO",
  "View Analytics",
  "Export",
  "Manage Monitoring",
  "Manage Integrations",
  "Manage Settings",
] as const;

export type WebsitePermission = (typeof WEBSITE_PERMISSIONS)[number];

/* ------------------------------------------------------------------ */
/* Provider surface                                                    */
/* ------------------------------------------------------------------ */

/**
 * Raised by a provider when the service behind a screen does not exist yet.
 * The UI renders this as an honest "service not available" state rather than
 * pretending there is no data.
 */
export class ServiceUnavailableError extends Error {
  readonly service: string;

  constructor(service: string, message?: string) {
    super(message ?? `${service} is not connected yet.`);
    this.name = "ServiceUnavailableError";
    this.service = service;
  }

  static is(error: unknown): error is ServiceUnavailableError {
    return error instanceof ServiceUnavailableError;
  }
}

/** Raised when the selected client has no website URL on their Client Profile. */
export class NoWebsiteConfiguredError extends Error {
  readonly clientId: string;

  constructor(clientId: string) {
    super("No website configured for this client.");
    this.name = "NoWebsiteConfiguredError";
    this.clientId = clientId;
  }

  static is(error: unknown): error is NoWebsiteConfiguredError {
    return error instanceof NoWebsiteConfiguredError;
  }
}

/**
 * Everything the Website module can ask for. The mock provider implements this
 * against an in-memory dataset; a future HTTP provider will implement exactly
 * the same surface against the crawler and integration services.
 */
export interface WebsiteDataProvider {
  readonly id: "mock" | "live";
  getTarget(clientId: string): Promise<WebsiteTarget>;
  getCapabilities(clientId: string): Promise<WebsiteCapabilityState>;
  getSummary(clientId: string): Promise<WebsiteSummary>;
  getTrend(clientId: string, days: 7 | 30 | 90): Promise<TrendPoint[]>;
  getTechnologies(clientId: string): Promise<TechnologyDetection[]>;
  getScans(clientId: string): Promise<ScanRecord[]>;
  getPages(clientId: string): Promise<PageRecord[]>;
  getPageAudit(clientId: string, pageId: string): Promise<PageAudit>;
  getIssues(clientId: string): Promise<IssueRecord[]>;
  getFixGuide(guideId: string): Promise<FixGuide>;
  getSeo(clientId: string): Promise<SeoData>;
  getPerformance(clientId: string): Promise<PerformanceData>;
  /** Null when GA4 is not connected — the UI renders the connect state. */
  getAnalytics(clientId: string, period: string): Promise<AnalyticsData | null>;
  getForms(clientId: string): Promise<FormsData>;
  getMonitoring(clientId: string): Promise<MonitoringData>;
  getSettings(clientId: string): Promise<WebsiteSettings>;
  getKeywordResearch(clientId: string, period?: SearchPeriod): Promise<KeywordResearchData[]>;
  getSearchConsole(clientId: string, period: SearchPeriod, refresh?: boolean): Promise<SearchConsoleData>;
  getSearchQueryDetail(clientId: string, query: string, period: SearchPeriod): Promise<SearchQueryDetail>;
  getCompetitorAnalysis(clientId: string): Promise<CompetitorData[]>;
  addCompetitor(clientId: string, url: string): Promise<CompetitorData>;
  analyzeCompetitor(clientId: string, id: string): Promise<CompetitorData>;
  analyzeCompetitorWithAi(clientId: string, id: string): Promise<CompetitorAiRun>;
  deleteCompetitor(clientId: string, id: string): Promise<{ deleted: boolean }>;
  getTracking(clientId: string, period: string): Promise<AnalyticsData & { settings?: TrackingSettings; quotas?: Record<string, unknown>; disclosure?: string }>;
  getTrackingSnippet(clientId: string): Promise<TrackingSnippetView>;
  verifyTracking(clientId: string): Promise<{ siteKey: string; status: string; found: boolean; note: string; checkedAt: IsoDate | null }>;
  updateTrackingSettings(clientId: string, settings: Partial<TrackingSettings>): Promise<{ siteKey: string; settings: TrackingSettings; disclosure: string }>;
  getBacklinkAnalysis(clientId: string): Promise<BacklinkData[]>;
  getRankTracking(clientId: string, period?: SearchPeriod): Promise<RankTrackingData[]>;
  getSheets(clientId: string): Promise<SheetsStatus>;
  connectSheets(clientId: string, url: string): Promise<SheetsStatus>;
  disconnectSheets(clientId: string): Promise<SheetsStatus>;
  exportToSheets(clientId: string, dataset: SheetsDataset, period: SearchPeriod): Promise<SheetsStatus>;
  getCrawlLimits(clientId: string): Promise<CrawlLimits>;
  getPagePerformance(clientId: string, pageId: string): Promise<PagePerformanceData>;
  getPageSearch(clientId: string, pageId: string, refresh?: boolean): Promise<PageSearchData>;
  getPageInspection(clientId: string, pageId: string): Promise<PageInspectionState>;
  inspectPage(clientId: string, pageId: string): Promise<UrlInspectionView>;
  getPageHistory(clientId: string, pageId: string): Promise<PageHistoryEntry[]>;
  getReportMeta(clientId: string): Promise<ReportMeta>;
  listReports(clientId: string): Promise<ReportView[]>;
  getReport(clientId: string, id: string): Promise<ReportView>;
  generateReport(clientId: string, input: GenerateReportInput): Promise<ReportView>;
  cancelReport(clientId: string, id: string): Promise<ReportView>;
  deleteReport(clientId: string, id: string): Promise<{ deleted: boolean }>;
  downloadReport(clientId: string, id: string): Promise<{ blob: Blob; fileName: string }>;
  listReportSchedules(clientId: string): Promise<ReportScheduleView[]>;
  saveReportSchedule(clientId: string, input: ReportScheduleInput, id?: string): Promise<ReportScheduleView>;
  deleteReportSchedule(clientId: string, id: string): Promise<{ deleted: boolean }>;
  getMonitoringOverview(clientId: string): Promise<MonitoringOverview>;
  sendTestAlert(clientId: string): Promise<{ alertId: string; deliveries: number } | null>;
  getAiStatus(clientId: string): Promise<AiStatus>;
  getAiSummary(clientId: string): Promise<AiSiteSummary>;
  getPageAi(clientId: string, pageId: string): Promise<AiPageInsights>;
  setAiRecommendationStatus(clientId: string, id: string, status: AiRecommendationStatus): Promise<AiRecommendation>;

  /* Commands ------------------------------------------------------- */
  startScan(clientId: string, type: ScanType, pageId?: string, options?: ScanStartOptions): Promise<ScanProgress>;
  cancelScan(clientId: string, scanId: string): Promise<ScanProgress>;
  getScanProgress(clientId: string, scanId: string): Promise<ScanProgress>;
  saveSettings(clientId: string, settings: WebsiteSettings): Promise<WebsiteSettings>;
  setIssueStatus(clientId: string, issueId: string, status: IssueStatus): Promise<IssueRecord>;
  connectIntegration(
    clientId: string,
    key: IntegrationKey,
    property: string,
  ): Promise<WebsiteCapabilityState>;
  disconnectIntegration(clientId: string, key: IntegrationKey): Promise<WebsiteCapabilityState>;
  archiveMonitoring(clientId: string, archived: boolean): Promise<WebsiteSettings>;
}


/* ---- Milestone 5: AI intelligence ------------------------------------------------------------------ */

export type AiMode = "auto" | "openai" | "gemini" | "dual_review" | "disabled";
export type AiRecommendationStatus = "proposed" | "approved" | "dismissed";
export type AiAnalysisStatus =
  | "completed"
  | "rejected"
  | "failed"
  | "provider_unavailable"
  | "budget_exhausted"
  | "token_limit"
  | "disabled";

export interface AiProviderState {
  provider: "openai" | "gemini";
  configured: boolean;
  model: string;
  state: "ready" | "degraded" | "unavailable" | "not_configured";
  lastOkAt: IsoDate | null;
  lastError: { code: string; at: IsoDate } | null;
  circuitOpenUntil: IsoDate | null;
}

export interface AiUsage {
  windowHours: number;
  calls: number;
  callLimit: number;
  tokens: number;
  estimatedCostMicros: number;
  budgetMicros: number;
  remainingMicros: number;
  budgetExhausted: boolean;
  currency: string;
  pricingVersion: string;
}

export interface AiStatus {
  mode: AiMode;
  available: boolean;
  usage: { windowHours: number; budgetExhausted: boolean };
}

export interface AiAnalysisView {
  id: string;
  task: "technical_seo" | "content_quality" | "executive_summary";
  status: AiAnalysisStatus;
  mode: AiMode;
  generatedAt: IsoDate;
  evidenceHash: string;
  /** The page's evidence changed after this analysis was produced. */
  stale: boolean;
  summary: string | null;
  limitations: string[];
  evidenceMissing: string[];
  /** Number of high-impact findings that were independently re-checked (dual review). */
  reviewed: number;
  rejectedCount: number;
  errorCode: string | null;
  /** Customer-safe wording. Never contains vendor names, HTTP details or raw provider text. */
  errorMessage: string | null;
  /** Platform-staff diagnostics only; absent for customers. */
  provider?: string;
  model?: string;
  fallbackFrom?: string | null;
  usage?: { inputTokens: number | null; outputTokens: number | null; estimatedCostMicros: number; currency: string | null; estimated: boolean; latencyMs: number } | null;
}

export interface AiRecommendation {
  id: string;
  pageId: string;
  analysisId: string;
  scanId: string | null;
  category: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  priority: number;
  finding: string;
  explanation: string;
  suggestedFix: string;
  verification: string;
  evidenceIds: string[];
  confidence: number;
  /** Platform-staff diagnostics only; absent for customers. */
  provider?: string;
  model?: string;
  status: AiRecommendationStatus;
  generatedAt: IsoDate;
  statusChangedAt: IsoDate | null;
  requiresHumanApproval: boolean;
  /** A validated metadata rewrite the model proposed (title or description). Never applied automatically. */
  proposal?: { field: "title" | "description"; text: string } | null;
}

export interface AiEvidenceRef {
  id: string;
  label: string;
  value: unknown;
  source: string;
  kind: string;
  untrusted: boolean;
}

export interface AiPageInsights {
  pageId: string;
  evidenceHash: string | null;
  evidence: AiEvidenceRef[];
  evidenceMissing: string[];
  analyses: { task: "technical_seo" | "content_quality"; latestAttempt: AiAnalysisView | null; current: AiAnalysisView | null }[];
  recommendations: AiRecommendation[];
  mode: AiMode;
  available: boolean;
  budgetExhausted: boolean;
}

export interface AiSiteListItem {
  title?: string;
  explanation?: string;
  action?: string;
  reason?: string;
  pageId?: string;
  evidenceIds: string[];
}

export interface AiSiteSummary {
  available: boolean;
  budgetExhausted: boolean;
  latestAttempt: AiAnalysisView | null;
  current:
    | (AiAnalysisView & {
        result: {
          summary: string;
          urgentIssues: AiSiteListItem[];
          highImpactPages: AiSiteListItem[];
          technicalPriorities: AiSiteListItem[];
          contentOpportunities: AiSiteListItem[];
          searchStrategy: AiSiteListItem[];
          plan7Days: AiSiteListItem[];
          plan30Days: AiSiteListItem[];
          limitations: string[];
          basedOnFindings?: number;
          generatedAt?: IsoDate;
        };
      })
    | null;
  pagesAnalysed: number;
  proposedRecommendations: number;
}


/* ---- Milestone 6: incidents, alerts and channels --------------------------------------------------- */

export type AlertRuleKey =
  | "siteDown" | "siteRecovered" | "ssl" | "dns" | "seoCritical" | "perfRegression" | "crawlFailure" | "monitoringFailure" | "integrationDisconnected";

export interface AlertSettings {
  channels: { inApp: boolean; email: boolean; whatsapp: boolean };
  recipients: { emails: string[]; phones: string[] };
  whatsappTemplateId: string | null;
  quietHours: { enabled: boolean; start: string; end: string; timezone: string; allowCritical: boolean };
  cooldownMinutes: number;
  confirmationChecks: number;
  rules: Record<AlertRuleKey, boolean>;
  escalation: { enabled: boolean; afterMinutes: number; emails: string[] };
  perfRegressionPoints: number;
}

export interface UptimeWindowStat {
  checks: number;
  uptimePct: number | null;
  avgResponseMs: number | null;
  /** Share of the window that recorded history actually spans. */
  coveragePct: number;
  insufficient: boolean;
}

export type IncidentLifecycle = "SUSPECTED" | "CONFIRMED" | "ONGOING" | "RECOVERED" | "RESOLVED";

export interface MonitoringIncident {
  id: string;
  status: IncidentLifecycle;
  kind: string;
  url: string;
  reason: string | null;
  httpStatus: number | null;
  failedChecks: number;
  startedAt: IsoDate;
  confirmedAt: IsoDate | null;
  recoveredAt: IsoDate | null;
  resolvedAt: IsoDate | null;
  durationMs: number | null;
  falsePositive: boolean;
  escalated: boolean;
  location: string;
}

export interface AlertDeliveryView {
  id: string;
  channel: "in_app" | "email" | "whatsapp";
  status: "queued" | "sent" | "handed_off" | "failed" | "skipped";
  reason: string | null;
  recipient: string | null;
  attempts: number;
  error: string | null;
  completedAt: IsoDate | null;
  /** WhatsApp only: the provider's own status for the message, when known. */
  providerStatus: string | null;
}

export interface AlertEventView {
  id: string;
  type: string;
  severity: "critical" | "high" | "medium" | "info";
  title: string;
  message: string;
  createdAt: IsoDate;
  incidentId: string | null;
  deliveries: AlertDeliveryView[];
}

export interface MonitoringOverview {
  generatedAt: IsoDate;
  coverage: {
    locations: { name: string; note: string }[];
    intervalMinutes: number;
    enabled: boolean;
    scheduled: boolean;
    reason: string | null;
    firstCheckAt: IsoDate | null;
    totalChecks: number;
  };
  status: { state: "up" | "down" | "degraded" | "paused" | "unknown"; lastCheckAt: IsoDate | null; lastSuccessAt: IsoDate | null; lastHttpStatus: number | null; lastResponseMs: number | null };
  uptime: { h24: UptimeWindowStat; d7: UptimeWindowStat; d30: UptimeWindowStat; d90: UptimeWindowStat };
  responseSeries: { at: IsoDate; avgMs: number | null; maxMs: number | null; checks: number; failed: number }[];
  ssl: { status: string; validTo: IsoDate | null; issuer: string | null; daysLeft: number | null; warningDays: number; checkedAt: IsoDate | null; error: string | null };
  dns: { checkedAt: IsoDate | null; changedAt: IsoDate | null; records: { a?: string[]; aaaa?: string[]; cname?: string[]; ns?: string[]; mx?: string[] } | null };
  activeIncident: MonitoringIncident | null;
  incidents: MonitoringIncident[];
  rules: Record<AlertRuleKey, boolean>;
  alertSettings: AlertSettings;
  channels: {
    inApp: { enabled: boolean; available: boolean };
    email: { enabled: boolean; smtpConfigured: boolean; recipients: number; usesOwners: boolean; active: boolean };
    whatsapp: {
      enabled: boolean;
      template: { id: string; name: string; approved: boolean; connected: boolean } | null;
      recipients: number;
      active: boolean;
      availableTemplates: { id: string; name: string; approved: boolean; variables: string[] }[];
    };
  };
  alerts: AlertEventView[];
}


/* ---- Milestone 7: reports ---------------------------------------------------------------------------- */

export type ReportTypeKey =
  | "complete" | "technical_seo" | "page" | "performance" | "search_console" | "ga4" | "monitoring" | "ai_actions" | "comparison";
export type ReportFormatKey = "pdf" | "csv";
export type ReportStatusKey = "queued" | "running" | "completed" | "partial" | "failed" | "cancelled";

export interface ReportView {
  id: string;
  type: ReportTypeKey;
  typeLabel: string;
  format: ReportFormatKey;
  status: ReportStatusKey;
  progress: number;
  stage: string | null;
  title: string;
  pageId: string | null;
  params: { rangeDays?: number; from?: string; to?: string; table?: string; pageId?: string };
  version: number;
  sizeBytes: number | null;
  fileName: string | null;
  /** Data that was unavailable when the report was built (it is stated inside the report as well). */
  notes: string[];
  error: { code: string | null; message: string | null } | null;
  scheduled: boolean;
  scheduleId: string | null;
  downloadable: boolean;
  createdAt: IsoDate;
  startedAt: IsoDate | null;
  completedAt: IsoDate | null;
  expiresAt: IsoDate | null;
  deduplicated?: boolean;
  deliveries?: { id: string; channel: string; status: string; reason: string | null; recipient: string | null; attempts: number; error: string | null; completedAt: IsoDate | null }[];
}

export interface ReportMeta {
  types: { type: ReportTypeKey; label: string; needsPage: boolean; csv: boolean; schedulable: boolean }[];
  formats: ReportFormatKey[];
  rangeOptions: number[];
  scheduler: { running: boolean; emailConfigured: boolean; reason: string | null; emailReason: string | null };
  limits: { dailyPerCompany: number; maxBytes: number; retentionDays: number };
}

export interface GenerateReportInput {
  type: ReportTypeKey;
  format: ReportFormatKey;
  rangeDays?: number;
  pageId?: string;
  table?: string;
}

export interface ReportScheduleView {
  id: string;
  name: string;
  type: ReportTypeKey;
  typeLabel: string;
  format: ReportFormatKey;
  frequency: "daily" | "weekly" | "monthly";
  dayOfWeek: number | null;
  dayOfMonth: number | null;
  timeOfDay: string;
  timezone: string;
  rangeDays: number;
  recipients: string[];
  deliverInApp: boolean;
  enabled: boolean;
  lastRunAt: IsoDate | null;
  lastStatus: string | null;
  lastReportId: string | null;
  nextRunAt: IsoDate | null;
}

export interface ReportScheduleInput {
  name?: string;
  type: ReportTypeKey;
  format?: ReportFormatKey;
  frequency: "daily" | "weekly" | "monthly";
  dayOfWeek?: number;
  dayOfMonth?: number;
  timeOfDay?: string;
  timezone?: string;
  rangeDays?: number;
  recipients?: string[];
  deliverInApp?: boolean;
  enabled?: boolean;
}
