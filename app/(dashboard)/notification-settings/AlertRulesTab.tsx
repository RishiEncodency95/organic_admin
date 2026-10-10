"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock3, ExternalLink, GripVertical, Info, Pencil } from "lucide-react";
import { Select, cardClass } from "../chatbot/manager/managerUi";

/*
 * "Alert Rules" tab of Notification Settings. Its values are saved with the page (PUT
 * /admin/chats/routing). Sent today: the "New assignment" email to the employee; overdue
 * enquiries follow each assignment rule's No Response Action.
 */

// ─── Options and defaults ────────────────────────────────────────────────────

const RECIPIENTS = ["Assigned employee", "Employee + Team Lead", "Concerned team + Team Lead", "Chatbot Admin", "Team Lead"] as const;
const TIMINGS = ["Immediately", "15 min before", "At target breach", "Daily summary", "Hourly digest"] as const;

export type Alert = {
  id: number;
  event: string;
  recipient: (typeof RECIPIENTS)[number];
  inApp: boolean;
  email: boolean;
  timing: (typeof TIMINGS)[number];
  required: boolean;
  enabled: boolean;
};

const DEFAULT_LIST: Alert[] = [
  { id: 1, event: "New assignment", recipient: "Assigned employee", inApp: true, email: true, timing: "Immediately", required: true, enabled: true },
  { id: 2, event: "Visitor reply", recipient: "Assigned employee", inApp: true, email: false, timing: "Immediately", required: false, enabled: true },
  { id: 3, event: "Follow-up due", recipient: "Assigned employee", inApp: true, email: true, timing: "15 min before", required: true, enabled: true },
  { id: 4, event: "Response overdue", recipient: "Employee + Team Lead", inApp: true, email: true, timing: "At target breach", required: true, enabled: true },
  { id: 5, event: "New complaint", recipient: "Concerned team + Team Lead", inApp: true, email: true, timing: "Immediately", required: true, enabled: true },
  { id: 6, event: "Unanswered question", recipient: "Chatbot Admin", inApp: true, email: false, timing: "Daily summary", required: false, enabled: true },
];

const WORKING_HOURS = ["Use team working hours", "24 × 7", "Custom schedule"] as const;
const FIRST_RESPONSE = ["30 minutes", "1 working hour", "4 working hours", "1 working day"] as const;
const ESCALATE_AFTER = ["15 min overdue", "30 min overdue", "1 hr overdue", "2 hr overdue"] as const;
const ESCALATE_TO = ["Team Lead", "Admin", "Backup Owner"] as const;
const SUMMARY_TIMES = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "6:00 PM"] as const;

export type AlertSettings = {
  list: Alert[];
  timing: {
    hours: (typeof WORKING_HOURS)[number];
    firstResponse: (typeof FIRST_RESPONSE)[number];
    after: (typeof ESCALATE_AFTER)[number];
    to: (typeof ESCALATE_TO)[number];
  };
  delivery: { daily: boolean; time: (typeof SUMMARY_TIMES)[number]; group: boolean };
};

export const DEFAULT_ALERTS: AlertSettings = {
  list: DEFAULT_LIST,
  timing: { hours: "Use team working hours", firstResponse: "1 working hour", after: "30 min overdue", to: "Team Lead" },
  delivery: { daily: true, time: "10:00 AM", group: true },
};

/** Saved alert settings over the defaults (older saves may miss fields) */
export const withAlertDefaults = (saved: Partial<AlertSettings> | null | undefined): AlertSettings => ({
  list: Array.isArray(saved?.list) && saved.list.length ? saved.list : DEFAULT_LIST,
  timing: { ...DEFAULT_ALERTS.timing, ...(saved?.timing || {}) },
  delivery: { ...DEFAULT_ALERTS.delivery, ...(saved?.delivery || {}) },
});

// ─── Small pieces ────────────────────────────────────────────────────────────

const labelClass = "mb-[2px] block text-[13.6px] text-[#334155]";
const fieldSelect = "!h-[34px] !text-[13.6px]";

function Switch({ on, onChange, label, disabled = false }: { on: boolean; onChange: () => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
      disabled={disabled}
      title={disabled ? "Mandatory alerts cannot be disabled" : undefined}
      className={`relative h-[24px] w-[46px] shrink-0 rounded-full transition disabled:cursor-not-allowed ${on ? "bg-[#15633a]" : "bg-[#cbd5e1]"}`}
    >
      <span className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow transition-all ${on ? "left-[25px]" : "left-[3px]"}`} />
    </button>
  );
}

const Check = ({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) => (
  <input type="checkbox" checked={checked} onChange={onChange} aria-label={label} className="h-[19px] w-[19px] cursor-pointer rounded-[4px] accent-[#15633a]" />
);

const ALERT_GRID = "grid grid-cols-[52px_196px_266px_112px_112px_216px_118px_118px_1fr] items-center";

// ─── Tab ─────────────────────────────────────────────────────────────────────

export default function AlertRulesTab({ value, onChange }: { value: AlertSettings; onChange: (next: AlertSettings) => void }) {
  const { list: alerts, timing, delivery } = value;
  const [editingId, setEditingId] = useState<number | null>(null);

  const setTimingField = (patch: Partial<AlertSettings["timing"]>) => onChange({ ...value, timing: { ...timing, ...patch } });
  const setDeliveryField = (patch: Partial<AlertSettings["delivery"]>) => onChange({ ...value, delivery: { ...delivery, ...patch } });

  const update = (id: number, patch: Partial<Alert>) =>
    onChange({
      ...value,
      list: alerts.map((a) => {
        if (a.id !== id) return a;
        const next = { ...a, ...patch };
        // A mandatory alert always stays enabled
        return next.required ? { ...next, enabled: true } : next;
      }),
    });

  return (
    <div className="flex flex-col gap-[12px]">
      {/* Team alerts */}
      <div className={`${cardClass} px-[18px] pb-[10px] pt-[8px]`}>
        <p className="text-[21.5px] font-bold leading-tight text-[#0f2a1c]">Team Alerts</p>
        <p className="mt-[1px] text-[14.6px] text-[#64748b]">Choose who is notified, how and when.</p>

        <div className="mt-[8px] overflow-hidden rounded-[8px] border border-[#eef0f2]">
          <div className={`${ALERT_GRID} bg-[#f7f8fa] py-[7px] text-[13.6px] font-medium text-[#0f172a]`}>
            <span />
            <span>Event</span>
            <span>Recipient</span>
            <span className="col-span-2">Channels</span>
            <span>Timing</span>
            <span className="pl-[16px]">Required</span>
            <span className="pl-[16px]">Enabled</span>
            <span />
          </div>
          {alerts.map((a) => (
            <div key={a.id} className={`${ALERT_GRID} h-[42px] border-t border-[#eef0f2] text-[14.1px] text-[#0f172a]`}>
              <GripVertical className="mx-auto h-[18px] w-[18px] text-[#475569]" />
              {editingId === a.id ? (
                <input
                  autoFocus
                  value={a.event}
                  onChange={(e) => update(a.id, { event: e.target.value })}
                  onBlur={() => setEditingId(null)}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === "Escape") && setEditingId(null)}
                  maxLength={40}
                  aria-label="Event name"
                  className="mr-[14px] h-[30px] rounded-[6px] border border-[#2f8a4c] px-[10px] text-[14.1px] outline-none"
                />
              ) : (
                <span className="truncate pr-[10px]">{a.event}</span>
              )}
              <span className="pr-[42px]">
                <Select value={a.recipient} options={RECIPIENTS} onChange={(recipient) => update(a.id, { recipient })} label={`${a.event} recipient`} selectClassName="!h-[34px] !pr-[30px] !text-[13.6px]" />
              </span>
              <label className="flex cursor-pointer items-center gap-[12px]">
                <Check checked={a.inApp} onChange={() => update(a.id, { inApp: !a.inApp })} label={`${a.event} in-app`} />
                <span className="text-[13.6px]">In-app</span>
              </label>
              <label className="flex cursor-pointer items-center gap-[12px]">
                <Check checked={a.email} onChange={() => update(a.id, { email: !a.email })} label={`${a.event} email`} />
                <span className="text-[13.6px]">Email</span>
              </label>
              <span className="pr-[26px]">
                <Select value={a.timing} options={TIMINGS} onChange={(t) => update(a.id, { timing: t })} label={`${a.event} timing`} selectClassName={fieldSelect} />
              </span>
              <span className="pl-[26px]">
                <Check checked={a.required} onChange={() => update(a.id, { required: !a.required })} label={`${a.event} required`} />
              </span>
              <span className="pl-[18px]">
                <Switch on={a.enabled} onChange={() => update(a.id, { enabled: !a.enabled })} label={`${a.event} enabled`} disabled={a.required} />
              </span>
              <span className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setEditingId(a.id)}
                  aria-label={`Edit ${a.event}`}
                  className="grid h-[34px] w-[40px] place-items-center rounded-[7px] border border-[#dfe3e8] bg-white text-[#0f172a] transition hover:border-[#15633a] hover:text-[#15633a]"
                >
                  <Pencil className="h-[16px] w-[16px]" />
                </button>
              </span>
            </div>
          ))}
        </div>

        <p className="mt-[8px] flex items-center gap-[14px] text-[13.6px] text-[#64748b]">
          <Info className="h-[19px] w-[19px] text-[#334155]" /> Emails go to each staff member&apos;s login email. Sent now: New assignment; overdue enquiries follow each rule&apos;s No Response Action.
          <Link href="/chatbot/manager" className="text-[13.6px] text-[#1d4ed8] underline underline-offset-2 hover:text-[#15633a]">
            Manage Channels
          </Link>
        </p>
      </div>

      <div className="grid grid-cols-[620px_1fr] gap-[14px]">
        {/* Timing & escalation */}
        <div className={`${cardClass} flex flex-col px-[18px] pb-[8px] pt-[7px]`}>
          <p className="text-[19.5px] font-bold leading-tight text-[#0f2a1c]">Timing &amp; Escalation</p>
          <div className="mt-[4px] grid grid-cols-2 gap-x-[24px] gap-y-[4px]">
            <div>
              <span className={labelClass}>Working Hours</span>
              <Select value={timing.hours} options={WORKING_HOURS} onChange={(hours) => setTimingField({ hours })} label="Working hours" selectClassName={fieldSelect} />
            </div>
            <div>
              <span className={labelClass}>First Response Target</span>
              <Select
                value={timing.firstResponse}
                options={FIRST_RESPONSE}
                onChange={(firstResponse) => setTimingField({ firstResponse })}
                label="First response target"
                selectClassName={fieldSelect}
              />
            </div>
            <div>
              <span className={labelClass}>Escalate After</span>
              <Select value={timing.after} options={ESCALATE_AFTER} onChange={(after) => setTimingField({ after })} label="Escalate after" selectClassName={fieldSelect} />
            </div>
            <div>
              <span className={labelClass}>Escalate To</span>
              <Select value={timing.to} options={ESCALATE_TO} onChange={(to) => setTimingField({ to })} label="Escalate to" selectClassName={fieldSelect} />
            </div>
          </div>
          <p className="mt-auto flex items-center gap-[12px] pt-[6px] text-[12.6px] text-[#64748b]">
            <Info className="h-[17px] w-[17px] text-[#334155]" /> Adjust to your team policy.
          </p>
        </div>

        {/* Delivery & summary */}
        <div className={`${cardClass} flex flex-col px-[18px] pb-[8px] pt-[7px]`}>
          <p className="text-[19.5px] font-bold leading-tight text-[#0f2a1c]">Delivery &amp; Summary</p>
          <div className="mt-[2px] grid grid-cols-[1fr_164px] items-end gap-x-[30px]">
            <div className="flex items-center gap-[22px]">
              <div className="min-w-0">
                <p className="text-[13.6px] font-medium leading-tight text-[#0f2a1c]">Daily Pending Summary</p>
                <p className="text-[12.1px] leading-tight text-[#64748b]">Send a daily summary of pending items to designated recipients.</p>
              </div>
              <Switch on={delivery.daily} onChange={() => setDeliveryField({ daily: !delivery.daily })} label="Daily pending summary" />
            </div>
            <div className={delivery.daily ? "" : "pointer-events-none opacity-50"}>
              <span className={labelClass}>Time</span>
              <label className="relative block">
                <select
                  value={delivery.time}
                  onChange={(e) => setDeliveryField({ time: e.target.value as (typeof SUMMARY_TIMES)[number] })}
                  aria-label="Summary time"
                  className="h-[34px] w-full cursor-pointer appearance-none rounded-[7px] border border-[#dfe3e8] bg-white pl-[14px] pr-[40px] text-[13.6px] text-[#0f172a] outline-none focus:border-[#15633a]"
                >
                  {SUMMARY_TIMES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <Clock3 className="pointer-events-none absolute right-[14px] top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#1d4ed8]" />
              </label>
            </div>
          </div>

          <div className="mt-[4px] flex items-center gap-[22px] border-b border-[#eef0f2] pb-[4px]">
            <div className="min-w-0">
              <p className="text-[13.6px] font-medium leading-tight text-[#0f2a1c]">Group Repeated Alerts</p>
              <p className="text-[12.1px] leading-tight text-[#64748b]">Combine multiple similar alerts into a single notification.</p>
            </div>
            <span className="ml-[54px]">
              <Switch on={delivery.group} onChange={() => setDeliveryField({ group: !delivery.group })} label="Group repeated alerts" />
            </span>
          </div>

          <div className="mt-[4px] flex items-center justify-between border-b border-[#eef0f2] pb-[4px]">
            <div>
              <p className="text-[13.6px] font-medium leading-tight text-[#0f2a1c]">Delivery Log</p>
              <p className="text-[12.1px] leading-tight text-[#64748b]">Assignments, reassignments and alert emails are written to each enquiry&apos;s activity.</p>
            </div>
            <Link href="/chatbot/inbox" className="flex items-center gap-[12px] text-[14.6px] text-[#1d4ed8] underline underline-offset-2 hover:text-[#15633a]">
              <ExternalLink className="h-[17px] w-[17px]" /> Open Inbox
            </Link>
          </div>

          <p className="mt-auto flex items-center gap-[12px] pt-[5px] text-[12.6px] text-[#64748b]">
            <Info className="h-[17px] w-[17px] text-[#334155]" /> Marking an alert as read does not close the enquiry.
          </p>
        </div>
      </div>
    </div>
  );
}
