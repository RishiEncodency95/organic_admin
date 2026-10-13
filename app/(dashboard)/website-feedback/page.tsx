"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  Inbox,
  Mail,
  Phone,
  PhoneCall,
  Search,
  Sparkles,
  Star,
  Tag,
  Trash2,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import Swal from "sweetalert2";
import typography from "../pages/PagesTypography.module.css";
import Modal from "@/components/ui/Modal";
import { ApiRequestError } from "@/lib/api";
import { feedbackApi, type FeedbackStatus, type WebsiteFeedback } from "@/lib/feedbackApi";

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

const showSuccess = (title: string) => Toast.fire({ icon: "success", iconColor: "#34d399", title });
const showError = (title: string) => Toast.fire({ icon: "error", iconColor: "#f87171", title });

/* =========================================================
   HELPERS
========================================================= */

function formatDateTime(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
}

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

// WhatsApp link for a 10-digit Indian number
const waLink = (phone: string) => `https://wa.me/91${phone.replace(/\D/g, "").slice(-10)}`;

const STATUS_STYLES: Record<FeedbackStatus, string> = {
  new: "bg-[#fff8e1] text-[#b78103] border border-[#ffe082]",
  reviewed: "bg-[#e8f5e9] text-[#23714a] border border-[#a5d6a7]",
  contacted: "bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]",
};

const STATUS_LABEL: Record<FeedbackStatus, string> = { new: "New", reviewed: "Reviewed", contacted: "Contacted" };

const toneClass = {
  slate: "bg-slate-50 text-slate-700 ring-slate-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  blue: "bg-sky-50 text-sky-700 ring-sky-200",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
  teal: "bg-teal-50 text-teal-700 ring-teal-200",
} as const;

interface StatCardItem {
  title: string;
  value: string | number;
  icon: LucideIcon;
  tone: keyof typeof toneClass;
  gradient: string;
  borderColor: string;
  numColor: string;
  footer: string;
  onClick: () => void;
}

const PAGE_SIZE = 10;

type TabKey = "all" | FeedbackStatus | "feature";
const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All Feedback" },
  { key: "new", label: "New" },
  { key: "reviewed", label: "Reviewed" },
  { key: "contacted", label: "Contacted" },
  { key: "feature", label: "Can Be Featured" },
];

const Stars = ({ value, size = 10 }: { value: number; size?: number }) =>
  value > 0 ? (
    <span className="inline-flex items-center gap-[1px]" title={`${value} of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          style={{ width: size, height: size }}
          className={n <= value ? "fill-[#f59e0b] text-[#f59e0b]" : "fill-transparent text-[#cbd5e1]"}
          strokeWidth={1.6}
        />
      ))}
    </span>
  ) : (
    <span className="text-[8px] font-medium text-[#94a3b8]">Not rated</span>
  );

const selectArrow = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
};

/* =========================================================
   WEBSITE FEEDBACK PAGE
   ("Share Your Feedback" form on the website, /feedback)
========================================================= */

export default function WebsiteFeedbackPage() {
  const [items, setItems] = useState<WebsiteFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<WebsiteFeedback | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Loaded once; status changes and deletes update the list in place.
  useEffect(() => {
    let active = true;
    feedbackApi
      .list()
      .then((data) => active && setItems(data.items || []))
      .catch((err) => active && setLoadError(err instanceof ApiRequestError ? err.message : "Failed to load feedback."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const changeTab = (next: TabKey) => {
    setTab(next);
    setPage(1);
  };

  const handleStatusChange = async (id: string, nextStatus: FeedbackStatus) => {
    const previous = items;
    setItems((prev) => prev.map((f) => (f._id === id ? { ...f, status: nextStatus } : f)));
    setViewing((v) => (v && v._id === id ? { ...v, status: nextStatus } : v));
    setUpdatingId(id);
    try {
      await feedbackApi.updateStatus(id, nextStatus);
      showSuccess(`Marked as "${STATUS_LABEL[nextStatus]}"`);
    } catch (err) {
      setItems(previous);
      showError(err instanceof ApiRequestError ? err.message : "Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (feedback: WebsiteFeedback) => {
    const result = await Swal.fire({
      title: `Delete feedback from "${feedback.name}"?`,
      text: "This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#dc2626",
      background: "#1e2433",
      color: "#e2e8f0",
    });
    if (!result.isConfirmed) return;

    const previous = items;
    setItems((prev) => prev.filter((f) => f._id !== feedback._id));
    setViewing((v) => (v && v._id === feedback._id ? null : v));
    try {
      await feedbackApi.remove(feedback._id);
      showSuccess("Feedback deleted");
    } catch (err) {
      setItems(previous);
      showError(err instanceof ApiRequestError ? err.message : "Failed to delete feedback.");
    }
  };

  const counts = useMemo(() => {
    const rated = items.filter((f) => f.ratings?.overall > 0);
    return {
      all: items.length,
      new: items.filter((f) => f.status === "new").length,
      reviewed: items.filter((f) => f.status === "reviewed").length,
      contacted: items.filter((f) => f.status === "contacted").length,
      feature: items.filter((f) => f.consentToFeature).length,
      wantsContact: items.filter((f) => f.wantsContact && f.status !== "contacted").length,
      today: items.filter((f) => isSameDay(new Date(f.createdAt), new Date())).length,
      average: rated.length ? (rated.reduce((sum, f) => sum + f.ratings.overall, 0) / rated.length).toFixed(1) : "—",
    };
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((f) => {
      if (tab === "feature" ? !f.consentToFeature : tab !== "all" && f.status !== tab) return false;
      if (!q) return true;
      return [f.name, f.company, f.designation, f.email, f.phone, f.role, f.edition, f.valuable, f.improve]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [items, tab, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, filtered.length);
  const paginatedRows = filtered.slice(startIndex, endIndex);

  const statCards: StatCardItem[] = [
    { title: "TOTAL FEEDBACK", value: counts.all, icon: Inbox, tone: "slate", gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #e2e8f0 100%)", borderColor: "#e2e8f0", numColor: "#334155", footer: "View all feedback", onClick: () => changeTab("all") },
    { title: "NEW", value: counts.new, icon: Sparkles, tone: "amber", gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #fed7aa 100%)", borderColor: "#fed7aa", numColor: "#c2410c", footer: "View new", onClick: () => changeTab("new") },
    { title: "AVERAGE RATING", value: counts.average, icon: Star, tone: "violet", gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #ddd6fe 100%)", borderColor: "#ddd6fe", numColor: "#6d28d9", footer: "Overall experience, out of 5", onClick: () => changeTab("all") },
    { title: "CAN BE FEATURED", value: counts.feature, icon: BadgeCheck, tone: "emerald", gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #bbf7d0 100%)", borderColor: "#bbf7d0", numColor: "#15803d", footer: "Gave consent to feature", onClick: () => changeTab("feature") },
    { title: "WANT A CALL BACK", value: counts.wantsContact, icon: PhoneCall, tone: "blue", gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #bae6fd 100%)", borderColor: "#bae6fd", numColor: "#0284c7", footer: "Asked to be contacted", onClick: () => changeTab("all") },
    { title: "TODAY", value: counts.today, icon: CalendarDays, tone: "teal", gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #99f6e4 100%)", borderColor: "#99f6e4", numColor: "#0f766e", footer: "Received today", onClick: () => changeTab("all") },
  ];

  const th = "px-[12px] py-[6px] text-[7.5px] font-bold text-white uppercase tracking-wider whitespace-nowrap";

  return (
    <div className={`${typography.pages} min-h-[calc(100vh-100px)] w-full bg-white text-[#18233b]`}>
      <div className="flex min-h-full flex-col px-[18px] pb-[16px] pt-[14px]">
        {/* HEADER */}
        <div className="mb-[14px] border-b-[2px] border-[#293681] pb-[10px]">
          <h1 className="text-[19px] font-bold leading-[1.15] tracking-[-0.018em] text-[#23471d]">Website Feedback</h1>
          <p className="mt-0.5 text-[9px] font-medium text-[#6c7587]">
            Feedback sent from the &quot;Share Your Feedback&quot; form on the website (/feedback). Use only feedback marked &quot;Can be featured&quot; as a testimonial.
          </p>
        </div>

        {/* STATS ROW */}
        <div className="mb-[12px] grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
          {statCards.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="relative flex h-[82px] flex-col overflow-hidden rounded-[10px] border border-[#e5e7e6] bg-white p-1.5 !pb-4.5 transition-all hover:translate-y-[-1px]"
                style={{
                  background: item.gradient,
                  borderColor: item.borderColor || undefined,
                  boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
                }}
              >
                <div className="flex items-start gap-1.5">
                  <div className={`grid h-[24px] w-[24px] shrink-0 place-items-center rounded-full ring-1 bg-white/80 shadow-xs ${toneClass[item.tone]}`}>
                    <Icon className="h-3 w-3" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[7px] !font-semibold tracking-[0.01em] text-slate-900" style={{ fontWeight: 600, color: "#0f172a" }}>
                      {item.title}
                    </p>
                    <div className="mt-1 flex items-end justify-between">
                      <span className="text-[16px] !font-semibold leading-none tracking-[-0.04em]" style={{ color: item.numColor, fontWeight: 600 }}>
                        {item.value}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  onClick={item.onClick}
                  className="absolute bottom-1 left-1.5 right-1.5 flex cursor-pointer items-center justify-center gap-1 text-[7px] font-semibold text-[#293957] transition hover:text-blue-600"
                >
                  {item.footer}
                  <ArrowRight className="h-2.5 w-2.5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* TABLE CARD */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[7px] border border-[#e8e5df] bg-white">
          {/* TABS */}
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

          {/* SEARCH BAR */}
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
                placeholder="Search by name, company, mobile number, email, role or feedback text..."
                className="h-[30px] w-full rounded-[5px] border border-[#e5e6e2] bg-white pl-[26px] pr-[9px] text-[9.5px] font-medium text-[#414b5e] outline-none placeholder:text-[#9aa0aa] focus:border-[#8fa98e]"
              />
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left">
              <thead>
                <tr className="h-[28px] border-b border-[#e8e5df] bg-[#233D4D]">
                  <th className={`w-[36px] ${th}`}>S.No</th>
                  <th className={th}>Name</th>
                  <th className={th}>Company</th>
                  <th className={th}>Participated As</th>
                  <th className={th}>Mobile No.</th>
                  <th className={th}>Overall Rating</th>
                  <th className={th}>Feedback</th>
                  <th className={th}>Can Feature</th>
                  <th className={th}>Status</th>
                  <th className={th}>Received</th>
                  <th className={`text-right ${th}`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0ec]">
                {loading ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-[10px] text-[#6c7587]">Loading feedback…</td>
                  </tr>
                ) : loadError ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-[10px] font-semibold text-red-600">{loadError}</td>
                  </tr>
                ) : paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-[10px] text-[#6c7587]">
                      {items.length === 0 ? "No feedback has been received yet." : "No feedback matches your filters."}
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((feedback, rowIndex) => (
                    <tr key={feedback._id} className="transition hover:bg-slate-50/80">
                      <td className="px-[12px] py-[8px] text-[8px] font-semibold text-[#6c7587]">{startIndex + rowIndex + 1}</td>
                      <td className="px-[12px] py-[8px]">
                        <button type="button" onClick={() => setViewing(feedback)} className="whitespace-nowrap text-[8px] font-bold text-[#4B1426] hover:underline">
                          {feedback.name}
                        </button>
                      </td>
                      <td className="max-w-[140px] truncate px-[12px] py-[8px] text-[8px] font-medium text-[#334155]" title={feedback.company}>{feedback.company}</td>
                      <td className="whitespace-nowrap px-[12px] py-[8px] text-[8px] font-medium text-[#334155]">{feedback.role}</td>
                      <td className="whitespace-nowrap px-[12px] py-[7px] text-[8px] font-bold text-[#166534]">+91 {feedback.phone}</td>
                      <td className="px-[12px] py-[8px]"><Stars value={feedback.ratings?.overall || 0} /></td>
                      <td className="max-w-[220px] truncate px-[12px] py-[8px] text-[8px] font-medium text-[#334155]" title={feedback.valuable}>{feedback.valuable}</td>
                      <td className="px-[12px] py-[8px] text-[8px] font-bold">
                        {feedback.consentToFeature ? <span className="text-[#15803d]">Yes</span> : <span className="text-[#94a3b8]">No</span>}
                      </td>
                      <td className="px-[12px] py-[8px]">
                        <select
                          value={feedback.status}
                          disabled={updatingId === feedback._id}
                          onChange={(e) => handleStatusChange(feedback._id, e.target.value as FeedbackStatus)}
                          className={`h-[22px] cursor-pointer appearance-none rounded-[4px] px-[8px] pr-[22px] text-[8px] font-bold outline-none bg-no-repeat bg-[right_6px_center] shadow-xs transition disabled:opacity-50 ${STATUS_STYLES[feedback.status]}`}
                          style={selectArrow}
                        >
                          <option value="new" className="bg-white font-bold text-[#b78103]">New</option>
                          <option value="reviewed" className="bg-white font-bold text-[#23714a]">Reviewed</option>
                          <option value="contacted" className="bg-white font-bold text-[#0369a1]">Contacted</option>
                        </select>
                      </td>
                      <td className="whitespace-nowrap px-[12px] py-[8px] text-[7.5px] font-medium text-[#6c7587]">{formatDateTime(feedback.createdAt)}</td>
                      <td className="px-[12px] py-[8px]">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            title="View Feedback"
                            onClick={() => setViewing(feedback)}
                            className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] border border-orange-400/30 bg-orange-500/10 text-orange-600 transition-all hover:bg-orange-500/20"
                          >
                            <Eye className="h-[12px] w-[12px] text-orange-600" />
                          </button>
                          <a
                            href={waLink(feedback.phone)}
                            target="_blank"
                            rel="noreferrer"
                            title="Message on WhatsApp"
                            className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] border border-emerald-400/30 bg-emerald-500/10 text-emerald-600 transition-all hover:bg-emerald-500/20"
                          >
                            <Phone className="h-[12px] w-[12px] text-emerald-600" />
                          </a>
                          <button
                            type="button"
                            title="Delete Feedback"
                            onClick={() => handleDelete(feedback)}
                            className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] border border-red-400/30 bg-red-500/10 text-red-600 transition-all hover:bg-red-500/20"
                          >
                            <Trash2 className="h-[12px] w-[12px] text-red-600" />
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
                Showing {startIndex + 1} to {endIndex} of {filtered.length} feedback
              </span>
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
                      safePage === pageNum ? "border-[#233D4D] bg-[#233D4D] text-white shadow-xs" : "border-[#d8dce2] bg-white text-[#334155] hover:bg-slate-50"
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
            </div>
          )}
        </div>
      </div>

      {/* VIEW FEEDBACK MODAL */}
      <Modal
        isOpen={!!viewing}
        onClose={() => setViewing(null)}
        title="Website Feedback"
        size="md"
        footer={
          viewing && (
            <>
              <button
                type="button"
                onClick={() => handleDelete(viewing)}
                className="inline-flex h-[32px] items-center gap-1.5 px-[14px] text-[12px] font-semibold text-red-600 transition-all hover:bg-red-100 active:scale-95"
                style={{ background: "#fff1f2", borderRadius: "4px", boxShadow: "rgba(0,0,0,0.02) 0px 1px 3px 0px, rgba(220,38,38,0.15) 0px 0px 0px 1px" }}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
              <a
                href={waLink(viewing.phone)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-[32px] items-center gap-1.5 px-[14px] text-[12px] font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                style={{ background: "#16a34a", borderRadius: "4px", boxShadow: "rgba(0,0,0,0.02) 0px 1px 3px 0px, rgba(22,163,74,0.2) 0px 0px 0px 1px" }}
              >
                <Phone className="h-3.5 w-3.5" />
                Reply on WhatsApp
              </a>
            </>
          )
        }
      >
        {viewing && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                {viewing.photo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={viewing.photo} alt="" className="h-10 w-10 shrink-0 rounded-full border border-[#e4e7eb] object-cover" />
                )}
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-bold text-[#18233b]">{viewing.name}</p>
                  <p className="text-[10px] font-medium text-[#6c7587]">{formatDateTime(viewing.createdAt)}</p>
                </div>
              </div>
              <select
                value={viewing.status}
                disabled={updatingId === viewing._id}
                onChange={(e) => handleStatusChange(viewing._id, e.target.value as FeedbackStatus)}
                className={`h-[26px] cursor-pointer appearance-none rounded-[4px] px-[10px] pr-[24px] text-[9px] font-bold outline-none bg-no-repeat bg-[right_7px_center] shadow-xs transition disabled:opacity-50 ${STATUS_STYLES[viewing.status]}`}
                style={selectArrow}
              >
                <option value="new">New</option>
                <option value="reviewed">Reviewed</option>
                <option value="contacted">Contacted</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Mobile Number", value: `+91 ${viewing.phone}`, icon: Phone },
                { label: "Email", value: viewing.email || "—", icon: Mail },
                { label: "Company / Organisation", value: viewing.company, icon: Building2 },
                { label: "Designation", value: viewing.designation || "—", icon: UserRound },
                { label: "Participated As", value: viewing.role, icon: Tag },
                { label: "Edition", value: viewing.edition, icon: CalendarDays },
              ].map(({ label, value, icon: FieldIcon }) => (
                <div key={label} className="rounded-[4px] border border-[#e4e7eb] bg-[#f8fafc] px-2.5 py-1.5">
                  <p className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-wide text-[#94a3b8]">
                    <FieldIcon className="h-2.5 w-2.5" />
                    {label}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] font-semibold text-[#1e293b]" title={value}>{value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Overall Experience", value: viewing.ratings?.overall },
                { label: "Business Networking", value: viewing.ratings?.networking },
                { label: "Quality of Participants", value: viewing.ratings?.quality },
                { label: "Event Management", value: viewing.ratings?.management },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between rounded-[4px] border border-[#e4e7eb] bg-white px-2.5 py-1.5">
                  <span className="text-[9px] font-semibold text-[#475569]">{label}</span>
                  <Stars value={value || 0} size={11} />
                </div>
              ))}
            </div>

            <div>
              <p className="mb-1 text-[8px] font-bold uppercase tracking-wide text-[#94a3b8]">Most valuable part</p>
              <div className="rounded-[4px] border border-[#e4e7eb] bg-[#f8fafc] p-3 text-[11px] leading-relaxed text-[#334155] whitespace-pre-wrap">{viewing.valuable}</div>
            </div>
            {viewing.improve && (
              <div>
                <p className="mb-1 text-[8px] font-bold uppercase tracking-wide text-[#94a3b8]">What can we do better</p>
                <div className="rounded-[4px] border border-[#e4e7eb] bg-[#f8fafc] p-3 text-[11px] leading-relaxed text-[#334155] whitespace-pre-wrap">{viewing.improve}</div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 text-[9px] font-bold">
              <span className={`rounded-full px-2 py-[3px] ${viewing.consentToFeature ? "bg-[#e8f5e9] text-[#15803d]" : "bg-[#f1f5f9] text-[#64748b]"}`}>
                {viewing.consentToFeature ? "Can be featured on the website" : "Keep private — do not feature"}
              </span>
              {viewing.wantsContact && <span className="rounded-full bg-[#e0f2fe] px-2 py-[3px] text-[#0369a1]">Wants the team to contact them</span>}
              {viewing.logo && (
                <a href={viewing.logo} target="_blank" rel="noreferrer" className="rounded-full bg-[#fef3c7] px-2 py-[3px] text-[#92400e] hover:underline">
                  View company logo
                </a>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
