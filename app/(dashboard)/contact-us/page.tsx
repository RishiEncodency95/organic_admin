"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  Eye,
  Inbox,
  Mail,
  MessageSquareText,
  Phone,
  PhoneCall,
  Search,
  Sparkles,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import Swal from "sweetalert2";
import typography from "../pages/PagesTypography.module.css";
import Modal from "@/components/ui/Modal";
import { ApiRequestError } from "@/lib/api";
import { contactEnquiryApi, type ContactEnquiry, type ContactEnquiryStatus } from "@/lib/contactEnquiryApi";

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
   FORMATTING HELPERS
========================================================= */

function formatDateTime(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const isWithinLastDays = (value: string, days: number) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return false;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return d.getTime() >= cutoff;
};

/* =========================================================
   STATUS BADGE
========================================================= */

const STATUS_STYLES: Record<ContactEnquiryStatus, string> = {
  pending: "bg-[#fff8e1] text-[#b78103] border border-[#ffe082]",
  contacted: "bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]",
  resolved: "bg-[#e8f5e9] text-[#23714a] border border-[#a5d6a7]",
};

const STATUS_LABEL: Record<ContactEnquiryStatus, string> = {
  pending: "Pending",
  contacted: "Contacted",
  resolved: "Resolved",
};

/* =========================================================
   STAT CARDS (matching Job Postings' metric-card style)
========================================================= */

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
  value: number;
  icon: LucideIcon;
  tone: keyof typeof toneClass;
  gradient: string;
  borderColor: string;
  numColor: string;
  footer: string;
  onClick: () => void;
}

const PAGE_SIZE = 10;

const TABS: { key: "all" | ContactEnquiryStatus; label: string }[] = [
  { key: "all", label: "All Messages" },
  { key: "pending", label: "Pending" },
  { key: "contacted", label: "Contacted" },
  { key: "resolved", label: "Resolved" },
];

/* =========================================================
   CONTACT US MESSAGES PAGE
========================================================= */

export default function ContactUsPage() {
  const [enquiries, setEnquiries] = useState<ContactEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | ContactEnquiryStatus>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<ContactEnquiry | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await contactEnquiryApi.list();
      setEnquiries(data.enquiries || []);
    } catch (err) {
      setLoadError(err instanceof ApiRequestError ? err.message : "Failed to load contact messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changeTab = (next: typeof tab) => {
    setTab(next);
    setPage(1);
  };

  const handleStatusChange = async (id: string, nextStatus: ContactEnquiryStatus) => {
    const previous = enquiries;
    setEnquiries((prev) => prev.map((e) => (e._id === id ? { ...e, status: nextStatus } : e)));
    setViewing((v) => (v && v._id === id ? { ...v, status: nextStatus } : v));
    setUpdatingId(id);
    try {
      await contactEnquiryApi.updateStatus(id, nextStatus);
      showSuccess(`Marked as "${STATUS_LABEL[nextStatus]}"`);
    } catch (err) {
      setEnquiries(previous);
      showError(err instanceof ApiRequestError ? err.message : "Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (enquiry: ContactEnquiry) => {
    const result = await Swal.fire({
      title: `Delete message from "${enquiry.name}"?`,
      text: "This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#dc2626",
      background: "#1e2433",
      color: "#e2e8f0",
    });
    if (!result.isConfirmed) return;

    const previous = enquiries;
    setEnquiries((prev) => prev.filter((e) => e._id !== enquiry._id));
    setViewing((v) => (v && v._id === enquiry._id ? null : v));
    try {
      await contactEnquiryApi.remove(enquiry._id);
      showSuccess("Message deleted");
    } catch (err) {
      setEnquiries(previous);
      showError(err instanceof ApiRequestError ? err.message : "Failed to delete message.");
    }
  };

  const copyToClipboard = (label: string, value: string) => {
    navigator.clipboard?.writeText(value).then(() => {
      setCopiedField(label);
      showSuccess(`${label} copied!`);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopiedField(null), 1500);
    });
  };

  const counts = useMemo(
    () => ({
      all: enquiries.length,
      pending: enquiries.filter((e) => e.status === "pending").length,
      contacted: enquiries.filter((e) => e.status === "contacted").length,
      resolved: enquiries.filter((e) => e.status === "resolved").length,
      today: enquiries.filter((e) => isSameDay(new Date(e.createdAt), new Date())).length,
      week: enquiries.filter((e) => isWithinLastDays(e.createdAt, 7)).length,
    }),
    [enquiries]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enquiries.filter((e) => {
      if (tab !== "all" && e.status !== tab) return false;
      if (!q) return true;
      return (
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.phone.toLowerCase().includes(q) ||
        (e.subject || "").toLowerCase().includes(q) ||
        e.message.toLowerCase().includes(q)
      );
    });
  }, [enquiries, tab, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, filtered.length);
  const paginatedRows = filtered.slice(startIndex, endIndex);

  const statCards: StatCardItem[] = useMemo(
    () => [
      {
        title: "TOTAL MESSAGES",
        value: counts.all,
        icon: Inbox,
        tone: "slate",
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #e2e8f0 100%)",
        borderColor: "#e2e8f0",
        numColor: "#334155",
        footer: "View all messages",
        onClick: () => changeTab("all"),
      },
      {
        title: "PENDING",
        value: counts.pending,
        icon: Clock3,
        tone: "amber",
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #fed7aa 100%)",
        borderColor: "#fed7aa",
        numColor: "#c2410c",
        footer: "View pending",
        onClick: () => changeTab("pending"),
      },
      {
        title: "CONTACTED",
        value: counts.contacted,
        icon: PhoneCall,
        tone: "blue",
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #bae6fd 100%)",
        borderColor: "#bae6fd",
        numColor: "#0284c7",
        footer: "View contacted",
        onClick: () => changeTab("contacted"),
      },
      {
        title: "RESOLVED",
        value: counts.resolved,
        icon: CheckCircle2,
        tone: "emerald",
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #bbf7d0 100%)",
        borderColor: "#bbf7d0",
        numColor: "#15803d",
        footer: "View resolved",
        onClick: () => changeTab("resolved"),
      },
      {
        title: "TODAY",
        value: counts.today,
        icon: Sparkles,
        tone: "violet",
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #ddd6fe 100%)",
        borderColor: "#ddd6fe",
        numColor: "#6d28d9",
        footer: "New today",
        onClick: () => changeTab("all"),
      },
      {
        title: "LAST 7 DAYS",
        value: counts.week,
        icon: MessageSquareText,
        tone: "teal",
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #99f6e4 100%)",
        borderColor: "#99f6e4",
        numColor: "#0f766e",
        footer: "This week",
        onClick: () => changeTab("all"),
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
              Contact Us Messages
            </h1>
            <p className="mt-0.5 text-[9px] font-medium text-[#6c7587]">
              WhatsApp-verified submissions from the website&apos;s &quot;Send Us a Message&quot; contact form.
            </p>
          </div>
        </div>

        {/* =================================================
            STATS ROW
        ================================================= */}
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
                  <div
                    className={`grid h-[24px] w-[24px] shrink-0 place-items-center rounded-full ring-1 bg-white/80 shadow-xs ${toneClass[item.tone]}`}
                  >
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

        {/* =================================================
            TABLE CARD
        ================================================= */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[7px] border border-[#e8e5df] bg-white">
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
                {t.label} ({counts[t.key === "all" ? "all" : t.key]})
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
                placeholder="Search by name, email, WhatsApp number, subject or message..."
                className="h-[30px] w-full rounded-[5px] border border-[#e5e6e2] bg-white pl-[26px] pr-[9px] text-[9.5px] font-medium text-[#414b5e] outline-none placeholder:text-[#9aa0aa] focus:border-[#8fa98e]"
              />
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left">
              <thead>
                <tr className="h-[32px] border-b border-[#e8e5df] bg-[#233D4D]">
                  <th className="w-[36px] px-[12px] py-[6px] text-[8.5px] font-bold text-white uppercase tracking-wider">S.No</th>
                  <th className="px-[12px] py-[6px] text-[8.5px] font-bold text-white uppercase tracking-wider">Name</th>
                  <th className="px-[12px] py-[6px] text-[8.5px] font-bold text-white uppercase tracking-wider">Email</th>
                  <th className="px-[12px] py-[6px] text-[8.5px] font-bold text-white uppercase tracking-wider">WhatsApp No.</th>
                  <th className="px-[12px] py-[6px] text-[8.5px] font-bold text-white uppercase tracking-wider">Alternate No.</th>
                  <th className="px-[12px] py-[6px] text-[8.5px] font-bold text-white uppercase tracking-wider">Subject</th>
                  <th className="px-[12px] py-[6px] text-[8.5px] font-bold text-white uppercase tracking-wider">Status</th>
                  <th className="px-[12px] py-[6px] text-[8.5px] font-bold text-white uppercase tracking-wider">Received</th>
                  <th className="px-[12px] py-[6px] text-right text-[8.5px] font-bold text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0ec]">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[10px] text-[#6c7587]">
                      Loading contact messages…
                    </td>
                  </tr>
                ) : loadError ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[10px] font-semibold text-red-600">
                      {loadError}
                    </td>
                  </tr>
                ) : paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[10px] text-[#6c7587]">
                      No messages match your filters.
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((enquiry, rowIndex) => (
                    <tr key={enquiry._id} className="transition hover:bg-slate-50/80">
                      <td className="px-[12px] py-[8px] text-[9px] font-semibold text-[#6c7587]">{startIndex + rowIndex + 1}</td>
                      <td className="px-[12px] py-[8px]">
                        <button
                          type="button"
                          onClick={() => setViewing(enquiry)}
                          className="text-[9px] font-bold text-[#4B1426] hover:underline"
                        >
                          {enquiry.name}
                        </button>
                      </td>
                      <td className="px-[12px] py-[8px] text-[9px] font-medium text-[#334155]">{enquiry.email}</td>
                      <td className="px-[12px] py-[8px] text-[9px] font-bold text-[#166534]">{enquiry.phone}</td>
                      <td className="px-[12px] py-[8px] text-[9px] font-medium text-[#334155]">{enquiry.alternatePhone || "—"}</td>
                      <td className="max-w-[160px] truncate px-[12px] py-[8px] text-[9px] font-medium text-[#334155]" title={enquiry.subject}>
                        {enquiry.subject || "—"}
                      </td>
                      <td className="px-[12px] py-[8px]">
                        <select
                          value={enquiry.status}
                          disabled={updatingId === enquiry._id}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleStatusChange(enquiry._id, e.target.value as ContactEnquiryStatus)}
                          className={`h-[22px] cursor-pointer appearance-none rounded-[4px] px-[8px] pr-[22px] text-[8px] font-bold outline-none bg-no-repeat bg-[right_6px_center] shadow-xs transition disabled:opacity-50 ${STATUS_STYLES[enquiry.status]}`}
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                          }}
                        >
                          <option value="pending" className="bg-white font-bold text-[#b78103]">Pending</option>
                          <option value="contacted" className="bg-white font-bold text-[#0369a1]">Contacted</option>
                          <option value="resolved" className="bg-white font-bold text-[#23714a]">Resolved</option>
                        </select>
                      </td>
                      <td className="px-[12px] py-[8px] text-[8.5px] font-medium text-[#6c7587]">{formatDateTime(enquiry.createdAt)}</td>
                      <td className="px-[12px] py-[8px]">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            title="View Message"
                            onClick={() => setViewing(enquiry)}
                            className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] bg-orange-500/10 text-orange-600 backdrop-blur-md border border-orange-400/30 shadow-[0_2px_6px_rgba(249,115,22,0.12)] transition-all hover:bg-orange-500/20 hover:border-orange-400/50 hover:shadow-[0_3px_10px_rgba(249,115,22,0.25)] hover:scale-105 active:scale-95"
                          >
                            <Eye className="h-[12px] w-[12px] text-orange-600" />
                          </button>
                          <a
                            href={`https://wa.me/${enquiry.phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Message on WhatsApp"
                            className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] bg-emerald-500/10 text-emerald-600 backdrop-blur-md border border-emerald-400/30 shadow-[0_2px_6px_rgba(16,185,129,0.12)] transition-all hover:bg-emerald-500/20 hover:border-emerald-400/50 hover:shadow-[0_3px_10px_rgba(16,185,129,0.25)] hover:scale-105 active:scale-95"
                          >
                            <Phone className="h-[12px] w-[12px] text-emerald-600" />
                          </a>
                          <button
                            type="button"
                            title="Delete Message"
                            onClick={() => handleDelete(enquiry)}
                            className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] bg-red-500/10 text-red-600 backdrop-blur-md border border-red-400/30 shadow-[0_2px_6px_rgba(220,38,38,0.12)] transition-all hover:bg-red-500/20 hover:border-red-400/50 hover:shadow-[0_3px_10px_rgba(220,38,38,0.25)] hover:scale-105 active:scale-95"
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
                Showing {startIndex + 1} to {endIndex} of {filtered.length} messages
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
            </div>
          )}
        </div>
      </div>

      {/* =================================================
          VIEW MESSAGE MODAL
      ================================================= */}
      <Modal
        isOpen={!!viewing}
        onClose={() => setViewing(null)}
        title="Contact Message"
        size="md"
        footer={
          viewing && (
            <>
              <button
                type="button"
                onClick={() => handleDelete(viewing)}
                className="inline-flex h-[32px] items-center gap-1.5 px-[14px] text-[12px] font-semibold text-red-600 transition-all hover:bg-red-100 active:scale-95"
                style={{
                  background: "#fff1f2",
                  borderRadius: "4px",
                  boxShadow: "rgba(0,0,0,0.02) 0px 1px 3px 0px, rgba(220,38,38,0.15) 0px 0px 0px 1px",
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
              <a
                href={`https://wa.me/${viewing.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-[32px] items-center gap-1.5 px-[14px] text-[12px] font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                style={{
                  background: "#16a34a",
                  borderRadius: "4px",
                  boxShadow: "rgba(0,0,0,0.02) 0px 1px 3px 0px, rgba(22,163,74,0.2) 0px 0px 0px 1px",
                }}
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-bold text-[#18233b]">{viewing.name}</p>
                <p className="text-[10px] font-medium text-[#6c7587]">{formatDateTime(viewing.createdAt)}</p>
              </div>
              <select
                value={viewing.status}
                disabled={updatingId === viewing._id}
                onChange={(e) => handleStatusChange(viewing._id, e.target.value as ContactEnquiryStatus)}
                className={`h-[26px] cursor-pointer appearance-none rounded-[4px] px-[10px] pr-[24px] text-[9px] font-bold outline-none bg-no-repeat bg-[right_7px_center] shadow-xs transition disabled:opacity-50 ${STATUS_STYLES[viewing.status]}`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='9' height='9' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                }}
              >
                <option value="pending">Pending</option>
                <option value="contacted">Contacted</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Email", value: viewing.email, icon: Mail },
                { label: "WhatsApp Number", value: viewing.phone, icon: Phone },
                ...(viewing.alternatePhone ? [{ label: "Alternate Number", value: viewing.alternatePhone, icon: Phone }] : []),
                { label: "Subject", value: viewing.subject || "—", icon: MessageSquareText },
              ].map(({ label, value, icon: FieldIcon }) => (
                <div key={label} className="rounded-[4px] border border-[#e4e7eb] bg-[#f8fafc] px-2.5 py-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-wide text-[#94a3b8]">
                      <FieldIcon className="h-2.5 w-2.5" />
                      {label}
                    </p>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(label, value)}
                      className="text-[#64748b] hover:text-[#0284c7]"
                      title={`Copy ${label}`}
                    >
                      {copiedField === label ? <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" /> : <Copy className="h-2.5 w-2.5" />}
                    </button>
                  </div>
                  <p className="mt-0.5 truncate text-[10px] font-semibold text-[#1e293b]">{value}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="mb-1 text-[8px] font-bold uppercase tracking-wide text-[#94a3b8]">Message</p>
              <div className="rounded-[4px] border border-[#e4e7eb] bg-[#f8fafc] p-3 text-[11px] leading-relaxed text-[#334155] whitespace-pre-wrap">
                {viewing.message}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
