"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Bot,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Globe,
  Image as ImageIcon,
  Check,
  Search,
  ExternalLink,
  Layers,
  Eye,
  Info,
  Filter,
  Loader2,
} from "lucide-react";
import { seoAuditApi, type SiteContentScanResponse, type LiveContentScanResponse } from "@/lib/seoAuditApi";
import Spinner from "@/components/ui/Spinner";
import PageTextBlocks from "@/components/seo/PageTextBlocks";
import PaginationBar from "@/components/seo/PaginationBar";
import { errorMessage } from "@/lib/errorMessage";

interface AiContentAuditorProps {
  currentRoute?: string;
}

export default function AiContentAuditor({ currentRoute = "/" }: AiContentAuditorProps) {
  // Navigation sub-tab: "matrix" (Entire Website Matrix 34 routes) | "deep" (Deep Route & Image Inspector)
  const [activeTab, setActiveTab] = useState<"matrix" | "deep">("matrix");

  // ─────────────────────────────────────────────────────────────────────────────
  // TAB 1: Entire Website Matrix State
  // ─────────────────────────────────────────────────────────────────────────────
  const [siteScanLoading, setSiteScanLoading] = useState(false);
  const [siteData, setSiteData] = useState<SiteContentScanResponse["data"] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "high_ai" | "missing_alt" | "clean">("all");
  const [sortBy, setSortBy] = useState<"order" | "alt" | "originality" | "words">("order");
  const [matrixPage, setMatrixPage] = useState(1);
  const [matrixPageSize, setMatrixPageSize] = useState(10);

  // Fetch site-wide matrix
  const fetchSiteMatrix = async () => {
    try {
      setSiteScanLoading(true);
      const res = await seoAuditApi.getSiteContentScan();
      const d = res?.data || res;
      if (d && (d.pages || d.totalPages)) {
        setSiteData(d);
      }
    } catch (err) {
      console.error("Failed to load site content scan:", err);
    } finally {
      setSiteScanLoading(false);
    }
  };

  useEffect(() => {
    // Deferred a microtask so the loading flag is not set synchronously in the effect body.
    queueMicrotask(() => void fetchSiteMatrix());
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // TAB 2: Deep Page & Image Inspector State
  // ─────────────────────────────────────────────────────────────────────────────
  const [selectedRoute, setSelectedRoute] = useState(currentRoute || "/");
  const [content, setContent] = useState("");
  const [targetKeyword, setTargetKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanningLive, setScanningLive] = useState(false);
  const [humanizing, setHumanizing] = useState(false);
  const [humanizeSuccess, setHumanizeSuccess] = useState(false);
  const [imageCategoryFilter, setImageCategoryFilter] = useState<"all" | "ai_suspect" | "missing_alt" | "generic_alt" | "ok">("all");

  const [result, setResult] = useState<LiveContentScanResponse["data"] | null>(null);

  const [humanizedResult, setHumanizedResult] = useState<{
    humanizedText: string;
    originalityScore: number;
    aiScore: number;
    improvementsMade: string[];
    suggestedH1?: string;
    suggestedMetaTitle?: string;
    suggestedMetaDescription?: string;
    savedToDb?: boolean;
  } | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Trigger Live Scan for a specific route
  const handleLiveScan = async (routeToScan?: string) => {
    const route = routeToScan || selectedRoute || "/";
    try {
      setErrorBanner(null);
      setScanningLive(true);
      setHumanizedResult(null);
      setHumanizeSuccess(false);

      const res = await seoAuditApi.analyzeLiveContent({ route });
      const d = res?.data || res;
      if (d) {
        if (d.sampleText) {
          setContent(d.sampleText);
        }
        setResult(d);
      }
    } catch (err) {
      setErrorBanner(errorMessage(err) || "Failed to scan live page content.");
    } finally {
      setScanningLive(false);
    }
  };

  // Switch to Tab 2 and deep inspect a route from the matrix table
  // AI picture check per page (saved in the database; a picture is never sent to the AI model twice)
  const [aiRunning, setAiRunning] = useState<Record<string, boolean>>({});
  const [aiNote, setAiNote] = useState<Record<string, string>>({});
  const [aiBulk, setAiBulk] = useState<{ done: number; total: number } | null>(null);

  const checkAiOfPage = async (route: string): Promise<void> => {
    setAiRunning((m) => ({ ...m, [route]: true }));
    try {
      const r = await seoAuditApi.aiImages(route, { limit: 40 });
      setSiteData((d) =>
        d
          ? {
              ...d,
              pages: d.pages.map((p) => (p.route === route ? { ...p, aiCheckedCount: r.judged, aiSuspectCount: r.provenAi + r.likelyAi } : p)),
              aiSuspectImages: d.pages.reduce((n, p) => n + (p.route === route ? r.provenAi + r.likelyAi : p.aiSuspectCount), 0),
            }
          : d,
      );
      setAiNote((m) => ({ ...m, [route]: r.notCheckedThisRun > 0 ? `${r.notCheckedThisRun} more picture${r.notCheckedThisRun === 1 ? "" : "s"} not checked in this run: press again` : "" }));
    } catch (err) {
      setAiNote((m) => ({ ...m, [route]: errorMessage(err) || "The pictures could not be checked." }));
    } finally {
      setAiRunning((m) => ({ ...m, [route]: false }));
    }
  };

  const checkAiOfAllPages = async () => {
    const routes = (siteData?.pages || []).map((p) => p.route);
    if (!routes.length) return;
    if (!window.confirm(`Check the pictures of ${routes.length} pages for AI? Each picture is sent once to the AI model (pictures checked before are not sent again). This can take several minutes.`)) return;
    for (let i = 0; i < routes.length; i++) {
      setAiBulk({ done: i, total: routes.length });
      await checkAiOfPage(routes[i]);
    }
    setAiBulk(null);
  };

  const handleInspectRoute = (route: string) => {
    setSelectedRoute(route);
    setActiveTab("deep");
    handleLiveScan(route);
  };

  // Filtered, sorted and paged matrix pages
  const filteredPages = (siteData?.pages || [])
    .filter((p) => {
      const q = searchQuery.toLowerCase();
      if (q && !p.route.toLowerCase().includes(q) && !p.title.toLowerCase().includes(q)) return false;
      if (statusFilter === "missing_alt") return p.missingAltCount > 0;
      if (statusFilter === "high_ai") return p.aiSuspectCount > 0;
      if (statusFilter === "clean") return p.missingAltCount === 0 && p.aiSuspectCount === 0;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "alt") return b.missingAltCount + b.aiSuspectCount - (a.missingAltCount + a.aiSuspectCount);
      if (sortBy === "originality") return a.originalityScore - b.originalityScore;
      if (sortBy === "words") return b.wordCount - a.wordCount;
      return 0;
    });
  const matrixPages = Math.max(1, Math.ceil(filteredPages.length / matrixPageSize));
  const matrixCurrent = Math.min(matrixPage, matrixPages);
  const matrixVisible = filteredPages.slice((matrixCurrent - 1) * matrixPageSize, matrixCurrent * matrixPageSize);
  const pageCount = siteData?.pages?.length ?? siteData?.totalPages ?? null;
  const needAlt = (siteData?.pages || []).reduce((n, p) => n + p.missingAltCount, 0);
  const needsBetterAlt = (siteData?.pages || []).reduce((n, p) => n + (p.genericAltCount ?? 0), 0);
  const stockImages = (siteData?.pages || []).reduce((n, p) => n + p.aiSuspectCount, 0);
  const aiChecked = (siteData?.pages || []).reduce((n, p) => n + (p.aiCheckedCount ?? 0), 0);
  const altWaiting = (siteData?.pages || []).reduce((n, p) => n + (p.savedAltWaiting ?? 0), 0);

  // Filtered images for deep view
  const currentImages = result?.images || [];
  const filteredImages = currentImages.filter((img) => {
    if (imageCategoryFilter === "all") return true;
    if (imageCategoryFilter === "ai_suspect") return img.isAiSuspect || img.status === "ai_suspect";
    if (imageCategoryFilter === "missing_alt") return !img.hasAlt || img.status === "missing_alt";
    if (imageCategoryFilter === "generic_alt") return img.status === "generic_alt";
    if (imageCategoryFilter === "ok") return img.status === "ok";
    return true;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header & Sub-Tabs */}
      <div className="border-b border-violet-100 bg-violet-50/70 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <Sparkles className="h-[18px] w-[18px]" />
            </span>
            <div>
              <h2 className="text-[0.9375rem] text-slate-800 [font-weight:500]">AI content & image guard</h2>
              <p className="text-[0.75rem] text-slate-500">
                Checks every page of your website for machine-sounding text, missing image alt text, and AI-generated pictures.
              </p>
            </div>
          </div>

          {/* Sub-tab Switcher */}
          <div className="flex items-center gap-1 rounded-xl bg-white/80 p-1 text-[0.75rem] shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab("matrix")}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${activeTab === "matrix" ? "bg-violet-600 text-white shadow-xs" : "text-slate-600 hover:bg-violet-50"}`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Whole website{pageCount ? ` (${pageCount} pages)` : ""}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("deep");
                if (!result) handleLiveScan(selectedRoute);
              }}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${activeTab === "deep" ? "bg-violet-600 text-white shadow-xs" : "text-slate-600 hover:bg-violet-50"}`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>One page in detail</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 1: Entire Website Content & Media Matrix
          ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "matrix" && (
        <div className="space-y-3 p-4">
          {/* Summary cards (the two on the right also filter the table) */}
          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            {[
              { label: "Pages checked", hint: "Read live from your website", value: pageCount, icon: Globe, tile: "bg-sky-50 border-sky-200", bubble: "bg-sky-100 text-sky-600", filter: "all" as const },
              { label: "Pictures checked", hint: "Every image on every page", value: siteData?.totalImages ?? null, icon: ImageIcon, tile: "bg-violet-50 border-violet-200", bubble: "bg-violet-100 text-violet-600", filter: null },
              { label: "Need alt text", hint: `On the live pages: ${needAlt} without alt${needsBetterAlt ? `, ${needsBetterAlt} too vague` : ""}${altWaiting ? ` · ${altWaiting} more saved, waiting for the website` : ""}`, value: siteData ? needAlt + needsBetterAlt : null, icon: AlertTriangle, tile: "bg-amber-50 border-amber-200", bubble: "bg-amber-100 text-amber-700", filter: "missing_alt" as const },
              { label: "AI-made pictures", hint: aiChecked ? `Found among ${aiChecked} pictures checked (proof or AI estimate)` : "No picture checked for AI yet: use Check AI on a page", value: siteData ? stockImages : null, icon: Bot, tile: "bg-rose-50 border-rose-200", bubble: "bg-rose-100 text-rose-600", filter: "high_ai" as const },
            ].map((c) => {
              const Icon = c.icon;
              const clickable = c.filter !== null;
              const on = clickable && statusFilter === c.filter && c.filter !== "all";
              return (
                <button
                  key={c.label}
                  type="button"
                  disabled={!clickable}
                  onClick={() => {
                    if (c.filter) {
                      setStatusFilter(on ? "all" : c.filter);
                      setMatrixPage(1);
                    }
                  }}
                  className={`group flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition duration-150 ${c.tile} ${clickable ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-sm" : "cursor-default"} ${on ? "ring-2 ring-slate-400" : ""}`}
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition group-hover:scale-105 ${c.bubble}`}>
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[1.125rem] leading-none text-slate-800 [font-weight:500]">{c.value === null ? "—" : c.value.toLocaleString()}</span>
                    <span className="mt-1 block text-[0.75rem] leading-tight text-slate-700">{c.label}</span>
                    <span className="block truncate text-[0.6875rem] text-slate-500">{c.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {(siteData?.skippedRoutes?.length ?? 0) > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-[0.75rem] text-amber-900">
              <span>
                {siteData?.skippedRoutes?.length} page{siteData?.skippedRoutes?.length === 1 ? "" : "s"} could not be read this time, so they are not counted above ({siteData?.skippedRoutes?.slice(0, 3).join(", ")}
                {(siteData?.skippedRoutes?.length ?? 0) > 3 ? ", …" : ""}).
              </span>
              <button type="button" onClick={fetchSiteMatrix} className="cursor-pointer rounded-md border border-amber-300 bg-white px-2 py-0.5 text-[0.6875rem] text-amber-900 hover:bg-amber-100">
                Try again
              </button>
            </div>
          )}

          {/* Search, filter, sort */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-2.5 py-2">
            <div className="relative min-w-[220px] max-w-sm flex-1">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search a page or title"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setMatrixPage(1);
                }}
                className="h-7 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-2 text-[0.75rem] text-slate-800 outline-none focus:border-violet-400"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 text-[0.6875rem]">
                {([
                  { id: "all", label: "All", on: "bg-slate-800 text-white border-slate-800" },
                  { id: "missing_alt", label: "Needs attention", on: "bg-amber-500 text-white border-amber-500" },
                  { id: "clean", label: "All good", on: "bg-emerald-600 text-white border-emerald-600" },
                ] as const).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    aria-pressed={statusFilter === f.id}
                    onClick={() => {
                      setStatusFilter(f.id);
                      setMatrixPage(1);
                    }}
                    className={`cursor-pointer rounded-full border px-2.5 py-0.5 transition ${statusFilter === f.id ? f.on : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as typeof sortBy);
                  setMatrixPage(1);
                }}
                aria-label="Sort pages"
                className="h-7 cursor-pointer rounded-lg border border-slate-200 bg-white px-2 text-[0.75rem] text-slate-700"
              >
                <option value="order">Sort: site order</option>
                <option value="alt">Sort: most picture problems</option>
                <option value="originality">Sort: lowest originality</option>
                <option value="words">Sort: most words</option>
              </select>
              <button
                type="button"
                onClick={() => void checkAiOfAllPages()}
                disabled={aiBulk !== null || !siteData?.pages?.length}
                className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-2.5 text-[0.75rem] text-violet-700 transition hover:bg-violet-100 disabled:opacity-60"
                title="Check the pictures of every page for AI, one page after the other"
              >
                {aiBulk ? <Loader2 className="h-3 w-3 animate-spin" /> : <Bot className="h-3 w-3" />}
                {aiBulk ? `Checking ${aiBulk.done + 1}/${aiBulk.total}…` : "Check AI on all pages"}
              </button>
              <button
                type="button"
                onClick={fetchSiteMatrix}
                disabled={siteScanLoading}
                className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[0.75rem] text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw className={`h-3 w-3 text-violet-600 ${siteScanLoading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* The pages */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white [scrollbar-width:thin]">
            {siteScanLoading && !siteData ? (
              <div className="flex flex-col items-center justify-center p-10 text-center">
                <Spinner />
                <p className="mt-3 animate-pulse text-[0.75rem] text-slate-600">Reading the live pages of your website…</p>
              </div>
            ) : filteredPages.length === 0 ? (
              <div className="p-8 text-center text-[0.8125rem] text-slate-500">No page matches this filter or search.</div>
            ) : (
              <table className="w-full min-w-[820px] text-left text-[0.75rem] text-slate-600">
                <thead className="border-b border-slate-200 bg-slate-50 text-[0.6875rem] uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2 font-normal">Page</th>
                    <th className="px-3 py-2 text-center font-normal">Words</th>
                    <th className="px-3 py-2 text-center font-normal">Original</th>
                    <th className="px-3 py-2 font-normal">Pictures (Alt & AI)</th>
                    <th className="px-3 py-2 font-normal">Text quality</th>
                    <th className="px-3 py-2 text-right font-normal">Open</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {matrixVisible.map((page) => {
                    const isHighAi = page.aiScore >= 40 || page.isAiDetected;
                    const orig = page.originalityScore;
                    return (
                      <tr key={page.route} className="transition hover:bg-violet-50/40">
                        <td className="px-3 py-2">
                          <div className="font-mono text-[0.75rem] text-indigo-700">{page.route}</div>
                          <div className="mt-px max-w-[300px] truncate text-[0.6875rem] text-slate-500" title={page.title || page.route}>
                            {(page.title || page.route).replace(/\s*[|–—-]\s*Moksha Voyage\s*$/i, "")}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-center tabular-nums text-slate-700">{page.wordCount.toLocaleString()}</td>
                        <td className="px-3 py-2 text-center">
                          <span className={`rounded-full px-2 py-0.5 text-[0.6875rem] ${orig >= 80 ? "bg-emerald-50 text-emerald-700" : orig >= 50 ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"}`}>{orig}%</span>
                        </td>
                        <td className="px-3 py-2">
                          <span className="inline-flex flex-wrap items-center gap-1.5">
                            <span className="font-mono text-slate-700">{page.imagesCount} pictures</span>
                            {page.missingAltCount > 0 ? (
                              <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-px text-[0.6875rem] text-amber-800" title="Counted on the live page">
                                {page.missingAltCount} without alt
                              </span>
                            ) : (
                              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-px text-[0.6875rem] text-emerald-700" title="Counted on the live page">
                                alt ok
                              </span>
                            )}
                            {(page.genericAltCount ?? 0) > 0 && (
                              <span className="rounded-full border border-amber-200 bg-white px-2 py-px text-[0.6875rem] text-amber-700">{page.genericAltCount} vague</span>
                            )}
                            {(page.savedAltWaiting ?? 0) > 0 && (
                              <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-px text-[0.6875rem] text-sky-700" title="Saved in the admin; the live page shows it after the next website build">
                                {page.savedAltWaiting} saved, waiting for website
                              </span>
                            )}
                            {(page.aiCheckedCount ?? 0) === 0 ? (
                              <span className="rounded-full border border-slate-200 bg-slate-50 px-1.5 py-px text-[0.6875rem] text-slate-500">AI: not checked</span>
                            ) : page.aiSuspectCount > 0 ? (
                              <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-px text-[0.6875rem] text-rose-700" title="Proof in the file, or an AI estimate of 70% or more">
                                AI: {page.aiSuspectCount} of {page.aiCheckedCount} checked
                              </span>
                            ) : (
                              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-px text-[0.6875rem] text-emerald-700">AI: 0 of {page.aiCheckedCount} checked</span>
                            )}
                            <button
                              type="button"
                              disabled={Boolean(aiRunning[page.route]) || aiBulk !== null}
                              onClick={() => void checkAiOfPage(page.route)}
                              className="inline-flex h-5 cursor-pointer items-center gap-1 rounded-md border border-violet-200 bg-white px-1.5 text-[0.6875rem] text-violet-700 transition hover:bg-violet-50 disabled:opacity-60"
                              title="Open each picture once and check it for AI (proof in the file, plus an AI estimate)"
                            >
                              {aiRunning[page.route] ? <Loader2 className="h-3 w-3 animate-spin" /> : <Bot className="h-3 w-3" />}
                              {aiRunning[page.route] ? "Checking…" : (page.aiCheckedCount ?? 0) > 0 ? "Check more" : "Check AI"}
                            </button>
                          </span>
                          {aiNote[page.route] && <div className="mt-0.5 text-[0.6875rem] text-slate-500">{aiNote[page.route]}</div>}
                        </td>
                        <td className="px-3 py-2">
                          <span className={`rounded-full px-2 py-0.5 text-[0.6875rem] ${isHighAi ? "bg-amber-50 text-amber-800" : "bg-slate-100 text-slate-600"}`}>
                            {page.verdict || (isHighAi ? "Needs rewording" : "Reads naturally")}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleInspectRoute(page.route)}
                            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1 text-[0.75rem] text-violet-700 transition hover:bg-violet-100"
                          >
                            <Eye className="h-3.5 w-3.5 shrink-0" />
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {filteredPages.length > 0 && (
            <PaginationBar
              page={matrixCurrent}
              pageSize={matrixPageSize}
              total={filteredPages.length}
              noun="pages"
              onPage={setMatrixPage}
              onPageSize={(n) => {
                setMatrixPageSize(n);
                setMatrixPage(1);
              }}
            />
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 2: Deep Route & Image Inspector
          ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "deep" && (
        <div className="p-6 space-y-6">
          {/* Route Selector & Auto-Scan Bar */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
                Inspect Specific Route:
              </label>
              <select
                value={selectedRoute}
                onChange={(e) => {
                  setSelectedRoute(e.target.value);
                  handleLiveScan(e.target.value);
                }}
                className="h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-800 outline-none focus:border-indigo-600"
              >
                {(siteData?.pages || []).map((p, idx) => (
                  <option key={idx} value={p.route}>
                    {p.route} ({p.title.slice(0, 35)}...)
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              disabled={scanningLive}
              onClick={() => handleLiveScan(selectedRoute)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-black shadow-md shadow-indigo-900/20 transition cursor-pointer disabled:opacity-50"
            >
              {scanningLive ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-white" />
                  <span>Crawling Live DOM for {selectedRoute}...</span>
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4 text-cyan-300" />
                  <span>Live Page Auto-Scan ({selectedRoute})</span>
                </>
              )}
            </button>
          </div>

          {errorBanner && (
            <div className="p-3 mb-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
              <span>{errorBanner}</span>
              <button type="button" onClick={() => setErrorBanner(null)} className="text-rose-600 hover:text-rose-900 font-bold ml-2">✕</button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Form & Content Textarea */}
            {/* Left column: the page's real text from the website, humanized in the same format and applied to the website */}
            <div className="lg:col-span-6">
              <PageTextBlocks route={selectedRoute || "/"} />
            </div>

            {/* Right Column: AI Analysis & EEAT Assessment */}
            <div className="lg:col-span-6 flex flex-col justify-center space-y-4">
              {!result && !loading && !scanningLive && (
                <div className="h-full border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center text-slate-400 min-h-[300px]">
                  <Bot className="h-10 w-10 text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-600">No Content Scanned Yet</p>
                  <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                    Click <strong>[Live Page Auto-Scan]</strong> above to crawl live page text, inspect AI match % and EEAT compliance reasons.
                  </p>
                </div>
              )}

              {(loading || scanningLive) && (
                <div className="h-full border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-50 min-h-[300px]">
                  <Spinner />
                  <p className="text-xs font-bold text-slate-700 mt-3 animate-pulse">
                    {scanningLive
                      ? `Crawling live DOM facts for ${selectedRoute} & querying AI model...`
                      : "Analyzing NLP perplexity, burstiness & EEAT bereavement criteria..."}
                  </p>
                </div>
              )}

              {/* Regular Scan Results */}
              {result && !loading && !scanningLive && (
                <div className="space-y-4">
                  {/* Score Badges */}
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      className={`p-4 rounded-xl border ${result.isAiDetected
                        ? "bg-rose-50 border-rose-200 text-rose-900"
                        : "bg-emerald-50 border-emerald-200 text-emerald-900"
                        }`}
                    >
                      <div className="text-[10px] uppercase font-black tracking-wider">AI Detected Likelihood</div>
                      <div className="text-3xl font-black mt-1">{result.aiScore}%</div>
                      <div className="text-[11px] font-semibold mt-0.5 flex items-center gap-1">
                        {result.isAiDetected ? (
                          <>
                            <AlertTriangle className="h-3.5 w-3.5 text-rose-600" /> High AI / Template Risk
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Human Authentic Tone
                          </>
                        )}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border bg-slate-50 border-slate-200 text-slate-900">
                      <div className="text-[10px] uppercase font-black tracking-wider text-slate-500">
                        Originality Score
                      </div>
                      <div className="text-3xl font-black mt-1 text-indigo-700">{result.originalityScore}%</div>
                      <div className="text-[11px] font-semibold text-slate-600 mt-0.5">
                        {result.verdict}
                      </div>
                    </div>
                  </div>

                  {/* EEAT Reasons Why Humanization is Needed */}
                  {result.eeatReasons && result.eeatReasons.length > 0 && (
                    <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-200">
                      <div className="text-xs font-black text-indigo-900 mb-1.5 flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-indigo-700" /> Why Humanization is Crucial (Google EEAT):
                      </div>
                      <ul className="space-y-1.5 text-xs text-indigo-950">
                        {result.eeatReasons.map((reason, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-indigo-600 font-bold shrink-0">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Flagged Robotic Phrases */}
                  {result.flaggedPhrases && result.flaggedPhrases.length > 0 && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                      <div className="text-xs font-black text-amber-900 mb-1 flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-700" /> Flagged Robotic Phrases:
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {result.flaggedPhrases.map((phrase, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[11px] bg-amber-100 text-amber-900 border border-amber-300 font-medium"
                          >
                            &quot;{phrase}&quot;
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────────────────────
              Deep Image Authenticity Gallery for the Selected Route
              ───────────────────────────────────────────────────────────────────────────── */}
          {result && currentImages.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-200 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-indigo-600" />
                    Deep Image Authenticity & Replacement Inspector ({currentImages.length} Images Audited on {selectedRoute})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Google EEAT penalizes unverified stock/AI images in YMYL bereavement services. Below is the full breakdown of images, alt quality, and recommended authentic replacements.
                  </p>
                </div>

                {/* Image Filters */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-bold text-slate-600">
                  <button
                    type="button"
                    onClick={() => setImageCategoryFilter("all")}
                    className={`px-2.5 py-1 rounded transition cursor-pointer ${imageCategoryFilter === "all" ? "bg-white text-slate-900 shadow-2xs font-black" : ""
                      }`}
                  >
                    All ({currentImages.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageCategoryFilter("ai_suspect")}
                    className={`px-2.5 py-1 rounded transition cursor-pointer ${imageCategoryFilter === "ai_suspect" ? "bg-rose-100 text-rose-900 font-black" : ""
                      }`}
                  >
                    🚨 AI / Stock Suspect ({currentImages.filter((i) => i.isAiSuspect || i.status === "ai_suspect").length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageCategoryFilter("missing_alt")}
                    className={`px-2.5 py-1 rounded transition cursor-pointer ${imageCategoryFilter === "missing_alt" ? "bg-amber-100 text-amber-900 font-black" : ""
                      }`}
                  >
                    ⚠ Missing Alt ({currentImages.filter((i) => !i.hasAlt || i.status === "missing_alt").length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageCategoryFilter("generic_alt")}
                    className={`px-2.5 py-1 rounded transition cursor-pointer ${imageCategoryFilter === "generic_alt" ? "bg-yellow-100 text-yellow-900 font-black" : ""
                      }`}
                  >
                    ⚠️ Generic Alt ({currentImages.filter((i) => i.status === "generic_alt").length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageCategoryFilter("ok")}
                    className={`px-2.5 py-1 rounded transition cursor-pointer ${imageCategoryFilter === "ok" ? "bg-emerald-100 text-emerald-900 font-black" : ""
                      }`}
                  >
                    ✓ Compliant ({currentImages.filter((i) => i.status === "ok").length})
                  </button>
                </div>
              </div>

              {/* Image Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredImages.map((img, idx) => {
                  const isAi = img.isAiSuspect || img.status === "ai_suspect";
                  const isMissingAlt = !img.hasAlt || img.status === "missing_alt";
                  const isGeneric = img.status === "generic_alt";
                  const isCompliant = img.status === "ok";

                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-3 transition ${isAi
                        ? "bg-rose-50/40 border-rose-300"
                        : isMissingAlt
                          ? "bg-amber-50/40 border-amber-300"
                          : isGeneric
                            ? "bg-yellow-50/40 border-yellow-300"
                            : "bg-emerald-50/30 border-emerald-200"
                        }`}
                    >
                      <div>
                        {/* Image Preview & Badge */}
                        <div className="relative w-full h-36 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.src}
                            alt={img.alt || "audited image"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback placeholder if relative Next.js static asset can't load in admin iframe
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                          <div className="absolute top-2 right-2">
                            {isAi && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-600 text-white shadow-xs">
                                🚨 AI / Stock Suspect
                              </span>
                            )}
                            {isMissingAlt && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-600 text-white shadow-xs">
                                ⚠ Missing Alt
                              </span>
                            )}
                            {isGeneric && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-yellow-600 text-white shadow-xs">
                                ⚠️ Generic Alt
                              </span>
                            )}
                            {isCompliant && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-600 text-white shadow-xs">
                                ✓ EEAT Compliant
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Image Path */}
                        <div className="mt-2 text-[10px] font-mono text-slate-500 truncate" title={img.src}>
                          {img.src}
                        </div>

                        {/* Alt Attribute */}
                        <div className="mt-1 text-xs">
                          <span className="font-bold text-slate-700">Alt Tag: </span>
                          {img.hasAlt ? (
                            <span className="font-medium text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              &quot;{img.alt}&quot;
                            </span>
                          ) : (
                            <span className="font-bold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded">
                              (Empty - No Alt Attribute)
                            </span>
                          )}
                        </div>

                        {/* Why Flagged / Reason */}
                        <div className="mt-2.5 p-2 rounded-lg bg-white/80 border border-slate-200/80 text-[11px] leading-relaxed">
                          <strong className="text-slate-800 block mb-0.5">Why Flagged / Humanize Reason:</strong>
                          <span className="text-slate-600">{img.reason || "Audited for search engine compliance."}</span>
                        </div>

                        {/* Recommendation */}
                        <div className="mt-2 p-2 rounded-lg bg-indigo-50/70 border border-indigo-200/70 text-[11px] leading-relaxed">
                          <strong className="text-indigo-900 block mb-0.5">Recommended Action / Replacement:</strong>
                          <span className="text-indigo-950 font-medium">{img.recommendation || "Ensure authentic representation."}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
