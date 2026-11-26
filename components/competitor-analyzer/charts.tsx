"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Legend, Line, LineChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ReferenceArea, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";
import type { ReportSite, RunSummary } from "@/lib/competitorAnalyzerApi";

/*
 * Charts for the competitor report. Forest green identifies Moksha; restrained blue, terracotta, ochre and plum
 * identify competitors. Each chart has labels/tooltips and the scorecard provides the underlying numbers.
 * Colour follows the ENTITY: Moksha is always slot 1; each competitor keeps its slot from the study order, so
 * hiding a site never repaints the others. One own site plus at most four competitors is drawn at a time.
 */

export const SERIES = ["#176047", "#47789e", "#be7853", "#9a7c29", "#88678e"];
export const MAX_SERIES = SERIES.length;

export function colorFor(sites: Pick<ReportSite, "domain" | "role">[], domain: string): string {
  const own = sites.find((s) => s.role === "own");
  if (own?.domain === domain) return SERIES[0];
  const comps = sites.filter((s) => s.role === "competitor");
  const i = comps.findIndex((s) => s.domain === domain);
  return i >= 0 && i + 1 < SERIES.length ? SERIES[i + 1] : "#94a3b8";
}

const short = (d: string) => d.replace(/^www\./, "");
const tooltipStyle = { fontSize: 11, borderRadius: 12, border: "1px solid #dce5de", boxShadow: "0 8px 28px rgba(19,54,43,.10)", padding: "10px 12px", background: "rgba(255,255,255,.98)" };
const SHORT_AREA: Record<string, string> = {
  clarity: "Clarity",
  contact: "Contact",
  trust: "Trust",
  services: "Services & prices",
  content: "Content",
  technical: "Tech SEO",
  performance: "Speed",
};

/** Area-by-area strength: one polygon per selected site, own site drawn last and thicker. */
export function ScoreRadar({ sites, visible }: { sites: ReportSite[]; visible: string[] }) {
  const own = sites.find((s) => s.role === "own");
  const shown = sites.filter((s) => visible.includes(s.domain) && s.score?.categories?.length);
  const data = useMemo(
    () =>
      (own?.score.categories ?? []).map((c) => ({
        area: SHORT_AREA[c.category] ?? c.label,
        ...Object.fromEntries(shown.map((s) => [s.domain, s.score.categories.find((x) => x.category === c.category)?.score ?? null])),
      })),
    [own, shown],
  );
  if (!shown.length) return <p className="text-sm text-slate-500">No scored sites selected.</p>;
  const ordered = [...shown.filter((s) => s.role !== "own"), ...shown.filter((s) => s.role === "own")];
  return (
    <ResponsiveContainer width="100%" height={300} minWidth={0}>
      <RadarChart data={data} outerRadius="70%" margin={{ top: 12, bottom: 4, left: 22, right: 22 }}>
        <PolarGrid stroke="#e1e8df" gridType="polygon" />
        <PolarAngleAxis dataKey="area" tick={{ fontSize: 11, fill: "#475569" }} />
        <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "#94a3b8" }} tickCount={5} axisLine={false} />
        {ordered.map((s) => (
          <Radar key={s.domain} name={short(s.domain)} dataKey={s.domain} stroke={colorFor(sites, s.domain)} fill={colorFor(sites, s.domain)} fillOpacity={s.role === "own" ? 0.12 : 0.025} strokeWidth={s.role === "own" ? 2.5 : 1.5} dot={{ r: s.role === "own" ? 3 : 2 }} connectNulls={false} isAnimationActive={false} />
        ))}
        <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => (v === null || v === undefined ? "not scored" : `${v}/100`)} />
        <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

/** Positioning map: content & helpfulness (x) vs trust & transparency (y). Sites missing either score are listed below. */
export function PositioningMap({ sites, visible }: { sites: ReportSite[]; visible: string[] }) {
  const get = (s: ReportSite, cat: string) => s.score?.categories?.find((c) => c.category === cat)?.score ?? null;
  const points = sites.filter((s) => visible.includes(s.domain)).map((s) => ({ s, x: get(s, "content"), y: get(s, "trust") }));
  const plotted = points.filter((p) => p.x !== null && p.y !== null);
  const missing = points.filter((p) => p.x === null || p.y === null);
  const overlap = plotted.length - new Set(plotted.map((p) => `${p.x}:${p.y}`)).size;
  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 18, right: 26, bottom: 28, left: 8 }}>
          <ReferenceArea x1={50} x2={100} y1={50} y2={100} fill="#ecf4ea" fillOpacity={0.65} />
          <CartesianGrid stroke="#e8ede7" strokeDasharray="3 5" />
          <ReferenceLine x={50} stroke="#c8d4c7" strokeDasharray="4 5" />
          <ReferenceLine y={50} stroke="#c8d4c7" strokeDasharray="4 5" />
          <XAxis type="number" dataKey="x" name="Content" domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} label={{ value: "Content & helpfulness →", position: "bottom", offset: 10, fontSize: 11, fill: "#475569" }} />
          <YAxis type="number" dataKey="y" name="Trust" domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} label={{ value: "Trust & transparency →", angle: -90, position: "insideLeft", fontSize: 11, fill: "#475569", dy: 60 }} />
          <ZAxis range={[160, 160]} />
          <Tooltip content={({ active, payload }) => {
            const point = payload?.[0]?.payload as { domain?: string; x?: number; y?: number } | undefined;
            return active && point ? <div style={tooltipStyle}><p className="mb-1 font-semibold text-slate-700">{point.domain}</p><p className="text-slate-500">Content {point.x}/100 · Trust {point.y}/100</p></div> : null;
          }} cursor={{ stroke: "#9aac9d", strokeDasharray: "3 3" }} />
          {plotted.map(({ s, x, y }) => (
            <Scatter key={s.domain} name={short(s.domain)} data={[{ x, y, domain: s.domain }]} fill={colorFor(sites, s.domain)} stroke="#ffffff" strokeWidth={2} shape={s.role === "own" ? "star" : "circle"} isAnimationActive={false} />
          ))}
          <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
        </ScatterChart>
      </ResponsiveContainer>
      <p className="text-[10px] leading-relaxed text-slate-400">Top-right = stronger on both website areas. ★ = your site.{overlap ? " Some sites share the same coordinates; use the website filters to inspect them separately." : ""}{missing.length ? ` Not placed (missing evidence): ${missing.map((p) => short(p.s.domain)).join(", ")}.` : ""}</p>
    </div>
  );
}

/** Overall measured score over completed runs, one line per site. */
export function ScoreTrend({ runs, sites, visible }: { runs: RunSummary[]; sites: Pick<ReportSite, "domain" | "role">[]; visible: string[] }) {
  const completed = [...runs].filter((r) => r.status === "completed" && r.report?.sites).reverse();
  const version = (r: RunSummary) => r.report?.methodology?.rubricVersion ?? r.report?.sites?.[0]?.score?.rubricVersion ?? "historical-unknown";
  const data = completed.flatMap((r, i) => [...(i > 0 && version(completed[i - 1]) !== version(r) ? [{ date: "Rubric Changed", ...Object.fromEntries(sites.map((s) => [s.domain, null])) }] : []), ({
    date: new Date(r.finishedAt ?? r.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    ...Object.fromEntries((r.report?.sites ?? []).map((s) => [s.domain, s.score?.overall ?? null])),
  })]);
  if (data.length < 2) return <p className="text-sm text-slate-500">The trend appears after at least two completed checks.</p>;
  const shown = sites.filter((s) => visible.includes(s.domain));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 10, right: 20, bottom: 4, left: 0 }}>
        <CartesianGrid stroke="#e8ede7" strokeDasharray="3 5" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} width={32} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => (v === null || v === undefined ? "not scored" : `${v}/100`)} />
        <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 10 }} />
        {shown.map((s) => (
          <Line key={s.domain} type="linear" dataKey={s.domain} name={short(s.domain)} stroke={colorFor(sites, s.domain)} strokeWidth={s.role === "own" ? 2.5 : 1.5} dot={{ r: 3, fill: "#fff", strokeWidth: 2 }} activeDot={{ r: 5 }} connectNulls={false} isAnimationActive={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

/** Chips to choose which sites are drawn (max 8 coloured series). */
export function SiteToggles({ sites, visible, onChange }: { sites: ReportSite[]; visible: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {sites.map((s) => {
        const on = visible.includes(s.domain);
        const color = colorFor(sites, s.domain);
        return (
          <button
            key={s.domain}
            type="button"
            onClick={() => onChange(on ? visible.filter((d) => d !== s.domain) : visible.length >= MAX_SERIES ? visible : [...visible, s.domain])}
            aria-pressed={on}
            className={`normal-case inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[11px] font-medium transition ${on ? "border-[#d4e0d5] bg-white text-slate-800 shadow-sm" : "border-dashed border-slate-200 text-slate-400"}`}
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: on ? color : "#cbd5e1" }} />
            {short(s.domain)}
            {s.role === "own" && <span className="text-[10px] text-slate-400">(you)</span>}
          </button>
        );
      })}
    </div>
  );
}

/** A readable alternative to overlapping polygons; all bars keep the same honest 0–100 scale. */
export function ScoreBars({ sites, visible }: { sites: ReportSite[]; visible: string[] }) {
  const [area, setArea] = useState("overall");
  const own = sites.find((s) => s.role === "own");
  const shown = sites.filter((s) => visible.includes(s.domain));
  const data = shown.map((s) => ({ name: (s.siteName || short(s.domain)).slice(0, 19), domain: s.domain,
    score: area === "overall" ? s.score?.overall ?? null : s.score?.categories.find((c) => c.category === area)?.score ?? null,
  }));
  const measured = data.filter((s) => s.score !== null);
  const missing = data.filter((s) => s.score === null);
  return <div className="min-w-0">
    <div className="mb-2 flex items-center justify-between gap-2"><span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Same metric. Same scale.</span><select aria-label="Comparison metric" value={area} onChange={(e) => setArea(e.target.value)} className="max-w-44 rounded-lg border border-slate-200 bg-[#fafbf8] px-2 py-1.5 text-[11px] text-slate-600"><option value="overall">Overall website score</option>{own?.score?.categories.map((c) => <option value={c.category} key={c.category}>{SHORT_AREA[c.category] ?? c.label}</option>)}</select></div>
    {measured.length ? <ResponsiveContainer width="100%" height={Math.max(220, measured.length * 47 + 38)} minWidth={0}>
      <BarChart accessibilityLayer data={measured} layout="vertical" margin={{ top: 8, right: 34, bottom: 0, left: 0 }} barSize={15}>
        <CartesianGrid horizontal={false} stroke="#e8ede7" strokeDasharray="3 5" />
        <XAxis type="number" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#91a094" }} />
        <YAxis type="category" dataKey="name" width={126} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#546457" }} />
        <Tooltip cursor={{ fill: "#f4f7f1" }} contentStyle={tooltipStyle} labelFormatter={(_, payload) => payload?.[0]?.payload?.domain ?? ""} formatter={(v: unknown) => [`${v}/100`, "Website score"]} />
        <Bar dataKey="score" radius={[0, 5, 5, 0]} background={{ fill: "#f1f4ef", radius: 5 }} isAnimationActive={false}>
          {measured.map((s) => <Cell key={s.domain} fill={colorFor(sites, s.domain)} />)}
          <LabelList dataKey="score" position="right" style={{ fontSize: 11, fontWeight: 600, fill: "#3f5143" }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer> : <p className="py-16 text-center text-xs text-slate-400">No measured scores for this selection.</p>}
    <p className="mt-2 text-[10px] leading-relaxed text-slate-400">Scores describe sampled website pages.{missing.length ? ` Not scored: ${missing.map((s) => s.name).join(", ")}.` : " Missing data is never converted to zero."}</p>
  </div>;
}
