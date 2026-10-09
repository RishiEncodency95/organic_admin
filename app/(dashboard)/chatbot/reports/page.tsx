"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Download,
  Info,
  Star,
  Tag,
  ThumbsDown,
  ThumbsUp,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { DESIGN_WIDTH, useFitWidth } from "@/components/chatbot/useFitWidth";
import { chatbotApi, type ChatStats, type ChatSummary } from "@/lib/chatbotApi";
import { INBOX_TEAMS } from "../inbox/ReassignEnquiryModal";
import { resolveRange, type RangeKey } from "@/components/chatbot/DateRangeFilter";

/*
 * Chatbot Reports — all live from /admin/chats: leads, quotations, WhatsApp follow-ups and
 * feedback from the chats; bookings from Book a Stand registrations made with a lead's number
 * (confirmed once paid); resolved / overdue, complaints and team figures from the Inbox & Leads
 * workflow (owner, team, status, follow-ups and replies saved on each record).
 *
 * Laid out at the design's width with the design's pixel sizes, then zoomed to the
 * available width (see useFitWidth). The dashboard layout's AdminContentScale remaps many
 * text-[Npx] classes with !important, so this page sticks to sizes outside that list.
 */

// ─── Data ────────────────────────────────────────────────────────────────────

const DATE_RANGES = ["Today", "Last 7 Days", "Last 30 Days", "This Month", "All Time"] as const;
const TEAMS = ["All Teams", ...INBOX_TEAMS] as const;
const TOPICS = ["All Topics", "Stall Booking", "Sponsorship", "Partnership", "Other"] as const;
const TABS = ["Enquiry Outcomes", "Team Performance", "Feedback & Complaints"] as const;
const RANGE_KEY: Record<(typeof DATE_RANGES)[number], RangeKey> = {
  Today: "today",
  "Last 7 Days": "7d",
  "Last 30 Days": "30d",
  "This Month": "month",
  "All Time": "all",
};

type Topic = Exclude<(typeof TOPICS)[number], "All Topics">;

/** Topic of a chat from its quotation / callback requests, else from the first question */
const topicOf = (c: ChatSummary): Topic => {
  if (c.requests?.length) return "Stall Booking";
  const q = (c.firstQuestion?.content || "").toLowerCase();
  if (/sponsor/.test(q)) return "Sponsorship";
  if (/partner/.test(q)) return "Partnership";
  if (/stall|booth|book|space|exhibit|स्टॉल/.test(q)) return "Stall Booking";
  return "Other";
};

const ExclamationIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" className={className} aria-hidden="true">
    <path d="M12 6v8M12 18.5h.01" />
  </svg>
);

type SummaryKey = "leads" | "bookings" | "resolved" | "overdue";

const SUMMARY: { key: SummaryKey; title: string; icon: LucideIcon | typeof ExclamationIcon; iconClass: string; valueClass: string; cardClass: string }[] = [
  {
    key: "leads",
    title: "LEADS CAPTURED",
    icon: Users,
    iconClass: "border-[#d6ecdc] bg-white text-[#15633a]",
    valueClass: "text-[#14532d]",
    cardClass: "border-[#cfe9d6] bg-gradient-to-br from-[#f3fbf5] via-[#f7fcf8] to-[#e3f5e8]",
  },
  {
    key: "bookings",
    title: "BOOKINGS LINKED",
    icon: CalendarDays,
    iconClass: "border-[#d5e2f6] bg-white text-[#2563eb]",
    valueClass: "text-[#1d4ed8]",
    cardClass: "border-[#d5e2f6] bg-gradient-to-br from-[#f4f8fe] via-[#f8fbff] to-[#e4eefc]",
  },
  {
    key: "resolved",
    title: "RESOLVED REQUESTS",
    icon: Check,
    iconClass: "border-[#e3d9f7] bg-white text-white [&>svg]:rounded-full [&>svg]:bg-[#7c3aed] [&>svg]:p-[4px]",
    valueClass: "text-[#6d28d9]",
    cardClass: "border-[#e3d9f7] bg-gradient-to-br from-[#f8f5fe] via-[#fbf9ff] to-[#efe8fc]",
  },
  {
    key: "overdue",
    title: "OVERDUE REQUESTS",
    icon: ExclamationIcon,
    iconClass: "border-[#f5e3bf] bg-white text-white [&>svg]:rounded-full [&>svg]:bg-[#dc2626] [&>svg]:p-[4px]",
    valueClass: "text-[#ea7a0c]",
    cardClass: "border-[#f5e3bf] bg-gradient-to-br from-[#fffaf0] via-[#fffcf5] to-[#fdf0d2]",
  },
];

type OutcomeRow = { topic: string; leads: number; contacted: number; quotations: number | null; bookings: number | null };

/** Leads = verified chat leads, Contacted = WhatsApp follow-up sent, Quotations = stall quotation requests */
const liveOutcomes = (chats: ChatSummary[]): OutcomeRow[] =>
  (["Stall Booking", "Sponsorship", "Partnership", "Other"] as Topic[]).map((topic) => {
    const leads = chats.filter((c) => c.lead?.phone && topicOf(c) === topic);
    const quotations = leads.reduce((n, c) => n + (c.requests || []).filter((r) => r.type === "stall-quotation").length, 0);
    return {
      topic,
      leads: leads.length,
      contacted: leads.filter((c) => c.whatsappSentAt).length,
      quotations: topic === "Stall Booking" ? quotations : null,
      // Book a Stand registrations made with the lead's number and paid
      bookings: leads.filter((c) => c.booking?.paid).length,
    };
  });

/** First reply the team recorded on a record (Inbox & Leads), in minutes after it came in */
const firstReplyMinutes = (c: ChatSummary) => {
  const reply = c.workflow?.activity?.find((a) => a.kind === "reply" && a.at);
  return reply ? Math.max(0, (new Date(reply.at!).getTime() - new Date(c.createdAt).getTime()) / 60_000) : null;
};
const isResolved = (c: ChatSummary) => c.workflow?.status === "Resolved";
const isOverdue = (c: ChatSummary, now: number) =>
  !isResolved(c) && c.workflow?.followUpKind === "date" && !!c.workflow.followUpAt && new Date(c.workflow.followUpAt).getTime() < now;
const minutesText = (m: number | null) => (m == null ? "—" : m < 60 ? `${Math.round(m)} min` : m < 1440 ? `${(m / 60).toFixed(1)} hr` : `${(m / 1440).toFixed(1)} days`);

/** A first reply within this many minutes counts as "within target" */
const REPLY_TARGET_MIN = 60;
const TEAM_COLORS = ["bg-[#2563eb]", "bg-[#9333ea]", "bg-[#ea7a0c]", "bg-[#0f766e]", "bg-[#db2777]", "bg-[#475569]"];

type TeamRow = { team: string; color: string; assigned: number; withinTarget: number | null; avgReply: string; resolved: number; overdue: number };

/** Team figures from the records routed or assigned to each team */
const teamRows = (records: ChatSummary[], now: number): TeamRow[] =>
  INBOX_TEAMS.map((team, i) => {
    const mine = records.filter((c) => c.workflow?.team === team);
    const replies = mine.map(firstReplyMinutes).filter((m): m is number => m != null);
    return {
      team,
      color: TEAM_COLORS[i % TEAM_COLORS.length],
      assigned: mine.length,
      withinTarget: replies.length ? Math.round((replies.filter((m) => m <= REPLY_TARGET_MIN).length / replies.length) * 100) : null,
      avgReply: minutesText(replies.length ? replies.reduce((a, b) => a + b, 0) / replies.length : null),
      resolved: mine.filter(isResolved).length,
      overdue: mine.filter((c) => isOverdue(c, now)).length,
    };
  });

/** Per-person figures for the Team Performance tab */
const ownerRows = (records: ChatSummary[], now: number) => {
  const owners = [...new Set(records.map((c) => c.workflow?.assignedTo).filter((o): o is string => !!o && o !== "Unassigned"))].sort();
  return owners.map((owner) => {
    const mine = records.filter((c) => c.workflow?.assignedTo === owner);
    const replies = mine.map(firstReplyMinutes).filter((m): m is number => m != null);
    return {
      owner,
      teams: [...new Set(mine.map((c) => c.workflow?.team).filter(Boolean))].join(", ") || "—",
      open: mine.filter((c) => !isResolved(c)).length,
      resolved: mine.filter(isResolved).length,
      overdue: mine.filter((c) => isOverdue(c, now)).length,
      avgReply: minutesText(replies.length ? replies.reduce((a, b) => a + b, 0) / replies.length : null),
    };
  });
};

// ─── Small pieces ────────────────────────────────────────────────────────────

const card = "rounded-[12px] border border-[#e3e8e4] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]";
const cardTitle = "text-[17.6px] font-bold leading-tight text-[#0f2a1c]";
const cardSub = "mt-[1px] text-[12.6px] text-[#64748b]";
const greenLink = "inline-flex items-center gap-[8px] text-[13.1px] font-medium text-[#15633a] hover:underline";

const DemoChip = () => (
  <span
    title="All figures are live: chats, Book a Stand registrations and the Inbox & Leads follow-up."
    className="inline-flex shrink-0 items-center gap-[6px] whitespace-nowrap rounded-[6px] border border-[#cfe9d6] bg-[#eefaf1] px-[10px] py-[3px] text-[12.4px] font-medium text-[#15803d]"
  >
    Live data <Info className="h-[13px] w-[13px]" />
  </span>
);

function FilterSelect<T extends string>({ icon: Icon, value, options, onChange, label }: { icon: LucideIcon; value: T; options: readonly T[]; onChange: (v: T) => void; label: string }) {
  return (
    <label className="relative block w-[224px]">
      <Icon className="pointer-events-none absolute left-[16px] top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#334155]" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        aria-label={label}
        className="h-[33px] w-full cursor-pointer appearance-none rounded-[7px] border border-[#dfe3e8] bg-white pl-[50px] pr-[36px] text-[13.6px] text-[#0f172a] outline-none transition focus:border-[#15633a]"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-[14px] top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-[#334155]" />
    </label>
  );
}

function MiniStat({ label, value, icon, iconClass, valueClass }: { label: string; value: number; icon: React.ReactNode; iconClass: string; valueClass: string }) {
  return (
    <div className="flex items-center gap-[10px] rounded-[9px] border border-[#eef0f2] px-[9px] py-[4px]">
      <span className={`grid h-[32px] w-[32px] shrink-0 place-items-center rounded-full ${iconClass}`}>{icon}</span>
      <span>
        <span className="block text-[12.1px] leading-tight text-[#475569]">{label}</span>
        <span className={`block text-[18.5px] font-bold leading-none ${valueClass}`}>{value}</span>
      </span>
    </div>
  );
}

const dash = (n: number | null) => (n == null ? "-" : n);

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ChatbotReportsPage() {
  const { ref, zoom } = useFitWidth();
  const [range, setRange] = useState<(typeof DATE_RANGES)[number]>("Last 30 Days");
  const [team, setTeam] = useState<(typeof TEAMS)[number]>("All Teams");
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>("All Topics");
  const [tab, setTab] = useState<(typeof TABS)[number]>("Enquiry Outcomes");

  const [chats, setChats] = useState<ChatSummary[] | null>(null);
  const [stats, setStats] = useState<ChatStats | null>(null);
  // When the data was loaded: the "overdue" cut-off
  const [now, setNow] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const q = resolveRange({ key: RANGE_KEY[range] });
    Promise.all([chatbotApi.list({ ...q, limit: 1000, source: "all" }), chatbotApi.stats(q)])
      .then(([list, st]) => {
        if (cancelled) return;
        setChats(list.chats.filter((c) => !c.workflow?.spam));
        setStats(st);
        setNow(Date.now());
      })
      .catch(() => {
        if (cancelled) return;
        setChats(null);
        setStats(null);
      });
    return () => {
      cancelled = true;
    };
  }, [range]);

  // Zeros (not sample numbers) if the API cannot be reached
  const records = chats || [];
  const websiteChats = records.filter((c) => c.source !== "manual");
  const outcomes = liveOutcomes(websiteChats);
  const rows = topic === "All Topics" ? outcomes : outcomes.filter((r) => r.topic === topic);
  const totals = stats?.totals;
  const helpful = totals?.feedbackYes ?? 0;
  const notHelpful = totals?.feedbackNo ?? 0;
  const ratings = helpful + notHelpful;
  const helpfulPct = ratings ? Math.round((helpful / ratings) * 100) : 0;
  const complaints = records.filter((c) => c.manual?.category === "complaint");
  const summaryValue = (key: SummaryKey) =>
    key === "leads"
      ? rows.reduce((n, r) => n + r.leads, 0)
      : key === "bookings"
        ? rows.reduce((n, r) => n + (r.bookings ?? 0), 0)
        : key === "resolved"
          ? records.filter(isResolved).length
          : records.filter((c) => isOverdue(c, now)).length;
  const sum = (key: "leads" | "contacted" | "quotations" | "bookings") => rows.reduce((t, r) => t + (r[key] ?? 0), 0);
  const allTeams = teamRows(records, now);
  const teams = team === "All Teams" ? allTeams.filter((r) => r.assigned > 0) : allTeams.filter((r) => r.team === team);
  const owners = ownerRows(team === "All Teams" ? records : records.filter((c) => c.workflow?.team === team), now);
  const notHelpfulChats = websiteChats.filter((c) => c.feedback === "no");

  const exportCsv = () => {
    const header = ["Topic", "Leads Captured", "Contacted", "Quotations Sent", "Confirmed Bookings"];
    const lines = [...rows.map((r) => [r.topic, r.leads, r.contacted, dash(r.quotations), dash(r.bookings)]), ["Total", sum("leads"), sum("contacted"), sum("quotations"), sum("bookings")]];
    const csv = [header, ...lines].map((l) => l.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `chatbot-report-${range.toLowerCase().replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const panelClass = (name: string) => `[grid-area:1/1] ${tab === name ? "" : "invisible pointer-events-none"}`;
  const panelProps = (name: string) => ({ "aria-hidden": tab !== name, inert: tab !== name });

  return (
    <div ref={ref} className="w-full overflow-x-hidden bg-white">
      <div style={{ zoom, width: DESIGN_WIDTH }} className="flex flex-col px-[16px] pb-[8px] pt-[6px] text-[#0f172a]">
        {/* ── Header (the page name is already in the top bar) ── */}
        <div className="flex items-center gap-[14px]">
          <p className="min-w-0 truncate text-[16.6px] font-medium text-[#334155]">Measure enquiry outcomes, team response and visitor feedback</p>
          <DemoChip />
        </div>

        {/* ── Filters ── */}
        <div className="mt-[8px] flex items-center">
          <span className="mr-[22px] text-[15.2px] text-[#334155]">Date Range</span>
          <FilterSelect icon={CalendarDays} value={range} options={DATE_RANGES} onChange={setRange} label="Date range" />
          <span className="ml-[28px] mr-[26px] text-[15.2px] text-[#334155]">Team</span>
          <FilterSelect icon={UserRound} value={team} options={TEAMS} onChange={setTeam} label="Team" />
          <span className="ml-[30px] mr-[28px] text-[15.2px] text-[#334155]">Topic</span>
          <FilterSelect icon={Tag} value={topic} options={TOPICS} onChange={setTopic} label="Topic" />
          <button
            type="button"
            onClick={exportCsv}
            className="ml-auto inline-flex h-[34px] items-center gap-[12px] rounded-[7px] bg-[#15633a] px-[24px] text-[15.2px] font-medium text-white shadow-sm transition hover:bg-[#124f2f]"
          >
            <Download className="h-[18px] w-[18px]" /> Export Report
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="mt-[8px] flex border-b border-[#e5e7eb]">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`-mb-px border-b-[3px] px-[28px] pb-[6px] pt-[6px] text-[14.1px] transition ${
                tab === t ? "border-[#15633a] bg-[#eef6ef] font-semibold text-[#0f2a1c]" : "border-transparent bg-[#f7f8fa] text-[#334155] hover:text-[#15633a]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab panels share one grid cell, so switching tabs keeps the page height */}
        <div className="mt-[8px] grid">
          <div {...panelProps(TABS[0])} className={`${panelClass(TABS[0])} flex flex-col`}>
            {/* Summary cards */}
            <div className="grid grid-cols-4 gap-[14px]">
              {SUMMARY.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={s.key} className="relative">
                    <div className={`flex h-[68px] items-center gap-[16px] rounded-[11px] border px-[14px] ${s.cardClass}`}>
                      <span className={`grid h-[42px] w-[42px] shrink-0 place-items-center rounded-full border ${s.iconClass}`}>
                        <Icon className="h-[21px] w-[21px]" />
                      </span>
                      <span>
                        <span className="block text-[12.6px] font-semibold text-[#0f172a]">{s.title}</span>
                        <span className={`mt-[3px] block text-[24.5px] font-bold leading-none ${s.valueClass}`}>{chats ? summaryValue(s.key) : 0}</span>
                      </span>
                    </div>
                    {i === 1 && (
                      <p className="absolute left-0 top-full mt-[2px] whitespace-nowrap text-[11.2px] text-[#64748b]">Bookings counted only when linked to confirmed booking records.</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-[20px] grid grid-cols-[772px_1fr] gap-[14px]">
              {/* Lead outcomes */}
              <div className={`${card} flex flex-col px-[16px] pb-[8px] pt-[8px]`}>
                <p className={cardTitle}>Lead Outcomes by Topic</p>
                <p className={cardSub}>Summary of enquiries and conversion by topic (selected period)</p>
                <div className="mt-[8px] overflow-hidden rounded-[8px] border border-[#eef0f2] text-[13.4px]">
                  <div className="grid grid-cols-[156px_136px_120px_158px_1fr] items-center bg-[#f7f8fa] py-[5px] text-[#334155] [&>span]:border-r [&>span]:border-[#eef0f2] [&>span:last-child]:border-r-0">
                    <span className="px-[18px]">Topic</span>
                    <span className="text-center">Leads Captured</span>
                    <span className="text-center">Contacted</span>
                    <span className="text-center">Quotations Sent</span>
                    <span className="text-center">Confirmed Bookings</span>
                  </div>
                  {rows.map((r) => (
                    <div key={r.topic} className="grid h-[31px] grid-cols-[156px_136px_120px_158px_1fr] items-center border-t border-[#eef0f2] text-[#0f172a] [&>span]:flex [&>span]:h-full [&>span]:items-center [&>span]:border-r [&>span]:border-[#eef0f2] [&>span:last-child]:border-r-0">
                      <span className="px-[18px]">{r.topic}</span>
                      <span className="justify-center">{r.leads}</span>
                      <span className="justify-center">{r.contacted}</span>
                      <span className="justify-center">{dash(r.quotations)}</span>
                      <span className="justify-center font-semibold text-[#15803d]">{dash(r.bookings)}</span>
                    </div>
                  ))}
                  <div className="grid h-[35px] grid-cols-[156px_136px_120px_158px_1fr] items-center border-t border-[#eef0f2] bg-[#e6f4ea] text-[14.6px] font-bold text-[#0f2a1c] [&>span]:flex [&>span]:h-full [&>span]:items-center [&>span]:border-r [&>span]:border-[#d6ecdc] [&>span:last-child]:border-r-0">
                    <span className="px-[18px]">Total</span>
                    <span className="justify-center">{sum("leads")}</span>
                    <span className="justify-center">{sum("contacted")}</span>
                    <span className="justify-center">{sum("quotations")}</span>
                    <span className="justify-center">{sum("bookings")}</span>
                  </div>
                </div>
                <Link href="/chatbot/inbox" className={`${greenLink} mt-[8px]`}>
                  View Matching Leads <ArrowRight className="h-[16px] w-[16px]" />
                </Link>
              </div>

              {/* Visitor feedback */}
              <div className={`${card} flex flex-col px-[16px] pb-[8px] pt-[8px]`}>
                <p className={cardTitle}>Visitor Feedback</p>
                <p className={cardSub}>Ratings submitted by visitors (selected period)</p>
                <div className="mt-[6px] grid grid-cols-3 gap-[12px]">
                  <MiniStat label="Helpful" value={helpful} icon={<ThumbsUp className="h-[16px] w-[16px] fill-[#16a34a] text-[#16a34a]" />} iconClass="bg-[#e6f6ea]" valueClass="text-[#15803d]" />
                  <MiniStat label="Not Helpful" value={notHelpful} icon={<ThumbsDown className="h-[16px] w-[16px] fill-[#dc2626] text-[#dc2626]" />} iconClass="bg-[#fde8e8]" valueClass="text-[#dc2626]" />
                  <MiniStat label="Total Ratings" value={ratings} icon={<Star className="h-[16px] w-[16px] fill-[#f59e0b] text-[#f59e0b]" />} iconClass="bg-[#fdf3e1]" valueClass="text-[#1d4ed8]" />
                </div>

                <div className="mt-[8px] flex items-center justify-between text-[13.6px]">
                  <span className="font-medium text-[#0f172a]">Feedback Composition</span>
                  <span className="font-medium text-[#15803d]">{helpfulPct}% Helpful</span>
                </div>
                <div className="mt-[4px] h-[11px] overflow-hidden rounded-full bg-[#e5e7eb]">
                  <div className="h-full rounded-full bg-[#2f9e44]" style={{ width: `${helpfulPct}%` }} />
                </div>
                <div className="mt-[4px] flex items-center justify-between text-[12.6px] text-[#334155]">
                  <span className="flex items-center gap-[10px]">
                    <span className="h-[11px] w-[11px] rounded-full bg-[#2f9e44]" /> {helpfulPct}% Helpful ({helpful})
                  </span>
                  <span className="flex items-center gap-[10px] text-[12.6px]">
                    <span className="h-[11px] w-[11px] rounded-full bg-[#cbd5e1]" /> {ratings ? 100 - helpfulPct : 0}% Not Helpful ({notHelpful})
                  </span>
                </div>

                <div className="mt-[6px] border-t border-[#eef0f2] pt-[5px]">
                  <p className="text-[15.2px] font-bold leading-tight text-[#0f2a1c]">Complaints</p>
                  <p className="text-[12.6px] text-[#64748b]">Visitor complaints received and resolution status</p>
                </div>
                <div className="mt-[5px] grid grid-cols-3 gap-[12px]">
                  <MiniStat label="Received" value={complaints.length} icon={<ExclamationIcon className="h-[20px] w-[20px] rounded-full bg-[#dc2626] p-[4px] text-white" />} iconClass="bg-[#fde8e8]" valueClass="text-[#dc2626]" />
                  <MiniStat label="Resolved" value={complaints.filter(isResolved).length} icon={<Check className="h-[20px] w-[20px] rounded-full bg-[#15803d] p-[4px] text-white" strokeWidth={3} />} iconClass="bg-[#e6f6ea]" valueClass="text-[#15803d]" />
                  <MiniStat label="Open" value={complaints.filter((c) => !isResolved(c)).length} icon={<Clock3 className="h-[19px] w-[19px] text-[#ea7a0c]" />} iconClass="bg-[#fdf3e1]" valueClass="text-[#ea7a0c]" />
                </div>
                <div className="mt-auto flex items-center justify-between pt-[6px]">
                  <Link href="/chatbot/inbox" className={greenLink}>
                    Review Feedback <ArrowRight className="h-[16px] w-[16px]" />
                  </Link>
                  <span className="h-[16px] w-px bg-[#cbd5e1]" />
                  <Link href="/chatbot/inbox" className={greenLink}>
                    Open Complaints <ArrowRight className="h-[16px] w-[16px]" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Team response */}
            <div className={`${card} mt-[15px] px-[18px] pb-[10px] pt-[10px]`}>
              <p className={cardTitle}>Team Response &amp; Resolution</p>
              <p className={cardSub}>Human team replies • selected reporting period</p>
              <div className="mt-[6px] overflow-hidden rounded-[8px] border border-[#eef0f2] text-[13.6px]">
                <div className="grid grid-cols-[240px_136px_284px_216px_132px_160px_1fr] items-center bg-[#f7f8fa] py-[5px] text-[12.6px] text-[#334155] [&>span]:border-r [&>span]:border-[#eef0f2] [&>span:last-child]:border-r-0">
                  <span className="px-[16px]">Team</span>
                  <span className="text-center">Assigned</span>
                  <span className="text-center" title={`First reply recorded within ${REPLY_TARGET_MIN} minutes`}>First Reply Within 1 Hour</span>
                  <span className="text-center">Avg First Reply</span>
                  <span className="text-center">Resolved</span>
                  <span className="text-center">Overdue</span>
                  <span className="text-center">Action</span>
                </div>
                {teams.length === 0 && (
                  <p className="border-t border-[#eef0f2] px-[16px] py-[9px] text-[13.4px] text-[#64748b]">
                    No records are routed to {team === "All Teams" ? "a team" : team} in this period yet. Teams come from Forms &amp; Routing and from assigning in Inbox &amp; Leads.
                  </p>
                )}
                {teams.map((r) => (
                  <div key={r.team} className="grid h-[34px] grid-cols-[240px_136px_284px_216px_132px_160px_1fr] items-center border-t border-[#eef0f2] text-[#0f172a] [&>span]:flex [&>span]:h-full [&>span]:items-center [&>span]:border-r [&>span]:border-[#eef0f2] [&>span:last-child]:border-r-0">
                    <span className="gap-[22px] px-[16px]">
                      <span className={`grid h-[24px] w-[24px] place-items-center rounded-full text-white ${r.color}`}>
                        <Users className="h-[13px] w-[13px]" />
                      </span>
                      {r.team}
                    </span>
                    <span className="justify-center">{r.assigned}</span>
                    <span className="justify-center">
                      {r.withinTarget == null ? "—" : <span className="rounded-[5px] bg-[#e6f6ea] px-[12px] py-[2px] text-[#15803d]">{r.withinTarget}%</span>}
                    </span>
                    <span className="justify-center">{r.avgReply}</span>
                    <span className="justify-center">{r.resolved}</span>
                    <span className="justify-center font-medium text-[#dc2626]">{r.overdue}</span>
                    <span className="justify-center">
                      <Link href="/chatbot/inbox" className="inline-flex h-[26px] w-[70px] items-center justify-center rounded-[5px] border border-[#93b4f0] bg-white text-[13.6px] font-medium text-[#1d4ed8] transition hover:bg-[#f4f8fe]">
                        View
                      </Link>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Team Performance: one row per person */}
          <div {...panelProps(TABS[1])} className={`${panelClass(TABS[1])} ${card} self-start px-[18px] pb-[10px] pt-[10px]`}>
            <p className={cardTitle}>Team Performance</p>
            <p className={cardSub}>Records assigned to each person in Inbox &amp; Leads • selected period{team === "All Teams" ? "" : ` • ${team}`}</p>
            <div className="mt-[6px] overflow-hidden rounded-[8px] border border-[#eef0f2] text-[13.6px]">
              <div className="grid grid-cols-[260px_1fr_120px_120px_120px_160px] items-center bg-[#f7f8fa] py-[5px] text-[12.6px] text-[#334155] [&>span]:border-r [&>span]:border-[#eef0f2] [&>span:last-child]:border-r-0">
                <span className="px-[16px]">Owner</span>
                <span className="px-[16px]">Teams</span>
                <span className="text-center">Open</span>
                <span className="text-center">Resolved</span>
                <span className="text-center">Overdue</span>
                <span className="text-center">Avg First Reply</span>
              </div>
              {owners.length === 0 && <p className="border-t border-[#eef0f2] px-[16px] py-[9px] text-[13.4px] text-[#64748b]">Nobody has records assigned in this period yet.</p>}
              {owners.map((o) => (
                <div key={o.owner} className="grid h-[34px] grid-cols-[260px_1fr_120px_120px_120px_160px] items-center border-t border-[#eef0f2] text-[#0f172a] [&>span]:flex [&>span]:h-full [&>span]:items-center [&>span]:border-r [&>span]:border-[#eef0f2] [&>span:last-child]:border-r-0">
                  <span className="gap-[12px] px-[16px] font-medium">
                    <UserRound className="h-[15px] w-[15px] text-[#15633a]" /> {o.owner}
                  </span>
                  <span className="truncate px-[16px] text-[#475569]">{o.teams}</span>
                  <span className="justify-center">{o.open}</span>
                  <span className="justify-center">{o.resolved}</span>
                  <span className="justify-center font-medium text-[#dc2626]">{o.overdue}</span>
                  <span className="justify-center">{o.avgReply}</span>
                </div>
              ))}
            </div>
            <Link href="/chatbot/inbox" className={`${greenLink} mt-[8px]`}>
              Open Inbox &amp; Leads <ArrowRight className="h-[16px] w-[16px]" />
            </Link>
          </div>

          {/* Feedback & Complaints: the records behind the numbers */}
          <div {...panelProps(TABS[2])} className={`${panelClass(TABS[2])} grid grid-cols-2 gap-[14px] self-start`}>
            {(
              [
                { title: "Not Helpful Ratings", sub: "Chats a visitor rated 👎 • selected period", list: notHelpfulChats, empty: "No 👎 ratings in this period." },
                { title: "Complaints", sub: "Complaints added in Inbox & Leads • selected period", list: complaints, empty: "No complaints in this period." },
              ] as const
            ).map((panel) => (
              <div key={panel.title} className={`${card} px-[16px] pb-[8px] pt-[8px]`}>
                <p className={cardTitle}>{panel.title}</p>
                <p className={cardSub}>{panel.sub}</p>
                <div className="mt-[6px] max-h-[420px] overflow-y-auto rounded-[8px] border border-[#eef0f2] text-[13.4px]">
                  {panel.list.length === 0 && <p className="px-[14px] py-[9px] text-[#64748b]">{panel.empty}</p>}
                  {panel.list.map((c) => (
                    <div key={c._id} className="flex items-center gap-[12px] border-t border-[#eef0f2] px-[14px] py-[6px] first:border-t-0">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-[#0f172a]">{c.lead?.name || c.visitorName || "Visitor"}</span>
                        <span className="block truncate text-[12.4px] text-[#64748b]">{c.manual?.detail || c.firstQuestion?.content || "Browsed the chatbot menu"}</span>
                      </span>
                      <span className={`shrink-0 rounded-[5px] px-[8px] py-[2px] text-[12px] font-medium ${isResolved(c) ? "bg-[#e6f6ea] text-[#15803d]" : "bg-[#fdf3e1] text-[#b45309]"}`}>
                        {c.workflow?.status || "New"}
                      </span>
                      <span className="w-[86px] shrink-0 text-right text-[12.4px] text-[#64748b]">{new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                    </div>
                  ))}
                </div>
                <Link href="/chatbot/inbox" className={`${greenLink} mt-[8px]`}>
                  Review in Inbox <ArrowRight className="h-[16px] w-[16px]" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="mt-[10px] flex items-center justify-between text-[12.6px] text-[#64748b]">
          <span className="flex items-center gap-[16px]">
            <span>
              <span className="font-semibold text-[#334155]">Source:</span> Chatbot conversations, enquiry activity and linked booking records
            </span>
            <span className="h-[16px] w-px bg-[#cbd5e1]" />
            <DemoChip />
          </span>
          <span className="text-right text-[11.6px] leading-snug">
            Response times use configured working hours. Feedback reflects submitted ratings only.
            <br />© 2026 Bharat Organic Expo. All rights reserved.
          </span>
        </div>
      </div>
    </div>
  );
}
