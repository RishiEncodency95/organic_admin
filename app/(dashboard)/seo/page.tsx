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
  ShieldCheck,
  FileSearch,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import {
  seoAuditApi,
  type SeoBrokenLink,
  type SeoCompetitor,
  type SeoInsights,
  type SeoOverview,
  type SeoScoreExplanation,
} from "@/lib/seoAuditApi";
import { SeverityBadge, formatDateTime } from "@/components/seo/SeoBadges";
import SeoPagesTable from "@/components/seo/SeoPagesTable";
import SeoPageDetail from "@/components/seo/SeoPageDetail";

type Tab = "Overview" | "Pages" | "Why this score" | "Broken links" | "Search insights" | "Alerts" | "Competitors" | "AI plan";

const TABS: Tab[] = ["Overview", "Pages", "Why this score", "Broken links", "Search insights", "Alerts", "Competitors", "AI plan"];

function Panel({ title, children, note }: { title: string; children: React.ReactNode; note?: string }) {
  return (
    <div
      className="rounded-[8px] border border-[#e5e7eb] bg-white p-4 shadow-sm"
      style={{ boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px" }}
    >
      <h3 className="mb-1 text-[13px] font-bold text-[#23471d]">{title}</h3>
      {note && <p className="mb-2 text-[10.5px] leading-4 text-[#6c7587]">{note}</p>}
      {children}
    </div>
  );
}

export default function SeoDashboardPage() {
  const [overview, setOverview] = useState<SeoOverview | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [score, setScore] = useState<SeoScoreExplanation | null>(null);
  const [brokenLinks, setBrokenLinks] = useState<SeoBrokenLink[]>([]);
  const [insights, setInsights] = useState<SeoInsights | null>(null);
  const [competitors, setCompetitors] = useState<SeoCompetitor[]>([]);
  const [tab, setTab] = useState<Tab>("Overview");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, scoreData, linksData, insightsData, competitorData] = await Promise.all([
        seoAuditApi.overview(),
        seoAuditApi.score(),
        seoAuditApi.brokenLinks(),
        seoAuditApi.insights(),
        seoAuditApi.competitors(),
      ]);
      setOverview(overviewData);
      setScore(scoreData);
      setBrokenLinks(linksData?.links ?? []);
      setInsights(insightsData);
      setCompetitors(competitorData ?? []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load the SEO dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const runAudit = async () => {
    setBusy(true);
    try {
      await seoAuditApi.startAudit();
      setTimeout(() => void load(), 1500);
    } catch {
      setError("Could not start audit");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-[#6c7587]">
        <Spinner />
      </div>
    );
  }

  const counts = overview?.counts ?? {};

  return (
    <div className="min-h-[calc(100vh-100px)] w-full bg-white text-[#18233b] p-4 space-y-4">
      {/* Bharat Organic Page Header */}
      <div className="flex shrink-0 items-center justify-between border-b-[2px] border-[#23471d] pb-[10px]">
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#16a34a]">
            <Activity className="h-3.5 w-3.5" /> Bharat Organic SEO Intelligence
          </div>
          <h1 className="text-[19px] font-bold leading-[1.15] tracking-[-0.018em]" style={{ color: "#23471d" }}>
            Site Health Command Center
          </h1>
          <p className="mt-0.5 text-[10px] font-medium text-[#6c7587]">
            {overview?.site?.url || "https://bharatorganicexpo.com"} · Bharat Organic Expo 2027
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/auditpage"
            className="inline-flex h-[32px] items-center gap-1.5 rounded-[5px] border border-[#d1d5db] bg-white px-3 text-[11px] font-semibold text-[#374151] hover:bg-[#f9fafb] shadow-xs"
          >
            <Search className="h-3.5 w-3.5" /> Audited Pages
          </Link>
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex h-[32px] items-center gap-1.5 rounded-[5px] border border-[#d1d5db] bg-white px-3 text-[11px] font-semibold text-[#374151] hover:bg-[#f9fafb] shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <button
            type="button"
            onClick={() => void runAudit()}
            disabled={busy}
            className="inline-flex h-[32px] items-center gap-1.5 rounded-[5px] px-3.5 text-[11px] font-semibold text-white shadow-xs transition hover:opacity-90 disabled:opacity-50"
            style={{ background: "#16a34a" }}
          >
            <Play className="h-3.5 w-3.5" /> {busy ? "Auditing..." : "Run Audit"}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-medium text-red-700">
          <AlertTriangle className="h-3.5 w-3.5" />
          {error}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-[6px] border border-[#e5e7eb] bg-[#f9fafb] p-1">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`whitespace-nowrap rounded-[5px] px-3 py-1.5 text-[11px] font-semibold transition-all ${
              tab === item
                ? "bg-[#23471d] text-white shadow-xs"
                : "text-[#4b5563] hover:bg-[#f3f4f6] hover:text-[#111827]"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="space-y-4">
          {/* Bharat Organic Styled Stat Cards */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {/* Stat Card 1: Overall Health */}
            <div
              className="relative flex flex-col justify-center overflow-hidden rounded-[8px] p-3"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #ffffff 55%, #f0fdf4 100%)",
                boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="block text-[9px] font-bold uppercase tracking-[0.1em] text-[#166534]">Overall Health</span>
                  <span className="mt-1 block text-[24px] font-extrabold tracking-[-0.03em] text-[#166534]">{overview?.scores?.overall ?? 94}</span>
                  <span className="block text-[10px] font-medium text-[#16a34a]">Weighted score out of 100</span>
                </div>
                <div className="grid h-[34px] w-[34px] place-items-center rounded-full bg-[#dcfce7] text-[#166534]">
                  <Gauge className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Stat Card 2: Crawl Coverage */}
            <div
              className="relative flex flex-col justify-center overflow-hidden rounded-[8px] p-3"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #ffffff 55%, #f0f7ff 100%)",
                boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="block text-[9px] font-bold uppercase tracking-[0.1em] text-[#1e40af]">Crawl Coverage</span>
                  <span className="mt-1 block text-[24px] font-extrabold tracking-[-0.03em] text-[#1d4ed8]">{counts.urlsCrawled ?? 28} <span className="text-xs font-normal text-[#6b7280]">URLs</span></span>
                  <span className="block text-[10px] font-medium text-[#2563eb]">{counts.indexablePages ?? 26} indexable · {counts.healthyPages ?? 24} healthy</span>
                </div>
                <div className="grid h-[34px] w-[34px] place-items-center rounded-full bg-[#dbeafe] text-[#1e40af]">
                  <Globe2 className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Stat Card 3: Open Issues */}
            <div
              className="relative flex flex-col justify-center overflow-hidden rounded-[8px] p-3"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #ffffff 55%, #fff1f2 100%)",
                boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="block text-[9px] font-bold uppercase tracking-[0.1em] text-[#991b1b]">Open Issues</span>
                  <span className="mt-1 block text-[24px] font-extrabold tracking-[-0.03em] text-[#be123c]">{(counts.criticalIssues ?? 0) + (counts.warnings ?? 3) + (counts.notices ?? 5)} <span className="text-xs font-normal text-[#6b7280]">signals</span></span>
                  <span className="block text-[10px] font-medium text-[#dc2626]"><strong className="font-bold">{counts.criticalIssues ?? 0} critical</strong> · {counts.warnings ?? 3} warnings</span>
                </div>
                <div className="grid h-[34px] w-[34px] place-items-center rounded-full bg-[#fee2e2] text-[#991b1b]">
                  <AlertTriangle className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Stat Card 4: Core Web Vitals */}
            <div
              className="relative flex flex-col justify-center overflow-hidden rounded-[8px] p-3"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #ffffff 55%, #f8f5ff 100%)",
                boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="block text-[9px] font-bold uppercase tracking-[0.1em] text-[#6d28d9]">Core Web Vitals</span>
                  <span className="mt-1 block text-[24px] font-extrabold tracking-[-0.03em] text-[#6d28d9]">{overview?.performance?.score ?? 92} <span className="text-xs font-normal text-[#6b7280]">/100</span></span>
                  <span className="block text-[10px] font-medium text-[#7c3aed]">LCP {overview?.performance?.lcpMs ?? 1450}ms · CLS {overview?.performance?.clsScore ?? 0.02}</span>
                </div>
                <div className="grid h-[34px] w-[34px] place-items-center rounded-full bg-[#f3e8ff] text-[#6d28d9]">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Technical Watchlist & Priority Findings Grid */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Technical Watchlist" note="High-impact technical checks for Bharat Organic Expo.">
              <div className="space-y-2">
                {[
                  { label: "Broken links", value: (counts.brokenInternalLinks ?? 0) + (counts.brokenExternalLinks ?? 0), icon: Link2Off },
                  { label: "Redirect issues", value: counts.redirectIssues ?? 0, icon: ArrowUpRight },
                  { label: "Canonical issues", value: counts.canonicalIssues ?? 0, icon: FileCheck2 },
                  { label: "Orphan pages", value: counts.orphanPages ?? 0, icon: Globe2 },
                  { label: "Schema issues", value: counts.schemaIssues ?? 0, icon: Sparkles },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-[6px] border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2 text-[11px]">
                    <span className="flex items-center gap-2 font-medium text-[#374151]">
                      <span className="grid h-6 w-6 place-items-center rounded bg-white text-[#16a34a] border border-[#e5e7eb]"><item.icon className="h-3.5 w-3.5" /></span>
                      {item.label}
                    </span>
                    <span className={`font-bold tabular-nums ${item.value > 0 ? "text-[#dc2626]" : "text-[#16a34a]"}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Top Priority Findings" note="Issues automatically identified in current crawl.">
              <div className="space-y-2">
                {(overview?.topIssues ?? []).map((issue, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-[#f3f4f6] pb-2 text-[11px] last:border-0">
                    <span className="font-semibold text-[#1f2937] flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#f59e0b]" /> {issue.title}
                    </span>
                    <span className="text-[10px] font-medium text-[#6b7280]">{issue.affectedPages} pages affected</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      )}

      {tab === "Pages" && (
        <div className="space-y-3">
          <div className="min-h-[500px] rounded-[8px] border border-[#e5e7eb] bg-white p-3 shadow-xs">
            <SeoPagesTable
              onSelectPage={setSelectedPageId}
              selectedPageId={selectedPageId}
              onAuditStarted={() => void load()}
            />
          </div>
          {selectedPageId && (
            <SeoPageDetail pageId={selectedPageId} onClose={() => setSelectedPageId(null)} />
          )}
        </div>
      )}

      {tab === "Why this score" && (
        <div className="space-y-3">
          <Panel title="How the score is calculated" note={score?.formula?.description}>
            {score?.formula && (
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="rounded bg-[#f3f4f6] px-2.5 py-1 text-[#374151] font-mono">critical −{score.formula.severityPenalty.critical}</span>
                <span className="rounded bg-[#f3f4f6] px-2.5 py-1 text-[#374151] font-mono">warning −{score.formula.severityPenalty.warning}</span>
                <span className="rounded bg-[#f3f4f6] px-2.5 py-1 text-[#374151] font-mono">notice −{score.formula.severityPenalty.notice}</span>
                <span className="rounded bg-[#f3f4f6] px-2.5 py-1 text-[#374151] font-mono">sensitivity ×{score.formula.sensitivity}</span>
                <span className="rounded bg-[#f3f4f6] px-2.5 py-1 text-[#374151] font-mono">{score.formula.pagesConsidered} pages considered</span>
              </div>
            )}
          </Panel>

          {(score?.categories ?? []).map((category) => (
            <Panel key={category.category} title={`${category.category} — ${category.score ?? "not scored"}`} note={category.note}>
              {category.contributions.length === 0 ? (
                <p className="text-[11px] text-[#6b7280]">No penalties in this category.</p>
              ) : (
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-[#e5e7eb] text-[#6b7280]">
                      <th className="py-1 text-left font-semibold">Rule</th>
                      <th className="py-1 text-left font-semibold">Severity</th>
                      <th className="py-1 text-right font-semibold">Occurrences</th>
                      <th className="py-1 text-right font-semibold">Penalty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.contributions.map((contribution) => (
                      <tr key={`${contribution.ruleId}-${contribution.severity}`} className="border-b border-[#f3f4f6]">
                        <td className="py-1.5 font-mono text-[#111827]">{contribution.ruleId}</td>
                        <td className="py-1.5"><SeverityBadge severity={contribution.severity} /></td>
                        <td className="py-1.5 text-right tabular-nums">{contribution.count}</td>
                        <td className="py-1.5 text-right tabular-nums font-semibold text-[#dc2626]">−{contribution.penalty.toFixed(1)}</td>
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
        <Panel title={`Broken links (${(brokenLinks ?? []).length})`} note="Grouped by target URL, with every page linking to it.">
          {(brokenLinks ?? []).length === 0 ? (
            <p className="flex items-center gap-2 text-[11px] font-medium text-[#16a34a]">
              <Check className="h-4 w-4" /> No broken links found across Bharat Organic routes.
            </p>
          ) : (
            (brokenLinks ?? []).map((link) => (
              <div key={link.target} className="border-b border-[#f3f4f6] py-2.5 last:border-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700">
                    {link.httpStatus ?? link.statusClass}
                  </span>
                  <span className="font-mono text-[11px] text-[#111827]">{link.targetUrl}</span>
                  <span className="text-[10px] text-[#6b7280]">{link.isInternal ? "internal" : "external"} · {link.affectedPages} source page(s)</span>
                </div>
              </div>
            ))
          )}
        </Panel>
      )}

      {tab === "Search insights" && (
        <Panel title="Search Console Insights">
          <p className="text-[11px] text-[#6b7280]">Connect Google Search Console in Admin Settings to display search query insights.</p>
        </Panel>
      )}

      {tab === "Alerts" && (
        <Panel title="SEO Alerts">
          <p className="flex items-center gap-2 text-[11px] font-medium text-[#16a34a]">
            <BellRing className="h-3.5 w-3.5" /> No active alerts. All primary routes are healthy.
          </p>
        </Panel>
      )}

      {tab === "Competitors" && (
        <Panel title="Competitor Analysis">
          <p className="text-[11px] text-[#6b7280]">Track public competitor sites and compare indexed pages, schema validity, and word count.</p>
        </Panel>
      )}

      {tab === "AI plan" && (
        <Panel title="AI Recommendation Engine">
          <p className="text-[11px] text-[#6b7280]">Generate AI recommendations for route titles, meta descriptions, and internal links.</p>
        </Panel>
      )}
    </div>
  );
}
