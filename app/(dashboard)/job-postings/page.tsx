"use client";

import { useMemo, useState } from "react";
import {
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
  Tag,
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
   STAT CARD
========================================================= */

const TONE_STYLES = {
  slate: { iconBg: "bg-slate-100", iconText: "text-slate-600" },
  green: { iconBg: "bg-[#e8f5e9]", iconText: "text-[#23714a]" },
  amber: { iconBg: "bg-[#fff3e0]", iconText: "text-[#b45309]" },
  red: { iconBg: "bg-[#fee2e2]", iconText: "text-[#dc2626]" },
  blue: { iconBg: "bg-[#e3f2fd]", iconText: "text-[#1565c0]" },
  indigo: { iconBg: "bg-[#e0e7ff]", iconText: "text-[#4338ca]" },
  violet: { iconBg: "bg-[#ede9fe]", iconText: "text-[#6d28d9]" },
} as const;

function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  delta?: string;
  tone: keyof typeof TONE_STYLES;
}) {
  const t = TONE_STYLES[tone];
  return (
    <div className="flex min-w-0 items-center gap-[9px] border border-[#e8e5df] bg-white px-[10px] py-[9px] shadow-2xs">
      <span className={`grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full ${t.iconBg} ${t.iconText}`}>
        <Icon className="h-[14px] w-[14px]" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[7.5px] font-bold uppercase tracking-wide text-[#8b929c]">{label}</p>
        <p className="truncate text-[15px] font-bold leading-tight text-[#18233b]">{value}</p>
        {delta && <p className="mt-0.5 truncate text-[7.5px] font-bold text-emerald-600">↑ {delta}</p>}
      </div>
    </div>
  );
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

  return (
    <div className={`${typography.pages} min-h-[calc(100vh-100px)] w-full bg-white text-[#18233b]`}>
      <div className="flex min-h-full flex-col px-[18px] pb-[16px] pt-[14px]">
        {/* =================================================
            HEADER
        ================================================= */}
        <div className="mb-[14px] flex flex-wrap items-start justify-between gap-[10px]">
          <div>
            <h1 className="text-[19px] font-bold leading-[1.15] tracking-[-0.018em] text-[#23471d]">
              Job Postings
            </h1>
            <p className="mt-0.5 text-[9px] font-medium text-[#6c7587]">
              Create, manage and publish job openings on your website.
            </p>
          </div>

          <div className="flex items-center gap-[10px]">
            {/* 1. VIEW ON WEBSITE */}
            <a
              href="http://localhost:3002/careers"
              target="_blank"
              rel="noreferrer"
              className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] border border-[#fed7aa] bg-[#fff7ed] px-[14px] text-[8.5px] font-semibold text-[#ea580c] transition hover:bg-[#ffedd5] shadow-sm active:scale-95"
            >
              <ExternalLink className="h-[12px] w-[12px] text-[#ea580c]" strokeWidth={1.7} />
              View on Website
            </a>

            {/* 2. MANAGE DEPARTMENTS & LOCATIONS */}
            <button
              type="button"
              onClick={() => notImplemented("Manage Departments & Locations")}
              className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] bg-[#006199] px-[14px] text-[8.5px] font-semibold text-white shadow-sm transition hover:bg-[#005180] active:scale-95"
              style={{ backgroundColor: "#006199", color: "#ffffff" }}
            >
              <Tag className="h-[12px] w-[12px] text-white" strokeWidth={1.7} />
              Manage Departments
            </button>

            {/* 3. ADD NEW JOB */}
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
        <div className="mb-[12px] grid grid-cols-2 gap-[8px] sm:grid-cols-4 xl:grid-cols-7">
          <StatCard icon={Briefcase} label="Total Jobs" value={JOBS.length} tone="slate" />
          <StatCard icon={CheckCircle2} label="Active Jobs" value={counts.active} tone="green" />
          <StatCard icon={FileClock} label="Draft Jobs" value={counts.draft} tone="amber" />
          <StatCard icon={XCircle} label="Closed Jobs" value={counts.closed} tone="red" />
          <StatCard icon={Eye} label="Total Page Views" value="18,420" delta="32% vs last month" tone="blue" />
          <StatCard icon={MousePointerClick} label="Total Apply Clicks" value="2,860" delta="28% vs last month" tone="indigo" />
          <StatCard icon={ClipboardList} label="Total Applications" value="1,124" delta="24% vs last month" tone="violet" />
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
