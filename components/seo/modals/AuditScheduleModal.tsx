"use client";

import React from "react";
import { CalendarClock, Clock, Loader2, ShieldCheck, X } from "lucide-react";

export interface AuditScheduleState {
  frequency: string;
  intervalDays: number;
  autoPilotEnabled: boolean;
  webhookUrl: string;
  usingRedis: boolean;
  redisConnected: boolean;
  lastRunAt: string;
  nextRunAt: string;
  /** Date and time of the first run, as a local "YYYY-MM-DDTHH:mm" value ("" = none chosen) */
  runAt: string;
  /** Auto-Pilot suggestions waiting for approval */
  approvalsWaiting: number;
}

/** ISO date -> the value a datetime-local input takes (in the viewer's time zone) */
export function toLocalInput(iso: string | undefined | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** The datetime-local value -> ISO (UTC) for the server; undefined when empty or not a date */
export function fromLocalInput(value: string): string | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

interface AuditScheduleModalProps {
  isOpen: boolean;
  scheduleLoaded: boolean;
  scheduleSaving: boolean;
  scheduleLoadError: string | null;
  scheduleState: AuditScheduleState;
  onStateChange: (updater: (prev: AuditScheduleState) => AuditScheduleState) => void;
  onSave: () => void;
  onClose: () => void;
  onReviewApprovals: () => void;
}

const OPTIONS: Array<{ freq: string; label: string; hint: string }> = [
  { freq: "daily", label: "Every day", hint: "Runs once a day" },
  { freq: "weekly", label: "Every week", hint: "Runs once a week" },
  { freq: "every_x_days", label: "Every X days", hint: "You pick the gap" },
  { freq: "once", label: "One date & time", hint: "Runs once, then stops" },
  { freq: "on_demand", label: "Only when I click", hint: "No automatic runs" },
];

const tzName = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "your computer's time zone";
  } catch {
    return "your computer's time zone";
  }
};

export default function AuditScheduleModal({ isOpen, scheduleLoaded, scheduleSaving, scheduleLoadError, scheduleState, onStateChange, onSave, onClose, onReviewApprovals }: AuditScheduleModalProps) {
  if (!isOpen) return null;

  const freq = scheduleState.frequency;
  const needsTime = freq !== "on_demand";
  const onceMissing = freq === "once" && !scheduleState.runAt;
  const patch = (p: Partial<AuditScheduleState>) => onStateChange((prev) => ({ ...prev, ...p }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2 text-base font-semibold text-[#0b2a6b]">
            <CalendarClock className="h-5 w-5 text-indigo-600" />
            Audit schedule &amp; Auto-Pilot
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800 cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {scheduleLoadError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[0.8125rem] text-red-700">
              {scheduleLoadError} Saving is disabled so defaults cannot overwrite your schedule. Close and reopen to retry.
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[0.8125rem] text-slate-700">
            <span className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${scheduleState.usingRedis ? "bg-emerald-500" : "bg-amber-500"}`} />
              {scheduleState.usingRedis ? "Background queue: BullMQ + Redis" : "Background queue: built-in timer (Redis is not connected)"}
            </span>
            <span className={`rounded-full border px-2 py-0.5 text-[0.6875rem] font-semibold ${scheduleState.usingRedis ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
              {scheduleState.usingRedis ? "Active" : "Fallback"}
            </span>
          </div>

          {/* When */}
          <section>
            <h3 className="mb-2 text-[0.8125rem] font-semibold text-slate-800">When should the audit run?</h3>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
              {OPTIONS.map((o) => {
                const on = freq === o.freq;
                return (
                  <button
                    key={o.freq}
                    type="button"
                    onClick={() =>
                      patch({
                        frequency: o.freq,
                        intervalDays: o.freq === "daily" ? 1 : o.freq === "weekly" ? 7 : Math.max(1, scheduleState.intervalDays),
                      })
                    }
                    className={`rounded-lg border px-2.5 py-2 text-left transition cursor-pointer ${on ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500" : "border-slate-200 bg-white hover:bg-slate-50"}`}
                  >
                    <div className={`text-[0.8125rem] font-semibold ${on ? "text-indigo-800" : "text-slate-800"}`}>{o.label}</div>
                    <div className="mt-0.5 text-[0.6875rem] text-slate-500">{o.hint}</div>
                  </button>
                );
              })}
            </div>

            {freq === "every_x_days" && (
              <div className="mt-3 flex items-center gap-2 text-[0.8125rem] text-slate-700">
                <span>Run every</span>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={scheduleState.intervalDays}
                  onChange={(e) => patch({ intervalDays: Math.max(1, Math.min(365, Math.floor(Number(e.target.value)) || 1)) })}
                  className="h-9 w-20 rounded-lg border border-slate-300 bg-white px-2 text-[0.8125rem] text-slate-900 outline-none focus:border-indigo-500"
                />
                <span>days</span>
              </div>
            )}

            {needsTime && (
              <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
                <label className="mb-1 block text-[0.8125rem] font-semibold text-slate-800" htmlFor="audit-run-at">
                  {freq === "once" ? "Run on this date and time" : "First run on this date and time (optional)"}
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    id="audit-run-at"
                    type="datetime-local"
                    value={scheduleState.runAt}
                    onChange={(e) => patch({ runAt: e.target.value })}
                    className="h-9 rounded-lg border border-slate-300 bg-white px-2.5 text-[0.8125rem] text-slate-900 outline-none focus:border-indigo-500"
                  />
                  {freq !== "once" && scheduleState.runAt && (
                    <button type="button" onClick={() => patch({ runAt: "" })} className="text-[0.75rem] font-semibold text-slate-500 underline hover:text-slate-800 cursor-pointer">
                      Clear (start one interval from now)
                    </button>
                  )}
                </div>
                <p className="mt-1.5 text-[0.75rem] text-slate-500">
                  Time zone: {tzName()}.{" "}
                  {freq === "once" ? "The audit runs once at this time and then the schedule stops." : "After the first run it repeats at the same time of day."}
                </p>
                {onceMissing && <p className="mt-1 text-[0.75rem] font-semibold text-amber-700">Choose a date and time for the one-time audit.</p>}
              </div>
            )}
            {freq === "on_demand" && <p className="mt-2 text-[0.75rem] text-slate-500">No automatic runs. Use “Run audit now” or the automation webhook.</p>}
          </section>

          {/* Auto-Pilot */}
          <section className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="flex items-center gap-1.5 text-[0.8125rem] font-semibold text-slate-800">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Auto-Pilot (asks your approval first)
                </h3>
                <p className="mt-1 text-[0.75rem] leading-relaxed text-slate-600">
                  After each audit, Auto-Pilot finds fixable SEO problems (page title, meta description, canonical link, share card, schema, main heading) and prepares a suggestion for each.
                  <strong className="font-semibold text-slate-800"> Nothing is changed on your website until you open the suggestions and approve them.</strong>
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={scheduleState.autoPilotEnabled}
                onClick={() => patch({ autoPilotEnabled: !scheduleState.autoPilotEnabled })}
                className={`inline-flex h-8 shrink-0 items-center rounded-lg px-3 text-[0.8125rem] font-semibold transition cursor-pointer ${scheduleState.autoPilotEnabled ? "bg-emerald-600 text-white" : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"}`}
              >
                {scheduleState.autoPilotEnabled ? "ON" : "OFF"}
              </button>
            </div>
            {scheduleState.approvalsWaiting > 0 && (
              <button
                type="button"
                onClick={onReviewApprovals}
                className="mt-3 inline-flex h-8 items-center rounded-lg border border-amber-300 bg-amber-50 px-3 text-[0.8125rem] font-semibold text-amber-900 hover:bg-amber-100 cursor-pointer"
              >
                {scheduleState.approvalsWaiting} suggestion{scheduleState.approvalsWaiting === 1 ? "" : "s"} waiting for your approval: review
              </button>
            )}
          </section>

          {/* Webhook */}
          <section>
            <label className="mb-1 block text-[0.8125rem] font-semibold text-slate-800" htmlFor="audit-webhook">
              Webhook after each audit (optional)
            </label>
            <input
              id="audit-webhook"
              type="url"
              placeholder="https://your-domain.com/api/seo-webhook"
              value={scheduleState.webhookUrl}
              onChange={(e) => patch({ webhookUrl: e.target.value })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-[0.8125rem] text-slate-900 outline-none focus:border-indigo-500"
            />
          </section>

          {freq !== "on_demand" && scheduleState.nextRunAt && (
            <p className="flex items-center gap-1.5 text-[0.8125rem] text-slate-600">
              <Clock className="h-3.5 w-3.5" />
              Saved next run: <strong className="font-semibold text-slate-800">{new Date(scheduleState.nextRunAt).toLocaleString()}</strong>
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-3">
          <button type="button" onClick={onClose} className="h-9 rounded-lg border border-slate-300 bg-white px-4 text-[0.8125rem] font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
            Cancel
          </button>
          <button
            type="button"
            disabled={scheduleSaving || !scheduleLoaded || onceMissing}
            onClick={onSave}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-indigo-600 px-5 text-[0.8125rem] font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
          >
            {scheduleSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Save schedule
          </button>
        </div>
      </div>
    </div>
  );
}
