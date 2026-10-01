"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  Check,
  Copy,
  ExternalLink,
  FileText,
  Inbox,
  Loader2,
  Mail,
  MessageCircleQuestion,
  MessagesSquare,
  Phone,
  RefreshCw,
  Search,
  Send,
} from "lucide-react";
import typography from "../../pages/PagesTypography.module.css";
import DateRangeFilter, { rangeLabel, resolveRange, type DateRange } from "@/components/chatbot/DateRangeFilter";
import {
  avatarColor,
  dayLabel,
  formatDateTime,
  formatTime,
  initials,
  MessageText,
  pagePath,
  timeAgo,
  whatsappLink,
} from "@/components/chatbot/chatbotUtils";
import { chatbotApi, type ChatDetail, type ChatSummary } from "@/lib/chatbotApi";

const PAGE_SIZE = 30;

export default function ChatbotConversationsPage() {
  return (
    <Suspense fallback={null}>
      <Conversations />
    </Suspense>
  );
}

function Conversations() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id");

  const [range, setRange] = useState<DateRange>({ key: "all" });
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [loadedDetail, setLoadedDetail] = useState<{ key: string; chat: ChatDetail | null } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Loading = the list on screen is not for the current filter / page yet
  const listKey = JSON.stringify([range, debounced, page, reloadKey]);
  const [loadedListKey, setLoadedListKey] = useState<string | null>(null);
  const loading = loadedListKey !== listKey;

  // Conversation list (first page replaces, "Load more" appends)
  useEffect(() => {
    let cancelled = false;
    chatbotApi
      .list({ ...resolveRange(range), search: debounced, page, limit: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        setChats((prev) => (page === 1 ? res.chats : [...prev, ...res.chats]));
        setTotal(res.total);
        setError(null);
      })
      .catch((e: Error) => !cancelled && setError(e.message || "Could not load conversations"))
      .finally(() => !cancelled && setLoadedListKey(listKey));
    return () => {
      cancelled = true;
    };
  }, [range, debounced, page, listKey]);

  // Selected conversation
  const detailKey = selectedId ? `${selectedId}:${reloadKey}` : null;
  useEffect(() => {
    if (!selectedId || !detailKey) return;
    let cancelled = false;
    chatbotApi
      .get(selectedId)
      .then((d) => !cancelled && setLoadedDetail({ key: detailKey, chat: d }))
      .catch(() => !cancelled && setLoadedDetail({ key: detailKey, chat: null }));
    return () => {
      cancelled = true;
    };
  }, [selectedId, detailKey]);

  // Keep showing the current chat while it refreshes; switch only once the new one arrives
  const detailLoading = !!detailKey && loadedDetail?.key !== detailKey;
  const detail = selectedId && loadedDetail?.chat?._id === selectedId ? loadedDetail.chat : detailLoading ? null : (loadedDetail?.chat ?? null);

  useEffect(() => {
    const el = transcriptRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [detail]);

  const resetList = (fn: () => void) => {
    fn();
    setPage(1);
  };

  const select = (id: string | null) => router.replace(id ? `/chatbot/conversations?id=${id}` : "/chatbot/conversations", { scroll: false });

  const copy = (key: string, value?: string) => {
    if (!value) return;
    navigator.clipboard?.writeText(value).catch(() => undefined);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  // Group the transcript by day for date separators
  const groups = useMemo(() => {
    const out: { day: string; items: ChatDetail["messages"] }[] = [];
    for (const m of detail?.messages ?? []) {
      const day = new Date(m.createdAt).toDateString();
      if (!out.length || out[out.length - 1].day !== day) out.push({ day, items: [] });
      out[out.length - 1].items.push(m);
    }
    return out;
  }, [detail]);

  const questionCount = detail?.messages.filter((m) => m.role === "user").length ?? 0;

  return (
    <div className={`${typography.pages} min-h-[calc(100vh-100px)] w-full bg-white text-[#18233b]`}>
      <div className="flex min-h-full flex-col px-[18px] pb-[16px] pt-[14px]">
        {/* HEADER */}
        <div className="mb-[12px] flex flex-wrap items-end justify-between gap-[10px] border-b-[2px] border-[#293681] pb-[10px]">
          <div className="flex items-center gap-[10px]">
            <div className="grid h-[38px] w-[38px] place-items-center rounded-[10px] bg-gradient-to-br from-[#14532d] to-[#3b8c2a] text-white shadow-md">
              <MessagesSquare className="h-[19px] w-[19px]" />
            </div>
            <div>
              <h1 className="text-[19px] font-bold leading-[1.15] tracking-[-0.018em] text-[#23471d]">Chat Conversations</h1>
              <p className="mt-0.5 text-[9px] font-medium text-[#6c7587]">
                Every Organic Mitra chat with the visitor&apos;s details · <span className="font-semibold text-[#166b40]">{rangeLabel(range)}</span> ·{" "}
                {total} {total === 1 ? "chat" : "chats"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-[8px]">
            <DateRangeFilter value={range} onChange={(r) => resetList(() => setRange(r))} />
            <button
              type="button"
              onClick={() => resetList(() => setReloadKey((k) => k + 1))}
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

        {/* TWO-PANE INBOX */}
        <div className="flex h-[calc(100vh-190px)] min-h-[480px] overflow-hidden rounded-[10px] border border-[#e8e5df] bg-white">
          {/* LIST */}
          <aside className={`w-full shrink-0 flex-col border-r border-[#e8e5df] md:flex md:w-[320px] ${selectedId ? "hidden" : "flex"}`}>
            <div className="border-b border-[#f0f0ec] p-[10px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-[9px] top-1/2 h-[12px] w-[12px] -translate-y-1/2 text-[#9aa0aa]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => resetList(() => setSearch(e.target.value))}
                  placeholder="Search name, phone, email or message..."
                  className="h-[30px] w-full rounded-[6px] border border-[#e5e6e2] bg-[#f8faf7] pl-[26px] pr-[9px] text-[10px] font-medium text-[#414b5e] outline-none placeholder:text-[#9aa0aa] focus:border-[#8fa98e] focus:bg-white"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {!loading && chats.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-[8px] p-[20px] text-center">
                  <Inbox className="h-[26px] w-[26px] text-[#cbd5e1]" />
                  <p className="text-[10px] font-semibold text-[#6c7587]">No conversations found</p>
                  <p className="text-[8px] text-[#9aa0aa]">Try another date range or search.</p>
                </div>
              ) : (
                chats.map((c) => {
                  const active = c._id === selectedId;
                  return (
                    <button
                      key={c._id}
                      type="button"
                      onClick={() => select(c._id)}
                      className={`flex w-full items-start gap-[10px] border-b border-[#f4f4f0] px-[12px] py-[10px] text-left transition ${
                        active ? "bg-[#ecf7ee] shadow-[inset_3px_0_0_#166b40]" : "hover:bg-[#f8faf7]"
                      }`}
                    >
                      <span
                        className="grid h-[36px] w-[36px] shrink-0 place-items-center rounded-full text-[10px] font-bold text-white"
                        style={{ background: avatarColor(c.lead?.phone || c._id) }}
                      >
                        {initials(c.lead?.name)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-[10px] font-bold text-[#18233b]">{c.lead?.name || "Visitor"}</span>
                          <span className="shrink-0 text-[8px] text-[#9aa0aa]">{timeAgo(c.updatedAt)}</span>
                        </span>
                        <span className="block truncate text-[8px] text-[#6c7587]">{c.lead?.phone || c.lead?.email || "—"}</span>
                        <span className="mt-[3px] flex items-center justify-between gap-2">
                          <span className="truncate text-[9px] text-[#4b5563]">
                            {c.lastMessage ? (c.lastMessage.role === "assistant" ? "🤖 " : "") + c.lastMessage.content : "Filled details, no question yet"}
                          </span>
                          {c.questionCount > 0 && (
                            <span className="shrink-0 rounded-full bg-[#166b40] px-[6px] py-[1px] text-[8px] font-bold text-white">{c.questionCount}</span>
                          )}
                        </span>
                      </span>
                    </button>
                  );
                })
              )}

              {loading && (
                <div className="flex items-center justify-center gap-2 py-[14px] text-[9px] text-[#6c7587]">
                  <Loader2 className="h-[14px] w-[14px] animate-spin" /> Loading...
                </div>
              )}
              {!loading && chats.length < total && (
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  className="w-full py-[10px] text-[9px] font-bold text-[#166b40] hover:bg-[#f8faf7]"
                >
                  Load more ({total - chats.length} more)
                </button>
              )}
            </div>
          </aside>

          {/* DETAIL */}
          <section className={`min-w-0 flex-1 flex-col ${selectedId ? "flex" : "hidden md:flex"}`}>
            {!selectedId ? (
              <div className="flex h-full flex-col items-center justify-center gap-[10px] bg-[#f8faf7] p-[24px] text-center">
                <div className="grid h-[64px] w-[64px] place-items-center rounded-full bg-white shadow-sm ring-1 ring-[#e5e6e2]">
                  <Image src="/bharat-organic-logo.png" alt="" width={44} height={44} className="h-[42px] w-[42px] object-contain" />
                </div>
                <p className="text-[12px] font-bold text-[#18233b]">Select a conversation</p>
                <p className="max-w-[280px] text-[9px] text-[#6c7587]">Choose a chat on the left to read the full conversation between the visitor and Organic Mitra.</p>
              </div>
            ) : detailLoading && !detail ? (
              <div className="flex h-full items-center justify-center gap-2 text-[10px] text-[#6c7587]">
                <Loader2 className="h-[16px] w-[16px] animate-spin" /> Loading conversation...
              </div>
            ) : !detail ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                <p className="text-[11px] font-semibold text-[#6c7587]">Conversation not found</p>
                <button type="button" onClick={() => select(null)} className="text-[9px] font-bold text-[#166b40] hover:underline">
                  Back to list
                </button>
              </div>
            ) : (
              <>
                {/* Visitor header */}
                <div className="border-b border-[#e8e5df] bg-white px-[14px] py-[10px]">
                  <div className="flex flex-wrap items-center gap-[10px]">
                    <button
                      type="button"
                      onClick={() => select(null)}
                      aria-label="Back to list"
                      className="grid h-[28px] w-[28px] place-items-center rounded-full text-[#4b5563] hover:bg-[#f1f5f2] md:hidden"
                    >
                      <ArrowLeft className="h-[15px] w-[15px]" />
                    </button>
                    <span
                      className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-full text-[12px] font-bold text-white"
                      style={{ background: avatarColor(detail.lead?.phone || detail._id) }}
                    >
                      {initials(detail.lead?.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-bold text-[#18233b]">{detail.lead?.name || "Visitor"}</p>
                      <div className="mt-[2px] flex flex-wrap items-center gap-x-[12px] gap-y-[2px] text-[9px] text-[#4b5563]">
                        {detail.lead?.phone && (
                          <button type="button" onClick={() => copy("phone", detail.lead?.phone)} className="flex items-center gap-[4px] hover:text-[#166b40]">
                            <Phone className="h-[11px] w-[11px]" /> {detail.lead.phone}
                            {copied === "phone" ? <Check className="h-[10px] w-[10px] text-[#166b40]" /> : <Copy className="h-[10px] w-[10px] text-[#9aa0aa]" />}
                          </button>
                        )}
                        {detail.lead?.email && (
                          <button type="button" onClick={() => copy("email", detail.lead?.email)} className="flex items-center gap-[4px] hover:text-[#166b40]">
                            <Mail className="h-[11px] w-[11px]" /> {detail.lead.email}
                            {copied === "email" ? <Check className="h-[10px] w-[10px] text-[#166b40]" /> : <Copy className="h-[10px] w-[10px] text-[#9aa0aa]" />}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-[6px]">
                      {detail.lead?.phone && (
                        <>
                          <a
                            href={`tel:${detail.lead.phone}`}
                            className="flex h-[30px] items-center gap-[5px] rounded-[6px] bg-[#1d4ed8] px-[10px] text-[9px] font-bold text-white transition hover:brightness-110"
                          >
                            <Phone className="h-[12px] w-[12px]" /> Call
                          </a>
                          <a
                            href={whatsappLink(detail.lead.phone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-[30px] items-center gap-[5px] rounded-[6px] bg-[#25D366] px-[10px] text-[9px] font-bold text-white transition hover:brightness-105"
                          >
                            <Send className="h-[12px] w-[12px]" /> WhatsApp
                          </a>
                        </>
                      )}
                      {detail.lead?.email && (
                        <a
                          href={`mailto:${detail.lead.email}`}
                          className="flex h-[30px] items-center gap-[5px] rounded-[6px] border border-[#e5e6e2] px-[10px] text-[9px] font-bold text-[#18233b] transition hover:border-[#166b40] hover:text-[#166b40]"
                        >
                          <Mail className="h-[12px] w-[12px]" /> Email
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Info chips */}
                  <div className="mt-[8px] flex flex-wrap gap-[6px]">
                    <InfoChip icon={<CalendarClock className="h-[11px] w-[11px]" />} text={`Started ${formatDateTime(detail.createdAt)}`} />
                    <InfoChip icon={<MessageCircleQuestion className="h-[11px] w-[11px]" />} text={`${questionCount} ${questionCount === 1 ? "question" : "questions"}`} />
                    {detail.pageUrl && (
                      <a href={detail.pageUrl} target="_blank" rel="noopener noreferrer">
                        <InfoChip icon={<FileText className="h-[11px] w-[11px]" />} text={pagePath(detail.pageUrl)} trailing={<ExternalLink className="h-[9px] w-[9px]" />} />
                      </a>
                    )}
                    <InfoChip
                      icon={<Send className="h-[11px] w-[11px]" />}
                      text={detail.whatsappSentAt ? `WhatsApp sent ${timeAgo(detail.whatsappSentAt)}` : "WhatsApp not sent"}
                      tone={detail.whatsappSentAt ? "green" : "grey"}
                    />
                    {detail.enquiryId && (
                      <Link href="/contact-us">
                        <InfoChip icon={<Inbox className="h-[11px] w-[11px]" />} text="Saved in Contact Us" tone="green" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Transcript */}
                <div
                  ref={transcriptRef}
                  className="flex-1 overflow-y-auto bg-[#f3f6f1] bg-[radial-gradient(#dfe7dc_1px,transparent_1px)] bg-[size:18px_18px] px-[14px] py-[12px]"
                >
                  {detail.messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                      <p className="rounded-full bg-white px-[12px] py-[6px] text-[9px] font-medium text-[#6c7587] shadow-sm">
                        Visitor filled their details but hasn&apos;t asked anything yet.
                      </p>
                    </div>
                  ) : (
                    groups.map((g) => (
                      <div key={g.day} className="flex flex-col gap-[8px]">
                        <div className="my-[6px] flex justify-center">
                          <span className="rounded-full bg-white/90 px-[10px] py-[3px] text-[8px] font-bold uppercase tracking-wide text-[#6c7587] shadow-sm">
                            {dayLabel(g.items[0].createdAt)}
                          </span>
                        </div>
                        {g.items.map((m, i) =>
                          m.role === "user" ? (
                            <div key={i} className="flex items-end gap-[6px]">
                              <span
                                className="grid h-[24px] w-[24px] shrink-0 place-items-center rounded-full text-[8px] font-bold text-white"
                                style={{ background: avatarColor(detail.lead?.phone || detail._id) }}
                              >
                                {initials(detail.lead?.name)}
                              </span>
                              <div className="max-w-[72%] rounded-[12px] rounded-bl-[3px] bg-white px-[11px] py-[7px] shadow-sm ring-1 ring-black/5">
                                <p className="whitespace-pre-wrap break-words text-[10px] text-[#18233b]">{m.content}</p>
                                <p className="mt-[3px] text-right text-[7px] text-[#9aa0aa]">{formatTime(m.createdAt)}</p>
                              </div>
                            </div>
                          ) : (
                            <div key={i} className="flex items-end justify-end gap-[6px]">
                              <div className="max-w-[72%] rounded-[12px] rounded-br-[3px] bg-gradient-to-br from-[#1f7a3a] to-[#14532d] px-[11px] py-[7px] text-white shadow-sm">
                                <div className="break-words text-[10px] leading-[1.5]">
                                  <MessageText text={m.content} linkClass="font-semibold text-[#bbf7d0] underline underline-offset-2 break-words" />
                                </div>
                                <p className="mt-[3px] text-right text-[7px] text-white/60">Organic Mitra · {formatTime(m.createdAt)}</p>
                              </div>
                              <span className="grid h-[24px] w-[24px] shrink-0 place-items-center rounded-full bg-white text-[12px] shadow-sm ring-1 ring-[#3b8c2a]/30">🤖</span>
                            </div>
                          )
                        )}
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function InfoChip({ icon, text, trailing, tone = "grey" }: { icon: React.ReactNode; text: string; trailing?: React.ReactNode; tone?: "grey" | "green" }) {
  return (
    <span
      className={`inline-flex items-center gap-[4px] rounded-full px-[8px] py-[3px] text-[8px] font-semibold ${
        tone === "green" ? "bg-[#e8f5e9] text-[#166b40]" : "bg-[#f1f5f9] text-[#475569]"
      }`}
    >
      {icon}
      {text}
      {trailing}
    </span>
  );
}
