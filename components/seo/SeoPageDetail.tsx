"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, ExternalLink, X, ShieldCheck, RefreshCw } from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import { seoAuditApi, type SeoPageDetail as PageDetail, type SeoRecommendationResponse } from "@/lib/seoAuditApi";
import { ScorePill } from "./SeoBadges";

import AuditOverviewSection from "./audit/AuditOverviewSection";
import AuditSearchSection from "./audit/AuditSearchSection";
import AuditMetadataSection from "./audit/AuditMetadataSection";
import AuditKeywordsSection from "./audit/AuditKeywordsSection";
import AuditSocialSection from "./audit/AuditSocialSection";
import AuditHeadingsSection from "./audit/AuditHeadingsSection";
import AuditLinksSection from "./audit/AuditLinksSection";
import AuditImagesSection from "./audit/AuditImagesSection";
import AuditSchemaSection from "./audit/AuditSchemaSection";
import AuditPerformanceSection from "./audit/AuditPerformanceSection";
import { AuditBrowserHealthSection, AuditInfrastructureSection } from "./audit/AuditBrowserHealthSection";
import AuditIssuesSection from "./audit/AuditIssuesSection";
import { AuditAiFixesSection, AuditHistorySection } from "./audit/AuditAiFixesSection";
import { OpenAiAuditModal } from "./audit/OpenAiAuditModal";

const SECTIONS = [
  { id: "section-overview", label: "Overview" },
  { id: "section-search", label: "Search" },
  { id: "section-metadata", label: "Metadata" },
  { id: "section-keywords", label: "Keywords" },
  { id: "section-social-seo", label: "Social SEO" },
  { id: "section-headings", label: "Headings" },
  { id: "section-links", label: "Links" },
  { id: "section-images", label: "Images" },
  { id: "section-schema", label: "Schema" },
  { id: "section-performance", label: "Performance" },
  { id: "section-browser-health", label: "Browser health" },
  { id: "section-infrastructure", label: "Infrastructure" },
  { id: "section-issues", label: "Issues" },
  { id: "section-ai-fixes", label: "AI fixes" },
  { id: "section-history", label: "History" },
] as const;

export default function SeoPageDetail({ pageId, onClose }: { pageId: string; onClose: () => void }) {
  const [detail, setDetail] = useState<PageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("section-overview");
  const [aiState, setAiState] = useState<SeoRecommendationResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setAiState(null);
    try {
      const response = await seoAuditApi.page(pageId);
      setDetail(response);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load this page audit");
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // High-performance rAF-throttled scroll listener for active tab highlighting
  useEffect(() => {
    const scrollContainer = containerRef.current;
    if (!scrollContainer) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollPosition = scrollContainer.scrollTop + 180;
          for (let i = SECTIONS.length - 1; i >= 0; i--) {
            const sectionEl = document.getElementById(SECTIONS[i].id);
            if (sectionEl) {
              const top = sectionEl.offsetTop - scrollContainer.offsetTop;
              if (scrollPosition >= top) {
                setActiveSection(SECTIONS[i].id);
                break;
              }
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [detail]);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element && containerRef.current) {
      const top = element.offsetTop - containerRef.current.offsetTop - 140;
      containerRef.current.scrollTo({ top, behavior: "smooth" });
    }
  };

  const [aiProvider, setAiProvider] = useState<"openai" | "gemini">("openai");

  const generateAi = async (force: boolean, provider: "openai" | "gemini" = aiProvider) => {
    setAiLoading(true);
    setAiProvider(provider);
    try {
      setAiState(await seoAuditApi.generatePageRecommendation(pageId, force, provider));
    } catch (caught) {
      setAiState({
        status: "error",
        message: caught instanceof Error ? caught.message : "AI request failed",
        recommendation: null,
      });
    } finally {
      setAiLoading(false);
    }
  };

  const page = detail?.page;

  return (
    <div
      className="fixed inset-0 z-[2147483647] flex justify-end bg-slate-950/80 p-2 sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="SEO page audit report"
        className="flex h-full w-full max-w-[1060px] flex-col overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl text-slate-100 transform-gpu"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 bg-[#1e293b] px-5 py-3.5 shrink-0 shadow-md">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              {page && <ScorePill score={page.score} size="lg" />}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
                    SEMrush Page Audit Report
                  </p>
                </div>
                <h3 className="line-clamp-1 text-[17px] font-black tracking-tight text-white mt-0.5">
                  {page?.title ?? page?.path ?? "Page Audit"}
                </h3>
              </div>
            </div>
            {page && (
              <a
                href={page.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex max-w-full items-center gap-1.5 truncate text-[11.5px] font-bold text-emerald-300 hover:text-white transition-colors bg-emerald-950/80 border border-emerald-700/80 px-3 py-0.5 rounded-full shadow-sm"
              >
                {page.url}
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={aiLoading}
              onClick={() => {
                setIsAuditModalOpen(true);
                if (!aiState?.recommendation) {
                  void generateAi(true);
                }
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 px-3.5 py-2 text-[12px] font-black text-white shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {aiLoading ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-white" />
                  <span>Generating Full Audit...</span>
                </>
              ) : (
                <>
                  <span className="text-emerald-300 text-xs">⚡</span>
                  <span>Generate Full Audit Report</span>
                </>
              )}
            </button>

            <button
              type="button"
              aria-label="Close audit details"
              onClick={onClose}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-slate-600 bg-slate-800 text-slate-200 transition-all hover:border-red-500 hover:bg-red-500/20 hover:text-white cursor-pointer shadow-md"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Sticky Active Tabs Navigation Bar */}
        <div className="sticky top-0 z-30 flex gap-1.5 overflow-x-auto border-b border-slate-700 bg-[#1e293b] px-5 py-2.5 [scrollbar-width:thin] shrink-0 shadow-lg">
          {SECTIONS.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => scrollToSection(sec.id)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[11.5px] font-extrabold transition-all cursor-pointer ${
                  isActive
                    ? "bg-emerald-500 text-slate-950 shadow-md border border-emerald-400 font-black scale-[1.02]"
                    : "bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700"
                }`}
              >
                {sec.label}
              </button>
            );
          })}
        </div>

        {/* Single Scrollable Dark Slate Page Content */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto bg-[#0f172a] p-4 sm:p-5 space-y-6 [scrollbar-width:thin] transform-gpu will-change-scroll"
        >
          {loading && (
            <div className="flex flex-col items-center justify-center py-28 space-y-4">
              <Spinner />
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest animate-pulse">
                Loading SEMrush Audit Report...
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 rounded-2xl border border-red-500/50 bg-red-950/60 p-5 text-[14px] font-bold text-red-200 shadow-xl">
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
              {error}
            </div>
          )}

          {detail && page && (
            <>
              {/* 1. Overview */}
              <AuditOverviewSection page={page} />

              {/* 2. Search Console */}
              <AuditSearchSection search={detail.search} />

              {/* 3. Metadata */}
              <AuditMetadataSection page={page} />

              {/* 4. Keywords */}
              <AuditKeywordsSection page={page} />

              {/* 5. Social SEO */}
              <AuditSocialSection page={page} />

              {/* 6. Headings */}
              <AuditHeadingsSection page={page} />

              {/* 7. Links */}
              <AuditLinksSection page={page} detail={detail} />

              {/* 8. Images */}
              <AuditImagesSection page={page} />

              {/* 9. Schema */}
              <AuditSchemaSection page={page} />

              {/* 10. Performance */}
              <AuditPerformanceSection performance={detail.performance} />

              {/* 11. Browser Health */}
              <AuditBrowserHealthSection page={page} />

              {/* 12. Infrastructure */}
              <AuditInfrastructureSection page={page} />

              {/* 13. Issues */}
              <AuditIssuesSection issues={detail.issues || []} />

              {/* 14. AI Fixes */}
              <AuditAiFixesSection aiLoading={aiLoading} aiState={aiState} generateAi={generateAi} />

              {/* 15. History */}
              <AuditHistorySection history={detail.history || []} />
            </>
          )}
        </div>
      </aside>

      {/* OpenAI Full Audit Report Dedicated Modal */}
      <OpenAiAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        pageDetail={detail}
        aiState={aiState}
        aiLoading={aiLoading}
        onReGenerate={(prov) => {
          void load();
          void generateAi(true, prov || aiProvider);
        }}
      />
    </div>
  );
}
