"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import typography from "./PagesTypography.module.css";
import SeoPagesTable from "@/components/seo/SeoPagesTable";
import SeoPageDetail from "@/components/seo/SeoPageDetail";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  CircleGauge,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  ExternalLink,
  FileText,
  Filter,
  Home,
  ImageIcon,
  Layers,
  Link2,
  MoreVertical,
  MousePointerClick,
  Pencil,
  Play,
  Loader2,
  Plus,
  Search,
  SlidersHorizontal,
  TrendingUp,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import {
  cmsPages,
  cmsPagesFromSettings,
  getCmsPageRouteKey,
  PUBLIC_SITE_URL,
  type CmsPage,
  type PageStatus,
  type PageType,
} from "@/lib/cmsPages";
import { settingsApi } from "@/lib/settingsApi";
import { dashboardApi } from "@/lib/dashboardApi";
import { useAppSelector } from "@/store/hooks";

/* =========================================================
   TYPES
========================================================= */

type DetailTab =
  | "SEO"
  | "Content"
  | "Performance"
  | "History";

/* =========================================================
   SEO RING — SMALLER + LIGHTER
========================================================= */

function SeoRing({
  score,
  size = 26,
}: {
  score: number;
  size?: number;
}) {
  const color =
    score >= 80
      ? "#18844c"
      : score >= 75
        ? "#c89125"
        : "#ee9a1a";

  return (
    <div
      className="relative shrink-0 rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(
          ${color} 0deg ${score * 3.6}deg,
          #edf1ed ${score * 3.6}deg 360deg
        )`,
      }}
    >
      <div className="absolute inset-[3px] rounded-full bg-white" />
    </div>
  );
}

/* =========================================================
   LARGE SEO RING — SMALLER
========================================================= */

function LargeSeoRing({
  score,
}: {
  score: number;
}) {
  return (
    <div
      className="relative grid h-[108px] w-[108px] shrink-0 place-items-center rounded-full"
      style={{
        background: score >= 100
          ? "#2563eb"
          : `conic-gradient(
              #2563eb 0deg ${score * 3.6}deg,
              #e2e8f0 ${score * 3.6}deg 360deg
            )`,
      }}
    >
      <div className="grid h-[88px] w-[88px] place-items-center rounded-full bg-white">
        <div className="text-center">
          <div className="text-[19px] font-bold leading-none tracking-[-0.025em] text-[#17223a]">
            {score}
            <span className="ml-[1px] text-[10px] font-semibold text-[#64748b]">
              /100
            </span>
          </div>

          <p className="mt-[5px] whitespace-nowrap font-semibold text-[#2563eb]" style={{ fontSize: "10px" }}>
            {score >= 90 ? "Excellent" : score >= 75 ? "Good" : "Needs Work"}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PAGE TYPE ICON — SMALLER / THINNER
========================================================= */

function PageTypeIcon({
  type,
}: {
  type: PageType;
}) {
  if (type === "home") {
    return (
      <div className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full bg-[#edf6ec] text-[#23764b]">
        <Home
          className="h-[12px] w-[12px]"
          strokeWidth={1.7}
        />
      </div>
    );
  }

  if (type === "people") {
    return (
      <div className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full bg-[#fff4e1] text-[#af7a27]">
        <UsersRound
          className="h-[12px] w-[12px]"
          strokeWidth={1.65}
        />
      </div>
    );
  }

  return (
    <div className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full bg-[#fff4e1] text-[#af7a27]">
      <FileText
        className="h-[12px] w-[12px]"
        strokeWidth={1.65}
      />
    </div>
  );
}

/* =========================================================
   AUTHOR ICON — SMALLER
========================================================= */

function AuthorIcon() {
  return (
    <div className="grid h-[24px] w-[24px] shrink-0 place-items-center rounded-full bg-[#f2f4f1] text-[#26364b]">
      <UserRound
        className="h-[11px] w-[11px]"
        strokeWidth={1.7}
      />
    </div>
  );
}

/* =========================================================
   FILTER
========================================================= */

function FilterSelect({
  value,
  options,
  onChange,
  className = "",
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={`relative shrink-0 ${className}`}>
      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-[30px] w-full cursor-pointer appearance-none rounded-[6px] border border-[#e3e4e0] bg-white pl-[11px] pr-[28px] text-[8.5px] font-semibold text-[#374156] outline-none transition-colors hover:border-[#d2c9b3] focus:border-[#c39a43]"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>

      <ChevronDown className="pointer-events-none absolute right-[9px] top-1/2 h-[11px] w-[11px] -translate-y-1/2 text-[#737b87]" />
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function PagesCmsPage() {
  const router = useRouter();
  const admin = useAppSelector((state) => state.auth.admin);
  const [viewMode] = useState<"cms" | "audit">("cms");
  const [selectedSeoPageId, setSelectedSeoPageId] = useState<string | null>(null);
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [totalSections, setTotalSections] = useState(0);
  const [search, setSearch] = useState("");

  const [pageFilter, setPageFilter] =
    useState("All Pages");

  const [statusFilter, setStatusFilter] =
    useState("All Status");

  const [authorFilter, setAuthorFilter] =
    useState("All Authors");

  const [pageSpeedData, setPageSpeedData] = useState<Record<string, any> | null>(null);
  const [dashboardPageSpeed, setDashboardPageSpeed] = useState<Record<string, any> | null>(null);
  const [isFetchingPageSpeed, setIsFetchingPageSpeed] = useState(false);
  const [pageSpeedError, setPageSpeedError] = useState<string | null>(null);

  const [selectedPageValue, setSelectedPage] = useState<CmsPage | null>(null);
  const selectedPage = selectedPageValue ?? pages[0] ?? cmsPages[0];
  const loggedInAdminName = admin?.name?.trim() || "Admin User";

  const [rawSettings, setRawSettings] = useState<Record<string, any> | null>(null);

  const [toastMessage, setToastMessage] = useState<{ title: string; type: "success" | "error" } | null>(null);

  const handleToggleStatus = (isActive: boolean) => {
    const newStatus = isActive ? "Published" : "Draft";
    setPages((prev) => prev.map((p) => (p.id === selectedPage.id ? { ...p, status: newStatus } : p)));
    setSelectedPage((prev: CmsPage | null) => prev ? { ...prev, status: newStatus } : { ...selectedPage, status: newStatus });

    if (isActive) {
      setToastMessage({
        title: "Success! The page has been published and is now live.",
        type: "success"
      });
    } else {
      setToastMessage({
        title: "Notice: The page has been unpublished and moved to drafts.",
        type: "error"
      });
    }
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    let active = true;
    settingsApi.get().then((settings) => {
      if (!active) return;
      const raw = settings as unknown as Record<string, any>;
      setRawSettings(raw);
      const realPages = cmsPagesFromSettings(raw);
      setPages(realPages);
      setSelectedPage(realPages[0] ?? null);
      const sections = Object.entries(raw).reduce((count, [key, value]) => {
        if (!key.toLowerCase().endsWith("page") || !value || typeof value !== "object") return count;
        const page = value as { sections?: unknown[] };
        return count + (page.sections?.length ?? 0);
      }, 0);
      setTotalSections(sections);
    }).catch(() => {
      if (active) {
        setPages([]);
        setSelectedPage(null);
      }
    });

    dashboardApi.overview().then((data) => {
      if (active && data?.sources?.pageSpeed?.data) {
        const ps = data.sources.pageSpeed.data;
        setDashboardPageSpeed({
          score: ps.performanceScore ?? null,
          lcp: ps.lcp != null ? `${(ps.lcp / 1000).toFixed(1)}s` : "No Data",
          inp: ps.inp != null ? `${Math.round(ps.inp)}ms` : "No Data",
          cls: ps.cls != null ? ps.cls.toFixed(2) : "0.00",
          fcp: ps.fcp != null ? `${(ps.fcp / 1000).toFixed(1)}s` : "No Data",
          ttfb: "No Data",
          tbt: ps.tbt != null ? `${Math.round(ps.tbt)}ms` : "No Data",
        });
      }
    }).catch(() => {});

    return () => { active = false; };
  }, []);

  const selectedPageConfig = selectedPage.configKey && rawSettings ? rawSettings[selectedPage.configKey] : undefined;

  const selectedPageIsPublished = selectedPage.status === "Published";
  const selectedPageIsActive =
    selectedPageIsPublished && selectedPageConfig?.enabled !== false;

  const selectedPagePublicUrl = `${PUBLIC_SITE_URL.replace(/\/+$/, "")}${selectedPage.slug === "/"
    ? "/"
    : selectedPage.slug.startsWith("/")
      ? selectedPage.slug
      : `/${selectedPage.slug}`
    }`;

  const runPageSpeedTest = async () => {
    setIsFetchingPageSpeed(true);
    setPageSpeedError(null);
    try {
      // Use the public Google PageSpeed Insights API
      const url = encodeURIComponent(selectedPagePublicUrl);
      const res = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${url}&category=performance`);
      if (!res.ok) {
        throw new Error("Failed to fetch performance data");
      }
      const data = await res.json();
      const audits = data?.lighthouseResult?.audits || {};
      
      setPageSpeedData({
        lcp: audits["largest-contentful-paint"]?.displayValue || "—",
        cls: audits["cumulative-layout-shift"]?.displayValue || "—",
        fcp: audits["first-contentful-paint"]?.displayValue || "—",
        ttfb: audits["server-response-time"]?.displayValue || "—",
        tbt: audits["total-blocking-time"]?.displayValue || "—",
        score: Math.round((data?.lighthouseResult?.categories?.performance?.score || 0) * 100)
      });
    } catch (err: any) {
      setPageSpeedError(err.message || "An error occurred");
    } finally {
      setIsFetchingPageSpeed(false);
    }
  };

  const selectedPageSections: Array<Record<string, any>> =
    selectedPageConfig?.sections ?? [];

  const selectedPageHasInternalLinks = Boolean(
    selectedPageConfig?.sections?.some((section: Record<string, any>) => {
      const hrefs = [section.buttonHref, section.secondaryButtonHref, section.tertiaryButtonHref, ...(section.items ?? []).map((item: Record<string, any>) => item.href)];
      return hrefs.some((href) => typeof href === "string" && href.trim().startsWith("/"));
    }),
  );

  const selectedPageHasImages = Boolean(
    selectedPageConfig?.sections?.some((section: Record<string, any>) => {
      const images = [section.image, section.logoImage, section.secondaryImage, section.partnerLogoImage, ...(section.items ?? []).map((item: Record<string, any>) => item.image)];
      return images.some((image) => typeof image === "string" && image.trim().length > 0);
    }),
  );

  const IMAGE_FIELD_PATTERN = /image|logo/i;
  const BUTTON_LABEL_FIELD_PATTERN = /buttonLabel$/i;
  const TEXT_FIELD_SKIP_PATTERN = /^(_id|key|name|enabled)$/i;

  const contentStats = useMemo(() => {
    const sections: Array<Record<string, any>> = selectedPageConfig?.sections ?? [];
    let textBlocks = 0;
    let images = 0;
    let ctaBlocks = 0;

    sections.forEach((section) => {
      Object.entries(section).forEach(([key, value]) => {
        if (TEXT_FIELD_SKIP_PATTERN.test(key) || key === "items" || key === "slides") return;
        if (IMAGE_FIELD_PATTERN.test(key)) {
          if (typeof value === "string" && value.trim()) images += 1;
          return;
        }
        if (BUTTON_LABEL_FIELD_PATTERN.test(key)) {
          if (typeof value === "string" && value.trim()) ctaBlocks += 1;
          return;
        }
        if (typeof value === "string" && value.trim()) textBlocks += 1;
      });

      (section.items ?? []).forEach((item: Record<string, any>) => {
        Object.entries(item).forEach(([key, value]) => {
          if (key === "_id") return;
          if (IMAGE_FIELD_PATTERN.test(key) && typeof value === "string" && value.trim()) {
            images += 1;
          } else if (typeof value === "string" && value.trim()) {
            textBlocks += 1;
          }
        });
      });
    });

    return {
      sections: sections.length,
      textBlocks,
      images,
      ctaBlocks,
    };
  }, [selectedPageConfig]);

  const [activeTab, setActiveTab] =
    useState<DetailTab>("SEO");

  const [activePagination, setActivePagination] =
    useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [actionMenu, setActionMenu] =
    useState<number | null>(null);

  const filteredPages = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return pages.filter((page) => {
      const searchMatch =
        !query ||
        page.title
          .toLowerCase()
          .includes(query) ||
        page.slug
          .toLowerCase()
          .includes(query);

      const pageMatch =
        pageFilter === "All Pages" ||
        (pageFilter === "Homepage" &&
          page.type === "home") ||
        (pageFilter === "Inner Pages" &&
          page.type !== "home");

      const statusMatch =
        statusFilter === "All Status" ||
        page.status === statusFilter;

      const authorMatch =
        authorFilter === "All Authors" ||
        page.author === authorFilter;

      return (
        searchMatch &&
        pageMatch &&
        statusMatch &&
        authorMatch
      );
    });
  }, [
    search,
    pageFilter,
    statusFilter,
    authorFilter,
    pages,
  ]);

  const publishedCount = pages.filter((page) => page.status === "Published").length;
  const draftCount = Math.max(0, pages.length - publishedCount);
  const averageSeo = pages.length ? Math.round(pages.reduce((sum, page) => sum + page.seoScore, 0) / pages.length) : 0;
  const averageSeoRating = averageSeo >= 90 ? "Excellent" : averageSeo >= 75 ? "Good" : averageSeo >= 50 ? "Needs Work" : "Poor";
  const averageSeoColor = averageSeo >= 75 ? "#1a864d" : averageSeo >= 50 ? "#d99b18" : "#c0392b";
  const lastUpdatedPage = pages[0] ?? null;
  const totalPaginationPages = Math.max(1, Math.ceil(filteredPages.length / pageSize));
  const safePage = Math.min(activePagination, totalPaginationPages);
  const paginatedPages = filteredPages.slice((safePage - 1) * pageSize, safePage * pageSize);

  useEffect(() => {
    setActivePagination(1);
  }, [search, pageFilter, statusFilter, authorFilter, pageSize]);

  const topStats = [
    {
      title: "TOTAL PAGES",
      value: pages.length.toString(),
      note: `Published: ${publishedCount}`,
      icon: FileText,
      tone: "violet",
      gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 55%, #f8f5ff 100%)",
      numColor: "#6d28d9",
      footer: "View all pages",
    },
    {
      title: "DRAFT PAGES",
      value: draftCount.toString(),
      note: `Unpublished: ${draftCount}`,
      icon: Pencil,
      tone: "amber",
      gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 55%, #fffdf0 100%)",
      numColor: "#b45309",
      footer: "View drafts",
    },
    {
      title: "TOTAL SECTIONS",
      value: totalSections.toString(),
      note: "Across all pages",
      icon: Layers,
      tone: "blue",
      gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 55%, #f0f7ff 100%)",
      numColor: "#1d4ed8",
      footer: "Manage sections",
    },

    {
      title: "SEO SCORE (AVG)",
      value: averageSeo.toString(),
      suffix: "/100",
      note: averageSeoRating,
      icon: TrendingUp,
      tone: "emerald",
      gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 55%, #f0fdf4 100%)",
      numColor: "#047857",
      footer: "View SEO report",
    },
  ];

  const toneClass = {
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    violet: "bg-violet-50 text-violet-700 ring-violet-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    rose: "bg-rose-50 text-rose-700 ring-rose-100",
  };

  return (
    <div className={`${typography.pages} h-full min-h-0 w-full overflow-hidden bg-[#fffefb] text-[#182238]`}>
      <div className="flex h-full min-h-0 flex-col overflow-hidden px-[18px] pb-[10px] pt-[14px]">

        {/* =================================================
            TOP HEADING
        ================================================= */}

        <div className="mb-[20px] flex shrink-0 items-start justify-between border-b-[2px] border-[#293681] pb-[8px]">
          <div>
            <h1 className="text-[19px] font-bold leading-[1.15] tracking-[-0.018em] text-[#18233b]">
              Pages &amp; CMS
            </h1>

            <div className="mt-[6px] flex items-center gap-[6px] text-[9px] font-medium text-[#6c7587]">
              <span>Pages &amp; CMS</span>
            </div>
          </div>

          <div className="flex items-center gap-[10px]">
            <button
              type="button"
              className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] border border-red-200 bg-red-50 px-[12px] text-[8.5px] font-semibold text-red-700 shadow-[0_1px_4px_rgba(30,30,20,0.025)] transition hover:bg-red-100"
            >
              <SlidersHorizontal
                className="h-[11px] w-[11px]"
                strokeWidth={1.7}
              />

              Reorder Pages
            </button>

            <button
              type="button"
              onClick={() => router.push("/pages/new")}
              className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] bg-[#293681] px-[14px] text-[8.5px] font-semibold text-white shadow-[0_5px_12px_rgba(41,54,129,0.15)] transition hover:bg-[#1f2963]"
            >
              <Plus
                className="h-[12px] w-[12px]"
                strokeWidth={1.7}
              />

              Add New Page
            </button>
          </div>
        </div>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        {viewMode === "audit" && (
          <div className="min-h-0 flex-1 overflow-y-auto pb-4">
            <SeoPagesTable
              onSelectPage={setSelectedSeoPageId}
              selectedPageId={selectedSeoPageId}
              onAuditStarted={() => setToastMessage({ title: "SEO audit started — results appear when it finishes", type: "success" })}
            />
          </div>
        )}

        {selectedSeoPageId && (
          <SeoPageDetail pageId={selectedSeoPageId} onClose={() => setSelectedSeoPageId(null)} />
        )}

        <div
          className={`${viewMode === "audit" ? "hidden" : "grid"} min-h-0 flex-1 grid-cols-[minmax(0,1fr)_360px] gap-[14px]`}
        >

          {/* ===============================================
              LEFT
          =============================================== */}

          <div className="flex min-h-0 flex-col">

            {/* =============================================
                STATS
            ============================================= */}

            <div className="grid h-[98px] shrink-0 grid-cols-4 gap-[11px]">
              {topStats.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="relative flex flex-col justify-center overflow-hidden rounded-[7px] p-2"
                    style={{
                      background: item.gradient,
                      boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
                    }}
                  >
                    <div className="flex items-start gap-1.5">
                      <div
                        className={`grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full ring-1 ${
                          toneClass[item.tone as keyof typeof toneClass]
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[8px] tracking-[0.01em] text-slate-900" style={{ color: "#0f172a" }}>
                          {item.title}
                        </p>

                        <div className="mt-1.5 flex items-end gap-1">
                          <span
                            className={`tracking-[-0.04em] ${
                              item.title === "LAST UPDATED" ? "text-[11px] leading-[1.2]" : "text-[17px] leading-none"
                            }`}
                            style={{ color: item.numColor }}
                          >
                            {item.value}
                          </span>

                          {item.suffix && (
                            <span className="mb-0.5 text-[8px]">
                              {item.suffix}
                            </span>
                          )}
                        </div>

                        <p
                          className={`mt-0.5 text-[7.5px] ${
                            item.title === "DRAFT PAGES"
                              ? "text-amber-600"
                              : item.title === "TOTAL SECTIONS"
                              ? "text-blue-600"
                              : item.title === "LAST UPDATED"
                              ? "text-rose-600"
                              : "text-emerald-700"
                          }`}
                        >
                          {item.note}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* =============================================
                FILTER ROW
            ============================================= */}

            <div className="mt-[10px] flex h-[30px] shrink-0 items-center gap-[9px]">
              <div className="relative min-w-[250px] flex-1">
                <Search
                  className="absolute left-[11px] top-1/2 h-[12px] w-[12px] -translate-y-1/2 text-[#7a818d]"
                  strokeWidth={1.7}
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search pages by title or URL..."
                  className="h-[30px] w-full rounded-[6px] border border-[#e3e4e0] bg-white pl-[33px] pr-[11px] text-[8.5px] font-normal text-[#424c5f] outline-none placeholder:text-[#9298a3] focus:border-[#c8ad70]"
                />
              </div>

              <FilterSelect
                value={pageFilter}
                onChange={setPageFilter}
                options={[
                  "All Pages",
                  "Homepage",
                  "Inner Pages",
                ]}
                className="w-[116px]"
              />

              <FilterSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  "All Status",
                  "Published",
                  "Draft",
                ]}
                className="w-[116px]"
              />

              <FilterSelect
                value={authorFilter}
                onChange={setAuthorFilter}
                options={[
                  "All Authors",
                  "Admin User",
                  "Seva Team",
                ]}
                className="w-[126px]"
              />

              <button
                type="button"
                className="flex h-[30px] w-[72px] shrink-0 items-center justify-center gap-[6px] rounded-[6px] border border-[#e3e4e0] bg-white text-[8.5px] font-semibold text-[#374156]"
              >
                <Filter
                  className="h-[12px] w-[12px]"
                  strokeWidth={1.7}
                />

                Filter
              </button>
            </div>

            {/* =============================================
                TABLE
            ============================================= */}

            <div
              className="mt-[13px] flex min-h-0 flex-1 flex-col overflow-hidden rounded-[7px] bg-white"
              style={{ boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px" }}
            >

              {/* TABLE HEADER */}

              <div className="grid h-[32px] shrink-0 grid-cols-[minmax(0,2.7fr)_minmax(0,1.8fr)_minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,1.45fr)] items-center border-b border-[#e8e5df] bg-[#233D4D] px-[10px]">
                <div className="min-w-0 overflow-hidden px-[4px] text-[8.5px] font-bold text-white">
                  Page Title
                </div>

                <div className="min-w-0 overflow-hidden px-[4px] text-[8.5px] font-bold text-white">
                  Url
                </div>

                <div className="min-w-0 overflow-hidden px-[4px] text-[8.5px] font-bold text-white">
                  Author
                </div>

                <div className="min-w-0 overflow-hidden px-[4px] text-[8.5px] font-bold text-white">
                  Status
                </div>

                <div className="min-w-0 overflow-hidden px-[4px] text-[8.5px] font-bold text-white">
                  Seo Score
                </div>

                <div className="min-w-0 overflow-hidden px-[4px] text-[8.5px] font-bold text-white">
                  Last Updated
                </div>
              </div>

              {/* ROWS */}

              <div className="min-h-0 flex-1 overflow-y-auto pr-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-[2px]">
                {paginatedPages.map((page) => {
                  const selected =
                    selectedPage.id === page.id;

                  return (
                    <div
                      key={page.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setSelectedPage(page);
                        setActionMenu(null);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelectedPage(page);
                          setActionMenu(null);
                        }
                      }}
                      className={`grid min-h-[44px] w-full grid-cols-[minmax(0,2.7fr)_minmax(0,1.8fr)_minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,1.45fr)] items-center border-b border-[#f0f0ec] px-[10px] text-left transition last:border-b-0 ${selected
                        ? "bg-[#E4DA72]/20"
                        : page.status !== "Published"
                          ? "bg-rose-50/60 hover:bg-rose-100/60"
                          : "bg-white hover:bg-slate-50"
                        }`}
                    >

                      {/* TITLE */}

                      <div className="flex min-w-0 items-center gap-[7px] px-[4px]">
                        <PageTypeIcon type={page.type} />

                        <div className="flex min-w-0 max-w-full items-center gap-[5px] overflow-hidden">
                          <span className="truncate text-[8px] font-semibold text-[#293681]">
                            {page.title}
                          </span>

                          {page.type === "home" && (
                            <span className="shrink-0 rounded-[4px] bg-[#edf5eb] px-[5px] py-[2px] text-[6.5px] font-semibold text-[#397b54]">
                              Homepage
                            </span>
                          )}
                        </div>
                      </div>

                      {/* URL */}

                      <div className="flex min-w-0 items-center gap-[5px] overflow-hidden px-[4px]">
                        <span className="truncate text-[7.5px] font-medium text-[#4B1426]">
                          {page.slug}
                        </span>

                        <ExternalLink
                          className="h-[10px] w-[10px] shrink-0 text-[#7b8494]"
                          strokeWidth={1.7}
                        />
                      </div>

                      {/* AUTHOR */}

                      <div className="flex min-w-0 items-center gap-[6px] overflow-hidden px-[4px]">
                        <span className="truncate text-[7.5px] font-medium text-[#BE1A1A]">
                          {page.author}
                        </span>
                      </div>

                      {/* STATUS */}

                      <div className="min-w-0 px-[4px]">
                        <span
                          className={`inline-flex max-w-full items-center gap-[4px] whitespace-nowrap rounded-[4px] px-[6px] py-[3px] text-[7px] font-semibold ${page.status === "Published"
                            ? "bg-[#edf6ee] text-[#327d50]"
                            : "bg-rose-50 text-rose-700"
                            }`}
                        >
                          <span
                            className={`h-[4px] w-[4px] rounded-full ${page.status === "Published"
                              ? "bg-[#308052]"
                              : "bg-rose-600"
                              }`}
                          />

                          {page.status === "Published" ? "Active" : "Inactive"}
                        </span>
                      </div>

                      {/* SCORE */}

                      <div className="flex min-w-0 items-center gap-[6px] px-[4px]">
                        <SeoRing score={page.seoScore} />

                        <div className="min-w-0">
                          <p className="text-[11px] font-bold leading-none text-[#2c374c]">
                            {page.seoScore}
                          </p>

                          <p
                            className={`mt-[3px] truncate whitespace-nowrap text-[7px] font-semibold leading-none ${page.rating === "Needs Work"
                              ? "text-[#d98b1f]"
                              : "text-[#38805a]"
                              }`}
                          >
                            {page.rating}
                          </p>
                        </div>
                      </div>

                      {/* UPDATED */}

                      <div className="min-w-0 overflow-hidden px-[4px] pl-[12px]">
                        <p className="truncate text-[7.5px] font-semibold leading-[1.3] text-[#293681]">
                          {page.updated.split(",")[0]}
                        </p>

                        <p className="mt-[2px] truncate text-[7.5px] font-semibold leading-[1.3] text-blue-600">
                          {page.updated.split(",")[1]?.trim()}
                        </p>
                      </div>

                    </div>
                  );
                })}

                {Array.from({
                  length: Math.max(
                    0,
                    pageSize - paginatedPages.length,
                  ),
                }).map((_, index) => (
                  <div
                    key={`blank-${index}`}
                    className="min-h-[44px] border-b border-[#f0f0ec] last:border-b-0"
                  />
                ))}
              </div>

              {/* PAGINATION */}

              <div className="flex h-[44px] shrink-0 items-center justify-between border-t border-[#e9e9e5] px-[10px]">
                <p className="whitespace-nowrap text-[8px] font-medium text-[#293681]">
                  Showing {filteredPages.length ? (safePage - 1) * pageSize + 1 : 0} to {Math.min(safePage * pageSize, filteredPages.length)} of {filteredPages.length} pages
                </p>

                <div className="flex items-center gap-[4px]">
                  <button
                    type="button"
                    onClick={() => setActivePagination(1)}
                    disabled={safePage === 1}
                    className="grid h-[25px] w-[25px] place-items-center rounded-[5px] border border-[#e4e5e1] text-[#9298a1]"
                  >
                    <ChevronsLeft
                      className="h-[11px] w-[11px]"
                      strokeWidth={1.7}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePagination(Math.max(1, safePage - 1))}
                    disabled={safePage === 1}
                    className="grid h-[25px] w-[25px] place-items-center rounded-[5px] border border-[#e4e5e1] text-[#727b89]"
                  >
                    <ChevronLeft
                      className="h-[11px] w-[11px]"
                      strokeWidth={1.7}
                    />
                  </button>

                  {Array.from({ length: totalPaginationPages }, (_, index) => index + 1).map(
                    (pageNumber) => (
                      <button
                        type="button"
                        key={pageNumber}
                        onClick={() =>
                          setActivePagination(
                            pageNumber,
                          )
                        }
                        className={`grid h-[25px] min-w-[25px] place-items-center rounded-[5px] px-[5px] text-[8px] font-semibold ${activePagination ===
                          pageNumber
                          ? "bg-[#8c6b1d] text-white"
                          : "border border-[#e4e5e1] bg-white text-[#626b7b]"
                          }`}
                      >
                        {pageNumber}
                      </button>
                    ),
                  )}

                  <button
                    type="button"
                    onClick={() => setActivePagination(Math.min(totalPaginationPages, safePage + 1))}
                    disabled={safePage === totalPaginationPages}
                    className="grid h-[25px] w-[25px] place-items-center rounded-[5px] border border-[#e4e5e1] text-[#727b89]"
                  >
                    <ChevronRight
                      className="h-[11px] w-[11px]"
                      strokeWidth={1.7}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePagination(totalPaginationPages)}
                    disabled={safePage === totalPaginationPages}
                    className="grid h-[25px] w-[25px] place-items-center rounded-[5px] border border-[#e4e5e1] text-[#727b89]"
                  >
                    <ChevronsRight
                      className="h-[11px] w-[11px]"
                      strokeWidth={1.7}
                    />
                  </button>
                </div>

                <FilterSelect
                  value={`${pageSize} / page`}
                  onChange={(value) => setPageSize(Number(value.split(" ")[0]))}
                  options={[
                    "10 / page",
                    "20 / page",
                    "50 / page",
                  ]}
                  className="w-[90px]"
                />
              </div>
            </div>
          </div>

          {/* ===============================================
              RIGHT DETAILS
          =============================================== */}

          <aside
            className="flex min-h-0 flex-col overflow-hidden rounded-[7px] bg-white"
            style={{ boxShadow: "rgba(0, 0, 0, 0.05) 0px 0px 0px 1px" }}
          >

            {/* HEADER */}

            <div className="flex h-[32px] shrink-0 items-center justify-between border-b border-slate-200/80 bg-[#f0f3f6] px-2.5 backdrop-blur-sm">
              <h2 className="text-[11.5px] font-semibold tracking-[-0.01em] text-[#0f172a]">
                Page Details
              </h2>
            </div>

            {/* SELECTED PAGE */}

            <div className="h-[170px] shrink-0 border-b border-[#ebebe7] px-[13px] py-[8px]">
              <div className="flex items-center justify-between">
                <p className="text-[8px] font-bold uppercase tracking-[0.02em] text-[#BE1A1A]">
                  SELECTED PAGE
                </p>

                <div className="flex items-center gap-[5px]">
                  <span
                    className={`inline-flex items-center gap-[4px] rounded-full px-[7px] py-[3px] text-[7px] font-bold ${selectedPageIsActive
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                      : "bg-rose-50 text-rose-700 ring-1 ring-rose-100"
                      }`}
                  >
                    <span
                      className={`h-[5px] w-[5px] rounded-full ${selectedPageIsActive ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                    />
                    {selectedPageIsActive ? "Active" : "Inactive"}
                  </span>

                  <span
                    className={`inline-flex items-center gap-[4px] rounded-full px-[7px] py-[3px] text-[7px] font-bold ${selectedPageIsPublished
                      ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
                      : "bg-amber-50 text-amber-700 ring-1 ring-amber-100"
                      }`}
                  >
                    {selectedPageIsPublished ? "Published" : "Not Published"}
                  </span>

                  <label className="relative ml-[2px] inline-block h-[24px] w-[42px] cursor-pointer">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={selectedPageIsPublished}
                      onChange={(e) => handleToggleStatus(e.target.checked)}
                    />
                    <span className="absolute inset-0 rounded-[30px] border border-[#ccc] bg-red-500 transition-all duration-300 peer-checked:border-transparent peer-checked:bg-[#5fdd54] before:absolute before:left-[1px] before:top-[1px] before:h-[20px] before:w-[20px] before:rounded-full before:bg-white before:shadow-[0_2px_5px_#999999] before:content-[''] before:transition-all before:duration-300 peer-checked:before:translate-x-[18px]" />
                  </label>
                </div>
              </div>

              <div className="mt-[6px] flex items-start gap-[10px]">
                <div className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-full bg-[#edf5eb] text-[#24774b]">
                  {selectedPage.type === "home" ? (
                    <Home
                      className="h-[17px] w-[17px]"
                      strokeWidth={1.7}
                    />
                  ) : selectedPage.type === "people" ? (
                    <UsersRound
                      className="h-[16px] w-[16px]"
                      strokeWidth={1.7}
                    />
                  ) : (
                    <FileText
                      className="h-[16px] w-[16px]"
                      strokeWidth={1.7}
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-[6px]">
                    <h3 className="truncate text-[11.5px] font-bold text-[#293681]">
                      {selectedPage.title}
                    </h3>

                    {selectedPage.type === "home" && (
                      <span className="shrink-0 rounded-[4px] bg-[#edf5eb] px-[6px] py-[2px] text-[7px] font-semibold text-[#3b7b56]">
                        Homepage
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        selectedPagePublicUrl,
                        "_blank",
                        "noopener,noreferrer",
                      )
                    }
                    className="mt-[4px] flex max-w-full items-center gap-[4px] text-left text-[12px] font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
                    title={selectedPagePublicUrl}
                  >
                    <span className="truncate">{selectedPagePublicUrl}</span>

                    <ExternalLink
                      className="h-[12px] w-[12px] shrink-0"
                      strokeWidth={1.7}
                    />
                  </button>

                  <div className="mt-[4px] flex items-center justify-between gap-[8px]">
                    <p className="truncate text-[10px] font-semibold text-[#17433F]">
                      Last updated {selectedPage.updated}
                    </p>

                    <p className="shrink-0 text-[10px] font-medium text-[#BE1A1A]">
                      by {loggedInAdminName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-[7px] grid grid-cols-2 gap-[7px]">
                <button
                  type="button"
                  onClick={() =>
                    window.open(
                      `/pages/${getCmsPageRouteKey(selectedPage)}/edit`,
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                  className="flex h-[29px] items-center justify-center gap-[6px] rounded-[5px] bg-[#1E104E] text-[8px] font-semibold text-white transition hover:opacity-90"
                >
                  <Pencil
                    className="h-[10px] w-[10px]"
                    strokeWidth={1.7}
                  />

                  Edit Page
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push(`/pages/${getCmsPageRouteKey(selectedPage)}`)
                  }
                  className="flex h-[29px] items-center justify-center gap-[6px] rounded-[5px] border border-orange-200 bg-orange-50 text-[8px] font-semibold text-[#303a50] transition hover:bg-orange-100"
                >
                  <ExternalLink
                    className="h-[10px] w-[10px]"
                    strokeWidth={1.7}
                  />

                  View Page
                </button>
              </div>
            </div>

            {/* TABS */}

            <div className="grid h-[42px] shrink-0 grid-cols-4 border-b border-[#ebebe7] bg-[#fbfcfa] px-[5px] py-[5px]">
              {([
                { key: "SEO", icon: Search },
                { key: "Content", icon: Layers },
                { key: "Performance", icon: CircleGauge },
                { key: "History", icon: Clock },
              ] as Array<{ key: DetailTab; icon: typeof Search }>).map(({ key, icon: TabIcon }) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`relative flex items-center justify-center gap-[4px] rounded-[6px] text-[10px] font-semibold transition-all ${activeTab === key
                      ? "bg-white text-[#293681] shadow-[0_1px_4px_rgba(15,23,42,0.08)] ring-1 ring-[#e5e7eb]"
                      : "text-[#747c89] hover:bg-white/70 hover:text-[#475467]"
                    }`}
                >
                  <TabIcon
                    className={`h-[10px] w-[10px] ${activeTab === key ? "text-[#bf8c25]" : "text-[#98a2b3]"}`}
                    strokeWidth={1.8}
                  />
                  {key}
                  {activeTab === key && (
                    <span className="absolute inset-x-[11px] bottom-[-5px] h-[1.5px] rounded-full bg-[#bf8c25]" />
                  )}
                </button>
              ))}
            </div>

            {/* =============================================
                SEO TAB — COMPLETE ON-PAGE SEO VIEW
            ============================================= */}

            {activeTab === "SEO" && (
              <div className="min-h-0 flex-1 overflow-y-auto bg-[#fcfcfb] p-[11px]">
                <div
                  className="overflow-hidden rounded-[9px] border border-[#e6e8e5] bg-white"
                  style={{
                    boxShadow:
                      "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.07) 0px 0px 0px 1px",
                  }}
                >
                  <div className="flex items-center justify-between border-b border-[#eceeea] bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_100%)] px-[10px] py-[7px]">
                    <div>
                      <p className="text-[10px] font-bold text-[#344054]">SEO Health Summary</p>
                      <p className="mt-[1px] text-[10px] font-medium text-[#8a93a2]">
                        Complete on-page SEO status for {selectedPage.title}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-[7px] py-[3px] text-[10px] font-bold ${selectedPage.seoScore >= 90
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                          : selectedPage.seoScore >= 75
                            ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
                            : "bg-amber-50 text-amber-700 ring-1 ring-amber-100"
                        }`}
                    >
                      {selectedPage.rating}
                    </span>
                  </div>

                  <div className="grid grid-cols-[122px_1fr]">
                    <div className="flex flex-col items-center justify-center border-r border-[#eceeea] px-[8px] py-[10px]">
                      <LargeSeoRing score={selectedPage.seoScore} />
                      <div className="mt-[7px] flex items-center gap-[5px]">
                        <span
                          className={`h-[5px] w-[5px] rounded-full ${selectedPage.seo?.robotsIndex === false ? "bg-rose-500" : "bg-emerald-500"
                            }`}
                        />
                        <span className="text-[10px] font-semibold text-[#667085]">
                          {selectedPage.seo?.robotsIndex === false ? "Not Indexable" : "Indexable"}
                        </span>
                      </div>
                    </div>

                    <div className="px-[10px] py-[8px]">
                      <p className="mb-[6px] text-[10px] font-bold uppercase tracking-[0.04em] text-[#98a2b3]">
                        SEO Checklist
                      </p>
                      <div className="space-y-[5px]">
                        {([
                          ["Meta Title", Boolean(selectedPage.seo?.metaTitle)],
                          ["Meta Description", Boolean(selectedPage.seo?.metaDescription)],
                          ["Focus Keywords", Boolean(selectedPage.seo?.metaKeywords)],
                          ["H1 Heading", Boolean(selectedPage.seo?.h1Tag)],
                          ["Canonical URL", Boolean(selectedPage.seo?.canonicalUrl) || Boolean(selectedPagePublicUrl)],
                          ["Internal Links", selectedPageHasInternalLinks],
                          ["Image Assets", selectedPageHasImages],
                          ["Schema Markup", Boolean(selectedPage.seo?.schemaMarkup)],
                          ["Indexing", selectedPage.seo?.robotsIndex !== false],
                        ] as Array<[string, boolean]>).map(([label, isGood]) => (
                          <div key={label} className="grid grid-cols-[12px_1fr_auto] items-center gap-[5px]">
                            <span
                              className={`grid h-[11px] w-[11px] place-items-center rounded-full ${isGood ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                                }`}
                            >
                              {isGood ? (
                                <CheckCircle2 className="h-[8px] w-[8px]" strokeWidth={2} />
                              ) : (
                                <X className="h-[7px] w-[7px]" strokeWidth={2} />
                              )}
                            </span>
                            <span className="truncate text-[10px] font-medium text-[#566177]">{label}</span>
                            <span className={`text-[10px] font-bold ${isGood ? "text-emerald-700" : "text-amber-700"}`}>
                              {isGood ? "Good" : "Review"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-[9px] rounded-[9px] border border-[#e6e8e5] bg-white p-[10px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-[#344054]">Search Result Preview</p>
                      <p className="mt-[1px] text-[10px] font-medium text-[#98a2b3]">Approximate search appearance</p>
                    </div>
                    <Search className="h-[12px] w-[12px] text-[#667085]" strokeWidth={1.7} />
                  </div>
                  <div className="mt-[8px] rounded-[7px] border border-[#edf0ec] bg-[#fbfcfa] p-[9px]">
                    <p className="truncate text-[10px] font-medium text-[#188038]">{selectedPagePublicUrl}</p>
                    <p className="mt-[3px] line-clamp-2 text-[10px] font-semibold leading-[1.35] text-[#1a0dab]">
                      {selectedPage.seo?.metaTitle || `${selectedPage.title} | Moksha Sewa`}
                    </p>
                    <p className="mt-[3px] line-clamp-3 text-[10px] font-normal leading-[1.45] text-[#4d5156]">
                      {selectedPage.seo?.metaDescription || "Meta description has not been added for this page yet."}
                    </p>
                  </div>
                </div>

                <div className="mt-[9px] overflow-hidden rounded-[9px] border border-[#e6e8e5] bg-white">
                  <div className="flex items-center justify-between border-b border-[#eceeea] px-[10px] py-[7px]">
                    <div>
                      <p className="text-[10px] font-bold text-[#344054]">Metadata &amp; Indexing</p>
                      <p className="mt-[1px] text-[10px] font-medium text-[#98a2b3]">All SEO fields currently available in CMS</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        window.open(
                          `/pages/${getCmsPageRouteKey(selectedPage)}/edit`,
                          "_blank",
                          "noopener,noreferrer",
                        )
                      }
                      className="rounded-[5px] border border-[#e3e4e0] bg-white px-[8px] py-[4px] text-[10px] font-semibold text-[#566176] transition hover:bg-[#f8fafc]"
                    >
                      Edit SEO
                    </button>
                  </div>

                  <div className="divide-y divide-[#f0f1ee] px-[10px]">
                    {[
                      {
                        label: "SEO Title",
                        value: selectedPage.seo?.metaTitle || "Not added yet",
                        meta: `${selectedPage.seo?.metaTitle?.length ?? 0} / 60`,
                      },
                      {
                        label: "Meta Description",
                        value: selectedPage.seo?.metaDescription || "Not added yet",
                        meta: `${selectedPage.seo?.metaDescription?.length ?? 0} / 160`,
                      },
                      {
                        label: "Focus Keywords",
                        value: selectedPage.seo?.metaKeywords || "Not added yet",
                        meta: selectedPage.seo?.metaKeywords ? "Configured" : "Missing",
                      },
                      {
                        label: "H1 Heading",
                        value: selectedPage.seo?.h1Tag || "Not added yet",
                        meta: selectedPage.seo?.h1Tag ? "Configured" : "Missing",
                      },
                      {
                        label: "Canonical URL",
                        value: selectedPage.seo?.canonicalUrl || selectedPagePublicUrl,
                        meta: "Canonical",
                      },
                    ].map((item) => (
                      <div key={item.label} className="grid grid-cols-[92px_1fr_auto] items-center gap-[7px] py-[7px]">
                        <span className="text-[10px] font-semibold text-[#667085]">{item.label}</span>
                        <span className="break-words text-[10px] font-medium text-[#344054]" title={item.value}>
                          {item.value}
                        </span>
                        <span className="text-[10px] font-bold text-[#667085]">{item.meta}</span>
                      </div>
                    ))}

                    <div className="grid grid-cols-3 gap-[6px] py-[8px]">
                      {[
                        [
                          "Index",
                          selectedPage.seo?.robotsIndex === false ? "No Index" : "Index",
                          selectedPage.seo?.robotsIndex === false
                            ? "bg-rose-50 text-rose-700"
                            : "bg-emerald-50 text-emerald-700",
                        ],
                        [
                          "Robots",
                          selectedPage.seo?.robotsIndex === false ? "noindex, follow" : "index, follow",
                          "bg-blue-50 text-blue-700",
                        ],
                        [
                          "Schema",
                          selectedPage.seo?.schemaMarkup ? "Added" : "Missing",
                          selectedPage.seo?.schemaMarkup
                            ? "bg-violet-50 text-violet-700"
                            : "bg-amber-50 text-amber-700",
                        ],
                      ].map(([label, value, styleClass]) => (
                        <div key={label} className="rounded-[6px] border border-[#edf0ec] bg-[#fbfcfa] px-[7px] py-[6px]">
                          <p className="text-[10px] font-semibold text-[#98a2b3]">{label}</p>
                          <span className={`mt-[4px] inline-flex rounded-full px-[6px] py-[2px] text-[10px] font-bold ${styleClass}`}>
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-[9px] rounded-[9px] border border-[#e6e8e5] bg-white p-[10px]">
                  <p className="text-[10px] font-bold text-[#344054]">SEO Content Signals</p>
                  <div className="mt-[7px] grid grid-cols-2 gap-[6px]">
                    {[
                      ["Page Status", selectedPageIsPublished ? "Published" : "Draft"],
                      ["Page Activity", selectedPageIsActive ? "Active" : "Inactive"],
                      ["Internal Links", selectedPageHasInternalLinks ? "Detected" : "Not Detected"],
                      ["Images", selectedPageHasImages ? `${contentStats.images} Found` : "No Images"],
                      ["Sections", String(contentStats.sections)],
                      ["CTA Blocks", String(contentStats.ctaBlocks)],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-[6px] border border-[#edf0ec] bg-[#fbfcfa] px-[8px] py-[6px]">
                        <p className="text-[10px] font-semibold text-[#98a2b3]">{label}</p>
                        <p className="mt-[2px] text-[10px] font-bold text-[#344054]">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <details className="mt-[9px] overflow-hidden rounded-[9px] border border-[#e6e8e5] bg-white">
                  <summary className="cursor-pointer px-[10px] py-[8px] text-[10px] font-bold text-[#344054]">
                    Complete SEO Data
                  </summary>
                  <div className="border-t border-[#eceeea] bg-[#fbfcfa] p-[9px]">
                    <pre className="max-h-[220px] overflow-auto whitespace-pre-wrap break-words text-[10px] leading-[1.45] text-[#475467]">
                      {JSON.stringify(
                        {
                          score: selectedPage.seoScore,
                          rating: selectedPage.rating,
                          publicUrl: selectedPagePublicUrl,
                          status: selectedPage.status,
                          active: selectedPageIsActive,
                          seo: selectedPage.seo ?? null,
                          internalLinksDetected: selectedPageHasInternalLinks,
                          imagesDetected: selectedPageHasImages,
                        },
                        null,
                        2,
                      )}
                    </pre>
                  </div>
                </details>
              </div>
            )}

            {/* =============================================
                CONTENT TAB — COMPLETE CMS CONTENT INVENTORY
            ============================================= */}

            {activeTab === "Content" && (
              <div className="min-h-0 flex-1 overflow-y-auto bg-[#fcfcfb] p-[11px]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[10px] font-bold text-[#26324a]">Content Architecture</h3>
                    <p className="mt-[1px] text-[10px] font-medium text-[#8a93a2]">
                      Everything stored in CMS for {selectedPage.title}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#eef2ff] px-[8px] py-[4px] text-[10px] font-bold text-[#293681] ring-1 ring-[#e0e7ff]">
                    {contentStats.sections} Sections
                  </span>
                </div>

                <div className="mt-[9px] grid grid-cols-2 gap-[7px]">
                  {[
                    { label: "Sections", value: String(contentStats.sections), icon: Layers, helper: "Page structure", iconClass: "bg-blue-50 text-blue-700" },
                    { label: "Text Blocks", value: String(contentStats.textBlocks), icon: FileText, helper: "Editable copy", iconClass: "bg-violet-50 text-violet-700" },
                    { label: "Images", value: String(contentStats.images), icon: ImageIcon, helper: "Visual assets", iconClass: "bg-emerald-50 text-emerald-700" },
                    { label: "CTA Blocks", value: String(contentStats.ctaBlocks), icon: MousePointerClick, helper: "Buttons / actions", iconClass: "bg-amber-50 text-amber-700" },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className="flex items-center gap-[8px] rounded-[8px] border border-[#e7e9e6] bg-white p-[9px]"
                        style={{
                          boxShadow:
                            "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.06) 0px 0px 0px 1px",
                        }}
                      >
                        <div className={`grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[7px] ${item.iconClass}`}>
                          <Icon className="h-[13px] w-[13px]" strokeWidth={1.8} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-end justify-between gap-[4px]">
                            <p className="truncate text-[10px] font-semibold text-[#667085]">{item.label}</p>
                            <p className="text-[17px] font-bold leading-none text-[#182238]">{item.value}</p>
                          </div>
                          <p className="mt-[3px] text-[10px] font-medium text-[#98a2b3]">{item.helper}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-[9px] rounded-[9px] border border-[#e6e8e5] bg-white p-[9px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-[#344054]">Content Readiness</p>
                      <p className="mt-[1px] text-[10px] font-medium text-[#98a2b3]">Important content signals</p>
                    </div>
                  </div>
                  <div className="mt-[7px] grid grid-cols-2 gap-[6px]">
                    {[
                      ["Visible Page", selectedPageIsActive ? "Yes" : "No", selectedPageIsActive],
                      ["Published", selectedPageIsPublished ? "Yes" : "No", selectedPageIsPublished],
                      ["Internal Links", selectedPageHasInternalLinks ? "Present" : "Missing", selectedPageHasInternalLinks],
                      ["Images", selectedPageHasImages ? "Present" : "Missing", selectedPageHasImages],
                      ["Meta Title", selectedPage.seo?.metaTitle ? "Present" : "Missing", Boolean(selectedPage.seo?.metaTitle)],
                      ["Meta Description", selectedPage.seo?.metaDescription ? "Present" : "Missing", Boolean(selectedPage.seo?.metaDescription)],
                    ].map(([label, value, good]) => (
                      <div key={String(label)} className="flex items-center justify-between rounded-[6px] border border-[#edf0ec] bg-[#fbfcfa] px-[8px] py-[6px]">
                        <span className="text-[10px] font-semibold text-[#667085]">{String(label)}</span>
                        <span className={`text-[10px] font-bold ${good ? "text-emerald-700" : "text-amber-700"}`}>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-[9px] overflow-hidden rounded-[9px] border border-[#e6e8e5] bg-white">
                  <div className="flex items-center justify-between border-b border-[#eceeea] bg-[#fbfcfa] px-[10px] py-[7px]">
                    <div className="flex items-center gap-[6px]">
                      <Layers className="h-[12px] w-[12px] text-[#293681]" />
                      <div>
                        <p className="text-[10px] font-bold text-[#344054]">Complete Section Inventory</p>
                        <p className="mt-[1px] text-[10px] font-medium text-[#98a2b3]">Open any section to see every saved field</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-[#667085]">{selectedPageSections.length} total</span>
                  </div>

                  <div className="divide-y divide-[#eceeea]">
                    {selectedPageSections.length > 0 ? (
                      selectedPageSections.map((section, index) => {
                        const sectionLabel =
                          section.title || section.heading || section.name || section.key || `Section ${index + 1}`;
                        const isEnabled = section.enabled !== false;
                        const entries = Object.entries(section).filter(([key]) => key !== "_id");

                        return (
                          <details key={String(section._id ?? section.key ?? `${sectionLabel}-${index}`)} className="group bg-white open:bg-[#fcfcfb]">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-[8px] px-[10px] py-[8px]">
                              <div className="flex min-w-0 items-center gap-[7px]">
                                <span className="grid h-[20px] w-[20px] shrink-0 place-items-center rounded-full bg-[#eef2ff] text-[10px] font-bold text-[#293681]">
                                  {index + 1}
                                </span>
                                <div className="min-w-0">
                                  <p className="truncate text-[10px] font-bold text-[#344054]">{String(sectionLabel)}</p>
                                  <p className="mt-[1px] text-[10px] font-medium text-[#98a2b3]">
                                    {entries.length} fields · {(section.items ?? []).length} items · {(section.slides ?? []).length} slides
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-[6px]">
                                <span className={`rounded-full px-[6px] py-[2px] text-[10px] font-bold ${isEnabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                                  {isEnabled ? "Visible" : "Hidden"}
                                </span>
                                <ChevronDown className="h-[11px] w-[11px] text-[#98a2b3] transition group-open:rotate-180" />
                              </div>
                            </summary>

                            <div className="border-t border-[#eef0ed] bg-[#fbfcfa] px-[10px] py-[7px]">
                              <div className="space-y-[5px]">
                                {entries.map(([key, value]) => {
                                  const label = key
                                    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
                                    .replace(/[_-]+/g, " ")
                                    .replace(/\b\w/g, (char) => char.toUpperCase());

                                  const primitive =
                                    value == null
                                      ? "—"
                                      : typeof value === "boolean"
                                        ? value
                                          ? "Yes"
                                          : "No"
                                        : typeof value === "string" || typeof value === "number"
                                          ? String(value) || "—"
                                          : null;

                                  return (
                                    <div key={key} className="grid grid-cols-[104px_1fr] gap-[8px] rounded-[6px] border border-[#edf0ec] bg-white px-[8px] py-[6px]">
                                      <span className="break-words text-[10px] font-semibold text-[#667085]">{label}</span>
                                      {primitive !== null ? (
                                        IMAGE_FIELD_PATTERN.test(key) && typeof value === "string" && value ? (
                                          <div className="min-w-0">
                                            <p className="break-all text-[10px] font-medium text-[#344054]">{primitive}</p>
                                            <button
                                              type="button"
                                              onClick={() => window.open(String(value), "_blank", "noopener,noreferrer")}
                                              className="mt-[3px] inline-flex items-center gap-[4px] text-[10px] font-bold text-blue-600 hover:underline"
                                            >
                                              Open asset <ExternalLink className="h-[8px] w-[8px]" />
                                            </button>
                                          </div>
                                        ) : typeof value === "string" && value.startsWith("/") ? (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              window.open(
                                                `${PUBLIC_SITE_URL.replace(/\/+$/, "")}${value}`,
                                                "_blank",
                                                "noopener,noreferrer",
                                              )
                                            }
                                            className="min-w-0 break-all text-left text-[10px] font-medium text-blue-600 hover:underline"
                                          >
                                            {primitive}
                                          </button>
                                        ) : (
                                          <span className="min-w-0 break-words text-[10px] font-medium leading-[1.45] text-[#344054]">{primitive}</span>
                                        )
                                      ) : (
                                        <pre className="max-h-[180px] overflow-auto whitespace-pre-wrap break-words rounded-[5px] bg-[#f8fafc] p-[6px] text-[10px] leading-[1.45] text-[#475467]">
                                          {JSON.stringify(value, null, 2)}
                                        </pre>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </details>
                        );
                      })
                    ) : (
                      <div className="py-[20px] text-center">
                        <FileText className="mx-auto h-[18px] w-[18px] text-slate-300" />
                        <p className="mt-[5px] text-[10px] font-medium text-[#8a93a2]">No sections available for this page.</p>
                      </div>
                    )}
                  </div>
                </div>

                <details className="mt-[9px] overflow-hidden rounded-[9px] border border-[#e6e8e5] bg-white">
                  <summary className="cursor-pointer px-[10px] py-[8px] text-[10px] font-bold text-[#344054]">
                    Complete Page CMS Data
                  </summary>
                  <div className="border-t border-[#eceeea] bg-[#fbfcfa] p-[9px]">
                    <pre className="max-h-[300px] overflow-auto whitespace-pre-wrap break-words text-[10px] leading-[1.45] text-[#475467]">
                      {JSON.stringify(selectedPageConfig ?? {}, null, 2)}
                    </pre>
                  </div>
                </details>
              </div>
            )}

            {/* =============================================
                PERFORMANCE TAB — ALL AVAILABLE + INTEGRATION SLOTS
            ============================================= */}

            {activeTab === "Performance" && (
              <div className="min-h-0 flex-1 overflow-y-auto bg-[#fcfcfb] p-[11px]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[10px] font-bold text-[#26324a]">Page Performance</h3>
                    <p className="mt-[1px] text-[10px] font-medium text-[#8a93a2]">
                      Available signals and measurement readiness
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {(pageSpeedData || dashboardPageSpeed)?.score != null && (
                      <span className="rounded-full bg-emerald-50 px-[8px] py-[4px] text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-100">
                        Score: {(pageSpeedData || dashboardPageSpeed)?.score}/100
                      </span>
                    )}
                    
                    <button
                      onClick={runPageSpeedTest}
                      disabled={isFetchingPageSpeed}
                      className="flex items-center gap-[4px] rounded-full bg-blue-50 px-[8px] py-[4px] text-[10px] font-bold text-blue-700 ring-1 ring-blue-100 transition hover:bg-blue-100 disabled:opacity-50"
                    >
                      {isFetchingPageSpeed ? <Loader2 className="h-[10px] w-[10px] animate-spin" /> : <Play className="h-[10px] w-[10px]" />}
                      {isFetchingPageSpeed ? "Running Test..." : "Run Test"}
                    </button>
                  </div>
                </div>

                {pageSpeedError && (
                  <div className="mt-[9px] rounded-[6px] bg-rose-50 p-[8px] text-[10px] font-medium text-rose-700">
                    {pageSpeedError}. Make sure the URL ({selectedPagePublicUrl}) is publicly accessible.
                  </div>
                )}

                <div className="mt-[9px] grid grid-cols-3 gap-[7px]">
                  {(() => {
                    const activeSpeed = pageSpeedData || dashboardPageSpeed;
                    return [
                      ["LCP", activeSpeed?.lcp || "—", activeSpeed ? (activeSpeed.lcp !== "No Data" ? "Measured" : "No Data") : "Not Connected", activeSpeed && activeSpeed.lcp !== "No Data" ? "text-emerald-700" : "text-amber-700"],
                      ["INP", activeSpeed?.inp || "—", activeSpeed ? (activeSpeed.inp !== "No Data" ? "Measured" : "Requires Field Data") : "Not Connected", activeSpeed && activeSpeed.inp !== "No Data" ? "text-emerald-700" : "text-amber-700"],
                      ["CLS", activeSpeed?.cls || "—", activeSpeed ? (activeSpeed.cls !== "No Data" ? "Measured" : "No Data") : "Not Connected", activeSpeed && activeSpeed.cls !== "No Data" ? "text-emerald-700" : "text-amber-700"],
                      ["FCP", activeSpeed?.fcp || "—", activeSpeed ? (activeSpeed.fcp !== "No Data" ? "Measured" : "No Data") : "Not Connected", activeSpeed && activeSpeed.fcp !== "No Data" ? "text-emerald-700" : "text-amber-700"],
                      ["TTFB", activeSpeed?.ttfb || "—", activeSpeed ? (activeSpeed.ttfb !== "No Data" ? "Measured" : "No Data") : "Not Connected", activeSpeed && activeSpeed.ttfb !== "No Data" ? "text-emerald-700" : "text-amber-700"],
                      ["TBT", activeSpeed?.tbt || "—", activeSpeed ? (activeSpeed.tbt !== "No Data" ? "Measured" : "No Data") : "Not Connected", activeSpeed && activeSpeed.tbt !== "No Data" ? "text-emerald-700" : "text-amber-700"],
                    ].map(([label, value, status, statusColor]) => (
                      <div
                        key={label}
                        className="rounded-[7px] border border-[#e7e9e6] bg-white px-[9px] py-[9px]"
                        style={{
                          boxShadow:
                            "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.06) 0px 0px 0px 1px",
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-[#667085]">{label}</span>
                          <CircleGauge className="h-[11px] w-[11px] text-[#98a2b3]" />
                        </div>
                        <p className="mt-[5px] text-[18px] font-bold leading-none text-[#182238]">{value}</p>
                        <p className={`mt-[4px] text-[10px] font-semibold ${statusColor}`}>{status}</p>
                      </div>
                    ));
                  })()}
                </div>

                {!(pageSpeedData || dashboardPageSpeed) && !isFetchingPageSpeed && (
                  <div className="mt-[9px] rounded-[9px] border border-[#dbeafe] bg-[#eff6ff] p-[9px]">
                    <div className="flex items-start gap-[7px]">
                      <CircleGauge className="mt-[1px] h-[13px] w-[13px] shrink-0 text-blue-700" />
                      <div>
                        <p className="text-[10px] font-bold text-blue-900">Performance data availability</p>
                        <p className="mt-[3px] text-[10px] font-medium leading-[1.45] text-blue-800">
                          Click <strong>Run Test</strong> to fetch live performance data from Google PageSpeed Insights. Note that this runs a Lighthouse audit against the public URL.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-[9px] rounded-[9px] border border-[#e6e8e5] bg-white p-[9px]">
                  <p className="text-[10px] font-bold text-[#344054]">Current CMS Performance Signals</p>
                  <p className="mt-[1px] text-[10px] font-medium text-[#98a2b3]">Real values available without inventing Core Web Vitals</p>
                  <div className="mt-[7px] grid grid-cols-2 gap-[6px]">
                    {[
                      ["SEO Readiness", `${selectedPage.seoScore}/100`, selectedPage.seoScore >= 75],
                      ["Publishing", selectedPageIsPublished ? "Published" : "Draft", selectedPageIsPublished],
                      ["Live State", selectedPageIsActive ? "Active" : "Inactive", selectedPageIsActive],
                      ["Internal Links", selectedPageHasInternalLinks ? "Detected" : "Not Detected", selectedPageHasInternalLinks],
                      ["Images", `${contentStats.images} Assets`, contentStats.images > 0],
                      ["Sections", `${contentStats.sections} Sections`, contentStats.sections > 0],
                      ["CTA Coverage", `${contentStats.ctaBlocks} CTA Blocks`, contentStats.ctaBlocks > 0],
                      ["Indexability", selectedPage.seo?.robotsIndex === false ? "No Index" : "Indexable", selectedPage.seo?.robotsIndex !== false],
                    ].map(([label, value, good]) => (
                      <div key={String(label)} className="rounded-[6px] border border-[#edf0ec] bg-[#fbfcfa] px-[8px] py-[6px]">
                        <p className="text-[10px] font-semibold text-[#98a2b3]">{String(label)}</p>
                        <div className="mt-[2px] flex items-center justify-between gap-[5px]">
                          <p className="text-[10px] font-bold text-[#344054]">{String(value)}</p>
                          <span className={`h-[6px] w-[6px] rounded-full ${good ? "bg-emerald-500" : "bg-amber-500"}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-[9px] overflow-hidden rounded-[9px] border border-[#e6e8e5] bg-white">
                  <div className="border-b border-[#eceeea] px-[10px] py-[7px]">
                    <p className="text-[10px] font-bold text-[#344054]">What Can Be Tracked Here</p>
                    <p className="mt-[1px] text-[10px] font-medium text-[#98a2b3]">Recommended integrations for complete page performance</p>
                  </div>
                  <div className="divide-y divide-[#f0f1ee] px-[10px]">
                    {[
                      ["Google PageSpeed / Lighthouse", "LCP, FCP, TBT, Speed Index, performance score"],
                      ["Chrome UX Report / RUM", "Field LCP, INP, CLS from real visitors"],
                      ["Analytics", "Page views, users, engagement, bounce / exit signals"],
                      ["Search Console", "Clicks, impressions, CTR, average position by page"],
                      ["Uptime Monitoring", "Availability, response time and HTTP status"],
                    ].map(([name, description]) => (
                      <div key={name} className="grid grid-cols-[116px_1fr_auto] items-center gap-[7px] py-[7px]">
                        <span className="text-[10px] font-semibold text-[#667085]">{name}</span>
                        <span className="text-[10px] font-medium leading-[1.4] text-[#475467]">{description}</span>
                        <span className="rounded-full bg-slate-100 px-[6px] py-[2px] text-[10px] font-bold text-slate-600">Required</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-[9px] rounded-[9px] border border-[#dbeafe] bg-[#eff6ff] p-[9px]">
                  <div className="flex items-start gap-[7px]">
                    <CircleGauge className="mt-[1px] h-[13px] w-[13px] shrink-0 text-blue-700" />
                    <div>
                      <p className="text-[10px] font-bold text-blue-900">Performance data availability</p>
                      <p className="mt-[3px] text-[10px] font-medium leading-[1.45] text-blue-800">
                        The current page record does not contain measured Core Web Vitals. Therefore this tab shows all CMS-side readiness signals and clearly marks measurement fields as not connected instead of displaying fake numbers.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => window.open(selectedPagePublicUrl, "_blank", "noopener,noreferrer")}
                  className="mt-[9px] flex h-[30px] w-full items-center justify-center gap-[6px] rounded-[6px] border border-[#dbeafe] bg-white text-[10px] font-bold text-blue-700 transition hover:bg-blue-50"
                >
                  Open Live Page <ExternalLink className="h-[10px] w-[10px]" />
                </button>
              </div>
            )}

            {/* =============================================
                HISTORY TAB — COMPLETE AVAILABLE AUDIT SNAPSHOT
            ============================================= */}

            {activeTab === "History" && (
              <div className="min-h-0 flex-1 overflow-y-auto bg-[#fcfcfb] p-[11px]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[10px] font-bold text-[#26324a]">Page History &amp; Audit</h3>
                    <p className="mt-[1px] text-[10px] font-medium text-[#8a93a2]">All history information currently available</p>
                  </div>
                  <span
                    className={`rounded-full px-[8px] py-[4px] text-[10px] font-bold ${selectedPageIsPublished
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                        : "bg-amber-50 text-amber-700 ring-1 ring-amber-100"
                      }`}
                  >
                    {selectedPageIsPublished ? "Published" : "Draft"}
                  </span>
                </div>

                <div className="mt-[9px] grid grid-cols-2 gap-[7px]">
                  {[
                    ["Current Status", selectedPage.status],
                    ["Page State", selectedPageIsActive ? "Active" : "Inactive"],
                    ["Updated By", loggedInAdminName],
                    ["Last Updated", selectedPage.updated],
                    ["Page Type", selectedPage.type],
                    ["SEO Score", `${selectedPage.seoScore}/100`],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-[7px] border border-[#e7e9e6] bg-white px-[8px] py-[7px]">
                      <p className="text-[10px] font-semibold text-[#98a2b3]">{label}</p>
                      <p className="mt-[2px] break-words text-[10px] font-bold text-[#344054]">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-[9px] overflow-hidden rounded-[9px] border border-[#e6e8e5] bg-white">
                  <div className="border-b border-[#eceeea] px-[10px] py-[7px]">
                    <p className="text-[10px] font-bold text-[#344054]">Activity Timeline</p>
                    <p className="mt-[1px] text-[10px] font-medium text-[#98a2b3]">Latest real state recorded by the current backend</p>
                  </div>
                  <div className="p-[10px]">
                    <div className="relative pl-[22px]">
                      <span className="absolute left-[4px] top-[4px] h-[8px] w-[8px] rounded-full bg-[#293681] ring-[3px] ring-[#eef2ff]" />
                      <span className="absolute bottom-[-24px] left-[7px] top-[14px] w-px bg-[#e4e7ec]" />
                      <p className="text-[10px] font-bold text-[#344054]">Page updated</p>
                      <p className="mt-[2px] text-[10px] font-medium text-[#667085]">{selectedPage.updated}</p>
                      <p className="mt-[2px] text-[10px] font-semibold text-[#BE1A1A]">by {loggedInAdminName}</p>
                    </div>

                    <div className="relative mt-[19px] pl-[22px]">
                      <span
                        className={`absolute left-[4px] top-[4px] h-[8px] w-[8px] rounded-full ring-[3px] ${selectedPageIsPublished
                            ? "bg-emerald-500 ring-emerald-50"
                            : "bg-amber-500 ring-amber-50"
                          }`}
                      />
                      <span className="absolute bottom-[-24px] left-[7px] top-[14px] w-px bg-[#e4e7ec]" />
                      <p className="text-[10px] font-bold text-[#344054]">Current publishing state</p>
                      <p className={`mt-[2px] text-[10px] font-semibold ${selectedPageIsPublished ? "text-emerald-700" : "text-amber-700"}`}>
                        {selectedPageIsPublished ? "Published and available on live site" : "Not published · stored as draft"}
                      </p>
                    </div>

                    <div className="relative mt-[19px] pl-[22px]">
                      <span className={`absolute left-[4px] top-[4px] h-[8px] w-[8px] rounded-full ring-[3px] ${selectedPageIsActive ? "bg-blue-500 ring-blue-50" : "bg-rose-500 ring-rose-50"}`} />
                      <p className="text-[10px] font-bold text-[#344054]">Current live state</p>
                      <p className={`mt-[2px] text-[10px] font-semibold ${selectedPageIsActive ? "text-blue-700" : "text-rose-700"}`}>
                        {selectedPageIsActive ? "Active" : "Inactive"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-[9px] overflow-hidden rounded-[9px] border border-[#e6e8e5] bg-white">
                  <div className="border-b border-[#eceeea] px-[10px] py-[7px]">
                    <p className="text-[10px] font-bold text-[#344054]">Current Page Snapshot</p>
                  </div>
                  <div className="divide-y divide-[#f0f1ee] px-[10px]">
                    {[
                      ["Page ID", String(selectedPage.id)],
                      ["Title", selectedPage.title],
                      ["Slug", selectedPage.slug],
                      ["Full URL", selectedPagePublicUrl],
                      ["Author", selectedPage.author],
                      ["Current Admin", loggedInAdminName],
                      ["Updated By", selectedPage.updatedBy || loggedInAdminName],
                      ["Config Key", selectedPage.configKey || "—"],
                      ["Type", selectedPage.type],
                      ["Status", selectedPage.status],
                      ["SEO Rating", selectedPage.rating],
                    ].map(([label, value]) => (
                      <div key={label} className="grid grid-cols-[92px_1fr] gap-[8px] py-[6px]">
                        <span className="text-[10px] font-semibold text-[#98a2b3]">{label}</span>
                        {label === "Full URL" ? (
                          <button
                            type="button"
                            onClick={() => window.open(selectedPagePublicUrl, "_blank", "noopener,noreferrer")}
                            className="break-all text-left text-[10px] font-semibold text-blue-600 hover:underline"
                          >
                            {value}
                          </button>
                        ) : (
                          <span className="break-words text-[10px] font-medium text-[#344054]">{value}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-[9px] rounded-[9px] border border-amber-200 bg-amber-50/70 p-[9px]">
                  <div className="flex items-start gap-[7px]">
                    <Clock className="mt-[1px] h-[12px] w-[12px] shrink-0 text-amber-700" />
                    <div>
                      <p className="text-[10px] font-bold text-amber-900">Revision history availability</p>
                      <p className="mt-[3px] text-[10px] font-medium leading-[1.45] text-amber-800">
                        The current backend stores the latest page state and latest update metadata, but it does not provide a full revision-by-revision change log. When version history is added, this area can show each edit, publish/unpublish event, changed fields, editor, timestamp and restore action.
                      </p>
                    </div>
                  </div>
                </div>

                <details className="mt-[9px] overflow-hidden rounded-[9px] border border-[#e6e8e5] bg-white">
                  <summary className="cursor-pointer px-[10px] py-[8px] text-[10px] font-bold text-[#344054]">Complete Current Page Record</summary>
                  <div className="border-t border-[#eceeea] bg-[#fbfcfa] p-[9px]">
                    <pre className="max-h-[250px] overflow-auto whitespace-pre-wrap break-words text-[10px] leading-[1.45] text-[#475467]">
                      {JSON.stringify(selectedPage, null, 2)}
                    </pre>
                  </div>
                </details>
              </div>
            )}

          </aside>
        </div>
      </div>

      {/* CUSTOM TOAST ALERT */}
      {toastMessage && (
        <div className={`fixed right-6 top-8 z-50 flex items-center gap-[12px] rounded-[8px] px-[16px] py-[12px] shadow-lg ring-1 transition-all duration-300 animate-in fade-in slide-in-from-top-8 ${toastMessage.type === "success"
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
          : "bg-rose-50 text-rose-700 ring-rose-200"
          }`}>
          <div className={`grid h-[24px] w-[24px] shrink-0 place-items-center rounded-full bg-white shadow-sm ${toastMessage.type === "success" ? "text-emerald-600" : "text-rose-600"
            }`}>
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="h-[14px] w-[14px]" strokeWidth={2.5} />
            ) : (
              <X className="h-[14px] w-[14px]" strokeWidth={2.5} />
            )}
          </div>
          <p className="text-[12.5px] font-semibold">
            {toastMessage.title}
          </p>
        </div>
      )}
    </div>
  );
}
