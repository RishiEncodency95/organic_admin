"use client";

import Link from "next/link";
import { useState, type ComponentType, type ReactNode } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight, Inbox, Loader2, Search } from "lucide-react";
import { cn } from "./cn";
import { TONE_CLASS, type Tone } from "./support-labels";

/* ------------------------------------------------------------------ tokens */

export const btn =
  "inline-flex h-8 items-center justify-center gap-1.5 whitespace-nowrap rounded-sm border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50";
export const btnPrimary =
  "inline-flex h-8 items-center justify-center gap-1.5 whitespace-nowrap rounded-sm bg-red-600 px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50";
export const btnDanger =
  "inline-flex h-8 items-center justify-center gap-1.5 whitespace-nowrap rounded-sm border border-rose-300 bg-white px-3 text-xs font-semibold text-rose-700 shadow-sm transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50";
export const field =
  "h-9 w-full rounded-sm border border-slate-300 bg-white px-3 text-xs font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/15 disabled:bg-slate-50 disabled:text-slate-500";
export const textarea =
  "w-full resize-y rounded-sm border border-slate-300 bg-white px-3 py-2.5 text-xs font-medium leading-relaxed text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/15";

/* ----------------------------------------------------------------- layout */

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-sm border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]", className)}>{children}</div>;
}

export function Section({ title, description, action, children, className, flush }: { title: ReactNode; description?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; flush?: boolean }) {
  return (
    <section className={cn("overflow-hidden rounded-sm border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50/60 px-4 py-2.5">
        <div className="min-w-0">
          <h2 className="truncate text-[13px] font-semibold text-slate-900">{title}</h2>
          {description && <p className="mt-0.5 text-[11px] font-medium text-slate-500">{description}</p>}
        </div>
        {action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}
      </div>
      <div className={flush ? undefined : "p-4"}>{children}</div>
    </section>
  );
}

export function PageHeader({ title, description, actions, meta }: { title: ReactNode; description?: ReactNode; actions?: ReactNode; meta?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h1>
        {description && <p className="mt-0.5 max-w-2xl text-xs font-medium text-slate-600">{description}</p>}
        {meta}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

/* ------------------------------------------------------------------ badges */

export function Badge({ tone = "slate", children, className, dot }: { tone?: Tone; children: ReactNode; className?: string; dot?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm border px-2 py-0.5 text-[10.5px] font-semibold", TONE_CLASS[tone].chip, className)}>
      {dot && <span className={cn("size-1.5 rounded-full", TONE_CLASS[tone].dot)} aria-hidden="true" />}
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------- stats */

export function StatTile({ label, value, sub, icon: Icon, tone, href }: { label: string; value: ReactNode; sub?: ReactNode; icon?: ComponentType<{ className?: string }>; tone?: Tone; href?: string }) {
  const body = (
    <div className={cn("flex h-full flex-col rounded-sm border border-slate-200 bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition", href && "hover:border-slate-300 hover:shadow-md")}>
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[11px] font-semibold text-slate-500">{label}</span>
        {Icon && (
          <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-sm", tone ? `${TONE_CLASS[tone].soft} ${TONE_CLASS[tone].text}` : "bg-slate-100 text-slate-500")}>
            <Icon className="size-3.5" />
          </span>
        )}
      </div>
      <div className={cn("mt-2 text-2xl font-semibold leading-none tracking-tight", tone ? TONE_CLASS[tone].text : "text-slate-900")}>{value}</div>
      {sub && <p className="mt-1.5 truncate text-[11px] font-medium text-slate-500">{sub}</p>}
    </div>
  );
  return href ? (
    <Link href={href} className="block h-full">
      {body}
    </Link>
  ) : (
    body
  );
}

/* ---------------------------------------------------------------- controls */

export function SearchBox({ value, onChange, placeholder, className }: { value: string; onChange: (value: string) => void; placeholder: string; className?: string }) {
  return (
    <div className={cn("relative min-w-[200px] flex-1", className)}>
      <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
      <input type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} aria-label={placeholder} className={cn(field, "pl-9")} />
    </div>
  );
}

export function Select<T extends string>({ label, value, onChange, options, className }: { label: string; value: T; onChange: (value: T) => void; options: Array<{ value: T; label: string }>; className?: string }) {
  return (
    <label className={cn("inline-flex", className)}>
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as T)} className={cn(field, "w-auto min-w-[120px] cursor-pointer pr-7 font-semibold text-slate-700")} aria-label={label}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Pager({ page, limit, total, onPage, noun }: { page: number; limit: number; total: number; onPage: (page: number) => void; noun: string }) {
  if (total === 0) return null;
  const pageCount = Math.max(1, Math.ceil(total / limit));
  const from = (page - 1) * limit + 1;
  const to = Math.min(total, page * limit);
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-medium text-slate-600">
      <span>
        Showing <strong className="font-semibold text-slate-900">{from}–{to}</strong> of <strong className="font-semibold text-slate-900">{total}</strong> {noun}
      </span>
      {pageCount > 1 && (
        <div className="flex items-center gap-2">
          <button type="button" className={btn} disabled={page <= 1} onClick={() => onPage(page - 1)}>
            <ChevronLeft className="size-3.5" />
            Previous
          </button>
          <span className="px-1 font-semibold text-slate-900">
            Page {page} of {pageCount}
          </span>
          <button type="button" className={btn} disabled={page >= pageCount} onClick={() => onPage(page + 1)}>
            Next
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ states */

export function EmptyState({ icon: Icon = Inbox, title, description, action }: { icon?: ComponentType<{ className?: string }>; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <span className="mb-3 flex size-12 items-center justify-center rounded-sm bg-slate-100 text-slate-500">
        <Icon className="size-5" />
      </span>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-xs font-medium leading-relaxed text-slate-500">{description}</p>}
      {action && <div className="mt-4 flex gap-2">{action}</div>}
    </div>
  );
}

export function Notice({ tone = "blue", title, children, action }: { tone?: "blue" | "amber" | "red" | "green"; title: string; children?: ReactNode; action?: ReactNode }) {
  const palette = { blue: "border-blue-200 bg-blue-50 text-blue-900", amber: "border-amber-200 bg-amber-50 text-amber-900", red: "border-rose-200 bg-rose-50 text-rose-900", green: "border-emerald-200 bg-emerald-50 text-emerald-900" }[tone];
  return (
    <div className={cn("flex flex-wrap items-start gap-3 rounded-sm border p-3 text-xs", palette)} role={tone === "red" || tone === "amber" ? "alert" : "status"}>
      <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="min-w-[200px] flex-1">
        <p className="font-semibold">{title}</p>
        {children && <div className="mt-0.5 font-medium leading-relaxed opacity-90">{children}</div>}
      </div>
      {action && <div className="flex shrink-0 gap-2">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-sm bg-slate-100", className)} aria-hidden="true" />;
}

export function ListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="divide-y divide-slate-100" role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3.5">
          <Skeleton className="h-4 w-12" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-5 w-20" />
        </div>
      ))}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("size-3.5 animate-spin", className)} />;
}

/* ----------------------------------------------------------------- people */

const AVATAR_TONES = ["bg-blue-100 text-blue-700", "bg-violet-100 text-violet-700", "bg-emerald-100 text-emerald-700", "bg-amber-100 text-amber-800", "bg-rose-100 text-rose-700", "bg-cyan-100 text-cyan-700"];

export function Avatar({ name, size = 28, tone }: { name: string; size?: number; tone?: number }) {
  const initials = name.replace(/[^\p{L}\p{N} ]/gu, "").split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join("") || "?";
  const hash = tone ?? [...name].reduce((sum, c) => sum + c.charCodeAt(0), 0);
  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center rounded-full text-[11px] font-semibold", AVATAR_TONES[hash % AVATAR_TONES.length])} style={{ width: size, height: size }} aria-hidden="true">
      {initials}
    </span>
  );
}

/* --------------------------------------------------------------- confirm UI */

/** A two-step destructive-ish action without a modal: the button asks once, then confirms. */
export function ConfirmButton({ label, confirmLabel, onConfirm, className, disabled }: { label: ReactNode; confirmLabel: string; onConfirm: () => void; className?: string; disabled?: boolean }) {
  const [armed, setArmed] = useState(false);
  return armed ? (
    <span className="inline-flex items-center gap-1.5">
      <button type="button" className={btnDanger} onClick={() => { setArmed(false); onConfirm(); }} disabled={disabled}>
        {confirmLabel}
      </button>
      <button type="button" className={btn} onClick={() => setArmed(false)}>
        Cancel
      </button>
    </span>
  ) : (
    <button type="button" className={cn(btn, className)} onClick={() => setArmed(true)} disabled={disabled}>
      {label}
    </button>
  );
}
