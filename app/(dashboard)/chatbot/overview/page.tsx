"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Bot,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Info,
  Mail,
  MessageCircleQuestion,
  MessagesSquare,
  RefreshCw,
  Settings,
  ThumbsUp,
  TrendingUp,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, LabelList, ResponsiveContainer, XAxis, YAxis } from "recharts";

/*
 * Chatbot Overview — illustrative dashboard. Every number on this page is sample data
 * (see the "Demo data" chip and the footer note); none of it comes from the API.
 *
 * Note: the dashboard layout's AdminContentScale remaps many text-[Npx] classes with
 * !important, so this page sticks to sizes outside that list (e.g. 12.5px, 13.5px).
 */

const PUBLIC_SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3002").replace(/\/$/, "");

const RANGES = ["Today", "Yesterday", "Last 7 Days", "Last 30 Days", "All Time", "Custom"] as const;

const WHATSAPP_PATH =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z";

const ExclamationIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" className={className} aria-hidden="true">
    <path d="M12 5v9M12 19h.01" />
  </svg>
);

const WhatsAppIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d={WHATSAPP_PATH} />
  </svg>
);

// ─── Sample data ─────────────────────────────────────────────────────────────

type StatCard = {
  title: string;
  value: string;
  footer: string;
  href: string;
  icon: LucideIcon | typeof WhatsAppIcon;
  iconClass: string;
  valueClass: string;
  cardClass: string;
};

const STATS: StatCard[] = [
  {
    title: "TOTAL CHATS",
    value: "128",
    footer: "View chats",
    href: "/chatbot/conversations",
    icon: MessagesSquare,
    iconClass: "border-[#bfe3c9] bg-white text-[#15803d]",
    valueClass: "text-[#166534]",
    cardClass: "border-[#cfe9d6] bg-gradient-to-br from-[#f3fbf5] via-[#f7fcf8] to-[#e3f5e8]",
  },
  {
    title: "LEADS CAPTURED",
    value: "32",
    footer: "View leads",
    href: "/chatbot/leads",
    icon: UserRound,
    iconClass: "border-[#c9daf5] bg-white text-[#2563eb]",
    valueClass: "text-[#1d4ed8]",
    cardClass: "border-[#d5e2f6] bg-gradient-to-br from-[#f4f8fe] via-[#f8fbff] to-[#e4eefc]",
  },
  {
    title: "QUESTIONS ASKED",
    value: "512",
    footer: "Review questions",
    href: "/chatbot/conversations",
    icon: MessageCircleQuestion,
    iconClass: "border-[#ddd0f7] bg-[#7c3aed] text-white",
    valueClass: "text-[#6d28d9]",
    cardClass: "border-[#e3d9f7] bg-gradient-to-br from-[#f8f5fe] via-[#fbf9ff] to-[#efe8fc]",
  },
  {
    title: "BOT REPLIES",
    value: "487",
    footer: "View replies",
    href: "/chatbot/conversations",
    icon: Bot,
    iconClass: "border-[#bfe4e0] bg-white text-[#0f766e]",
    valueClass: "text-[#0f766e]",
    cardClass: "border-[#cdeae6] bg-gradient-to-br from-[#f2fbfa] via-[#f7fdfc] to-[#dff4f1]",
  },
  {
    title: "AVG. QUESTIONS / CHAT",
    value: "4.0",
    footer: "Chat engagement",
    href: "/chatbot/conversations",
    icon: TrendingUp,
    iconClass: "border-[#f6dfb3] bg-white text-[#d97706]",
    valueClass: "text-[#d97706]",
    cardClass: "border-[#f5e3bf] bg-gradient-to-br from-[#fffaf0] via-[#fffcf5] to-[#fdf0d2]",
  },
  {
    title: "WHATSAPP DELIVERED",
    value: "18",
    footer: "View delivery",
    href: "/chatbot/leads",
    icon: WhatsAppIcon,
    iconClass: "border-[#cfe9d6] bg-white text-[#16a34a]",
    valueClass: "text-[#14213d]",
    cardClass: "border-[#e2e6ec] bg-gradient-to-br from-[#f8fafc] via-[#fbfcfd] to-[#eef1f5]",
  },
];

const DAILY = [
  { day: "26 Sep", Chats: 2, Questions: 3 },
  { day: "27 Sep", Chats: 4, Questions: 8 },
  { day: "28 Sep", Chats: 9, Questions: 15 },
  { day: "29 Sep", Chats: 14, Questions: 22 },
  { day: "30 Sep", Chats: 20, Questions: 32 },
  { day: "01 Oct", Chats: 18, Questions: 28 },
  { day: "02 Oct", Chats: 10, Questions: 18 },
];

const PERFORMANCE = [
  {
    label: "Answered questions",
    value: "487 / 512",
    icon: Check,
    iconClass: "bg-[#22a447] text-white",
    extra: <span className="text-[11.4px] font-medium text-[#475569]">95%</span>,
  },
  {
    label: "Unanswered questions",
    value: "25",
    icon: ExclamationIcon,
    iconClass: "bg-[#dc2626] text-white",
    extra: (
      <Link
        href="/chatbot/conversations"
        className="inline-flex items-center gap-1 rounded-[6px] bg-[#fdecec] px-[8px] py-[2px] text-[11.2px] font-semibold text-[#dc2626] transition hover:bg-[#fbd9d9]"
      >
        Review <ArrowRight className="h-[13px] w-[13px]" />
      </Link>
    ),
  },
  {
    label: "Helpful ratings",
    value: (
      <>
        92% <span className="ml-1 text-[11.4px] font-medium text-[#475569]">(46 / 50)</span>
      </>
    ),
    icon: ThumbsUp,
    iconClass: "bg-[#e3edfd] text-[#2563eb]",
  },
  { label: "Returning visitors", value: "18", icon: Users, iconClass: "bg-[#efe8fc] text-[#7c3aed]" },
  { label: "Team handovers", value: "9", icon: UserRound, iconClass: "bg-[#fdf0d2] text-[#ea7a0c]" },
];

const TOP_PAGES = [
  { page: "Home", chats: 54, bar: "bg-[#4cc35a]" },
  { page: "Stall Booking", chats: 38, bar: "bg-[#2f9e44]" },
  { page: "Visitor Registration", chats: 22, bar: "bg-[#4cc35a]" },
  { page: "Buyer–Seller Meet", chats: 14, bar: "bg-[#8fd99a]" },
];

const POPULAR_QUESTIONS = [
  { q: "What are the stall charges?", count: 86 },
  { q: "How do I register as a visitor?", count: 72 },
  { q: "Who can apply for PMS support?", count: 48 },
];

const FOLLOW_UPS = [
  { label: "Unassigned chats", count: 4, icon: Mail, iconClass: "text-[#dc2626]", countClass: "bg-[#fde2e2] text-[#dc2626]" },
  { label: "Overdue replies", count: 3, icon: Clock3, iconClass: "text-[#ea7a0c]", countClass: "bg-[#fde2e2] text-[#dc2626]" },
  { label: "Follow-ups today", count: 8, icon: CalendarDays, iconClass: "text-[#dc2626]", countClass: "bg-[#fdf0d2] text-[#b45309]" },
  { label: "Open complaints", count: 2, icon: AlertTriangle, iconClass: "text-[#dc2626]", countClass: "bg-[#fde2e2] text-[#dc2626]" },
];

type Conversation = {
  name: string;
  initials: string;
  avatar: string;
  returning: boolean;
  topic: string;
  outcome: { label: string; icon: LucideIcon };
  status: { label: string; className: string };
  lastActivity: string;
  action: "View" | "Review";
};

const RECENT: Conversation[] = [
  {
    name: "Aarav Mehta",
    initials: "AM",
    avatar: "bg-[#2563eb]",
    returning: true,
    topic: "Stall Booking",
    outcome: { label: "Team handover", icon: Bot },
    status: { label: "Assigned", className: "bg-[#dcf3e1] text-[#15803d]" },
    lastActivity: "10 min ago",
    action: "View",
  },
  {
    name: "Guest Visitor",
    initials: "GV",
    avatar: "bg-[#8b5cf6]",
    returning: false,
    topic: "Visitor Registration",
    outcome: { label: "Answered", icon: MessagesSquare },
    status: { label: "No action needed", className: "bg-[#e3edfd] text-[#1d4ed8]" },
    lastActivity: "30 min ago",
    action: "View",
  },
  {
    name: "Neha Kapoor",
    initials: "NK",
    avatar: "bg-[#c2570c]",
    returning: true,
    topic: "Complaint",
    outcome: { label: "Team handover", icon: Bot },
    status: { label: "Response overdue", className: "bg-[#fde2e2] text-[#dc2626]" },
    lastActivity: "45 min ago",
    action: "Review",
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

const card = "rounded-[12px] border border-[#e3e8e4] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]";
const cardTitle = "text-[15.6px] font-bold leading-tight tracking-[-0.01em] text-[#0f2a1c]";
const cardSub = "mt-[2px] text-[11.6px] text-[#64748b]";
/** Smaller heading for the compact cards (performance, top pages, questions, follow-up) */
const smallTitle = "text-[13.6px] font-bold leading-tight text-[#0f2a1c]";
const smallSub = "mt-[1px] text-[10.6px] text-[#64748b]";
const blueLink = "inline-flex items-center gap-1 whitespace-nowrap text-[11.4px] font-semibold text-[#1d4ed8] hover:underline";

export default function ChatbotOverviewPage() {
  const [range, setRange] = useState<(typeof RANGES)[number]>("Last 7 Days");
  const [spin, setSpin] = useState(false);

  const refresh = () => {
    setSpin(true);
    window.setTimeout(() => setSpin(false), 700);
  };

  return (
    <div className="flex w-full flex-col bg-white px-[16px] pt-[10px] text-[#0f172a]">
      {/* ── Header ── */}
      {/* One row: subtitle + chip on the left, filters on the right (the subtitle truncates if space runs out) */}
      <div className="flex shrink-0 items-center justify-between gap-x-3 pb-[10px]">
        <div className="min-w-0">
          {/* The page name is already in the top bar, so only the subtitle is shown here */}
          <div className="flex min-w-0 items-center gap-[10px]">
            <p className="min-w-0 truncate text-[15.2px] font-medium text-[#334155]">Organic Mitra — chatbot performance &amp; team follow-up</p>
            <span
              title="All numbers on this page are sample data"
              className="inline-flex shrink-0 items-center gap-[6px] whitespace-nowrap rounded-[6px] border border-[#cfe9d6] bg-[#eefaf1] px-[10px] py-[3px] text-[12.4px] font-medium text-[#15803d]"
            >
              Demo data <Info className="h-[13px] w-[13px]" />
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-[8px]">
          <div className="flex items-center gap-[2px] rounded-[8px] border border-[#e5e7eb] bg-[#f3f4f6] p-[3px]">
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`whitespace-nowrap rounded-[6px] px-[8px] py-[5px] text-[11.4px] font-semibold transition ${
                  range === r ? "bg-[#15633a] text-white shadow-sm" : "text-[#334155] hover:bg-white"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={refresh}
            aria-label="Refresh"
            className="grid h-[31px] w-[31px] place-items-center rounded-[8px] border border-[#e5e7eb] bg-white text-[#334155] transition hover:border-[#15633a] hover:text-[#15633a]"
          >
            <RefreshCw className={`h-[14px] w-[14px] ${spin ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/chatbot/conversations"
            className="inline-flex h-[31px] shrink-0 items-center gap-[6px] whitespace-nowrap rounded-[8px] border border-[#93b4f0] bg-white px-[12px] text-[11.4px] font-semibold text-[#1d4ed8] transition hover:bg-[#f4f8fe]"
          >
            <Settings className="h-[14px] w-[14px]" /> Manage Chatbot
          </Link>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid shrink-0 grid-cols-2 gap-[12px] md:grid-cols-3 xl:grid-cols-6">
        {STATS.map((s) => {
          const Icon = s.icon;
          const isWhatsApp = s.icon === WhatsAppIcon;
          return (
            <Link
              key={s.title}
              href={s.href}
              className={`group flex h-[68px] min-w-0 flex-col rounded-[11px] border px-[11px] pb-[5px] pt-[7px] transition hover:-translate-y-px hover:shadow-md ${s.cardClass}`}
            >
              <div className="flex items-start gap-[9px]">
                <span className={`grid h-[28px] w-[28px] shrink-0 place-items-center rounded-full border ${s.iconClass}`}>
                  <Icon className={isWhatsApp ? "h-[15px] w-[15px]" : "h-[14px] w-[14px]"} />
                </span>
                <div className="min-w-0">
                  <p className="whitespace-nowrap text-[10.6px] font-semibold text-[#0f172a]">{s.title}</p>
                  <div className="mt-[2px] flex items-center gap-[8px]">
                    <p className={`text-[15.6px] font-bold leading-none tracking-[-0.02em] ${s.valueClass}`}>{s.value}</p>
                    {/* Beside the number so this card stays as short as the others */}
                    {isWhatsApp && (
                      <p className="flex items-center gap-[4px] whitespace-nowrap text-[10.2px] font-medium text-[#15803d]">
                        <span className="grid h-[12px] w-[12px] place-items-center rounded-full bg-[#16a34a] text-white">
                          <Check className="h-[8px] w-[8px]" strokeWidth={4} />
                        </span>
                        Verified
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <span className="mt-auto flex items-center justify-center gap-[5px] text-[11.6px] font-semibold text-[#1e293b] group-hover:text-[#15633a]">
                {s.footer} <ArrowRight className="h-[13px] w-[13px]" />
              </span>
            </Link>
          );
        })}
      </div>

      {/* ── Chart + performance ── */}
      <div className="mt-[12px] grid gap-[12px] xl:h-[204px] xl:grid-cols-[1.6fr_1fr]">
        <div className={`${card} flex min-h-0 flex-col px-[20px] pb-[6px] pt-[10px]`}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className={cardTitle}>Day-wise Activity</p>
              <p className={cardSub}>New chats and questions asked per day (all values are illustrative)</p>
            </div>
            <div className="flex items-center gap-[18px] pt-[4px] text-[12.4px] text-[#334155]">
              <span className="flex items-center gap-[7px]">
                <span className="h-[9px] w-[9px] rounded-full bg-[#22a447]" /> Chats
              </span>
              <span className="flex items-center gap-[7px]">
                <span className="h-[9px] w-[9px] rounded-full bg-[#f59e0b]" /> Questions
              </span>
            </div>
          </div>
          <div className="relative mt-[4px] h-[200px] xl:h-auto xl:flex-1">
            <div className="absolute inset-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DAILY} margin={{ top: 16, right: 18, left: -14, bottom: 0 }}>
                <defs>
                  <linearGradient id="ovQuestions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.04} />
                  </linearGradient>
                  <linearGradient id="ovChats" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22a447" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#22a447" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#eef0f2" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#475569" }} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} dy={6} padding={{ left: 4, right: 4 }} />
                <YAxis domain={[0, 40]} ticks={[0, 10, 20, 30, 40]} tick={{ fontSize: 11, fill: "#475569" }} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
                <Area type="monotone" dataKey="Questions" stroke="#f59e0b" strokeWidth={2.2} fill="url(#ovQuestions)" dot={{ r: 4, fill: "#f59e0b", stroke: "#fff", strokeWidth: 1.5 }} isAnimationActive={false}>
                  <LabelList dataKey="Questions" position="top" offset={9} style={{ fontSize: 10.5, fill: "#d97706" }} />
                </Area>
                <Area type="monotone" dataKey="Chats" stroke="#16843a" strokeWidth={2.2} fill="url(#ovChats)" dot={{ r: 4, fill: "#16843a", stroke: "#fff", strokeWidth: 1.5 }} isAnimationActive={false}>
                  <LabelList dataKey="Chats" position="top" offset={9} style={{ fontSize: 10.5, fill: "#15803d" }} />
                </Area>
              </AreaChart>
            </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className={`${card} flex min-h-0 flex-col px-[12px] pb-[8px] pt-[10px]`}>
          <div className="flex items-center justify-between gap-2 px-[4px]">
            <p className="flex items-center gap-[6px] text-[13.6px] font-bold leading-tight text-[#0f2a1c]">
              Answer &amp; Feedback Performance <Info className="h-[13px] w-[13px] text-[#64748b]" />
            </p>
            <span className="text-[11.4px] font-medium text-[#0f172a]">{range}</span>
          </div>
          <div className="mt-[7px] flex flex-1 flex-col justify-between gap-[4px]">
            {PERFORMANCE.map((row) => {
              const Icon = row.icon;
              return (
                <div key={row.label} className="flex min-h-[28px] flex-1 items-center gap-[9px] rounded-[8px] border border-[#eef0f2] px-[9px]">
                  <span className={`grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full ${row.iconClass}`}>
                    <Icon className="h-[12.5px] w-[12.5px]" strokeWidth={2.6} />
                  </span>
                  <span className="w-[140px] shrink-0 text-[11.4px] text-[#1e293b]">{row.label}</span>
                  <span className="min-w-0 flex-1 text-[12.6px] font-bold text-[#0f172a]">{row.value}</span>
                  {row.extra ?? <ChevronRight className="h-[14px] w-[14px] text-[#94a3b8]" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Top pages · popular questions · team follow-up ── */}
      <div className="mt-[10px] grid gap-[10px] lg:grid-cols-3">
        <div className={`${card} flex flex-col px-[14px] pb-[8px] pt-[8px]`}>
          <p className={smallTitle}>Top Pages</p>
          <p className={smallSub}>Where visitors started chatting (total 128 chats)</p>
          <div className="mt-[6px] flex flex-1 flex-col justify-around gap-[6px]">
            {TOP_PAGES.map((p) => (
              <div key={p.page} className="flex items-center gap-[12px]">
                <span className="w-[118px] shrink-0 truncate text-[11.4px] text-[#0f172a]">{p.page}</span>
                <span className="h-[7px] flex-1 overflow-hidden rounded-full bg-[#eef1f4]">
                  <span className={`block h-full rounded-full ${p.bar}`} style={{ width: `${(p.chats / 54) * 78}%` }} />
                </span>
                <span className="w-[22px] text-right text-[11.4px] font-medium text-[#0f172a]">{p.chats}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`${card} flex flex-col px-[12px] pb-[2px] pt-[8px]`}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className={smallTitle}>Popular Questions</p>
              <p className={smallSub}>Most common questions from visitors</p>
            </div>
            <Link href="/chatbot/conversations" className={`${blueLink} !text-[10.6px]`}>
              Review Answers <ArrowRight className="h-[12px] w-[12px]" />
            </Link>
          </div>
          <div className="mt-[2px] flex flex-1 flex-col justify-around divide-y divide-[#eef0f2]">
            {POPULAR_QUESTIONS.map((item, i) => (
              <Link key={item.q} href="/chatbot/conversations" className="flex items-center gap-[8px] py-[4px] transition hover:bg-[#f8faf9]">
                <span className="grid h-[19px] w-[19px] shrink-0 place-items-center rounded-full bg-[#eef3fb] text-[10.2px] font-semibold text-[#1d4ed8]">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate text-[11.4px] text-[#0f172a]">{item.q}</span>
                <span className="rounded-full bg-[#e3f5e8] px-[7px] py-0 text-[10.6px] font-semibold text-[#15803d]">{item.count}</span>
                <ChevronRight className="h-[14px] w-[14px] text-[#64748b]" />
              </Link>
            ))}
          </div>
        </div>

        <div className={`${card} flex flex-col px-[12px] pb-[2px] pt-[8px]`}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className={smallTitle}>Team Follow-up</p>
              <p className={smallSub}>Chats that need human attention</p>
            </div>
            <Link href="/chatbot/leads" className={`${blueLink} !text-[10.6px]`}>
              Open Inbox <ArrowRight className="h-[12px] w-[12px]" />
            </Link>
          </div>
          <div className="mt-[2px] flex flex-1 flex-col justify-around divide-y divide-[#eef0f2]">
            {FOLLOW_UPS.map((f) => {
              const Icon = f.icon;
              return (
                <Link key={f.label} href="/chatbot/leads" className="flex items-center gap-[8px] py-[4px] transition hover:bg-[#f8faf9]">
                  <Icon className={`h-[14px] w-[14px] shrink-0 ${f.iconClass}`} />
                  <span className="min-w-0 flex-1 text-[11.4px] text-[#0f172a]">{f.label}</span>
                  <span className={`grid h-[18px] w-[18px] place-items-center rounded-full text-[10.2px] font-semibold ${f.countClass}`}>{f.count}</span>
                  <ChevronRight className="h-[14px] w-[14px] text-[#94a3b8]" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Recent conversations ── */}
      <div className={`${card} mt-[12px] shrink-0 px-[16px] pb-[6px] pt-[12px]`}>
        {/* Title, subtitle and "View all" on one row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-baseline gap-[10px]">
            <p className={`${cardTitle} shrink-0 whitespace-nowrap`}>Recent Conversations</p>
            <p className="min-w-0 truncate text-[11.6px] text-[#64748b]">Latest visitor conversations and their status (sample data)</p>
          </div>
          <Link href="/chatbot/conversations" className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-[12.4px] font-semibold text-[#15633a] hover:underline">
            View all <ArrowRight className="h-[14px] w-[14px]" />
          </Link>
        </div>
        <div className="mt-[8px] overflow-x-auto">
          <div className="min-w-[900px] text-[12.4px]">
            <div className="grid grid-cols-[1.45fr_0.85fr_1fr_1.4fr_1.4fr_1.1fr_0.7fr_20px] items-center rounded-[6px] bg-[#f7f8fa] px-[12px] py-[6px] text-[11.4px] font-semibold text-[#334155]">
              <span>Visitor</span>
              <span>Type</span>
              <span>Topic</span>
              <span>Bot Outcome</span>
              <span>Team Status</span>
              <span>Last Activity</span>
              <span>Action</span>
              <span />
            </div>
            {RECENT.map((c) => {
              const Outcome = c.outcome.icon;
              return (
                <div
                  key={c.name}
                  className="grid grid-cols-[1.45fr_0.85fr_1fr_1.4fr_1.4fr_1.1fr_0.7fr_20px] items-center border-b border-[#f0f2f4] px-[12px] py-[4px] last:border-b-0"
                >
                  <span className="flex min-w-0 items-center gap-[12px]">
                    <span className={`grid h-[28px] w-[28px] shrink-0 place-items-center rounded-full text-[11.2px] font-semibold text-white ${c.avatar}`}>{c.initials}</span>
                    <span className="min-w-0 leading-tight">
                      <span className="block truncate font-medium text-[#0f172a]">{c.name}</span>
                      <span className="block truncate text-[10.8px] text-[#64748b]">{c.returning ? "Returning Visitor" : "New Visitor"}</span>
                    </span>
                  </span>
                  <span>
                    <span
                      className={`rounded-[6px] px-[10px] py-[3px] text-[11.2px] font-medium ${
                        c.returning ? "bg-[#e3f5e8] text-[#15803d]" : "bg-[#e3edfd] text-[#1d4ed8]"
                      }`}
                    >
                      {c.returning ? "Returning" : "New"}
                    </span>
                  </span>
                  <span className="text-[#0f172a]">{c.topic}</span>
                  <span className="flex items-center gap-[10px] text-[#0f172a]">
                    <Outcome className="h-[16px] w-[16px] text-[#15633a]" /> {c.outcome.label}
                  </span>
                  <span>
                    <span className={`rounded-[6px] px-[10px] py-[3px] text-[11.2px] font-medium ${c.status.className}`}>{c.status.label}</span>
                  </span>
                  <span className="text-[#334155]">{c.lastActivity}</span>
                  <span>
                    <Link
                      href="/chatbot/conversations"
                      className={`inline-flex h-[26px] min-w-[50px] items-center justify-center rounded-[6px] border bg-white px-[10px] text-[11.4px] font-medium transition ${
                        c.action === "Review"
                          ? "border-[#f3a5a5] text-[#dc2626] hover:bg-[#fdf2f2]"
                          : "border-[#93b4f0] text-[#1d4ed8] hover:bg-[#f4f8fe]"
                      }`}
                    >
                      {c.action}
                    </Link>
                  </span>
                  <ChevronRight className="h-[16px] w-[16px] text-[#94a3b8]" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Status bar ── */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 pb-[8px] pt-[8px] text-[11.2px]">
        <div className="flex flex-wrap items-center gap-[12px]">
          <span className="flex items-center gap-[7px] font-semibold text-[#15803d]">
            <span className="h-[9px] w-[9px] rounded-full bg-[#22a447]" /> Organic Mitra Active
          </span>
          <span className="h-[14px] w-px bg-[#cbd5e1]" />
          <span className="text-[#64748b]">
            Last content update: <span className="text-[#0f172a]">02 Oct 2026</span>
          </span>
          <span className="h-[14px] w-px bg-[#cbd5e1]" />
          <a href={PUBLIC_SITE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-[4px] font-medium text-[#1d4ed8] hover:underline">
            Preview Chatbot <ArrowUpRight className="h-[13px] w-[13px]" />
          </a>
        </div>
        <span className="text-[#64748b]">All data shown is sample and for illustrative purposes only.</span>
      </div>
    </div>
  );
}
