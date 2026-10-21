"use client";

import Link from "next/link";
import { useId, type ComponentType, type ReactNode } from "react";
import { cn } from "./lib/cn";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./lib/dialog";
import { Badge, field } from "./lib/support-ui";
import { sourceLabel, formatDate } from "./format";
import { useInfraCapabilities } from "./hooks";

export { Badge, Card, ConfirmButton, EmptyState, ListSkeleton, Notice, PageHeader, Pager, SearchBox, Select, Skeleton, Spinner, StatTile, btn, btnDanger, btnPrimary, field, textarea } from "./lib/support-ui";
export type { Tone } from "./lib/support-labels";

/* Local premium overrides — infrastructure only, no global changes. Sharp corners everywhere. */
const CARD = "rounded-none border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06),0_10px_24px_-14px_rgba(30,58,138,0.22)]";

/** Section header accents. Picked from the title so each card keeps the same colour on every render. */
const SECTION_ACCENTS = [
  { head: "from-blue-50 via-indigo-50/50 to-white", bar: "from-blue-500 to-indigo-500", dot: "bg-blue-500 ring-blue-100" },
  { head: "from-emerald-50 via-teal-50/50 to-white", bar: "from-emerald-500 to-teal-500", dot: "bg-emerald-500 ring-emerald-100" },
  { head: "from-violet-50 via-purple-50/50 to-white", bar: "from-violet-500 to-purple-500", dot: "bg-violet-500 ring-violet-100" },
  { head: "from-amber-50 via-orange-50/50 to-white", bar: "from-amber-500 to-orange-500", dot: "bg-amber-500 ring-amber-100" },
  { head: "from-cyan-50 via-sky-50/50 to-white", bar: "from-cyan-500 to-sky-500", dot: "bg-cyan-500 ring-cyan-100" },
  { head: "from-rose-50 via-pink-50/50 to-white", bar: "from-rose-500 to-pink-500", dot: "bg-rose-500 ring-rose-100" },
];

function sectionAccent(title: ReactNode) {
  const key = typeof title === "string" ? title : "";
  let h = 0;
  for (let i = 0; i < key.length; i += 1) h = (h * 31 + key.charCodeAt(i)) | 0;
  return SECTION_ACCENTS[Math.abs(h) % SECTION_ACCENTS.length]!;
}

export function Section({ title, description, action, children, className, flush }: { title: ReactNode; description?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; flush?: boolean }) {
  const accent = sectionAccent(title);
  return (
    <section className={cn(CARD, "overflow-hidden", className)}>
      <div className={cn("relative flex flex-wrap items-center justify-between gap-1 border-b border-slate-200/70 bg-gradient-to-r py-2.5 pl-5 pr-4", accent.head)}>
        <span className={cn("absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b", accent.bar)} aria-hidden="true" />
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 truncate text-[13px] font-semibold capitalize text-slate-900">
            <span className={cn("size-1.5 shrink-0 rounded-full ring-4", accent.dot)} aria-hidden="true" />
            {title}
          </h2>
          {description && <p className="mt-0.5 pl-3.5 text-[11px] font-medium capitalize text-slate-500">{description}</p>}
        </div>
        {action && <div className="flex shrink-0 flex-wrap items-center gap-1">{action}</div>}
      </div>
      <div className={flush ? undefined : "p-4"}>{children}</div>
    </section>
  );
}

/**
 * What the signed-in administrator may do, from the server's own answer (GET /infrastructure/capabilities):
 * canWrite = manage assets & alerts, canManage = providers / collectors / alert settings, canBill = subscriptions & payments.
 */
export function useRoleFlags() {
  const caps = useInfraCapabilities().data?.permissions;
  return {
    canWrite: Boolean(caps?.manage),
    canManage: Boolean(caps?.integrationsWrite),
    canBill: Boolean(caps?.billingWrite),
  };
}

export function Modal({ open, onOpenChange, title, description, children, wide }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; description?: string; children: ReactNode; wide?: boolean }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-h-[90vh] overflow-y-auto", wide ? "sm:max-w-2xl" : "sm:max-w-lg")}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

export function FormRow({ label, hint, children, error }: { label: string; hint?: string; children: (id: string) => ReactNode; error?: string | null }) {
  const id = useId();
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-xs font-semibold text-slate-700">{label}</label>
      {children(id)}
      {error ? <p className="text-[11px] font-medium text-rose-700" role="alert">{error}</p> : hint ? <p className="text-[11px] font-medium text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(field, props.className)} />;
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return <th scope="col" className={cn("whitespace-nowrap border-b border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100/80 px-3 py-2 text-left text-[11px] font-semibold text-slate-600", className)}>{children}</th>;
}
export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cn("border-b border-slate-100 px-3 py-2.5 align-middle text-xs font-medium text-slate-700", className)}>{children}</td>;
}

export function Chip({ children, tone = "slate" }: { children: ReactNode; tone?: "slate" | "blue" | "amber" | "red" | "green" | "violet" | "orange" }) {
  return <Badge tone={tone}>{children}</Badge>;
}

export function DateValue({ date, source, verified, unknownText = "Not available", hideSource }: { date: string | null; source?: string; verified?: boolean; unknownText?: string; hideSource?: boolean }) {
  if (!date) return <span className="text-slate-400">{unknownText}</span>;
  const src = sourceLabel(source, Boolean(verified));
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5" title={src.label}>
      <span className="font-medium text-slate-700">{formatDate(date)}</span>
      {!hideSource && source && <Badge tone={src.tone}>{src.label}</Badge>}
    </span>
  );
}

/** Values that are identifiers, addresses or tokens keep their exact case; everything else is Title Case like the rest of the page. */
const RAW_LABEL = /hostname|ip address|ipv4|ipv6|identifier|instance id|image id|resource id|mac|nameserver|status codes|default user|url|\bhost\b|token|fingerprint|domain$/i;

export function KeyValue({ rows }: { rows: Array<{ label: string; value: ReactNode }> }) {
  return (
    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
      {rows.map((r) => (
        <div key={r.label} className="min-w-0">
          <dt className="text-[11px] font-semibold text-slate-500">{r.label}</dt>
          <dd className={cn("mt-0.5 break-words text-xs font-medium text-slate-900", RAW_LABEL.test(r.label) && "normal-case")}>{r.value ?? <span className="text-slate-400">Not available</span>}</dd>
        </div>
      ))}
    </dl>
  );
}

export function BarList({ rows, empty = "Nothing to show yet." }: { rows: Array<{ label: string; value: number; sub?: string }>; empty?: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (rows.length === 0) return <p className="py-6 text-center text-xs font-medium text-slate-500">{empty}</p>;
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="flex items-baseline justify-between gap-3 text-xs">
            <span className="truncate font-semibold text-slate-800">{r.label}</span>
            <span className="shrink-0 font-semibold tabular-nums text-slate-900">{r.value}{r.sub ? <span className="ml-1.5 font-medium text-slate-500">{r.sub}</span> : null}</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-indigo-50 ring-1 ring-inset ring-indigo-100/70">
            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-sky-400" style={{ width: `${Math.max(2, (r.value / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function IconBox({ icon: Icon }: { icon: ComponentType<{ className?: string }> }) {
  return <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 text-indigo-600 ring-1 ring-inset ring-indigo-100"><Icon className="size-4" /></span>;
}

export interface StripItem {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: "red" | "amber" | "green" | "orange";
  href?: string;
  tip?: string;
  icon?: ComponentType<{ className?: string }>;
}

const STRIP_TONE = { red: "text-rose-700", amber: "text-amber-700", orange: "text-orange-700", green: "text-emerald-700" } as const;

type CardPalette = { tile: string; iconBox: string; bar: string; label: string; value: string };

const PALETTE: CardPalette[] = [
  { tile: "border-blue-200 bg-gradient-to-br from-blue-100 via-blue-50 to-white", iconBox: "bg-gradient-to-br from-blue-500 to-blue-700 text-white", bar: "from-blue-500 to-sky-400", label: "text-blue-700/80", value: "text-blue-950" },
  { tile: "border-emerald-200 bg-gradient-to-br from-emerald-100 via-emerald-50 to-white", iconBox: "bg-gradient-to-br from-emerald-500 to-emerald-700 text-white", bar: "from-emerald-500 to-teal-400", label: "text-emerald-700/80", value: "text-emerald-950" },
  { tile: "border-rose-200 bg-gradient-to-br from-rose-100 via-rose-50 to-white", iconBox: "bg-gradient-to-br from-rose-500 to-rose-700 text-white", bar: "from-rose-500 to-orange-400", label: "text-rose-700/80", value: "text-rose-950" },
  { tile: "border-violet-200 bg-gradient-to-br from-violet-100 via-violet-50 to-white", iconBox: "bg-gradient-to-br from-violet-500 to-violet-700 text-white", bar: "from-violet-500 to-purple-400", label: "text-violet-700/80", value: "text-violet-950" },
  { tile: "border-amber-200 bg-gradient-to-br from-amber-100 via-amber-50 to-white", iconBox: "bg-gradient-to-br from-amber-400 to-amber-600 text-white", bar: "from-amber-500 to-yellow-400", label: "text-amber-700/80", value: "text-amber-950" },
  { tile: "border-cyan-200 bg-gradient-to-br from-cyan-100 via-cyan-50 to-white", iconBox: "bg-gradient-to-br from-cyan-500 to-cyan-700 text-white", bar: "from-cyan-500 to-sky-400", label: "text-cyan-700/80", value: "text-cyan-950" },
  { tile: "border-orange-200 bg-gradient-to-br from-orange-100 via-orange-50 to-white", iconBox: "bg-gradient-to-br from-orange-500 to-orange-700 text-white", bar: "from-orange-500 to-amber-400", label: "text-orange-700/80", value: "text-orange-950" },
  { tile: "border-indigo-200 bg-gradient-to-br from-indigo-100 via-indigo-50 to-white", iconBox: "bg-gradient-to-br from-indigo-500 to-indigo-700 text-white", bar: "from-indigo-500 to-blue-400", label: "text-indigo-700/80", value: "text-indigo-950" },
  { tile: "border-teal-200 bg-gradient-to-br from-teal-100 via-teal-50 to-white", iconBox: "bg-gradient-to-br from-teal-500 to-teal-700 text-white", bar: "from-teal-500 to-emerald-400", label: "text-teal-700/80", value: "text-teal-950" },
];

const TONE_PALETTE: Record<string, CardPalette> = {
  red: PALETTE[2]!,
  amber: PALETTE[4]!,
  orange: PALETTE[6]!,
  green: PALETTE[1]!,
};

/**
 * Colourful single-line stat cards: horizontal flex row, never wraps.
 * The hovered card is lifted above everything after it (z-index on the wrapper), so its tooltip is never covered.
 */
export function StatStrip({ items, title }: { items: StripItem[]; title?: string }) {
  return (
    <section aria-label={title} className="relative z-20">
      <div className="flex gap-2.5">
        {items.map((i, idx) => {
          const palette = (i.tone && TONE_PALETTE[i.tone]) || PALETTE[idx % PALETTE.length]!;
          const Icon = i.icon;
          const tip = i.tip ?? (typeof i.sub === "string" ? i.sub : undefined);
          // Edge cards anchor their tooltip to the card edge so it never runs off screen.
          const tipPos = idx === 0 ? "left-0" : idx === items.length - 1 ? "right-0" : "left-1/2 -translate-x-1/2";
          const arrowPos = idx === 0 ? "left-5" : idx === items.length - 1 ? "right-5" : "left-1/2 -translate-x-1/2";
          const body = (
            <div
              className={cn(
                "group relative min-w-0 rounded-xl border px-3 pb-3 pt-3 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_10px_24px_-16px_rgba(30,58,138,0.45)] ring-1 ring-inset ring-white/70 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_32px_-16px_rgba(30,58,138,0.5)]",
                palette.tile,
              )}
            >
              {/* Decoration lives in its own clipped layer so the card itself can stay overflow-visible for the tooltip. */}
              <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl" aria-hidden="true">
                <span className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", palette.bar)} />
                <span className={cn("absolute -right-6 -top-6 size-20 rounded-full bg-gradient-to-br opacity-[0.14] transition-transform duration-300 group-hover:scale-125", palette.bar)} />
                <span className={cn("absolute -bottom-8 -right-2 size-16 rounded-full bg-gradient-to-br opacity-[0.08]", palette.bar)} />
              </span>
              <span className="relative flex items-center gap-2">
                <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg shadow-[0_4px_10px_-4px_rgba(15,23,42,0.45)] ring-1 ring-inset ring-white/25", palette.iconBox)} aria-hidden="true">
                  {Icon ? <Icon className="size-4" /> : <span className="text-xs font-bold leading-none">{String(i.label).charAt(0)}</span>}
                </span>
                <p className={cn("truncate text-[11px] font-semibold capitalize leading-tight", palette.label)}>{i.label}</p>
              </span>
              <p className={cn("relative mt-2 truncate text-right text-[22px] font-bold leading-none tracking-tight tabular-nums", i.tone ? STRIP_TONE[i.tone] : palette.value)}>{i.value}</p>
              {i.sub && <p className={cn("relative mt-1 truncate text-[11px] font-medium capitalize leading-snug", palette.label)}>{i.sub}</p>}
              {tip && (
                <span
                  role="tooltip"
                  className={cn(
                    "pointer-events-none absolute top-full z-50 mt-2.5 hidden w-max max-w-[240px] whitespace-normal rounded-lg border border-slate-700/80 bg-slate-900/95 px-3 py-2 text-left text-[11px] font-medium capitalize leading-snug text-white shadow-[0_12px_28px_-8px_rgba(15,23,42,0.55)] backdrop-blur-sm group-hover:block",
                    tipPos,
                  )}
                >
                  <span className={cn("absolute -top-1 size-2 rotate-45 border-l border-t border-slate-700/80 bg-slate-900", arrowPos)} aria-hidden="true" />
                  <span className="block font-bold">{i.label}</span>
                  <span className="mt-0.5 block text-slate-200">{tip}</span>
                </span>
              )}
            </div>
          );
          const wrap = "relative min-w-0 flex-1 hover:z-30 focus-within:z-30";
          return i.href ? (
            <Link key={i.label} href={i.href} className={cn(wrap, "block rounded-xl focus-visible:z-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/50")}>
              {body}
            </Link>
          ) : (
            <div key={i.label} className={wrap}>
              {body}
            </div>
          );
        })}
      </div>
    </section>
  );
}
