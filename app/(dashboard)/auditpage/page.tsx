"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileSearch,
  Link2,
  Sparkles,
  KeyRound,
  History,
  Activity,
  Layers,
} from "lucide-react";
import { seoAuditApi, type SeoOverview, type PageSpeedAudit } from "@/lib/seoAuditApi";
import SeoSiteCheckupReport from "@/components/seo/SeoSiteCheckupReport";
import BacklinkManager from "@/components/seo/BacklinkManager";
import AiContentAuditor from "@/components/seo/AiContentAuditor";
import KeywordPlannerTool from "@/components/seo/KeywordPlannerTool";
import SeoActivityLogWidget from "@/components/seo/SeoActivityLogWidget";
import { PAGE_INVENTORY } from "@/lib/seoCheckupData";
import Spinner from "@/components/ui/Spinner";

const ALL_SITE_PAGES = PAGE_INVENTORY.map((page) => ({
  id: page.id,
  label: page.label,
  path: page.path,
}));

export default function SeoAuditedPagesPage() {
  const [activeTab, setActiveTab] = useState<"audit" | "backlinks" | "ai_content" | "keyword_planner" | "activity_log">("audit");
  const [overview, setOverview] = useState<SeoOverview | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<string>("home");
  const [speed, setSpeed] = useState<{ pageId: string; data: PageSpeedAudit | null } | null>(null);
  const [reAuditing, setReAuditing] = useState(false);

  useEffect(() => {
    seoAuditApi.overview().then(setOverview).catch(() => undefined);
  }, []);

  useEffect(() => {
    const pageObj = ALL_SITE_PAGES.find((p) => p.id === selectedPageId) || ALL_SITE_PAGES[0];
    const targetUrl = pageObj.id === "home" ? "https://bharatorganicexpo.com" : `https://bharatorganicexpo.com${pageObj.path}`;

    seoAuditApi
      .pagespeed(targetUrl, "mobile", false)
      .then((data) => setSpeed({ pageId: pageObj.id, data }))
      .catch(() => setSpeed({ pageId: pageObj.id, data: null }));
  }, [selectedPageId]);

  const selectedPageObj = ALL_SITE_PAGES.find((p) => p.id === selectedPageId) || ALL_SITE_PAGES[0];
  const pageSpeed = speed?.pageId === selectedPageObj.id ? speed.data : null;
  const loadingSpeed = speed?.pageId !== selectedPageObj.id || reAuditing;

  return (
    <div className="min-h-screen bg-slate-100 p-4 lg:p-6 space-y-6 text-slate-900">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#23471d] pb-4 bg-white p-4 rounded-xl shadow-xs">
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-emerald-600">
            <FileSearch className="h-4 w-4" /> Bharat Organic SEO Command Intelligence
          </div>
          <h1 className="text-xl font-extrabold text-[#23471d]">
            Deep Page Audit & SEO Matrix Suite
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Complete suite: Page-by-Page Audit, Backlinks Excel Tracker, AI Content Originality Guard, Dual-Mode Keyword Planner, and Audit Trail.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/seo"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition"
          >
            <ArrowLeft className="h-4 w-4 text-emerald-600" /> Command Center
          </Link>
        </div>
      </div>

      {/* Main Suite Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:thin] bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-2 rounded-lg text-xs font-black transition flex items-center gap-2 cursor-pointer ${
            activeTab === "audit"
              ? "bg-[#23471d] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Activity className="h-4 w-4" /> 1. Page SEO Audit
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("backlinks")}
          className={`px-4 py-2 rounded-lg text-xs font-black transition flex items-center gap-2 cursor-pointer ${
            activeTab === "backlinks"
              ? "bg-[#23471d] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Link2 className="h-4 w-4" /> 2. Backlinks & Excel Tracker
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ai_content")}
          className={`px-4 py-2 rounded-lg text-xs font-black transition flex items-center gap-2 cursor-pointer ${
            activeTab === "ai_content"
              ? "bg-[#23471d] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Sparkles className="h-4 w-4" /> 3. AI Content & Copy Guard
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("keyword_planner")}
          className={`px-4 py-2 rounded-lg text-xs font-black transition flex items-center gap-2 cursor-pointer ${
            activeTab === "keyword_planner"
              ? "bg-[#23471d] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <KeyRound className="h-4 w-4" /> 4. Keyword Planner (Google & AI)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("activity_log")}
          className={`px-4 py-2 rounded-lg text-xs font-black transition flex items-center gap-2 cursor-pointer ${
            activeTab === "activity_log"
              ? "bg-[#23471d] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <History className="h-4 w-4" /> 5. SEO Activity Logs
        </button>
      </div>

      {/* Tab 1: Page SEO Audit */}
      {activeTab === "audit" && (
        <div className="space-y-6">
          {/* Page Selection Bar */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-[280px]">
              <span className="text-xs font-extrabold uppercase text-slate-500 shrink-0">
                Select Page Route:
              </span>
              <select
                value={selectedPageId}
                onChange={(e) => setSelectedPageId(e.target.value)}
                className="h-10 w-full max-w-md rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs font-bold text-slate-900 outline-none focus:border-emerald-600 focus:bg-white shadow-xs transition cursor-pointer"
              >
                {ALL_SITE_PAGES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label} ({p.path})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Page Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 [scrollbar-width:thin]">
              {ALL_SITE_PAGES.slice(0, 7).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPageId(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer whitespace-nowrap ${
                    selectedPageId === p.id
                      ? "bg-[#23471d] text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Embedded SEOSiteCheckup Report Component */}
          {loadingSpeed ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-xs border border-slate-200">
              <Spinner />
              <p className="mt-4 text-sm font-bold text-slate-500 animate-pulse">Running live SEO Analysis...</p>
            </div>
          ) : (
            <SeoSiteCheckupReport
              pageId={selectedPageObj.id}
              url={selectedPageObj.id === "home" ? "https://bharatorganicexpo.com" : `https://bharatorganicexpo.com${selectedPageObj.path}`}
              pagespeed={pageSpeed}
              onReAudit={() => {
                const targetUrl = selectedPageObj.id === "home" ? "https://bharatorganicexpo.com" : `https://bharatorganicexpo.com${selectedPageObj.path}`;
                const pageId = selectedPageObj.id;
                setReAuditing(true);
                seoAuditApi
                  .pagespeed(targetUrl, "mobile", true)
                  .then((data) => setSpeed({ pageId, data }))
                  .catch(() => setSpeed({ pageId, data: null }))
                  .finally(() => setReAuditing(false));
              }}
            />
          )}
        </div>
      )}

      {/* Tab 2: Backlink Management & Excel Tracker */}
      {activeTab === "backlinks" && <BacklinkManager />}

      {/* Tab 3: AI Content Audit & Copy Detector */}
      {activeTab === "ai_content" && <AiContentAuditor currentRoute={selectedPageObj.path} />}

      {/* Tab 4: Keyword Planner (Dual Mode) */}
      {activeTab === "keyword_planner" && <KeywordPlannerTool />}

      {/* Tab 5: SEO Activity Logs */}
      {activeTab === "activity_log" && <SeoActivityLogWidget />}
    </div>
  );
}
