"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Ban,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  ClipboardList,
  Copy,
  ExternalLink,
  Eye,
  Filter,
  FileClock,
  FilePenLine,
  FormInput,
  Headphones,
  MoreHorizontal,
  MousePointerClick,
  Plus,
  Search,
  Send,
  Settings2,
  Sprout,
  Users,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import Swal from "sweetalert2";
import typography from "../pages/PagesTypography.module.css";

/* =========================================================
   TYPES & MOCK DATA
   No careers/jobs backend exists yet - this page is the UI
   shell wired to static data shaped like the real thing, so
   swapping in a jobsApi later only touches the data source.
========================================================= */

type JobStatus = "Active" | "Draft" | "Closed";

interface JobPosting {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  openings: number;
  views: number;
  applications: number;
  status: JobStatus;
  closingDate: string;
}

const JOBS: JobPosting[] = [
  { id: 1, title: "Sales Manager – Domestic Exhibition Sales & Sponsorships", department: "Sales", location: "Delhi NCR", type: "Full Time", openings: 2, views: 1824, applications: 138, status: "Active", closingDate: "30 Nov 2026" },
  { id: 2, title: "Marketing Executive", department: "Marketing", location: "Delhi NCR", type: "Full Time", openings: 3, views: 1256, applications: 96, status: "Active", closingDate: "15 Oct 2026" },
  { id: 3, title: "Graphic Designer", department: "Design", location: "Delhi NCR", type: "Full Time", openings: 1, views: 980, applications: 74, status: "Active", closingDate: "10 Oct 2026" },
  { id: 4, title: "Content Writer", department: "Marketing", location: "Remote", type: "Part Time", openings: 2, views: 856, applications: 68, status: "Draft", closingDate: "" },
  { id: 5, title: "Event Coordinator", department: "Operations", location: "Delhi NCR", type: "Full Time", openings: 2, views: 1120, applications: 92, status: "Active", closingDate: "20 Oct 2026" },
  { id: 6, title: "Business Development Manager", department: "Sales", location: "Mumbai", type: "Full Time", openings: 2, views: 620, applications: 46, status: "Draft", closingDate: "" },
  { id: 7, title: "Social Media Executive", department: "Marketing", location: "Delhi NCR", type: "Full Time", openings: 1, views: 540, applications: 38, status: "Active", closingDate: "18 Oct 2026" },
  { id: 8, title: "HR Executive", department: "HR", location: "Delhi NCR", type: "Full Time", openings: 1, views: 410, applications: 26, status: "Closed", closingDate: "05 Sep 2026" },
  { id: 9, title: "Accounts Executive", department: "Finance", location: "Delhi NCR", type: "Full Time", openings: 1, views: 380, applications: 22, status: "Closed", closingDate: "31 Aug 2026" },
  { id: 10, title: "Video Editor", department: "Design", location: "Remote", type: "Freelance", openings: 2, views: 460, applications: 34, status: "Active", closingDate: "28 Oct 2026" },
  { id: 11, title: "Finance Manager", department: "Finance", location: "Delhi NCR", type: "Full Time", openings: 1, views: 295, applications: 18, status: "Closed", closingDate: "12 Aug 2026" },
  { id: 12, title: "Office Assistant", department: "Operations", location: "Delhi NCR", type: "Full Time", openings: 1, views: 210, applications: 12, status: "Closed", closingDate: "02 Aug 2026" },
];

const STATUS_STYLES: Record<JobStatus, string> = {
  Active: "bg-[#e8f5e9] text-[#23714a] border border-[#a5d6a7]",
  Draft: "bg-[#fff3e0] text-[#b45309] border border-[#ffcc80]",
  Closed: "bg-[#fee2e2] text-[#dc2626] border border-[#fca5a5]",
};

const TABS: { key: "all" | "active" | "draft" | "closed"; label: string }[] = [
  { key: "all", label: "All Jobs" },
  { key: "active", label: "Active" },
  { key: "draft", label: "Draft" },
  { key: "closed", label: "Closed" },
];

const QUICK_ACTIONS: { label: string; icon: LucideIcon }[] = [
  { label: "Add New Job", icon: Plus },
  { label: "Edit Job Content", icon: FilePenLine },
  { label: "Publish / Unpublish", icon: Send },
  { label: "Duplicate Job", icon: Copy },
  { label: "Close Vacancy", icon: Ban },
  { label: "Manage Application Form", icon: FormInput },
  { label: "View Applications", icon: Users },
  { label: "Career Settings", icon: Settings2 },
];

const PAGE_SIZE = 10;

/* =========================================================
   TOAST HELPER
========================================================= */

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2200,
  timerProgressBar: true,
  background: "#1e2433",
  color: "#e2e8f0",
});

function notImplemented(action: string) {
  Toast.fire({ icon: "info", iconColor: "#38bdf8", title: `${action} — coming soon` });
}

/* =========================================================
   STAT CARDS (matching the Media Library / Testimonials / Feedback
   & Reviews pages' metric-card style)
========================================================= */

const toneClass = {
  slate: "bg-slate-50 text-slate-700 ring-slate-200",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  blue: "bg-sky-50 text-sky-700 ring-sky-200",
  rose: "bg-rose-50 text-rose-700 ring-rose-200",
  teal: "bg-teal-50 text-teal-700 ring-teal-200",
} as const;

interface StatCardItem {
  title: string;
  value: string | number;
  suffix?: string;
  icon: LucideIcon;
  tone: keyof typeof toneClass;
  gradient: string;
  borderColor: string;
  numColor: string;
  trend?: string;
  footer: string;
  onClick: () => void;
}

function AnimatedCounter({ value, duration = 1200 }: { value: string | number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState<string>("0");
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const strVal = String(value);
    const numericMatch = strVal.match(/^([^0-9]*)([0-9.,]+)([^0-9]*)$/);

    if (!numericMatch) {
      setDisplayValue(strVal);
      return;
    }

    const prefix = numericMatch[1];
    const rawNumberStr = numericMatch[2].replace(/,/g, "");
    const targetNum = parseFloat(rawNumberStr);
    const suffix = numericMatch[3];

    if (isNaN(targetNum)) {
      setDisplayValue(strVal);
      return;
    }

    if (targetNum === 0) {
      setDisplayValue(`${prefix}0${suffix}`);
      return;
    }

    const hasComma = numericMatch[2].includes(",");
    const decimalPlaces = (rawNumberStr.split(".")[1] || "").length;

    let animationFrameId: number | null = null;

    const startCounting = () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      let startTime: number | null = null;

      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentNum = targetNum * easeProgress;
        let formattedNum = currentNum.toFixed(decimalPlaces);

        if (hasComma) {
          const parts = formattedNum.split(".");
          parts[0] = parseInt(parts[0], 10).toLocaleString();
          formattedNum = parts.join(".");
        }

        setDisplayValue(`${prefix}${formattedNum}${suffix}`);

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(step);
        }
      };

      animationFrameId = requestAnimationFrame(step);
    };

    if (typeof IntersectionObserver !== "undefined") {
      const el = spanRef.current;
      if (!el) {
        startCounting();
        return;
      }
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              startCounting();
            } else {
              setDisplayValue(`${prefix}0${suffix}`);
            }
          });
        },
        { threshold: 0.15 }
      );

      observer.observe(el);

      return () => {
        observer.disconnect();
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
      };
    } else {
      startCounting();
      return () => {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
      };
    }
  }, [value, duration]);

  return <span ref={spanRef}>{displayValue}</span>;
}

/* =========================================================
   JOB POSTINGS PAGE
========================================================= */

export default function JobPostingsPage() {
  const [tab, setTab] = useState<"all" | "active" | "draft" | "closed">("all");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [location, setLocation] = useState("All Locations");
  const [page, setPage] = useState(1);

  const counts = useMemo(
    () => ({
      all: JOBS.length,
      active: JOBS.filter((j) => j.status === "Active").length,
      draft: JOBS.filter((j) => j.status === "Draft").length,
      closed: JOBS.filter((j) => j.status === "Closed").length,
    }),
    []
  );

  const departments = useMemo(
    () => ["All Departments", ...Array.from(new Set(JOBS.map((j) => j.department))).sort()],
    []
  );
  const locations = useMemo(
    () => ["All Locations", ...Array.from(new Set(JOBS.map((j) => j.location))).sort()],
    []
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return JOBS.filter((job) => {
      if (tab !== "all" && job.status.toLowerCase() !== tab) return false;
      if (department !== "All Departments" && job.department !== department) return false;
      if (location !== "All Locations" && job.location !== location) return false;
      if (q && !job.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [tab, department, location, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, filtered.length);
  const paginatedJobs = filtered.slice(startIndex, endIndex);

  const changeTab = (next: typeof tab) => {
    setTab(next);
    setPage(1);
  };

  const statCards: StatCardItem[] = useMemo(
    () => [
      {
        title: "TOTAL JOBS",
        value: JOBS.length,
        icon: Briefcase,
        tone: "slate",
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #e2e8f0 100%)",
        borderColor: "#e2e8f0",
        numColor: "#334155",
        footer: "View all jobs",
        onClick: () => changeTab("all"),
      },
      {
        title: "ACTIVE JOBS",
        value: counts.active,
        icon: CheckCircle2,
        tone: "emerald",
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #bbf7d0 100%)",
        borderColor: "#bbf7d0",
        numColor: "#15803d",
        footer: "View active jobs",
        onClick: () => changeTab("active"),
      },
      {
        title: "DRAFT JOBS",
        value: counts.draft,
        icon: FileClock,
        tone: "amber",
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #fed7aa 100%)",
        borderColor: "#fed7aa",
        numColor: "#c2410c",
        footer: "View drafts",
        onClick: () => changeTab("draft"),
      },
      {
        title: "CLOSED JOBS",
        value: counts.closed,
        icon: XCircle,
        tone: "rose",
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #fecdd3 100%)",
        borderColor: "#fecdd3",
        numColor: "#be123c",
        footer: "View closed jobs",
        onClick: () => changeTab("closed"),
      },
      {
        title: "TOTAL PAGE VIEWS",
        value: "18,420",
        icon: Eye,
        tone: "blue",
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #bae6fd 100%)",
        borderColor: "#bae6fd",
        numColor: "#0284c7",
        trend: "↑ 32% vs last month",
        footer: "View page analytics",
        onClick: () => notImplemented("Page view analytics"),
      },
      {
        title: "TOTAL APPLY CLICKS",
        value: "2,860",
        icon: MousePointerClick,
        tone: "violet",
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #ddd6fe 100%)",
        borderColor: "#ddd6fe",
        numColor: "#6d28d9",
        trend: "↑ 28% vs last month",
        footer: "View click analytics",
        onClick: () => notImplemented("Apply click analytics"),
      },
      {
        title: "TOTAL APPLICATIONS",
        value: "1,124",
        icon: ClipboardList,
        tone: "teal",
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #99f6e4 100%)",
        borderColor: "#99f6e4",
        numColor: "#0f766e",
        trend: "↑ 24% vs last month",
        footer: "View applications",
        onClick: () => notImplemented("Applications list"),
      },
    ],
    [counts]
  );

  return (
    <div className={`${typography.pages} min-h-[calc(100vh-100px)] w-full bg-white text-[#18233b]`}>
      <div className="flex min-h-full flex-col px-[18px] pb-[16px] pt-[14px]">
        {/* =================================================
            HEADER
        ================================================= */}
        <div className="mb-[14px] flex flex-wrap items-start justify-between gap-[10px] border-b-[2px] border-[#293681] pb-[10px]">
          <div>
            <h1 className="text-[19px] font-bold leading-[1.15] tracking-[-0.018em] text-[#23471d]">
              Job Postings
            </h1>
            <p className="mt-0.5 text-[9px] font-medium text-[#6c7587]">
              Create, manage and publish job openings on your website.
            </p>
          </div>

          <div className="flex items-center gap-[10px]">
            {/* ADD NEW JOB */}
            <button
              type="button"
              onClick={() => notImplemented("Add New Job")}
              className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] bg-[#4B1426] px-[14px] text-[8.5px] font-semibold text-white shadow-[0_5px_12px_rgba(75,20,38,0.25)] transition hover:bg-[#3a0f1d] active:scale-95"
            >
              <Plus className="h-[12px] w-[12px]" strokeWidth={1.7} />
              Add New Job
            </button>
          </div>
        </div>

        {/* =================================================
            STATS ROW
        ================================================= */}
        <div className="mb-[12px] grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-7">
          {statCards.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="relative flex h-[98px] flex-col overflow-hidden rounded-[11px] border border-[#e5e7e6] bg-white p-2 !pb-5.5 transition-all hover:translate-y-[-1px]"
                style={{
                  background: item.gradient,
                  borderColor: item.borderColor || undefined,
                  boxShadow:
                    "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
                }}
              >
                <div className="flex items-start gap-1.5">
                  <div
                    className={`grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full ring-1 bg-white/80 shadow-xs ${
                      toneClass[item.tone]
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-[8.5px] !font-semibold tracking-[0.01em] text-slate-900"
                      style={{ fontWeight: 600, color: "#0f172a" }}
                    >
                      {item.title}
                    </p>

                    <div className="mt-1.5 flex items-end justify-between">
                      <div className="flex items-end gap-1">
                        <span
                          className="text-[21px] !font-semibold leading-none tracking-[-0.04em]"
                          style={{ color: item.numColor, fontWeight: 600 }}
                        >
                          <AnimatedCounter value={item.value} />
                        </span>

                        {item.suffix && (
                          <span className="mb-0.5 text-[9.5px] font-bold text-[#64748b]">
                            {item.suffix}
                          </span>
                        )}
                      </div>

                      {item.trend && (
                        <span
                          className={`mb-0.5 text-[7.5px] font-bold flex items-center gap-0.5 ${
                            item.trend.startsWith("↓") ? "text-[#dc2626]" : "text-[#16a34a]"
                          }`}
                        >
                          {item.trend.split(" ")[0]} {item.trend.split(" ")[1]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  onClick={item.onClick}
                  className="absolute bottom-1 left-2 right-2 flex cursor-pointer items-center justify-center gap-1 text-[8px] font-semibold text-[#293957] transition hover:text-blue-600"
                >
                  {item.footer}
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            );
          })}
        </div>

        {/* =================================================
            MAIN GRID
        ================================================= */}
        <div className="grid flex-1 grid-cols-1 items-start gap-[10px] xl:grid-cols-[minmax(0,2.6fr)_minmax(260px,1fr)]">
          {/* =============================================
              LEFT: TABLE CARD
          ============================================= */}
          <div className="flex min-w-0 flex-col overflow-hidden border border-[#e8e5df] bg-white">
            {/* TABS */}
            <div className="flex flex-wrap items-center gap-[20px] border-b border-[#e8e5df] px-[16px] pt-[11px]">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => changeTab(t.key)}
                  className={`relative pb-[9px] text-[10px] font-bold transition-colors ${
                    tab === t.key ? "text-[#166b40]" : "text-[#6c7587] hover:text-[#18233b]"
                  }`}
                >
                  {t.label} ({counts[t.key]})
                  {tab === t.key && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#166b40]" />
                  )}
                </button>
              ))}
            </div>

            {/* FILTER BAR */}
            <div className="flex flex-wrap items-center gap-[8px] border-b border-[#f0f0ec] px-[16px] py-[10px]">
              <div className="relative min-w-[200px] flex-1">
                <Search className="pointer-events-none absolute left-[9px] top-1/2 h-[12px] w-[12px] -translate-y-1/2 text-[#9aa0aa]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by job title or keyword..."
                  className="h-[30px] w-full rounded-[5px] border border-[#e5e6e2] bg-white pl-[26px] pr-[9px] text-[9.5px] font-medium text-[#414b5e] outline-none placeholder:text-[#9aa0aa] focus:border-[#8fa98e]"
                />
              </div>

              <div className="relative">
                <select
                  value={department}
                  onChange={(e) => {
                    setDepartment(e.target.value);
                    setPage(1);
                  }}
                  className="h-[30px] cursor-pointer appearance-none rounded-[5px] border border-[#e5e6e2] bg-white pl-[9px] pr-[24px] text-[9.5px] font-medium text-[#414b5e] outline-none focus:border-[#8fa98e]"
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-[7px] top-1/2 h-[11px] w-[11px] -translate-y-1/2 text-[#64748b]" />
              </div>

              <div className="relative">
                <select
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setPage(1);
                  }}
                  className="h-[30px] cursor-pointer appearance-none rounded-[5px] border border-[#e5e6e2] bg-white pl-[9px] pr-[24px] text-[9.5px] font-medium text-[#414b5e] outline-none focus:border-[#8fa98e]"
                >
                  {locations.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-[7px] top-1/2 h-[11px] w-[11px] -translate-y-1/2 text-[#64748b]" />
              </div>

              <button
                type="button"
                onClick={() => notImplemented("Advanced filters")}
                className="flex h-[30px] items-center gap-[5px] rounded-[5px] border border-[#e5e6e2] bg-white px-[10px] text-[9.5px] font-semibold text-[#414b5e] hover:bg-slate-50"
              >
                <Filter className="h-[11px] w-[11px]" />
                Filter
              </button>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left">
                <thead>
                  <tr className="h-[32px] border-b border-[#e8e5df] bg-[#233D4D]">
                    <th className="w-[30px] px-[10px] py-[6px]">
                      <input type="checkbox" className="h-[11px] w-[11px] cursor-pointer" />
                    </th>
                    <th className="px-[8px] py-[6px] text-[8.5px] font-bold text-white uppercase tracking-wider">#</th>
                    <th className="px-[8px] py-[6px] text-[8.5px] font-bold text-white uppercase tracking-wider">Job Title</th>
                    <th className="px-[8px] py-[6px] text-[8.5px] font-bold text-white uppercase tracking-wider">Department</th>
                    <th className="px-[8px] py-[6px] text-[8.5px] font-bold text-white uppercase tracking-wider">Location</th>
                    <th className="px-[8px] py-[6px] text-[8.5px] font-bold text-white uppercase tracking-wider">Type</th>
                    <th className="px-[8px] py-[6px] text-[8.5px] font-bold text-white uppercase tracking-wider">Openings</th>
                    <th className="px-[8px] py-[6px] text-[8.5px] font-bold text-white uppercase tracking-wider">Views</th>
                    <th className="px-[8px] py-[6px] text-[8.5px] font-bold text-white uppercase tracking-wider">Applications</th>
                    <th className="px-[8px] py-[6px] text-[8.5px] font-bold text-white uppercase tracking-wider">Status</th>
                    <th className="px-[8px] py-[6px] text-[8.5px] font-bold text-white uppercase tracking-wider">Closing Date</th>
                    <th className="px-[8px] py-[6px] text-right text-[8.5px] font-bold text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0ec]">
                  {paginatedJobs.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-12 text-center text-[10px] text-[#6c7587]">
                        No jobs match your filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedJobs.map((job) => (
                      <tr key={job.id} className="transition hover:bg-slate-50/80">
                        <td className="px-[10px] py-[8px]">
                          <input type="checkbox" className="h-[11px] w-[11px] cursor-pointer" />
                        </td>
                        <td className="px-[8px] py-[8px] text-[8.5px] font-semibold text-[#6c7587]">{job.id}</td>
                        <td className="max-w-[220px] px-[8px] py-[8px]">
                          <button
                            type="button"
                            onClick={() => notImplemented(`Preview "${job.title}"`)}
                            className="text-left text-[8.5px] font-bold text-[#4B1426] hover:underline"
                          >
                            {job.title}
                          </button>
                        </td>
                        <td className="px-[8px] py-[8px] text-[8.5px] font-medium text-[#334155]">{job.department}</td>
                        <td className="px-[8px] py-[8px] text-[8.5px] font-medium text-[#334155]">{job.location}</td>
                        <td className="px-[8px] py-[8px] text-[8.5px] font-medium text-[#334155]">{job.type}</td>
                        <td className="px-[8px] py-[8px] text-[8.5px] font-medium text-[#334155]">{job.openings}</td>
                        <td className="px-[8px] py-[8px] text-[8.5px] font-medium text-[#334155]">{job.views.toLocaleString()}</td>
                        <td className="px-[8px] py-[8px] text-[8.5px] font-medium text-[#334155]">{job.applications}</td>
                        <td className="px-[8px] py-[8px]">
                          <span className={`inline-flex items-center gap-1 rounded-[4px] px-[7px] py-[2px] text-[7.5px] font-bold ${STATUS_STYLES[job.status]}`}>
                            <Circle className="h-[5px] w-[5px] fill-current" />
                            {job.status}
                          </span>
                        </td>
                        <td className="px-[8px] py-[8px] text-[8.5px] font-medium text-[#334155]">{job.closingDate || "—"}</td>
                        <td className="px-[8px] py-[8px]">
                          <div className="flex items-center justify-end gap-[8px]">
                            <button
                              type="button"
                              onClick={() => notImplemented(`View "${job.title}"`)}
                              className="text-[8.5px] font-bold text-[#2563eb] hover:underline"
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => notImplemented("More actions")}
                              className="flex h-[20px] w-[20px] items-center justify-center rounded-[4px] text-[#64748b] hover:bg-slate-100"
                            >
                              <MoreHorizontal className="h-[13px] w-[13px]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION FOOTER */}
            {filtered.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e8e5df] bg-[#fafafa] px-[12px] py-[8px] text-[8px]">
                <span className="font-semibold text-[#5f6a7c]">
                  Showing {startIndex + 1} to {endIndex} of {filtered.length} jobs
                </span>

                <div className="flex items-center gap-[10px]">
                  <div className="flex items-center gap-[4px]">
                    <button
                      type="button"
                      disabled={safePage <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="flex h-[22px] w-[22px] items-center justify-center rounded-[4px] border border-[#d8dce2] bg-white text-[#334155] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setPage(pageNum)}
                        className={`flex h-[22px] min-w-[22px] items-center justify-center rounded-[4px] border px-1.5 text-[8px] font-bold transition ${
                          safePage === pageNum
                            ? "border-[#233D4D] bg-[#233D4D] text-white shadow-xs"
                            : "border-[#d8dce2] bg-white text-[#334155] hover:bg-slate-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                    <button
                      type="button"
                      disabled={safePage >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="flex h-[22px] w-[22px] items-center justify-center rounded-[4px] border border-[#d8dce2] bg-white text-[#334155] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>

                  <span className="font-semibold text-[#5f6a7c]">10 per page</span>
                </div>
              </div>
            )}
          </div>

          {/* =============================================
              RIGHT: SIDEBAR
          ============================================= */}
          <div className="flex flex-col gap-[10px]">
            {/* PREVIEW JOB PAGE */}
            <div className="border border-[#e7e7e3] bg-white p-[12px]">
              <div className="mb-[8px] flex items-center justify-between">
                <h2 className="text-[11px] font-bold text-[#263148]">Preview Job Page</h2>
                <button
                  type="button"
                  onClick={() => notImplemented("Preview job page")}
                  className="text-[#293681] hover:text-[#4B1426]"
                >
                  <ExternalLink className="h-[13px] w-[13px]" />
                </button>
              </div>

              <div className="relative flex h-[92px] flex-col items-center justify-center overflow-hidden rounded-[6px] bg-gradient-to-br from-[#1f6f4a] to-[#2f9e63] px-[10px] text-center">
                <Sprout className="mb-1 h-[18px] w-[18px] text-white" />
                <p className="text-[10px] font-bold leading-tight text-white">Join Our Team</p>
                <p className="text-[8px] font-medium leading-tight text-white/90">Be a Part of a Greener Tomorrow</p>
              </div>

              <button
                type="button"
                onClick={() => notImplemented("View live page")}
                className="mt-[9px] flex h-[28px] w-full items-center justify-center rounded-[5px] border border-[#dedfdb] text-[9px] font-bold text-[#334155] hover:bg-slate-50"
              >
                View Live Page
              </button>
            </div>

            {/* QUICK ACTIONS */}
            <div className="border border-[#e7e7e3] bg-white p-[12px]">
              <h2 className="mb-[8px] text-[11px] font-bold text-[#263148]">Quick Actions</h2>
              <div className="flex flex-col gap-[2px]">
                {QUICK_ACTIONS.map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => notImplemented(label)}
                    className="flex items-center gap-[8px] rounded-[4px] px-[6px] py-[7px] text-left text-[9.5px] font-semibold text-[#334155] transition hover:bg-slate-50"
                  >
                    <Icon className="h-[13px] w-[13px] text-[#218DAE]" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* NEED HELP */}
            <div className="flex items-start gap-[9px] rounded-[6px] bg-[#eef6f1] p-[11px]">
              <span className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full bg-white text-[#23714a] shadow-2xs">
                <Headphones className="h-[13px] w-[13px]" />
              </span>
              <div className="min-w-0">
                <p className="text-[9.5px] font-bold text-[#23471d]">Need Help?</p>
                <p className="mt-0.5 text-[8px] font-medium leading-snug text-[#3f5a4a]">
                  For support, contact IT Team
                </p>
                <a
                  href="mailto:it.support@bharatorganicexpo.com"
                  className="text-[8px] font-bold text-[#166b40] hover:underline"
                >
                  it.support@bharatorganicexpo.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
