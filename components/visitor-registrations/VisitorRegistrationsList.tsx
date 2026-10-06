"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Inbox,
  Phone,
  Search,
  Sparkles,
  Trash2,
  Users,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import Swal from "sweetalert2";
import typography from "@/app/(dashboard)/pages/PagesTypography.module.css";
import { ApiRequestError } from "@/lib/api";
import {
  SUBTYPE_LABEL,
  visitorRegistrationApi,
  type VisitorCategory,
  type VisitorRegistration,
  type VisitorStatus,
} from "@/lib/visitorRegistrationApi";

/* =========================================================
   HELPERS
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
const showSuccess = (title: string) => Toast.fire({ icon: "success", iconColor: "#34d399", title });
const showError = (title: string) => Toast.fire({ icon: "error", iconColor: "#f87171", title });

export function formatDateTime(value?: string): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
}

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const isWithinLastDays = (value: string, days: number) => new Date(value).getTime() >= Date.now() - days * 86_400_000;

export const STATUS_STYLES: Record<VisitorStatus, string> = {
  pending: "bg-[#fff8e1] text-[#b78103] border border-[#ffe082]",
  confirmed: "bg-[#e8f5e9] text-[#23714a] border border-[#a5d6a7]",
  cancelled: "bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca]",
};
export const STATUS_LABEL: Record<VisitorStatus, string> = { pending: "Pending", confirmed: "Confirmed", cancelled: "Cancelled" };

const SELECT_ARROW = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`;

const toneClass = {
  slate: "bg-slate-50 text-slate-700 ring-slate-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
  teal: "bg-teal-50 text-teal-700 ring-teal-200",
} as const;

type DateFilter = "all" | "today" | "yesterday" | "custom";
const DATE_FILTERS: { key: DateFilter; label: string }[] = [
  { key: "all", label: "All Time" },
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "custom", label: "Custom" },
];
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const dateRange = (filter: DateFilter, from: string, to: string): [number | null, number | null] => {
  const today = startOfDay(new Date()).getTime();
  if (filter === "today") return [today, null];
  if (filter === "yesterday") return [today - 86_400_000, today];
  if (filter === "custom") {
    return [
      from ? new Date(`${from}T00:00:00`).getTime() : null,
      to ? new Date(`${to}T00:00:00`).getTime() + 86_400_000 : null,
    ];
  }
  return [null, null];
};

const PAGE_SIZE = 10;
const TABS: { key: "all" | VisitorStatus; label: string }[] = [
  { key: "all", label: "All Registrations" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "cancelled", label: "Cancelled" },
];

const waLink = (mobile: string) => {
  const digits = mobile.replace(/\D/g, "");
  return `https://wa.me/${digits.length === 10 ? `91${digits}` : digits}`;
};
const locationOf = (r: VisitorRegistration) => [r.city, r.state, r.country].filter(Boolean).join(", ");

/* =========================================================
   COLUMNS PER CATEGORY
========================================================= */

type Column = { label: string; cell: (r: VisitorRegistration) => ReactNode; className?: string };
const td = "px-[12px] py-[7px] text-[8px] font-medium text-[#334155]";
const truncate = (value: string | undefined, width: string) => (
  <span className={`block ${width} truncate`} title={value}>
    {value || "—"}
  </span>
);
const SUBTYPE_TONE: Record<string, string> = {
  corporate: "bg-sky-50 text-sky-700 border-sky-200",
  general: "bg-orange-50 text-orange-700 border-orange-200",
  healthCamp: "bg-rose-50 text-rose-700 border-rose-200",
};

const COLUMNS: Record<VisitorCategory, Column[]> = {
  domestic: [
    {
      label: "Visitor Type",
      cell: (r) => (
        <span className={`whitespace-nowrap rounded-[4px] border px-[6px] py-[2px] text-[7.5px] font-bold ${SUBTYPE_TONE[r.subType] || ""}`}>
          {SUBTYPE_LABEL[r.subType] || "—"}
        </span>
      ),
    },
    { label: "Company", cell: (r) => truncate(r.companyName, "max-w-[130px]") },
    { label: "Mobile No.", cell: (r) => <span className="whitespace-nowrap font-bold text-[#166534]">{r.mobile}</span> },
    { label: "Email", cell: (r) => r.email },
    { label: "Location", cell: (r) => truncate(locationOf(r), "max-w-[140px]") },
  ],
  international: [
    { label: "Nationality", cell: (r) => truncate(r.nationality, "max-w-[100px]") },
    { label: "Company", cell: (r) => truncate(r.companyName, "max-w-[130px]") },
    { label: "Mobile No.", cell: (r) => <span className="whitespace-nowrap font-bold text-[#166534]">{r.mobile}</span> },
    { label: "Email", cell: (r) => r.email },
    { label: "Country", cell: (r) => truncate(r.country, "max-w-[110px]") },
  ],
  group: [
    { label: "Organisation", cell: (r) => truncate(r.companyName, "max-w-[150px]") },
    {
      label: "Members",
      cell: (r) => (
        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-[4px] border border-violet-200 bg-violet-50 px-[6px] py-[2px] text-[7.5px] font-bold text-violet-700">
          <Users className="h-[9px] w-[9px]" /> {r.persons?.length || 0}
        </span>
      ),
    },
    { label: "Mobile No.", cell: (r) => <span className="whitespace-nowrap font-bold text-[#166534]">{r.mobile}</span> },
    { label: "Email", cell: (r) => r.email },
    { label: "Location", cell: (r) => truncate(locationOf(r), "max-w-[140px]") },
  ],
};

const PAGE_TEXT: Record<VisitorCategory, { title: string; subtitle: string; nameLabel: string }> = {
  domestic: {
    title: "Domestic Visitors",
    subtitle: "Corporate, General and Free Health Camp registrations from the website's Visitor Registration page.",
    nameLabel: "Name",
  },
  international: {
    title: "International Visitors",
    subtitle: "Registrations from delegates visiting from outside India (website Visitor Registration page).",
    nameLabel: "Name",
  },
  group: {
    title: "Group Registrations",
    subtitle: "Team registrations of 5–10 members from one organisation (website Visitor Registration page).",
    nameLabel: "Primary Contact",
  },
};

/* =========================================================
   PAGE
========================================================= */

export default function VisitorRegistrationsList({ category }: { category: VisitorCategory }) {
  const text = PAGE_TEXT[category];
  const columns = COLUMNS[category];
  const colCount = columns.length + 6;

  const [rows, setRows] = useState<VisitorRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | VisitorStatus>("all");
  const [subType, setSubType] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    let active = true;
    visitorRegistrationApi
      .list(category)
      .then((data) => active && setRows(data.registrations || []))
      .catch((err) => active && setLoadError(err instanceof ApiRequestError ? err.message : "Failed to load registrations."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [category]);

  const changeTab = (next: typeof tab) => {
    setTab(next);
    setPage(1);
  };

  const handleStatusChange = async (id: string, next: VisitorStatus) => {
    const previous = rows;
    setRows((prev) => prev.map((r) => (r._id === id ? { ...r, status: next } : r)));
    setUpdatingId(id);
    try {
      await visitorRegistrationApi.updateStatus(id, next);
      showSuccess(`Marked as "${STATUS_LABEL[next]}"`);
    } catch (err) {
      setRows(previous);
      showError(err instanceof ApiRequestError ? err.message : "Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (r: VisitorRegistration) => {
    const result = await Swal.fire({
      title: `Delete registration ${r.registrationNo}?`,
      text: `${r.name} — this cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#dc2626",
      background: "#1e2433",
      color: "#e2e8f0",
    });
    if (!result.isConfirmed) return;
    const previous = rows;
    setRows((prev) => prev.filter((x) => x._id !== r._id));
    try {
      await visitorRegistrationApi.remove(r._id);
      showSuccess("Registration deleted");
    } catch (err) {
      setRows(previous);
      showError(err instanceof ApiRequestError ? err.message : "Failed to delete registration.");
    }
  };

  // Date filter (and the Domestic visitor-type filter) first; tabs/cards count from that.
  const dated = useMemo(() => {
    const [start, end] = dateRange(dateFilter, fromDate, toDate);
    return rows.filter((r) => {
      if (subType && r.subType !== subType) return false;
      const t = new Date(r.createdAt).getTime();
      return (start === null || t >= start) && (end === null || t < end);
    });
  }, [rows, dateFilter, fromDate, toDate, subType]);

  const counts = useMemo(
    () => ({
      all: dated.length,
      pending: dated.filter((r) => r.status === "pending").length,
      confirmed: dated.filter((r) => r.status === "confirmed").length,
      cancelled: dated.filter((r) => r.status === "cancelled").length,
      today: rows.filter((r) => isSameDay(new Date(r.createdAt), new Date())).length,
      week: rows.filter((r) => isWithinLastDays(r.createdAt, 7)).length,
    }),
    [dated, rows]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return dated.filter((r) => {
      if (tab !== "all" && r.status !== tab) return false;
      if (!q) return true;
      return [r.registrationNo, r.name, r.companyName, r.email, r.mobile, r.city, r.state, r.country, r.nationality, r.designation]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [dated, tab, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, filtered.length);
  const pageRows = filtered.slice(startIndex, endIndex);

  const statCards: {
    title: string;
    value: number;
    icon: LucideIcon;
    tone: keyof typeof toneClass;
    gradient: string;
    borderColor: string;
    numColor: string;
    footer: string;
    onClick: () => void;
  }[] = [
    { title: "TOTAL REGISTRATIONS", value: counts.all, icon: Inbox, tone: "slate", gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #e2e8f0 100%)", borderColor: "#e2e8f0", numColor: "#334155", footer: "View all", onClick: () => changeTab("all") },
    { title: "PENDING", value: counts.pending, icon: Clock3, tone: "amber", gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #fed7aa 100%)", borderColor: "#fed7aa", numColor: "#c2410c", footer: "View pending", onClick: () => changeTab("pending") },
    { title: "CONFIRMED", value: counts.confirmed, icon: CheckCircle2, tone: "emerald", gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #bbf7d0 100%)", borderColor: "#bbf7d0", numColor: "#15803d", footer: "View confirmed", onClick: () => changeTab("confirmed") },
    { title: "CANCELLED", value: counts.cancelled, icon: XCircle, tone: "red", gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #fecaca 100%)", borderColor: "#fecaca", numColor: "#b91c1c", footer: "View cancelled", onClick: () => changeTab("cancelled") },
    { title: "TODAY", value: counts.today, icon: Sparkles, tone: "violet", gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #ddd6fe 100%)", borderColor: "#ddd6fe", numColor: "#6d28d9", footer: "New today", onClick: () => changeTab("all") },
    { title: "LAST 7 DAYS", value: counts.week, icon: CalendarDays, tone: "teal", gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #99f6e4 100%)", borderColor: "#99f6e4", numColor: "#0f766e", footer: "This week", onClick: () => changeTab("all") },
  ];

  const th = "px-[12px] py-[6px] text-[7.5px] font-bold text-white uppercase tracking-wider whitespace-nowrap";
  const dateInput =
    "h-[26px] rounded-[5px] border border-[#e1e6ec] bg-white px-[6px] text-[8.5px] font-semibold text-[#334155] outline-none focus:border-[#8fa98e]";

  return (
    <div className={`${typography.pages} min-h-[calc(100vh-100px)] w-full bg-white text-[#18233b]`}>
      <div className="flex min-h-full flex-col px-[18px] pb-[16px] pt-[14px]">
        {/* HEADER */}
        <div className="mb-[14px] flex flex-wrap items-start justify-between gap-[10px] border-b-[2px] border-[#293681] pb-[10px]">
          <div>
            <h1 className="text-[19px] font-bold leading-[1.15] tracking-[-0.018em] text-[#23471d]">{text.title}</h1>
            <p className="mt-0.5 text-[9px] font-medium text-[#6c7587]">{text.subtitle}</p>
          </div>

          {/* Date filter */}
          <div className="flex flex-wrap items-center gap-[6px]">
            <div className="flex items-center rounded-[6px] border border-[#e1e6ec] bg-[#f6f8fa] p-[2px]">
              <CalendarDays className="mx-[6px] h-[11px] w-[11px] text-[#6c7587]" aria-hidden="true" />
              {DATE_FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => {
                    setDateFilter(f.key);
                    setPage(1);
                  }}
                  className={`rounded-[4px] px-[9px] py-[4px] text-[8.5px] font-bold transition ${
                    dateFilter === f.key ? "bg-[#233D4D] text-white shadow-xs" : "text-[#475569] hover:bg-white"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {dateFilter === "custom" && (
              <div className="flex items-center gap-[4px]">
                <input type="date" value={fromDate} max={toDate || undefined} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} aria-label="From date" className={dateInput} />
                <span className="text-[8.5px] font-semibold text-[#6c7587]">to</span>
                <input type="date" value={toDate} min={fromDate || undefined} onChange={(e) => { setToDate(e.target.value); setPage(1); }} aria-label="To date" className={dateInput} />
                {(fromDate || toDate) && (
                  <button type="button" onClick={() => { setFromDate(""); setToDate(""); setPage(1); }} className="px-[4px] text-[8.5px] font-bold text-[#dc2626] hover:underline">
                    Clear
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* STATS */}
        <div className="mb-[12px] grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
          {statCards.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="relative flex h-[82px] flex-col overflow-hidden rounded-[10px] border border-[#e5e7e6] bg-white p-1.5 !pb-4.5 transition-all hover:translate-y-[-1px]"
                style={{ background: item.gradient, borderColor: item.borderColor, boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px" }}
              >
                <div className="flex items-start gap-1.5">
                  <div className={`grid h-[24px] w-[24px] shrink-0 place-items-center rounded-full ring-1 bg-white/80 shadow-xs ${toneClass[item.tone]}`}>
                    <Icon className="h-3 w-3" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[7px] !font-semibold tracking-[0.01em] text-slate-900" style={{ fontWeight: 600, color: "#0f172a" }}>
                      {item.title}
                    </p>
                    <span className="mt-1 block text-[16px] !font-semibold leading-none tracking-[-0.04em]" style={{ color: item.numColor, fontWeight: 600 }}>
                      {item.value}
                    </span>
                  </div>
                </div>
                <div onClick={item.onClick} className="absolute bottom-1 left-1.5 right-1.5 flex cursor-pointer items-center justify-center gap-1 text-[7px] font-semibold text-[#293957] transition hover:text-blue-600">
                  {item.footer}
                  <ArrowRight className="h-2.5 w-2.5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* TABLE CARD */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[7px] border border-[#e8e5df] bg-white">
          <div className="flex flex-wrap items-center gap-[20px] border-b border-[#e8e5df] px-[16px] pt-[11px]">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => changeTab(t.key)}
                className={`relative pb-[9px] text-[10px] font-bold transition-colors ${tab === t.key ? "text-[#166b40]" : "text-[#6c7587] hover:text-[#18233b]"}`}
              >
                {t.label} ({counts[t.key]})
                {tab === t.key && <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#166b40]" />}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-[8px] border-b border-[#f0f0ec] px-[16px] py-[10px]">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-[9px] top-1/2 h-[12px] w-[12px] -translate-y-1/2 text-[#9aa0aa]" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by registration no., name, company, email, mobile or location..."
                className="h-[30px] w-full rounded-[5px] border border-[#e5e6e2] bg-white pl-[26px] pr-[9px] text-[9.5px] font-medium text-[#414b5e] outline-none placeholder:text-[#9aa0aa] focus:border-[#8fa98e]"
              />
            </div>
            {category === "domestic" && (
              <select
                value={subType}
                onChange={(e) => {
                  setSubType(e.target.value);
                  setPage(1);
                }}
                aria-label="Visitor type"
                className="h-[30px] rounded-[5px] border border-[#e5e6e2] bg-white px-[8px] text-[9.5px] font-semibold text-[#414b5e] outline-none focus:border-[#8fa98e]"
              >
                <option value="">All Visitor Types</option>
                <option value="corporate">Corporate Visitor</option>
                <option value="general">General Visitor</option>
                <option value="healthCamp">Free Health Camp</option>
              </select>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse text-left">
              <thead>
                <tr className="h-[28px] border-b border-[#e8e5df] bg-[#233D4D]">
                  <th className={`w-[36px] ${th}`}>S.No</th>
                  <th className={th}>Reg. No.</th>
                  <th className={th}>{text.nameLabel}</th>
                  {columns.map((c) => (
                    <th key={c.label} className={th}>
                      {c.label}
                    </th>
                  ))}
                  <th className={th}>Status</th>
                  <th className={th}>Received</th>
                  <th className={`${th} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0ec]">
                {loading ? (
                  <tr><td colSpan={colCount} className="py-12 text-center text-[10px] text-[#6c7587]">Loading registrations…</td></tr>
                ) : loadError ? (
                  <tr><td colSpan={colCount} className="py-12 text-center text-[10px] font-semibold text-red-600">{loadError}</td></tr>
                ) : pageRows.length === 0 ? (
                  <tr><td colSpan={colCount} className="py-12 text-center text-[10px] text-[#6c7587]">No registrations match your filters.</td></tr>
                ) : (
                  pageRows.map((r, i) => (
                    <tr key={r._id} className="transition hover:bg-slate-50/80">
                      <td className="px-[12px] py-[7px] text-[8px] font-semibold text-[#6c7587]">{startIndex + i + 1}</td>
                      <td className="whitespace-nowrap px-[12px] py-[7px] font-mono text-[8px] font-bold text-[#4E1F6E]">{r.registrationNo}</td>
                      <td className="px-[12px] py-[7px]">
                        <Link href={`/visitor-registrations/view/${r._id}`} className="whitespace-nowrap text-[8px] font-bold text-[#4B1426] hover:underline">
                          {r.name}
                        </Link>
                      </td>
                      {columns.map((c) => (
                        <td key={c.label} className={td}>
                          {c.cell(r)}
                        </td>
                      ))}
                      <td className="px-[12px] py-[7px]">
                        <select
                          value={r.status}
                          disabled={updatingId === r._id}
                          onChange={(e) => handleStatusChange(r._id, e.target.value as VisitorStatus)}
                          className={`h-[22px] cursor-pointer appearance-none rounded-[4px] bg-[right_6px_center] bg-no-repeat px-[8px] pr-[22px] text-[8px] font-bold shadow-xs outline-none transition disabled:opacity-50 ${STATUS_STYLES[r.status]}`}
                          style={{ backgroundImage: SELECT_ARROW }}
                        >
                          <option value="pending" className="bg-white text-[#b78103]">Pending</option>
                          <option value="confirmed" className="bg-white text-[#23714a]">Confirmed</option>
                          <option value="cancelled" className="bg-white text-[#b91c1c]">Cancelled</option>
                        </select>
                      </td>
                      <td className="whitespace-nowrap px-[12px] py-[7px] text-[7.5px] font-medium text-[#6c7587]">{formatDateTime(r.createdAt)}</td>
                      <td className="px-[12px] py-[7px]">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/visitor-registrations/view/${r._id}`}
                            title="View Overview"
                            className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] border border-orange-400/30 bg-orange-500/10 text-orange-600 shadow-[0_2px_6px_rgba(249,115,22,0.12)] transition-all hover:scale-105 hover:bg-orange-500/20 active:scale-95"
                          >
                            <Eye className="h-[12px] w-[12px]" />
                          </Link>
                          <a
                            href={waLink(r.mobile)}
                            target="_blank"
                            rel="noreferrer"
                            title="Message on WhatsApp"
                            className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] border border-emerald-400/30 bg-emerald-500/10 text-emerald-600 shadow-[0_2px_6px_rgba(16,185,129,0.12)] transition-all hover:scale-105 hover:bg-emerald-500/20 active:scale-95"
                          >
                            <Phone className="h-[12px] w-[12px]" />
                          </a>
                          <button
                            type="button"
                            title="Delete Registration"
                            onClick={() => handleDelete(r)}
                            className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] border border-red-400/30 bg-red-500/10 text-red-600 shadow-[0_2px_6px_rgba(220,38,38,0.12)] transition-all hover:scale-105 hover:bg-red-500/20 active:scale-95"
                          >
                            <Trash2 className="h-[12px] w-[12px]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filtered.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e8e5df] bg-[#fafafa] px-[12px] py-[8px] text-[8px]">
              <span className="font-semibold text-[#5f6a7c]">
                Showing {startIndex + 1} to {endIndex} of {filtered.length} registrations
              </span>
              <div className="flex items-center gap-[4px]">
                <button type="button" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="flex h-[22px] w-[22px] items-center justify-center rounded-[4px] border border-[#d8dce2] bg-white text-[#334155] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30">
                  <ChevronLeft className="h-3 w-3" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPage(n)}
                    className={`flex h-[22px] min-w-[22px] items-center justify-center rounded-[4px] border px-1.5 text-[8px] font-bold transition ${
                      safePage === n ? "border-[#233D4D] bg-[#233D4D] text-white shadow-xs" : "border-[#d8dce2] bg-white text-[#334155] hover:bg-slate-50"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button type="button" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="flex h-[22px] w-[22px] items-center justify-center rounded-[4px] border border-[#d8dce2] bg-white text-[#334155] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30">
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
