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
import { resolveRange, type RangeKey } from "@/components/chatbot/DateRangeFilter";

/*
 * Chatbot Reports — leads, quotations, WhatsApp follow-ups and visitor feedback are live
 * (/admin/chats). Bookings, resolved / overdue requests, complaints and the team table are
 * still sample data: there are no booking links, assignments or complaints behind them yet.
 *
 * Laid out at the design's width with the design's pixel sizes, then zoomed to the
 * available width (see useFitWidth). The dashboard layout's AdminContentScale remaps many
 * text-[Npx] classes with !important, so this page sticks to sizes outside that list.
 */

// ─── Sample data ─────────────────────────────────────────────────────────────

const DATE_RANGES = ["Today", "Last 7 Days", "Last 30 Days", "This Month", "All Time"] as const;
const TEAMS = ["All Teams", "Sales Team", "Registration Team", "Buyer Team"] as const;
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

const SUMMARY: { title: string; value: number; icon: LucideIcon | typeof ExclamationIcon; iconClass: string; valueClass: string; cardClass: string }[] = [
  {
    title: "LEADS CAPTURED",
    value: 80,
    icon: Users,
    iconClass: "border-[#d6ecdc] bg-white text-[#15633a]",
    valueClass: "text-[#14532d]",
    cardClass: "border-[#cfe9d6] bg-gradient-to-br from-[#f3fbf5] via-[#f7fcf8] to-[#e3f5e8]",
  },
  {
    title: "BOOKINGS LINKED",
    value: 12,
    icon: CalendarDays,
    iconClass: "border-[#d5e2f6] bg-white text-[#2563eb]",
    valueClass: "text-[#1d4ed8]",
    cardClass: "border-[#d5e2f6] bg-gradient-to-br from-[#f4f8fe] via-[#f8fbff] to-[#e4eefc]",
  },
  {
    title: "RESOLVED REQUESTS",
    value: 45,
    icon: Check,
    iconClass: "border-[#e3d9f7] bg-white text-white [&>svg]:rounded-full [&>svg]:bg-[#7c3aed] [&>svg]:p-[4px]",
    valueClass: "text-[#6d28d9]",
    cardClass: "border-[#e3d9f7] bg-gradient-to-br from-[#f8f5fe] via-[#fbf9ff] to-[#efe8fc]",
  },
  {
    title: "OVERDUE REQUESTS",
    value: 5,
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
      // No booking records are linked to chats yet
      bookings: null,
    };
  });

const TEAM_ROWS = [
  { team: "Sales Team", color: "bg-[#2563eb]", assigned: 40, withinTarget: 85, avgReply: "22 min", resolved: 24, overdue: 3 },
  { team: "Registration Team", color: "bg-[#9333ea]", assigned: 25, withinTarget: 92, avgReply: "15 min", resolved: 16, overdue: 1 },
  { team: "Buyer Team", color: "bg-[#ea7a0c]", assigned: 15, withinTarget: 93, avgReply: "12 min", resolved: 5, overdue: 1 },
];

// ─── Small pieces ────────────────────────────────────────────────────────────

const card = "rounded-[12px] border border-[#e3e8e4] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]";
const cardTitle = "text-[17.6px] font-bold leading-tight text-[#0f2a1c]";
const cardSub = "mt-[1px] text-[12.6px] text-[#64748b]";
const greenLink = "inline-flex items-center gap-[8px] text-[13.1px] font-medium text-[#15633a] hover:underline";

const DemoChip = () => (
  <span
    title="Leads, quotations, WhatsApp follow-ups and feedback are live. Bookings, resolved / overdue requests, complaints and team figures are sample data."
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

  useEffect(() => {
    let cancelled = false;
    const q = resolveRange({ key: RANGE_KEY[range] });
    Promise.all([chatbotApi.list({ ...q, limit: 1000 }), chatbotApi.stats(q)])
      .then(([list, st]) => {
        if (cancelled) return;
        setChats(list.chats);
        setStats(st);
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
  const outcomes = liveOutcomes(chats || []);
  const rows = topic === "All Topics" ? outcomes : outcomes.filter((r) => r.topic === topic);
  const totals = stats?.totals;
  const helpful = totals?.feedbackYes ?? 0;
  const notHelpful = totals?.feedbackNo ?? 0;
  const ratings = helpful + notHelpful;
  const helpfulPct = ratings ? Math.round((helpful / ratings) * 100) : 0;
  const summaryValue = (title: string, sample: number) => (title === "LEADS CAPTURED" ? rows.reduce((n, r) => n + r.leads, 0) : sample);
  const sum = (key: "leads" | "contacted" | "quotations" | "bookings") => rows.reduce((t, r) => t + (r[key] ?? 0), 0);
  const teams = team === "All Teams" ? TEAM_ROWS : TEAM_ROWS.filter((r) => r.team === team);

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
                  <div key={s.title} className="relative">
                    <div className={`flex h-[68px] items-center gap-[16px] rounded-[11px] border px-[14px] ${s.cardClass}`}>
                      <span className={`grid h-[42px] w-[42px] shrink-0 place-items-center rounded-full border ${s.iconClass}`}>
                        <Icon className="h-[21px] w-[21px]" />
                      </span>
                      <span>
                        <span className="block text-[12.6px] font-semibold text-[#0f172a]">{s.title}</span>
                        <span className={`mt-[3px] block text-[24.5px] font-bold leading-none ${s.valueClass}`}>{summaryValue(s.title, s.value)}</span>
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
                  <MiniStat label="Received" value={6} icon={<ExclamationIcon className="h-[20px] w-[20px] rounded-full bg-[#dc2626] p-[4px] text-white" />} iconClass="bg-[#fde8e8]" valueClass="text-[#dc2626]" />
                  <MiniStat label="Resolved" value={4} icon={<Check className="h-[20px] w-[20px] rounded-full bg-[#15803d] p-[4px] text-white" strokeWidth={3} />} iconClass="bg-[#e6f6ea]" valueClass="text-[#15803d]" />
                  <MiniStat label="Open" value={2} icon={<Clock3 className="h-[19px] w-[19px] text-[#ea7a0c]" />} iconClass="bg-[#fdf3e1]" valueClass="text-[#ea7a0c]" />
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
                  <span className="text-center">First Response Within Target</span>
                  <span className="text-center">Avg First Reply</span>
                  <span className="text-center">Resolved</span>
                  <span className="text-center">Overdue</span>
                  <span className="text-center">Action</span>
                </div>
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
                      <span className="rounded-[5px] bg-[#e6f6ea] px-[12px] py-[2px] text-[#15803d]">{r.withinTarget}%</span>
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

          {TABS.slice(1).map((t) => (
            <div key={t} {...panelProps(t)} className={`${panelClass(t)} grid place-items-center rounded-[12px] border border-dashed border-[#d6dae0] text-[14.6px] text-[#64748b]`}>
              {t} — coming soon in this demo report.
            </div>
          ))}
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
