"use client";

import type { OursStatus, SemrushIssueType, TaskOwner, UrlOurs, Verdict } from "@/lib/semrushApi";

export const fmtDateTime = (iso: string | null | undefined): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const chip = "inline-flex items-center whitespace-nowrap rounded-md border px-2 py-0.5 text-[10.5px] font-extrabold";

export const VERDICTS: Record<Verdict, { label: string; cls: string; hint: string }> = {
  both: {
    label: "Found by both",
    cls: "border-emerald-200 bg-emerald-50 text-emerald-700",
    hint: "The uploaded report and our audit both report it.",
  },
  semrush_only: {
    label: "Only uploaded report",
    cls: "border-amber-200 bg-amber-50 text-amber-800",
    hint: "Our audit has this check but did not find the problem.",
  },
  not_checked: {
    label: "Our audit has no such check",
    cls: "border-rose-200 bg-rose-50 text-rose-700",
    hint: "The uploaded report finds it and our audit does not check for it, so it cannot see it.",
  },
  ours_only: {
    label: "Only our audit",
    cls: "border-violet-200 bg-violet-50 text-violet-700",
    hint: "Our audit reports it; the uploaded report passed it.",
  },
  clean: { label: "Clean", cls: "border-slate-200 bg-slate-50 text-slate-600", hint: "Nothing reported." },
};

export function VerdictChip({ verdict }: { verdict: Verdict }) {
  const v = VERDICTS[verdict];
  return (
    <span className={`${chip} ${v.cls}`} title={v.hint}>
      {v.label}
    </span>
  );
}

const TYPE_CLS: Record<SemrushIssueType, string> = {
  ERROR: "border-red-200 bg-red-50 text-red-700",
  WARNING: "border-amber-200 bg-amber-50 text-amber-800",
  NOTICE: "border-sky-200 bg-sky-50 text-sky-700",
};

export function TypeBadge({ type }: { type: SemrushIssueType }) {
  return <span className={`${chip} ${TYPE_CLS[type]}`}>{type === "ERROR" ? "Error" : type === "WARNING" ? "Warning" : "Notice"}</span>;
}

export function OwnerChip({ owner }: { owner: TaskOwner }) {
  return owner === "developer" ? (
    <span className={`${chip} border-indigo-200 bg-indigo-50 text-indigo-700`}>Developer</span>
  ) : (
    <span className={`${chip} border-teal-200 bg-teal-50 text-teal-700`}>SEO</span>
  );
}

/** What our audit said about a check, in words. */
export function oursText(status: OursStatus, found: number, total: number): string {
  switch (status) {
    case "found":
      return `Found: ${found} of ${total}`;
    case "clean":
      return `Checked, nothing found (${total} looked at)`;
    case "not_checked":
      return "Not checked by our audit";
    case "not_measured":
      return "Could not be measured on the last run";
    default:
      return "No audit run yet";
  }
}

export const OURS_TONE: Record<OursStatus, string> = {
  found: "text-emerald-700",
  clean: "text-slate-600",
  not_checked: "text-rose-700",
  not_measured: "text-slate-500",
  no_audit: "text-slate-500",
};

const URL_OURS: Record<UrlOurs, { label: string; cls: string }> = {
  flagged: { label: "Ours: found it", cls: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  clean: { label: "Ours: looks fine", cls: "border-amber-200 bg-amber-50 text-amber-800" },
  not_crawled: { label: "Ours: not crawled", cls: "border-slate-200 bg-slate-50 text-slate-600" },
  "n/a": { label: "—", cls: "border-transparent bg-transparent text-slate-400" },
};

export function UrlOursChip({ ours }: { ours: UrlOurs }) {
  const v = URL_OURS[ours];
  return <span className={`${chip} ${v.cls}`}>{v.label}</span>;
}

/** Page address without the scheme, to keep lists short. */
export const shortUrl = (url: string): string => url.replace(/^https?:\/\//, "");

/** Coloured left bar + soft tint by severity, so the eye can sort a long list at a glance. */
export const TYPE_BAR: Record<SemrushIssueType, string> = {
  ERROR: "border-l-4 border-l-red-500 bg-red-50/60",
  WARNING: "border-l-4 border-l-amber-500 bg-amber-50/60",
  NOTICE: "border-l-4 border-l-sky-500 bg-sky-50/60",
};

export const VERDICT_BAR: Record<Verdict, string> = {
  both: "border-l-4 border-l-emerald-500 bg-emerald-50/50",
  semrush_only: "border-l-4 border-l-amber-500 bg-amber-50/50",
  not_checked: "border-l-4 border-l-rose-500 bg-rose-50/50",
  ours_only: "border-l-4 border-l-violet-500 bg-violet-50/50",
  clean: "border-l-4 border-l-slate-300 bg-white",
};
