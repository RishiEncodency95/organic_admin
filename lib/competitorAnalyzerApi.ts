import { api, ApiRequestError, getAccessToken, getApiBaseUrl } from "./api";

/*
 * AI Competitor Analyzer API (backend: /api/admin/competitor-analyzer). Every value shown in the UI comes from
 * saved backend data; nothing here invents rankings, volumes or scores. Missing data stays null / "not_available".
 */

const BASE = "/admin/competitor-analyzer";
const fresh = () => `_=${Date.now()}`;

export type EvidenceState = "present" | "absent_confirmed" | "not_observed" | "render_failed" | "fetch_failed" | "provider_unavailable" | "not_applicable";
export type RunStatus = "queued" | "running" | "completed" | "failed" | "cancelled" | "reconciliation_required";

export interface Study {
  _id: string;
  name: string;
  ownUrl: string;
  ownDomain: string;
  competitors: { url: string; domain: string; name: string | null }[];
  serviceFocus: string[];
  geography: { scope: string; places: string[]; country: string };
  goal: string;
  maxPagesPerSite: number;
  settings: { schedule: string; alerts: boolean; pagespeed: boolean; ai: boolean; alertEmails?: string[]; monthlyReport?: boolean };
  nextScheduledAt?: string | null;
  revision: number;
  status: "active" | "archived";
  updatedAt: string;
  latestRunId?: string | null;
  latestSuccessfulRunId?: string | null;
  latestRun?: RunSummary | null;
  latestSuccessfulRun?: RunSummary | null;
}

export interface RunSummary {
  _id: string;
  status: RunStatus;
  stage: string;
  progress: { done: number; total: number; message: string };
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  error?: { code: string | null; message: string | null };
  quality?: { status: string; completeness: number; issues: { severity: string; domain: string; code: string; message: string }[] } | null;
  ai?: { status: string; error: string | null } | null;
  cancelRequestedAt?: string | null;
  report?: Report | null;
}

export interface CategoryScore { category: string; label: string; weight: number; score: number | null; coverage: number; evaluated: number; unknown: number; passed: number; failed: number }
export interface Cite { url: string; quote: string }
export interface Claim { text: string; evidence: Cite[] }
export interface FeatureAssertion { state: EvidenceState; evidence: { url: string; excerpt: string }[]; basis: string }

export interface ReportSite {
  domain: string;
  role: "own" | "competitor";
  siteName: string | null;
  rootUrl: string;
  crawlState: string;
  crawlError: string | null;
  coverage: { discovered: number; selected: number; read: number; failed: number; robotsBlocked: number; jsShellPages: number; status: string; warnings: string[]; missingPriorityKinds: string[]; pageKinds: string[] };
  robots: { status: string };
  score: { overall: number | null; scoredWeight: number; categories: CategoryScore[]; rubricVersion: string; evidenceCoverage?: number; calibration?: { status: string; benchmark: string; note: string } };
  checkCounts: Record<string, number>;
  speed: { state: string; mobile: Record<string, number | null> | null; field: Record<string, number | string | null> | null; error: string | null; measuredAt: string | null };
  services: { category: string; label: string; state: EvidenceState; evidence: { url: string; excerpt: string }[] }[];
  prices: { raw: string; amount: number | null; currency: string; startingFrom: boolean; tax: string; unit: string | null; excerpt: string; sourceUrl: string }[];
  features: Record<string, FeatureAssertion>;
  places: { place: string }[];
  metrics: Record<string, unknown>;
  sitemap: { found: boolean; entryCount: number; latestLastmod: string | null; recent30?: number | null; recent90?: number | null };
  newestContentDate?: string | null;
  upClose?: { pagesRead: number; words: number; images: number; imagesWithAlt: number; titleLength: number | null; descriptionLength: number | null; h1Count: number | null; https: boolean; openGraph: boolean | null; viewport: boolean | null; lang: string | null; schemaTypes: string[]; ctas: string[]; pageKinds: string[] } | null;
  brand?: { state: string; name: string | null; types: string[]; error?: string | null } | null;
  hasScreenshot?: boolean;
  socials?: { platform: string; href: string }[];
}

export interface Report {
  pageComparisons?: { competitor: string; service: string; place: string | null; ownPage: { url: string; title: string | null } | null; competitorPage: { url: string; title: string | null } | null; status: string; note: string }[];
  studyName?: string;
  actions?: { title: string; priority: string; status: string; recommendation: string; source?: string }[];
  measuredHeadToHead?: { competitor: string; source: "measured"; ownLeads: Claim[]; competitorLeads: Claim[]; verdict: string }[];
  generatedAt: string;
  scope: { own: string; competitors: string[]; serviceFocus: string[]; geography: { places: string[] }; maxPagesPerSite: number };
  sites: ReportSite[];
  ownSearch?: { state: string; property: string | null; period: { start: string; end: string } | null; totals: GscTotals | null; queries: GscRow[]; pages: GscRow[]; measuredAt: string | null; error: string | null };
  leaders: { category: string; label: string; scores: Record<string, number>; leader: string | null; tie: boolean }[];
  scopes: { competitor: string; sharedServices: string[]; ownOnly: string[]; competitorOnly: string[]; overlap: number | null; comparable: boolean; note: string }[];
  overallComparable: boolean;
  ai: {
    status: string;
    model: string | null;
    error: string | null;
    dropped: number;
    grounding?: string;
    usage?: { inputTokens: number | null; outputTokens: number | null; totalTokens: number | null };
    outputLimit?: number | null;
    costUsd?: number | null;
    result: {
      summary: string | null;
      sites: { domain: string; positioning: Claim | null; audience: string; strengths: Claim[]; weaknesses: Claim[] }[];
      headToHead: { competitor: string; ownLeads: Claim[]; competitorLeads: Claim[]; verdict: string }[];
      gaps: { title: string; detail: string; category: string; evidence: Cite[] }[];
      recommendations: { title: string; problem: string; recommendation: string; priority: string; effort: string; horizonDays: number; category: string; evidence: Cite[] }[];
      contentIdeas: { title: string; format: string; reason: string; outline: string[]; evidence: Cite[] }[];
      faqDrafts: { question: string; answerDraft: string; evidence: Cite[] }[];
    } | null;
  };
  changes: { domain: string; previousRunId: string; diff: { comparable: boolean; reason: string | null; changes: { kind: string; subject: string; before: unknown; after: unknown; url: string | null }[]; notComparable: { subject: string; reason: string }[] } }[] | null;
  quality: { status: string; completeness: number; issues: { severity: string; domain: string; code: string; message: string; nextStep?: string; urls?: string[] }[]; rule: string };
  methodology: { rubricVersion: string; checksVersion: string; checkCount: number; settingsVersion?: number; settingsSource?: string; rules: string[]; weights: string };
  limitations: string[];
}

export interface Snapshot { domain: string; role: string; checks: { id: string; category: string; title: string; state: string; severity: string; explanation: string; sources: string[]; remediation: string }[]; crawl: { pages: { url: string; kind: string; state: string; httpStatus: number | null; error: string | null; extract: { title: string | null; wordCount: number } | null }[] } }

export interface Action {
  _id: string;
  source: "check" | "ai";
  checkId: string | null;
  category: string | null;
  title: string;
  problem: string;
  recommendation: string;
  evidence: Cite[];
  priority: "high" | "medium" | "low";
  effort: string;
  status: string;
  assignee: string | null;
  dueDate: string | null;
  notes: string;
  verificationCriteria: string;
  verifiedByRunId: string | null;
}

export interface Candidate {
  _id: string;
  domain: string;
  url: string;
  businessName: string | null;
  classification: string;
  relevance: string;
  status: "candidate" | "approved" | "rejected";
  watchlisted: boolean;
  notes: string;
  claimedGeography: string[];
  matchingServices: string[];
  discoveries: { source: string; keyword: string | null; location: string | null; citations: string[]; citationsVerified: boolean; discoveredAt: string }[];
  verification: { state: string; checkedAt: string | null; siteName: string | null; servicesMatched: string[]; issues: string[] };
}

export interface Keyword {
  _id: string;
  keyword: string;
  language: string;
  intent: string;
  cluster: string;
  city: string | null;
  isQuestion: boolean;
  sources: string[];
  ownPages: { url: string; title: string }[];
  competitorPages: { domain: string; url: string; title: string }[];
  metrics: Record<string, unknown>;
  gsc?: { clicks: number; impressions: number; ctr: number; position: number; period: { start: string; end: string } } | null;
}

export interface Health {
  analyzerEnabled: boolean;
  primarySite: string;
  ai: { state: string; reason: string | null; model: string | null; webSearch: string; lastError?: { at: string; message: string; status: number | null } | null };
  budget: { day: string; dailyBudgetUsd: number | null; committedUsd: number; uncertainCalls: number };
  queue: { mode: string };
  worker: { inProcess: boolean; running: boolean; lastHeartbeatAt: string | null };
  pagespeed: { state: string; apiKey: string };
  searchConsole: { state: string; reason: string; email?: string | null; property?: string | null };
  renderer: { state: string; reason: string };
  scheduler: { state: string; scheduledStudies?: number; nextDue?: string | null };
  limits: { maxCompetitors: number; defaultPagesPerSite: number; maxPagesPerSite: number; cooldownMinutes: number };
}

export interface AnalyzerSettings {
  business: { name: string; description: string; brandTerms: string[] };
  serviceCategories: { id: string; label: string; enabled: boolean; patterns: string[] }[];
  pageKinds: { kind: string; priority: number; patterns: string[] }[];
  places: string[];
  keywordSeeds: string[];
  categoryWeights: Record<string, number>;
  checkOverrides: Record<string, { enabled?: boolean; weight?: number; severity?: string }>;
  prompts: { comparisonContext: string; discoveryContext: string; keywordContext: string };
  guidance: string[];
  learning: { useFeedback: boolean; maxLessons: number };
}
export interface SettingsResponse { version: number; source: "db" | "defaults"; settings: AnalyzerSettings; defaults: AnalyzerSettings; lessons: { comparison: string[]; discovery: string[] } }
export interface Feedback { _id: string; kind: string; lesson: string; reason: string; active: boolean; createdAt: string }

export interface GscTotals { clicks: number; impressions: number; ctr: number | null; position: number | null }
export interface GscRow { key: string; clicks: number; impressions: number; ctr: number; position: number }
export interface GoogleStatus {
  configured: boolean;
  redirectUri: string | null;
  status: "not_configured" | "not_connected" | "connected" | "revoked" | "error";
  email: string | null;
  property: string | null;
  connectedAt: string | null;
  lastSyncAt: string | null;
  lastSync: { period: { start: string; end: string }; totals: GscTotals; queries: number; pages: number } | null;
  lastError: string | null;
}

export interface AutoDiscoverResult {
  site: { url: string; domain: string; name: string | null; pagesRead: number };
  detected: { services: { category: string; label: string; source: string | null }[]; places: string[]; location: string };
  queries: string[];
  picks: (Candidate & { sharedServices: string[] })[];
  all: (Candidate & { sharedServices: string[] })[];
  rejected: { url: string; reason: string }[];
  note: string;
}

export interface StudyInput {
  name: string;
  ownUrl?: string;
  competitors: string[];
  serviceFocus: string[];
  geography: { scope: string; places: string[]; country: string };
  goal: string;
  maxPagesPerSite: number;
  settings: { pagespeed: boolean; ai: boolean; schedule?: string; alerts?: boolean; alertEmails?: string[]; monthlyReport?: boolean };
}

export const competitorApi = {
  health: () => api.get<Health>(`${BASE}/health?${fresh()}`),
  studies: (status = "active") => api.get<{ items: Study[]; total: number }>(`${BASE}/studies?status=${status}&limit=100&${fresh()}`),
  study: (id: string) => api.get<{ study: Study; latestRun: RunSummary | null; latestSuccessfulRun: RunSummary | null }>(`${BASE}/studies/${id}?${fresh()}`),
  createStudy: (body: StudyInput) => api.post<Study>(`${BASE}/studies`, body, { timeoutMs: 30_000 }),
  updateStudy: (id: string, body: Partial<StudyInput> & { expectedRevision: number }) => api.patch<Study>(`${BASE}/studies/${id}`, body, { timeoutMs: 30_000 }),
  archiveStudy: (id: string) => api.delete<Study>(`${BASE}/studies/${id}`),
  restoreStudy: (id: string) => api.post<Study>(`${BASE}/studies/${id}/restore`, {}),
  startRun: (id: string, idempotencyKey: string) => api.post<{ runId: string; status: RunStatus; reused: boolean }>(`${BASE}/studies/${id}/runs`, { idempotencyKey }),
  runs: (id: string) => api.get<{ items: RunSummary[] }>(`${BASE}/studies/${id}/runs?limit=50&${fresh()}`),
  run: (id: string, runId: string) => api.get<RunSummary>(`${BASE}/studies/${id}/runs/${runId}?${fresh()}`),
  snapshot: (id: string, runId: string, domain: string) => api.get<Snapshot>(`${BASE}/studies/${id}/runs/${runId}/snapshots/${domain}?${fresh()}`),
  stopRun: (id: string, runId: string) => api.post<{ status: RunStatus }>(`${BASE}/studies/${id}/runs/${runId}/stop`, {}),
  exportRun: (id: string, runId: string) => api.get<unknown>(`${BASE}/studies/${id}/runs/${runId}/export?${fresh()}`),
  actions: (id: string) => api.get<Action[]>(`${BASE}/studies/${id}/actions?${fresh()}`),
  updateAction: (id: string, actionId: string, body: Partial<Pick<Action, "status" | "assignee" | "notes" | "priority">> & { dueDate?: string | null }) => api.patch<Action>(`${BASE}/studies/${id}/actions/${actionId}`, body),
  candidates: () => api.get<Candidate[]>(`${BASE}/candidates?${fresh()}`),
  addCandidate: (url: string, businessName?: string) => api.post<Candidate>(`${BASE}/candidates`, { url, businessName }, { timeoutMs: 60_000 }),
  updateCandidate: (id: string, body: Partial<Pick<Candidate, "status" | "classification" | "watchlisted" | "notes" | "businessName">>) => api.patch<Candidate>(`${BASE}/candidates/${id}`, body),
  verifyCandidate: (id: string) => api.post<Candidate>(`${BASE}/candidates/${id}/verify`, {}, { timeoutMs: 60_000 }),
  deleteCandidate: (id: string) => api.delete<null>(`${BASE}/candidates/${id}`),
  autoDiscover: (body: { url?: string; location?: string; max?: number }) => api.post<AutoDiscoverResult>(`${BASE}/discovery/auto`, body, { timeoutMs: 300_000 }),
  discover: (body: { keywords: string[]; location: string; serviceCategory?: string; language: string }) => api.post<{ candidates: Candidate[]; rejected: { url: string; reason: string }[]; note: string }>(`${BASE}/discovery/search`, body, { timeoutMs: 180_000 }),
  keywords: () => api.get<{ items: Keyword[]; contentGaps: { keyword: string; cluster: string; competitorPages: { domain: string; url: string }[] }[] }>(`${BASE}/keywords?${fresh()}`),
  generateKeywords: (body: { seeds: string[]; location: string; useAi: boolean }) => api.post<{ processed: number; ai: { status: string; error: string | null }; note: string }>(`${BASE}/keywords/generate`, body, { timeoutMs: 120_000 }),
  googleStatus: () => api.get<GoogleStatus>(`${BASE}/google/status?${fresh()}`),
  googleConnect: () => api.post<{ url: string }>(`${BASE}/google/connect`, {}),
  googleDisconnect: () => api.post<GoogleStatus>(`${BASE}/google/disconnect`, {}),
  gscProperties: () => api.get<{ siteUrl: string; permissionLevel: string }[]>(`${BASE}/search-console/properties?${fresh()}`, { forceFresh: true }),
  gscSetProperty: (property: string) => api.put<GoogleStatus>(`${BASE}/search-console/property`, { property }),
  gscSync: () => api.post<{ property: string; period: { start: string; end: string }; totals: GscTotals; keywords: number; note: string }>(`${BASE}/search-console/sync`, {}, { timeoutMs: 120_000 }),
  settings: () => api.get<SettingsResponse>(`${BASE}/settings?${fresh()}`),
  saveSettings: (expectedVersion: number, settings: AnalyzerSettings, note: string) => api.put<SettingsResponse>(`${BASE}/settings`, { expectedVersion, settings, note }),
  settingsVersions: () => api.get<{ version: number; savedBy: string | null; note: string; createdAt: string }[]>(`${BASE}/settings/versions?${fresh()}`),
  rollbackSettings: (version: number, expectedVersion: number) => api.post<SettingsResponse>(`${BASE}/settings/rollback`, { version, expectedVersion }),
  feedback: () => api.get<Feedback[]>(`${BASE}/settings/feedback?${fresh()}`),
  addGuidance: (lesson: string) => api.post<null>(`${BASE}/settings/feedback`, { lesson }),
  setFeedbackActive: (id: string, active: boolean) => api.patch<Feedback>(`${BASE}/settings/feedback/${id}`, { active }),
};

/** Authenticated binary download (PDF / screenshot). Errors are thrown, never replaced by mock files. */
export async function fetchBinary(path: string, publicLink = false): Promise<Blob> {
  const headers: Record<string, string> = {};
  const token = publicLink ? null : getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${getApiBaseUrl()}${path}`, { headers });
  if (!res.ok) {
    let msg = `Download failed (HTTP ${res.status})`;
    try {
      msg = ((await res.json()) as { message?: string }).message ?? msg;
    } catch {
      /* not JSON */
    }
    throw new ApiRequestError(res.status, msg);
  }
  return res.blob();
}

export function saveBlob(blob: Blob, filename: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2_000);
}

export const reportFiles = {
  studyIcon: (studyId: string) => fetchBinary(`${BASE}/studies/${studyId}/favicon`),
  favicon: (studyId: string, runId: string, domain: string) => fetchBinary(`${BASE}/studies/${studyId}/runs/${runId}/favicons/${domain}`),
  publicFavicon: (token: string, domain: string) => fetchBinary(`/public/competitor-reports/${token}/favicons/${domain}`, true),
  pdf: (studyId: string, runId: string, lang: "en" | "hi") => fetchBinary(`${BASE}/studies/${studyId}/runs/${runId}/pdf?lang=${lang}`),
  screenshot: (studyId: string, runId: string, domain: string) => fetchBinary(`${BASE}/studies/${studyId}/runs/${runId}/screenshots/${domain}`),
  publicPdf: (token: string, lang: "en" | "hi") => fetchBinary(`/public/competitor-reports/${token}/pdf?lang=${lang}`, true),
  publicScreenshot: (token: string, domain: string) => fetchBinary(`/public/competitor-reports/${token}/screenshots/${domain}`, true),
};

export interface ShareLink { id: string; runId: string; createdAt: string; expiresAt: string; revokedAt: string | null; views: number; lastViewedAt: string | null; active: boolean }
export const shareApi = {
  list: (studyId: string) => api.get<ShareLink[]>(`${BASE}/studies/${studyId}/shares?_=${Date.now()}`),
  create: (studyId: string, runId: string, days: 7 | 30 | 90) => api.post<{ id: string; url: string; expiresAt: string }>(`${BASE}/studies/${studyId}/shares`, { runId, days }),
  revoke: (studyId: string, shareId: string) => api.delete<{ revoked: boolean }>(`${BASE}/studies/${studyId}/shares/${shareId}`),
  publicReport: (token: string) => api.get<PublicReport>(`/public/competitor-reports/${token}`),
};

export interface PublicReport {
  studyName: string;
  runId: string;
  finishedAt: string | null;
  report: Report;
  actions: { title: string; priority: string; status: string; recommendation: string }[];
}
