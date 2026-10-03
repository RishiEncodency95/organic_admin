"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Filter,
  Hourglass,
  Info,
  Loader,
  MoreVertical,
  Plus,
  Search,
  SquareArrowOutUpRight,
  UserPlus,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";

/*
 * Inbox & Leads — illustrative page. Every record and count here is sample data
 * (see the "Demo data" chip); none of it comes from the API.
 *
 * Laid out at the design's width (DESIGN_WIDTH) with the design's pixel sizes, then zoomed
 * to the available width, so it keeps the same proportions on every screen.
 *
 * The dashboard layout's AdminContentScale remaps many text-[Npx] classes with
 * !important, so this page sticks to sizes outside that list (e.g. 13.4px, 11.6px).
 */

const DESIGN_WIDTH = 1320;

/** Zoom factor that fits the DESIGN_WIDTH layout into the container's width */
function useFitWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setZoom(Math.min(1.25, Math.max(0.6, el.clientWidth / DESIGN_WIDTH)));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, zoom };
}

const RANGES = ["Today", "Yesterday", "Last 7 Days", "Last 30 Days", "All Time", "Custom"] as const;

// ─── Sample data ─────────────────────────────────────────────────────────────

const SUMMARY: {
  title: string;
  value: number;
  note: string;
  icon: LucideIcon;
  iconClass: string;
  valueClass: string;
  cardClass: string;
}[] = [
  {
    title: "NEW",
    value: 12,
    note: "New enquiries received",
    icon: Users,
    iconClass: "border-[#cfe9d6] text-[#15803d]",
    valueClass: "text-[#14532d]",
    cardClass: "border-[#cfe9d6] bg-gradient-to-br from-[#f3fbf5] via-[#f7fcf8] to-[#e3f5e8]",
  },
  {
    title: "UNASSIGNED",
    value: 4,
    note: "Awaiting team assignment",
    icon: UserRound,
    iconClass: "border-[#c9daf5] text-[#2563eb]",
    valueClass: "text-[#1d4ed8]",
    cardClass: "border-[#d5e2f6] bg-gradient-to-br from-[#f4f8fe] via-[#f8fbff] to-[#e4eefc]",
  },
  {
    title: "FOLLOW-UPS DUE",
    value: 8,
    note: "Require follow-up action",
    icon: Clock3,
    iconClass: "border-[#f6dfb3] text-[#ea7a0c]",
    valueClass: "text-[#ea7a0c]",
    cardClass: "border-[#f5e3bf] bg-gradient-to-br from-[#fffaf0] via-[#fffcf5] to-[#fdf0d2]",
  },
  {
    title: "OVERDUE",
    value: 3,
    note: "Past due for response",
    icon: AlertTriangle,
    iconClass: "border-[#f6caca] text-[#dc2626]",
    valueClass: "text-[#dc2626]",
    cardClass: "border-[#f6d3d3] bg-gradient-to-br from-[#fff6f6] via-[#fffafa] to-[#fde6e6]",
  },
];

type Category = "lead" | "enquiry" | "support" | "feedback" | "complaint";

const TABS: { key: "all" | Category; label: string; count: number }[] = [
  { key: "all", label: "All", count: 48 },
  { key: "lead", label: "Leads", count: 14 },
  { key: "enquiry", label: "Enquiries", count: 12 },
  { key: "support", label: "Support", count: 8 },
  { key: "feedback", label: "Feedback", count: 8 },
  { key: "complaint", label: "Complaints", count: 6 },
];

type Status = "Follow-up" | "In Progress" | "New" | "Waiting for Visitor" | "Assigned";
type FollowUp =
  | { kind: "date"; label: string }
  | { kind: "overdue" }
  | { kind: "review" }
  | { kind: "assign" };

type Row = {
  id: number;
  name: string;
  initials: string;
  avatar: string;
  tag: "Returning" | "New" | "Anonymous" | "Verified";
  category: Category;
  type: string;
  topic: string;
  detail: string;
  assignedTo: string;
  status: Status;
  priority: "High" | "Medium" | "Low";
  followUp: FollowUp;
  lastActivity: string;
  action: "View" | "Review" | "Assign";
};

const ROWS: Row[] = [
  {
    id: 1,
    name: "Aarav Mehta",
    initials: "AM",
    avatar: "bg-[#2563eb]",
    tag: "Returning",
    category: "lead",
    type: "Lead",
    topic: "Stall Booking",
    detail: "12 sq.m quotation request",
    assignedTo: "Sales Executive 01",
    status: "Follow-up",
    priority: "High",
    followUp: { kind: "date", label: "Today, 3:00 PM" },
    lastActivity: "10 min ago",
    action: "View",
  },
  {
    id: 2,
    name: "Neha Kapoor",
    initials: "NK",
    avatar: "bg-[#a21caf]",
    tag: "New",
    category: "complaint",
    type: "Complaint",
    topic: "Response Delay",
    detail: "No reply to stall enquiry",
    assignedTo: "Team Lead",
    status: "In Progress",
    priority: "High",
    followUp: { kind: "overdue" },
    lastActivity: "25 min ago",
    action: "Review",
  },
  {
    id: 3,
    name: "Guest Visitor",
    initials: "GV",
    avatar: "bg-[#ea7a0c]",
    tag: "Anonymous",
    category: "feedback",
    type: "Feedback",
    topic: "Website Experience",
    detail: "Suggestion for registration page",
    assignedTo: "Admin",
    status: "New",
    priority: "Low",
    followUp: { kind: "review" },
    lastActivity: "40 min ago",
    action: "View",
  },
  {
    id: 4,
    name: "Kavya Jain",
    initials: "KJ",
    avatar: "bg-[#db2777]",
    tag: "Verified",
    category: "support",
    type: "Support",
    topic: "Registration",
    detail: "Assistance with visitor registration",
    assignedTo: "Registration Executive",
    status: "Waiting for Visitor",
    priority: "Medium",
    followUp: { kind: "date", label: "Tomorrow, 11:00 AM" },
    lastActivity: "1 hr ago",
    action: "View",
  },
  {
    id: 5,
    name: "Rohit Bansal",
    initials: "RB",
    avatar: "bg-[#0f766e]",
    tag: "Returning",
    category: "enquiry",
    type: "Enquiry",
    topic: "Buyer–Seller Meet",
    detail: "Participation information requested",
    assignedTo: "Buyer Coordinator",
    status: "Assigned",
    priority: "Medium",
    followUp: { kind: "date", label: "Today, 4:00 PM" },
    lastActivity: "2 hr ago",
    action: "View",
  },
  {
    id: 6,
    name: "Ananya Rao",
    initials: "AR",
    avatar: "bg-[#f59e0b]",
    tag: "New",
    category: "lead",
    type: "Lead",
    topic: "Sponsorship",
    detail: "Partnership opportunities",
    assignedTo: "Unassigned",
    status: "New",
    priority: "Medium",
    followUp: { kind: "assign" },
    lastActivity: "3 hr ago",
    action: "Assign",
  },
];

const TAG_CLASS: Record<Row["tag"], string> = {
  Returning: "bg-[#e3f5e8] text-[#15803d]",
  New: "bg-[#e3edfd] text-[#1d4ed8]",
  Anonymous: "bg-[#f1f3f5] text-[#475569]",
  Verified: "bg-[#e3f5e8] text-[#15803d]",
};

const STATUS_STYLE: Record<Status, { className: string; icon: React.ReactNode }> = {
  "Follow-up": { className: "bg-[#fdf3e1] text-[#d97706]", icon: <Clock3 className="h-[17px] w-[17px]" /> },
  "In Progress": { className: "bg-[#e8f0fd] text-[#1d4ed8]", icon: <Loader className="h-[17px] w-[17px]" /> },
  New: { className: "bg-[#e6f6ea] text-[#15803d]", icon: <span className="h-[11px] w-[11px] rounded-full bg-[#16a34a]" /> },
  "Waiting for Visitor": { className: "bg-[#f3ecfd] text-[#7c3aed] !text-[11.2px]", icon: <Hourglass className="h-[16px] w-[16px]" /> },
  Assigned: { className: "bg-[#e8f0fd] text-[#1d4ed8]", icon: <Users className="h-[17px] w-[17px]" /> },
};

const ACTION_CLASS: Record<Row["action"], string> = {
  View: "border-[#93b4f0] text-[#1d4ed8] hover:bg-[#f4f8fe]",
  Review: "border-[#f3a5a5] text-[#dc2626] hover:bg-[#fdf2f2]",
  Assign: "border-[#f5c27a] text-[#d97706] hover:bg-[#fffaf0]",
};

const ExclamationDot = () => (
  <span className="grid h-[18px] w-[18px] place-items-center rounded-full bg-[#dc2626] text-white">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" className="h-[11px] w-[11px]" aria-hidden="true">
      <path d="M12 6v8M12 18.5h.01" />
    </svg>
  </span>
);

function FollowUpCell({ value }: { value: FollowUp }) {
  switch (value.kind) {
    case "date":
      return (
        <span className="flex items-center gap-[10px] font-medium text-[#0f172a]">
          <CalendarDays className="h-[18px] w-[18px] text-[#dc2626]" /> {value.label}
        </span>
      );
    case "overdue":
      return (
        <span className="inline-flex h-[32px] items-center gap-[8px] rounded-[6px] bg-[#fdecec] px-[12px] font-medium text-[#dc2626]">
          <ExclamationDot /> Overdue
        </span>
      );
    case "review":
      return (
        <span className="inline-flex h-[32px] items-center gap-[8px] rounded-[6px] bg-[#fdf3e1] px-[12px] font-medium text-[#d97706]">
          <Hourglass className="h-[16px] w-[16px]" /> Review Pending
        </span>
      );
    case "assign":
      return (
        <span className="flex items-center gap-[8px] font-medium text-[#d97706]">
          <UserPlus className="h-[18px] w-[18px]" /> Assign Team
        </span>
      );
  }
}

// ─── Page ────────────────────────────────────────────────────────────────────

const GRID = "grid grid-cols-[44px_186px_252px_191px_158px_191px_127px_1fr] items-center";

type FilterKey = "topic" | "status" | "assignedTo" | "priority";

const FILTERS: { key: FilterKey; label: string; options: string[] }[] = [
  { key: "topic", label: "Topic", options: [...new Set(ROWS.map((r) => r.topic))] },
  { key: "status", label: "Status", options: [...new Set(ROWS.map((r) => r.status))] },
  { key: "assignedTo", label: "Assigned To", options: [...new Set(ROWS.map((r) => r.assignedTo))] },
  { key: "priority", label: "Priority", options: ["High", "Medium", "Low"] },
];

export default function ChatbotInboxPage() {
  const [range, setRange] = useState<(typeof RANGES)[number]>("Last 7 Days");
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<FilterKey, string>>({ topic: "", status: "", assignedTo: "", priority: "" });
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ROWS.filter(
      (r) =>
        (tab === "all" || r.category === tab) &&
        (!q || [r.name, r.type, r.topic, r.detail, r.assignedTo].some((v) => v.toLowerCase().includes(q))) &&
        (Object.keys(filters) as FilterKey[]).every((k) => !filters[k] || r[k] === filters[k])
    );
  }, [tab, search, filters]);

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)));
  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const total = TABS.find((t) => t.key === tab)?.count ?? 0;
  const { ref, zoom } = useFitWidth();

  const exportCsv = () => {
    const header = ["Visitor", "Type", "Topic", "Details", "Assigned To", "Status", "Last Activity"];
    const lines = rows.map((r) => [r.name, r.type, r.topic, r.detail, r.assignedTo, r.status, r.lastActivity].map((v) => `"${v.replace(/"/g, '""')}"`).join(","));
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inbox-and-leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div ref={ref} className="w-full overflow-x-hidden bg-white">
    <div style={{ zoom, width: DESIGN_WIDTH }} className="flex flex-col px-[16px] pt-[12px] text-[#0f172a]">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-x-4 pb-[14px]">
        <div className="min-w-0">
          <p className="text-[28.5px] font-bold leading-none tracking-[-0.02em] text-[#14532d]">Inbox &amp; Leads</p>
          <div className="mt-[6px] flex flex-wrap items-center gap-[10px]">
            <p className="text-[15.6px] text-[#475569]">Organic Mitra — conversations, enquiries &amp; team follow-ups</p>
            <span
              title="All records on this page are sample data"
              className="inline-flex items-center gap-[5px] rounded-[6px] border border-[#cfe9d6] bg-[#eefaf1] px-[10px] py-[4px] text-[11.6px] font-medium text-[#15803d]"
            >
              Demo data <Info className="h-[12px] w-[12px]" />
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-[8px] self-end">
          <div className="flex items-center gap-[2px] rounded-[8px] border border-[#e5e7eb] bg-[#f3f4f6] p-[3px]">
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`rounded-[6px] px-[12px] py-[6px] text-[12.4px] font-medium transition ${
                  range === r ? "bg-[#15633a] font-semibold text-white shadow-sm" : r === "Today" ? "font-semibold text-[#0f172a] hover:bg-white" : "text-[#334155] hover:bg-white"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex h-[36px] items-center gap-[7px] rounded-[8px] border border-[#d6dae0] bg-white px-[12px] text-[13.4px] font-medium text-[#0f172a] transition hover:border-[#15633a] hover:text-[#15633a]"
          >
            <SquareArrowOutUpRight className="h-[16px] w-[16px]" /> Export
          </button>
          <button
            type="button"
            className="inline-flex h-[36px] items-center gap-[7px] rounded-[8px] bg-[#15633a] px-[14px] text-[13.4px] font-medium text-white shadow-sm transition hover:bg-[#124f2f]"
          >
            <Plus className="h-[17px] w-[17px]" /> New Enquiry
          </button>
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 gap-[12px] xl:grid-cols-4">
        {SUMMARY.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.title}
              type="button"
              className={`group flex h-[118px] items-center gap-[18px] rounded-[12px] border px-[16px] text-left transition hover:-translate-y-px hover:shadow-md ${c.cardClass}`}
            >
              <span className={`mt-[12px] grid h-[54px] w-[54px] shrink-0 place-items-center self-start rounded-full border bg-white ${c.iconClass}`}>
                <Icon className="h-[26px] w-[26px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11.6px] font-semibold text-[#0f172a]">{c.title}</span>
                <span className={`mt-[6px] block text-[36.5px] font-bold leading-none ${c.valueClass}`}>{c.value}</span>
                <span className="mt-[12px] block text-[13.6px] text-[#475569]">{c.note}</span>
              </span>
              <ChevronRight className="h-[20px] w-[20px] shrink-0 text-[#334155] transition group-hover:translate-x-0.5" />
            </button>
          );
        })}
      </div>

      {/* ── Conversations table ── */}
      <div className="mt-[16px] rounded-[12px] border border-[#e3e8e4] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <div className="flex items-end justify-between gap-x-4 border-b border-[#eef0f2] px-[18px] pt-[14px]">
          <p className="pb-[18px] text-[19.5px] font-bold tracking-[-0.01em] text-[#0f2a1c]">All Conversations &amp; Enquiries</p>
          <div className="flex items-end gap-[14px]">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => {
                  setTab(t.key);
                  setPage(1);
                }}
                className={`border-b-[3px] px-[16px] pb-[14px] text-[13.6px] transition ${
                  tab === t.key ? "border-[#15633a] font-semibold text-[#15633a]" : "border-transparent text-[#334155] hover:text-[#15633a]"
                }`}
              >
                {t.label} ({t.count})
              </button>
            ))}
          </div>
        </div>

        <div className="px-[16px] pb-[14px] pt-[16px]">
          {/* Search + filters */}
          <div className="flex items-center gap-[12px]">
            <label className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-[16px] top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#475569]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, mobile, email or message..."
                className="h-[42px] w-full rounded-[8px] border border-[#dfe3e8] bg-white pl-[46px] pr-[12px] text-[13.6px] text-[#0f172a] outline-none transition placeholder:text-[#64748b] focus:border-[#15633a] focus:ring-2 focus:ring-[#15633a]/15"
              />
            </label>
            {FILTERS.map((f) => (
              <label key={f.key} className="relative">
                <select
                  value={filters[f.key]}
                  onChange={(e) => setFilters((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  aria-label={f.label}
                  className={`h-[42px] cursor-pointer appearance-none rounded-[8px] border bg-white pl-[20px] pr-[46px] text-[13.6px] outline-none transition focus:border-[#15633a] ${
                    filters[f.key] ? "border-[#15633a] font-medium text-[#15633a]" : "border-[#dfe3e8] text-[#0f172a]"
                  }`}
                >
                  <option value="">{f.label}</option>
                  {f.options.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-[16px] top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-[#334155]" />
              </label>
            ))}
            <button
              type="button"
              className="inline-flex h-[42px] items-center gap-[10px] rounded-[8px] border border-[#dfe3e8] bg-white px-[20px] text-[13.6px] text-[#0f172a] transition hover:border-[#15633a]"
            >
              <Filter className="h-[17px] w-[17px]" /> More Filters
            </button>
          </div>

          {/* Table */}
          <div className="mt-[16px]">
            <div className="text-[13.4px]">
              <div className={`${GRID} rounded-[6px] bg-[#f5f7f6] px-[12px] py-[10px] text-[13.4px] font-medium text-[#334155]`}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Select all"
                  className="h-[19px] w-[19px] cursor-pointer rounded-[4px] accent-[#15633a]"
                />
                <span>Visitor</span>
                <span>Type / Topic</span>
                <span>Assigned To</span>
                <span>Status</span>
                <span>Next Follow-up</span>
                <span>Last Activity</span>
                <span>Actions</span>
              </div>

              {rows.length === 0 ? (
                <p className="py-[28px] text-center text-[13.4px] text-[#64748b]">No records match these filters.</p>
              ) : (
                rows.map((r) => {
                  const status = STATUS_STYLE[r.status];
                  const unassigned = r.assignedTo === "Unassigned";
                  return (
                    <div key={r.id} className={`${GRID} h-[64px] border-b border-[#eef0f2] px-[12px] last:border-b-0 ${selected.has(r.id) ? "bg-[#f6fbf7]" : ""}`}>
                      <input
                        type="checkbox"
                        checked={selected.has(r.id)}
                        onChange={() => toggle(r.id)}
                        aria-label={`Select ${r.name}`}
                        className="h-[19px] w-[19px] cursor-pointer rounded-[4px] accent-[#15633a]"
                      />
                      <span className="flex min-w-0 items-center gap-[19px]">
                        <span className={`grid h-[42px] w-[42px] shrink-0 place-items-center rounded-full text-[13.4px] font-medium text-white ${r.avatar}`}>{r.initials}</span>
                        <span className="min-w-0">
                          <span className="block truncate text-[#0f172a]">{r.name}</span>
                          <span className={`mt-[4px] inline-block rounded-[5px] px-[11px] py-[2px] text-[11.6px] font-medium ${TAG_CLASS[r.tag]}`}>{r.tag}</span>
                        </span>
                      </span>
                      <span className="min-w-0 pr-[12px]">
                        <span className="block truncate text-[#0f172a]">
                          {r.type} / {r.topic}
                        </span>
                        <span className="mt-[3px] block truncate text-[13.1px] text-[#64748b]">{r.detail}</span>
                      </span>
                      <span className="flex min-w-0 items-center gap-[18px] pr-[8px] text-[#0f172a]">
                        <UserRound className={`h-[20px] w-[20px] shrink-0 ${unassigned ? "text-[#ea7a0c]" : "text-[#334155]"}`} />
                        <span className="truncate">{r.assignedTo}</span>
                      </span>
                      <span>
                        <span className={`inline-flex h-[34px] w-[134px] items-center gap-[10px] rounded-[6px] px-[14px] font-medium leading-tight ${status.className}`}>
                          {status.icon}
                          {r.status}
                        </span>
                      </span>
                      <span>
                        <FollowUpCell value={r.followUp} />
                      </span>
                      <span className="text-[#475569]">{r.lastActivity}</span>
                      <span className="flex items-center gap-[10px]">
                        <button
                          type="button"
                          className={`inline-flex h-[36px] w-[74px] items-center justify-center rounded-[6px] border bg-white text-[13.6px] font-medium transition ${ACTION_CLASS[r.action]}`}
                        >
                          {r.action}
                        </button>
                        <button type="button" aria-label={`More actions for ${r.name}`} className="grid h-[28px] w-[18px] place-items-center text-[#334155] hover:text-[#0f172a]">
                          <MoreVertical className="h-[19px] w-[19px]" />
                        </button>
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-[16px] flex items-center justify-between gap-3 text-[13.6px] text-[#475569]">
            <span>
              Showing {rows.length ? 1 : 0} – {rows.length} of {total} records
            </span>
            <div className="flex flex-wrap items-center gap-[10px]">
              <span>Rows per page:</span>
              <label className="relative">
                <select
                  value={perPage}
                  onChange={(e) => setPerPage(Number(e.target.value))}
                  aria-label="Rows per page"
                  className="h-[32px] cursor-pointer appearance-none rounded-[6px] border border-[#dfe3e8] bg-white pl-[11px] pr-[32px] text-[13.4px] font-medium text-[#0f172a] outline-none focus:border-[#15633a]"
                >
                  {[10, 25, 50].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-[9px] top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-[#334155]" />
              </label>
              <div className="ml-[16px] flex items-center gap-[8px]">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                  className="grid h-[30px] w-[30px] place-items-center rounded-[6px] border border-[#dfe3e8] bg-white text-[#334155] hover:border-[#15633a]"
                >
                  <ChevronLeft className="h-[15px] w-[15px]" />
                </button>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPage(n)}
                    aria-current={page === n ? "page" : undefined}
                    className={`grid h-[30px] w-[30px] place-items-center rounded-[6px] border text-[13.1px] font-medium transition ${
                      page === n ? "border-[#15633a] bg-[#15633a] text-white" : "border-[#dfe3e8] bg-white text-[#334155] hover:border-[#15633a]"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(5, p + 1))}
                  aria-label="Next page"
                  className="grid h-[30px] w-[30px] place-items-center rounded-[6px] border border-[#dfe3e8] bg-white text-[#334155] hover:border-[#15633a]"
                >
                  <ChevronRight className="h-[15px] w-[15px]" />
                </button>
              </div>
            </div>
          </div>

          {/* Attention bar */}
          <div className="mt-[16px] flex h-[46px] items-center justify-between gap-2 rounded-[8px] bg-[#fdf2f2] px-[10px]">
            <span className="flex items-center gap-[14px] text-[14.6px] font-medium text-[#dc2626]">
              <span className="grid h-[24px] w-[24px] place-items-center rounded-full bg-[#dc2626] text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" className="h-[14px] w-[14px]" aria-hidden="true">
                  <path d="M12 6v8M12 18.5h.01" />
                </svg>
              </span>
              3 overdue replies <span className="text-[#dc2626]">•</span> 4 unassigned enquiries
            </span>
            <button
              type="button"
              onClick={() => {
                setTab("all");
                setFilters({ topic: "", status: "", assignedTo: "", priority: "" });
              }}
              className="inline-flex items-center gap-[8px] pr-[6px] text-[13.6px] font-medium text-[#dc2626] hover:underline"
            >
              Review Now <ArrowRight className="h-[14px] w-[14px]" />
            </button>
          </div>

          <p className="mt-[14px] flex items-center gap-[10px] px-[8px] text-[13.1px] text-[#475569]">
            <Info className="h-[18px] w-[18px]" /> Open a record to view chat history, reply, assign responsibility or update status.
          </p>
        </div>
      </div>

      {/* ── Status bar ── */}
      <div className="flex items-center gap-[14px] px-[10px] pb-[10px] pt-[16px] text-[12.4px]">
        <span className="flex items-center gap-[7px] font-semibold text-[#15803d]">
          <span className="h-[9px] w-[9px] rounded-full bg-[#22a447]" /> Organic Mitra Active
        </span>
        <span className="h-[14px] w-px bg-[#cbd5e1]" />
        <span className="text-[#475569]">© 2026 Bharat Organic Expo. All rights reserved.</span>
      </div>
    </div>
    </div>
  );
}
