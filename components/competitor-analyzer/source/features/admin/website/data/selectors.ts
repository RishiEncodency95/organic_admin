/**
 * Pure derivations and formatters shared by every Website screen.
 *
 * Formatting is deliberately timezone- and locale-pinned: the same string has
 * to come out of the server render and the client hydration, and in mock mode
 * "now" is the fixed dataset clock rather than the wall clock.
 */

import { WEBSITE_MOCK_MODE, WEBSITE_REFERENCE_NOW } from "@/components/competitor-analyzer/source/features/admin/website/data/config";
import type {
  CheckStatus,
  IssueRecord,
  PageRecord,
  PageType,
  ScanType,
  Severity,
  VitalBand,
} from "@/components/competitor-analyzer/source/features/admin/website/data/types";

/* ------------------------------------------------------------------ */
/* Time                                                                */
/* ------------------------------------------------------------------ */

function nowMs(): number {
  return WEBSITE_MOCK_MODE ? new Date(WEBSITE_REFERENCE_NOW).getTime() : Date.now();
}

/**
 * "Now" as this module understands it. In mock mode that is the fixed dataset
 * clock, which keeps age filters and relative labels identical on the server
 * and after hydration.
 */
export const referenceNow = nowMs;

/** Age of a timestamp in hours, measured against {@link referenceNow}. */
export function ageInHours(iso: string): number {
  return (nowMs() - new Date(iso).getTime()) / 3_600_000;
}

export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "Never";
  const diff = nowMs() - new Date(iso).getTime();
  const future = diff < 0;
  const abs = Math.abs(diff);
  const minutes = Math.round(abs / 60_000);
  if (minutes < 1) return future ? "in under a minute" : "just now";
  if (minutes < 60) return future ? `in ${minutes} min` : `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return future ? `in ${hours} hr` : `${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days < 31) return future ? `in ${days} d` : `${days} d ago`;
  const months = Math.round(days / 30);
  return future ? `in ${months} mo` : `${months} mo ago`;
}

const DATE_FMT = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const DATE_TIME_FMT = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

const SHORT_DATE_FMT = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
});

export const formatDate = (iso: string | null | undefined) => (iso ? DATE_FMT.format(new Date(iso)) : "—");
export const formatDateTime = (iso: string | null | undefined) =>
  iso ? `${DATE_TIME_FMT.format(new Date(iso))} UTC` : "—";
export const formatShortDate = (iso: string) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : SHORT_DATE_FMT.format(date);
};

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest === 0 ? `${minutes}m` : `${minutes}m ${rest}s`;
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`;
}

/* ------------------------------------------------------------------ */
/* Numbers                                                             */
/* ------------------------------------------------------------------ */

const NUMBER_FMT = new Intl.NumberFormat("en-IN");

export const formatNumber = (value: number) => NUMBER_FMT.format(Math.round(value));

export function formatCompact(value: number): string {
  if (Math.abs(value) >= 10_000_000) return `${(value / 10_000_000).toFixed(1)}Cr`;
  if (Math.abs(value) >= 100_000) return `${(value / 100_000).toFixed(1)}L`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(Math.round(value));
}

export function formatWeight(kilobytes: number): string {
  if (kilobytes >= 1024) return `${(kilobytes / 1024).toFixed(1)} MB`;
  return `${Math.round(kilobytes)} KB`;
}

export function formatMs(ms: number | null | undefined): string {
  if (typeof ms !== "number" || Number.isNaN(ms)) return "Not available";
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)} s`;
  return `${Math.round(ms)} ms`;
}

export const formatPct = (value: number, digits = 1) => `${value.toFixed(digits)}%`;

export function formatDelta(value: number, suffix = "%"): string {
  if (value === 0) return "0";
  return `${value > 0 ? "+" : ""}${value.toFixed(Math.abs(value) < 10 ? 1 : 0)}${suffix}`;
}

/* ------------------------------------------------------------------ */
/* Bands and tones                                                     */
/* ------------------------------------------------------------------ */

export type Tone = "good" | "warn" | "bad" | "info" | "muted" | "violet";

export function scoreBand(score: number | null): Tone {
  if (score === null) return "muted";
  if (score >= 80) return "good";
  if (score >= 60) return "warn";
  return "bad";
}

export function scoreLabel(score: number | null): string {
  if (score === null) return "Not scored";
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Good";
  if (score >= 60) return "Needs work";
  if (score >= 40) return "Poor";
  return "Critical";
}

export const severityTone: Record<Severity, Tone> = {
  critical: "bad",
  high: "bad",
  medium: "warn",
  low: "info",
};

export const severityLabel: Record<Severity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const severityRank: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export const checkTone: Record<CheckStatus, Tone> = {
  pass: "good",
  warning: "warn",
  error: "bad",
  unknown: "muted",
};

export const checkLabel: Record<CheckStatus, string> = {
  pass: "Pass",
  warning: "Warning",
  error: "Error",
  unknown: "Not checked",
};

export const vitalTone: Record<VitalBand, Tone> = {
  good: "good",
  "needs-improvement": "warn",
  poor: "bad",
};

export const vitalLabel: Record<VitalBand, string> = {
  good: "Good",
  "needs-improvement": "Needs improvement",
  poor: "Poor",
};

export function httpStatusTone(status: number): Tone {
  if (status >= 200 && status < 300) return "good";
  if (status >= 300 && status < 400) return "warn";
  if (status >= 400 && status < 500) return "bad";
  if (status >= 500) return "bad";
  return "muted";
}

export const pageTypeLabel: Record<PageType, string> = {
  standard: "Standard",
  landing: "Landing page",
  blog: "Blog",
  legal: "Legal",
  utility: "Utility",
  redirect: "Redirect",
  error: "Error",
};

export const scanTypeLabel: Record<ScanType, string> = {
  "full-crawl": "Full crawl",
  "seo-audit": "SEO audit",
  performance: "Performance",
  uptime: "Uptime check",
  page: "Single page",
  ai: "AI analysis",
};

export const categoryLabel: Record<IssueRecord["category"], string> = {
  seo: "SEO",
  performance: "Performance",
  accessibility: "Accessibility",
  links: "Links",
  monitoring: "Monitoring",
  ssl: "SSL",
  forms: "Forms",
  security: "Security hygiene",
  technical: "Technical",
};

/* ------------------------------------------------------------------ */
/* Collections                                                         */
/* ------------------------------------------------------------------ */

export function sortIssues(issues: IssueRecord[]): IssueRecord[] {
  return [...issues].sort((a, b) => {
    const bySeverity = severityRank[a.severity] - severityRank[b.severity];
    if (bySeverity !== 0) return bySeverity;
    return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime();
  });
}

export function countBySeverity(issues: IssueRecord[]): Record<Severity, number> {
  return issues.reduce(
    (acc, issue) => ({ ...acc, [issue.severity]: acc[issue.severity] + 1 }),
    { critical: 0, high: 0, medium: 0, low: 0 } as Record<Severity, number>,
  );
}

export function topProblemPages(pages: PageRecord[], limit = 6): PageRecord[] {
  return [...pages]
    .filter((page) => page.issueCount > 0 || page.httpStatus >= 400)
    .sort((a, b) => {
      if (b.criticalIssueCount !== a.criticalIssueCount) return b.criticalIssueCount - a.criticalIssueCount;
      if (b.issueCount !== a.issueCount) return b.issueCount - a.issueCount;
      return (a.seoScore ?? 100) - (b.seoScore ?? 100);
    })
    .slice(0, limit);
}

/** Case-insensitive match across a page's title and path. */
export function matchesPageSearch(page: PageRecord, term: string): boolean {
  if (!term.trim()) return true;
  const needle = term.trim().toLowerCase();
  return page.title.toLowerCase().includes(needle) || page.path.toLowerCase().includes(needle);
}

/* ------------------------------------------------------------------ */
/* Export                                                              */
/* ------------------------------------------------------------------ */

function escapeCsv(value: string | number | null | undefined): string {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(headers: string[], rows: (string | number | null)[][]): string {
  return [headers.map(escapeCsv).join(","), ...rows.map((row) => row.map(escapeCsv).join(","))].join("\n");
}

/** Triggers a browser download. Runs entirely client-side — no export service. */
export function downloadFile(filename: string, content: string, mime = "text/csv;charset=utf-8;") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function slugForFile(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
