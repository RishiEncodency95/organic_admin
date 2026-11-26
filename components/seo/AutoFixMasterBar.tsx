"use client";

import { AlertTriangle, CheckCircle2, Loader2, Zap } from "lucide-react";

interface AutoFixMasterBarProps {
  loading: boolean;
  error: string | null;
  hasAudit: boolean;
  pendingCount: number;
  resolvedCount: number;
  criticalCount?: number;
  warningCount?: number;
  healthScore: number | null;
  healthScoreAtAudit: number | null;
  fixing: boolean;
  /** an audit is running: Auto-Fix is unavailable meanwhile */
  busyOther?: boolean;
  percent?: number;
  step?: string | null;
  runError?: string | null;
  onAutoFixAll: () => void;
  onRetry: () => void;
}

export default function AutoFixMasterBar({ loading, error, hasAudit, pendingCount, resolvedCount, criticalCount = 0, warningCount = 0, healthScore, healthScoreAtAudit, fixing, busyOther = false, percent = 0, step = null, runError = null, onAutoFixAll, onRetry }: AutoFixMasterBarProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-500 shadow-xs">
        <Loader2 className="h-4 w-4 animate-spin" /> Checking for issues…
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">
        <span className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" /> {error}
        </span>
        <button type="button" onClick={onRetry} className="rounded-lg border border-red-300 bg-white px-3 py-1 text-red-700 hover:bg-red-100 cursor-pointer">
          Retry
        </button>
      </div>
    );
  }
  if (!hasAudit) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-600 shadow-xs">
        No audit has been run yet. Press &ldquo;Run audit now&rdquo; to find issues.
      </div>
    );
  }
  const clean = pendingCount === 0;
  const score = healthScore ?? 0;
  const scoreTone = score >= 90 ? "bg-emerald-500" : score >= 70 ? "bg-amber-400" : "bg-red-500";
  return (
    <section aria-label="Audit summary" className="space-y-3">
      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {/* 1. How many problems */}
        <div className={`rounded-xl border px-3 py-2.5 ${clean ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}>
          <div className="flex items-center gap-1.5 text-[0.6875rem] uppercase tracking-wide text-slate-500">
            {clean ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />} Issues to fix
          </div>
          <div className={`mt-0.5 text-[1.5rem] leading-tight [font-weight:500] ${clean ? "text-emerald-700" : "text-rose-700"}`}>{pendingCount}</div>
          <div className="text-[0.6875rem] text-slate-500">{clean ? "Nothing to fix right now." : `${criticalCount} serious · ${warningCount} smaller`}</div>
        </div>

        {/* 2. How healthy the site is */}
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2.5">
          <div className="text-[0.6875rem] uppercase tracking-wide text-slate-500">On-page score</div>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-[1.5rem] leading-tight text-indigo-800 [font-weight:500]">{healthScore ?? "–"}</span>
            <span className="text-[0.75rem] text-slate-400">/ 100</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/80">
            <div className={`h-full rounded-full ${scoreTone}`} style={{ width: `${Math.max(2, Math.min(100, score))}%` }} />
          </div>
          <div className="mt-1 text-[0.6875rem] leading-snug text-slate-500">
            {healthScoreAtAudit !== null && healthScoreAtAudit !== healthScore ? `Was ${healthScoreAtAudit} at the audit. ` : ""}Titles, descriptions, headings, schema, images.
          </div>
        </div>

        {/* 3. Fixed but not yet on the website */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
          <div className="text-[0.6875rem] uppercase tracking-wide text-slate-500">Fixed, waiting for website</div>
          <div className="mt-0.5 text-[1.5rem] leading-tight text-amber-800 [font-weight:500]">{resolvedCount}</div>
          <div className="text-[0.6875rem] text-slate-500">They go live after the next website build.</div>
        </div>

        {/* 4. The one big action */}
        <div className="flex flex-col justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
          <div>
            <div className="text-[0.6875rem] uppercase tracking-wide text-emerald-800">Fix everything</div>
            <div className="mt-0.5 text-[0.6875rem] leading-snug text-slate-600">AI fixes titles, descriptions, headings and schema. Every change can be undone.</div>
          </div>
          <button
            type="button"
            disabled={clean || fixing || busyOther}
            onClick={onAutoFixAll}
            className="inline-flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-[0.75rem] text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {fixing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />}
            <span>{fixing ? `Fixing… ${Math.round(percent)}%` : `Auto-Fix All (${pendingCount}) with AI`}</span>
          </button>
        </div>
      </div>

      {fixing && (
        <div className="space-y-1 rounded-xl border border-emerald-200 bg-white px-4 py-3">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
            <span>{step || "Running"}</span>
            <span>{Math.round(percent)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-100">
            <div className="h-full rounded-full bg-emerald-600 transition-all duration-500" style={{ width: `${Math.max(3, Math.min(100, percent))}%` }} />
          </div>
        </div>
      )}
      {runError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-[11px] font-bold text-red-700">Auto-Fix failed: {runError}</div>}
    </section>
  );
}
