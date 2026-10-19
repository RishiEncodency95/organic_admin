/**
 * Report CONTRACT for the SEO checkup suite.
 *
 * This module carries the TypeScript types that mirror the backend's REAL
 * audit engine (`organic_backend/src/modules/seoAudit`) plus pure helpers
 * (CSV export, source labels, score clamps). It contains NO crawl data, NO
 * inventory, NO seeded metrics and NO report builder — every report object is
 * produced by a live audit run on the backend (`POST /api/seo-audit/run`).
 */

export type CheckupStatus = "passed" | "failed" | "warning";

export type CheckupLevel = "site" | "page";

/**
 * Where a value came from:
 *  - "measured":      captured by a live network / API probe during the audit run
 *  - "crawl":         read from the live HTML of the crawled route
 *  - "derived":       calculated from real crawl inputs using a published threshold
 *  - "not_tested":    the integration ran but the optional probe had no credentials
 *  - "not_connected": the optional data source (e.g. Search Console) is not configured
 */
export type CheckupSource = "measured" | "crawl" | "derived" | "not_tested" | "not_connected";

export interface CheckupTable {
  title?: string;
  headers: string[];
  rows: Array<Array<string | number>>;
}

export interface CheckupStat {
  label: string;
  value: string;
  tone?: "green" | "blue" | "indigo" | "amber" | "red";
}

export interface CheckupList {
  title?: string;
  items: string[];
}

export interface CheckupMeta {
  label?: string;
  value: string;
  mono?: boolean;
}

export interface CheckupTest {
  id: string;
  name: string;
  status: CheckupStatus;
  level?: CheckupLevel;
  source?: CheckupSource;
  benchmark?: string;
  summary?: string;
  badge?: string;
  meta?: CheckupMeta[];
  stats?: CheckupStat[];
  tables?: CheckupTable[];
  lists?: CheckupList[];
  evidence?: string[];
  fix?: string;
  collapsible?: boolean;
}

export interface CheckupGroup {
  id: string;
  name: string;
  note?: string;
  score?: number;
  badge?: string;
  headline?: { value: string; label: string };
  tests: CheckupTest[];
}

export type CheckupPriority = "HIGH" | "MEDIUM" | "LOW";

export interface CheckupIssue {
  priority: CheckupPriority;
  title: string;
  detail?: string;
  fix?: string;
  collapsible?: boolean;
  status?: CheckupStatus;
  route?: string;
  group?: string;
  evidence?: string[];
}

export interface CheckupCategory {
  name: string;
  score?: number;
  failed: number;
  warnings: number;
  passed: number;
}

export interface ReportInput {
  label: string;
  value: string;
  source?: CheckupSource;
  status?: CheckupStatus;
}

export interface SearchConsoleSummary {
  available: boolean;
  clicks: number | null;
  impressions: number | null;
  ctr: number | null;
  position: number | null;
}

/** Per-route summary shipped inside every backend report for charts/tables. */
export interface RouteSummary {
  id: string;
  path: string;
  label: string;
  url: string;
  title: string | null;
  titleLength: number;
  metaDescription: string | null;
  metaDescriptionLength: number;
  httpStatus: number | null;
  ok: boolean;
  indexable: boolean;
  canonical: string | null;
  canonicalStatus: "missing" | "self" | "points_elsewhere";
  score: number;
  words: number;
  internalLinks: number;
  externalLinks: number;
  h1Count: number;
  h2Count: number;
  imageCount: number;
  imagesMissingAlt: number;
  domNodes: number | null;
  htmlKb: number | null;
  ttfbMs: number | null;
  loadMs: number | null;
  failedChecks: number;
  warningChecks: number;
  passedChecks: number;
  searchConsole: SearchConsoleSummary;
}

export interface SeoCheckupReportData {
  scope: "site" | "page";
  route: string;
  url: string;
  pageTitle: string;
  pageDesc: string | null;
  titleLen: number;
  descLen: number | null;
  seoScore: number;
  aiScore: number | null;
  scoreSource: CheckupSource;
  aiSource: CheckupSource;
  telemetrySource: CheckupSource;
  failedCount: number;
  warningCount: number;
  passedCount: number;
  totalCount: number;
  summary: string;
  categories: CheckupCategory[];
  inputs: ReportInput[];
  issues: CheckupIssue[];
  groups: CheckupGroup[];
  generatedAt: string;
  pageSpeed?: PageSpeedSnapshot | null;
  routeSummaries: RouteSummary[];
  site: {
    origin: string;
    routesCrawled: number;
    avgWords: number;
    avgTtfbMs: number | null;
    searchConsoleConfigured: boolean;
    llmKeysConfigured: string[];
  };
}

export interface PageSpeedSnapshot {
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

/** Live meta tags, only supplied when the caller read them from the CMS/API. */
export interface ReportMetaOverride {
  title?: string | null;
  description?: string | null;
}

export const SITE_URL = "https://bharatorganicexpo.com";

const SOURCE_LABEL: Record<CheckupSource, string> = {
  measured: "MEASURED",
  crawl: "CRAWL",
  derived: "DERIVED",
  not_tested: "NOT TESTED",
  not_connected: "NOT CONNECTED",
};

export function sourceLabel(source?: CheckupSource): string | null {
  return source ? SOURCE_LABEL[source] : null;
}

export function capScore(value: number): number {
  return Math.min(99, Math.max(0, Math.round(value)));
}

function csvEscape(value: string | number): string {
  const text = String(value);
  return /[\",\n]/.test(text) ? `"${text.replace(/\"/g, '""')}"` : text;
}

export function checkupReportToCsv(report: SeoCheckupReportData): string {
  const rows: Array<Array<string | number>> = [
    ["Bharat Organic Expo 2027 — SEO Site Checkup Audit Report (real audit run)"],
    ["Scope", report.scope === "site" ? "Domain (bharatorganicexpo.com)" : "Page"],
    ["Route", report.route],
    ["URL", report.url],
    ["Generated", report.generatedAt],
    ["Score source", report.scoreSource],
    ["Telemetry source", report.telemetrySource],
    [],
    ["Metric", "Value"],
    ["General SEO Checkup Score", `${report.seoScore}/100`],
    ["AI Brand Presence (tested prompts)", report.aiScore == null ? "not tested" : `${report.aiScore}%`],
    ["Failed", report.failedCount],
    ["Warnings", report.warningCount],
    ["Passed", report.passedCount],
    ["Total checks", report.totalCount],
    ["Meta Title", report.pageTitle],
    ["Meta Title Length", report.titleLen],
    ["Meta Description", report.pageDesc ?? "Not served on this route"],
    ["Meta Description Length", report.descLen ?? "—"],
    [],
    ["Input used", "Value", "Source"],
    ...report.inputs.map((input) => [input.label, input.value, input.source ?? "—"]),
    [],
    ["Category", "Score", "Failed", "Warnings", "Passed"],
    ...report.categories.map((cat) => [
      cat.name,
      cat.score != null ? `${cat.score}/100` : "—",
      cat.failed,
      cat.warnings,
      cat.passed,
    ]),
    [],
    ["Route", "Score", "Words", "Internal links", "Images (missing alt)", "TTFB"],
    ...(report.routeSummaries || []).map((s) => [
      s.path,
      s.score,
      s.words,
      s.internalLinks,
      `${s.imageCount} (${s.imagesMissingAlt})`,
      s.ttfbMs == null ? "—" : `${s.ttfbMs}ms`,
    ]),
    [],
    ["Priority", "Issue", "Detail"],
    ...report.issues.map((issue) => [issue.priority, issue.title, issue.detail ?? ""]),
    [],
    ["Group", "Test", "Status", "Scope", "Source", "Benchmark", "Result"],
  ];

  for (const group of report.groups) {
    for (const test of group.tests) {
      rows.push([
        group.name,
        test.name,
        test.status.toUpperCase(),
        test.level ?? "page",
        test.source ?? "—",
        test.benchmark ?? "",
        test.summary ?? "",
      ]);
    }
  }

  return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
}

export function downloadTextFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(href);
}
