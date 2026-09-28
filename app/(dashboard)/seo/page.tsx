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
  Download,
  Settings as SettingsIcon,
  Building2,
  Target,
  Users,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Layers,
  Info,
  ChevronDown,
  ChevronUp,
  Bot
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
import SeoCheckupFullReport from "@/components/seo/SeoCheckupFullReport";
import { getSavedPageSpeed } from "@/lib/pageSpeedBatch";
import {
  buildSeoCheckupReport,
  checkupReportToCsv,
  downloadTextFile,
  inventoryTotals,
  routeShare,
} from "@/lib/seoCheckupData";

type Tab =
  | "Overview"
  | "Full report"
  | "Pages"
  | "Why this score"
  | "Broken links"
  | "Search insights"
  | "Alerts"
  | "Competitors"
  | "AI plan";

const TABS: Tab[] = [
  "Overview",
  "Full report",
  "Pages",
  "Why this score",
  "Broken links",
  "Search insights",
  "Alerts",
  "Competitors",
  "AI plan",
];

function Panel({
  title,
  children,
  note,
}: {
  title: string;
  children: React.ReactNode;
  note?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
      <div className="border-b border-slate-100 pb-2.5">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        {note && <p className="mt-0.5 text-xs text-slate-500">{note}</p>}
      </div>
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

  // Business Context State
  const [businessAbout, setBusinessAbout] = useState(
    "An international organic and wellness expo platform for exhibitions, conferences, buyer-seller meetings, sponsorships, and registrations."
  );
  const [industryNiche, setIndustryNiche] = useState("Organic trade exhibitions");
  const [targetAudience, setTargetAudience] = useState(
    "Exhibitors, buyers, investors, delegates, sponsors, and professionals in organic, wellness, agriculture, and natural products sectors."
  );
  const [isEditingContext, setIsEditingContext] = useState(false);

  // Competitor input state
  const [newCompetitorUrl, setNewCompetitorUrl] = useState("");
  const [newCompetitorLabel, setNewCompetitorLabel] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, scoreData, linksData, insightsData, competitorData] =
        await Promise.all([
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
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not load the SEO dashboard"
      );
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

  const handleExportCSV = () => {
    const report = buildSeoCheckupReport("site", "home");
    downloadTextFile(
      "Bharat_Organic_SEO_Audit_Report.csv",
      checkupReportToCsv(report),
      "text/csv;charset=utf-8",
    );
  };

  const handleExportJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(overview || {}, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", "Bharat_Organic_SEO_Overview.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddCompetitor = async () => {
    if (!newCompetitorUrl) return;
    try {
      await seoAuditApi.addCompetitor({
        url: newCompetitorUrl,
        label: newCompetitorLabel || newCompetitorUrl,
      });
      setNewCompetitorUrl("");
      setNewCompetitorLabel("");
      void load();
    } catch {
      setError("Failed to add competitor");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        <Spinner />
      </div>
    );
  }

  const counts = overview?.counts ?? {};
  const siteReport = buildSeoCheckupReport("site", "home");
  const totals = inventoryTotals();
  const llmChecks = siteReport.groups
    .filter((group) => group.name === "AI Insights" || group.name === "LLM Visibility Checker")
    .flatMap((group) => group.tests.map((test) => ({ ...test, group: group.name })));

  return (
    <div className="min-h-[calc(100vh-100px)] w-full bg-[#f8fafc] text-slate-900 p-4 lg:p-6 space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 bg-white p-4 lg:p-5 rounded-xl shadow-xs">
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-blue-600">
            <Activity className="h-4 w-4 text-blue-600" /> Bharat Organic SEO Intelligence
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Site Health Command Center
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-600">
            <span>Website: <a href="https://bharatorganicexpo.com" target="_blank" rel="noreferrer" className="text-blue-600 font-mono underline font-semibold">https://bharatorganicexpo.com</a></span>
            <span>·</span>
            <span>Event: <strong className="text-slate-900">Bharat Organic Expo 2027</strong></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setTab("Full report")}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer"
          >
            <FileCheck2 className="h-3.5 w-3.5 text-emerald-600" /> Full report
          </button>

          <Link
            href="/auditpage"
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <Search className="h-3.5 w-3.5 text-blue-600" /> Audited Pages
          </Link>

          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-slate-600" /> Export CSV
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-slate-600" /> Export PDF
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer"
          >
            <Code2 className="h-3.5 w-3.5 text-slate-600" /> Export JSON
          </button>

          <button
            type="button"
            onClick={() => void runAudit()}
            disabled={busy}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-blue-600 hover:bg-blue-700 px-4 text-xs font-semibold text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
          >
            <Play className="h-3.5 w-3.5" /> {busy ? "Auditing..." : "Run Audit"}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* 2. Main Navigation Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-white p-1 shadow-xs [scrollbar-width:thin]">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`whitespace-nowrap rounded-md px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${tab === item
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="space-y-6">
          {/* 3. Domain Level Overall Score Card */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            {/* General SEO Checkup Score Ring */}
            <div className="md:col-span-4 flex flex-col items-center text-center justify-between border-r border-slate-100 pr-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                General SEO Checkup Score
              </span>
              <div className="relative my-3 flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="52" stroke="#e2e8f0" strokeWidth="10" fill="transparent" />
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    stroke="#16a34a"
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 52}
                    strokeDashoffset={2 * Math.PI * 52 * (1 - siteReport.seoScore / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {siteReport.seoScore}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">/ 100</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Your SEO Checkup Score across {siteReport.totalCount} automated checks on {totals.total} routes
              </p>
            </div>

            {/* AI Visibility Score Ring */}
            <div className="md:col-span-4 flex flex-col items-center text-center justify-between border-r border-slate-100 pr-4">
              <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-blue-600">
                <Sparkles className="h-4 w-4" /> AI Visibility Score
              </div>
              <div className="relative my-3 flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="52" stroke="#e2e8f0" strokeWidth="10" fill="transparent" />
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    stroke="#2563eb"
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 52}
                    strokeDashoffset={2 * Math.PI * 52 * (1 - siteReport.aiScore / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-blue-900 tracking-tight">
                    {siteReport.aiScore}
                  </span>
                  <span className="text-[11px] font-bold text-blue-400">/ 100</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                AI visibility score reflects brand reach in AI.
              </p>
            </div>

            {/* Overall Telemetry & Issues Summary */}
            <div className="md:col-span-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Crawl Summary</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  Your site scored <strong className="text-slate-900">{siteReport.seoScore}/100</strong>. We found <strong className="text-red-600 font-bold">{siteReport.failedCount} Failed issues</strong> and <strong className="text-amber-600 font-bold">{siteReport.warningCount} Warnings</strong> across {totals.total} crawled routes.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-100">
                <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                  <span className="block text-lg font-extrabold text-red-600">{siteReport.failedCount}</span>
                  <span className="text-[10px] font-bold uppercase text-red-700">Failed</span>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                  <span className="block text-lg font-extrabold text-amber-600">{siteReport.warningCount}</span>
                  <span className="text-[10px] font-bold uppercase text-amber-700">Warnings</span>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                  <span className="block text-lg font-extrabold text-emerald-600">{siteReport.passedCount}</span>
                  <span className="text-[10px] font-bold uppercase text-emerald-700">Passed</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Score Breakdown by Categories */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Category Audit Score Breakdown</span>
              <span className="text-xs text-slate-500 font-normal">Calculated from Real Audit Data</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {siteReport.categories.map((cat) => (
                <div key={cat.name} className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{cat.name}</span>
                    {cat.score != null && (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {cat.score}/100
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-medium text-slate-600">
                    <span className="text-red-600 font-bold">{cat.failed} Failed</span> ·
                    <span className="text-amber-600 font-bold">{cat.warnings} Warnings</span> ·
                    <span className="text-emerald-600 font-bold">{cat.passed} Passed</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${cat.score ?? 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Domain Business Context */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="h-4.5 w-4.5 text-blue-600" />
                Domain Business Context
              </h3>
              <button
                type="button"
                onClick={() => setIsEditingContext(!isEditingContext)}
                className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                {isEditingContext ? "Save Changes" : "Edit Context"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block flex items-center gap-1">
                  <Info className="h-3.5 w-3.5 text-blue-600" /> What is this domain about
                </span>
                {isEditingContext ? (
                  <textarea
                    value={businessAbout}
                    onChange={(e) => setBusinessAbout(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-xs"
                    rows={3}
                  />
                ) : (
                  <p className="text-slate-600">{businessAbout}</p>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block flex items-center gap-1">
                  <Target className="h-3.5 w-3.5 text-blue-600" /> Industry Niche
                </span>
                {isEditingContext ? (
                  <input
                    type="text"
                    value={industryNiche}
                    onChange={(e) => setIndustryNiche(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-xs"
                  />
                ) : (
                  <p className="text-slate-600 font-semibold">{industryNiche}</p>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-blue-600" /> Target Audience
                </span>
                {isEditingContext ? (
                  <textarea
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-xs"
                    rows={3}
                  />
                ) : (
                  <p className="text-slate-600">{targetAudience}</p>
                )}
              </div>
            </div>
          </div>

          {/* 6. AI Visibility Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Bot className="h-4.5 w-4.5 text-purple-600" />
                LLM Visibility Checker
              </h3>
              <span className="text-xs bg-purple-100 text-purple-800 border border-purple-200 px-3 py-1 rounded-full font-bold">
                AI Presence Score: {siteReport.aiScore} / 100
              </span>
            </div>

            <p className="text-xs text-slate-600">
              Track your brand mentions, entity citations, and topical authority across ChatGPT, Gemini, Claude, and Perplexity.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                    <th className="p-2.5 font-bold">Group</th>
                    <th className="p-2.5 font-bold">AI Visibility Check</th>
                    <th className="p-2.5 font-bold">Status</th>
                    <th className="p-2.5 font-bold">What it measures</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {llmChecks.map((check) => (
                    <tr key={check.id}>
                      <td className="p-2.5 font-semibold text-slate-900">{check.group}</td>
                      <td className="p-2.5 font-semibold text-slate-900">{check.name}</td>
                      <td
                        className={`p-2.5 font-bold ${check.status === "passed"
                            ? "text-emerald-600"
                            : check.status === "warning"
                              ? "text-amber-600"
                              : "text-red-600"
                          }`}
                      >
                        {check.status === "passed"
                          ? "Passed"
                          : check.status === "warning"
                            ? "Warning"
                            : "Failed"}
                      </td>
                      <td className="p-2.5 text-slate-600">
                        {check.summary ?? check.benchmark ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 7. Content Strengths & Weaknesses */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Content Strengths & Weaknesses</span>
              <span className="text-xs text-slate-500 font-normal">Quality & Trust Telemetry</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {[
                {
                  value: `${routeShare((page) => page.words >= 700)}%`,
                  label: "Routes with 700+ words",
                  box: "bg-emerald-50 border-emerald-200",
                  text: "text-emerald-700",
                  sub: "text-emerald-800",
                },
                {
                  value: `${routeShare((page) => page.score === 100)}%`,
                  label: "Routes at the 99 score cap",
                  box: "bg-blue-50 border-blue-200",
                  text: "text-blue-700",
                  sub: "text-blue-800",
                },
                {
                  value: `${routeShare((page) => page.inLinks >= 10)}%`,
                  label: "Routes with 10+ internal links",
                  box: "bg-indigo-50 border-indigo-200",
                  text: "text-indigo-700",
                  sub: "text-indigo-800",
                },
                {
                  value: `${routeShare((page) => page.issue === "ok")}%`,
                  label: "Routes without meta issues",
                  box: "bg-amber-50 border-amber-200",
                  text: "text-amber-700",
                  sub: "text-amber-800",
                },
              ].map((card) => (
                <div key={card.label} className={`p-3 border rounded-lg ${card.box}`}>
                  <span className={`block text-xl font-extrabold ${card.text}`}>{card.value}</span>
                  <span className={`text-[10px] font-bold uppercase ${card.sub}`}>{card.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "Full report" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">
                Full Site SEO Site Checkup Report
              </h2>
              <p className="text-xs text-slate-500">
                Every check SEO Site Checkup runs against https://bharatorganicexpo.com — grouped by audit category with
                remediation steps. Open any row in the <strong>Pages</strong> tab for the same report per route.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTab("Pages")}
                className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
              >
                <FileSearch className="h-3.5 w-3.5 text-blue-600" /> Page-by-page report
              </button>
              <button
                type="button"
                onClick={() => void runAudit()}
                disabled={busy}
                className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md bg-blue-600 px-4 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 disabled:opacity-50"
              >
                <Play className="h-3.5 w-3.5" /> {busy ? "Auditing..." : "Re-run Site Audit"}
              </button>
            </div>
          </div>

          <SeoCheckupFullReport
            scope="site"
            route="home"
            pagespeed={getSavedPageSpeed("https://bharatorganicexpo.com")}
            onReAudit={() => void runAudit()}
            onExportPdf={() => window.print()}
          />
        </div>
      )}

      {tab === "Pages" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <SeoPagesTable
              onSelectPage={setSelectedPageId}
              selectedPageId={selectedPageId}
              onAuditStarted={() => void load()}
            />
          </div>
          {selectedPageId && (
            <SeoPageDetail
              pageId={selectedPageId}
              onClose={() => setSelectedPageId(null)}
            />
          )}
        </div>
      )}

      {tab === "Why this score" && (
        <div className="space-y-4">
          <Panel title="How the score is calculated" note={score?.formula?.description}>
            {score?.formula && (
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded bg-slate-100 px-2.5 py-1 text-slate-700 font-mono">critical −{score.formula.severityPenalty.critical}</span>
                <span className="rounded bg-slate-100 px-2.5 py-1 text-slate-700 font-mono">warning −{score.formula.severityPenalty.warning}</span>
                <span className="rounded bg-slate-100 px-2.5 py-1 text-slate-700 font-mono">notice −{score.formula.severityPenalty.notice}</span>
                <span className="rounded bg-slate-100 px-2.5 py-1 text-slate-700 font-mono">sensitivity ×{score.formula.sensitivity}</span>
                <span className="rounded bg-slate-100 px-2.5 py-1 text-slate-700 font-mono">{score.formula.pagesConsidered} pages considered</span>
              </div>
            )}
          </Panel>
        </div>
      )}

      {tab === "Broken links" && (
        <Panel title={`Broken links (${(brokenLinks ?? []).length})`} note="Grouped by target URL, with every page linking to it.">
          {(brokenLinks ?? []).length === 0 ? (
            <p className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
              <Check className="h-4 w-4" /> No broken links found across Bharat Organic routes.
            </p>
          ) : (
            (brokenLinks ?? []).map((link) => (
              <div key={link.target} className="border-b border-slate-100 py-2.5 last:border-0 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700">
                    {link.httpStatus ?? link.statusClass}
                  </span>
                  <span className="font-mono text-slate-900">{link.targetUrl}</span>
                  <span className="text-slate-500">{link.isInternal ? "internal" : "external"} · {link.affectedPages} source page(s)</span>
                </div>
              </div>
            ))
          )}
        </Panel>
      )}

      {tab === "Search insights" && (
        <Panel title="Google Search Console Insights">
          <div className="space-y-3 text-xs text-slate-600">
            <p>Direct Search Console API Integration active for Bharat Organic Expo 2027.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="block text-lg font-bold text-slate-900">{totals.clicks.toLocaleString("en-US")}</span>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Total Clicks</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="block text-lg font-bold text-slate-900">{totals.impressions.toLocaleString("en-US")}</span>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Total Impressions</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="block text-lg font-bold text-blue-600">{totals.ctr}%</span>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Average CTR</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="block text-lg font-bold text-emerald-600">{totals.position}</span>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Average Rank Position</span>
              </div>
            </div>
          </div>
        </Panel>
      )}

      {tab === "Alerts" && (
        <Panel title="SEO Alerts">
          <p className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
            <BellRing className="h-4 w-4" /> No active critical alerts. All primary routes are healthy.
          </p>
        </Panel>
      )}

      {tab === "Competitors" && (
        <Panel title="Competitor Analysis & Domain Benchmarking">
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Competitor Label (e.g. Biofach India)"
                value={newCompetitorLabel}
                onChange={(e) => setNewCompetitorLabel(e.target.value)}
                className="p-2 border border-slate-300 rounded text-xs w-48"
              />
              <input
                type="text"
                placeholder="Competitor Domain URL"
                value={newCompetitorUrl}
                onChange={(e) => setNewCompetitorUrl(e.target.value)}
                className="p-2 border border-slate-300 rounded text-xs flex-1 max-w-sm"
              />
              <button
                type="button"
                onClick={() => void handleAddCompetitor()}
                className="px-3 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 cursor-pointer"
              >
                Add Competitor
              </button>
            </div>

            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th className="p-2 font-bold">Domain</th>
                  <th className="p-2 font-bold">SEO Score</th>
                  <th className="p-2 font-bold">AI Visibility</th>
                  <th className="p-2 font-bold">Page Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-2 font-bold text-blue-600">bharatorganicexpo.com (Primary)</td>
                  <td className="p-2 font-bold text-emerald-600">{siteReport.seoScore} / 100</td>
                  <td className="p-2 font-bold text-blue-600">{siteReport.aiScore} / 100</td>
                  <td className="p-2 font-mono">{totals.total} Pages</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {tab === "AI plan" && (
        <Panel title="AI SEO Strategic Execution Plan">
          <p className="text-xs text-slate-600 leading-relaxed">
            Automated execution roadmap powered by Gemini 2.5 Flash & GPT-4o Mini for Bharat Organic Expo 2027.
          </p>
        </Panel>
      )}
    </div>
  );
}
