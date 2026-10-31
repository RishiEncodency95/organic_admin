"use client";

/**
 * Chart primitives shared by every Website screen.
 *
 * One categorical order, one axis per chart, a legend whenever more than one
 * series is drawn, and a tooltip on every plot. Series colours are validated
 * for colour-vision deficiency separation; status colours stay reserved for
 * good / warning / critical and are never reused as "series 4".
 */

import type { ReactNode } from "react";
import type { TooltipContentProps } from "recharts";
import { cn } from "@/components/infrastructure/lib/cn";

/** Fixed categorical order — assigned by series identity, never by rank. */
export const SERIES_COLORS = ["#2563EB", "#12A06D", "#E29208", "#7C3AED", "#DC3A32", "#0891B2", "#BE185D", "#65A30D", "#7C4A2D"] as const;

export const STATUS_COLORS = {
  good: "#12A06D",
  warning: "#E29208",
  serious: "#E2670C",
  critical: "#DC3A32",
  neutral: "#94A3B8",
} as const;

export const AXIS_PROPS = {
  tick: { fontSize: 10, fill: "#8494AC" },
  tickLine: false,
  axisLine: false,
} as const;

export const GRID_PROPS = {
  stroke: "#EDF1F7",
  strokeDasharray: "3 3",
  vertical: false,
} as const;

export interface TooltipRow {
  name: string;
  value: ReactNode;
  color?: string;
}

/** Shared tooltip shell — recharts passes us the payload, we render the rows. */
export function ChartTooltip({
  title,
  rows,
  footer,
}: {
  title: ReactNode;
  rows: TooltipRow[];
  footer?: ReactNode;
}) {
  return (
    <div className="rounded-md border border-[#E6EBF4] bg-white px-2.5 py-2 shadow-[0_4px_12px_rgba(16,24,40,0.08)]">
      <p className="mb-1 text-[10.5px] font-semibold text-[#111C3A]">{title}</p>
      <ul className="space-y-0.5">
        {rows.map((row) => (
          <li key={row.name} className="flex items-center gap-2 text-[10.5px]">
            {row.color ? (
              <span className="size-2 shrink-0 rounded-[2px]" style={{ background: row.color }} aria-hidden />
            ) : null}
            <span className="text-[#6B7A94]">{row.name}</span>
            <span className="ml-auto font-semibold text-[#28354C]">{row.value}</span>
          </li>
        ))}
      </ul>
      {footer ? <p className="mt-1 border-t border-[#EEF2F8] pt-1 text-[10px] text-[#94A3B8]">{footer}</p> : null}
    </div>
  );
}

export interface TooltipEntry {
  name: string;
  dataKey: string;
  value: number;
  color: string;
}

/**
 * Builds a recharts `content` renderer from two formatters, so every chart in
 * the module gets the same tooltip shell without repeating the payload plumbing.
 */
export function makeTooltip(
  formatValue: (entry: TooltipEntry) => ReactNode,
  formatTitle: (label: string) => ReactNode,
  footer?: ReactNode,
) {
  return function TooltipContent(props: TooltipContentProps) {
    if (!props.active || !props.payload?.length) return null;
    const rows: TooltipRow[] = props.payload.map((item) => {
      const entry: TooltipEntry = {
        name: String(item.name ?? item.dataKey ?? ""),
        dataKey: String(item.dataKey ?? ""),
        value: Number(item.value ?? 0),
        color: item.color ?? "#94A3B8",
      };
      return { name: entry.name, value: formatValue(entry), color: entry.color };
    });
    return <ChartTooltip title={formatTitle(String(props.label ?? ""))} rows={rows} footer={footer} />;
  };
}

/** Legend for multi-series charts. Identity is never carried by colour alone. */
export function ChartLegend({
  items,
  className,
  onToggle,
  hidden = [],
}: {
  items: { key: string; label: string; color: string }[];
  className?: string;
  onToggle?: (key: string) => void;
  hidden?: string[];
}) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-3 gap-y-1", className)}>
      {items.map((item) => {
        const off = hidden.includes(item.key);
        const content = (
          <>
            <span
              className="size-2 shrink-0 rounded-[2px]"
              style={{ background: off ? "#CBD5E1" : item.color }}
              aria-hidden
            />
            <span className={cn("text-[10.5px] font-medium", off ? "text-[#A3B0C2] line-through" : "text-[#5B6B85]")}>
              {item.label}
            </span>
          </>
        );
        return (
          <li key={item.key}>
            {onToggle ? (
              <button
                type="button"
                onClick={() => onToggle(item.key)}
                aria-pressed={!off}
                className="flex cursor-pointer items-center gap-1.5 rounded px-1 py-0.5 hover:bg-[#F4F7FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/35"
              >
                {content}
              </button>
            ) : (
              <span className="flex items-center gap-1.5 px-1 py-0.5">{content}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Horizontal share bar used for resource weight, devices, acquisition, etc. */
export function ShareBar({
  rows,
  ariaLabel,
}: {
  rows: { label: string; value: string; share: number; color: string }[];
  ariaLabel: string;
}) {
  return (
    <div>
      <div className="flex h-2.5 w-full gap-[2px] overflow-hidden rounded-full" role="img" aria-label={ariaLabel}>
        {rows.map((row) => (
          <span
            key={row.label}
            className="h-full first:rounded-l-full last:rounded-r-full"
            style={{ width: `${row.share}%`, background: row.color }}
          />
        ))}
      </div>
      <ul className="mt-2.5 space-y-1.5">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center gap-2 text-[11.5px]">
            <span className="size-2 shrink-0 rounded-[2px]" style={{ background: row.color }} aria-hidden />
            <span className="truncate text-[#4A5A73]">{row.label}</span>
            <span className="ml-auto shrink-0 font-semibold text-[#28354C]">{row.value}</span>
            <span className="w-9 shrink-0 text-right text-[10.5px] text-[#94A3B8]">{row.share}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
