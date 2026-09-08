"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BellRing,
  Check,
  Code2,
  FileCheck2,
  Gauge,
  Globe2,
  Link2Off,
  Play,
  RefreshCw,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import {
  seoAuditApi,
  type SeoBrokenLink,
  type SeoCompetitor,
  type SeoCompetitorComparison,
  type SeoInsights,
  type SeoOverview,
  type SeoRecommendationResponse,
  type SeoScoreExplanation,
} from "@/lib/seoAuditApi";
import { Input } from "@/components/ui/Input";
import { SeverityBadge, formatDateTime, formatMs, formatNumber } from "@/components/seo/SeoBadges";
import { DonutChart } from "@/components/charts/DonutChart";
import { MagnitudeBarChart } from "@/components/charts/MagnitudeBarChart";
import { TrendChart } from "@/components/charts/TrendChart";

type Tab = "Overview" | "Why this score" | "Broken links" | "Search insights" | "Alerts" | "Competitors" | "AI plan";

const TABS: Tab[] = ["Overview", "Why this score", "Broken links", "Search insights", "Alerts", "Competitors", "AI plan"];

function Panel({ title, children, note }: { title: string; children: React.ReactNode; note?: string }) {
  return (
    <div className="rounded-xl border border-surface-border bg-surface-card p-3 shadow-sm">
      <h3 className="mb-1 text-sm font-semibold text-text-primary">{title}</h3>
      {note && <p className="mb-2 text-[11px] leading-4 text-text-muted">{note}</p>}
      {children}
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
  danger,
}: {
  label: string;
  value: string | number;
  hint?: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-lg border border-surface-border bg-surface-card px-3 py-2 shadow-sm">
      <span className="block text-[10px] uppercase tracking-wide text-text-muted">{label}</span>
      <span
        className={`text-[18px] font-semibold tabular-nums ${danger ? "text-status-danger-text" : "text-text-primary"}`}
      >
        {value}
      </span>
      {hint && <span className="block text-[10px] text-text-muted">{hint}</span>}
    </div>
  );
}

function changeLabel(current: number, previous: number): string {
  if (!previous) return "no prior period";
  const change = ((current - previous) / previous) * 100;
  return `${change >= 0 ? "+" : ""}${change.toFixed(1)}% vs previous`;
}

function formatElapsed(value: number): string {
  const totalSeconds = Math.floor(value / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

export default function SeoDashboardPage() {
  const [overview, setOverview] = useState<SeoOverview | null>(null);
  const [score, setScore] = useState<SeoScoreExplanation | null>(null);
  const [brokenLinks, setBrokenLinks] = useState<SeoBrokenLink[]>([]);
  const [insights, setInsights] = useState<SeoInsights | null>(null);
  const [aiPlan, setAiPlan] = useState<SeoRecommendationResponse | null>(null);
  const [competitors, setCompetitors] = useState<SeoCompetitor[]>([]);
  const [comparison, setComparison] = useState<SeoCompetitorComparison | null>(null);
  const [competitorLabel, setCompetitorLabel] = useState("");
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [tab, setTab] = useState<Tab>("Overview");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, scoreData, linksData, insightsData, competitorData, comparisonData] = await Promise.all([
        seoAuditApi.overview(),
        seoAuditApi.score(),
        seoAuditApi.brokenLinks({ limit: 50 }),
        seoAuditApi.insights(),
        seoAuditApi.competitors(),
        seoAuditApi.competitorComparison(),
      ]);
      setOverview(overviewData);
      setScore(scoreData);
      setBrokenLinks(linksData.links);
      setInsights(insightsData);
      setCompetitors(competitorData);
      setComparison(comparisonData);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load the SEO dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!overview?.runningCrawl) return;
    const timer = window.setInterval(() => {
      setNow(Date.now());
      void load();
    }, 10_000);
    return () => window.clearInterval(timer);
  }, [overview?.runningCrawl, load]);

  const runAudit = async () => {
    if (overview?.runningCrawl) return;
    setBusy(true);
    try {
      await seoAuditApi.startAudit();
      setTimeout(() => void load(), 2000);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not start the audit");
    } finally {
      setBusy(false);
    }
  };

  const generatePlan = async (force: boolean) => {
    setBusy(true);
    try {
      setAiPlan(await seoAuditApi.generateSiteRecommendation(force));
    } catch (caught) {
      setAiPlan({
        status: "error",
        message: caught instanceof Error ? caught.message : "AI request failed",
        recommendation: null,
      });
    } finally {
      setBusy(false);
    }
  };

  const acknowledge = async (id: string) => {
    await seoAuditApi.acknowledgeAlert(id);
    void load();
  };

  const addCompetitor = async () => {
    setBusy(true);
    setError(null);
    try {
      await seoAuditApi.addCompetitor({ label: competitorLabel.trim(), url: competitorUrl.trim() });
      setCompetitorLabel("");
      setCompetitorUrl("");
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not add competitor");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const counts = overview?.counts ?? {};
  const search = overview?.search;
  const analytics = overview?.analytics;
  const categoryScores = overview?.scores
    ? [
        { label: "Technical", value: overview.scores.technical ?? 0 },
        { label: "On-page", value: overview.scores.onPage ?? 0 },
        { label: "Content", value: overview.scores.content ?? 0 },
        { label: "Performance", value: overview.scores.performance ?? 0 },
        { label: "Visibility", value: overview.scores.visibility ?? 0 },
      ]
    : [];
  const issueMix = [
    { key: "critical", label: "Critical", value: counts.criticalIssues ?? 0 },
    { key: "warning", label: "Warnings", value: counts.warnings ?? 0 },
    { key: "notice", label: "Notices", value: counts.notices ?? 0 },
  ].filter((item) => item.value > 0);
  const searchTrend = search?.available
    ? search.daily.map((item) => ({
        label: new Date(item.key).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
        value: item.clicks,
      }))
    : [];
  const runningStartedAt = overview?.runningCrawl?.startedAt
    ? new Date(overview.runningCrawl.startedAt).getTime()
    : null;
  const elapsedMs = runningStartedAt ? Math.max(0, now - runningStartedAt) : 0;
  const estimatedDurationMs = Math.max(12 * 60_000, (overview?.crawl?.durationMs ?? 8 * 60_000) * 2);
  const estimatedEarly = runningStartedAt ? new Date(runningStartedAt + estimatedDurationMs) : null;
  const estimatedLate = runningStartedAt ? new Date(runningStartedAt + estimatedDurationMs * 1.5) : null;

  return (
    <div className="h-full overflow-y-auto bg-surface-page p-3 lg:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-surface-border bg-surface-card px-4 py-3 shadow-sm">
        <div>
          <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
            <Activity className="h-3.5 w-3.5" /> SEO intelligence
          </div>
          <h1 className="text-xl font-bold tracking-tight text-text-primary">Site health command center</h1>
          <p className="mt-1 text-[11px] text-text-secondary">
            {overview?.site.url}
            {overview?.crawl?.completedAt ? ` · last audit ${formatDateTime(overview.crawl.completedAt)}` : ""}
            {overview?.runningCrawl ? " · an audit is running now" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" disabled title="Browser telemetry is enabled for every manual SEO audit">
            <Code2 className="h-3.5 w-3.5" />
            Browser audit: Enabled
          </Button>
          <Link href="/auditpage" className="flex h-8 items-center gap-1.5 rounded-lg border border-surface-border bg-surface-card px-3 text-[11px] font-medium text-text-secondary hover:text-text-primary">
            <Search className="h-3.5 w-3.5" /> Audited pages
          </Link>
          <Button variant="secondary" size="sm" onClick={() => void load()}>
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => void runAudit()} loading={busy} disabled={busy || Boolean(overview?.runningCrawl)}>
            <Play className="h-3.5 w-3.5" />
            {overview?.runningCrawl ? "Audit running" : "Run audit"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-status-danger-text/30 bg-status-danger-bg px-3 py-2 text-[12px] text-status-danger-text">
          <AlertTriangle className="h-3.5 w-3.5" />
          {error}
        </div>
      )}

      {overview?.runningCrawl && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#d9c28f] bg-[#fff9ea] px-4 py-3 text-[11px] text-[#6f531d] shadow-sm">
          <div>
            <p className="font-semibold text-[#49350f]">Mobile + desktop audit is running</p>
            <p className="mt-0.5">Elapsed {formatElapsed(elapsedMs)} · Google PageSpeed response times can change the finish time.</p>
          </div>
          {estimatedEarly && estimatedLate && (
            <div className="text-right">
              <p className="font-semibold text-[#49350f]">Estimated completion</p>
              <p>{formatDateTime(estimatedEarly.toISOString())} – {formatDateTime(estimatedLate.toISOString())}</p>
            </div>
          )}
        </div>
      )}

      {overview && !overview.hasData && (
        <Panel title="No audit data yet">
          <p className="text-[12px] text-text-secondary">{overview.message}</p>
        </Panel>
      )}

      {overview?.hasData && (
        <>
          <div className="mb-3 flex gap-1 overflow-x-auto rounded-xl border border-surface-border bg-surface-card p-1 shadow-sm">
            {TABS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-[12px] font-medium transition-colors ${
                  tab === item ? "bg-accent text-white shadow-sm" : "text-text-secondary hover:bg-surface-sunken hover:text-text-primary"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {tab === "Overview" && (
            <div className="flex flex-col gap-2.5">
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                <div className="relative overflow-hidden rounded-xl border border-accent/25 bg-accent-soft p-3 shadow-sm">
                  <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full border-[18px] border-accent/10" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">Overall health</span>
                  <div className="mt-1.5 flex items-end justify-between">
                    <span className="text-3xl font-bold tabular-nums text-text-primary">{overview.scores?.overall ?? "—"}</span>
                    <Gauge className="h-6 w-6 text-accent" />
                  </div>
                  <p className="mt-1 text-[11px] text-text-secondary">Weighted score across all measured SEO signals</p>
                </div>
                <div className="rounded-xl border border-surface-border bg-surface-card p-3 shadow-sm">
                  <div className="flex items-start justify-between"><span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Crawl coverage</span><Globe2 className="h-5 w-5 text-accent" /></div>
                  <div className="mt-1.5 flex items-baseline gap-2"><span className="text-2xl font-bold tabular-nums">{formatNumber(counts.urlsCrawled)}</span><span className="text-xs text-text-muted">URLs</span></div>
                  <p className="mt-1 text-[11px] text-text-secondary">{formatNumber(counts.indexablePages)} indexable · {formatNumber(counts.healthyPages)} healthy</p>
                </div>
                <div className="rounded-xl border border-surface-border bg-surface-card p-3 shadow-sm">
                  <div className="flex items-start justify-between"><span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Open issues</span><AlertTriangle className="h-5 w-5 text-status-danger-text" /></div>
                  <div className="mt-1.5 flex items-baseline gap-2"><span className="text-2xl font-bold tabular-nums">{formatNumber((counts.criticalIssues ?? 0) + (counts.warnings ?? 0) + (counts.notices ?? 0))}</span><span className="text-xs text-text-muted">signals</span></div>
                  <p className="mt-1 text-[11px] text-text-secondary"><span className="font-semibold text-status-danger-text">{formatNumber(counts.criticalIssues)} critical</span> · {formatNumber(counts.warnings)} warnings</p>
                </div>
                <div className="rounded-xl border border-surface-border bg-surface-card p-3 shadow-sm">
                  <div className="flex items-start justify-between"><span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Search visibility</span><TrendingUp className="h-5 w-5 text-accent" /></div>
                  <div className="mt-1.5 flex items-baseline gap-2"><span className="text-2xl font-bold tabular-nums">{search?.available ? formatNumber(search.totals.clicks) : "—"}</span><span className="text-xs text-text-muted">clicks</span></div>
                  <p className="mt-1 text-[11px] text-text-secondary">{search?.available ? `${formatNumber(search.totals.impressions)} impressions · ${search.totals.ctr.toFixed(1)}% CTR` : "Connect Search Console to unlock"}</p>
                </div>
              </div>

              <div className="grid gap-2 lg:grid-cols-3">
                <Panel title="Category scores" note="Latest audit score out of 100 for each measured area.">
                  <MagnitudeBarChart data={categoryScores} valueFormatter={(value) => `${value}/100`} emptyLabel="No score data yet" />
                </Panel>
                <Panel title="Issue distribution" note="Open findings grouped by severity in the latest crawl.">
                  <DonutChart data={issueMix} colorFor={(key) => key === "critical" ? "#b42318" : key === "warning" ? "#c7861b" : "#8b6a3e"} valueFormatter={(value) => `${value} issues`} emptyLabel="No open issues" />
                </Panel>
                <Panel title="Technical watchlist" note="High-signal checks that need regular attention.">
                  <div className="space-y-1.5">
                    {[
                      { label: "Broken links", value: (counts.brokenInternalLinks ?? 0) + (counts.brokenExternalLinks ?? 0), icon: Link2Off },
                      { label: "Redirect issues", value: counts.redirectIssues ?? 0, icon: ArrowUpRight },
                      { label: "Canonical issues", value: counts.canonicalIssues ?? 0, icon: FileCheck2 },
                      { label: "Orphan pages", value: counts.orphanPages ?? 0, icon: Globe2 },
                      { label: "Schema issues", value: counts.schemaIssues ?? 0, icon: Sparkles },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2 rounded-lg border border-surface-border/70 bg-surface-sunken/60 px-2.5 py-1.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-card text-accent"><item.icon className="h-3.5 w-3.5" /></span>
                        <span className="text-[12px] text-text-secondary">{item.label}</span>
                        <span className={`ml-auto text-sm font-bold tabular-nums ${item.value > 0 ? "text-text-primary" : "text-status-success-text"}`}>{formatNumber(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </Panel>
              </div>

              {search?.available && searchTrend.length >= 8 && (
                <Panel title="Organic clicks" note={`${search.rangeStart} to ${search.rangeEnd} · daily Search Console clicks`}>
                  <TrendChart data={searchTrend} valueFormatter={(value) => `${formatNumber(value)} clicks`} />
                </Panel>
              )}

              <div className="grid gap-3 lg:grid-cols-2">
                <Panel
                  title="Google Search Console"
                  note={search?.available ? search.metricNote : undefined}
                >
                  {!search?.available ? (
                    <p className="text-[12px] text-text-secondary">{search?.message ?? "Not available"}</p>
                  ) : (
                    <>
                      <div className="mb-2 grid grid-cols-4 gap-2">
                        <Metric
                          label="Clicks"
                          value={formatNumber(search.totals.clicks)}
                          hint={changeLabel(search.totals.clicks, search.previousTotals.clicks)}
                        />
                        <Metric
                          label="Impressions"
                          value={formatNumber(search.totals.impressions)}
                          hint={changeLabel(search.totals.impressions, search.previousTotals.impressions)}
                        />
                        <Metric label="CTR" value={`${search.totals.ctr.toFixed(1)}%`} />
                        <Metric label="Avg position" value={search.totals.position.toFixed(1)} />
                      </div>
                      <p className="mb-1 text-[10px] text-text-muted">
                        {search.rangeStart} to {search.rangeEnd} ({search.windowDays} days)
                      </p>
                      <table className="w-full text-[11px]">
                        <thead>
                          <tr className="border-b border-surface-border text-text-secondary">
                            <th className="py-1 text-left font-medium">Top query</th>
                            <th className="py-1 text-right font-medium">Clicks</th>
                            <th className="py-1 text-right font-medium">Impr.</th>
                            <th className="py-1 text-right font-medium">Pos</th>
                          </tr>
                        </thead>
                        <tbody>
                          {search.topQueries.slice(0, 8).map((query) => (
                            <tr key={query.key} className="border-b border-surface-border/50">
                              <td className="py-1 pr-2">{query.key}</td>
                              <td className="py-1 text-right tabular-nums">{query.clicks}</td>
                              <td className="py-1 text-right tabular-nums">{query.impressions}</td>
                              <td className="py-1 text-right tabular-nums">{query.position.toFixed(1)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  )}
                </Panel>

                <Panel title="Google Analytics 4">
                  {!analytics?.available ? (
                    <p className="text-[12px] text-text-secondary">{analytics?.message ?? "Not available"}</p>
                  ) : analytics.totals.sessions === 0 ? (
                    <p className="text-[12px] text-text-secondary">
                      The GA4 property is connected and authorised, but it returned no sessions for{" "}
                      {analytics.rangeStart} to {analytics.rangeEnd}. Check that the measurement ID is installed on the
                      website.
                    </p>
                  ) : (
                    <>
                      <div className="mb-2 grid grid-cols-4 gap-2">
                        <Metric label="Users" value={formatNumber(analytics.totals.users)} />
                        <Metric label="Sessions" value={formatNumber(analytics.totals.sessions)} />
                        <Metric label="Organic sessions" value={formatNumber(analytics.organicTotals.sessions)} />
                        <Metric label="Engagement" value={`${analytics.totals.engagementRate.toFixed(1)}%`} />
                      </div>
                      <table className="w-full text-[11px]">
                        <thead>
                          <tr className="border-b border-surface-border text-text-secondary">
                            <th className="py-1 text-left font-medium">Organic landing page</th>
                            <th className="py-1 text-right font-medium">Sessions</th>
                            <th className="py-1 text-right font-medium">Events</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.landingPages.slice(0, 8).map((row) => (
                            <tr key={row.path} className="border-b border-surface-border/50">
                              <td className="max-w-[240px] truncate py-1 pr-2">{row.path}</td>
                              <td className="py-1 text-right tabular-nums">{row.sessions}</td>
                              <td className="py-1 text-right tabular-nums">{row.keyEvents}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  )}
                </Panel>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                <Panel
                  title="Core Web Vitals"
                  note="Lab values come from Lighthouse; field values come from real Chrome users when Google has a sample."
                >
                  {!overview.performance || overview.performance.score == null ? (
                    <p className="text-[12px] text-text-secondary">
                      No PageSpeed audit in the latest crawl yet.
                    </p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      <Metric label="Perf score" value={overview.performance.score ?? "—"} />
                      <Metric label="LCP" value={formatMs(overview.performance.lcpMs)} />
                      <Metric
                        label="CLS"
                        value={overview.performance.clsScore?.toFixed(3) ?? "—"}
                      />
                      <Metric
                        label="INP"
                        value={formatMs(overview.performance.inpMs)}
                        hint={overview.performance.fieldDataAvailable ? "field data" : "lab only"}
                      />
                    </div>
                  )}
                  <div className="mt-3 border-t border-surface-border pt-3">
                    <div className="mb-2">
                      <h4 className="text-[12px] font-semibold text-text-primary">Score &amp; issue trend</h4>
                      <p className="text-[10px] text-text-muted">One point per completed audit.</p>
                    </div>
                    {(overview.history ?? []).length < 2 ? (
                      <p className="text-[11px] text-text-secondary">
                        Trends appear after the second audit. {overview.history?.length ?? 0} snapshot stored so far.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[480px] text-[10px]">
                          <thead>
                            <tr className="border-b border-surface-border text-text-secondary">
                              <th className="py-1 text-left font-medium">Audit</th>
                              <th className="py-1 text-right font-medium">Overall</th>
                              <th className="py-1 text-right font-medium">Critical</th>
                              <th className="py-1 text-right font-medium">Broken links</th>
                              <th className="py-1 text-right font-medium">Clicks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(overview.history ?? []).map((entry) => (
                              <tr key={entry.capturedAt} className="border-b border-surface-border/50 last:border-0">
                                <td className="py-1">{formatDateTime(entry.capturedAt)}</td>
                                <td className="py-1 text-right tabular-nums">{entry.scores.overall ?? "—"}</td>
                                <td className="py-1 text-right tabular-nums">{entry.counts.criticalIssues}</td>
                                <td className="py-1 text-right tabular-nums">
                                  {(entry.counts.brokenInternalLinks ?? 0) + (entry.counts.brokenExternalLinks ?? 0)}
                                </td>
                                <td className="py-1 text-right tabular-nums">{entry.search?.clicks ?? "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </Panel>

                <Panel title="Top issues by affected pages">
                  {(overview.topIssues ?? []).slice(0, 10).map((issue, index) => (
                    <div
                      key={`${issue.ruleId}-${issue.severity}-${index}`}
                      className="flex items-center justify-between border-b border-surface-border/50 py-1.5 text-[11px] last:border-0"
                    >
                      <span className="flex items-center gap-2">
                        <SeverityBadge severity={issue.severity} />
                        <span className="text-text-primary">{issue.title}</span>
                      </span>
                      <span className="tabular-nums text-text-secondary">{issue.affectedPages}</span>
                    </div>
                  ))}
                </Panel>
              </div>

            </div>
          )}

          {tab === "Why this score" && (
            <div className="flex flex-col gap-3">
              <Panel title="How the score is calculated" note={score?.formula?.description}>
                {score?.formula && (
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    <span className="rounded bg-surface-sunken px-2 py-1">
                      critical −{score.formula.severityPenalty.critical}
                    </span>
                    <span className="rounded bg-surface-sunken px-2 py-1">
                      warning −{score.formula.severityPenalty.warning}
                    </span>
                    <span className="rounded bg-surface-sunken px-2 py-1">
                      notice −{score.formula.severityPenalty.notice}
                    </span>
                    <span className="rounded bg-surface-sunken px-2 py-1">
                      sensitivity ×{score.formula.sensitivity}
                    </span>
                    <span className="rounded bg-surface-sunken px-2 py-1">
                      {score.formula.pagesConsidered} pages considered
                    </span>
                  </div>
                )}
              </Panel>

              {(score?.categories ?? []).map((category) => (
                <Panel key={category.category} title={`${category.category} — ${category.score ?? "not scored"}`} note={category.note}>
                  {category.contributions.length === 0 ? (
                    <p className="text-[12px] text-text-secondary">No penalties in this category.</p>
                  ) : (
                    <table className="w-full text-[11px]">
                      <thead>
                        <tr className="border-b border-surface-border text-text-secondary">
                          <th className="py-1 text-left font-medium">Rule</th>
                          <th className="py-1 text-left font-medium">Severity</th>
                          <th className="py-1 text-right font-medium">Occurrences</th>
                          <th className="py-1 text-right font-medium">Penalty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {category.contributions.map((contribution) => (
                          <tr key={`${contribution.ruleId}-${contribution.severity}`} className="border-b border-surface-border/50">
                            <td className="py-1 font-mono">{contribution.ruleId}</td>
                            <td className="py-1">
                              <SeverityBadge severity={contribution.severity} />
                            </td>
                            <td className="py-1 text-right tabular-nums">{contribution.count}</td>
                            <td className="py-1 text-right tabular-nums">−{contribution.penalty.toFixed(1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </Panel>
              ))}
            </div>
          )}

          {tab === "Broken links" && (
            <Panel title={`Broken links (${brokenLinks.length})`} note="Grouped by target URL, with every page linking to it.">
              {brokenLinks.length === 0 ? (
                <p className="flex items-center gap-2 text-[12px] text-status-success-text">
                  <Link2Off className="h-3.5 w-3.5" />
                  No broken links found in the latest crawl.
                </p>
              ) : (
                brokenLinks.map((link) => (
                  <div key={link.target} className="border-b border-surface-border/60 py-2 last:border-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-status-danger-bg px-1.5 py-0.5 text-[10px] font-semibold text-status-danger-text">
                        {link.httpStatus ?? link.statusClass}
                      </span>
                      <span className="font-mono text-[11px] text-text-primary">{link.targetUrl}</span>
                      <span className="text-[10px] text-text-muted">
                        {link.isInternal ? "internal" : "external"} · {link.affectedPages} source page(s)
                      </span>
                    </div>
                    <div className="mt-1 pl-2">
                      {link.sources.slice(0, 6).map((source, index) => (
                        <p key={`${source.sourceUrl}-${index}`} className="text-[10px] text-text-secondary">
                          ← {source.sourceUrl}
                          {source.anchorText ? ` (“${source.anchorText}”)` : ""}
                        </p>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </Panel>
          )}

          {tab === "Search insights" && (
            <div className="flex flex-col gap-3">
              {!insights?.available ? (
                <Panel title="Search insights">
                  <p className="text-[12px] text-text-secondary">{insights?.message}</p>
                </Panel>
              ) : (
                <>
                  <Panel
                    title={`Keyword cannibalisation (${insights.cannibalization.length})`}
                    note="Queries where more than one page earns impressions."
                  >
                    {insights.cannibalization.length === 0 ? (
                      <p className="text-[12px] text-text-secondary">No competing pages detected.</p>
                    ) : (
                      insights.cannibalization.slice(0, 10).map((group) => (
                        <div key={group.query} className="border-b border-surface-border/60 py-2 last:border-0">
                          <div className="flex items-center gap-2">
                            <Search className="h-3 w-3 text-text-muted" />
                            <span className="text-[12px] font-medium text-text-primary">{group.query}</span>
                            <span className="text-[10px] text-text-muted">
                              {group.totalImpressions} impressions across {group.pages.length} pages
                            </span>
                          </div>
                          {group.pages.map((page) => (
                            <p key={page.url} className="pl-5 text-[10px] text-text-secondary">
                              {page.url} — {page.impressions} impr, pos {page.position.toFixed(1)}
                            </p>
                          ))}
                        </div>
                      ))
                    )}
                  </Panel>

                  <Panel
                    title={`Content gaps (${insights.contentGaps.length})`}
                    note="Queries earning impressions but almost no clicks. No search-volume data exists for these — only measured impressions."
                  >
                    {insights.contentGaps.slice(0, 15).map((gap) => (
                      <div key={gap.query} className="flex items-center justify-between border-b border-surface-border/50 py-1.5 text-[11px] last:border-0">
                        <span className="text-text-primary">{gap.query}</span>
                        <span className="text-text-muted">
                          {gap.impressions} impr · {gap.ctr.toFixed(1)}% CTR · pos {gap.position.toFixed(1)}
                        </span>
                      </div>
                    ))}
                  </Panel>

                  <div className="grid gap-3 lg:grid-cols-2">
                    <Panel title="Rising queries">
                      {insights.risingQueries.slice(0, 10).map((query) => (
                        <div key={query.query} className="flex justify-between border-b border-surface-border/50 py-1 text-[11px] last:border-0">
                          <span>{query.query}</span>
                          <span className="text-status-success-text">
                            +{query.clicksChange} clicks
                          </span>
                        </div>
                      ))}
                    </Panel>
                    <Panel title="Falling queries">
                      {insights.fallingQueries.slice(0, 10).map((query) => (
                        <div key={query.query} className="flex justify-between border-b border-surface-border/50 py-1 text-[11px] last:border-0">
                          <span>{query.query}</span>
                          <span className="text-status-danger-text">{query.clicksChange} clicks</span>
                        </div>
                      ))}
                    </Panel>
                  </div>

                  <Panel title="Striking distance (positions 4–20)" note="Queries closest to page-one gains.">
                    {insights.strikingDistance.slice(0, 15).map((query) => (
                      <div key={query.query} className="flex justify-between border-b border-surface-border/50 py-1 text-[11px] last:border-0">
                        <span>{query.query}</span>
                        <span className="text-text-muted">
                          pos {query.position.toFixed(1)} · {query.impressions} impr
                        </span>
                      </div>
                    ))}
                  </Panel>
                </>
              )}
            </div>
          )}

          {tab === "Alerts" && (
            <Panel title={`Open alerts (${overview.alerts?.length ?? 0})`}>
              {(overview.alerts ?? []).length === 0 ? (
                <p className="flex items-center gap-2 text-[12px] text-status-success-text">
                  <BellRing className="h-3.5 w-3.5" />
                  No open alerts.
                </p>
              ) : (
                (overview.alerts ?? []).map((alert) => (
                  <div key={alert.id} className="flex items-start justify-between gap-3 border-b border-surface-border/60 py-2 last:border-0">
                    <div>
                      <div className="mb-0.5 flex items-center gap-2">
                        <SeverityBadge severity={alert.severity} />
                        <span className="text-[12px] font-medium text-text-primary">{alert.title}</span>
                      </div>
                      <p className="text-[11px] text-text-secondary">{alert.message}</p>
                      <p className="text-[10px] text-text-muted">{formatDateTime(alert.createdAt)}</p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => void acknowledge(alert.id)}>
                      <Check className="h-3.5 w-3.5" />
                      Acknowledge
                    </Button>
                  </div>
                ))
              )}
            </Panel>
          )}

          {tab === "Competitors" && (
            <div className="space-y-3">
              <Panel
                title="Observed competitor comparison"
                note="Only facts observed from each public website crawl are shown. Traffic, backlinks, search volume and live rankings are not inferred."
              >
                <div className="mb-3 grid gap-2 md:grid-cols-[1fr_2fr_auto]">
                  <Input label="Label" value={competitorLabel} onChange={(event) => setCompetitorLabel(event.target.value)} placeholder="Competitor name" />
                  <Input label="Public URL" type="url" value={competitorUrl} onChange={(event) => setCompetitorUrl(event.target.value)} placeholder="https://example.org" />
                  <Button className="self-end" size="sm" loading={busy} disabled={!competitorLabel.trim() || !competitorUrl.trim()} onClick={() => void addCompetitor()}>
                    <Globe2 className="h-3.5 w-3.5" /> Add competitor
                  </Button>
                </div>
                {competitors.length === 0 ? (
                  <p className="text-[12px] text-text-secondary">No competitors configured.</p>
                ) : competitors.map((competitor) => {
                  const profile = comparison?.competitors.find((item) => item.siteId === competitor.id);
                  return (
                    <div key={competitor.id} className="mb-2 rounded border border-surface-border p-2.5 last:mb-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-[12px] font-semibold text-text-primary">{competitor.label}</p>
                          <p className="text-[10px] text-text-muted">{competitor.url}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm" loading={busy} onClick={async () => { setBusy(true); try { await seoAuditApi.auditCompetitor(competitor.id); } finally { setBusy(false); } }}>
                            <Play className="h-3.5 w-3.5" /> Crawl
                          </Button>
                          <Button variant="secondary" size="sm" onClick={async () => { await seoAuditApi.deleteCompetitor(competitor.id); await load(); }}>Remove</Button>
                        </div>
                      </div>
                      {profile ? (
                        <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-5">
                          <Metric label="Pages" value={typeof profile.observed.pagesCrawled === "number" ? profile.observed.pagesCrawled : "Not available"} />
                          <Metric label="Indexable" value={typeof profile.observed.indexablePages === "number" ? profile.observed.indexablePages : "Not available"} />
                          <Metric label="Avg words" value={typeof profile.observed.averageWordCount === "number" ? profile.observed.averageWordCount : "Not available"} />
                          <Metric label="With schema" value={typeof profile.observed.pagesWithSchema === "number" ? profile.observed.pagesWithSchema : "Not available"} />
                          <Metric label="SEO score" value={profile.scores?.overall ?? "Not available"} />
                        </div>
                      ) : <p className="mt-2 text-[11px] text-text-muted">Run the first crawl to populate observed metrics.</p>}
                    </div>
                  );
                })}
              </Panel>
            </div>
          )}

          {tab === "AI plan" && (
            <Panel
              title="AI remediation plan"
              note="Gemini receives only the measured audit facts — scores, issue counts, Search Console and Analytics totals. It never supplies metrics of its own."
            >
              <div className="mb-3 flex gap-2">
                <Button size="sm" onClick={() => void generatePlan(false)} loading={busy}>
                  <Sparkles className="h-3.5 w-3.5" />
                  Generate plan
                </Button>
                {aiPlan?.recommendation && (
                  <Button variant="secondary" size="sm" onClick={() => void generatePlan(true)} loading={busy}>
                    Regenerate
                  </Button>
                )}
              </div>

              {aiPlan?.message && (
                <p className="mb-2 rounded border border-surface-border bg-surface-sunken px-2.5 py-2 text-[12px] text-text-secondary">
                  {aiPlan.message}
                </p>
              )}

              {aiPlan?.recommendation?.summary && (
                <p className="mb-3 text-[12px] text-text-primary">{aiPlan.recommendation.summary}</p>
              )}

              {aiPlan?.recommendation?.items.map((item, index) => (
                <div key={index} className="mb-2 rounded border border-surface-border p-2.5 last:mb-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="text-[12px] font-semibold text-text-primary">{item.title}</span>
                    <span className="rounded bg-surface-sunken px-1.5 py-0.5 text-[10px] uppercase text-text-secondary">
                      {item.priority}
                    </span>
                    {item.ruleId && (
                      <span className="rounded bg-surface-sunken px-1.5 py-0.5 font-mono text-[10px] text-text-muted">
                        {item.ruleId}
                      </span>
                    )}
                  </div>
                  <p className="mb-1 text-[11px] text-text-secondary">{item.whyItMatters}</p>
                  <p className="text-[11px] text-text-primary">{item.recommendedFix}</p>
                  {item.implementation && (
                    <pre className="mt-1 overflow-x-auto whitespace-pre-wrap rounded bg-surface-sunken p-2 text-[10px] text-text-secondary">
                      {item.implementation}
                    </pre>
                  )}
                </div>
              ))}
            </Panel>
          )}
        </>
      )}

      <p className="mt-4 flex items-center gap-1.5 text-[10px] text-text-muted">
        <Gauge className="h-3 w-3" />
        Every figure on this page comes from a stored audit: the crawler, the rules engine, Google Search Console, GA4
        and PageSpeed Insights. Nothing is estimated.
        <TrendingUp className="h-3 w-3" />
      </p>
    </div>
  );
}
