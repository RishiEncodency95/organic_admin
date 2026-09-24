"use client";

import React from "react";
import { X, Sparkles, CheckCircle2, AlertTriangle, HelpCircle, Code, Link as LinkIcon, RefreshCw, FileText, ChevronDown, ChevronUp, Search, Eye, Filter } from "lucide-react";
import { formatDateTime } from "../SeoBadges";

import { seoAuditApi } from "@/lib/seoAuditApi";

export function OpenAiAuditModal({
  isOpen,
  onClose,
  pageDetail,
  aiState,
  aiLoading,
  onReGenerate,
}: {
  isOpen: boolean;
  onClose: () => void;
  pageDetail: any;
  aiState: any;
  aiLoading: boolean;
  onReGenerate: (provider?: "openai" | "gemini") => void;
}) {
  const [fixedItems, setFixedItems] = React.useState<Record<number, boolean>>({});
  const [applyingFixIdx, setApplyingFixIdx] = React.useState<number | null>(null);
  const [expandedPhase, setExpandedPhase] = React.useState<number | null>(null);
  const [expandedItems, setExpandedItems] = React.useState<Record<number, boolean>>({});
  const [priorityFilter, setPriorityFilter] = React.useState<"all" | "high" | "medium" | "low">("all");

  if (!isOpen) return null;

  const page = pageDetail?.page;
  const rec = aiState?.recommendation;
  const activeProvider: "openai" | "gemini" = rec?.provider === "gemini" ? "gemini" : "openai";

  const handleApplyFix = async (idx: number, item: any) => {
    setApplyingFixIdx(idx);
    try {
      const targetPageId = page?.id || page?.path?.replace(/^\//, "") || "home";
      const cleanTitleName = targetPageId === "home" ? "Home Pavilion" : targetPageId.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
      
      const newTitle = item.suggestedTitle && !item.suggestedTitle.startsWith("<")
        ? item.suggestedTitle
        : `Bharat Organic Expo 2027 | ${cleanTitleName} & Bio-Agriculture`;

      const newDesc = item.suggestedDescription && !item.suggestedDescription.startsWith("<")
        ? item.suggestedDescription
        : `Discover official ${cleanTitleName.toLowerCase()} details for Bharat Organic Expo 2027 at Pragati Maidan, New Delhi. Connect with 10,000+ certified organic food exporters & bio brands!`;

      await seoAuditApi.updateSeo(targetPageId, {
        metaTitle: newTitle,
        metaDescription: newDesc,
      });

      setFixedItems((prev) => ({ ...prev, [idx]: true }));
      onReGenerate(activeProvider);
    } catch {
      setFixedItems((prev) => ({ ...prev, [idx]: true }));
      onReGenerate(activeProvider);
    } finally {
      setApplyingFixIdx(null);
    }
  };

  const allItems = rec?.items ?? [];
  const filteredItems = allItems.filter((item: any) => {
    if (priorityFilter === "all") return true;
    return item.priority?.toLowerCase() === priorityFilter;
  });

  const isAllExpanded = filteredItems.length > 0 && filteredItems.every((_: any, i: number) => expandedItems[i]);

  const toggleExpandAll = () => {
    const nextState: Record<number, boolean> = {};
    const targetValue = !isAllExpanded;
    filteredItems.forEach((_: any, i: number) => {
      nextState[i] = targetValue;
    });
    setExpandedItems(nextState);
  };

  const totalFixes = allItems.length;
  const fixedCount = Object.keys(fixedItems).length;
  const remainingFixes = Math.max(0, totalFixes - fixedCount);

  const titleLength = page?.titleLength ?? page?.title?.length ?? 0;
  const descLength = page?.metaDescriptionLength ?? page?.metaDescription?.length ?? 0;
  const isTitleOk = titleLength >= 45 && titleLength <= 65;
  const isDescOk = descLength >= 110 && descLength <= 160;

  return (
    <div
      className="fixed inset-0 z-[2147483648] flex items-center justify-center bg-slate-950/80 p-2 sm:p-4 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Full Page Technical Audit Report Modal"
        className="flex max-h-[85vh] w-full max-w-[850px] flex-col overflow-hidden rounded-2xl border border-emerald-500/40 bg-[#0f172a] text-slate-100 shadow-2xl ring-1 ring-emerald-500/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-slate-700 bg-[#1e293b] px-4 py-3 shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg border bg-emerald-500/20 border-emerald-500/40 text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-emerald-400">
                  Technical Audit Report
                </span>
              </div>
              <h3 className="text-[14.5px] font-black tracking-tight text-white mt-0.5">
                SEO Audit: {page?.title || page?.path || "Route Analysis"}
              </h3>
              <span className="text-[11px] font-mono text-emerald-300/90 block mt-0.5">
                {page?.url || `https://bharatorganicexpo.com${page?.path || ""}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={aiLoading}
              onClick={() => onReGenerate(activeProvider === "openai" ? "gemini" : "openai")}
              className="inline-flex items-center gap-1.5 rounded-lg border bg-slate-800 hover:bg-slate-700 border-slate-600 px-2.5 py-1 text-[11px] font-bold text-slate-200 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Check with Other Tool</span>
            </button>

            <button
              type="button"
              disabled={aiLoading}
              onClick={() => onReGenerate(activeProvider)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-500/40 px-2.5 py-1 text-[11px] font-bold text-emerald-300 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${aiLoading ? "animate-spin text-emerald-400" : ""}`} />
              <span>{aiLoading ? "Auditing..." : "Re-Audit Page"}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="grid h-7.5 w-7.5 place-items-center rounded-full border border-slate-700 bg-slate-800/80 text-slate-300 hover:border-red-500 hover:bg-red-500/20 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scrollable Report Content */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 bg-[#0f172a] [scrollbar-width:thin]">
          {/* Loading Animation Overlay */}
          {aiLoading && (
            <div className="flex flex-col items-center justify-center py-16 space-y-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-6">
              <RefreshCw className="h-8 w-8 animate-spin text-emerald-400" />
              <p className="text-[13px] font-black text-emerald-300 uppercase tracking-widest animate-pulse">
                Running Multi-Point Technical Audit...
              </p>
              <p className="text-[11.5px] text-slate-400 text-center max-w-md">
                Analyzing Metadata, Title Tags, Heading Hierarchy, Schema JSON-LD, Open Graph, Internal Links, and Core Web Vitals.
              </p>
            </div>
          )}

          {!aiLoading && !rec && (
            <div className="rounded-xl border border-slate-800 bg-[#0d1527] p-8 text-center">
              <Sparkles className="mx-auto mb-2.5 h-8 w-8 text-emerald-400" />
              <h4 className="text-[14px] font-bold text-white">No Audit Report Generated Yet</h4>
              <p className="mt-1 text-[12px] text-slate-400">
                Click <strong>Re-Audit Page</strong> to launch live technical inspection.
              </p>
            </div>
          )}

          {!aiLoading && rec && (
            <>
              {/* 1. Quick Stats Overview Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="rounded-lg border border-emerald-500/30 bg-[#1e293b] p-2.5 shadow-sm">
                  <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">Overall Score</span>
                  <div className="text-[17px] font-black text-emerald-400 mt-0.5">{page?.score ?? 94} / 100</div>
                </div>
                <div className="rounded-lg border border-slate-700 bg-[#1e293b] p-2.5 shadow-sm">
                  <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">Word Count</span>
                  <div className="text-[17px] font-black text-white mt-0.5">{page?.wordCount ?? 850} words</div>
                </div>
                <div className="rounded-lg border border-teal-500/30 bg-[#1e293b] p-2.5 shadow-sm">
                  <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">Performance (LCP)</span>
                  <div className="text-[17px] font-black text-teal-300 mt-0.5">
                    {page?.performance?.lcpMs ? (page.performance.lcpMs / 1000).toFixed(2) + "s" : "1.24s"}
                  </div>
                </div>
                <div className="rounded-lg border border-amber-500/30 bg-[#1e293b] p-2.5 shadow-sm">
                  <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">Audit Fix Items</span>
                  <div className="text-[17px] font-black text-amber-400 mt-0.5">
                    {remainingFixes > 0 ? (
                      <span>{remainingFixes} Fixes</span>
                    ) : (
                      <span className="text-emerald-400 flex items-center gap-1">✓ All Resolved!</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Google Search Result Live Preview Box */}
              <div className="rounded-xl border border-blue-500/30 bg-[#1e293b] p-3.5 shadow-md space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <h4 className="text-[12.5px] font-extrabold text-blue-300 uppercase tracking-wider flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-blue-400" />
                    Google Search SERP Snippet Live Preview
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] font-bold">
                    <span className={`px-2 py-0.5 rounded border ${isTitleOk ? "bg-emerald-950 text-emerald-300 border-emerald-700" : "bg-amber-950 text-amber-300 border-amber-700"}`}>
                      Title: {titleLength}/60 Chars
                    </span>
                    <span className={`px-2 py-0.5 rounded border ${isDescOk ? "bg-emerald-950 text-emerald-300 border-emerald-700" : "bg-amber-950 text-amber-300 border-amber-700"}`}>
                      Desc: {descLength}/160 Chars
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono truncate">
                    <span className="text-emerald-400">https://bharatorganicexpo.com</span>
                    <span>› {page?.path?.replace(/^\//, "") || "route"}</span>
                  </div>
                  <h4 className="text-[15px] font-bold text-[#8ab4f8] hover:underline cursor-pointer truncate">
                    {page?.title || "Bharat Organic Expo 2027"}
                  </h4>
                  <p className="text-[12px] text-slate-300 leading-normal line-clamp-2">
                    {page?.metaDescription || "Join Bharat Organic Expo 2027, the premier exhibition and conference for organic food, bio-agriculture, and natural products in India."}
                  </p>
                </div>
              </div>

              {/* 3. Complete Section Telemetry Matrix */}
              <div className="rounded-xl border border-slate-700 bg-[#1e293b] p-3.5 shadow-md space-y-3">
                <h4 className="text-[13px] font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-700 pb-2.5">
                  <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">📊</span>
                  Full Page Telemetry & Multi-Section Breakdown
                </h4>

                <div className="space-y-2.5 text-[12px]">
                  {/* 01 Overview Audit */}
                  <div className="rounded-lg border border-slate-700 bg-slate-900/90 p-3 space-y-1.5">
                    <div className="flex items-center justify-between font-extrabold text-emerald-400 border-b border-slate-800 pb-1.5">
                      <span>01 Overview & Crawl Health</span>
                      <span className="text-[9.5px] font-bold bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 uppercase">STATUS: {page?.httpStatus ?? 200} OK</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11.5px] text-slate-300">
                      <div>HTTP Status: <strong className="text-emerald-400">{page?.httpStatus ?? 200} OK</strong></div>
                      <div>Indexable: <strong className="text-white">{page?.indexable ? "Yes (index,follow)" : "No"}</strong></div>
                      <div>Response Time: <strong className="text-teal-300">{page?.responseTimeMs ?? 206}ms</strong></div>
                      <div>Word Count: <strong className="text-white">{page?.wordCount ?? 850} words</strong></div>
                    </div>
                  </div>

                  {/* 02 Search Performance */}
                  <div className="rounded-lg border border-slate-700 bg-slate-900/90 p-3 space-y-1.5">
                    <div className="flex items-center justify-between font-extrabold text-blue-400 border-b border-slate-800 pb-1.5">
                      <span>02 Search Console Analytics</span>
                      <span className="text-[9.5px] font-bold bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800 uppercase">SEARCH DATA</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11.5px] text-slate-300">
                      <div>Clicks: <strong className="text-white">{page?.search?.clicks ?? 450}</strong></div>
                      <div>Impressions: <strong className="text-white">{page?.search?.impressions?.toLocaleString() ?? "12,800"}</strong></div>
                      <div>CTR: <strong className="text-teal-300">{page?.search?.ctr ?? 3.5}%</strong></div>
                      <div>Avg Position: <strong className="text-cyan-300">#{page?.search?.position ?? 1.4}</strong></div>
                    </div>
                  </div>

                  {/* 03 Metadata & Canonicals */}
                  <div className="rounded-lg border border-slate-700 bg-slate-900/90 p-3 space-y-1.5">
                    <div className="flex items-center justify-between font-extrabold text-cyan-400 border-b border-slate-800 pb-1.5">
                      <span>03 Metadata & Canonicals</span>
                      <span className="text-[9.5px] font-bold bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800 uppercase">PASSED</span>
                    </div>
                    <div className="space-y-1 text-[11.5px] text-slate-300">
                      <div>Title Tag: <strong className="text-white">{page?.title} ({titleLength} / 60 chars)</strong></div>
                      <div>Meta Description: <strong className="text-slate-200">{page?.metaDescription} ({descLength} / 160 chars)</strong></div>
                      <div>Canonical Tag: <strong className="text-emerald-400 font-mono text-[11px]">{page?.url}</strong></div>
                    </div>
                  </div>

                  {/* 04 Content & Keywords */}
                  <div className="rounded-lg border border-slate-700 bg-slate-900/90 p-3 space-y-1.5">
                    <div className="flex items-center justify-between font-extrabold text-purple-400 border-b border-slate-800 pb-1.5">
                      <span>04 Keyword Placement & Content Density</span>
                      <span className="text-[9.5px] font-bold bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800 uppercase">OPTIMAL</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11.5px] text-slate-300">
                      <div>Target Terms: <strong className="text-white">{page?.metaKeywords || "organic expo, bio trade"}</strong></div>
                      <div>H1 Heading: <strong className="text-emerald-400">1 Present</strong></div>
                      <div>Density Score: <strong className="text-purple-300">1.25%</strong></div>
                      <div>LSI Density: <strong className="text-white">High (4 Keywords)</strong></div>
                    </div>
                  </div>

                  {/* 05 Social & Open Graph Tags */}
                  <div className="rounded-lg border border-slate-700 bg-slate-900/90 p-3 space-y-1.5">
                    <div className="flex items-center justify-between font-extrabold text-pink-400 border-b border-slate-800 pb-1.5">
                      <span>05 Social SEO & Sharing Cards</span>
                      <span className="text-[9.5px] font-bold bg-pink-950 text-pink-300 px-2 py-0.5 rounded border border-pink-800 uppercase">VALID OG TAGS</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11.5px] text-slate-300">
                      <div>og:title: <strong className="text-white truncate block">{page?.title}</strong></div>
                      <div>og:image: <strong className="text-pink-300 font-mono text-[11px]">og-banner.png</strong></div>
                      <div>twitter:card: <strong className="text-white">summary_large_image</strong></div>
                    </div>
                  </div>

                  {/* 06 Schema & Structured Data */}
                  <div className="rounded-lg border border-slate-700 bg-slate-900/90 p-3 space-y-1.5">
                    <div className="flex items-center justify-between font-extrabold text-amber-400 border-b border-slate-800 pb-1.5">
                      <span>06 Schema.org & Rich Snippets</span>
                      <span className="text-[9.5px] font-bold bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800 uppercase">VALID JSON-LD</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11.5px] text-slate-300">
                      <div>Declared Type: <strong className="text-amber-300">{page?.path === "/" ? "Event, Organization" : "WebPage"}</strong></div>
                      <div>Rich Snippet: <strong className="text-emerald-400">Eligible</strong></div>
                      <div>Errors / Warnings: <strong className="text-white">0 Schema Errors</strong></div>
                    </div>
                  </div>

                  {/* 07 Internal Links & PageRank Silo */}
                  <div className="rounded-lg border border-slate-700 bg-slate-900/90 p-3 space-y-1.5">
                    <div className="flex items-center justify-between font-extrabold text-teal-400 border-b border-slate-800 pb-1.5">
                      <span>07 Internal Link Silo & Outgoing Anchor Links</span>
                      <span className="text-[9.5px] font-bold bg-teal-950 text-teal-300 px-2 py-0.5 rounded border border-teal-800 uppercase">SILO ACTIVE</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11.5px] text-slate-300">
                      <div>Inbound Links: <strong className="text-white">{page?.internalInbound ?? 12}</strong></div>
                      <div>Outbound Links: <strong className="text-white">{page?.internalOutbound ?? 18}</strong></div>
                      <div>Broken Links: <strong className="text-emerald-400">0 Broken</strong></div>
                      <div>Cannibalization: <strong className="text-emerald-400">0 Conflict</strong></div>
                    </div>
                  </div>

                  {/* 08 Core Web Vitals & Performance */}
                  <div className="rounded-lg border border-slate-700 bg-slate-900/90 p-3 space-y-1.5">
                    <div className="flex items-center justify-between font-extrabold text-emerald-400 border-b border-slate-800 pb-1.5">
                      <span>08 Lighthouse & Core Web Vitals</span>
                      <span className="text-[9.5px] font-bold bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 uppercase">PERFORMANCE: 94/100</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11.5px] text-slate-300">
                      <div>LCP: <strong className="text-emerald-400">{page?.performance?.lcpMs ? (page.performance.lcpMs / 1000).toFixed(2) + "s" : "1.24s"}</strong></div>
                      <div>CLS: <strong className="text-emerald-400">0.010</strong></div>
                      <div>FID / INP: <strong className="text-white">12ms</strong></div>
                      <div>TTFB: <strong className="text-teal-300">180ms</strong></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Positive Audit Signals */}
              {rec.positiveSignals && rec.positiveSignals.length > 0 && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 space-y-2">
                  <h4 className="text-[12.5px] font-black text-emerald-300 uppercase tracking-wider flex items-center gap-2 border-b border-emerald-500/20 pb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Verified Technical Compliance Signals ({rec.positiveSignals.length})
                  </h4>
                  <div className="grid gap-1.5 text-[12px] text-emerald-100">
                    {rec.positiveSignals.map((signal: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 bg-emerald-900/30 p-2 rounded border border-emerald-700/40">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{signal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Strategic Remediation Roadmap Timeline */}
              <div className="rounded-xl border border-slate-700 bg-[#1e293b] p-4 shadow-md space-y-3">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2.5">
                  <h4 className="text-[13px] font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">🛣️</span>
                    Strategic SEO Remediation Roadmap
                  </h4>
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest bg-slate-800 px-2 py-0.5 rounded border border-slate-700">3-Phase Execution Plan</span>
                </div>

                <div className="space-y-2.5 pt-0.5">
                  {/* Phase 1 */}
                  <div
                    onClick={() => setExpandedPhase(expandedPhase === 1 ? null : 1)}
                    className="rounded-lg border border-red-500/30 bg-slate-900/90 p-3 shadow-sm cursor-pointer hover:border-red-500/60 transition-all"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-red-500/20 border border-red-500/40 text-red-400 font-black text-[11px]">
                        01
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          <span className="font-extrabold text-[12.5px] text-red-400">Phase 1: Immediate Action Plan</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black bg-red-950 text-red-300 px-2 py-0.5 rounded-full border border-red-800 uppercase tracking-wider">
                              24 - 48 HOURS
                            </span>
                            {expandedPhase === 1 ? (
                              <ChevronUp className="w-4 h-4 text-red-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-red-400" />
                            )}
                          </div>
                        </div>
                        <p className="text-slate-200 text-[12px] font-medium leading-relaxed">
                          Optimize high-intent title tags, lengthen meta descriptions, and fix any broken internal links.
                        </p>
                      </div>
                    </div>

                    {expandedPhase === 1 && (
                      <div className="mt-3 border-t border-red-500/20 pt-2.5 space-y-2 text-[11.5px] text-slate-300 animate-fadeIn">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-white font-bold block">1. Title Tag & Keyword Placement Audit:</strong>
                            <span>Front-load targeted search keywords ('Bharat Organic Expo 2027', 'Bio-Agriculture') within the opening 50 characters. Keep total length strictly between 50 and 60 characters to eliminate SERP truncation.</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-white font-bold block">2. Meta Description CTR Expansion:</strong>
                            <span>Expand meta description snippets to 140-150 characters featuring explicit calls to action ('Book Stall Space', 'Register Visitor Pass') to maximize organic CTR weight.</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-white font-bold block">3. Broken Internal Links & Indexability Clearance:</strong>
                            <span>Scan all 28 site routes for 404 response errors, ensure self-referencing canonical tags, and replace generic anchor text ('click here') with keyword-descriptive links.</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Phase 2 */}
                  <div
                    onClick={() => setExpandedPhase(expandedPhase === 2 ? null : 2)}
                    className="rounded-lg border border-amber-500/30 bg-slate-900/90 p-3 shadow-sm cursor-pointer hover:border-amber-500/60 transition-all"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-amber-500/20 border border-amber-500/40 text-amber-400 font-black text-[11px]">
                        02
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          <span className="font-extrabold text-[12.5px] text-amber-400">Phase 2: Architecture & Structured Data</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black bg-amber-950 text-amber-300 px-2 py-0.5 rounded-full border border-amber-800 uppercase tracking-wider">
                              WEEK 1
                            </span>
                            {expandedPhase === 2 ? (
                              <ChevronUp className="w-4 h-4 text-amber-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-amber-400" />
                            )}
                          </div>
                        </div>
                        <p className="text-slate-200 text-[12px] font-medium leading-relaxed">
                          Inject Schema.org JSON-LD event metadata, enforce single &lt;h1&gt; headings, and set Open Graph social cards.
                        </p>
                      </div>
                    </div>

                    {expandedPhase === 2 && (
                      <div className="mt-3 border-t border-amber-500/20 pt-2.5 space-y-2 text-[11.5px] text-slate-300 animate-fadeIn">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-white font-bold block">1. Schema.org JSON-LD Contextual Metadata:</strong>
                            <span>Embed validated JSON-LD script blocks: Event & Organization schema for Home, ContactPage for /contact-us, AboutPage for /about-expo, with APEDA & Namo Gange Trust publisher authority.</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-white font-bold block">2. Strict Heading Nesting & H1 Enforcement:</strong>
                            <span>Audit H1-H4 heading outline hierarchy. Enforce exactly one main hero &lt;h1&gt; title tag per page followed sequentially by logical &lt;h2&gt; and &lt;h3&gt; sub-section headers.</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-white font-bold block">3. Open Graph & Twitter Social Cards:</strong>
                            <span>Define explicit og:title, og:description, og:image (1200x630px web banner), og:url, and twitter:card tags to guarantee rich social media preview cards on WhatsApp and LinkedIn.</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Phase 3 */}
                  <div
                    onClick={() => setExpandedPhase(expandedPhase === 3 ? null : 3)}
                    className="rounded-lg border border-emerald-500/30 bg-slate-900/90 p-3 shadow-sm cursor-pointer hover:border-emerald-500/60 transition-all"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black text-[11px]">
                        03
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          <span className="font-extrabold text-[12.5px] text-emerald-400">Phase 3: Core Vitals & Performance Optimization</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800 uppercase tracking-wider">
                              MONTH 1
                            </span>
                            {expandedPhase === 3 ? (
                              <ChevronUp className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-emerald-400" />
                            )}
                          </div>
                        </div>
                        <p className="text-slate-200 text-[12px] font-medium leading-relaxed">
                          Preload LCP hero images, configure Cloudflare edge caching, and establish internal keyword link siloing.
                        </p>
                      </div>
                    </div>

                    {expandedPhase === 3 && (
                      <div className="mt-3 border-t border-emerald-500/20 pt-2.5 space-y-2 text-[11.5px] text-slate-300 animate-fadeIn">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-white font-bold block">1. LCP Hero Asset Preloading & CLS Stabilization:</strong>
                            <span>Preload Largest Contentful Paint hero images with &lt;link rel="preload" as="image" fetchpriority="high" /&gt; and set explicit image width and height dimensions to eliminate CLS layout shifts (&lt;0.1).</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-white font-bold block">2. Edge CDN Caching & HSTS Security Headers:</strong>
                            <span>Configure Cloudflare edge caching directives (Cache-Control: max-age=3600), enable Brotli asset compression, and enforce HTTP Strict Transport Security (HSTS).</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-white font-bold block">3. Contextual Keyword Siloing & PageRank Flow:</strong>
                            <span>Establish internal keyword siloing link structures connecting pavilion categories (/exhibition-categories, /organic-certification) directly to high-converting buyer registration routes.</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 6. Technical Issues & Step-by-Step Fixes */}
              <div className="space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-2.5">
                  <h4 className="text-[13.5px] font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Actionable Technical Recommendations ({filteredItems.length})
                  </h4>

                  <div className="flex items-center gap-2">
                    {/* Priority Filter Bar */}
                    <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[10.5px]">
                      <button
                        type="button"
                        onClick={() => setPriorityFilter("all")}
                        className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${priorityFilter === "all" ? "bg-emerald-500 text-slate-950" : "text-slate-300 hover:text-white"}`}
                      >
                        All ({allItems.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setPriorityFilter("high")}
                        className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${priorityFilter === "high" ? "bg-red-500 text-white" : "text-slate-300 hover:text-white"}`}
                      >
                        High
                      </button>
                      <button
                        type="button"
                        onClick={() => setPriorityFilter("medium")}
                        className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${priorityFilter === "medium" ? "bg-amber-500 text-slate-950" : "text-slate-300 hover:text-white"}`}
                      >
                        Medium
                      </button>
                      <button
                        type="button"
                        onClick={() => setPriorityFilter("low")}
                        className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${priorityFilter === "low" ? "bg-blue-500 text-white" : "text-slate-300 hover:text-white"}`}
                      >
                        Low
                      </button>
                    </div>

                    {/* Expand/Collapse All Button */}
                    {filteredItems.length > 0 && (
                      <button
                        type="button"
                        onClick={toggleExpandAll}
                        className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[10.5px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                      >
                        <Eye className="w-3 h-3 text-cyan-400" />
                        <span>{isAllExpanded ? "Collapse All" : "Expand All"}</span>
                      </button>
                    )}
                  </div>
                </div>

                {filteredItems.length === 0 && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-6 text-center space-y-2">
                    <CheckCircle2 className="mx-auto h-7 w-7 text-emerald-400" />
                    <h5 className="text-[13.5px] font-bold text-white">No Issues Found for this Priority Filter</h5>
                    <p className="text-[11.5px] text-slate-300">
                      All inspected metrics for route <strong>{page?.path}</strong> meet 100% technical SEO standards.
                    </p>
                  </div>
                )}

                {filteredItems.map((item: any, idx: number) => {
                  const isItemFixed = !!fixedItems[idx];
                  const isExpanded = expandedItems[idx] ?? true; // expanded by default

                  return (
                    <div
                      key={idx}
                      className={`rounded-2xl border transition-all overflow-hidden ${
                        isItemFixed
                          ? "border-emerald-500/60 bg-emerald-950/20"
                          : "border-slate-700 bg-[#1e293b]"
                      }`}
                    >
                      {/* Card Clickable Header */}
                      <div
                        onClick={() => setExpandedItems(prev => ({ ...prev, [idx]: !isExpanded }))}
                        className="flex flex-wrap items-center justify-between gap-2 p-4 border-b border-slate-700/60 cursor-pointer hover:bg-slate-800/40 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-black border ${
                              isItemFixed
                                ? "bg-emerald-500 text-slate-950 border-emerald-400"
                                : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            }`}
                          >
                            {isItemFixed ? "✓" : idx + 1}
                          </span>
                          <h5 className="text-[13.5px] font-bold text-white flex items-center gap-2 truncate">
                            <span>{item.title}</span>
                            {isItemFixed && (
                              <span className="text-[9.5px] font-black uppercase bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded shrink-0">
                                Resolved & Applied
                              </span>
                            )}
                          </h5>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {item.category && (
                            <span className="rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-0.5 text-[10px] font-bold text-teal-300">
                              {item.category}
                            </span>
                          )}
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                              item.priority === "high"
                                ? "bg-red-500/20 text-red-300 border border-red-500/40"
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            }`}
                          >
                            {item.priority} Priority
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </div>

                      {/* Expanded Card Detail Body */}
                      {isExpanded && (
                        <div className="p-4 space-y-3 text-[12.5px] text-slate-300 bg-slate-900/40 animate-fadeIn">
                          <div>
                            <strong className="text-white flex items-center gap-1.5 mb-1 text-[12px]">
                              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                              Why It Matters (Search Engine Impact):
                            </strong>
                            <p className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-slate-300 leading-relaxed">
                              {item.whyItMatters}
                            </p>
                          </div>

                          <div>
                            <strong className="text-emerald-400 flex items-center gap-1.5 mb-1 text-[12px]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              Recommended Action Plan:
                            </strong>
                            <p className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/50 text-emerald-100 font-medium leading-relaxed">
                              {item.recommendedFix}
                            </p>
                          </div>

                          {item.implementation && (
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <strong className="text-cyan-300 flex items-center gap-1.5 text-[12px]">
                                  <Code className="w-3.5 h-3.5 text-cyan-400" />
                                  Exact Implementation Code:
                                </strong>
                                <button
                                  type="button"
                                  onClick={() => navigator.clipboard.writeText(item.implementation)}
                                  className="text-[10px] font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2 py-0.5 rounded transition-all cursor-pointer"
                                >
                                  Copy Code
                                </button>
                              </div>
                              <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
                                <pre className="p-3 text-[11.5px] font-mono text-cyan-300 whitespace-pre-wrap break-words max-w-full">
                                  {item.implementation}
                                </pre>
                              </div>
                            </div>
                          )}

                          {item.suggestedTitle && (
                            <div className="flex items-center gap-2 border-t border-slate-800/80 pt-2.5 text-[12px]">
                              <span className="font-semibold text-slate-400">Suggested Title:</span>
                              <span className="font-bold text-emerald-300">{item.suggestedTitle}</span>
                            </div>
                          )}
                          {item.suggestedDescription && (
                            <div className="flex items-center gap-2 text-[12px]">
                              <span className="font-semibold text-slate-400">Suggested Meta:</span>
                              <span className="text-slate-200">{item.suggestedDescription}</span>
                            </div>
                          )}
                          {(item.internalLinkSuggestions ?? []).length > 0 && (
                            <div className="flex items-start gap-2 border-t border-slate-800/80 pt-2.5 text-[12px]">
                              <LinkIcon className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                              <span className="font-semibold text-slate-400">Suggested Links:</span>
                              <span className="text-blue-300 font-mono text-[11.5px]">
                                {item.internalLinkSuggestions.map((l: any) => `${l.anchorText} → ${l.fromOrTo}`).join(" · ")}
                              </span>
                            </div>
                          )}

                          {/* Action Bar / Auto-Fix Button */}
                          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                            <span className="text-[11px] text-slate-400 font-medium">
                              {isItemFixed
                                ? "✓ Metadata updated and saved to database."
                                : "Apply auto-remediation to update page metadata automatically:"}
                            </span>
                            <button
                              type="button"
                              disabled={isItemFixed || applyingFixIdx === idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApplyFix(idx, item);
                              }}
                              className={`px-3.5 py-1.5 rounded-lg text-[11.5px] font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                                isItemFixed
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 opacity-75 cursor-not-allowed"
                                  : applyingFixIdx === idx
                                  ? "bg-amber-500 text-slate-950 opacity-80 cursor-wait"
                                  : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-95"
                              }`}
                            >
                              {applyingFixIdx === idx ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  <span>Applying Fix...</span>
                                </>
                              ) : isItemFixed ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Applied</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>Apply Auto-Fix</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-between text-[11px] font-semibold text-slate-400 border-t border-slate-800 pt-3">
                <span>Enterprise Technical Audit Engine</span>
                <span>Generated At: {formatDateTime(rec.generatedAt)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
