"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Clock, Download, FileSearch, Loader2, Play, Settings2, ShieldCheck } from "lucide-react";
import { seoAuditApi, type AuditScheduleData } from "@/lib/seoAuditApi";
import type { AuditRunState } from "@/lib/useSeoAuditRun";

type Frequency = "daily" | "weekly" | "every_x_days" | "once" | "on_demand";

interface AuditHeaderProps {
  siteName: string;
  run: AuditRunState;
  onRunNow: () => void;
  onDownloadExcel: () => void;
  downloading: boolean;
  /** Opens the full schedule dialog (auto-pilot, webhook) */
  onOpenScheduleSettings: () => void;
  /** Opens the Auto-Pilot suggestions waiting for approval */
  onOpenApprovals: () => void;
  /** Changes when the dialog saved, so the selector reloads */
  scheduleVersion: number;
}

const FREQ_LABEL: Record<Frequency, string> = {
  daily: "Daily",
  weekly: "Weekly",
  every_x_days: "Every X days",
  once: "One date & time",
  on_demand: "On demand",
};

const normalizeFrequency = (f: string | undefined, days: number | undefined): Frequency => {
  if (f === "daily" || f === "weekly" || f === "every_x_days" || f === "once" || f === "on_demand") return f;
  // schedules saved before these options existed ("3days" ...)
  if (days === 1) return "daily";
  if (days === 7) return "weekly";
  return "every_x_days";
};

export default function AuditHeader({ siteName, run, onRunNow, onDownloadExcel, downloading, onOpenScheduleSettings, onOpenApprovals, scheduleVersion }: AuditHeaderProps) {
  const [approvalsWaiting, setApprovalsWaiting] = useState(0);
  const [schedule, setSchedule] = useState<AuditScheduleData["schedule"] | null>(null);
  const [frequency, setFrequency] = useState<Frequency>("weekly");
  const [days, setDays] = useState(7);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await seoAuditApi.getAuditSchedule();
      const s = res.data?.schedule;
      setApprovalsWaiting(res.data?.approvalsWaiting ?? 0);
      if (s) {
        setSchedule(s);
        setFrequency(normalizeFrequency(s.frequency, s.intervalDays));
        setDays(s.intervalDays || 7);
      }
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Could not load the schedule.");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    seoAuditApi
      .getAuditSchedule()
      .then((res) => {
        if (cancelled) return;
        const s = res.data?.schedule;
        setApprovalsWaiting(res.data?.approvalsWaiting ?? 0);
        if (s) {
          setSchedule(s);
          setFrequency(normalizeFrequency(s.frequency, s.intervalDays));
          setDays(s.intervalDays || 7);
        }
        setLoadError(null);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : "Could not load the schedule.");
      });
    return () => {
      cancelled = true;
    };
  }, [scheduleVersion]);

  const save = async (nextFreq: Frequency, nextDays: number) => {
    if (!schedule) return;
    setSaving(true);
    setSaveError(null);
    try {
      await seoAuditApi.updateAuditSchedule({
        frequency: nextFreq,
        intervalDays: nextDays,
        autoPilotEnabled: Boolean(schedule.autoPilotEnabled),
        webhookUrl: schedule.webhookUrl || "",
        // keep the time of day that was chosen
        runAt: schedule.nextRunAt && nextFreq !== "on_demand" && nextFreq !== "once" ? new Date(schedule.nextRunAt).toISOString() : undefined,
      });
      await load();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not save the schedule.");
      await load(); // put the selector back to what is really saved
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
          <div className="min-w-0 max-w-2xl">
            <div className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-emerald-600">
              <FileSearch className="h-4 w-4" /> {siteName}
              <Link href="/seo" className="ml-2 inline-flex items-center gap-1 normal-case tracking-normal text-slate-500 hover:text-slate-800">
                <ArrowLeft className="h-3 w-3" /> SEO overview
              </Link>
            </div>
            <h1 className="text-xl font-extrabold text-[#0b2a6b]">SEO Audit</h1>
            <p className="mt-0.5 text-xs font-medium text-slate-500">Find SEO problems on your website, fix them in one click, and undo any change.</p>
            {schedule && frequency !== "on_demand" && schedule.nextRunAt ? (
              <p className="mt-2 text-[11px] font-medium text-slate-500">
                {schedule.lastRunAt ? <>Last audit: <strong className="text-slate-700">{new Date(schedule.lastRunAt).toLocaleString()}</strong> · </> : null}
                Next audit: <strong className="text-slate-700">{new Date(schedule.nextRunAt).toLocaleString()}</strong>
              </p>
            ) : schedule?.lastRunAt ? (
              <p className="mt-2 text-[11px] font-medium text-slate-500">Last audit: <strong className="text-slate-700">{new Date(schedule.lastRunAt).toLocaleString()}</strong></p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
          {/* Schedule selector */}
          <div className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-2 h-9">
            <Clock className="h-3.5 w-3.5 text-indigo-700 shrink-0" />
              <span className="text-[11px] font-bold text-indigo-700">Audit runs</span>
            <select
              aria-label="Audit schedule"
              value={frequency}
              disabled={!schedule || saving}
              onChange={(e) => {
                const f = e.target.value as Frequency;
                if (f === "once") {
                  // a one-time run needs a date and time: ask for it in the schedule dialog
                  onOpenScheduleSettings();
                  return;
                }
                setFrequency(f);
                if (f !== "every_x_days") void save(f, f === "daily" ? 1 : f === "weekly" ? 7 : days);
              }}
              className="bg-transparent text-xs font-black text-indigo-900 outline-none cursor-pointer disabled:opacity-60"
            >
              {(Object.keys(FREQ_LABEL) as Frequency[]).map((f) => (
                <option key={f} value={f}>
                  {FREQ_LABEL[f]}
                </option>
              ))}
            </select>
            {frequency === "every_x_days" && (
              <input
                type="number"
                min={1}
                max={365}
                value={days}
                onChange={(e) => setDays(Math.max(1, Math.min(365, Math.floor(Number(e.target.value)) || 1)))}
                onBlur={() => void save("every_x_days", days)}
                aria-label="Days between audits"
                className="w-14 h-6 rounded border border-indigo-200 bg-white px-1.5 text-xs font-bold text-indigo-900 outline-none"
              />
            )}
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-700" />}
            <button
              type="button"
              onClick={onOpenScheduleSettings}
              title="Auto-pilot and webhook settings"
              className="ml-1 text-indigo-700 hover:text-indigo-900 cursor-pointer"
            >
              <Settings2 className="h-3.5 w-3.5" />
            </button>
          </div>


            {/* Auto-Pilot suggestions waiting for approval */}
            {(approvalsWaiting > 0 || schedule?.autoPilotEnabled) && (
              <button
                type="button"
                onClick={onOpenApprovals}
                title="Auto-Pilot never changes anything without your approval"
                className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3.5 text-xs font-black shadow-xs transition cursor-pointer ${approvalsWaiting > 0 ? "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}
              >
                <ShieldCheck className={`h-3.5 w-3.5 ${approvalsWaiting > 0 ? "text-amber-600" : "text-emerald-600"}`} />
                <span>{approvalsWaiting > 0 ? `${approvalsWaiting} fix${approvalsWaiting === 1 ? "" : "es"} waiting for approval` : "Auto-Pilot suggestions"}</span>
              </button>
            )}

            {/* Download Excel */}
            <button
              type="button"
              disabled={downloading}
              onClick={onDownloadExcel}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 text-xs font-black text-slate-800 hover:bg-slate-50 shadow-xs transition disabled:opacity-60 cursor-pointer"
            >
              {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" /> : <Download className="h-3.5 w-3.5 text-emerald-600" />}
              <span>{downloading ? "Exporting…" : "Download Excel"}</span>
            </button>

            {/* Run Now (the main action) */}
          <button
            type="button"
            disabled={run.running}
            onClick={onRunNow}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#0b2a6b] px-3.5 text-xs font-black text-white hover:bg-[#0d338a] shadow-md transition cursor-pointer active:scale-95 disabled:opacity-60"
          >
            {run.running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 fill-current" />}
            <span>{run.running ? `Auditing… ${Math.round(run.percent)}%` : "Run audit now"}</span>
          </button>


          </div>
        </div>
      </div>

      {/* Real progress of the running audit, from GET /seo-audit/status/:jobId */}
      {((run.running && run.kind !== "autofix_all") || (run.error && run.kind !== "autofix_all")) && (
        <div className={`rounded-xl border px-4 py-3 text-xs ${run.error ? (run.error.includes("already in progress") ? "border-amber-200 bg-amber-50 text-amber-900" : "border-red-200 bg-red-50 text-red-700") : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
          {run.error ? (
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold flex items-center gap-1.5">
                {run.error.includes("already in progress") ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-600 shrink-0" />
                    <span>A background audit is currently in progress. Please wait a moment for it to complete.</span>
                  </>
                ) : (
                  `Audit failed: ${run.error}`
                )}
              </span>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-bold">
                <span>{run.step || "Running"}</span>
                <span>{Math.round(run.percent)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-100">
                <div className="h-full rounded-full bg-emerald-600 transition-all duration-500" style={{ width: `${Math.max(3, Math.min(100, run.percent))}%` }} />
              </div>
            </div>
          )}
        </div>
      )}
      {(loadError || saveError) && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-800">{saveError || `Schedule unavailable: ${loadError}`}</div>}
    </div>
  );
}
