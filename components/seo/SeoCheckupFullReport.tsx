"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { findCmsPageByRouteKey, getCmsPageRouteKey, cmsPages } from "@/lib/cmsPages";
import {
  AlertTriangle,
  Bot,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Database,
  Download,
  ExternalLink,
  Eye,
  FileCode,
  Gauge,
  Layers,
  Lightbulb,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import {
  buildSeoCheckupReport,
  checkupReportToCsv,
  downloadTextFile,
  sourceLabel,
  type CheckupGroup,
  type CheckupLevel,
  ROUTE_META_CAPTURED_AT,
  type CheckupSource,
  type CheckupStatus,
  type CheckupTest,
  type PageSpeedSnapshot,
  type ReportMetaOverride,
  type SeoCheckupReportData,
} from "@/lib/seoCheckupData";
import { getSavedPageSpeed } from "@/lib/pageSpeedBatch";
import SeoReportCharts from "./SeoReportCharts";

export interface SeoCheckupFullReportProps {
  scope: "site" | "page";
  route?: string;
  url?: string;
  meta?: ReportMetaOverride;
  pagespeed?: PageSpeedSnapshot | null;
  report?: SeoCheckupReportData;
  onClose?: () => void;
  onReAudit?: () => void;
  onExportPdf?: () => void;
  onExportCsv?: () => void;
}

type StatusFilter = "all" | "failed" | "warning" | "passed";

const STATUS_STYLES: Record<CheckupStatus, { badge: string; card: string; icon: React.ElementType }> = {
  passed: {
    badge: "bg-emerald-600 text-white",
    card: "border-slate-200 bg-slate-50",
    icon: Check,
  },
  failed: {
    badge: "bg-red-600 text-white",
    card: "border-red-200 bg-red-50/40",
    icon: X,
  },
  warning: {
    badge: "bg-amber-500 text-white",
    card: "border-amber-200 bg-amber-50/40",
    icon: AlertTriangle,
  },
};

const INPUT_TONES: Record<CheckupStatus, string> = {
  passed: "border-emerald-200 bg-emerald-50/60",
  warning: "border-amber-200 bg-amber-50/60",
  failed: "border-red-200 bg-red-50/60",
};

const INPUT_VALUE_TONES: Record<CheckupStatus, string> = {
  passed: "text-emerald-700",
  warning: "text-amber-700",
  failed: "text-red-700",
};

const GROUP_ICONS: Record<string, React.ElementType> = {
  "ai-insights": Bot,
  "llm-visibility": Sparkles,
  "visual-seo": Eye,
  freshness: Clock,
  opportunities: Lightbulb,
  "common-seo": Search,
  speed: Zap,
  security: ShieldCheck,
  mobile: Smartphone,
  advanced: FileCode,
  pagespeed: Gauge,
};

const STAT_TONES: Record<string, string> = {
  green: "bg-emerald-50 border-emerald-200 text-emerald-700",
  blue: "bg-blue-50 border-blue-200 text-blue-700",
  indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
  amber: "bg-amber-50 border-amber-200 text-amber-700",
  red: "bg-red-50 border-red-200 text-red-700",
};

const SOURCE_STYLES: Record<CheckupSource, string> = {
  measured: "border-blue-200 bg-blue-50 text-blue-700",
  crawl: "border-emerald-200 bg-emerald-50 text-emerald-700",
  derived: "border-amber-200 bg-amber-50 text-amber-700",
};

const SOURCE_HINT: Record<CheckupSource, string> = {
  measured: "Captured by the SEO Site Checkup audit run",
  crawl: "Captured by your crawler / Search Console for this route",
  derived: "Calculated from the crawl inputs using the published threshold",
};

const FILTER_META: Record<StatusFilter, { label: string; className: string }> = {
  all: { label: "All checks", className: "border-slate-300 bg-white text-slate-700 hover:bg-slate-50" },
  failed: { label: "Failed", className: "border-red-300 bg-red-50 text-red-700 hover:bg-red-100" },
  warning: { label: "Warnings", className: "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100" },
  passed: { label: "Passed", className: "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
};

function StatusBadge({ status, label }: { status: CheckupStatus; label?: string }) {
  const statusStyle = STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold tracking-wide ${statusStyle.badge}`}>
      <statusStyle.icon className="h-3 w-3" />
      {label ?? status.toUpperCase()}
    </span>
  );
}

function LevelChip({ level }: { level?: CheckupLevel }) {
  if (!level) return null;
  return (
    <span
      title={
        level === "site"
          ? "Same result for every route of the domain"
          : "Evaluated against this route's own crawl data"
      }
      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
        level === "site"
          ? "border-indigo-200 bg-indigo-50 text-indigo-700"
          : "border-slate-300 bg-white text-slate-600"
      }`}
    >
      <Layers className="h-2.5 w-2.5" />
      {level === "site" ? "Site-wide" : "Page"}
    </span>
  );
}

function SourceChip({ source }: { source?: CheckupSource }) {
  if (!source) return null;
  return (
    <span
      title={SOURCE_HINT[source]}
      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${SOURCE_STYLES[source]}`}
    >
      <Database className="h-2.5 w-2.5" />
      {sourceLabel(source)}
    </span>
  );
}

function ScoreRing({
  value,
  color,
  label,
  sub,
  source,
}: {
  value: number;
  color: string;
  label: React.ReactNode;
  sub: string;
  source?: CheckupSource;
}) {
  return (
    <div className="flex flex-col items-center justify-between text-center">
      {label}
      <div className="relative my-3 flex items-center justify-center">
        <svg className="h-40 w-40 -rotate-90">
          <circle cx="80" cy="80" r="64" stroke="#e2e8f0" strokeWidth="12" fill="transparent" />
          <circle
            cx="80"
            cy="80"
            r="64"
            stroke={color}
            strokeWidth="12"
            strokeDasharray={2 * Math.PI * 64}
            strokeDashoffset={2 * Math.PI * 64 * (1 - value / 100)}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-black tracking-tight text-slate-900">{value}</span>
          <span className="text-xs font-bold text-slate-400">/ 100</span>
        </div>
      </div>
      <p className="text-xs font-medium text-slate-600">{sub}</p>
      {source && (
        <span className={`mt-2 inline-flex rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${SOURCE_STYLES[source]}`}>
          {source === "measured"
            ? "Measured score"
            : source === "crawl"
              ? "From your crawler"
              : "Derived from checks"}
        </span>
      )}
    </div>
  );
}

function CellValue({ value }: { value: string | number }) {
  const text = String(value);
  if (text === "✓") return <Check className="h-4 w-4 text-emerald-600" />;
  if (text === "✗") return <X className="h-4 w-4 text-slate-300" />;
  if (text === "—") return <span className="text-slate-400">—</span>;
  return <>{text}</>;
}

function TestCard({
  test,
  defaultOpen,
  baseUrl,
}: {
  test: CheckupTest;
  defaultOpen: boolean;
  baseUrl?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const statusStyle = STATUS_STYLES[test.status];
  const Icon = statusStyle.icon;

  return (
    <div className={`rounded-lg border p-3.5 text-xs space-y-2.5 ${statusStyle.card}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <span className="flex items-center gap-1.5 font-bold text-slate-900">
          <Icon className={`h-4 w-4 shrink-0 ${test.status === "passed" ? "text-emerald-600" : test.status === "failed" ? "text-red-600" : "text-amber-600"}`} />
          {test.name}
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          <LevelChip level={test.level} />
          <SourceChip source={test.source} />
          {test.benchmark && (
            <span className="rounded bg-white px-2 py-0.5 font-bold text-slate-600 border border-slate-200">
              {test.benchmark}
            </span>
          )}
          <StatusBadge status={test.status} label={test.badge} />
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="rounded border border-slate-300 bg-white px-2 py-0.5 font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            {open ? "Hide Details" : "Details"}
          </button>
        </div>
      </div>

      {open && (
        <>
          {test.summary && <p className="leading-relaxed text-slate-700">{test.summary}</p>}

          {test.meta && test.meta.length > 0 && (
            <div className="space-y-1 rounded border border-slate-200 bg-white p-2.5">
              {test.meta.map((line, index) => (
                <div key={index} className={line.mono ? "font-mono text-[11px] text-slate-700 break-words" : "text-slate-700"}>
                  {line.label && <strong className="text-slate-900">{line.label}: </strong>}
                  {line.value}
                </div>
              ))}
            </div>
          )}

          {test.stats && test.stats.length > 0 && (
            <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
              {test.stats.map((stat) => (
                <div key={stat.label} className={`rounded border p-2.5 ${STAT_TONES[stat.tone ?? "blue"]}`}>
                  <span className="block text-lg font-extrabold">{stat.value}</span>
                  <span className="text-[10px] font-bold uppercase">{stat.label}</span>
                </div>
              ))}
            </div>
          )}

          {test.tables?.map((table, tableIndex) => (
            <div key={tableIndex} className="overflow-x-auto rounded border border-slate-200 bg-white p-2.5">
              {table.title && <strong className="mb-1.5 block text-slate-900">{table.title}</strong>}
              <table className="w-full text-left font-mono text-[11px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    {table.headers.map((header) => (
                      <th key={header} className="py-1 pr-3 font-bold">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {table.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="py-1 pr-3">
                          <CellValue value={cell} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          {test.lists?.map((list, listIndex) => (
            <div key={listIndex} className="rounded border border-slate-200 bg-white p-2.5">
              {list.title && <strong className="mb-1 block text-slate-900">{list.title}</strong>}
              <ul className="space-y-1.5 text-slate-700">
                {list.items.map((item, itemIndex) => {
                  const isImage = typeof item === 'string' && (item.match(/\.(jpeg|jpg|gif|png|svg|webp)(\?.*)?$/i) || item.includes('res.cloudinary.com') || item.includes('/_next/image'));
                  if (isImage) {
                    let srcUrl = item;
                    if (item.startsWith('/')) {
                      const defaultBase = typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? 'https://bharatorganicexpo.com' : 'http://localhost:3001';
                      const base = baseUrl?.startsWith('http') ? baseUrl : defaultBase;
                      try {
                        srcUrl = new URL(item, base).toString();
                      } catch(e) {}
                    }
                    let sectionHint = 'Unknown Section';
                    try {
                      sectionHint = decodeURIComponent(item).split('/').pop()?.split('.')[0] || 'Unknown Section';
                    } catch(e) {}
                    return (
                      <li key={itemIndex} className="flex flex-col gap-1.5 break-all font-mono text-[10px] text-slate-700 rounded border border-slate-100 bg-slate-50/50 p-2">
                        <span className="font-bold text-blue-600">Section: {sectionHint}</span>
                        <span>{item}</span>
                        <div className="h-20 w-32 shrink-0 overflow-hidden rounded border border-slate-200 bg-white flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={srcUrl} alt="" className="max-h-full max-w-full object-contain" loading="lazy" />
                        </div>
                      </li>
                    );
                  }
                  return <li key={itemIndex} className="break-words list-disc ml-5">{item}</li>;
                })}
              </ul>
            </div>
          ))}

          {test.fix && (
            <div className="rounded border border-blue-200 bg-blue-50/70 p-2.5">
              <strong className="block text-[11px] uppercase tracking-wider text-blue-700">How to fix</strong>
              <p className="mt-0.5 text-slate-700">{test.fix}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function GroupCard({
  group,
  filter,
  defaultOpen,
  openVersion,
  baseUrl,
}: {
  group: CheckupGroup;
  filter: StatusFilter;
  defaultOpen: boolean;
  openVersion: number;
  baseUrl?: string;
}) {
  const Icon = GROUP_ICONS[group.id] ?? Search;
  const counts = group.tests.reduce(
    (acc, test) => {
      acc[test.status] += 1;
      return acc;
    },
    { failed: 0, warning: 0, passed: 0 },
  );

  const visible = group.tests.filter((test) => filter === "all" || test.status === filter);
  if (visible.length === 0) return null;

  return (
    <section
      id={`report-${group.id}`}
      className="report-section rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4 scroll-mt-32"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Icon className="h-4.5 w-4.5 text-blue-600" />
            {group.name}
            {group.score != null && <span className="text-slate-500">(Score: {group.score})</span>}
          </h3>
          {group.note && <p className="mt-0.5 text-xs text-slate-500">{group.note}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
          <span className="rounded bg-red-50 px-2 py-0.5 text-red-700 border border-red-200">{counts.failed} Failed</span>
          <span className="rounded bg-amber-50 px-2 py-0.5 text-amber-700 border border-amber-200">{counts.warning} Warnings</span>
          <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-700 border border-emerald-200">{counts.passed} Passed</span>
          {group.badge && (
            <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-700 border border-slate-300">{group.badge}</span>
          )}
        </div>
      </div>

      {group.headline && (
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <span className="text-3xl font-black text-slate-900">{group.headline.value}</span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">{group.headline.label}</span>
        </div>
      )}

      {filter !== "all" && (
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Showing {visible.length} of {group.tests.length} checks
        </p>
      )}

      <div className="space-y-3">
        {visible.map((test) => (
          <TestCard key={`${test.id}-${openVersion}`} test={test} defaultOpen={defaultOpen} baseUrl={baseUrl} />
        ))}
      </div>
    </section>
  );
}

export default function SeoCheckupFullReport({
  scope,
  route,
  url,
  meta,
  pagespeed: pagespeedProp,
  report: reportProp,
  onClose,
  onReAudit,
  onExportPdf,
  onExportCsv,
}: SeoCheckupFullReportProps) {
  const targetUrl = url || (scope === "site" ? "https://bharatorganicexpo.com" : `https://bharatorganicexpo.com${route === "home" || !route ? "" : `/${route.replace(/^\//, "")}`}`);
  const pagespeed = pagespeedProp?.ok ? pagespeedProp : getSavedPageSpeed(targetUrl);

  const report = useMemo(
    () => reportProp ?? buildSeoCheckupReport(scope, route ?? "home", meta, pagespeed),
    [reportProp, scope, route, meta, pagespeed],
  );

  const [filter, setFilter] = useState<StatusFilter>("all");
  const [defaultOpen, setDefaultOpen] = useState(true);
  const [openVersion, setOpenVersion] = useState(0);

  const pageUrl = url || report.url;

  const filterCounts = useMemo(
    () => ({
      all: report.totalCount,
      failed: report.failedCount,
      warning: report.warningCount,
      passed: report.passedCount,
    }),
    [report],
  );

  const visibleGroups = report.groups.filter((group) =>
    filter === "all" ? true : group.tests.some((test) => test.status === filter),
  );

  const setAllOpen = (open: boolean) => {
    setDefaultOpen(open);
    setOpenVersion((value) => value + 1);
  };

  const jumpTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /** Expand the group if it is collapsed, then scroll to it. */
  const jumpToGroup = (groupId: string | null) => {
    if (!groupId) {
      jumpTo("report-issues");
      return;
    }
    if (!defaultOpen) setAllOpen(true);
    jumpTo(`report-${groupId}`);
  };

  const handleExportCsv = () => {
    if (onExportCsv) {
      onExportCsv();
      return;
    }
    const safeRoute = report.route.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "home";
    downloadTextFile(
      `Bharat_Organic_SEO_Checkup_${scope === "site" ? "site" : safeRoute}.csv`,
      checkupReportToCsv(report),
      "text/csv;charset=utf-8",
    );
  };

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-[#f8fafc] text-sm text-[#0f172a] shadow-sm">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .report-section { break-inside: avoid; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      {/* Report header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4 text-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-2 text-lg font-extrabold text-blue-600 shadow-xs">
            ✓
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                SEO SITE CHECKUP AUDIT REPORT
              </span>
              <span className="rounded border border-slate-300 bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-700">
                {scope === "site" ? "SCOPE: DOMAIN" : `ROUTE: ${report.route}`}
              </span>
              <span
                title={SOURCE_HINT[report.scoreSource]}
                className={`rounded border px-2 py-0.5 font-mono text-[10px] font-semibold ${SOURCE_STYLES[report.scoreSource]}`}
              >
                SCORE: {sourceLabel(report.scoreSource)}
              </span>
              <span
                title={SOURCE_HINT[report.telemetrySource]}
                className={`rounded border px-2 py-0.5 font-mono text-[10px] font-semibold ${SOURCE_STYLES[report.telemetrySource]}`}
              >
                TELEMETRY: {sourceLabel(report.telemetrySource)}
              </span>
            </div>
            <h2 className="mt-0.5 flex flex-wrap items-center gap-2 text-base font-extrabold text-slate-900">
              <span>SEO Report for</span>
              <a
                href={pageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-mono text-sm text-blue-600 underline hover:text-blue-800"
              >
                {pageUrl}
                <ExternalLink className="h-4 w-4" />
              </a>
            </h2>
          </div>
        </div>

        <div className="no-print flex flex-wrap items-center gap-2">
          {onReAudit && (
            <button
              type="button"
              onClick={onReAudit}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50"
            >
              <RefreshCw className="h-3.5 w-3.5 text-blue-600" />
              Re-Audit Page
            </button>
          )}
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5 text-slate-600" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={onExportPdf ?? (() => window.print())}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700"
          >
            <Download className="h-3.5 w-3.5" />
            Download PDF
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="ml-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-slate-300 bg-slate-100 text-slate-700 transition hover:bg-slate-200"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6 p-6">
        {/* Score dials + snapshot */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <div className="rounded-xl border border-emerald-200 bg-gradient-to-b from-emerald-50/60 to-white p-5 shadow-xs md:col-span-4">
            <ScoreRing
              value={report.seoScore}
              color="#16a34a"
              source={report.scoreSource}
              label={
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Your General SEO Checkup Score
                </span>
              }
              sub={`${report.totalCount} automated checks · scores cap at 99, a perfect 100 is not attainable`}
            />
          </div>

          <div className="rounded-xl border border-blue-200 bg-gradient-to-b from-blue-50/60 to-white p-5 shadow-xs md:col-span-4">
            <ScoreRing
              value={report.aiScore}
              color="#2563eb"
              source={report.aiSource}
              label={
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
                  <Sparkles className="h-4 w-4 text-blue-600" /> AI Visibility Score
                </span>
              }
              sub="AI visibility score reflects brand reach in AI."
            />
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50/80 to-white p-5 shadow-xs md:col-span-4">
            <div>
              <h3 className="mb-1.5 text-sm font-bold text-slate-900">SEO Health Snapshot</h3>
              <p className="mb-3 text-xs leading-relaxed text-slate-600">{report.summary}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 border-t border-slate-200 pt-3 text-center">
              <div className="rounded-lg border border-red-200 bg-red-50/80 p-2">
                <span className="block text-xl font-black text-red-600">{report.failedCount}</span>
                <span className="text-[10px] font-bold uppercase text-red-700">Failed</span>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-2">
                <span className="block text-xl font-black text-amber-600">{report.warningCount}</span>
                <span className="text-[10px] font-bold uppercase text-amber-700">Warnings</span>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 p-2">
                <span className="block text-xl font-black text-emerald-600">{report.passedCount}</span>
                <span className="text-[10px] font-bold uppercase text-emerald-700">Passed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Priority issues */}
        <div id="report-issues" className="report-section space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs scroll-mt-32">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
              <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
              Priority Issues Table
            </h3>
            <span className="rounded-full bg-slate-100 px-3 py-1 font-mono text-xs font-semibold text-slate-600">
              {report.issues.length} Issues Flagged
            </span>
          </div>

          {/* Clean Light-Themed Structured Table */}
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-3.5 py-3">Priority</th>
                  <th className="px-3.5 py-3">Status</th>
                  <th className="px-3.5 py-3">Category</th>
                  <th className="px-3.5 py-3">Issue Title & Details</th>
                  <th className="px-3.5 py-3">Route</th>
                  <th className="px-3.5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {report.issues.map((issue, index) => (
                  <PriorityIssueRow key={index} issue={issue} baseUrl={pageUrl} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Meta + provenance */}
        <div className="flex flex-col gap-6 w-full">
          <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-xs w-full">
            <h3 className="flex items-center gap-2 border-b border-slate-100 pb-3 text-sm font-bold text-slate-900">
              <Search className="h-4 w-4 text-blue-600" />
              Meta tags under audit
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
              <div className="rounded border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Title tag</span>
                  <span className="font-mono text-[10px] font-bold text-slate-600">{report.titleLen} chars</span>
                </div>
                <p className="mt-1 break-words font-mono text-[11px] text-slate-800">{report.pageTitle}</p>
              </div>
              <div className="rounded border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Meta description</span>
                  <span className="font-mono text-[10px] font-bold text-slate-600">
                    {report.descLen != null ? `${report.descLen} chars` : "not captured"}
                  </span>
                </div>
                <p className="mt-1 break-words font-mono text-[11px] text-slate-800">
                  {report.pageDesc ??
                      `No <meta name="description"> is served on this route (captured ${ROUTE_META_CAPTURED_AT}), so the test falls back to your crawler's issue flag.`}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-xs w-full">
            <h3 className="flex items-center justify-between border-b border-slate-100 pb-3 text-sm font-bold text-slate-900">
              <span className="flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-600" />
                Inputs used for this audit
              </span>
              <span className="text-xs font-normal text-slate-500">Every number is traceable</span>
            </h3>
            <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {report.inputs.map((input) => {
                const StatusIcon = input.status ? STATUS_STYLES[input.status].icon : null;
                return (
                  <div
                    key={input.label}
                    title={input.source ? SOURCE_HINT[input.source] : undefined}
                    className={`flex flex-col gap-1 rounded-md border px-2.5 py-1.5 min-w-0 h-fit self-start ${input.status ? INPUT_TONES[input.status] : "border-slate-200 bg-slate-50"}`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-[11px] font-bold text-slate-700 leading-tight">{input.label}</span>
                      {StatusIcon && input.status && (
                        <StatusIcon
                          className={`h-3.5 w-3.5 shrink-0 ${
                            input.status === "passed"
                              ? "text-emerald-600"
                              : input.status === "warning"
                                ? "text-amber-600"
                                : "text-red-600"
                          }`}
                        />
                      )}
                    </div>
                    <span
                      className={`font-mono text-xs font-bold leading-tight ${
                        input.status ? INPUT_VALUE_TONES[input.status] : "text-slate-900"
                      }`}
                    >
                      {input.value}
                    </span>
                    {input.source && (
                      <div className="mt-0.5">
                        <span className={`inline-block rounded border px-1.5 py-px font-mono text-[9px] font-extrabold uppercase tracking-wide ${SOURCE_STYLES[input.source]}`}>
                          {sourceLabel(input.source)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Category score summary */}
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="flex items-center justify-between border-b border-slate-100 pb-3 text-sm font-bold text-slate-900">
            <span>Score by Category</span>
            <span className="text-xs font-normal text-slate-500">Audit Group Summary</span>
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3 lg:grid-cols-4">
            {report.categories.map((category) => {
              const targetGroup = report.groups.find((group) => group.name === category.name);
              return (
              <button
                key={category.name}
                type="button"
                onClick={() => jumpToGroup(targetGroup?.id ?? null)}
                title={`Open the ${category.name} checks below`}
                className="cursor-pointer rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-1.5 text-left transition hover:border-blue-300 hover:bg-blue-50/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="block truncate font-bold text-slate-900">
                    {category.name}
                    {category.score != null ? ` (${category.score})` : ""}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                </div>
                <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold">
                  <span className="text-red-600">{category.failed} Failed</span>
                  <span className="text-amber-600">{category.warnings} Warn</span>
                  <span className="text-emerald-600">{category.passed} Pass</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-1.5 rounded-full bg-blue-600"
                    style={{
                      width: `${category.score ?? Math.round((category.passed / Math.max(1, category.passed + category.failed + category.warnings)) * 100)}%`,
                    }}
                  />
                </div>
              </button>
              );
            })}
          </div>
        </div>

        {/* Charts */}
        <div className="no-print">
          <SeoReportCharts report={report} pageSpeed={pagespeed ?? report.pageSpeed} />
        </div>

        {/* Toolbar */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filter
            </span>
            {(Object.keys(FILTER_META) as StatusFilter[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`cursor-pointer rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
                  filter === key ? "ring-2 ring-blue-400 " : ""
                }${FILTER_META[key].className}`}
              >
                {FILTER_META[key].label}
                <span className="ml-1.5 font-mono opacity-70">{filterCounts[key]}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setAllOpen(true)}
              className="cursor-pointer rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Expand all
            </button>
            <button
              type="button"
              onClick={() => setAllOpen(false)}
              className="cursor-pointer rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Collapse all
            </button>
          </div>
        </div>

        {/* Section jump nav */}
        <div className="no-print sticky top-0 z-20 -mx-1 flex flex-wrap gap-1.5 overflow-x-auto rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-xs backdrop-blur">
          <button
            type="button"
            onClick={() => jumpTo("report-issues")}
            className="cursor-pointer whitespace-nowrap rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700 transition hover:bg-red-100"
          >
            Issues
          </button>
          {visibleGroups.map((group) => {
            const Icon = GROUP_ICONS[group.id] ?? Search;
            return (
              <button
                key={group.id}
                type="button"
                onClick={() => jumpToGroup(group.id)}
                className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                <Icon className="h-3 w-3" />
                {group.name}
                <span className="font-mono text-[10px] text-slate-400">{group.tests.length}</span>
              </button>
            );
          })}
        </div>

        {/* Full check groups */}
        {visibleGroups.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            filter={filter}
            defaultOpen={defaultOpen}
            openVersion={openVersion}
            baseUrl={pageUrl}
          />
        ))}

        {visibleGroups.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            No checks match this filter on this report.
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-[11px] text-slate-500 shadow-xs">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            {report.totalCount} individual checks executed · {report.groups.length} audit groups
          </span>
          <span>Generated {new Date(report.generatedAt).toLocaleString("en-IN")} · bharatorganicexpo.com</span>
        </div>
      </div>
    </div>
  );
}

function PriorityIssueRow({
  issue,
  baseUrl,
}: {
  issue: SeoCheckupReportData["issues"][number];
  baseUrl?: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const rowTone =
    issue.status === "failed"
      ? "bg-rose-50/30 hover:bg-rose-50/70"
      : issue.status === "warning"
        ? "bg-amber-50/30 hover:bg-amber-50/70"
        : "bg-white hover:bg-slate-50";

  return (
    <React.Fragment>
      <tr className={`transition-colors border-b border-slate-100 ${rowTone}`}>
        <td className="px-3.5 py-2.5">
          <span
            className={`inline-block rounded px-2 py-0.5 text-[9px] font-extrabold tracking-wider text-white ${
              issue.priority === "HIGH"
                ? "bg-rose-600"
                : issue.priority === "MEDIUM"
                  ? "bg-amber-500"
                  : "bg-slate-500"
            }`}
          >
            {issue.priority}
          </span>
        </td>
        <td className="px-3.5 py-2.5">
          <span
            className={`inline-block rounded border px-2 py-0.5 text-[9px] font-extrabold tracking-wider ${
              issue.status === "failed"
                ? "border-rose-300 bg-rose-50 text-rose-700"
                : "border-amber-300 bg-amber-50 text-amber-700"
            }`}
          >
            {issue.status === "failed" ? "FAIL" : "WARNING"}
          </span>
        </td>
        <td className="px-3.5 py-2.5 font-semibold text-slate-700">
          {issue.group ?? "General"}
        </td>
        <td className="px-3.5 py-2.5">
          <p className="font-bold text-slate-900 leading-tight">{issue.title}</p>
        </td>
        <td className="px-3.5 py-2.5 font-mono text-[11px] font-bold text-slate-600">
          {issue.route ?? "/"}
        </td>
        <td className="px-3.5 py-2.5 text-right whitespace-nowrap flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setIsOpen((val) => !val)}
            className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-2xs hover:bg-slate-100 hover:text-blue-600 cursor-pointer shrink-0"
          >
            {isOpen ? "Hide Details" : "Details"}
          </button>
          
          <button
            type="button"
            onClick={() => {
              const route = issue.route || "/";
              const page = findCmsPageByRouteKey(cmsPages, route);
              const routeKey = page 
                ? getCmsPageRouteKey(page) 
                : (route === "/" ? "home" : route.replace(/^\//, ""));
              const editUrl = `/pages/${routeKey}/edit`;
              router.push(editUrl);
            }}
            className="inline-flex items-center gap-1 rounded bg-blue-600 text-white px-2.5 py-1 text-[11px] font-semibold shadow-2xs hover:bg-blue-700 cursor-pointer shrink-0"
          >
            <ExternalLink className="h-3 w-3" />
            Fix Issue
          </button>
        </td>
      </tr>

      {isOpen && (
        <tr className="bg-slate-50/80">
          <td colSpan={6} className="px-5 py-3 border-b border-slate-200">
            <div className="space-y-2 text-xs">
              {issue.detail && (
                <div>
                  <strong className="text-slate-900 block mb-0.5">Details:</strong>
                  <p className="text-slate-700 leading-relaxed">{issue.detail}</p>
                </div>
              )}

              {issue.evidence && issue.evidence.length > 0 && (
                <div className="rounded border border-slate-200 bg-white p-2.5">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {issue.evidence.length} Affected Asset{issue.evidence.length === 1 ? "" : "s"}
                  </p>
                  <ul className="max-h-52 space-y-1.5 overflow-y-auto pr-1">
                    {issue.evidence.map((item, i) => {
                      const isImage = typeof item === 'string' && (item.match(/\.(jpeg|jpg|gif|png|svg|webp)(\?.*)?$/i) || item.includes('res.cloudinary.com') || item.includes('/_next/image'));
                      if (isImage) {
                        let srcUrl = item;
                        if (item.startsWith('/')) {
                          const defaultBase = typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? 'https://bharatorganicexpo.com' : 'http://localhost:3001';
                          const base = baseUrl?.startsWith('http') ? baseUrl : defaultBase;
                          try {
                            srcUrl = new URL(item, base).toString();
                          } catch(e) {}
                        }
                        let sectionHint = 'Unknown Section';
                        try {
                          sectionHint = decodeURIComponent(item).split('/').pop()?.split('.')[0] || 'Unknown Section';
                        } catch(e) {}
                        return (
                          <li key={i} className="flex flex-col gap-1.5 break-all font-mono text-[10px] text-slate-700 rounded border border-slate-100 bg-slate-50/50 p-2">
                            <span className="font-bold text-blue-600">Section: {sectionHint}</span>
                            <span>{item}</span>
                            <div className="h-20 w-32 shrink-0 overflow-hidden rounded border border-slate-200 bg-white flex items-center justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={srcUrl} alt="" className="max-h-full max-w-full object-contain" loading="lazy" />
                            </div>
                          </li>
                        );
                      }
                      return (
                        <li key={i} className="break-all font-mono text-[10px] text-slate-700">
                          {item}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {issue.fix && (
                <div className="rounded border border-blue-200 bg-blue-50 p-2.5">
                  <strong className="block text-[10px] font-bold uppercase tracking-wider text-blue-700">How to Fix</strong>
                  <p className="mt-0.5 font-mono text-[11px] text-slate-800">{issue.fix}</p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
}
