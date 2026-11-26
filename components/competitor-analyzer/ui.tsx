"use client";

import { useCallback, useEffect, useRef, useState, type DependencyList, type ReactNode } from "react";
import { ApiRequestError } from "@/lib/api";
import type { Cite, EvidenceState } from "@/lib/competitorAnalyzerApi";
import DisplayText from "./DisplayText";

/* Small shared building blocks for the AI Competitor Analyzer screens (light, compact, readable). */

export const errorText = (e: unknown, fallback = "Something went wrong") => (e instanceof ApiRequestError ? e.message : e instanceof Error ? e.message : fallback);
export const fmtDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—");
export const inputCls = "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-50";
export const areaCls = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-50";
export const btn = "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed";
export const btnPrimary = `${btn} bg-[#174f40] text-white shadow-sm hover:bg-[#103d31]`;
export const btnGhost = `${btn} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`;
export const btnDanger = `${btn} border border-rose-200 bg-white text-rose-700 hover:bg-rose-50`;

export function Card({ title, subtitle, actions, children, className = "" }: { title?: ReactNode; subtitle?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section data-analyzer-card className={`min-w-0 rounded-2xl border border-[#e1e7e3] bg-white p-4 shadow-[0_2px_8px_-5px_rgba(19,54,43,0.15)] ${className}`}>
      {(title || actions) && (
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            {title && <h3 className="text-[14px] font-semibold tracking-tight text-[#1d382f]">{title}</h3>}
            {subtitle && <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-500">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

const STATE_TONE: Record<string, string> = {
  present: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  validated: "bg-emerald-50 text-emerald-700 border-emerald-200",
  measured: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ready: "bg-emerald-50 text-emerald-700 border-emerald-200",
  absent_confirmed: "bg-rose-50 text-rose-700 border-rose-200",
  fail: "bg-rose-50 text-rose-700 border-rose-200",
  failed: "bg-rose-50 text-rose-700 border-rose-200",
  needs_review: "bg-amber-50 text-amber-700 border-amber-200",
  warn: "bg-amber-50 text-amber-700 border-amber-200",
  partial: "bg-amber-50 text-amber-700 border-amber-200",
  validated_with_drops: "bg-amber-50 text-amber-700 border-amber-200",
  reconciliation_required: "bg-amber-50 text-amber-700 border-amber-200",
  running: "bg-sky-50 text-sky-700 border-sky-200",
  queued: "bg-sky-50 text-sky-700 border-sky-200",
};
export function Badge({ value, label }: { value: string; label?: string }) {
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATE_TONE[value] ?? "border-slate-200 bg-slate-50 text-slate-600"}`}>{label ?? value.replace(/_/g, " ")}</span>;
}

export const STATE_HELP: Record<EvidenceState, string> = {
  present: "Seen on a read page (source shown)",
  absent_confirmed: "Not found, and the pages where it normally appears were read",
  not_observed: "Not found in the sampled pages — NOT proof it does not exist",
  render_failed: "Page needs JavaScript rendering; not verified",
  fetch_failed: "Page could not be fetched",
  provider_unavailable: "Data provider unavailable",
  not_applicable: "Not applicable",
};

export function Cites({ items, max = 3 }: { items: Cite[] | { url: string; excerpt?: string }[]; max?: number }) {
  if (!items?.length) return null;
  return (
    <ul className="mt-1 space-y-1">
      {items.slice(0, max).map((c, i) => {
        const quote = "quote" in c ? c.quote : (c as { excerpt?: string }).excerpt;
        return (
          <li key={i} className="rounded-lg border border-slate-200/60 bg-white/80 p-2 text-[11px] leading-relaxed text-slate-500">
            {quote ? <blockquote className="mb-1 border-l-2 border-emerald-400 pl-2 text-slate-600">“<DisplayText text={quote.slice(0, 280)} />”</blockquote> : null}
            <a href={c.url} target="_blank" rel="noreferrer noopener" className="normal-case break-all font-medium text-teal-700 hover:underline">{c.url}</a>
          </li>
        );
      })}
    </ul>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">{children}</div>;
}

export function ErrorBox({ message }: { message: string }) {
  if (!message) return null;
  return <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{message}</div>;
}

export function ScoreBar({ value, compact = false }: { value: number | null; compact?: boolean }) {
  if (value === null || value === undefined) return <span className="text-xs text-slate-400">not scored</span>;
  const tone = value >= 75 ? "bg-emerald-500" : value >= 50 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="flex items-center gap-2">
      <div className={`h-1.5 overflow-hidden rounded bg-slate-100 ${compact ? "w-12" : "w-20"}`}><div className={`h-full ${tone}`} style={{ width: `${value}%` }} /></div>
      <span className="text-xs font-semibold text-slate-700">{value}</span>
    </div>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string }[]; value: T; onChange: (t: T) => void }) {
  return (
    <div className="flex max-w-full gap-1 overflow-x-auto rounded-2xl border border-[#e1e7e3] bg-[#eef2ef] p-1" aria-label="Analyzer sections">
      {tabs.map((t) => (
        <button key={t.id} type="button" aria-pressed={value === t.id} onClick={() => onChange(t.id)} className={`shrink-0 whitespace-nowrap rounded-xl px-3 py-2.5 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-emerald-600 ${value === t.id ? "bg-white text-[#174f40] shadow-sm" : "text-slate-500 hover:bg-white/60 hover:text-slate-700"}`}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Loads data when `deps` change and whenever reload() is called. State is only set inside promise callbacks and
 * responses that arrive after a newer request (or unmount) are ignored.
 */
export function useLoader<T>(fetcher: () => Promise<T>, deps: DependencyList, onLoaded?: (data: T) => void) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);
  const cb = useRef({ fetcher, onLoaded });
  useEffect(() => {
    cb.current = { fetcher, onLoaded };
  });
  useEffect(() => {
    let alive = true;
    cb.current
      .fetcher()
      .then((d) => {
        if (!alive) return;
        setData(d);
        setError("");
        cb.current.onLoaded?.(d);
      })
      .catch((e) => alive && setError(errorText(e, "Could not load data")));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps]);
  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, error, reload, setData };
}

export const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);
