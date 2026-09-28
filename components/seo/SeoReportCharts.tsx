"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, Gauge, Maximize2, Search, X, Zap } from "lucide-react";
import {
  PAGE_INVENTORY,
  buildSeoCheckupReport,
  type PageSpeedSnapshot,
  type SeoCheckupReportData,
} from "@/lib/seoCheckupData";

function Card({
  title,
  note,
  icon,
  children,
  onExpand,
}: {
  title: string;
  note: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onExpand?: () => void;
}) {
  return (
    <div className="group relative rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-300 ease-out hover:border-blue-300 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
            {icon}
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            <p className="text-[11px] text-slate-500">{note}</p>
          </div>
        </div>
        {onExpand && (
          <button
            type="button"
            onClick={onExpand}
            title="Expand Chart Modal"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Expand</span>
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

interface TipEntry {
  dataKey?: string | number;
  name?: string | number;
  value?: string | number;
  color?: string;
  fill?: string;
}

function ChartTip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TipEntry[];
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-bold text-slate-900">{label}</p>
      {payload.map((entry, index) => (
        <p key={String(entry.dataKey ?? entry.name ?? index)} className="font-semibold" style={{ color: entry.color || entry.fill }}>
          {entry.name}: {typeof entry.value === "number" ? entry.value.toLocaleString("en-US") : entry.value}
        </p>
      ))}
    </div>
  );
}

export default function SeoReportCharts({
  report,
  pageSpeed,
}: {
  report: SeoCheckupReportData;
  pageSpeed?: PageSpeedSnapshot | null;
}) {
  const currentRoute = report.route;
  const [modalChart, setModalChart] = useState<string | null>(null);

  const routeRows = useMemo(() => {
    return PAGE_INVENTORY.map((page) => {
      const built = buildSeoCheckupReport("page", page.id);
      return {
        path: page.path,
        label: page.label,
        seo: built.seoScore,
        ai: built.aiScore,
        clicks: page.clicks,
        impressions: page.impressions,
        lcpMs: Math.round(page.lcp * 1000),
        position: page.position,
        active:
          report.scope === "page" &&
          (page.path === report.url.replace(/^https?:\/\/[^/]+/, "") ||
            page.id === currentRoute.toLowerCase().replace(/[^a-z0-9-]/g, "")),
      };
    });
  }, [report.scope, report.url, currentRoute]);

  const categoryRows = useMemo(
    () =>
      report.categories.map((category) => ({
        name: category.name,
        score: category.score ?? 0,
        failed: category.failed,
        warnings: category.warnings,
        passed: category.passed,
      })),
    [report.categories],
  );

  const lighthouseRows = useMemo(() => {
    if (!pageSpeed?.ok) return [];
    const { scores } = pageSpeed;
    return [
      { name: "Performance", score: scores.performance ?? 0, raw: scores.performance },
      { name: "Accessibility", score: scores.accessibility ?? 0, raw: scores.accessibility },
      { name: "Best Practices", score: scores.bestPractices ?? 0, raw: scores.bestPractices },
      { name: "SEO", score: scores.seo ?? 0, raw: scores.seo },
    ];
  }, [pageSpeed]);

  const renderChartContent = (chartId: string, isModal = false) => {
    const heightClass = isModal ? "h-[500px]" : "h-64";
    const tickFontSize = isModal ? 12 : 9;

    if (chartId === "seo-score") {
      return (
        <div className={heightClass}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={routeRows} margin={{ top: 12, right: 12, bottom: isModal ? 60 : 42, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="path"
                angle={-45}
                textAnchor="end"
                interval={0}
                tick={{ fontSize: tickFontSize, fill: "#475569" }}
                height={isModal ? 80 : 56}
              />
              <YAxis domain={[0, 100]} tick={{ fontSize: isModal ? 12 : 10, fill: "#475569" }} />
              <Tooltip content={<ChartTip />} cursor={{ fill: "#f1f5f9" }} />
              <Bar dataKey="seo" name="SEO score" radius={[4, 4, 0, 0]}>
                {routeRows.map((row) => (
                  <Cell
                    key={row.path}
                    fill={row.active ? "#2563eb" : row.seo >= 85 ? "#16a34a" : row.seo >= 75 ? "#f59e0b" : "#ef4444"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }

    if (chartId === "console-clicks") {
      return (
        <div className={heightClass}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={routeRows} margin={{ top: 12, right: 12, bottom: isModal ? 60 : 42, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="path"
                angle={-45}
                textAnchor="end"
                interval={0}
                tick={{ fontSize: tickFontSize, fill: "#475569" }}
                height={isModal ? 80 : 56}
              />
              <YAxis yAxisId="left" tick={{ fontSize: isModal ? 12 : 10, fill: "#475569" }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 25]} tick={{ fontSize: isModal ? 12 : 10, fill: "#475569" }} />
              <Tooltip content={<ChartTip />} cursor={{ fill: "#f1f5f9" }} />
              <Bar yAxisId="left" dataKey="clicks" name="Clicks" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="position"
                name="Avg position"
                stroke="#f59e0b"
                strokeWidth={isModal ? 3 : 2}
                dot={{ r: isModal ? 4 : 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      );
    }

    if (chartId === "score-category") {
      return (
        <div>
          <div className={heightClass}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryRows}
                layout="vertical"
                margin={{ top: 8, right: 20, bottom: 8, left: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: isModal ? 12 : 10, fill: "#475569" }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={isModal ? 180 : 132}
                  tick={{ fontSize: isModal ? 12 : 9, fill: "#475569" }}
                />
                <Tooltip content={<ChartTip />} cursor={{ fill: "#f1f5f9" }} />
                <ReferenceLine x={75} stroke="#94a3b8" strokeDasharray="4 4" />
                <Bar dataKey="score" name="Score" radius={[0, 4, 4, 0]} barSize={isModal ? 22 : 14}>
                  {categoryRows.map((row) => (
                    <Cell
                      key={row.name}
                      fill={row.score >= 90 ? "#16a34a" : row.score >= 75 ? "#f59e0b" : "#ef4444"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Dashed line marks 75, the reference point shown on the score dial. Scores are capped at 99 — a
            perfect 100 is not attainable in practice.
          </p>
        </div>
      );
    }

    if (chartId === "pagespeed") {
      return (
        <div>
          <div className={heightClass}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lighthouseRows} margin={{ top: 12, right: 12, bottom: 12, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: isModal ? 13 : 10, fill: "#475569" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: isModal ? 12 : 10, fill: "#475569" }} />
                <Tooltip content={<ChartTip />} cursor={{ fill: "#f1f5f9" }} />
                <ReferenceLine y={90} stroke="#16a34a" strokeDasharray="4 4" />
                <Bar dataKey="score" name="Score" radius={[4, 4, 0, 0]} barSize={isModal ? 64 : 42}>
                  {lighthouseRows.map((row) => (
                    <Cell
                      key={row.name}
                      fill={row.score >= 90 ? "#16a34a" : row.score >= 50 ? "#f59e0b" : "#ef4444"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Green line marks the 90 threshold Google uses for a &quot;good&quot; score. These are Google&apos;s own
            numbers for {report.url} — not derived from the crawl.
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="report-section grid grid-cols-1 gap-6 xl:grid-cols-2">
      <Card
        title="SEO score by route"
        note={`Every one of the ${PAGE_INVENTORY.length} crawled routes${report.scope === "page" ? " · your route is highlighted" : ""}`}
        icon={<BarChart3 className="h-4 w-4" />}
        onExpand={() => setModalChart("seo-score")}
      >
        {renderChartContent("seo-score")}
      </Card>

      <Card
        title="Search Console clicks by route"
        note="Measured clicks in the current Search Console window, from your crawl export"
        icon={<Search className="h-4 w-4" />}
        onExpand={() => setModalChart("console-clicks")}
      >
        {renderChartContent("console-clicks")}
      </Card>

      <Card
        title="Score by category"
        note={`${report.categories.length} categories · ${report.totalCount} individual checks`}
        icon={<Gauge className="h-4 w-4" />}
        onExpand={() => setModalChart("score-category")}
      >
        {renderChartContent("score-category")}
      </Card>

      {pageSpeed?.ok && lighthouseRows.length > 0 && (
        <Card
          title="Google PageSpeed Insights (Lighthouse)"
          note={`Live run · ${pageSpeed.strategy} · fetched ${new Date(pageSpeed.fetchedAt).toLocaleString("en-IN")}`}
          icon={<Zap className="h-4 w-4" />}
          onExpand={() => setModalChart("pagespeed")}
        >
          {renderChartContent("pagespeed")}
        </Card>
      )}

      {!pageSpeed?.ok && report.scope === "page" && (
        <Card
          title="Google PageSpeed Insights (Lighthouse)"
          note="Not fetched for this route yet"
          icon={<Zap className="h-4 w-4" />}
        >
          <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 text-center">
            <p className="max-w-sm text-xs text-slate-500">
              Run the live PageSpeed Insights audit for {report.url} to see Google&apos;s Performance,
              Accessibility, Best Practices and SEO scores with FCP, LCP, TBT, CLS and Speed Index.
            </p>
            <span className="rounded border border-slate-300 bg-white px-2.5 py-1 font-mono text-[10px] font-bold uppercase text-slate-500">
              awaiting run
            </span>
          </div>
        </Card>
      )}

      <div className="xl:col-span-2">
        <Card
          title="Site-wide telemetry"
          note={`Aggregated from the same ${PAGE_INVENTORY.length}-route inventory every other number on this report uses`}
          icon={<BarChart3 className="h-4 w-4" />}
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { label: "Routes crawled", value: String(PAGE_INVENTORY.length) },
              { label: "Routes at 99 (no issues)", value: String(PAGE_INVENTORY.filter((p) => p.score >= 100).length) },
              { label: "Avg words / route", value: String(Math.round(PAGE_INVENTORY.reduce((a, p) => a + p.words, 0) / PAGE_INVENTORY.length)) },
              { label: "Avg LCP", value: `${(PAGE_INVENTORY.reduce((a, p) => a + p.lcp, 0) / PAGE_INVENTORY.length).toFixed(2)}s` },
              { label: "Total clicks", value: PAGE_INVENTORY.reduce((a, p) => a + p.clicks, 0).toLocaleString("en-US") },
              {
                label: "Avg position (by impressions)",
                value: (
                  PAGE_INVENTORY.reduce((a, p) => a + p.position * p.impressions, 0) /
                  PAGE_INVENTORY.reduce((a, p) => a + p.impressions, 0)
                ).toFixed(1),
              },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
                <span className="block text-lg font-black text-slate-900">{stat.value}</span>
                <span className="text-[10px] font-bold uppercase text-slate-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* FULL-SCREEN CHART EXPAND MODAL */}
      {modalChart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative flex w-full max-w-5xl flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  {modalChart === "seo-score" || modalChart === "console-clicks" ? (
                    <BarChart3 className="h-5 w-5" />
                  ) : modalChart === "score-category" ? (
                    <Gauge className="h-5 w-5" />
                  ) : (
                    <Zap className="h-5 w-5" />
                  )}
                </span>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    {modalChart === "seo-score"
                      ? "SEO Score by Route (Detailed Full View)"
                      : modalChart === "console-clicks"
                        ? "Search Console Clicks & Average Position by Route"
                        : modalChart === "score-category"
                          ? "Score by Category Breakdown"
                          : "Google PageSpeed Insights Scores"}
                  </h2>
                  <p className="text-xs text-slate-500">
                    High-resolution telemetry chart for all crawled site routes
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalChart(null)}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-600 transition hover:bg-slate-200 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="my-2 w-full">{renderChartContent(modalChart, true)}</div>

            <div className="mt-4 flex justify-end border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setModalChart(null)}
                className="cursor-pointer rounded-lg bg-slate-900 px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800"
              >
                Close Modal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
