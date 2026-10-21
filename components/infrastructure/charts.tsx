"use client";

import { useId } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "./lib/cn";

/** Series palette: distinct hues that stay legible on light and dark surfaces. Colour is never the only cue (legend + tooltip text). */
export const SERIES = { cpu: "#dc2626", mem: "#2563eb", disk: "#d97706", rx: "#059669", tx: "#7c3aed", load: "#0891b2", swap: "#db2777", muted: "#94a3b8" } as const;

const TOOLTIP_STYLE = { fontSize: 11, borderRadius: 8, border: "1px solid #dbe4f3", boxShadow: "0 10px 24px -12px rgba(30,58,138,0.35)", padding: "6px 10px", background: "rgba(255,255,255,0.97)" };
const GRID = "#e6ecf5";
/** Soft tinted panel behind every chart so plots stand out from the white card. */
const PLOT = "rounded-md bg-gradient-to-b from-indigo-50/50 via-slate-50/40 to-white p-2 ring-1 ring-inset ring-indigo-100/60";

export type Unit = "pct" | "bytes" | "bytesPerSec" | "number" | "load";

const UNITS = ["B", "KB", "MB", "GB", "TB"];
export function formatBytes(value: number | null | undefined, perSec = false): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  let v = Math.abs(value);
  let i = 0;
  while (v >= 1024 && i < UNITS.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${(value < 0 ? -v : v).toFixed(v >= 100 || i === 0 ? 0 : 1)} ${UNITS[i]}${perSec ? "/s" : ""}`;
}

export function formatUnit(value: number | null | undefined, unit: Unit): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  switch (unit) {
    case "pct": return `${value.toFixed(value >= 10 ? 0 : 1)}%`;
    case "bytes": return formatBytes(value);
    case "bytesPerSec": return formatBytes(value, true);
    case "load": return value.toFixed(2);
    default: return String(Math.round(value * 100) / 100);
  }
}

function timeTick(t: number, spanMs: number): string {
  const d = new Date(t);
  return spanMs <= 36 * 3_600_000
    ? d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export interface ChartSeries {
  key: string;
  label: string;
  color: string;
}

/**
 * Time-series chart. `null` values are real gaps (collector offline / no data) and are drawn as breaks, never joined.
 * Data is expected pre-bucketed by the server (<= ~200 points), so nothing here downsamples or fabricates points.
 */
export function MonitoringChart({ data, series, unit, height = 180, yMax, kind = "area", ariaLabel }: { data: Array<Record<string, number | null>>; series: ChartSeries[]; unit: Unit; height?: number; yMax?: number; kind?: "area" | "line"; ariaLabel: string }) {
  const id = useId().replace(/:/g, "");
  const span = data.length > 1 ? (data[data.length - 1]!.t as number) - (data[0]!.t as number) : 0;
  const hasAny = data.some((d) => series.some((s) => d[s.key] !== null && d[s.key] !== undefined));
  if (!hasAny) {
    return <div className="flex items-center justify-center rounded-md border border-dashed border-indigo-200 bg-indigo-50/30 text-[11px] font-medium text-slate-500" style={{ height }}>No data in this range</div>;
  }
  const common = {
    data,
    margin: { top: 6, right: 8, bottom: 0, left: 0 },
  };
  const axes = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
      <XAxis dataKey="t" type="number" scale="time" domain={["dataMin", "dataMax"]} tickFormatter={(t: number) => timeTick(t, span)} tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} minTickGap={36} />
      <YAxis width={unit === "pct" ? 38 : 54} tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} tickFormatter={(v: number) => formatUnit(v, unit)} domain={[0, yMax ?? "auto"]} />
      <Tooltip
        isAnimationActive={false}
        contentStyle={TOOLTIP_STYLE}
        labelFormatter={(t) => new Date(Number(t)).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
        formatter={(value, name) => [formatUnit(value as number | null, unit), name]}
      />
      {series.length > 1 && <Legend iconType="plainline" wrapperStyle={{ fontSize: 11 }} />}
    </>
  );
  return (
    <div role="img" aria-label={ariaLabel} className={PLOT} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {kind === "area" ? (
          <AreaChart {...common}>
            <defs>
              {series.map((s) => (
                <linearGradient key={s.key} id={`${id}-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.32} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            {axes}
            {series.map((s) => <Area key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2} fill={`url(#${id}-${s.key})`} connectNulls={false} dot={false} isAnimationActive={false} />)}
          </AreaChart>
        ) : (
          <LineChart {...common}>
            {axes}
            {series.map((s) => <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2} connectNulls={false} dot={false} isAnimationActive={false} />)}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

/** Vertical bars for categorical or time-bucket counts (expiry windows, spend per month, ...). */
export function CountBars({ rows, color = "#4f46e5", height = 170, unit = "number", ariaLabel, formatLabel }: { rows: Array<{ label: string; value: number }>; color?: string; height?: number; unit?: Unit; ariaLabel: string; formatLabel?: (v: string) => string }) {
  const gid = `bars-${useId().replace(/:/g, "")}`;
  if (!rows.some((r) => r.value > 0)) {
    return <div className="flex items-center justify-center rounded-md border border-dashed border-indigo-200 bg-indigo-50/30 text-[11px] font-medium text-slate-500" style={{ height }}>Nothing to chart yet</div>;
  }
  return (
    <div role="img" aria-label={ariaLabel} className={PLOT} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={1} />
              <stop offset="100%" stopColor={color} stopOpacity={0.55} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} interval={0} tickFormatter={formatLabel} />
          <YAxis width={34} allowDecimals={false} tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} />
          <Tooltip isAnimationActive={false} cursor={{ fill: "rgba(99,102,241,0.08)" }} contentStyle={TOOLTIP_STYLE} formatter={(v) => [formatUnit(v as number, unit), "Count"]} />
          <Bar dataKey="value" fill={`url(#${gid})`} radius={[4, 4, 0, 0]} isAnimationActive={false} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const DONUT_COLORS = ["#dc2626", "#2563eb", "#059669", "#d97706", "#7c3aed", "#0891b2", "#db2777", "#64748b"];

/** Share-of-total donut with a text legend (values are also listed, so the chart is never the only carrier). */
export function Donut({ rows, height = 150, ariaLabel }: { rows: Array<{ label: string; value: number }>; height?: number; ariaLabel: string }) {
  const data = rows.filter((r) => r.value > 0);
  const total = data.reduce((s, r) => s + r.value, 0);
  // One category is not a distribution: show it as a plain figure instead of a full ring.
  if (data.length === 1) {
    return (
      <p className="flex items-baseline gap-2 text-xs font-medium text-slate-600">
        <span className="text-[22px] font-semibold leading-none tabular-nums text-slate-900">{data[0]!.value}</span>
        <span className="truncate">{data[0]!.label}</span>
      </p>
    );
  }
  if (!total) return <div className="flex items-center justify-center rounded-md border border-dashed border-indigo-200 bg-indigo-50/30 text-[11px] font-medium text-slate-500" style={{ height }}>Nothing to chart yet</div>;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div role="img" aria-label={ariaLabel} style={{ width: height, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" innerRadius="58%" outerRadius="92%" paddingAngle={1} isAnimationActive={false} stroke="none">
              {data.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
            </Pie>
            <Tooltip isAnimationActive={false} contentStyle={TOOLTIP_STYLE} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="min-w-0 flex-1 space-y-1 text-[11px] font-medium text-slate-700">
        {data.map((r, i) => (
          <li key={r.label} className="flex items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-1.5"><span className="size-2 shrink-0 rounded-sm" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} aria-hidden="true" /><span className="truncate">{r.label}</span></span>
            <span className="shrink-0 tabular-nums text-slate-900">{r.value} <span className="text-slate-400">· {Math.round((r.value / total) * 100)}%</span></span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Horizontal usage bar for a single measured percentage; unmeasured shows an explicit label, never an empty "0%". */
export function UsageBar({ value, warn = 85, crit = 95, label, className }: { value: number | null | undefined; warn?: number; crit?: number; label?: string; className?: string }) {
  if (value === null || value === undefined) return <span className={cn("text-[11px] font-medium text-slate-400", className)}>{label ?? "Not measured"}</span>;
  const tone = value >= crit ? "bg-rose-500" : value >= warn ? "bg-amber-500" : "bg-emerald-500";
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100" aria-hidden="true"><span className={cn("block h-full rounded-full", tone)} style={{ width: `${Math.min(100, Math.max(2, value))}%` }} /></span>
      <span className="text-[11px] font-semibold tabular-nums text-slate-800">{value.toFixed(value >= 10 ? 0 : 1)}%</span>
    </span>
  );
}

/** Tiny inline trend for dense tables. Gaps stay gaps. */
export function Sparkline({ values, color = SERIES.cpu, width = 90, height = 24 }: { values: Array<number | null>; color?: string; width?: number; height?: number }) {
  const pts = values.map((v, i) => ({ i, v }));
  if (!pts.some((p) => p.v !== null)) return <span className="text-[11px] text-slate-400">—</span>;
  return (
    <div style={{ width, height }} aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={pts}><Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.4} dot={false} connectNulls={false} isAnimationActive={false} /></LineChart>
      </ResponsiveContainer>
    </div>
  );
}
