"use client";

import { formatCls } from "@/lib/formatNumbers";
import React, { useEffect, useMemo, useState } from "react";
import {
  Download,
  ExternalLink,
  RefreshCw,
  Loader2,
  CheckCircle2,
  SlidersHorizontal,
  LayoutDashboard,
  AlertTriangle,
  Zap,
  ListFilter,
  Database,
  BarChart3,
  FileSpreadsheet,
} from "lucide-react";
import {
  checkupReportToCsv,
  downloadTextFile,
  sourceLabel,
  type CheckupGroup,
  type CheckupTest,
  type PageSpeedSnapshot,
  type ReportMetaOverride,
  type SeoCheckupReportData,
} from "@/lib/seoCheckupData";
import { seoAuditApi } from "@/lib/seoAuditApi";
import { SITE_ORIGIN, SITE_HOST, SITE_NAME, SITE_ID } from "@/lib/siteConfig";
import SeoReportCharts from "./SeoReportCharts";
import SeoChecklistTable from "./SeoChecklistTable";
import ReportScoreDials from "./report/ReportScoreDials";
import PriorityIssuesTable from "./report/PriorityIssuesTable";
import CheckupTelemetryGrid from "./report/CheckupTelemetryGrid";
import CategoryScoreSummary from "./report/CategoryScoreSummary";
import CheckupGroupList from "./report/CheckupGroupList";
import CoreWebVitalsCard from "./report/CoreWebVitalsCard";

export interface SeoCheckupFullReportProps {
  scope: "site" | "page";
  route?: string;
  url?: string;
  meta?: ReportMetaOverride;
  pagespeed?: PageSpeedSnapshot | null;
  strategy?: "mobile" | "desktop";
  onStrategyChange?: (strategy: "mobile" | "desktop") => void;
  report?: SeoCheckupReportData;
  onClose?: () => void;
  onReAudit?: () => void;
  /** Opens the admin's Issues to fix list on a page and kind of issue */
  onOpenIssues?: (route: string, issueType: string) => void;
  /** "route::issueType" of every issue in the Issues to fix list */
  issueKeys?: string[];
  onExportPdf?: () => void;
  onExportCsv?: () => void;
}

export type ReportSubView =
  | "overview"
  | "priority_issues"
  | "web_vitals"
  | "checklist_matrix"
  | "telemetry"
  | "charts";

export default function SeoCheckupFullReport({
  scope,
  route,
  url,
  pagespeed: pagespeedProp,
  strategy: strategyProp,
  onStrategyChange,
  report: reportProp,
  onClose,
  onReAudit,
  onOpenIssues,
  issueKeys,
  onExportPdf,
  onExportCsv,
}: SeoCheckupFullReportProps) {
  const [internalStrategy, setInternalStrategy] = useState<"mobile" | "desktop">("mobile");
  const [activeSubView, setActiveSubView] = useState<ReportSubView>("overview");
  const activeStrategy = strategyProp ?? internalStrategy;

  const handleStrategyChange = (s: "mobile" | "desktop") => {
    setInternalStrategy(s);
    if (onStrategyChange) onStrategyChange(s);
  };

  const routeKey = route ?? "home";
  const [settled, setSettled] = useState<{ key: string; report: SeoCheckupReportData | null; error: string | null } | null>(null);
  const isCurrent = settled?.key === routeKey;
  const fetched = isCurrent ? settled.report : null;
  const fetching = !reportProp && !isCurrent;
  const fetchError = isCurrent ? settled.error : null;
  const [runningLiveAudit, setRunningLiveAudit] = useState(false);

  useEffect(() => {
    if (reportProp) return;
    let cancelled = false;
    seoAuditApi
      .checkupReport(routeKey)
      .then((data) => {
        if (!cancelled) setSettled({ key: routeKey, report: data, error: null });
      })
      .catch((caught) => {
        if (!cancelled) {
          setSettled({
            key: routeKey,
            report: null,
            error: caught instanceof Error ? caught.message : "Could not load the audit report",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [reportProp, routeKey]);

  const report = reportProp ?? fetched;
  // PageSpeed shown here is only ever a REAL Google measurement of THIS page for the chosen device (mobile or desktop).
  // Nothing is derived from the other device or from another page: when there is none yet it says "not measured".
  const measured = (ps: PageSpeedSnapshot | null | undefined, strategy: "mobile" | "desktop"): PageSpeedSnapshot | null =>
    ps && ps.ok && ps.strategy === strategy ? ps : null;
  const pagespeed: PageSpeedSnapshot | null =
    measured(pagespeedProp, activeStrategy) ??
    (activeStrategy === "desktop" ? measured(report?.pageSpeedDesktop, "desktop") : measured(report?.pageSpeed, "mobile"));
  const effectivePageSpeed = pagespeed ?? null;

  // Dynamically reflect current selected page route's PageSpeed and GSC data in inputs
  const dynamicInputs = useMemo(() => {
    if (!report?.inputs) return [];
    const currentRouteSummary = report.routeSummaries?.find((s) => s.path === report.route || (report.route === "home" && s.path === "/"));

    return report.inputs
      .filter((input) => {
        const lbl = input.label.toLowerCase();
        if (lbl.includes("dom node") || lbl.includes("html document size")) return false;
        return true;
      })
      .map((input) => {
        if (input.label.toLowerCase().includes("pagespeed performance")) {
          if (effectivePageSpeed?.ok) {
            return {
              label: `PageSpeed performance (${effectivePageSpeed.strategy})`,
              value: `${effectivePageSpeed.scores.performance ?? "—"} / 100`,
              source: "measured" as const,
              status: (effectivePageSpeed.scores.performance ?? 0) >= 90 ? ("passed" as const) : (effectivePageSpeed.scores.performance ?? 0) >= 50 ? ("warning" as const) : ("failed" as const),
            };
          } else if (effectivePageSpeed) {
            return {
              label: "PageSpeed performance",
              value: effectivePageSpeed.message || "Run live PageSpeed",
              source: "measured" as const,
              status: "warning" as const,
            };
          }
        }

        if (currentRouteSummary && currentRouteSummary.searchConsole?.available) {
          if (input.label === "Google Search Clicks") {
            return {
              ...input,
              value: `${currentRouteSummary.searchConsole.clicks ?? 0} clicks (for this route)`,
            };
          }
          if (input.label === "Google Search Impressions") {
            return {
              ...input,
              value: `${currentRouteSummary.searchConsole.impressions ?? 0} impressions`,
            };
          }
          if (input.label === "Average Google Ranking") {
            return {
              ...input,
              value: `Rank #${currentRouteSummary.searchConsole.position ?? 0} on Google`,
            };
          }
        }

        return input;
      });
  }, [report, effectivePageSpeed]);

  // Build active PageSpeed group from effectivePageSpeed
  const activeGroups = useMemo(() => {
    if (!report?.groups) return [];
    let baseGroups = [...report.groups];
    if (effectivePageSpeed) {
      const ps = effectivePageSpeed;
      const { scores: sc, metrics: m } = ps;
      const status = (value: number | null): CheckupTest["status"] => {
        if (value == null) return "warning";
        if (value >= 90) return "passed";
        if (value >= 50) return "warning";
        return "failed";
      };
      const vital = (value: number | null, good: number, poor: number): CheckupTest["status"] => {
        if (value == null) return "warning";
        if (value <= good) return "passed";
        if (value <= poor) return "warning";
        return "failed";
      };

      const scoreTest = (id: string, name: string, value: number | null, note: string): CheckupTest => ({
        id: `psi-${id}`,
        name,
        status: status(value),
        level: "page",
        source: "measured",
        summary: value == null ? `${name} was not returned by PageSpeed Insights.` : note,
        meta: [{ label: "PageSpeed score", value: value == null ? "not returned" : `${value} / 100` }],
        benchmark: `${value == null ? "no data" : `${value}/100`} · Lighthouse ${ps.strategy} run`,
      });

      const metricTest = (
        id: string,
        name: string,
        value: number | null,
        display: string,
        testStatus: CheckupTest["status"],
        note: string,
      ): CheckupTest => ({
        id: `psi-${id}`,
        name,
        status: testStatus,
        level: "page",
        source: "measured",
        summary: note,
        meta: [{ label: "Lighthouse lab value", value: display, mono: true }],
      });

      const tests: CheckupTest[] = [
        scoreTest("performance", "PageSpeed Performance Score", sc.performance, "Weighted from core vital metrics for this route."),
        scoreTest("accessibility", "PageSpeed Accessibility Score", sc.accessibility, "Lighthouse accessibility audits: contrast, labels, keyboard order."),
        scoreTest("best-practices", "PageSpeed Best Practices Score", sc.bestPractices, "HTTPS, console errors, metadata and deprecations."),
        scoreTest("seo", "PageSpeed SEO Score", sc.seo, "Google's own on-page SEO checks: title, description, link text, crawlability."),
        metricTest("fcp", "First Contentful Paint", m.fcpMs, m.fcpMs == null ? "not returned" : `${((m.fcpMs / 1000) || 0).toFixed(2)}s`, vital(m.fcpMs ? m.fcpMs / 1000 : null, 1.8, 3.0), "Good is ≤ 1.8s, poor above 3.0s."),
        metricTest("lcp", "Largest Contentful Paint", m.lcpMs, m.lcpMs == null ? "not returned" : `${((m.lcpMs / 1000) || 0).toFixed(2)}s`, vital(m.lcpMs ? m.lcpMs / 1000 : null, 2.5, 4.0), "Good is ≤ 2.5s, poor above 4.0s."),
        metricTest("cls", "Cumulative Layout Shift", m.cls, m.cls == null ? "not returned" : formatCls(m.cls), vital(m.cls, 0.1, 0.25), "Visual stability. Good is ≤ 0.1, poor above 0.25."),
      ];

      const passCount = tests.filter((t) => t.status === "passed").length;
      const warnCount = tests.filter((t) => t.status === "warning").length;
      const groupScore = Math.min(99, Math.round(((passCount + warnCount * 0.5) / tests.length) * 100));

      const dynamicPageSpeedGroup: CheckupGroup = {
        id: "page-speed",
        name: "Google PageSpeed Insights (Lighthouse)",
        note: `Live Google PageSpeed Insights run for ${ps.strategy}, fetched ${new Date(ps.fetchedAt).toLocaleString("en-IN")}${ps.cached ? " (cached ≤6h)" : ""}.`,
        score: groupScore,
        tests,
      };

      baseGroups = baseGroups.filter((g) => g.id !== "page-speed");
      baseGroups.unshift(dynamicPageSpeedGroup);
    }
    return baseGroups;
  }, [report, effectivePageSpeed]);

  if (!report || !Array.isArray(report.groups) || report.groups.length === 0) {
    return (
      <div className="w-full rounded-2xl border border-slate-200/80 bg-white p-10 text-center shadow-xs">
        {fetching ? (
          <div className="space-y-2">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#0b2a6b]" />
            <p className="text-sm font-bold text-slate-800">Loading audit matrix for this route…</p>
            <p className="text-xs text-slate-500">Reading live audit data from MongoDB.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-bold text-slate-900">No audit data recorded for this route yet.</p>
            <p className="text-xs text-slate-500">
              {fetchError ?? "Run a live audit first — this panel never displays sample or mock data."}
            </p>
            {onReAudit && (
              <button
                type="button"
                disabled={runningLiveAudit}
                onClick={async () => {
                  if (runningLiveAudit) return;
                  setRunningLiveAudit(true);
                  try {
                    await onReAudit();
                  } finally {
                    setRunningLiveAudit(false);
                  }
                }}
                className="mt-2 inline-flex h-9 items-center gap-2 rounded-xl bg-[#0b2a6b] px-4 text-xs font-bold text-white shadow-xs hover:bg-[#081e4d] disabled:opacity-60 cursor-pointer transition"
              >
                {runningLiveAudit && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {runningLiveAudit ? "Running live crawl..." : "Run Live Audit Now"}
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  const pageUrl = url || report.url;

  const handleExportCsv = () => {
    if (onExportCsv) {
      onExportCsv();
      return;
    }
    const safeRoute = report.route.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "home";
    downloadTextFile(
      `${SITE_ID}_SEO_Checkup_${scope === "site" ? "site" : safeRoute}.csv`,
      checkupReportToCsv(report),
      "text/csv;charset=utf-8",
    );
  };

  return (
    <div className="w-full space-y-5 text-slate-900">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .report-section { break-inside: avoid; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      {/* Top Dials & Executive Health Summary */}
      <ReportScoreDials
        seoScore={report.seoScore}
        scoreSource={report.scoreSource}
        totalChecks={report.totalCount}
        effectivePageSpeed={effectivePageSpeed}
        activeStrategy={activeStrategy}
        onStrategyChange={handleStrategyChange}
        summary={report.summary}
        failedCount={report.failedCount}
        warningCount={report.warningCount}
        passedCount={report.passedCount}
      />

      {/* Structured Sub-View Navigator */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white p-2 shadow-xs [scrollbar-width:thin]">
        <div className="flex items-center gap-1.5 flex-nowrap">
          {[
            { id: "overview", label: "Executive Overview", icon: LayoutDashboard },
            { id: "priority_issues", label: `Priority Issues (${report.issues.length})`, icon: AlertTriangle },
            { id: "web_vitals", label: "PageSpeed & Vitals", icon: Zap },
            { id: "checklist_matrix", label: `All checks (${report.totalCount})`, icon: ListFilter },
            { id: "telemetry", label: "Technical Telemetry", icon: Database },
            { id: "charts", label: "Visual Analytics", icon: BarChart3 },
          ].map((view) => {
            const Icon = view.icon;
            const isSelected = activeSubView === view.id;
            return (
              <button
                key={view.id}
                type="button"
                onClick={() => setActiveSubView(view.id as ReportSubView)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  isSelected
                    ? "bg-[#0b2a6b] text-white shadow-2xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{view.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {onReAudit && (
            <button
              type="button"
              onClick={onReAudit}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
            >
              <RefreshCw className="h-3.5 w-3.5 text-[#0b2a6b]" />
              <span className="hidden sm:inline">Re-Audit</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            type="button"
            onClick={onExportPdf ?? (() => window.print())}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#0b2a6b] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#081e4d] transition shadow-2xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* SUB-VIEW 1: Executive Overview (Combines Priority Issues + Categories + Web Vitals) */}
      {activeSubView === "overview" && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <PriorityIssuesTable issues={report.issues} baseUrl={pageUrl} onOpenIssues={onOpenIssues} issueKeys={issueKeys} onReAudit={onReAudit} />
          <CategoryScoreSummary
            categories={report.categories}
            groups={report.groups}
            onSelectCategory={() => setActiveSubView("checklist_matrix")}
          />
          <CoreWebVitalsCard
            pagespeed={effectivePageSpeed}
            strategy={activeStrategy}
            onStrategyChange={handleStrategyChange}
          />
          <CheckupTelemetryGrid
            pageTitle={report.pageTitle}
            titleLen={report.titleLen}
            pageDesc={report.pageDesc}
            descLen={report.descLen}
            inputs={dynamicInputs}
          />
        </div>
      )}

      {/* SUB-VIEW 2: Priority Issues Action Table */}
      {activeSubView === "priority_issues" && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <PriorityIssuesTable issues={report.issues} baseUrl={pageUrl} onOpenIssues={onOpenIssues} issueKeys={issueKeys} onReAudit={onReAudit} />
        </div>
      )}

      {/* SUB-VIEW 3: Core Web Vitals & PageSpeed Insights */}
      {activeSubView === "web_vitals" && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <CoreWebVitalsCard
            pagespeed={effectivePageSpeed}
            strategy={activeStrategy}
            onStrategyChange={handleStrategyChange}
          />
        </div>
      )}

      {/* SUB-VIEW 4: Complete 101-Check SEO Matrix & Categories */}
      {activeSubView === "checklist_matrix" && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <CategoryScoreSummary
            categories={report.categories}
            groups={report.groups}
            onSelectCategory={() => {}}
          />
          {report.checklist && report.checklist.length > 0 && (
            <SeoChecklistTable checklist={report.checklist} route={report.route} url={report.url} />
          )}
          <CheckupGroupList
            groups={activeGroups}
            baseUrl={pageUrl}
            totalChecks={report.totalCount}
          />
        </div>
      )}

      {/* SUB-VIEW 5: Technical Telemetry & Metadata */}
      {activeSubView === "telemetry" && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <CheckupTelemetryGrid
            pageTitle={report.pageTitle}
            titleLen={report.titleLen}
            pageDesc={report.pageDesc}
            descLen={report.descLen}
            inputs={dynamicInputs}
          />
        </div>
      )}

      {/* SUB-VIEW 6: Visual Analytics & Radar Charts */}
      {activeSubView === "charts" && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <SeoReportCharts report={report} pageSpeed={effectivePageSpeed ?? report.pageSpeed} />
          </div>
        </div>
      )}

      {/* Audit Footnote */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200/80 bg-white px-5 py-3 text-[11.5px] text-slate-500 shadow-2xs">
        <span className="flex items-center gap-1.5 font-bold text-slate-700">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          {report.totalCount} Real Automated Tests Executed · {report.groups.length} Audit Dimension Groups
        </span>
        <span className="font-mono text-slate-500">
          Generated {new Date(report.generatedAt).toLocaleString("en-IN")} · {SITE_HOST}
        </span>
      </div>
    </div>
  );
}
