"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Download, Eye, Inbox, Phone, RefreshCw, Search, Send, UserCheck } from "lucide-react";
import typography from "../../pages/PagesTypography.module.css";
import DateRangeFilter, { rangeLabel, resolveRange, type DateRange } from "@/components/chatbot/DateRangeFilter";
import { avatarColor, downloadCsv, formatDateTime, initials, pagePath, toCsvDate, whatsappLink } from "@/components/chatbot/chatbotUtils";
import { chatbotApi, type ChatSummary } from "@/lib/chatbotApi";

const PAGE_SIZE = 15;

export default function ChatbotLeadsPage() {
  const [range, setRange] = useState<DateRange>({ key: "30d" });
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [rows, setRows] = useState<ChatSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Loading = the rows on screen are not for the current filter yet
  const queryKey = JSON.stringify([range, debounced, reloadKey]);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const loading = loadedKey !== queryKey;

  useEffect(() => {
    let cancelled = false;
    chatbotApi
      .list({ ...resolveRange(range), search: debounced, limit: 1000 })
      .then((res) => {
        if (cancelled) return;
        setRows(res.chats.filter((c) => c.lead?.phone || c.lead?.email));
        setPage(1);
        setError(null);
      })
      .catch((e: Error) => !cancelled && setError(e.message || "Could not load leads"))
      .finally(() => !cancelled && setLoadedKey(queryKey));
    return () => {
      cancelled = true;
    };
  }, [range, debounced, queryKey]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = useMemo(() => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [rows, page]);
  const engaged = rows.filter((r) => r.questionCount > 0).length;
  const whatsapp = rows.filter((r) => r.whatsappSentAt).length;

  const exportCsv = () => {
    downloadCsv(`chatbot-leads-${new Date().toISOString().slice(0, 10)}.csv`, [
      ["Date", "Name", "Email", "Phone", "Page", "Questions", "First Question", "WhatsApp Sent"],
      ...rows.map((r) => [
        toCsvDate(r.createdAt),
        r.lead?.name || "",
        r.lead?.email || "",
        r.lead?.phone || "",
        pagePath(r.pageUrl),
        r.questionCount,
        r.firstQuestion?.content || "",
        r.whatsappSentAt ? "Yes" : "No",
      ]),
    ]);
  };

  return (
    <div className={`${typography.pages} min-h-[calc(100vh-100px)] w-full bg-white text-[#18233b]`}>
      <div className="flex min-h-full flex-col px-[18px] pb-[16px] pt-[14px]">
        {/* HEADER */}
        <div className="mb-[12px] flex flex-wrap items-end justify-between gap-[10px] border-b-[2px] border-[#293681] pb-[10px]">
          <div className="flex items-center gap-[10px]">
            <div className="grid h-[38px] w-[38px] place-items-center rounded-[10px] bg-gradient-to-br from-[#14532d] to-[#3b8c2a] text-white shadow-md">
              <UserCheck className="h-[19px] w-[19px]" />
            </div>
            <div>
              <h1 className="text-[19px] font-bold leading-[1.15] tracking-[-0.018em] text-[#23471d]">Chatbot Leads</h1>
              <p className="mt-0.5 text-[9px] font-medium text-[#6c7587]">
                Visitors who shared their details with Organic Mitra · <span className="font-semibold text-[#166b40]">{rangeLabel(range)}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-[8px]">
            <DateRangeFilter value={range} onChange={setRange} />
            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              aria-label="Refresh"
              className="grid h-[28px] w-[28px] place-items-center rounded-[6px] border border-[#e5e6e2] text-[#4b5563] transition hover:border-[#166b40] hover:text-[#166b40]"
            >
              <RefreshCw className={`h-[13px] w-[13px] ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-[10px] rounded-[7px] border border-red-200 bg-red-50 px-[12px] py-[8px] text-[10px] font-medium text-red-700">{error}</div>
        )}

        {/* SUMMARY STRIP */}
        <div className="mb-[12px] grid grid-cols-3 gap-2">
          {[
            { label: "Total Leads", value: rows.length, color: "#166b40", bg: "from-white to-[#bbf7d0]" },
            { label: "Asked a Question", value: engaged, color: "#6d28d9", bg: "from-white to-[#ddd6fe]" },
            { label: "WhatsApp Sent", value: whatsapp, color: "#0369a1", bg: "from-white to-[#bae6fd]" },
          ].map((s) => (
            <div key={s.label} className={`rounded-[10px] border border-[#e8e5df] bg-gradient-to-br ${s.bg} px-[12px] py-[9px]`}>
              <p className="text-[8px] font-bold uppercase tracking-wide text-slate-700">{s.label}</p>
              <p className="mt-[2px] text-[18px] font-bold leading-none" style={{ color: s.color }}>
                {loading ? "…" : s.value}
              </p>
            </div>
          ))}
        </div>

        {/* TABLE CARD */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[7px] border border-[#e8e5df] bg-white">
          <div className="flex flex-wrap items-center gap-[8px] border-b border-[#f0f0ec] px-[16px] py-[10px]">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-[9px] top-1/2 h-[12px] w-[12px] -translate-y-1/2 text-[#9aa0aa]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, phone or question..."
                className="h-[30px] w-full rounded-[5px] border border-[#e5e6e2] bg-white pl-[26px] pr-[9px] text-[9.5px] font-medium text-[#414b5e] outline-none placeholder:text-[#9aa0aa] focus:border-[#8fa98e]"
              />
            </div>
            <button
              type="button"
              onClick={exportCsv}
              disabled={!rows.length}
              className="flex h-[30px] items-center gap-[6px] rounded-[5px] bg-[#166b40] px-[12px] text-[9.5px] font-bold text-white transition hover:bg-[#14532d] disabled:opacity-40"
            >
              <Download className="h-[12px] w-[12px]" /> Export CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left">
              <thead>
                <tr className="bg-[#f8faf7] text-[8px] font-bold uppercase tracking-wide text-[#6c7587]">
                  <th className="px-[14px] py-[9px]">Visitor</th>
                  <th className="px-[10px] py-[9px]">Contact</th>
                  <th className="px-[10px] py-[9px]">First Question</th>
                  <th className="px-[10px] py-[9px] text-center">Questions</th>
                  <th className="px-[10px] py-[9px]">Page</th>
                  <th className="px-[10px] py-[9px]">Date</th>
                  <th className="px-[10px] py-[9px] text-center">WhatsApp</th>
                  <th className="px-[14px] py-[9px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && !rows.length ? (
                  <tr>
                    <td colSpan={8} className="py-[40px] text-center text-[10px] text-[#9aa0aa]">
                      Loading leads...
                    </td>
                  </tr>
                ) : pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-[40px]">
                      <div className="flex flex-col items-center gap-[6px] text-center">
                        <Inbox className="h-[24px] w-[24px] text-[#cbd5e1]" />
                        <p className="text-[10px] font-semibold text-[#6c7587]">No leads in this period</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageRows.map((r) => (
                    <tr key={r._id} className="border-t border-[#f0f0ec] align-top transition hover:bg-[#fafcf9]">
                      <td className="px-[14px] py-[10px]">
                        <div className="flex items-center gap-[8px]">
                          <span
                            className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full text-[9px] font-bold text-white"
                            style={{ background: avatarColor(r.lead?.phone || r._id) }}
                          >
                            {initials(r.lead?.name)}
                          </span>
                          <span className="text-[10px] font-bold text-[#18233b]">{r.lead?.name || "—"}</span>
                        </div>
                      </td>
                      <td className="px-[10px] py-[10px] text-[9px] text-[#4b5563]">
                        <p className="font-semibold text-[#18233b]">{r.lead?.phone || "—"}</p>
                        <p className="max-w-[180px] truncate">{r.lead?.email || "—"}</p>
                      </td>
                      <td className="max-w-[260px] px-[10px] py-[10px] text-[9px] text-[#414b5e]">
                        <p className="line-clamp-2">{r.firstQuestion?.content || <span className="italic text-[#9aa0aa]">No question yet</span>}</p>
                      </td>
                      <td className="px-[10px] py-[10px] text-center">
                        <span className="inline-block min-w-[24px] rounded-full bg-[#e8f5e9] px-[7px] py-[2px] text-[9px] font-bold text-[#166b40]">{r.questionCount}</span>
                      </td>
                      <td className="max-w-[160px] truncate px-[10px] py-[10px] text-[9px] text-[#4b5563]">{pagePath(r.pageUrl)}</td>
                      <td className="whitespace-nowrap px-[10px] py-[10px] text-[9px] text-[#4b5563]">{formatDateTime(r.createdAt)}</td>
                      <td className="px-[10px] py-[10px] text-center">
                        <span
                          className={`inline-block rounded-full px-[8px] py-[2px] text-[8px] font-bold ${
                            r.whatsappSentAt ? "bg-[#dcfce7] text-[#15803d]" : "bg-[#f1f5f9] text-[#64748b]"
                          }`}
                        >
                          {r.whatsappSentAt ? "Sent" : "Not sent"}
                        </span>
                      </td>
                      <td className="px-[14px] py-[10px]">
                        <div className="flex items-center justify-end gap-[5px]">
                          <Link
                            href={`/chatbot/conversations?id=${r._id}`}
                            title="View chat"
                            className="grid h-[26px] w-[26px] place-items-center rounded-[6px] border border-[#e5e6e2] text-[#166b40] transition hover:border-[#166b40] hover:bg-[#ecf7ee]"
                          >
                            <Eye className="h-[12px] w-[12px]" />
                          </Link>
                          {r.lead?.phone && (
                            <>
                              <a
                                href={`tel:${r.lead.phone}`}
                                title="Call"
                                className="grid h-[26px] w-[26px] place-items-center rounded-[6px] border border-[#e5e6e2] text-[#1d4ed8] transition hover:border-[#1d4ed8] hover:bg-[#eff6ff]"
                              >
                                <Phone className="h-[12px] w-[12px]" />
                              </a>
                              <a
                                href={whatsappLink(r.lead.phone)}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="WhatsApp"
                                className="grid h-[26px] w-[26px] place-items-center rounded-[6px] border border-[#e5e6e2] text-[#16a34a] transition hover:border-[#16a34a] hover:bg-[#f0fdf4]"
                              >
                                <Send className="h-[12px] w-[12px]" />
                              </a>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {rows.length > PAGE_SIZE && (
            <div className="flex items-center justify-between border-t border-[#f0f0ec] px-[16px] py-[9px] text-[9px] text-[#6c7587]">
              <span>
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, rows.length)} of {rows.length}
              </span>
              <div className="flex items-center gap-[4px]">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  aria-label="Previous page"
                  className="grid h-[26px] w-[26px] place-items-center rounded-[5px] border border-[#e5e6e2] disabled:opacity-40"
                >
                  <ChevronLeft className="h-[12px] w-[12px]" />
                </button>
                <span className="px-[6px] font-semibold text-[#18233b]">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  aria-label="Next page"
                  className="grid h-[26px] w-[26px] place-items-center rounded-[5px] border border-[#e5e6e2] disabled:opacity-40"
                >
                  <ChevronRight className="h-[12px] w-[12px]" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
