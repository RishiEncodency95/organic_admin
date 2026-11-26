import type { ProfileId,CrawlBudget } from "./industry-api";
import type { BusinessIntelligence } from "./business-types";
import { apiClient } from "@/components/infrastructure/lib/client";
import { companyScopeHeaders } from "@/components/infrastructure/lib/company-scope";
import { env } from "@/components/infrastructure/lib/env";

/** `name` is what the site calls itself (from its home page); null when none was found. */
export interface StudySite { url: string; domain: string; role: "own" | "competitor"; name?: string | null }

export interface SiteMetrics {
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

export interface TechSignals {
  titleLength: number;
  descriptionLength: number;
  h1Count: number;
  headline: string | null;
  canonical: boolean;
  openGraph: boolean;
  viewport: boolean;
  lang: string | null;
  imagesTotal: number;
  imagesWithAlt: number;
  internalLinks: number;
  hasBlog: boolean | null;
  latestDate: string | null;
  robotsTxt: boolean | null;
  sitemapUrls: number | null;
  sitemapRecent30?: number | null;
  sitemapRecent90?: number | null;
  sitemapLatest?: string | null;
}

/** Your own Google Search Console data (last 28 days); only on your site. */
export interface OwnSearch {
  property: string;
  range: { start: string; end: string };
  totals: { clicks: number; impressions: number; ctr: number; position: number };
  queries: { query: string; clicks: number; impressions: number; position: number }[];
}

/** Measured for one site in one run; nothing here is estimated. */
export interface StatedRating { value: number; best: number; ratings: number | null; reviews: number | null; about: string | null; url: string }
export interface SiteEvidence {
  url: string;
  domain: string;
  role: "own" | "competitor";
  reachable: boolean;
  error: string | null;
  /** The other website this address sends visitors to; then nothing was read or scored (runs from 2026-10-26 on). */
  movedTo?: string | null;
  /** Star rating the site states in its own structured data (not verified on Google). Runs from 2026-10-26 on. */
  statedRating?: StatedRating | null;
  name: string | null;
  title: string | null;
  description: string | null;
  image: string | null;
  /** Mobile screenshot of the home page from Google PageSpeed (data URL). */
  screenshot?: string | null;
  https: boolean;
  pages: { url: string; title: string; description: string; words: number; headings: number; ctas: string[]; kind?: PageKind; method?: "static" | "rendered"; h1?: string | null }[];
  metrics: SiteMetrics;
  tech?: TechSignals | null;
  features?: SiteFeatures;
  coverage?: CrawlCoverage;
  speed: { performance: number | null; seo: number | null; accessibility: number | null; bestPractices: number | null; lcpMs: number | null; cls: number | null; tbtMs: number | null; field?: RealUserSpeed | null } | null;
  speedError: string | null;
  search?: OwnSearch | null;
  /** Social profiles the site links to; numbers only where an official API gives them (checks from 2026-10-23 on). */
  socials?: SiteSocials;
  brand: { status: "matched" | "possible" | "not_found" | "unavailable"; name: string | null; description: string | null; wikipediaUrl: string | null } | null;
}

export type SpeedCategory = "good" | "needs-improvement" | "poor";
/** Real visitors' speed from Google's Chrome UX Report (last 28 days, phones). null = too few visitors; absent = older check. */
export interface RealUserSpeed {
  scope: "url" | "origin";
  overall: SpeedCategory | null;
  lcpMs: { p75: number; category: SpeedCategory | null } | null;
  inpMs: { p75: number; category: SpeedCategory | null } | null;
  cls: { p75: number; category: SpeedCategory | null } | null;
}

export type SocialPlatform = "youtube" | "instagram" | "facebook" | "linkedin" | "x" | "pinterest" | "threads" | "tiktok" | "whatsapp" | "telegram";
export interface SocialProfile { platform: SocialPlatform; url: string; handle: string | null }
export type YouTubeStats =
  | { status: "ok"; channelId: string; title: string; subscribers: number | null; videos: number; views: number; lastUploadAt: string | null; url: string }
  | { status: "unresolved" | "not_found" | "unavailable" | "error"; message: string; url: string };
export type InstagramStats =
  | { status: "ok"; username: string; name: string | null; followers: number; posts: number; lastPostAt: string | null; url: string }
  | { status: "unavailable" | "not_found" | "error"; message: string; url: string };
export interface SiteSocials { profiles: SocialProfile[]; youtube: YouTubeStats | null; instagram: InstagramStats | null; checkedAt: string }

export type FeatureState = "present" | "absent_confirmed" | "not_observed" | "render_failed";
export type PageKind = "home" | "about" | "contact" | "services" | "products" | "pricing" | "events" | "projects" | "gallery" | "blog" | "team" | "faq" | "locations" | "clients" | "testimonials" | "other";
export interface FeatureAssertion { state: FeatureState; evidence: { url: string; snippet: string; method: "static" | "rendered" }[] }
export interface SiteFeatures {
  blog: FeatureAssertion;
  contactForm: FeatureAssertion;
  phone: FeatureAssertion;
  email: FeatureAssertion;
  whatsapp: FeatureAssertion;
  portfolio: FeatureAssertion;
  clients: FeatureAssertion;
  testimonials: FeatureAssertion;
  /** Added 2026-10-23; absent on older checks. */
  products?: FeatureAssertion;
  onlineStore?: FeatureAssertion;
  prices?: FeatureAssertion;
  events?: FeatureAssertion;
}
export interface CrawlCoverage {
  discovered: number;
  selected: number;
  read: number;
  rendered: number;
  failed: number;
  score: number;
  status: "complete" | "partial" | "insufficient";
  pageTypes: PageKind[];
  warnings: string[];
}
export interface AnalysisQuality {
  status: "verified" | "partial" | "needs_review";
  score: number;
  issues: { severity: "warning" | "error"; domain: string | null; code: string; message: string }[];
  rule: "No evidence = not verified";
}

export interface CitedPoint { point: string; evidence: string; url: string }
export interface AnalyzerResult {
  overview: string;
  sites: { domain: string; summary: string; audience: string; positioning: string; promise?: string; tone?: string; offerings: string[]; strengths: CitedPoint[]; weaknesses: CitedPoint[] }[];
  scores: { area: string; scores: Record<string, number>; leader: string | null; note: string }[];
  overall: Record<string, number>;
  headToHead: { competitor: string; threat?: "high" | "medium" | "low"; threatReason?: string; theyLead: { point: string; url: string }[]; youLead: { point: string; url: string }[]; verdict: string }[];
  gaps: { topic: string; competitors: string[]; why: string; url: string }[];
  opportunities: string[];
  actions: { priority: "high" | "medium" | "low"; action: string; reason: string; effort: "low" | "medium" | "high"; impact?: "high" | "medium" | "low"; when?: "this week" | "this month" | "this quarter"; learnFrom: string | null; evidenceUrls?: string[] }[];
  /** Absent on reports made before the deeper analysis (2026-10-22.2). */
  swot?: { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] };
  topics?: { topic: string; sites: string[] }[];
  contentIdeas?: { title: string; format: "page" | "blog" | "faq" | "video" | "guide"; why: string; inspiredBy: string | null; outline?: string[]; keywords?: string[] }[];
}

/** A fact a website states about itself, with the page and the exact words it came from. */
export interface OfferFact { value: string; url: string; quote: string }
export interface LabeledFact extends OfferFact { label: string }
export const OFFER_FIELDS = ["eventName", "dates", "location", "exhibitors", "visitors", "stallPrice", "ticketPrice", "deadline"] as const;
export type OfferField = (typeof OFFER_FIELDS)[number];
/** `products` / `services` (value = the name as written) exist only on runs from 2026-10-26 on. */
export type SiteOffers = { domain: string; products?: OfferFact[]; services?: OfferFact[]; prices: LabeledFact[]; claims: LabeledFact[] } & Record<OfferField, OfferFact | null>;
export interface OffersBlock { status: "completed" | "failed"; generatedAt: string; sites: SiteOffers[]; dropped: number; reason?: string }

export type AiBlock =
  | { status: "completed"; generatedAt: string; dropped: number; result: AnalyzerResult; quality?: AnalysisQuality; offers?: OffersBlock }
  | { status: "unavailable" | "failed"; reason: string; quality?: AnalysisQuality; offers?: OffersBlock };

export interface SiteChange { domain: string; kind: string; direction: "up" | "down" | "neutral"; text: string }

export interface RunSummary { id: string; status: "running" | "completed" | "failed" | "cancelled"; stage: string | null; startedAt: string; finishedAt: string | null; errorMessage: string | null }
export interface CanonicalReportModel {
  businessIntelligence?:BusinessIntelligence|null;
  version: "competitor-report-2";
  checkedAt: string;
  sites: SiteEvidence[];
  analysis: AnalyzerResult | null;
  summary: string;
  quality: AnalysisQuality;
  businessThreat: { status: "not_assessed"; message: string };
  methodology: { rule: "No evidence = not verified"; browserFallback: boolean; deterministicScores: true };
}
export interface RunReport extends RunSummary { businessIntelligence?:BusinessIntelligence|null; crawlUsage?:Record<string,unknown>; profileResults?: ProfileResults; sites: SiteEvidence[]; ai: AiBlock | null; model?: CanonicalReportModel; changes: { since: string; items: SiteChange[] } | null; costUsd: number | null }

export type Schedule = "off" | "weekly" | "monthly";
export interface StudySettings { schedule: Schedule; alerts: boolean; reportEmails: string[]; reportMonthly: boolean }
export type ActionStatus = "todo" | "doing" | "done";
export interface ActionState { status: ActionStatus; action: string; taskId?: string | null; updatedAt: string; updatedBy?: string | null }

export interface StudyListItem {
  id: string;
  name: string;
  clientId: string | null;
  sites: StudySite[];
  updatedAt: string;
  schedule?: Schedule;
  nextCheckAt?: string | null;
  /** Scores come from the last finished check; `checkedAt` is when it finished. */
  latestRun: (RunSummary & { overall: Record<string, number> | null; checkedAt?: string | null }) | null;
  summary?: {
    overview: string;
    threats: { domain: string; threat: "high" | "medium" | "low" | null }[];
    gaps: number;
    actions: { total: number; high: number; done: number; doing: number };
  } | null;
}

export interface StudyDetail {
  profile?:ProfileId;
  crawlBudget?:CrawlBudget;
  id: string;
  name: string;
  clientId: string | null;
  sites: StudySite[];
  createdAt: string;
  updatedAt: string;
  linkedClient?: { id: string; name: string } | null;
  settings?: StudySettings;
  actions?: Record<string, ActionState>;
  nextCheckAt?: string | null;
  nextReportAt?: string | null;
  latestRun: RunSummary | null;
  report: (RunReport & { previous?: { at: string; overall: Record<string, number> | null; scores: Record<string, Record<string, number>> } | null }) | null;
  history: { id: string; at: string; overall: Record<string, number> | null; speed: Record<string, number | null> }[];
}

export interface CompetitorSuggestion { name: string; domain: string; url: string; siteName: string | null; why: string; source: "ai" | "knowledge_graph" | "web_search"; classification?:"direct"|"adjacent"; relevanceScore?:number; verifiedAt?:string; warnings?:string[]; verification?:{officialDomain:string;geography:string;eventVenue:string;businessModel:string;eventActivity:string;audience:string}; evidence?:{url:string;quote:string;observedAt:string;kind:string;criterion:string}[] }
export type SuggestScope = "city" | "state" | "country";
export interface SitePlace { label: string; city: string | null; state: string | null; country: string | null; quote: string }
export interface SiteLocation { city: string | null; state: string | null; country: string | null; basis: string; places?: SitePlace[]; pages?: string[]; cached: boolean }
export interface SuggestionResult { status?:"queued"|"running"|"completed"|"failed";runId?:string;message?:string;methodology?:{version:string;candidatePool:number;verifiedCandidates:number;maxSuggestions:number;httpRequests:number;maxHttpRequests:number;source:string}; business: { what: string; where: string | null }; scope?: SuggestScope; place?: string; area?: string | null; suggestions: CompetitorSuggestion[]; dropped: number; cached: boolean; at: string }

export interface StudyShare {
  id: string;
  token: string;
  label: string | null;
  lang: "en" | "hi";
  status: "active" | "expired" | "revoked";
  expiresAt: string;
  revokedAt: string | null;
  viewCount: number;
  lastViewedAt: string | null;
  createdAt: string;
}
/** What a share link returns: the report without anything internal to the company. */
export interface SharedReport { share: { preparedBy: string | null; expiresAt: string; lang: "en" | "hi" }; study: StudyDetail }

async function publicFetch(path: string): Promise<Response> {
  const response = await fetch(`${env.apiBaseUrl}${path}`, { credentials: "omit", headers: { "ngrok-skip-browser-warning": "true" } });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { message?: string | string[] };
    throw Object.assign(new Error(Array.isArray(body.message) ? body.message.join(" ") : body.message ?? "This link could not be opened."), { status: response.status });
  }
  return response;
}

/** Share links are opened without login, so these calls send no cookie and no company header. */
export const sharedApi = {
  get: async (token: string) => { const payload = await (await publicFetch(`/public/competitor-reports/${encodeURIComponent(token)}`)).json(); return payload.data as SharedReport; },
  async pdf(token: string, lang: "en" | "hi"): Promise<{ blob: Blob; fileName: string }> {
    const response = await publicFetch(`/public/competitor-reports/${encodeURIComponent(token)}/pdf${lang === "hi" ? "?lang=hi" : ""}`);
    const fileName = /filename="([^"]+)"/.exec(response.headers.get("content-disposition") ?? "")?.[1] ?? "competitor-report.pdf";
    return { blob: await response.blob(), fileName };
  },
};

export interface LookupResult { name: string; description: string | null; url: string; domain: string | null; imageUrl: string | null }

/** Competitor Analyzer. Company-wide: no Client header. Read = clients:read, change/run = clients:write. */
export const analyzerApi = {
  list: (companyId: string) => apiClient.request<StudyListItem[]>({ method: "GET", path: "/competitor-analyzer/studies", headers: companyScopeHeaders(companyId) }),
  get: (companyId: string, id: string) => apiClient.request<StudyDetail>({ method: "GET", path: `/competitor-analyzer/studies/${encodeURIComponent(id)}`, headers: companyScopeHeaders(companyId) }),
  create: (companyId: string, body: { name?: string; own: string; competitors: string[]; clientId?: string; names?: Record<string, string>; profile?: ProfileId; crawlBudget?:CrawlBudget }) =>
    apiClient.request<StudyDetail>({ method: "POST", path: "/competitor-analyzer/studies", headers: companyScopeHeaders(companyId), body }),
  update: (companyId: string, id: string, body: { name?: string; own?: string; competitors?: string[]; names?: Record<string, string>; profile?: ProfileId; crawlBudget?:CrawlBudget }) =>
    apiClient.request<StudyDetail>({ method: "PATCH", path: `/competitor-analyzer/studies/${encodeURIComponent(id)}`, headers: companyScopeHeaders(companyId), body }),
  archive: (companyId: string, id: string) => apiClient.request<void>({ method: "DELETE", path: `/competitor-analyzer/studies/${encodeURIComponent(id)}`, headers: companyScopeHeaders(companyId) }),
  stopRun: (companyId: string, id: string, runId: string) =>
    apiClient.request<RunSummary>({ method: "POST", path: `/competitor-analyzer/studies/${encodeURIComponent(id)}/runs/${encodeURIComponent(runId)}/stop`, headers: companyScopeHeaders(companyId), body: {} }),
  run: (companyId: string, id: string) => apiClient.request<{ run: RunSummary; reused: boolean }>({ method: "POST", path: `/competitor-analyzer/studies/${encodeURIComponent(id)}/runs`, headers: companyScopeHeaders(companyId), body: {} }),
  /** The PDF is private: fetched with the session cookie and handed to the browser as a blob, never as a public URL. */
  async downloadReport(companyId: string, id: string, lang: "en" | "hi" = "en"): Promise<{ blob: Blob; fileName: string }> {
    const path = `/competitor-analyzer/studies/${encodeURIComponent(id)}/report${lang === "hi" ? "?lang=hi" : ""}`;
    return { blob: await apiClient.download(path), fileName: `competitor-report-${lang}.pdf` };
  },
  updateSettings: (companyId: string, id: string, body: Partial<StudySettings>) =>
    apiClient.request<StudyDetail>({ method: "PATCH", path: `/competitor-analyzer/studies/${encodeURIComponent(id)}/settings`, headers: companyScopeHeaders(companyId), body }),
  setActionStatus: (companyId: string, id: string, body: { action: string; status: ActionStatus }) =>
    apiClient.request<{ key: string; state: ActionState }>({ method: "PATCH", path: `/competitor-analyzer/studies/${encodeURIComponent(id)}/actions`, headers: companyScopeHeaders(companyId), body }),
  createActionTask: (companyId: string, id: string, body: { action: string; reason?: string; priority?: "high" | "medium" | "low" }) =>
    apiClient.request<{ key: string; state: ActionState; taskId: string; created: boolean }>({ method: "POST", path: `/competitor-analyzer/studies/${encodeURIComponent(id)}/actions/task`, headers: companyScopeHeaders(companyId), body }),
  emailReport: (companyId: string, id: string, to: string[]) =>
    apiClient.request<{ sent: number; to: string[] }>({ method: "POST", path: `/competitor-analyzer/studies/${encodeURIComponent(id)}/report/email`, headers: companyScopeHeaders(companyId), body: { to } }),
  shares: (companyId: string, id: string) => apiClient.request<StudyShare[]>({ method: "GET", path: `/competitor-analyzer/studies/${encodeURIComponent(id)}/shares`, headers: companyScopeHeaders(companyId) }),
  createShare: (companyId: string, id: string, body: { days: 7 | 30 | 90; lang?: "en" | "hi"; label?: string }) =>
    apiClient.request<StudyShare>({ method: "POST", path: `/competitor-analyzer/studies/${encodeURIComponent(id)}/shares`, headers: companyScopeHeaders(companyId), body }),
  revokeShare: (companyId: string, id: string, shareId: string) =>
    apiClient.request<StudyShare>({ method: "DELETE", path: `/competitor-analyzer/studies/${encodeURIComponent(id)}/shares/${encodeURIComponent(shareId)}`, headers: companyScopeHeaders(companyId) }),
  /** Reads only the site's home page to show its name while the address is typed. */
  siteName: (companyId: string, url: string) =>
    apiClient.request<{ domain: string; url: string; name: string | null; reachable: boolean; movedTo?: string | null }>({ method: "GET", path: "/competitor-analyzer/site-name", headers: companyScopeHeaders(companyId), query: { url } }),
  /** Competitor websites for a site, each checked to open (uses a little of today's AI limit; cached 7 days per website). */
  location: (companyId: string, url: string) => apiClient.request<SiteLocation>({ method: "GET", path: "/competitor-analyzer/location", headers: companyScopeHeaders(companyId), query: { url } }),
  suggest: (companyId: string, url: string, scope: SuggestScope, place: string, profile?:ProfileId) =>
    apiClient.request<SuggestionResult>({ method: "GET", path: "/competitor-analyzer/suggest", headers: companyScopeHeaders(companyId), query: { url, scope, ...(place ? { place } : {}),...(profile?{profile}:{}) } }),
  lookup: (companyId: string, q: string) => apiClient.request<{ results: LookupResult[]; message: string | null }>({ method: "GET", path: "/competitor-analyzer/lookup", headers: companyScopeHeaders(companyId), query: { q } }),
};

export interface JourneyEvidence {key:string;label:string;state:string;completed:false;pages:{url:string;method:string;forms:number;fields:number;requiredFields:number;labelledFields:number;https:boolean;captchaObserved:boolean;privacyNoticeObserved:boolean;externalFormDestination:boolean}[]}
export interface ProfileResults { version:string; label:string; sites:{domain:string; coverage:string; observedCapabilityScore:number|null; journeys?:JourneyEvidence[]; rules:{key:string;label:string;state:string;confidence:string;evidence:{url:string;snippet:string;method:string}[]}[]}[] }
