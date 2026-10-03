"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Bell, CalendarDays, Check, Clock3, Info, MessageSquareText, MoreVertical, Settings, ThumbsUp, UserPlus, Users, X, type LucideIcon } from "lucide-react";

/*
 * Notifications popup opened from the top bar's bell — design preview with sample
 * notifications (see the "Demo data" chip). Rendered into document.body: the top bar uses
 * backdrop-blur, which would otherwise trap the fixed overlay inside the header.
 */

export type DemoNotification = {
  id: number;
  title: string;
  message: string;
  team: string;
  time: string;
  overdue?: boolean;
  unread: boolean;
  actionRequired: boolean;
  action: string;
  href: string;
  icon: LucideIcon;
  tone: "green" | "blue" | "red" | "orange" | "violet";
};

export const DEMO_NOTIFICATIONS: DemoNotification[] = [
  {
    id: 1,
    title: "New stall enquiry assigned to you",
    message: "Aarav Mehta • 12 sq.m quotation request.",
    team: "Sales Team",
    time: "10 min ago",
    unread: true,
    actionRequired: false,
    action: "Open Enquiry",
    href: "/chatbot/inbox",
    icon: UserPlus,
    tone: "green",
  },
  {
    id: 2,
    title: "Visitor replied",
    message: "Rohit Bansal added details to his buyer enquiry.",
    team: "Buyer Team",
    time: "20 min ago",
    unread: true,
    actionRequired: false,
    action: "View Reply",
    href: "/chatbot/inbox",
    icon: MessageSquareText,
    tone: "blue",
  },
  {
    id: 3,
    title: "Response overdue",
    message: "Neha Kapoor’s complaint is awaiting a team reply.",
    team: "Team Lead",
    time: "45 min overdue",
    overdue: true,
    unread: true,
    actionRequired: true,
    action: "Review Complaint",
    href: "/chatbot/inbox",
    icon: Clock3,
    tone: "red",
  },
  {
    id: 4,
    title: "Follow-up due today",
    message: "Stall enquiry callback scheduled for 3:00 PM.",
    team: "Sales Executive 01",
    time: "Today",
    unread: false,
    actionRequired: true,
    action: "Open Follow-up",
    href: "/chatbot/inbox",
    icon: CalendarDays,
    tone: "orange",
  },
  {
    id: 5,
    title: "Answer needs review",
    message: "A visitor marked a PMS support answer as not helpful.",
    team: "Chatbot Admin",
    time: "1 hr ago",
    unread: false,
    actionRequired: false,
    action: "Review Answer",
    href: "/chatbot/manager",
    icon: ThumbsUp,
    tone: "violet",
  },
];

const TONES: Record<DemoNotification["tone"], { icon: string; button: string }> = {
  green: { icon: "bg-[#e3f3e7] text-[#15803d]", button: "border-[#2f8a4c] text-[#14532d] hover:bg-[#f1f7ee]" },
  blue: { icon: "bg-[#e3edfd] text-[#2563eb]", button: "border-[#2563eb] text-[#1d4ed8] hover:bg-[#f4f8fe]" },
  red: { icon: "bg-[#fde4e4] text-[#dc2626]", button: "border-[#dc2626] text-[#dc2626] hover:bg-[#fdf2f2]" },
  orange: { icon: "bg-[#fdf0dc] text-[#ea7a0c]", button: "border-[#f59e0b] text-[#ea7a0c] hover:bg-[#fffaf0]" },
  violet: { icon: "bg-[#efe6fd] text-[#7c3aed]", button: "border-[#7c3aed] text-[#6d28d9] hover:bg-[#f8f5fe]" },
};

type Filter = "all" | "unread" | "action";

type Props = {
  open: boolean;
  onClose: () => void;
  items: DemoNotification[];
  onItemsChange: (items: DemoNotification[]) => void;
};

export default function NotificationsModal({ open, onClose, items, onItemsChange }: Props) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [menuFor, setMenuFor] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Closes only from the ✕ or the Close button — not on outside clicks or Escape
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const unread = items.filter((n) => n.unread).length;
  const actionRequired = items.filter((n) => n.actionRequired).length;
  const visible = items.filter((n) => (filter === "unread" ? n.unread : filter === "action" ? n.actionRequired : true));

  const update = (id: number, patch: Partial<DemoNotification>) => onItemsChange(items.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  const go = (n: DemoNotification) => {
    update(n.id, { unread: false });
    onClose();
    router.push(n.href);
  };
  const goSettings = () => {
    onClose();
    router.push("/notification-settings");
  };

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: `All (${items.length})` },
    { key: "unread", label: `Unread (${unread})` },
    { key: "action", label: `Action Required (${actionRequired})` },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 font-sans">
      <div aria-hidden="true" className="absolute inset-0 bg-[#0b1f14]/55 backdrop-blur-[2px]" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="notifications-title"
        className="relative flex max-h-[calc(100vh-32px)] w-[600px] max-w-full flex-col rounded-[16px] bg-white px-[20px] pb-[14px] pt-[16px] text-[#0f172a] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)]"
      >
        {/* Header */}
        <div className="flex items-center gap-[14px]">
          <Bell className="h-[26px] w-[26px] text-[#15633a]" strokeWidth={2} />
          <h2 id="notifications-title" className="text-[21px] font-semibold leading-none text-[#0f2a1c]">
            Notifications
          </h2>
          {unread > 0 && <span className="grid h-[23px] min-w-[23px] place-items-center rounded-full bg-[#e11d2e] px-[5px] text-[12px] font-semibold text-white">{unread}</span>}
          <span
            title="These notifications are sample data"
            className="ml-auto inline-flex items-center gap-[6px] rounded-[7px] border border-[#cfe9d6] bg-[#eefaf1] px-[9px] py-[4px] text-[11.5px] font-medium text-[#15803d]"
          >
            Demo data <Info className="h-[12px] w-[12px]" />
          </span>
          <span className="h-[26px] w-px bg-[#e5e7eb]" />
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="grid h-[30px] w-[30px] place-items-center rounded-full text-[#0f172a] transition hover:bg-slate-100">
            <X className="h-[20px] w-[20px]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-[12px] grid grid-cols-3 rounded-[10px] border border-[#e5e7eb] p-[4px]">
          {tabs.map((t, i) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setFilter(t.key)}
              className={`relative h-[31px] rounded-[7px] text-[13px] transition ${filter === t.key ? "bg-[#d9f2df] font-semibold text-[#14532d]" : "text-[#0f172a] hover:bg-slate-50"}`}
            >
              {i === 2 && <span className="absolute left-0 top-1/2 h-[22px] w-px -translate-y-1/2 bg-[#e5e7eb]" />}
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-[8px] flex items-center justify-between text-[12.5px]">
          <button
            type="button"
            onClick={() => onItemsChange(items.map((n) => ({ ...n, unread: false })))}
            disabled={unread === 0}
            className="flex items-center gap-[8px] text-[#1d4ed8] hover:underline disabled:opacity-50 disabled:no-underline"
          >
            <Check className="h-[16px] w-[16px]" strokeWidth={2.5} /> Mark all as read
          </button>
          <button type="button" onClick={goSettings} className="flex items-center gap-[8px] text-[#1d4ed8] hover:underline">
            <Settings className="h-[16px] w-[16px]" /> Notification Preferences
          </button>
        </div>

        {/* List */}
        <div className="-mx-[2px] mt-[8px] flex min-h-0 flex-col gap-[6px] overflow-y-auto px-[2px] pb-[2px]">
          {visible.length === 0 && <p className="rounded-[10px] border border-dashed border-[#e5e7eb] py-[24px] text-center text-[12.5px] text-[#64748b]">You’re all caught up.</p>}
          {visible.map((n) => {
            const tone = TONES[n.tone];
            const Icon = n.icon;
            return (
              <div key={n.id} className={`relative flex items-center gap-[13px] rounded-[10px] border border-[#eef0f2] px-[11px] py-[8px] ${n.unread ? "bg-[#f4faf5]" : "bg-white"}`}>
                <span className={`grid h-[44px] w-[44px] shrink-0 place-items-center rounded-full ${tone.icon}`}>
                  <Icon className="h-[21px] w-[21px]" strokeWidth={2.2} fill={n.tone === "green" || n.tone === "violet" ? "currentColor" : "none"} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14.2px] font-semibold leading-tight text-[#0f172a]">{n.title}</p>
                  <p className="mt-[3px] truncate text-[12.6px] text-[#475569]">{n.message}</p>
                  <p className="mt-[3px] flex items-center gap-[7px] text-[12px] text-[#475569]">
                    <Users className="h-[14px] w-[14px]" />
                    {n.team}
                    <span>•</span>
                    <span className={n.overdue ? "text-[#dc2626]" : ""}>{n.time}</span>
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-[6px]">
                  <div className="flex items-center gap-[18px]">
                    {n.unread && <span className="h-[8px] w-[8px] rounded-full bg-[#15803d]" aria-label="Unread" />}
                    <button type="button" onClick={() => setMenuFor(menuFor === n.id ? null : n.id)} aria-label={`More options for ${n.title}`} className="grid h-[24px] w-[20px] place-items-center text-[#334155] hover:text-[#0f172a]">
                      <MoreVertical className="h-[16px] w-[16px]" />
                    </button>
                  </div>
                  <button type="button" onClick={() => go(n)} className={`h-[29px] min-w-[112px] rounded-[7px] border bg-white px-[10px] text-[12.6px] font-medium transition ${tone.button}`}>
                    {n.action}
                  </button>
                </div>

                {menuFor === n.id && (
                  <div className="absolute right-[12px] top-[36px] z-10 w-[160px] overflow-hidden rounded-[8px] border border-[#e5e7eb] bg-white py-[4px] text-[12.5px] shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        update(n.id, { unread: !n.unread });
                        setMenuFor(null);
                      }}
                      className="block w-full px-[12px] py-[7px] text-left hover:bg-slate-50"
                    >
                      Mark as {n.unread ? "read" : "unread"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onItemsChange(items.filter((x) => x.id !== n.id));
                        setMenuFor(null);
                      }}
                      className="block w-full px-[12px] py-[7px] text-left text-[#dc2626] hover:bg-red-50"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-[8px] flex items-end justify-between border-t border-[#eef0f2] pt-[8px]">
          <div className="flex flex-col gap-[6px] text-[12.5px]">
            <span className="flex items-center gap-[9px] text-[#475569]">
              <Info className="h-[16px] w-[16px]" /> Alerts are shown according to your role and assigned work.
            </span>
            <button type="button" onClick={goSettings} className="flex items-center gap-[9px] text-[#1d4ed8] hover:underline">
              <Settings className="h-[16px] w-[16px]" /> Notification Settings
            </button>
          </div>
          <button type="button" onClick={onClose} className="h-[34px] rounded-[8px] border border-[#cbd5e1] bg-[#f8fafc] px-[24px] text-[13.5px] font-medium text-[#0f172a] shadow-sm transition hover:bg-slate-100">
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
