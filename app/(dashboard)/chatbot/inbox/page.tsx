"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  Ban,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Clock3,
  Filter,
  Flag,
  Footprints,
  Hourglass,
  Info,
  Loader,
  Mail,
  MessageCircle,
  MessageSquare,
  MoreVertical,
  Phone,
  Plus,
  RefreshCw,
  Search,
  SearchX,
  SquareArrowOutUpRight,
  UserPlus,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { DESIGN_WIDTH, useFitWidth } from "@/components/chatbot/useFitWidth";
import { chatbotApi, type ChatSummary, type ChatWorkflow, type WorkflowUpdate } from "@/lib/chatbotApi";
import { staffApi } from "@/lib/staffApi";
import { useAppSelector } from "@/store/hooks";
import { visitorLabel } from "@/components/chatbot/chatbotUtils";
import DateRangeCalendar, { isoDate } from "./DateRangeCalendar";
import EnquiryDetailModal, { type Activity, type ComposeMode } from "./EnquiryDetailModal";
import NewEnquiryModal, { type NewEnquiry } from "./NewEnquiryModal";
import ReassignEnquiryModal, { type OwnerInfo } from "./ReassignEnquiryModal";
import ResolveEnquiryModal from "./ResolveEnquiryModal";

/*
 * Inbox & Leads — one record per website chat (/admin/chats): saved under the visitor's IP
 * until the mobile number is verified, then under their name and number — plus enquiries the
 * team adds by hand. Assignment, status, priority, follow-ups, spam and the activity history
 * are saved on the chat (PUT /admin/chats/workflow) shortly after each change.
 *
 * Laid out at the design's width (DESIGN_WIDTH) with the design's pixel sizes, then zoomed
 * to the available width, so it keeps the same proportions on every screen.
 *
 * The dashboard layout's AdminContentScale remaps many text-[Npx] classes with
 * !important, so this page sticks to sizes outside that list (e.g. 13.4px, 11.6px).
 */

const RANGES = ["Today", "Yesterday", "Last 7 Days", "Last 30 Days", "All Time", "Custom"] as const;
type Range = (typeof RANGES)[number];

const DAY = 1440;

// ─── Records ─────────────────────────────────────────────────────────────────

type Category = "lead" | "enquiry" | "support" | "feedback" | "complaint";
type Status = "Follow-up" | "In Progress" | "New" | "Waiting for Visitor" | "Assigned" | "Resolved";
type Priority = "High" | "Medium" | "Low";
type Channel = "Website chat" | "WhatsApp" | "Phone call" | "Email" | "Walk-in";
type Tag = "Returning" | "New" | "Anonymous" | "Verified";
type FollowUp =
  | { kind: "date"; label: string; at: string }
  | { kind: "overdue"; at?: string }
  | { kind: "review" }
  | { kind: "assign" }
  | { kind: "none" };

type Row = {
  id: number;
  /** The saved chat this record comes from */
  chatId?: string;
  name: string;
  initials: string;
  avatar: string;
  tag: Tag;
  category: Category;
  type: string;
  topic: string;
  detail: string;
  assignedTo: string;
  status: Status;
  priority: Priority;
  followUp: FollowUp;
  /** Minutes since the last activity, as of page load */
  minutesAgo: number;
  channel: Channel;
  /** Visitor sent something nobody has opened yet */
  unread: boolean;
  mobile?: string;
  email?: string;
  /** Team the record is routed to (Forms & Routing, or set when assigning) */
  team?: string;
  /** When the visitor's messages were last read here */
  seenAt?: string;
  createdAt?: string;
  /** Added by hand in this inbox, not a website chat */
  manual?: boolean;
};

const TABS: { key: "all" | Category; label: string }[] = [
  { key: "all", label: "All" },
  { key: "lead", label: "Leads" },
  { key: "enquiry", label: "Enquiries" },
  { key: "support", label: "Support" },
  { key: "feedback", label: "Feedback" },
  { key: "complaint", label: "Complaints" },
];

const TYPE_LABEL: Record<Category, string> = { lead: "Lead", enquiry: "Enquiry", support: "Support", feedback: "Feedback", complaint: "Complaint" };

const AVATARS = ["bg-[#2563eb]", "bg-[#a21caf]", "bg-[#ea7a0c]", "bg-[#db2777]", "bg-[#0f766e]", "bg-[#f59e0b]", "bg-[#7c3aed]", "bg-[#0891b2]"];

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

/** Topic of a chat from its quotation / callback request, else from the first question */
const chatTopic = (c: ChatSummary) => {
  const request = c.requests?.[c.requests.length - 1];
  if (request) return request.type === "sales-callback" ? "Callback Request" : "Stall Booking";
  const q = (c.firstQuestion?.content || "").toLowerCase();
  if (/sponsor/.test(q)) return "Sponsorship";
  if (/partner/.test(q)) return "Partnership";
  if (/stall|booth|space|exhibit|स्टॉल/.test(q)) return "Stall Booking";
  if (/regist/.test(q)) return "Registration";
  if (/buyer|seller/.test(q)) return "Buyer–Seller Meet";
  return q ? "General Enquiry" : "Chatbot Visit";
};

const CHANNELS: Channel[] = ["Website chat", "WhatsApp", "Phone call", "Email", "Walk-in"];

/** The saved next follow-up; a dated one turns "Overdue" once its time has passed */
const followUpOf = (w: ChatWorkflow | undefined, assignedTo: string, now: number): FollowUp => {
  if (w?.followUpKind === "date" && w.followUpAt) {
    return new Date(w.followUpAt).getTime() < now && w.status !== "Resolved" ? { kind: "overdue", at: w.followUpAt } : { kind: "date", label: formatFollowUp(w.followUpAt), at: w.followUpAt };
  }
  if (w?.followUpKind === "review" || w?.followUpKind === "assign" || w?.followUpKind === "none") return { kind: w.followUpKind };
  return assignedTo === "Unassigned" ? { kind: "assign" } : { kind: "review" };
};

/** The part of a row (and its activity) that is saved on the chat */
const workflowOf = (r: Row, act: Activity[]): WorkflowUpdate => ({
  id: r.chatId ?? "",
  assignedTo: r.assignedTo,
  team: r.team ?? "",
  status: r.status,
  priority: r.priority,
  followUpKind: r.followUp.kind === "overdue" ? (r.followUp.at ? "date" : "review") : r.followUp.kind,
  ...(r.followUp.kind === "date" || (r.followUp.kind === "overdue" && r.followUp.at) ? { followUpAt: r.followUp.at } : {}),
  ...(r.seenAt ? { seenAt: r.seenAt } : {}),
  activity: act.map(({ kind, text, by, at }) => ({ kind, text, ...(by ? { by } : {}), ...(at ? { at } : {}) })),
});

/** Records whose workflow differs from what was last saved (`saved`: chat id → JSON) */
const unsavedWorkflows = (records: Row[], activity: Record<number, Activity[]>, saved: Map<string, string>) =>
  records
    .filter((r) => r.chatId)
    .map((r) => workflowOf(r, activity[r.id] ?? []))
    .filter((w) => saved.get(w.id) !== JSON.stringify(w));

/** Saves them in batches of 500; false when a batch failed */
const saveWorkflows = async (changed: WorkflowUpdate[], saved: Map<string, string>) => {
  for (let i = 0; i < changed.length; i += 500) {
    const batch = changed.slice(i, i + 500);
    try {
      await chatbotApi.saveWorkflow(batch);
      batch.forEach((w) => saved.set(w.id, JSON.stringify(w)));
    } catch {
      return false;
    }
  }
  return true;
};

/** One inbox record per saved chat (or hand-added enquiry), with its activity */
const chatsToRows = (chats: ChatSummary[]): { rows: Row[]; activity: Record<number, Activity[]> } => {
  const now = Date.now();
  const activity: Record<number, Activity[]> = {};
  const phoneCounts = new Map<string, number>();
  chats.forEach((c) => {
    if (c.lead?.phone) phoneCounts.set(c.lead.phone, (phoneCounts.get(c.lead.phone) || 0) + 1);
  });
  const rows = chats.map((c, i): Row => {
    const w = c.workflow;
    if (w?.activity?.length) activity[i + 1] = w.activity;
    const name = visitorLabel(c);
    const request = c.requests?.[c.requests.length - 1];
    const phone = c.lead?.phone;
    const manual = c.source === "manual";
    const category: Category = manual && c.manual?.category ? c.manual.category : request || phone ? "lead" : c.feedback && !c.questionCount ? "feedback" : "enquiry";
    const tag: Tag = manual ? ((phoneCounts.get(phone || "") || 0) > 1 ? "Returning" : "New") : !phone ? "Anonymous" : (phoneCounts.get(phone) || 0) > 1 ? "Returning" : c.phoneVerifiedAt ? "Verified" : "New";
    const assignedTo = w?.assignedTo || "Unassigned";
    const lastMessageAt = c.lastMessage?.createdAt ? new Date(c.lastMessage.createdAt).getTime() : 0;
    const lastActivity = Math.max(new Date(c.updatedAt).getTime(), w?.updatedAt ? new Date(w.updatedAt).getTime() : 0);
    const chatDetail = request
      ? request.type === "sales-callback"
        ? `Callback request${request.preferredTime ? `, ${request.preferredTime}` : ""}`
        : `${request.stallSize ? `${request.stallSize} ` : ""}quotation request${request.company ? ` (${request.company})` : ""}`
      : c.firstQuestion?.content || (c.feedback ? `Rated the chat ${c.feedback === "yes" ? "helpful" : "not helpful"}` : "Browsed the chatbot menu");
    return {
      id: i + 1,
      chatId: c._id,
      name,
      initials: initialsOf(name.replace(/^Visitor\s+/, "V ")),
      avatar: AVATARS[i % AVATARS.length],
      tag,
      category,
      type: manual && c.manual?.type ? c.manual.type : TYPE_LABEL[category],
      topic: manual ? c.manual?.topic || "General Enquiry" : chatTopic(c),
      detail: manual ? c.manual?.detail || "" : chatDetail,
      assignedTo,
      status: w?.status || "New",
      priority: w?.priority || (request ? "High" : phone ? "Medium" : "Low"),
      followUp: followUpOf(w, assignedTo, now),
      minutesAgo: Math.max(0, Math.floor((now - lastActivity) / 60_000)),
      channel: manual ? (CHANNELS.find((ch) => ch === c.manual?.channel) ?? "Phone call") : "Website chat",
      // The visitor's last question has no reply yet and has not been read here
      unread: !manual && c.questionCount > 0 && c.lastMessage?.role === "user" && (!w?.seenAt || new Date(w.seenAt).getTime() < lastMessageAt),
      mobile: phone,
      email: c.lead?.email,
      team: w?.team,
      seenAt: w?.seenAt,
      createdAt: c.createdAt,
      manual,
    };
  });
  return { rows, activity };
};

// ─── Display helpers ─────────────────────────────────────────────────────────

type Action = "View" | "Review" | "Assign";

/** Unassigned rows need an owner, overdue ones a review; everything else is a plain view */
const actionFor = (r: Row): Action => (r.assignedTo === "Unassigned" ? "Assign" : r.followUp.kind === "overdue" ? "Review" : "View");

const ago = (m: number) =>
  m < 1 ? "Just now" : m < 60 ? `${m} min ago` : m < DAY ? `${Math.floor(m / 60)} hr ago` : m < 2 * DAY ? "Yesterday" : `${Math.floor(m / DAY)} days ago`;

const followUpText = (f: FollowUp) =>
  f.kind === "date" ? f.label : f.kind === "overdue" ? "Overdue" : f.kind === "review" ? "Review Pending" : f.kind === "assign" ? "Assign Team" : "—";

/** "2026-10-05T15:00" → "Today, 3:00 PM" / "Tomorrow, …" / "12 Oct, …" */
function formatFollowUp(value: string) {
  const at = new Date(value);
  const time = at.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase();
  const days = Math.round((new Date(at).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86_400_000);
  const day = days === 0 ? "Today" : days === 1 ? "Tomorrow" : at.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  return `${day}, ${time}`;
}

const shortDate = (iso: string) => new Date(`${iso}T00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

const TAG_CLASS: Record<Tag, string> = {
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
  Resolved: { className: "bg-[#e6f6ea] text-[#15803d]", icon: <Check className="h-[17px] w-[17px]" strokeWidth={2.6} /> },
};

const PRIORITY_CLASS: Record<Priority, string> = {
  High: "bg-[#fdecec] text-[#dc2626]",
  Medium: "bg-[#fdf3e1] text-[#d97706]",
  Low: "bg-[#f1f3f5] text-[#475569]",
};

const CHANNEL_ICON: Record<Channel, LucideIcon> = {
  "Website chat": MessageSquare,
  WhatsApp: MessageCircle,
  "Phone call": Phone,
  Email: Mail,
  "Walk-in": Footprints,
};

const ACTION_CLASS: Record<Action, string> = {
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
        <span className="flex items-center gap-[8px] font-medium text-[#0f172a]">
          <CalendarDays className="h-[18px] w-[18px] shrink-0 text-[#dc2626]" /> <span className="truncate">{value.label}</span>
        </span>
      );
    case "overdue":
      return (
        <span className="inline-flex h-[28px] items-center gap-[8px] rounded-[6px] bg-[#fdecec] px-[11px] font-medium text-[#dc2626]">
          <ExclamationDot /> Overdue
        </span>
      );
    case "review":
      return (
        <span className="inline-flex h-[28px] items-center gap-[8px] rounded-[6px] bg-[#fdf3e1] px-[11px] font-medium text-[#d97706]">
          <Hourglass className="h-[16px] w-[16px]" /> Review Pending
        </span>
      );
    case "assign":
      return (
        <span className="flex items-center gap-[8px] font-medium text-[#d97706]">
          <UserPlus className="h-[18px] w-[18px]" /> Assign Team
        </span>
      );
    case "none":
      return <span className="text-[#94a3b8]">—</span>;
  }
}

// ─── Filters & sorting ───────────────────────────────────────────────────────

const GRID = "grid grid-cols-[40px_186px_222px_160px_150px_92px_170px_104px_1fr] items-center";

type FilterKey = "topic" | "status" | "assignedTo" | "priority";
const FILTER_LABELS: Record<FilterKey, string> = { topic: "Topic", status: "Status", assignedTo: "Assigned To", priority: "Priority" };
const NO_FILTERS: Record<FilterKey, string> = { topic: "", status: "", assignedTo: "", priority: "" };

type More = { channel: string; tag: string; unreadOnly: boolean };
const NO_MORE: More = { channel: "", tag: "", unreadOnly: false };

/** Shortcut filters set from the summary cards and the attention bar */
type Quick = "new" | "unassigned" | "due" | "overdue" | "attention";
const QUICK_LABEL: Record<Quick, string> = { new: "New", unassigned: "Unassigned", due: "Follow-ups due", overdue: "Overdue", attention: "Overdue or unassigned" };
const QUICK_TEST: Record<Quick, (r: Row) => boolean> = {
  new: (r) => r.status === "New",
  unassigned: (r) => r.assignedTo === "Unassigned",
  due: (r) => r.followUp.kind === "date",
  overdue: (r) => r.followUp.kind === "overdue",
  attention: (r) => r.followUp.kind === "overdue" || r.assignedTo === "Unassigned",
};

type SortKey = "name" | "assignedTo" | "status" | "priority" | "minutesAgo";
const PRIORITY_RANK: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };
const STATUS_RANK: Record<Status, number> = { New: 0, "In Progress": 1, "Follow-up": 2, Assigned: 3, "Waiting for Visitor": 4, Resolved: 5 };
const SORTERS: Record<SortKey, (a: Row, b: Row) => number> = {
  name: (a, b) => a.name.localeCompare(b.name),
  assignedTo: (a, b) => a.assignedTo.localeCompare(b.assignedTo),
  status: (a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status],
  priority: (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority],
  minutesAgo: (a, b) => a.minutesAgo - b.minutesAgo,
};

const SUMMARY: { key: Exclude<Quick, "attention">; title: string; note: string; icon: LucideIcon; iconClass: string; valueClass: string; cardClass: string; ring: string }[] = [
  {
    key: "new",
    title: "NEW",
    note: "New enquiries received",
    icon: Users,
    iconClass: "border-[#cfe9d6] text-[#15803d]",
    valueClass: "text-[#14532d]",
    cardClass: "border-[#cfe9d6] bg-gradient-to-br from-[#f3fbf5] via-[#f7fcf8] to-[#e3f5e8]",
    ring: "ring-[#15803d]",
  },
  {
    key: "unassigned",
    title: "UNASSIGNED",
    note: "Awaiting team assignment",
    icon: UserRound,
    iconClass: "border-[#c9daf5] text-[#2563eb]",
    valueClass: "text-[#1d4ed8]",
    cardClass: "border-[#d5e2f6] bg-gradient-to-br from-[#f4f8fe] via-[#f8fbff] to-[#e4eefc]",
    ring: "ring-[#2563eb]",
  },
  {
    key: "due",
    title: "FOLLOW-UPS DUE",
    note: "Require follow-up action",
    icon: Clock3,
    iconClass: "border-[#f6dfb3] text-[#ea7a0c]",
    valueClass: "text-[#ea7a0c]",
    cardClass: "border-[#f5e3bf] bg-gradient-to-br from-[#fffaf0] via-[#fffcf5] to-[#fdf0d2]",
    ring: "ring-[#ea7a0c]",
  },
  {
    key: "overdue",
    title: "OVERDUE",
    note: "Past due for response",
    icon: AlertTriangle,
    iconClass: "border-[#f6caca] text-[#dc2626]",
    valueClass: "text-[#dc2626]",
    cardClass: "border-[#f6d3d3] bg-gradient-to-br from-[#fff6f6] via-[#fffafa] to-[#fde6e6]",
    ring: "ring-[#dc2626]",
  },
];

const MENU_ITEM = "block w-full px-[12px] py-[7px] text-left text-[#0f172a] outline-none hover:bg-[#f1f7ee] focus-visible:bg-[#f1f7ee]";

const selectClass = (active: boolean) =>
  `h-[36px] cursor-pointer appearance-none rounded-[8px] border bg-white pl-[16px] pr-[40px] text-[13.1px] outline-none transition focus:border-[#15633a] ${
    active ? "border-[#15633a] font-medium text-[#15633a]" : "border-[#dfe3e8] text-[#0f172a]"
  }`;

// ─── Toast ───────────────────────────────────────────────────────────────────

type Toast = { id: number; text: string; undo?: () => void };

/** Bottom-centre confirmation; rendered into document.body so the page zoom does not shrink it */
function ToastBar({ toast, onDone }: { toast: Toast | null; onDone: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDone, toast.undo ? 6000 : 3500);
    return () => clearTimeout(t);
  }, [toast, onDone]);

  if (!toast || typeof document === "undefined") return null;
  return createPortal(
    <div role="status" className="fixed bottom-[24px] left-1/2 z-[300] flex -translate-x-1/2 items-center gap-[12px] rounded-[10px] bg-[#0f2a1c] py-[10px] pl-[14px] pr-[10px] text-[13.5px] text-white shadow-lg">
      <CircleCheck className="h-[18px] w-[18px] shrink-0 text-[#4ade80]" />
      <span>{toast.text}</span>
      {toast.undo && (
        <button
          type="button"
          onClick={() => {
            toast.undo?.();
            onDone();
          }}
          className="rounded-[6px] px-[8px] py-[2px] font-semibold text-[#4ade80] hover:bg-white/10"
        >
          Undo
        </button>
      )}
      <button type="button" onClick={onDone} aria-label="Dismiss" className="grid h-[24px] w-[24px] place-items-center rounded-full text-white/70 hover:bg-white/10 hover:text-white">
        <X className="h-[15px] w-[15px]" />
      </button>
    </div>,
    document.body
  );
}

/** Page numbers with gaps once there are many pages: 1 … 4 5 6 … 12 */
function pageList(current: number, count: number): (number | "gap")[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const middle = [current - 1, current, current + 1].filter((n) => n > 1 && n < count);
  if (current <= 3) middle.push(2, 3, 4);
  if (current >= count - 2) middle.push(count - 3, count - 2, count - 1);
  const pages = [...new Set([1, ...middle, count])].sort((a, b) => a - b);
  return pages.flatMap((n, i) => (i > 0 && n - pages[i - 1] > 1 ? ["gap" as const, n] : [n]));
}

type Confirm = { title: string; body: string; confirmLabel: string; run: () => void };

/** Small yes/no dialog for actions that change many records at once */
function ConfirmDialog({ confirm, onClose }: { confirm: Confirm | null; onClose: () => void }) {
  const okRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!confirm) return;
    okRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirm, onClose]);

  if (!confirm || typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 font-sans">
      <div aria-hidden="true" onClick={onClose} className="absolute inset-0 bg-[#0b1f14]/55 backdrop-blur-[2px]" />
      <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" className="relative w-[400px] max-w-full rounded-[14px] bg-white p-[20px] text-[#0f172a] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)]">
        <h2 id="confirm-title" className="text-[17.5px] font-bold text-[#0f2a1c]">
          {confirm.title}
        </h2>
        <p className="mt-[6px] text-[13.5px] text-[#475569]">{confirm.body}</p>
        <div className="mt-[16px] flex justify-end gap-[12px]">
          <button type="button" onClick={onClose} className="h-[30px] rounded-[8px] border border-[#cbd5e1] bg-white px-[20px] text-[13.5px] font-semibold transition hover:bg-slate-50">
            Cancel
          </button>
          <button
            ref={okRef}
            type="button"
            onClick={() => {
              confirm.run();
              onClose();
            }}
            className="h-[30px] rounded-[8px] bg-[#15803d] px-[20px] text-[13.5px] font-semibold text-white shadow-sm transition hover:bg-[#166534]"
          >
            {confirm.confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ChatbotInboxPage() {
  const [records, setRecords] = useState<Row[]>([]);
  const [activity, setActivity] = useState<Record<number, Activity[]>>({});
  // Active staff (Staff Management) are the people records can be assigned to
  const [staff, setStaff] = useState<{ name: string; available: boolean; email?: string }[]>([]);
  // Signs the activity entries made on this page
  const me = useAppSelector((state) => state.auth.admin?.name) || "Admin";
  // Last saved workflow per chat (JSON), so only real changes are sent
  const savedRef = useRef(new Map<string, string>());

  // Range, tab and filters
  const [range, setRange] = useState<Range>("Last 7 Days");
  const [custom, setCustom] = useState({ from: "", to: "" });
  const [customOpen, setCustomOpen] = useState(false);
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(NO_FILTERS);
  const [more, setMore] = useState(NO_MORE);
  const [moreOpen, setMoreOpen] = useState(false);
  const [quick, setQuick] = useState<Quick | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "minutesAgo", dir: "asc" });

  // Table
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Popups: row ⋮ menu, assign, resolve, detail, new enquiry
  const [menuId, setMenuId] = useState<number | null>(null);
  // Rows near the bottom of the window open their ⋮ menu upwards
  const [menuUp, setMenuUp] = useState(false);
  const menuRef = useRef<HTMLSpanElement>(null);
  const [reassignId, setReassignId] = useState<number | null>(null);
  const [resolveId, setResolveId] = useState<number | null>(null);
  const [detail, setDetail] = useState<{ id: number; mode: ComposeMode } | null>(null);
  // Bumped on each opening so the New Enquiry form starts empty
  const [newEnquiryKey, setNewEnquiryKey] = useState<number | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [confirm, setConfirm] = useState<Confirm | null>(null);

  const reassignRow = records.find((r) => r.id === reassignId) ?? null;
  const resolveRow = records.find((r) => r.id === resolveId) ?? null;
  const detailRow = records.find((r) => r.id === detail?.id) ?? null;

  const { ref, zoom } = useFitWidth();

  // Every saved chat (the date range is applied on this page); reloaded on range change and Retry
  const loadSeq = useRef(0);
  const fetchRecords = () => {
    const seq = ++loadSeq.current;
    chatbotApi
      .list({ limit: 1000, source: "all" })
      .then((res) => {
        if (seq !== loadSeq.current) return;
        const { rows, activity: loaded } = chatsToRows(res.chats.filter((c) => !c.workflow?.spam));
        // The same map stays in use, so a save still in flight records into it
        savedRef.current.clear();
        rows.forEach((r) => savedRef.current.set(r.chatId ?? "", JSON.stringify(workflowOf(r, loaded[r.id] ?? []))));
        setRecords(rows);
        setActivity(loaded);
      })
      .catch(() => seq === loadSeq.current && setLoadError(true))
      .finally(() => seq === loadSeq.current && setLoading(false));
  };
  const showLoading = () => {
    setLoading(true);
    setLoadError(false);
    // A change made just before (still waiting to be saved) is saved first, so the reload keeps it
    const pending = unsavedWorkflows(records, activity, savedRef.current);
    if (!pending.length) return fetchRecords();
    void saveWorkflows(pending, savedRef.current).then(fetchRecords);
  };
  // `loading` starts true, so the first load only needs the fetch
  useEffect(fetchRecords, []);

  useEffect(() => {
    staffApi
      .list()
      .then((list) => setStaff(list.filter((m) => m.status !== "INACTIVE").map((m) => ({ name: m.name, available: m.status === "ACTIVE", email: m.email }))))
      .catch(() => setStaff([]));
  }, []);

  // Save each changed record's workflow (owner, status, priority, follow-up, activity) shortly after the change
  useEffect(() => {
    const saved = savedRef.current;
    const changed = unsavedWorkflows(records, activity, saved);
    if (!changed.length) return;
    const timer = setTimeout(async () => {
      if (!(await saveWorkflows(changed, saved))) {
        setToast((prev) => ({ id: (prev?.id ?? 0) + 1, text: "Could not save the latest change — check your connection and try again." }));
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [records, activity]);

  // Leaving the page within that moment still saves the change
  const latestRef = useRef({ records, activity });
  useEffect(() => {
    latestRef.current = { records, activity };
  }, [records, activity]);
  useEffect(() => {
    const saved = savedRef.current;
    const latest = latestRef;
    return () => {
      const pending = unsavedWorkflows(latest.current.records, latest.current.activity, saved);
      if (pending.length) void saveWorkflows(pending, saved);
    };
  }, []);

  // Escape closes whichever dropdown is open (the popups handle their own buttons)
  const anyDropdown = menuId !== null || moreOpen || customOpen;
  useEffect(() => {
    if (!anyDropdown) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (menuId !== null) document.getElementById(`menu-trigger-${menuId}`)?.focus();
      setMenuId(null);
      setMoreOpen(false);
      setCustomOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [anyDropdown, menuId]);

  // Focus the first item when a ⋮ menu opens
  useEffect(() => {
    if (menuId !== null) menuRef.current?.querySelector<HTMLButtonElement>("[role^=menuitem]")?.focus();
  }, [menuId]);

  /** Arrow keys / Home / End move between ⋮ menu items */
  const menuKeys = (e: React.KeyboardEvent) => {
    const items = [...(menuRef.current?.querySelectorAll<HTMLButtonElement>("[role^=menuitem]") ?? [])];
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    const next = e.key === "ArrowDown" ? (i + 1) % items.length : e.key === "ArrowUp" ? (i - 1 + items.length) % items.length : e.key === "Home" ? 0 : e.key === "End" ? items.length - 1 : -1;
    if (next < 0) return;
    e.preventDefault();
    items[next]?.focus();
  };

  const openMenu = (id: number, trigger: HTMLElement) => {
    if (menuId === id) return setMenuId(null);
    setMenuUp(window.innerHeight - trigger.getBoundingClientRect().bottom < 290 * zoom);
    setMenuId(id);
  };

  const owners = staff.length ? staff.map((m) => m.name) : [...new Set(records.map((r) => r.assignedTo))].filter((o) => o !== "Unassigned");
  const ownerInfo: OwnerInfo[] = owners.map((name) => ({
    name,
    available: staff.find((m) => m.name === name)?.available ?? true,
    email: staff.find((m) => m.name === name)?.email,
    open: records.filter((r) => r.assignedTo === name && r.status !== "Resolved").length,
  }));

  const notify = (text: string, undo?: () => void) => setToast((prev) => ({ id: (prev?.id ?? 0) + 1, text, undo }));
  const closeToast = useMemo(() => () => setToast(null), []);
  const closeConfirm = useMemo(() => () => setConfirm(null), []);

  // ── Derived lists ──
  // Minutes since midnight, fixed at load like the sample "minutes ago" values
  const [clock] = useState(() => {
    const now = new Date();
    return { now: now.getTime(), sinceMidnight: now.getHours() * 60 + now.getMinutes() };
  });

  const inRange = (m: number) => {
    switch (range) {
      case "Today":
        return m <= clock.sinceMidnight;
      case "Yesterday":
        return m > clock.sinceMidnight && m <= clock.sinceMidnight + DAY;
      case "Last 7 Days":
        return m < 7 * DAY;
      case "Last 30 Days":
        return m < 30 * DAY;
      case "All Time":
        return true;
      case "Custom": {
        const at = clock.now - m * 60_000;
        return at >= new Date(`${custom.from}T00:00`).getTime() && at <= new Date(`${custom.to}T23:59:59`).getTime();
      }
    }
  };

  // Records in the chosen date range — the base for every count on the page
  const scoped = records.filter((r) => inRange(r.minutesAgo));

  const q = search.trim().toLowerCase();
  const matchesFilters = (r: Row) =>
    (!q || [r.name, r.type, r.topic, r.detail, r.assignedTo, r.mobile ?? "", r.email ?? ""].some((v) => v.toLowerCase().includes(q))) &&
    (Object.keys(filters) as FilterKey[]).every((k) => !filters[k] || r[k] === filters[k]) &&
    (!more.channel || r.channel === more.channel) &&
    (!more.tag || r.tag === more.tag) &&
    (!more.unreadOnly || r.unread) &&
    (!quick || QUICK_TEST[quick](r));

  const filtered = scoped.filter(matchesFilters);
  const tabCount = (key: (typeof TABS)[number]["key"]) => (key === "all" ? filtered.length : filtered.filter((r) => r.category === key).length);

  const rows = filtered
    .filter((r) => tab === "all" || r.category === tab)
    .sort((a, b) => (sort.dir === "asc" ? 1 : -1) * SORTERS[sort.key](a, b) || a.minutesAgo - b.minutesAgo);

  const pageCount = Math.max(1, Math.ceil(rows.length / perPage));
  const current = Math.min(page, pageCount);
  const pageRows = rows.slice((current - 1) * perPage, current * perPage);

  const summaryCount = (key: Quick) => scoped.filter(QUICK_TEST[key]).length;
  const overdueCount = summaryCount("overdue");
  const unassignedCount = summaryCount("unassigned");

  const filterOptions = useMemo(
    () => ({
      topic: [...new Set(records.map((r) => r.topic))].sort(),
      status: Object.keys(STATUS_RANK),
      assignedTo: [...new Set(records.map((r) => r.assignedTo))].sort(),
      priority: ["High", "Medium", "Low"],
    }),
    [records]
  );

  const moreCount = (more.channel ? 1 : 0) + (more.tag ? 1 : 0) + (more.unreadOnly ? 1 : 0);
  const anyFilter = !!q || Object.values(filters).some(Boolean) || moreCount > 0 || quick !== null;

  const chips: { key: string; label: string; clear: () => void }[] = [
    ...(q ? [{ key: "search", label: `Search: “${search.trim()}”`, clear: () => setSearch("") }] : []),
    ...(quick ? [{ key: "quick", label: QUICK_LABEL[quick], clear: () => setQuick(null) }] : []),
    ...(Object.keys(filters) as FilterKey[])
      .filter((k) => filters[k])
      .map((k) => ({ key: k, label: `${FILTER_LABELS[k]}: ${filters[k]}`, clear: () => setFilters((p) => ({ ...p, [k]: "" })) })),
    ...(more.channel ? [{ key: "channel", label: `Channel: ${more.channel}`, clear: () => setMore((p) => ({ ...p, channel: "" })) }] : []),
    ...(more.tag ? [{ key: "tag", label: `Visitor: ${more.tag}`, clear: () => setMore((p) => ({ ...p, tag: "" })) }] : []),
    ...(more.unreadOnly ? [{ key: "unread", label: "Unread only", clear: () => setMore((p) => ({ ...p, unreadOnly: false })) }] : []),
  ];

  const clearAll = () => {
    setSearch("");
    setFilters(NO_FILTERS);
    setMore(NO_MORE);
    setQuick(null);
    setPage(1);
  };

  // ── Selection ──
  const selectedRows = records.filter((r) => selected.has(r.id));
  const pageAllSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(r.id));
  const pageSomeSelected = pageRows.some((r) => selected.has(r.id));
  const togglePage = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      pageRows.forEach((r) => (pageAllSelected ? next.delete(r.id) : next.add(r.id)));
      return next;
    });
  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // ── Record updates ──
  const log = (id: number, ...entries: Activity[]) => {
    const at = new Date().toISOString();
    setActivity((prev) => ({ ...prev, [id]: [...(prev[id] ?? []), ...entries.map((e) => ({ ...e, at: e.at ?? at, by: e.by ?? me }))] }));
  };
  const patch = (ids: number[], change: (r: Row) => Partial<Row>) => setRecords((prev) => prev.map((r) => (ids.includes(r.id) ? { ...r, ...change(r) } : r)));

  /** Puts the given rows and their activity back as they are now — used by Undo */
  const snapshot = (ids: number[]) => {
    const before = records.filter((r) => ids.includes(r.id));
    const beforeActivity = activity;
    return () => {
      setRecords((prev) => [...prev.filter((r) => !ids.includes(r.id)), ...before]);
      setActivity((prev) => {
        const next = { ...prev };
        ids.forEach((id) => {
          if (beforeActivity[id]) next[id] = beforeActivity[id];
          else delete next[id];
        });
        return next;
      });
    };
  };

  const assign = (ids: number[], owner: string) =>
    patch(ids, (r) => ({
      assignedTo: owner,
      status: r.status === "Resolved" ? r.status : "Assigned",
      followUp: r.followUp.kind === "assign" ? { kind: "review" } : r.followUp,
      minutesAgo: 0,
    }));

  const resolve = (ids: number[]) => patch(ids, () => ({ status: "Resolved", followUp: { kind: "none" }, minutesAgo: 0, unread: false }));

  const setPriority = (ids: number[], priority: Priority) => patch(ids, () => ({ priority }));

  const openDetail = (id: number, mode: ComposeMode = "reply") => {
    setMenuId(null);
    setDetail({ id, mode });
    patch([id], (r) => (r.unread ? { unread: false, seenAt: new Date().toISOString() } : {}));
  };

  const createEnquiry = async (e: NewEnquiry) => {
    try {
      await chatbotApi.createManual({
        name: e.name,
        mobile: e.mobile || undefined,
        email: e.email || undefined,
        category: e.category,
        type: e.type,
        topic: e.topic,
        detail: e.detail,
        priority: e.priority,
        assignedTo: e.assignedTo,
        source: e.source,
        followUpAt: e.followUpAt ? new Date(e.followUpAt).toISOString() : undefined,
      });
    } catch (err) {
      notify(err instanceof Error && err.message ? err.message : "Could not create the enquiry.");
      return;
    }
    // Make sure the new record is visible
    if (range === "Yesterday" || range === "Custom") setRange("Last 7 Days");
    setTab("all");
    clearAll();
    setSort({ key: "minutesAgo", dir: "asc" });
    setNewEnquiryKey(null);
    showLoading();
    notify(`Enquiry created for ${e.name}`);
  };

  // A reply clears an overdue / pending review and waits on the visitor
  const replyTo = (id: number, text: string) => {
    log(id, { kind: "reply", text });
    patch([id], (r) => ({
      minutesAgo: 0,
      status: r.status === "Resolved" ? r.status : "Waiting for Visitor",
      followUp: r.followUp.kind === "overdue" || r.followUp.kind === "review" ? { kind: "none" } : r.followUp,
    }));
  };

  const markSpam = (r: Row) => {
    setMenuId(null);
    setRecords((prev) => prev.filter((x) => x.id !== r.id));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(r.id);
      return next;
    });
    if (r.chatId) chatbotApi.saveWorkflow([{ id: r.chatId, spam: true }]).catch(() => notify("Could not mark as spam."));
    notify(`${r.name} marked as spam`, () => {
      setRecords((prev) => [...prev, r]);
      if (r.chatId) chatbotApi.saveWorkflow([{ id: r.chatId, spam: false }]).catch(() => notify("Could not undo."));
    });
  };

  const exportCsv = (list: Row[], file: string) => {
    const header = ["Enquiry", "Visitor", "Mobile", "Email", "Channel", "Type", "Topic", "Details", "Assigned To", "Status", "Priority", "Next Follow-up", "Last Activity"];
    const lines = list.map((r) =>
      [`OM-${1047 + r.id}`, r.name, r.mobile ?? "", r.email ?? "", r.channel, r.type, r.topic, r.detail, r.assignedTo, r.status, r.priority, followUpText(r.followUp), ago(r.minutesAgo)]
        .map((v) => `"${v.replace(/"/g, '""')}"`)
        .join(",")
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file;
    a.click();
    URL.revokeObjectURL(url);
    notify(`${list.length} record${list.length === 1 ? "" : "s"} exported`);
  };

  const changeRange = (r: Range) => {
    if (r === "Custom") {
      setCustomOpen((o) => !o);
      return;
    }
    setCustomOpen(false);
    setRange(r);
    setPage(1);
    showLoading();
  };

  const toggleSort = (key: SortKey) => setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));

  const sortHeader = (k: SortKey, label: string) => {
    const active = sort.key === k;
    const Icon = !active ? ArrowUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown;
    return (
      <button
        type="button"
        onClick={() => toggleSort(k)}
        aria-label={`Sort by ${label}`}
        className={`inline-flex items-center gap-[5px] text-left transition hover:text-[#15633a] ${active ? "font-semibold text-[#15633a]" : ""}`}
      >
        {label}
        <Icon className={`h-[14px] w-[14px] ${active ? "" : "opacity-40"}`} />
      </button>
    );
  };

  const firstShown = rows.length ? (current - 1) * perPage + 1 : 0;
  const lastShown = Math.min(current * perPage, rows.length);
  const today = isoDate(new Date(clock.now));
  const allMatchingSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));

  return (
    <div ref={ref} className="w-full overflow-x-hidden bg-white">
    <div style={{ zoom, width: DESIGN_WIDTH }} className="flex flex-col px-[16px] pb-[12px] pt-[12px] text-[#0f172a]">
      {/* ── Header ── */}
      {/* One row: the page name is already in the top bar, so only the subtitle is shown here
          (it truncates if space runs out) */}
      <div className="flex items-center justify-between gap-x-3 pb-[14px]">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-[12px]">
            <p className="min-w-0 truncate text-[17.5px] font-medium text-[#334155]">Organic Mitra — conversations, enquiries &amp; team follow-ups</p>
            <span
              title="Records are live website chats and hand-added enquiries. Assignment, status, follow-ups and notes are saved."
              className="inline-flex shrink-0 items-center gap-[6px] whitespace-nowrap rounded-[6px] border border-[#cfe9d6] bg-[#eefaf1] px-[11px] py-[4px] text-[13.4px] font-medium text-[#15803d]"
            >
              Live data <Info className="h-[14px] w-[14px]" />
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-[8px]">
          <div className="relative flex items-center gap-[2px] rounded-[8px] border border-[#e5e7eb] bg-[#f3f4f6] p-[3px]">
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => changeRange(r)}
                aria-pressed={range === r}
                aria-expanded={r === "Custom" ? customOpen : undefined}
                className={`inline-flex items-center gap-[5px] whitespace-nowrap rounded-[6px] px-[10px] py-[6px] text-[12.4px] font-medium transition ${
                  range === r ? "bg-[#15633a] font-semibold text-white shadow-sm" : "text-[#334155] hover:bg-white"
                }`}
              >
                {r === "Custom" && <CalendarDays className="h-[14px] w-[14px]" />}
                {r === "Custom" && range === "Custom" ? `${shortDate(custom.from)} – ${shortDate(custom.to)}` : r}
              </button>
            ))}

            {/* Custom range picker */}
            {customOpen && (
              <>
                <button type="button" aria-label="Close date picker" className="fixed inset-0 z-10 cursor-default" onClick={() => setCustomOpen(false)} />
                <div role="dialog" aria-label="Custom date range" className="absolute right-0 top-full z-20 mt-[6px] w-[300px] rounded-[10px] border border-[#e5e7eb] bg-white p-[14px] shadow-lg">
                  <DateRangeCalendar
                    initial={custom}
                    max={today}
                    onCancel={() => setCustomOpen(false)}
                    onApply={(next) => {
                      setCustom(next);
                      setRange("Custom");
                      setCustomOpen(false);
                      setPage(1);
                      showLoading();
                    }}
                  />
                </div>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => exportCsv(rows, "inbox-and-leads.csv")}
            disabled={rows.length === 0}
            className="inline-flex h-[36px] items-center gap-[7px] rounded-[8px] border border-[#d6dae0] bg-white px-[12px] text-[13.4px] font-medium text-[#0f172a] transition hover:border-[#15633a] hover:text-[#15633a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <SquareArrowOutUpRight className="h-[16px] w-[16px]" /> Export
          </button>
          <button
            type="button"
            onClick={() => setNewEnquiryKey(Date.now())}
            className="inline-flex h-[36px] items-center gap-[7px] rounded-[8px] bg-[#15633a] px-[14px] text-[13.4px] font-medium text-white shadow-sm transition hover:bg-[#124f2f]"
          >
            <Plus className="h-[17px] w-[17px]" /> New Enquiry
          </button>
        </div>
      </div>

      {/* ── Summary cards — each one filters the table ── */}
      <div className="grid grid-cols-2 gap-[12px] xl:grid-cols-4">
        {SUMMARY.map((c) => {
          const Icon = c.icon;
          const active = quick === c.key;
          return (
            <button
              key={c.key}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setQuick(active ? null : c.key);
                setPage(1);
              }}
              className={`group flex h-[84px] items-center gap-[14px] rounded-[12px] border px-[14px] text-left transition hover:-translate-y-px hover:shadow-md ${c.cardClass} ${active ? `ring-2 ${c.ring}` : ""}`}
            >
              <span className={`grid h-[42px] w-[42px] shrink-0 place-items-center rounded-full border bg-white ${c.iconClass}`}>
                <Icon className="h-[20px] w-[20px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11.2px] font-semibold text-[#0f172a]">{c.title}</span>
                <span className={`mt-[3px] block text-[24.5px] font-bold leading-none ${c.valueClass}`}>
                  {loading ? <span className="inline-block h-[22px] w-[34px] animate-pulse rounded-[4px] bg-black/10 align-middle" /> : loadError ? "—" : summaryCount(c.key)}
                </span>
                <span className="mt-[5px] block text-[12.6px] text-[#475569]">{active ? "Showing in table — click to clear" : c.note}</span>
              </span>
              {active ? <X className="h-[17px] w-[17px] shrink-0 text-[#334155]" /> : <ChevronRight className="h-[17px] w-[17px] shrink-0 text-[#334155] transition group-hover:translate-x-0.5" />}
            </button>
          );
        })}
      </div>

      {/* ── Conversations table ── */}
      <div className="mt-[12px] rounded-[12px] border border-[#e3e8e4] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <div className="flex items-end justify-between gap-x-4 border-b border-[#eef0f2] px-[16px] pt-[8px]">
          <p className="pb-[10px] text-[16.6px] font-bold tracking-[-0.01em] text-[#0f2a1c]">All Conversations &amp; Enquiries</p>
          <div className="flex items-end gap-[14px]">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => {
                  setTab(t.key);
                  setPage(1);
                }}
                className={`border-b-[3px] px-[14px] pb-[9px] text-[13.1px] transition ${
                  tab === t.key ? "border-[#15633a] font-semibold text-[#15633a]" : "border-transparent text-[#334155] hover:text-[#15633a]"
                }`}
              >
                {t.label} ({loading ? "…" : loadError ? "—" : tabCount(t.key)})
              </button>
            ))}
          </div>
        </div>

        <div className="px-[14px] pb-[10px] pt-[10px]">
          {/* Search + filters */}
          <div className="flex items-center gap-[12px]">
            <label className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-[14px] top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-[#475569]" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search name, mobile, email or message..."
                className="h-[36px] w-full rounded-[8px] border border-[#dfe3e8] bg-white pl-[40px] pr-[34px] text-[13.1px] text-[#0f172a] outline-none transition placeholder:text-[#64748b] focus:border-[#15633a] focus:ring-2 focus:ring-[#15633a]/15"
              />
              {search && (
                <button type="button" onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-[8px] top-1/2 grid h-[22px] w-[22px] -translate-y-1/2 place-items-center rounded-full text-[#64748b] hover:bg-slate-100">
                  <X className="h-[14px] w-[14px]" />
                </button>
              )}
            </label>
            {(Object.keys(FILTER_LABELS) as FilterKey[]).map((k) => (
              <label key={k} className="relative">
                <select
                  value={filters[k]}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, [k]: e.target.value }));
                    setPage(1);
                  }}
                  aria-label={FILTER_LABELS[k]}
                  className={selectClass(!!filters[k])}
                >
                  <option value="">{FILTER_LABELS[k]}</option>
                  {filterOptions[k].map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-[16px] top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-[#334155]" />
              </label>
            ))}

            {/* More filters */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMoreOpen((o) => !o)}
                aria-expanded={moreOpen}
                className={`inline-flex h-[36px] items-center gap-[8px] rounded-[8px] border bg-white px-[16px] text-[13.1px] transition hover:border-[#15633a] ${
                  moreCount ? "border-[#15633a] font-medium text-[#15633a]" : "border-[#dfe3e8] text-[#0f172a]"
                }`}
              >
                <Filter className="h-[17px] w-[17px]" /> More Filters
                {moreCount > 0 && <span className="grid h-[19px] min-w-[19px] place-items-center rounded-full bg-[#15633a] px-[5px] text-[11.2px] font-semibold text-white">{moreCount}</span>}
              </button>
              {moreOpen && (
                <>
                  <button type="button" aria-label="Close filters" className="fixed inset-0 z-10 cursor-default" onClick={() => setMoreOpen(false)} />
                  <div className="absolute right-0 top-full z-20 mt-[6px] w-[280px] rounded-[10px] border border-[#e5e7eb] bg-white p-[14px] shadow-lg">
                    <p className="text-[13.4px] font-semibold text-[#0f172a]">More filters</p>
                    {(
                      [
                        { k: "channel", label: "Channel", options: Object.keys(CHANNEL_ICON) },
                        { k: "tag", label: "Visitor", options: Object.keys(TAG_CLASS) },
                      ] as const
                    ).map((f) => (
                      <label key={f.k} className="mt-[10px] block">
                        <span className="mb-[3px] block text-[12.4px] text-[#475569]">{f.label}</span>
                        <span className="relative block">
                          <select
                            value={more[f.k]}
                            onChange={(e) => {
                              setMore((p) => ({ ...p, [f.k]: e.target.value }));
                              setPage(1);
                            }}
                            className={`${selectClass(!!more[f.k])} w-full`}
                          >
                            <option value="">Any</option>
                            {f.options.map((o) => (
                              <option key={o} value={o}>
                                {o}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-[14px] top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-[#334155]" />
                        </span>
                      </label>
                    ))}
                    <label className="mt-[12px] flex cursor-pointer items-center gap-[10px] text-[13.1px] text-[#0f172a]">
                      <input
                        type="checkbox"
                        checked={more.unreadOnly}
                        onChange={() => {
                          setMore((p) => ({ ...p, unreadOnly: !p.unreadOnly }));
                          setPage(1);
                        }}
                        className="h-[17px] w-[17px] cursor-pointer accent-[#15633a]"
                      />
                      Unread only
                    </label>
                    <div className="mt-[14px] flex justify-between">
                      <button type="button" onClick={() => setMore(NO_MORE)} disabled={moreCount === 0} className="text-[12.6px] font-medium text-[#475569] hover:text-[#0f172a] disabled:opacity-40">
                        Reset
                      </button>
                      <button type="button" onClick={() => setMoreOpen(false)} className="h-[32px] rounded-[7px] bg-[#15633a] px-[14px] text-[12.6px] font-semibold text-white hover:bg-[#124f2f]">
                        Done
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Active filter chips */}
          {chips.length > 0 && (
            <div className="mt-[8px] flex flex-wrap items-center gap-[8px]">
              {chips.map((c) => (
                <span key={c.key} className="inline-flex h-[26px] items-center gap-[6px] rounded-full border border-[#cfe9d6] bg-[#eefaf1] pl-[10px] pr-[4px] text-[12.4px] font-medium text-[#15633a]">
                  {c.label}
                  <button
                    type="button"
                    onClick={() => {
                      c.clear();
                      setPage(1);
                    }}
                    aria-label={`Remove ${c.label}`}
                    className="grid h-[18px] w-[18px] place-items-center rounded-full hover:bg-[#d3eedb]"
                  >
                    <X className="h-[12px] w-[12px]" />
                  </button>
                </span>
              ))}
              <button type="button" onClick={clearAll} className="px-[4px] text-[12.4px] font-medium text-[#dc2626] hover:underline">
                Clear all
              </button>
            </div>
          )}

          {/* Bulk actions */}
          {selectedRows.length > 0 && (
            <div className="mt-[10px] flex h-[42px] items-center gap-[12px] rounded-[8px] border border-[#cfe9d6] bg-[#eefaf1] px-[12px] text-[13.1px]">
              <span className="font-semibold text-[#15633a]">{selectedRows.length} selected</span>
              {!allMatchingSelected && pageAllSelected && rows.length > pageRows.length && (
                <button type="button" onClick={() => setSelected((prev) => new Set([...prev, ...rows.map((r) => r.id)]))} className="font-medium text-[#15633a] underline underline-offset-2 hover:text-[#124f2f]">
                  Select all {rows.length} matching
                </button>
              )}
              <span className="h-[18px] w-px bg-[#cfe9d6]" />
              <label className="relative">
                <select
                  value=""
                  onChange={(e) => {
                    const owner = e.target.value;
                    const ids = selectedRows.map((r) => r.id);
                    const undo = snapshot(ids);
                    assign(ids, owner);
                    ids.forEach((id) => log(id, { kind: "event", text: `Assigned to ${owner}` }));
                    notify(`${ids.length} assigned to ${owner}`, undo);
                  }}
                  aria-label="Assign selected to"
                  className="h-[30px] cursor-pointer appearance-none rounded-[6px] border border-[#f5c27a] bg-white pl-[10px] pr-[28px] text-[12.6px] font-medium text-[#d97706] outline-none"
                >
                  <option value="" disabled>
                    Assign to…
                  </option>
                  {owners.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-[8px] top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-[#d97706]" />
              </label>
              <label className="relative">
                <select
                  value=""
                  onChange={(e) => {
                    const priority = e.target.value as Priority;
                    const ids = selectedRows.map((r) => r.id);
                    const undo = snapshot(ids);
                    setPriority(ids, priority);
                    notify(`Priority set to ${priority} for ${ids.length}`, undo);
                  }}
                  aria-label="Set priority for selected"
                  className="h-[30px] cursor-pointer appearance-none rounded-[6px] border border-[#dfe3e8] bg-white pl-[10px] pr-[28px] text-[12.6px] font-medium text-[#0f172a] outline-none"
                >
                  <option value="" disabled>
                    Set priority…
                  </option>
                  {(["High", "Medium", "Low"] as const).map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-[8px] top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-[#334155]" />
              </label>
              <button
                type="button"
                onClick={() => {
                  const ids = selectedRows.filter((r) => r.status !== "Resolved").map((r) => r.id);
                  if (!ids.length) return notify("Selected records are already resolved");
                  setConfirm({
                    title: `Resolve ${ids.length} record${ids.length === 1 ? "" : "s"}?`,
                    body: "Their pending follow-ups will be cleared. Visitors are not sent an update — use Close / Resolve on a single record for that.",
                    confirmLabel: "Resolve",
                    run: () => {
                      const undo = snapshot(ids);
                      resolve(ids);
                      ids.forEach((id) => log(id, { kind: "event", text: "Resolved (bulk action)" }));
                      notify(`${ids.length} resolved`, undo);
                    },
                  });
                }}
                className="inline-flex h-[30px] items-center gap-[6px] rounded-[6px] border border-[#15803d] bg-white px-[10px] text-[12.6px] font-medium text-[#15803d] hover:bg-[#f3fbf5]"
              >
                <Check className="h-[14px] w-[14px]" /> Resolve
              </button>
              <button
                type="button"
                onClick={() => exportCsv(selectedRows, "inbox-selected.csv")}
                className="inline-flex h-[30px] items-center gap-[6px] rounded-[6px] border border-[#dfe3e8] bg-white px-[10px] text-[12.6px] font-medium text-[#0f172a] hover:border-[#15633a]"
              >
                <SquareArrowOutUpRight className="h-[14px] w-[14px]" /> Export
              </button>
              <button type="button" onClick={() => setSelected(new Set())} className="ml-auto inline-flex items-center gap-[5px] text-[12.6px] font-medium text-[#475569] hover:text-[#0f172a]">
                <X className="h-[14px] w-[14px]" /> Clear selection
              </button>
            </div>
          )}

          {/* Table */}
          <div className="mt-[10px]">
            <div className="text-[13.1px]">
              <div className={`${GRID} rounded-[6px] bg-[#f5f7f6] px-[12px] py-[7px] text-[13.1px] font-medium text-[#334155]`}>
                <input
                  type="checkbox"
                  checked={pageAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = pageSomeSelected && !pageAllSelected;
                  }}
                  onChange={togglePage}
                  disabled={loading || loadError || pageRows.length === 0}
                  aria-label="Select all on this page"
                  className="h-[19px] w-[19px] cursor-pointer rounded-[4px] accent-[#15633a]"
                />
                {sortHeader("name", "Visitor")}
                <span>Type / Topic</span>
                {sortHeader("assignedTo", "Assigned To")}
                {sortHeader("status", "Status")}
                {sortHeader("priority", "Priority")}
                <span>Next Follow-up</span>
                {sortHeader("minutesAgo", "Last Activity")}
                <span>Actions</span>
              </div>

              {loading ? (
                Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className={`${GRID} h-[50px] border-b border-[#eef0f2] px-[12px]`} aria-hidden="true">
                    <span className="h-[17px] w-[17px] rounded-[4px] bg-[#eef0f2]" />
                    <span className="flex items-center gap-[12px]">
                      <span className="h-[34px] w-[34px] animate-pulse rounded-full bg-[#eef0f2]" />
                      <span className="h-[12px] w-[100px] animate-pulse rounded bg-[#eef0f2]" />
                    </span>
                    {[170, 120, 110, 60, 120, 70, 68].map((w, j) => (
                      <span key={j} className="animate-pulse rounded bg-[#eef0f2]" style={{ height: 12, width: w }} />
                    ))}
                  </div>
                ))
              ) : loadError ? (
                <div role="alert" className="flex flex-col items-center py-[36px] text-center">
                  <span className="grid h-[52px] w-[52px] place-items-center rounded-full bg-[#fdecec] text-[#dc2626]">
                    <AlertTriangle className="h-[24px] w-[24px]" />
                  </span>
                  <p className="mt-[10px] text-[14.6px] font-semibold text-[#0f172a]">Couldn’t load conversations</p>
                  <p className="mt-[2px] text-[13.1px] text-[#64748b]">Something went wrong while fetching the inbox. Check your connection and try again.</p>
                  <button
                    type="button"
                    onClick={showLoading}
                    className="mt-[12px] inline-flex h-[32px] items-center gap-[7px] rounded-[7px] bg-[#15633a] px-[14px] text-[12.6px] font-semibold text-white hover:bg-[#124f2f]"
                  >
                    <RefreshCw className="h-[14px] w-[14px]" /> Retry
                  </button>
                </div>
              ) : pageRows.length === 0 ? (
                <div className="flex flex-col items-center py-[36px] text-center">
                  <span className="grid h-[52px] w-[52px] place-items-center rounded-full bg-[#f1f5f3] text-[#64748b]">
                    <SearchX className="h-[24px] w-[24px]" />
                  </span>
                  <p className="mt-[10px] text-[14.6px] font-semibold text-[#0f172a]">No records found</p>
                  <p className="mt-[2px] text-[13.1px] text-[#64748b]">
                    {anyFilter || tab !== "all" ? "Nothing matches these filters in the selected date range." : `No conversations or enquiries for “${range}”.`}
                  </p>
                  <div className="mt-[12px] flex gap-[8px]">
                    {(anyFilter || tab !== "all") && (
                      <button
                        type="button"
                        onClick={() => {
                          clearAll();
                          setTab("all");
                        }}
                        className="h-[32px] rounded-[7px] border border-[#dfe3e8] bg-white px-[14px] text-[12.6px] font-medium hover:border-[#15633a]"
                      >
                        Clear filters
                      </button>
                    )}
                    {range !== "All Time" && (
                      <button type="button" onClick={() => changeRange("All Time")} className="h-[32px] rounded-[7px] bg-[#15633a] px-[14px] text-[12.6px] font-semibold text-white hover:bg-[#124f2f]">
                        Show all time
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                pageRows.map((r) => {
                  const status = STATUS_STYLE[r.status];
                  const unassigned = r.assignedTo === "Unassigned";
                  const action = actionFor(r);
                  const ChannelIcon = CHANNEL_ICON[r.channel];
                  return (
                    <div
                      key={r.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => openDetail(r.id)}
                      onKeyDown={(e) => {
                        if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
                          e.preventDefault();
                          openDetail(r.id);
                        }
                      }}
                      aria-label={`Open ${r.name}`}
                      className={`${GRID} h-[50px] cursor-pointer border-b border-[#eef0f2] px-[12px] outline-none transition last:border-b-0 hover:bg-[#f8faf9] focus-visible:bg-[#f1f7ee] ${
                        selected.has(r.id) ? "bg-[#f6fbf7]" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(r.id)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => toggle(r.id)}
                        aria-label={`Select ${r.name}`}
                        className="h-[19px] w-[19px] cursor-pointer rounded-[4px] accent-[#15633a]"
                      />
                      <span className="flex min-w-0 items-center gap-[12px]">
                        <span className="relative shrink-0">
                          <span className={`grid h-[34px] w-[34px] place-items-center rounded-full text-[12.4px] font-medium text-white ${r.avatar}`}>{r.initials}</span>
                          {r.unread && <span title="Unread message" className="absolute -right-[1px] -top-[1px] h-[11px] w-[11px] rounded-full border-2 border-white bg-[#16a34a]" />}
                        </span>
                        <span className="min-w-0">
                          <span className={`block truncate text-[#0f172a] ${r.unread ? "font-semibold" : ""}`}>{r.name}</span>
                          <span className={`mt-[2px] inline-block rounded-[5px] px-[8px] py-0 text-[10.8px] font-medium ${TAG_CLASS[r.tag]}`}>{r.tag}</span>
                        </span>
                      </span>
                      <span className="min-w-0 pr-[12px]">
                        <span className="flex min-w-0 items-center gap-[6px] text-[#0f172a]">
                          <span title={r.channel} className="shrink-0 text-[#64748b]">
                            <ChannelIcon className="h-[14px] w-[14px]" />
                          </span>
                          <span className="truncate">
                            {r.type} / {r.topic}
                          </span>
                        </span>
                        <span className="mt-[1px] block truncate text-[12.4px] text-[#64748b]">{r.detail}</span>
                      </span>
                      <span className="flex min-w-0 items-center gap-[10px] pr-[8px] text-[#0f172a]">
                        <UserRound className={`h-[18px] w-[18px] shrink-0 ${unassigned ? "text-[#ea7a0c]" : "text-[#334155]"}`} />
                        <span className={`truncate ${unassigned ? "text-[#d97706]" : ""}`}>{r.assignedTo}</span>
                      </span>
                      <span>
                        <span className={`inline-flex h-[28px] w-[134px] items-center gap-[8px] rounded-[6px] px-[12px] font-medium leading-tight ${status.className}`}>
                          {status.icon}
                          {r.status}
                        </span>
                      </span>
                      <span>
                        <span className={`inline-flex h-[24px] items-center gap-[5px] rounded-[6px] px-[8px] text-[12.4px] font-medium ${PRIORITY_CLASS[r.priority]}`}>
                          <Flag className="h-[12px] w-[12px]" /> {r.priority}
                        </span>
                      </span>
                      <span className="min-w-0 pr-[8px]">
                        <FollowUpCell value={r.followUp} />
                      </span>
                      <span className="text-[#475569]">{ago(r.minutesAgo)}</span>
                      <span className="flex items-center gap-[10px]" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => (action === "Assign" ? setReassignId(r.id) : openDetail(r.id))}
                          className={`inline-flex h-[30px] w-[68px] items-center justify-center rounded-[6px] border bg-white text-[13.1px] font-medium transition ${ACTION_CLASS[action]}`}
                        >
                          {action}
                        </button>
                        <span className="relative">
                          <button
                            type="button"
                            id={`menu-trigger-${r.id}`}
                            onClick={(e) => openMenu(r.id, e.currentTarget)}
                            aria-label={`More actions for ${r.name}`}
                            aria-haspopup="menu"
                            aria-expanded={menuId === r.id}
                            className="grid h-[28px] w-[22px] place-items-center rounded-[4px] text-[#334155] hover:bg-slate-100 hover:text-[#0f172a]"
                          >
                            <MoreVertical className="h-[19px] w-[19px]" />
                          </button>
                          {menuId === r.id && (
                            <>
                              <button type="button" aria-label="Close menu" className="fixed inset-0 z-10 cursor-default" onClick={() => setMenuId(null)} />
                              <span
                                ref={menuRef}
                                role="menu"
                                aria-label={`Actions for ${r.name}`}
                                onKeyDown={menuKeys}
                                className={`absolute right-0 z-20 block w-[200px] ${menuUp ? "bottom-full mb-[4px]" : "top-full mt-[4px]"}`}
                              >
                              <span className="block overflow-hidden rounded-[8px] border border-[#e5e7eb] bg-white py-[4px] text-[13.1px] shadow-lg">
                                {[
                                  { label: "View details", run: () => openDetail(r.id) },
                                  {
                                    label: unassigned ? "Assign" : "Reassign",
                                    run: () => {
                                      setMenuId(null);
                                      setReassignId(r.id);
                                    },
                                  },
                                  { label: "Add internal note", run: () => openDetail(r.id, "note") },
                                ].map((item) => (
                                  <button key={item.label} type="button" role="menuitem" onClick={item.run} className={MENU_ITEM}>
                                    {item.label}
                                  </button>
                                ))}
                                <span className="flex items-center gap-[6px] px-[12px] py-[6px]">
                                  <span className="text-[12.4px] text-[#64748b]">Priority</span>
                                  {(["High", "Medium", "Low"] as const).map((p) => (
                                    <button
                                      key={p}
                                      type="button"
                                      onClick={() => {
                                        setMenuId(null);
                                        if (p === r.priority) return;
                                        const undo = snapshot([r.id]);
                                        setPriority([r.id], p);
                                        notify(`${r.name}: priority set to ${p}`, undo);
                                      }}
                                      role="menuitemradio"
                                      aria-checked={p === r.priority}
                                      aria-label={`Priority ${p}`}
                                      className={`rounded-[5px] px-[6px] py-[1px] text-[11.6px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-[#15633a] ${p === r.priority ? `${PRIORITY_CLASS[p]} ring-1 ring-current` : "text-[#475569] hover:bg-slate-100"}`}
                                    >
                                      {p}
                                    </button>
                                  ))}
                                </span>
                                {r.status !== "Resolved" && (
                                  <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                      setMenuId(null);
                                      setResolveId(r.id);
                                    }}
                                    className={MENU_ITEM}
                                  >
                                    Close / Resolve
                                  </button>
                                )}
                                <span className="my-[4px] block h-px bg-[#eef0f2]" />
                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() => markSpam(r)}
                                  className="flex w-full items-center gap-[8px] px-[12px] py-[7px] text-left text-[#dc2626] outline-none hover:bg-[#fdf2f2] focus-visible:bg-[#fdf2f2]"
                                >
                                  <Ban className="h-[14px] w-[14px]" /> Mark as spam
                                </button>
                              </span>
                              </span>
                            </>
                          )}
                        </span>
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-[10px] flex items-center justify-between gap-3 text-[13.1px] text-[#475569]">
            <span>
              {loading ? "Loading…" : rows.length ? `Showing ${firstShown} – ${lastShown} of ${rows.length} record${rows.length === 1 ? "" : "s"}` : "0 records"}
            </span>
            <div className="flex flex-wrap items-center gap-[10px]">
              <span>Rows per page:</span>
              <label className="relative">
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  aria-label="Rows per page"
                  className="h-[28px] cursor-pointer appearance-none rounded-[6px] border border-[#dfe3e8] bg-white pl-[10px] pr-[30px] text-[12.6px] font-medium text-[#0f172a] outline-none focus:border-[#15633a]"
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
                  onClick={() => setPage(Math.max(1, current - 1))}
                  disabled={current === 1}
                  aria-label="Previous page"
                  className="grid h-[27px] w-[27px] place-items-center rounded-[6px] border border-[#dfe3e8] bg-white text-[#334155] hover:border-[#15633a] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#dfe3e8]"
                >
                  <ChevronLeft className="h-[15px] w-[15px]" />
                </button>
                {pageList(current, pageCount).map((n, i) =>
                  n === "gap" ? (
                    <span key={`gap-${i}`} className="w-[16px] text-center text-[#94a3b8]">
                      …
                    </span>
                  ) : (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPage(n)}
                    aria-current={current === n ? "page" : undefined}
                    className={`grid h-[27px] w-[27px] place-items-center rounded-[6px] border text-[13.1px] font-medium transition ${
                      current === n ? "border-[#15633a] bg-[#15633a] text-white" : "border-[#dfe3e8] bg-white text-[#334155] hover:border-[#15633a]"
                    }`}
                  >
                    {n}
                  </button>
                  )
                )}
                <button
                  type="button"
                  onClick={() => setPage(Math.min(pageCount, current + 1))}
                  disabled={current === pageCount}
                  aria-label="Next page"
                  className="grid h-[27px] w-[27px] place-items-center rounded-[6px] border border-[#dfe3e8] bg-white text-[#334155] hover:border-[#15633a] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#dfe3e8]"
                >
                  <ChevronRight className="h-[15px] w-[15px]" />
                </button>
              </div>
            </div>
          </div>

          {/* Attention bar — hidden once nothing is overdue or unassigned */}
          {!loading && overdueCount + unassignedCount > 0 && (
            <div className="mt-[16px] flex h-[46px] items-center justify-between gap-2 rounded-[8px] bg-[#fdf2f2] px-[10px]">
              <span className="flex items-center gap-[14px] text-[14.6px] font-medium text-[#dc2626]">
                <span className="grid h-[24px] w-[24px] place-items-center rounded-full bg-[#dc2626] text-white">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" className="h-[14px] w-[14px]" aria-hidden="true">
                    <path d="M12 6v8M12 18.5h.01" />
                  </svg>
                </span>
                {overdueCount} overdue repl{overdueCount === 1 ? "y" : "ies"} <span className="text-[#dc2626]">•</span> {unassignedCount} unassigned enquir{unassignedCount === 1 ? "y" : "ies"}
              </span>
              <button
                type="button"
                onClick={() => {
                  clearAll();
                  setTab("all");
                  setQuick("attention");
                  setSort({ key: "priority", dir: "asc" });
                }}
                className="inline-flex items-center gap-[8px] pr-[6px] text-[13.6px] font-medium text-[#dc2626] hover:underline"
              >
                Review Now <ArrowRight className="h-[14px] w-[14px]" />
              </button>
            </div>
          )}

          <p className="mt-[14px] flex items-center gap-[10px] px-[8px] text-[13.1px] text-[#475569]">
            <Info className="h-[18px] w-[18px]" /> Click a record to view chat history, reply, assign responsibility or update status.
          </p>
        </div>
      </div>

      {/* ── Popups (rendered into document.body) ── */}
      <NewEnquiryModal key={newEnquiryKey ?? "closed"} open={newEnquiryKey !== null} owners={owners} onClose={() => setNewEnquiryKey(null)} onCreate={createEnquiry} />
      <EnquiryDetailModal
        key={`detail-${detail?.id ?? "closed"}-${detail?.mode}`}
        enquiry={
          detailRow && {
            ...detailRow,
            followUp: followUpText(detailRow.followUp),
            lastActivity: ago(detailRow.minutesAgo),
            review: actionFor(detailRow) === "Review",
          }
        }
        activity={detail ? activity[detail.id] ?? [] : []}
        initialMode={detail?.mode}
        onClose={() => setDetail(null)}
        onReply={(text) => detail && replyTo(detail.id, text)}
        onNote={(text) => detail && log(detail.id, { kind: "note", text })}
        onAssign={() => {
          setReassignId(detail?.id ?? null);
          setDetail(null);
        }}
        onResolve={() => {
          setResolveId(detail?.id ?? null);
          setDetail(null);
        }}
      />
      <ReassignEnquiryModal
        key={reassignId ?? "closed"}
        enquiry={reassignRow}
        owners={ownerInfo}
        onClose={() => setReassignId(null)}
        onConfirm={({ team, owner, reason, note }) => {
          if (reassignId === null) return;
          const wasUnassigned = reassignRow?.assignedTo === "Unassigned";
          assign([reassignId], owner);
          patch([reassignId], () => ({ team }));
          log(reassignId, { kind: "event", text: `${wasUnassigned ? "Assigned" : "Reassigned"} to ${owner} (${team}) — ${reason}` }, ...(note ? [{ kind: "note" as const, text: note }] : []));
          notify(`${reassignRow?.name} ${wasUnassigned ? "assigned" : "reassigned"} to ${owner}`);
          setReassignId(null);
        }}
      />
      <ResolveEnquiryModal
        key={`resolve-${resolveId ?? "closed"}`}
        enquiry={resolveRow}
        onClose={() => setResolveId(null)}
        onResolve={({ status, outcome, summary, sendUpdate, channel, message }) => {
          if (resolveId === null) return;
          resolve([resolveId]);
          log(
            resolveId,
            { kind: "event", text: `${status} — ${outcome}` },
            { kind: "note", text: summary },
            ...(sendUpdate ? [{ kind: "reply" as const, text: `${message}\n\n(${channel === "Website chat" ? "recorded only" : `via ${channel}`})` }] : [])
          );
          notify(`${resolveRow?.name}: ${status.toLowerCase()}${sendUpdate && channel !== "Website chat" ? `, update opened in ${channel}` : ""}`);
          setResolveId(null);
        }}
      />
      <ConfirmDialog confirm={confirm} onClose={closeConfirm} />
      <ToastBar key={toast?.id} toast={toast} onDone={closeToast} />
    </div>
    </div>
  );
}
