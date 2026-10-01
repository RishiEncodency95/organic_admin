"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  FileText,
  MessageCircleQuestion,
  MessagesSquare,
  RefreshCw,
  Send,
  TrendingUp,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import typography from "../../pages/PagesTypography.module.css";
import DateRangeFilter, { daysInRange, rangeLabel, resolveRange, type DateRange } from "@/components/chatbot/DateRangeFilter";
import { avatarColor, initials, pagePath, timeAgo } from "@/components/chatbot/chatbotUtils";
import { chatbotApi, type ChatStats, type ChatSummary } from "@/lib/chatbotApi";

const toneClass = {
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  blue: "bg-sky-50 text-sky-700 ring-sky-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  teal: "bg-teal-50 text-teal-700 ring-teal-200",
  slate: "bg-slate-50 text-slate-700 ring-slate-200",
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
  href: string;
}

const EMPTY_STATS: ChatStats = {
  totals: { chats: 0, leads: 0, questions: 0, replies: 0, whatsappSent: 0, engaged: 0 },
  daily: [],
  topPages: [],
  latestQuestions: [],
};

export default function ChatbotOverviewPage() {
  const [range, setRange] = useState<DateRange>({ key: "7d" });
  const [stats, setStats] = useState<ChatStats>(EMPTY_STATS);
  const [recent, setRecent] = useState<ChatSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Loading = the data on screen is not for the current filter yet
  const queryKey = JSON.stringify([range, reloadKey]);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const loading = loadedKey !== queryKey;

  useEffect(() => {
    let cancelled = false;
    const q = resolveRange(range);
    Promise.all([chatbotApi.stats(q), chatbotApi.list({ ...q, limit: 6 })])
      .then(([s, l]) => {
        if (cancelled) return;
        setStats(s ?? EMPTY_STATS);
        setRecent(l?.chats ?? []);
        setError(null);
      })
      .catch((e: Error) => !cancelled && setError(e.message || "Could not load chatbot data"))
      .finally(() => !cancelled && setLoadedKey(queryKey));
    return () => {
      cancelled = true;
    };
  }, [range, queryKey]);

  const { totals } = stats;
  const avgQuestions = totals.engaged ? (totals.questions / totals.engaged).toFixed(1) : "0";
  const conversion = totals.chats ? Math.round((totals.engaged / totals.chats) * 100) : 0;

  // Fill empty days so the chart shows a continuous timeline
  const chartData = useMemo(() => {
    const byDay = new Map(stats.daily.map((d) => [d.date, d]));
    return daysInRange(range, stats.daily[0]?.date).map((day) => {
      const d = byDay.get(day);
      const [, m, dd] = day.split("-");
      return {
        day: `${dd}/${m}`,
        Chats: d?.chats ?? 0,
        Questions: d?.questions ?? 0,
      };
    });
  }, [stats.daily, range]);

  const maxPage = Math.max(1, ...stats.topPages.map((p) => p.chats));

  const statCards: StatCardItem[] = [
    {
      title: "TOTAL CHATS",
      value: totals.chats,
      icon: MessagesSquare,
      tone: "emerald",
      gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #bbf7d0 100%)",
      borderColor: "#bbf7d0",
      numColor: "#166b40",
      footer: "View conversations",
      href: "/chatbot/conversations",
    },
    {
      title: "LEADS CAPTURED",
      value: totals.leads,
      icon: UserCheck,
      tone: "blue",
      gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #bae6fd 100%)",
      borderColor: "#bae6fd",
      numColor: "#0369a1",
      footer: "View leads",
      href: "/chatbot/leads",
    },
    {
      title: "QUESTIONS ASKED",
      value: totals.questions,
      icon: MessageCircleQuestion,
      tone: "violet",
      gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #ddd6fe 100%)",
      borderColor: "#ddd6fe",
      numColor: "#6d28d9",
      footer: "By visitors",
      href: "/chatbot/conversations",
    },
    {
      title: "BOT REPLIES",
      value: totals.replies,
      icon: Bot,
      tone: "teal",
      gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #99f6e4 100%)",
      borderColor: "#99f6e4",
      numColor: "#0f766e",
      footer: "AI answered",
      href: "/chatbot/conversations",
    },
    {
      title: "AVG. QUESTIONS / CHAT",
      value: avgQuestions,
      icon: TrendingUp,
      tone: "amber",
      gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #fde68a 100%)",
      borderColor: "#fde68a",
      numColor: "#b45309",
      footer: `${conversion}% asked a question`,
      href: "/chatbot/conversations",
    },
    {
      title: "WHATSAPP SENT",
      value: totals.whatsappSent,
      icon: Send,
      tone: "slate",
      gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #e2e8f0 100%)",
      borderColor: "#e2e8f0",
      numColor: "#334155",
      footer: "Thank-you messages",
      href: "/chatbot/leads",
    },
  ];

  return (
    <div className={`${typography.pages} min-h-[calc(100vh-100px)] w-full bg-white text-[#18233b]`}>
      <div className="flex min-h-full flex-col px-[18px] pb-[16px] pt-[14px]">
        {/* HEADER */}
        <div className="mb-[14px] flex flex-wrap items-end justify-between gap-[10px] border-b-[2px] border-[#293681] pb-[10px]">
          <div className="flex items-center gap-[10px]">
            <div className="grid h-[38px] w-[38px] place-items-center rounded-[10px] bg-gradient-to-br from-[#14532d] to-[#3b8c2a] text-white shadow-md">
              <Bot className="h-[20px] w-[20px]" />
            </div>
            <div>
              <h1 className="text-[19px] font-bold leading-[1.15] tracking-[-0.018em] text-[#23471d]">Chatbot Overview</h1>
              <p className="mt-0.5 text-[9px] font-medium text-[#6c7587]">
                Organic Mitra — AI assistant activity on the website · <span className="font-semibold text-[#166b40]">{rangeLabel(range)}</span>
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
          <div className="mb-[12px] rounded-[7px] border border-red-200 bg-red-50 px-[12px] py-[8px] text-[10px] font-medium text-red-700">{error}</div>
        )}

        {/* STAT CARDS */}
        <div className="mb-[12px] grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
          {statCards.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="relative flex h-[82px] flex-col overflow-hidden rounded-[10px] border bg-white p-1.5 !pb-4.5 transition-all hover:translate-y-[-1px]"
                style={{
                  background: item.gradient,
                  borderColor: item.borderColor,
                  boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
                }}
              >
                <div className="flex items-start gap-1.5">
                  <div className={`grid h-[24px] w-[24px] shrink-0 place-items-center rounded-full bg-white/80 shadow-xs ring-1 ${toneClass[item.tone]}`}>
                    <Icon className="h-3 w-3" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[7px] font-semibold tracking-[0.01em] text-slate-900">{item.title}</p>
                    <span className="mt-1 block text-[16px] font-semibold leading-none tracking-[-0.04em]" style={{ color: item.numColor }}>
                      {loading ? "…" : item.value}
                    </span>
                  </div>
                </div>
                <div className="absolute bottom-1 left-1.5 right-1.5 flex items-center justify-center gap-1 text-[7px] font-semibold text-[#293957]">
                  {item.footer}
                  <ArrowRight className="h-2.5 w-2.5" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* CHART + TOP PAGES */}
        <div className="mb-[12px] grid gap-[12px] xl:grid-cols-3">
          <div className="rounded-[10px] border border-[#e8e5df] bg-white p-[14px] xl:col-span-2">
            <div className="mb-[10px] flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[12px] font-bold text-[#18233b]">Day-wise Activity</p>
                <p className="text-[9px] text-[#6c7587]">New chats and questions asked per day</p>
              </div>
              <div className="flex items-center gap-[12px] text-[9px] font-semibold text-[#4b5563]">
                <span className="flex items-center gap-[5px]">
                  <span className="h-[8px] w-[8px] rounded-full bg-[#3b8c2a]" /> Chats
                </span>
                <span className="flex items-center gap-[5px]">
                  <span className="h-[8px] w-[8px] rounded-full bg-[#f59e0b]" /> Questions
                </span>
              </div>
            </div>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gChats" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b8c2a" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#3b8c2a" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gQuestions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef0ec" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#6c7587" }} tickLine={false} axisLine={false} minTickGap={16} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#6c7587" }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
                  <Area type="monotone" dataKey="Questions" stroke="#f59e0b" strokeWidth={2} fill="url(#gQuestions)" />
                  <Area type="monotone" dataKey="Chats" stroke="#3b8c2a" strokeWidth={2.5} fill="url(#gChats)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-[10px] border border-[#e8e5df] bg-white p-[14px]">
            <p className="text-[12px] font-bold text-[#18233b]">Top Pages</p>
            <p className="mb-[12px] text-[9px] text-[#6c7587]">Where visitors started chatting</p>
            {stats.topPages.length === 0 ? (
              <EmptyNote text="No chats in this period" />
            ) : (
              <div className="flex flex-col gap-[10px]">
                {stats.topPages.map((p) => (
                  <div key={p.pageUrl || "none"}>
                    <div className="mb-[4px] flex items-center justify-between gap-2 text-[10px]">
                      <span className="flex min-w-0 items-center gap-[5px] font-medium text-[#414b5e]">
                        <FileText className="h-[11px] w-[11px] shrink-0 text-[#9aa0aa]" />
                        <span className="truncate">{pagePath(p.pageUrl)}</span>
                      </span>
                      <span className="font-bold text-[#166b40]">{p.chats}</span>
                    </div>
                    <div className="h-[6px] overflow-hidden rounded-full bg-[#f1f5f2]">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#3b8c2a] to-[#86c66f]" style={{ width: `${(p.chats / maxPage) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* LATEST QUESTIONS + RECENT CHATS */}
        <div className="grid gap-[12px] xl:grid-cols-2">
          <div className="rounded-[10px] border border-[#e8e5df] bg-white p-[14px]">
            <p className="text-[12px] font-bold text-[#18233b]">Latest Questions</p>
            <p className="mb-[10px] text-[9px] text-[#6c7587]">What visitors are asking Organic Mitra</p>
            {stats.latestQuestions.length === 0 ? (
              <EmptyNote text="No questions in this period" />
            ) : (
              <div className="flex flex-col divide-y divide-[#f0f0ec]">
                {stats.latestQuestions.map((q, i) => (
                  <Link
                    key={`${q.chatId}-${i}`}
                    href={`/chatbot/conversations?id=${q.chatId}`}
                    className="group flex items-start gap-[10px] py-[8px] transition hover:bg-[#f8faf7]"
                  >
                    <MessageCircleQuestion className="mt-[2px] h-[14px] w-[14px] shrink-0 text-[#3b8c2a]" />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-[10px] font-medium text-[#18233b]">{q.content}</p>
                      <p className="mt-[2px] text-[8px] text-[#9aa0aa]">
                        {q.name || "Visitor"} · {timeAgo(q.createdAt)}
                      </p>
                    </div>
                    <ArrowRight className="mt-[2px] h-[12px] w-[12px] shrink-0 text-[#cbd5e1] transition group-hover:text-[#166b40]" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[10px] border border-[#e8e5df] bg-white p-[14px]">
            <div className="mb-[10px] flex items-start justify-between gap-2">
              <div>
                <p className="text-[12px] font-bold text-[#18233b]">Recent Conversations</p>
                <p className="text-[9px] text-[#6c7587]">Latest visitors who chatted</p>
              </div>
              <Link href="/chatbot/conversations" className="flex items-center gap-1 text-[9px] font-bold text-[#166b40] hover:underline">
                View all <ArrowRight className="h-[11px] w-[11px]" />
              </Link>
            </div>
            {recent.length === 0 ? (
              <EmptyNote text="No conversations in this period" />
            ) : (
              <div className="flex flex-col divide-y divide-[#f0f0ec]">
                {recent.map((c) => (
                  <Link key={c._id} href={`/chatbot/conversations?id=${c._id}`} className="flex items-center gap-[10px] py-[8px] transition hover:bg-[#f8faf7]">
                    <span
                      className="grid h-[32px] w-[32px] shrink-0 place-items-center rounded-full text-[10px] font-bold text-white"
                      style={{ background: avatarColor(c.lead?.phone || c._id) }}
                    >
                      {initials(c.lead?.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-[10px] font-bold text-[#18233b]">{c.lead?.name || "Visitor"}</p>
                        <span className="shrink-0 text-[8px] text-[#9aa0aa]">{timeAgo(c.updatedAt)}</span>
                      </div>
                      <p className="truncate text-[9px] text-[#6c7587]">{c.firstQuestion?.content || "Filled details, no question yet"}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-[#e8f5e9] px-[7px] py-[2px] text-[8px] font-bold text-[#166b40]">{c.questionCount} Q</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyNote({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-[6px] rounded-[8px] border border-dashed border-[#e5e6e2] py-[24px] text-center">
      <MessagesSquare className="h-[20px] w-[20px] text-[#cbd5e1]" />
      <p className="text-[10px] font-medium text-[#9aa0aa]">{text}</p>
    </div>
  );
}
