"use client";

import { useState, type ElementType, type ReactNode } from "react";
import {
  AlertTriangle, Gauge, ArrowDownRight, ArrowUpRight, BookOpen, Calendar, CalendarClock, CalendarDays, Check, CircleHelp, Copy, Crown, FileText, Flame,
  Globe, Info, Lightbulb, ListChecks, PlayCircle, ShieldAlert, ShieldCheck, Sparkles, Target, ThumbsDown, ThumbsUp, TrendingUp, X, Zap,
} from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ReferenceLine,
  ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis,
} from "recharts";
import { toast } from "sonner";
import { cn } from "@/components/infrastructure/lib/cn";
import { Chip, ScoreDial } from "@/components/competitor-analyzer/source/features/admin/website/components/ui/kit";
import { AXIS_PROPS, ChartLegend, ChartTooltip, GRID_PROPS } from "@/components/competitor-analyzer/source/features/admin/website/components/ui/charts";
import { formatDateTime } from "@/components/competitor-analyzer/source/features/admin/website/data/selectors";
import type { ActionState, ActionStatus, AnalyzerResult, FeatureState, OwnSearch, RealUserSpeed, RunReport, SiteEvidence, SiteFeatures, SpeedCategory, StudyDetail, StudySite } from "@/components/competitor-analyzer/api";
import { topicImpressions } from "@/components/competitor-analyzer/watch-sections";
import { SiteFavicon, SiteLabel, SourceLink, siteNotice, useSiteLabelOf } from "@/components/competitor-analyzer/ui";

export type ColorOf = (domain: string) => string;
export type PreviousScores = Record<string, Record<string, number>> | null | undefined;

/** "+2" / "-1" against the previous check, or nothing when there is no previous score. */
function Trend({ now, before, className }: { now: number | undefined; before: number | undefined; className?: string }) {
  if (now === undefined || before === undefined || now === before) return null;
  const up = now > before;
  return (
    <span className={cn("ml-1 inline-flex items-center text-[9.5px] font-bold", up ? "text-[#0B845C]" : "text-[#C0261F]", className)} title={`${before} at the previous check`}>
      {up ? "▲" : "▼"}{Math.abs(now - before)}
    </span>
  );
}
const fmt = (n: number | null | undefined) => (n == null ? "—" : n.toLocaleString("en-IN"));
const tone = (score: number | null | undefined) => (score == null ? "muted" : score >= 70 ? "good" : score >= 45 ? "warn" : "bad");

/**
 * A report section. `explain` says in plain words what the section shows and how to read it; it can be folded away
 * and stays folded on this browser once closed.
 */
export function Panel({ title, icon: Icon, children, aside, className, subtitle, explain }: { title: string; icon: ElementType; children: ReactNode; aside?: ReactNode; className?: string; subtitle?: string; explain?: ReactNode }) {
  const key = `cmpz.explain.${title}`;
  const [open, setOpen] = useState(() => {
    try {
      return window.localStorage.getItem(key) === "open";
    } catch {
      return false;
    }
  });
  const toggle = () => {
    setOpen((v) => {
      try {
        window.localStorage.setItem(key, v ? "closed" : "open");
      } catch {
        /* storage unavailable: the choice lasts for this page only */
      }
      return !v;
    });
  };
  return (
    <section className={cn("min-w-0 rounded-xl border border-[#E6EBF4] bg-white p-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)]", className)}>
      <header className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid size-[26px] shrink-0 place-items-center rounded-lg bg-[#EFF4FC] text-[#3B69B8] ring-1 ring-inset ring-[#DCE7F7]"><Icon className="size-3.5" aria-hidden /></span>
          <div className="min-w-0">
            <h2 className="text-[13px] font-semibold text-[#111C3A]">{title}</h2>
            {subtitle ? <p className="text-[11px] text-[#6B7A94]">{subtitle}</p> : null}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {aside}
          {explain ? (
            <button type="button" onClick={toggle} className={cn("flex items-center gap-1 rounded-md px-2 py-1 text-[10.5px] font-medium", open ? "bg-[#EFF4FC] text-[#2563EB]" : "text-[#6B7A94] hover:bg-[#F1F4F9]")} aria-expanded={open}>
              <CircleHelp className="size-3.5" /> How to read
            </button>
          ) : null}
        </div>
      </header>
      {explain && open ? (
        <div className="mb-3 flex gap-2 rounded-lg border border-[#DCE6FB] bg-[#F7F9FF] p-2.5 text-[11.5px] leading-relaxed text-[#28354C]">
          <Info className="mt-0.5 size-4 shrink-0 text-[#2563EB]" aria-hidden />
          <div className="min-w-0 space-y-1">{explain}</div>
        </div>
      ) : null}
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Site image                                                          */
/* ------------------------------------------------------------------ */

/** The site's own share image (og:image), shown whole; nothing when the site has none. */
export function SiteImage({ ev, domain, className }: { ev?: SiteEvidence; domain: string; className?: string }) {
  const [broken, setBroken] = useState(false);
  const src = !broken ? ev?.image ?? ev?.metrics.image ?? null : null;
  if (!src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote share image of the site
    <img src={src} alt={`${domain} share image`} loading="lazy" referrerPolicy="no-referrer" onError={() => setBroken(true)} className={cn("aspect-[1.91/1] w-full rounded-lg bg-[#F4F6FA] object-contain ring-1 ring-[#E6EBF4]", className)} />
  );
}

/** `stacked` puts a long text value (e.g. a domain) on its own line under the label instead of beside it. */
function KpiCard({ label, icon: Icon, accent, value, sub, stacked }: { label: string; icon: ElementType; accent: string; value: ReactNode; sub: ReactNode; stacked?: boolean }) {
  return (
    <div className="min-w-0 rounded-xl border px-3 py-2 shadow-[0_1px_2px_rgba(16,24,40,0.04)]" style={{ background: `linear-gradient(135deg, ${accent}1F, ${accent}08)`, borderColor: `${accent}40` }}>
      <div className="flex min-w-0 items-center gap-2">
        <span className="grid size-6 shrink-0 place-items-center rounded-md text-white" style={{ background: accent }}><Icon className="size-3.5" aria-hidden /></span>
        <p className="min-w-0 flex-1 text-[10.5px] font-semibold uppercase tracking-wide text-[#4B5872]">{label}</p>
        {stacked ? null : <div className="min-w-0 text-right text-[20px] font-bold leading-none" style={{ color: accent }}>{value}</div>}
      </div>
      {stacked ? <div className="mt-1.5 min-w-0 font-bold" style={{ color: accent }}>{value}</div> : null}
      <p className="mt-1 text-[11px] leading-snug text-[#4B5872]">{sub}</p>
    </div>
  );
}

/** Competition rank: 1 + the number of sites with a higher score, so equal scores share a rank. */
export function rankOf(ai: AnalyzerResult, domain: string) {
  const mine = ai.overall[domain];
  if (mine === undefined) return null;
  const higher = Object.values(ai.overall).filter((v) => v > mine).length;
  const tied = Object.entries(ai.overall).filter(([d, v]) => d !== domain && v === mine).map(([d]) => d);
  return { rank: higher + 1, tied };
}

/* ------------------------------------------------------------------ */
/* Hero + leaderboard                                                  */
/* ------------------------------------------------------------------ */

export function Hero({ study, report, ai, colorOf }: { study: StudyDetail; report: RunReport; ai: AnalyzerResult | null; colorOf: ColorOf }) {
  const labelOf=useSiteLabelOf(),own=study.sites[0]!;
  const ranked=[...study.sites].sort((a,b)=>(ai?.overall[b.domain]??-1)-(ai?.overall[a.domain]??-1));
  const ownScore=ai?.overall[own.domain],position=ai?rankOf(ai,own.domain):null;
  const pages=report.sites.reduce((total,site)=>total+site.pages.length,0);
  const business=report.model?.businessIntelligence??report.businessIntelligence;
  const actions=business?.roadmap.length??ai?.actions.length??0;
  const medal=(r?:number)=>r===1?'bg-amber-100 text-amber-700 ring-amber-300':r===2?'bg-slate-100 text-slate-600 ring-slate-300':r===3?'bg-orange-100 text-orange-700 ring-orange-300':'bg-white text-slate-400 ring-slate-200';
  const R=26,C=2*Math.PI*R,pct=Math.max(0,Math.min(100,Number(ownScore)||0));
  return <div className="space-y-3 normal-case"><section className="overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-white px-4 py-3 shadow-sm"><div className="flex items-center gap-4"><div className="relative shrink-0" style={{width:64,height:64}}><svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90"><circle cx="32" cy="32" r={R} fill="none" stroke="#DBEAFE" strokeWidth="6"/><circle cx="32" cy="32" r={R} fill="none" stroke="#2563EB" strokeWidth="6" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C*(1-pct/100)}/></svg><span className="absolute inset-0 grid place-items-center text-lg font-bold tabular-nums text-blue-700">{ownScore??'?'}</span></div><div className="min-w-0 flex-1"><p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Your website · score out of 100</p><h2 className="mt-0.5 flex items-center gap-2 text-base font-semibold leading-snug text-slate-900"><SiteFavicon domain={own.domain} size={20}/><span className="break-words">{labelOf(own.domain)}</span></h2></div>{position?<span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${medal(position.rank)}`}><Crown className="size-3.5"/>Rank {position.rank} of {study.sites.length}{position.tied.length?' · shared':''}</span>:<span className="shrink-0 text-xs text-slate-500">Score not available</span>}</div><p className="mt-2.5 max-w-3xl text-xs leading-relaxed text-slate-600">{report.model?.summary??ai?.overview??'Website comparison based on the pages checked.'}</p><div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-blue-100/70 pt-2.5">{[{label:'Websites',value:study.sites.length,Icon:Globe},{label:'Pages checked',value:pages,Icon:FileText},{label:'Suggested actions',value:actions,Icon:ListChecks}].map(item=><span key={item.label} className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs text-slate-600 ring-1 ring-slate-200"><item.Icon className="size-3.5 text-blue-500"/><b className="font-semibold text-slate-900">{item.value}</b>{item.label}</span>)}<p className="ml-auto text-[10.5px] text-slate-400">Last checked {formatDateTime(report.finishedAt??report.startedAt)}. Scores describe website signals, not business performance.</p></div></section><section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex items-baseline justify-between gap-3 border-b border-slate-100 px-4 py-2"><h3 className="text-[13px] font-semibold text-slate-900">Website comparison</h3><p className="text-[11px] text-slate-500">Ranked by measured website score</p></div><ol className="divide-y divide-slate-100">{ranked.map(site=>{const score=ai?.overall[site.domain],rank=ai?rankOf(ai,site.domain)?.rank:undefined;return <li key={site.domain} className={`grid grid-cols-[24px_minmax(0,1fr)_40px] items-center gap-3 px-4 py-2 ${site.role==='own'?'bg-blue-50/60':''}`}><span className={`grid size-6 place-items-center rounded-full text-[11px] font-bold ring-1 ${medal(rank)}`}>{rank??'?'}</span><div className="min-w-0"><p className="flex items-center gap-2 text-[13px] text-slate-800"><SiteFavicon domain={site.domain} size={16}/><span className="min-w-0 break-words font-medium">{labelOf(site.domain)}</span>{site.role==='own'?<span className="shrink-0 rounded-full bg-blue-600 px-2 py-px text-[10px] font-medium text-white">You</span>:null}</p><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full" style={{width:`${score??0}%`,background:colorOf(site.domain)}}/></div></div><span className="text-right text-base font-bold tabular-nums text-slate-900">{score??'?'}</span></li>;})}</ol></section></div>;
}

export function Swot({ swot }: { swot: NonNullable<AnalyzerResult["swot"]> }) {
  const boxes = [
    { key: "strengths", title: "Strengths", icon: ThumbsUp, bg: "bg-[#ECFDF5]", ring: "ring-[#A7F3D0]", color: "text-[#065F46]", items: swot.strengths },
    { key: "weaknesses", title: "Weaknesses", icon: ThumbsDown, bg: "bg-[#FEF2F2]", ring: "ring-[#FECACA]", color: "text-[#991B1B]", items: swot.weaknesses },
    { key: "opportunities", title: "Opportunities", icon: Lightbulb, bg: "bg-[#EFF6FF]", ring: "ring-[#BFDBFE]", color: "text-[#1E40AF]", items: swot.opportunities },
    { key: "threats", title: "Threats", icon: ShieldAlert, bg: "bg-[#FFFBEB]", ring: "ring-[#FDE68A]", color: "text-[#92400E]", items: swot.threats },
  ];
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {boxes.map(({ key, title, icon: Icon, bg, ring, color, items }) => (
        <div key={key} className={cn("rounded-lg p-2.5 ring-1 ring-inset", bg, ring)}>
          <p className={cn("mb-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide", color)}><Icon className="size-3.5" />{title}</p>
          {items.length ? <ul className="space-y-1">{items.map((t) => <li key={t} className="flex gap-1.5 text-[11.5px] leading-snug text-[#28354C]"><span className={cn("mt-1.5 size-1 shrink-0 rounded-full bg-current", color)} />{t}</li>)}</ul> : <p className="text-[11px] text-[#94A3B8]">Nothing clear.</p>}
        </div>
      ))}
    </div>
  );
}

/** Each site placed by its Content depth (x) and Trust & proof (y) scores: top right is strongest. */
export function PositioningMap({ ai, sites, colorOf }: { ai: AnalyzerResult; sites: StudySite[]; colorOf: ColorOf }) {
  const labelOf = useSiteLabelOf();
  const x = ai.scores.find((s) => s.area === "Content depth");
  const y = ai.scores.find((s) => s.area === "Trust & proof");
  if (!x || !y) return <p className="text-[11.5px] text-[#6B7A94]">Not enough scores to place the sites.</p>;
  const points = sites.filter((s) => x.scores[s.domain] !== undefined && y.scores[s.domain] !== undefined).map((s) => ({ domain: s.domain, x: x.scores[s.domain]!, y: y.scores[s.domain]!, z: ai.overall[s.domain] ?? 50, own: s.role === "own" }));
  return (
    <div>
      <div className="relative h-[260px] normal-case">
        <span className="pointer-events-none absolute right-3 top-2 z-10 rounded bg-[#ECFDF5] px-1.5 py-0.5 text-[9.5px] font-semibold text-[#065F46]">Leaders</span>
        <span className="pointer-events-none absolute bottom-9 left-12 z-10 rounded bg-[#FEF2F2] px-1.5 py-0.5 text-[9.5px] font-semibold text-[#991B1B]">Catching up</span>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 16, bottom: 18, left: -8 }}>
            <CartesianGrid stroke="#EDF1F7" strokeDasharray="3 3" />
            <XAxis type="number" dataKey="x" domain={[0, 10]} ticks={[0, 5, 10]} {...AXIS_PROPS} label={{ value: "Content depth →", position: "insideBottom", offset: -8, fontSize: 10, fill: "#6B7A94" }} />
            <YAxis type="number" dataKey="y" domain={[0, 10]} ticks={[0, 5, 10]} {...AXIS_PROPS} label={{ value: "Trust & proof →", angle: -90, position: "insideLeft", offset: 20, fontSize: 10, fill: "#6B7A94" }} />
            <ZAxis type="number" dataKey="z" range={[160, 520]} />
            <ReferenceLine x={5} stroke="#CBD5E1" />
            <ReferenceLine y={5} stroke="#CBD5E1" />
            <Tooltip content={({ active, payload }) => {
              const p = active ? (payload?.[0]?.payload as (typeof points)[number] | undefined) : undefined;
              return p ? <ChartTooltip title={labelOf(p.domain)} rows={[{ name: "Content depth", value: `${p.x}/10`, color: colorOf(p.domain) }, { name: "Trust & proof", value: `${p.y}/10`, color: colorOf(p.domain) }, { name: "Overall", value: `${p.z}/100` }]} /> : null;
            }} />
            <Scatter data={points}>
              {points.map((p) => <Cell key={p.domain} fill={colorOf(p.domain)} fillOpacity={p.own ? 1 : 0.7} stroke={p.own ? "#111C3A" : "#fff"} strokeWidth={p.own ? 3 : 2} />)}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <ChartLegend className="justify-center normal-case" items={points.map((p) => ({ key: p.domain, label: p.own ? `${labelOf(p.domain)} (you)` : labelOf(p.domain), color: colorOf(p.domain) }))} />
    </div>
  );
}

/** Where the client wins and loses, read straight from the scores. */
export function WinLose({ ai, own, previous }: { ai: AnalyzerResult; own: string; previous?: PreviousScores }) {
  const rows = ai.scores.map((s) => {
    const mine = s.scores[own] ?? 0;
    const others = Object.entries(s.scores).filter(([d]) => d !== own).map(([, v]) => v);
    const best = Math.max(...others, 0);
    return { area: s.area, mine, best, diff: mine - best, note: s.note, before: previous?.[s.area]?.[own] };
  }).sort((a, b) => b.diff - a.diff);
  return (
    <ul className="space-y-1.5">
      {rows.map((r) => (
        <li key={r.area} className="text-[11.5px]" title={r.note}>
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-[#28354C]">{r.area}<Trend now={r.mine} before={r.before} /></span>
            <span className={cn("flex items-center gap-0.5 font-semibold tabular-nums", r.diff > 0 ? "text-[#0B845C]" : r.diff < 0 ? "text-[#C0261F]" : "text-[#6B7A94]")}>
              {r.diff > 0 ? <ArrowUpRight className="size-3.5" /> : r.diff < 0 ? <ArrowDownRight className="size-3.5" /> : null}
              {r.diff > 0 ? `+${r.diff} ahead` : r.diff < 0 ? `${r.diff} behind` : "level"}
            </span>
          </div>
          <div className="mt-1 grid grid-cols-[1fr] gap-0.5">
            <span className="h-1.5 overflow-hidden rounded-full bg-[#EEF2F8]"><span className="block h-full rounded-full bg-[#2563EB]" style={{ width: `${r.mine * 10}%` }} /></span>
            <span className="h-1.5 overflow-hidden rounded-full bg-[#EEF2F8]"><span className="block h-full rounded-full bg-[#94A3B8]" style={{ width: `${r.best * 10}%` }} /></span>
          </div>
        </li>
      ))}
      <li className="flex items-center gap-3 pt-1 text-[10px] text-[#6B7A94]"><span className="flex items-center gap-1"><span className="h-1.5 w-3 rounded-full bg-[#2563EB]" />You</span><span className="flex items-center gap-1"><span className="h-1.5 w-3 rounded-full bg-[#94A3B8]" />Best competitor</span></li>
    </ul>
  );
}

export function Changes({ report, colorOf, own }: { report: RunReport; colorOf: ColorOf; own: string }) {
  if (!report.changes) return <p className="text-[11.5px] text-[#6B7A94]">This is the first check. Re-check later and changes on every site show up here.</p>;
  if (!report.changes.items.length) return <p className="text-[11.5px] text-[#6B7A94]">No notable changes on any site since {formatDateTime(report.changes.since)}.</p>;
  return (
    <ul className="grid gap-1.5 md:grid-cols-2">
      {report.changes.items.map((c, i) => (
        <li key={i} className={cn("flex items-start gap-2 rounded-md p-2 text-[11.5px]", c.domain === own ? "bg-[#EFF4FC] ring-1 ring-inset ring-[#BFD3F7]" : "bg-[#FAFBFD]")}>
          {c.direction === "up" ? <ArrowUpRight className="mt-0.5 size-3.5 shrink-0 text-[#0F9D6E]" /> : c.direction === "down" ? <ArrowDownRight className="mt-0.5 size-3.5 shrink-0 text-[#DC3A32]" /> : <Info className="mt-0.5 size-3.5 shrink-0 text-[#6B7A94]" />}
          <span className="min-w-0"><SiteLabel domain={c.domain} color={colorOf(c.domain)} own={c.domain === own} /> <span className="text-[#4B5872]">{c.text}</span></span>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Scorecard tab                                                       */
/* ------------------------------------------------------------------ */

export function ScoreRadar({ ai, sites, colorOf }: { ai: AnalyzerResult; sites: StudySite[]; colorOf: ColorOf }) {
  const labelOf = useSiteLabelOf();
  const domains = sites.map((s) => s.domain).filter((d) => ai.overall[d] !== undefined);
  const data = ai.scores.map((s) => ({ area: s.area, note: s.note, ...Object.fromEntries(domains.map((d) => [d, s.scores[d] ?? 0])) }));
  return (
    <div>
      <div className="h-[300px] normal-case" role="img" aria-label="Scorecard radar">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="70%" margin={{ top: 6, right: 30, bottom: 6, left: 30 }}>
            <PolarGrid stroke="#E6EBF4" />
            <PolarAngleAxis dataKey="area" tick={{ fontSize: 10, fill: "#5B6B85" }} />
            <PolarRadiusAxis domain={[0, 10]} tickCount={6} tick={false} axisLine={false} />
            {domains.map((d) => (
              <Radar key={d} name={d} dataKey={d} stroke={colorOf(d)} strokeWidth={sites.find((s) => s.domain === d)?.role === "own" ? 2.5 : 1.5} fill={colorOf(d)} fillOpacity={sites.find((s) => s.domain === d)?.role === "own" ? 0.18 : 0.04} dot={{ r: 2.5, fill: colorOf(d), stroke: "#fff", strokeWidth: 1 }} />
            ))}
            <Tooltip content={({ active, payload }) => {
              const row = active ? (payload?.[0]?.payload as Record<string, unknown> | undefined) : undefined;
              return row ? <ChartTooltip title={String(row.area)} rows={domains.map((d) => ({ name: labelOf(d), value: `${row[d]}/10`, color: colorOf(d) }))} footer={row.note ? String(row.note) : undefined} /> : null;
            }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <ChartLegend className="justify-center normal-case" items={domains.map((d) => ({ key: d, label: sites.find((s) => s.domain === d)?.role === "own" ? `${labelOf(d)} (you)` : labelOf(d), color: colorOf(d) }))} />
    </div>
  );
}

/** Area × site heatmap: darker blue = higher score, crown = the single leader. */
export function Heatmap({ ai, sites, colorOf, previous }: { ai: AnalyzerResult; sites: StudySite[]; colorOf: ColorOf; previous?: PreviousScores }) {
  const domains = sites.map((s) => s.domain).filter((d) => ai.overall[d] !== undefined);
  const cell = (v: number | undefined) => {
    if (v === undefined) return { background: "#F4F6FA", color: "#A3B0C2" };
    const a = 0.08 + (v / 10) * 0.72;
    return { background: `rgba(37, 99, 235, ${a.toFixed(2)})`, color: a > 0.45 ? "#fff" : "#111C3A" };
  };
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] border-separate border-spacing-1 text-[11.5px]">
        <thead>
          <tr>
            <th className="w-36" />
            {domains.map((d) => <th key={d} className={cn("px-1.5 pb-1 pt-1 text-left align-bottom text-[10.5px] font-normal", sites.find((s) => s.domain === d)?.role === "own" && "rounded-t-md bg-[#EFF4FC]")}><SiteLabel domain={d} color={colorOf(d)} own={sites.find((s) => s.domain === d)?.role === "own"} /></th>)}
          </tr>
        </thead>
        <tbody>
          {ai.scores.map((s) => (
            <tr key={s.area}>
              <td className="pr-2 font-medium text-[#28354C]" title={s.note}>{s.area}</td>
              {domains.map((d) => (
                <td key={d} className={cn("h-9 rounded-md text-center font-bold tabular-nums", sites.find((x) => x.domain === d)?.role === "own" && "outline outline-2 -outline-offset-2 outline-[#2563EB]")} style={cell(s.scores[d])} title={s.note}>
                  {s.leader === d ? <Crown className="mr-0.5 inline size-3" /> : null}{s.scores[d] ?? "—"}
                  <Trend now={s.scores[d]} before={previous?.[s.area]?.[d]} className="rounded bg-white/90 px-0.5" />
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <td className="pr-2 font-bold text-[#111C3A]">Overall /100</td>
            {domains.map((d) => <td key={d} className={cn("h-9 rounded-md text-center text-[13px] font-bold tabular-nums text-white", sites.find((s) => s.domain === d)?.role === "own" ? "bg-[#2563EB]" : "bg-[#111C3A]")}>{ai.overall[d]}</td>)}
          </tr>
        </tbody>
      </table>
      <p className="mt-1 text-[10.5px] text-[#94A3B8]">Scores out of 10, judged only from the pages read and Google measurements. Hover a row for the reason.{previous ? " ▲▼ = change since the previous check." : ""}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Head to head                                                        */
/* ------------------------------------------------------------------ */

const THREAT = { high: { label: "High website pressure", cls: "bg-[#FEF2F2] text-[#B91C1C] ring-[#FECACA]" }, medium: { label: "Medium website pressure", cls: "bg-[#FFFBEB] text-[#92400E] ring-[#FDE68A]" }, low: { label: "Low website pressure", cls: "bg-[#F1F5F9] text-[#475569] ring-[#E2E8F0]" } } as const;

export function HeadToHead({ ai, report, own, colorOf }: { ai: AnalyzerResult; report: RunReport; own: string; colorOf: ColorOf }) {
  const labelOf = useSiteLabelOf();
  const promiseOf = (d: string) => ai.sites.find((s) => s.domain === d)?.promise;
  if(!ai.headToHead.length)return <div className="space-y-3"><p className="rounded-lg bg-blue-50 p-3 text-xs text-slate-600">Measured website comparison. AI narrative is incomplete; these area scores are calculated from the saved website evidence.</p><div className="grid gap-3 xl:grid-cols-2">{report.sites.filter(site=>site.domain!==own).map(site=><article key={site.domain} className="rounded-xl border border-[#E6EBF4] bg-white p-3"><div className="flex flex-wrap items-center justify-between gap-2"><SiteLabel domain={site.domain} color={colorOf(site.domain)} wrap/><span className="text-sm font-semibold">You {ai.overall[own]??'—'} / 100 · Them {ai.overall[site.domain]??'—'} / 100</span></div>{site.coverage?.status!=='complete'?<p className="mt-2 text-xs text-amber-800">Partial website coverage; missing signals are not proof of missing capabilities.</p>:null}<table className="mt-3 w-full text-left text-xs"><thead><tr className="border-b"><th className="py-2">Measured area</th><th>You</th><th>Them</th><th>Comparison</th></tr></thead><tbody>{ai.scores.map(row=>{const yours=row.scores[own],theirs=row.scores[site.domain];return <tr key={row.area} className="border-b border-slate-100"><td className="py-2">{row.area}</td><td>{yours??'—'}</td><td>{theirs??'—'}</td><td className={yours!=null&&theirs!=null&&yours!==theirs?(yours>theirs?'text-emerald-700':'text-amber-800'):'text-slate-500'}>{yours==null||theirs==null?'Not comparable':yours===theirs?'Equal':yours>theirs?'You lead':'They lead'}</td></tr>;})}</tbody></table><p className="mt-2 text-[11px] text-slate-500">Area scores are out of 10. These measurements describe website signals, not commercial performance.</p><div className="mt-2 flex flex-wrap gap-2"><SourceLink url={report.sites.find(item=>item.domain===own)?.url??`https://${own}/`}/><SourceLink url={site.url}/></div></article>)}</div></div>;
  return (
    <div className="grid gap-1 xl:grid-cols-2">
      {ai.headToHead.map((h) => {
        const t = THREAT[h.threat ?? "medium"];
        return (
          <article key={h.competitor} className="overflow-hidden rounded-xl border border-[#E6EBF4] bg-white">
            <header className="flex items-start gap-3 border-b border-[#EEF2F8] bg-gradient-to-r from-[#F8FAFD] to-white p-3">
              <SiteFavicon domain={h.competitor} size={32} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold normal-case text-[#111C3A]" title={h.competitor}>{labelOf(h.competitor)}</p>
                <p className="mt-1"><span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset", t.cls)}><AlertTriangle className="mr-0.5 inline size-3" />{t.label}</span></p>
                {h.threatReason ? <p className="mt-1 text-[11px] leading-snug text-[#6B7A94]">{h.threatReason}</p> : null}
              </div>
              <div className="flex shrink-0 items-center gap-2 rounded-lg bg-white px-2 py-1 ring-1 ring-[#E6EBF4]">
                <div className="text-center"><p className="text-[18px] font-bold tabular-nums" style={{ color: colorOf(own) }}>{ai.overall[own] ?? "—"}</p><p className="text-[9px] uppercase text-[#94A3B8]">you</p></div>
                <span className="text-[10px] font-bold text-[#CBD5E1]">vs</span>
                <div className="text-center"><p className="text-[18px] font-bold tabular-nums" style={{ color: colorOf(h.competitor) }}>{ai.overall[h.competitor] ?? "—"}</p><p className="text-[9px] uppercase text-[#94A3B8]">them</p></div>
              </div>
            </header>
            <div className="space-y-2.5 p-3">
              {h.verdict ? <p className="rounded-md bg-[#F8FAFD] p-2 text-[11.5px] text-[#28354C]"><Sparkles className="mr-1 inline size-3.5 text-[#7C3AED]" />{h.verdict}</p> : null}
              <div className="grid gap-2 sm:grid-cols-2">
                {[{ title: "You lead", Icon: ThumbsUp, items: h.youLead, text: "text-[#0B845C]", bg: "bg-[#F0FDF4]", border: "#12A06D" }, { title: "They lead", Icon: ThumbsDown, items: h.theyLead, text: "text-[#C0261F]", bg: "bg-[#FEF2F2]", border: "#DC3A32" }].map(({ title, Icon, items, text, bg, border }) => (
                  <div key={title}>
                    <p className={cn("mb-1 flex items-center gap-1 text-[10px] font-bold uppercase", text)}><Icon className="size-3" /> {title}{items.length ? <span className="font-medium normal-case text-[#94A3B8]">({items.length})</span> : null}</p>
                    {items.length ? (
                      <ul className="space-y-1">
                        {items.slice(0, 3).map((p) => <li key={p.point} className={cn("rounded-md border-l-[3px] py-1 pl-2 pr-1 text-[11px] leading-snug text-[#28354C]", bg)} style={{ borderColor: border }}>{p.point} <SourceLink url={p.url} /></li>)}
                        {items.length > 3 ? (
                          <li><details className="group"><summary className="cursor-pointer text-[10.5px] font-medium text-[#2563EB] group-open:hidden">Show {items.length - 3} more</summary><ul className="space-y-1">{items.slice(3).map((p) => <li key={p.point} className={cn("rounded-md border-l-[3px] py-1 pl-2 pr-1 text-[11px] leading-snug text-[#28354C]", bg)} style={{ borderColor: border }}>{p.point} <SourceLink url={p.url} /></li>)}</ul></details></li>
                        ) : null}
                      </ul>
                    ) : <p className="text-[11px] text-[#94A3B8]">Nothing clear.</p>}
                  </div>
                ))}
              </div>
              {promiseOf(own) || promiseOf(h.competitor) ? (
                <details className="rounded-md border border-[#E6EBF4] px-2 py-1.5 text-[11px]">
                  <summary className="cursor-pointer font-medium text-[#4B5872]">Compare website promises</summary>
                  <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
                    <p><span className="block text-[9.5px] font-semibold uppercase text-[#6B7A94]">Your promise</span>“{promiseOf(own) ?? "—"}”</p>
                    <p><span className="block text-[9.5px] font-semibold uppercase text-[#6B7A94]">Their promise</span>“{promiseOf(h.competitor) ?? "—"}”</p>
                  </div>
                </details>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Content & topics                                                    */
/* ------------------------------------------------------------------ */

export function TopicMatrix({ ai, sites, colorOf, search }: { ai: AnalyzerResult; sites: StudySite[]; colorOf: ColorOf; search?: OwnSearch | null }) {
  const labelOf = useSiteLabelOf();
  const topics = ai.topics ?? [];
  if (!topics.length) return <p className="text-[11.5px] text-[#6B7A94]">Re-check to see the topic map.</p>;
  const own = sites[0]!.domain;
  const sorted = [...topics].sort((a, b) => Number(a.sites.includes(own)) - Number(b.sites.includes(own)) || b.sites.length - a.sites.length);
  return (
    <div className="overflow-x-auto">
      <ChartLegend className="mb-2 normal-case" items={sites.map((s) => ({ key: s.domain, label: s.role === "own" ? `${labelOf(s.domain)} (you)` : labelOf(s.domain), color: colorOf(s.domain) }))} />
      <table className="w-full min-w-[520px] text-[11.5px]">
        <thead>
          <tr className="border-b border-[#EEF2F8]">
            <th className="py-1.5 text-left text-[10px] font-semibold uppercase text-[#6B7A94]">Topic</th>
            {sites.map((s) => <th key={s.domain} className={cn("px-1 py-1.5 text-center", s.role === "own" && "rounded-t-md bg-[#EFF4FC]")}><span className="inline-flex flex-col items-center gap-0.5"><SiteFavicon domain={s.domain} size={16} />{s.role === "own" ? <span className="rounded bg-[#2563EB] px-1 text-[8.5px] font-semibold uppercase text-white">You</span> : null}</span><span className="sr-only">{s.domain}</span></th>)}
            {search ? <th className="px-2 py-1.5 text-right text-[10px] font-semibold uppercase text-[#2563EB]" title="Impressions of your Google searches (last 28 days) that mention this topic">Your Google<br />impressions</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F2F5FA]">
          {sorted.map((t) => {
            const missing = !t.sites.includes(own);
            return (
              <tr key={t.topic} className={missing ? "bg-[#FFFBEB]" : undefined}>
                <td className="py-1.5 pr-2 text-[#28354C]">{t.topic}{missing ? <span className="ml-1.5 rounded bg-[#FDE68A] px-1 text-[9.5px] font-semibold text-[#92400E]">you don’t cover</span> : null}</td>
                {sites.map((s) => (
                  <td key={s.domain} className={cn("px-1 py-1.5 text-center", s.role === "own" && "bg-[#EFF4FC]")}>
                    {t.sites.includes(s.domain) ? <span className="mx-auto block size-3.5 rounded-full" style={{ background: colorOf(s.domain) }} title={`${labelOf(s.domain)} covers this`} /> : <span className="mx-auto block size-3.5 rounded-full border border-dashed border-[#CBD5E1]" title={`${labelOf(s.domain)} does not`} />}
                  </td>
                ))}
                {search ? <td className="px-2 py-1.5 text-right font-semibold tabular-nums text-[#28354C]">{(() => { const v = topicImpressions(t.topic, search); return v ? v.toLocaleString("en-IN") : <span className="text-[#C0261F]">0</span>; })()}</td> : null}
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-1 text-[10.5px] text-[#94A3B8]">Themes found on the pages read. Highlighted rows are topics competitors cover and you don’t.{search ? " “Your Google impressions” counts your real searches (last 28 days) that mention the topic: 0 means Google rarely shows you for it yet." : ""}</p>
    </div>
  );
}

const FORMAT_ICON = { page: FileText, blog: BookOpen, faq: CircleHelp, video: PlayCircle, guide: Lightbulb } as const;

type ContentIdea = NonNullable<AnalyzerResult["contentIdeas"]>[number];

/** Copies one idea as plain text, ready to paste into a brief or a document. */
async function copyIdea(idea: ContentIdea) {
  const lines = [
    idea.title,
    `Format: ${idea.format}`,
    idea.why ? `Why: ${idea.why}` : "",
    idea.outline?.length ? `Outline:\n${idea.outline.map((h, i) => `${i + 1}. ${h}`).join("\n")}` : "",
    idea.keywords?.length ? `Search phrases: ${idea.keywords.join(", ")}` : "",
    idea.inspiredBy ? `Inspired by: ${idea.inspiredBy}` : "",
  ].filter(Boolean);
  try {
    await navigator.clipboard.writeText(lines.join("\n"));
    toast.success("Idea copied");
  } catch {
    toast.error("Could not copy. Select the text and copy it instead.");
  }
}

export function ContentIdeas({ ai, colorOf }: { ai: AnalyzerResult; colorOf: ColorOf }) {
  const ideas = ai.contentIdeas ?? [];
  if (!ideas.length) return <p className="text-[11.5px] text-[#6B7A94]">Re-check to get content ideas.</p>;
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {ideas.map((idea) => {
        const Icon = FORMAT_ICON[idea.format] ?? FileText;
        return (
          <div key={idea.title} className="flex gap-2.5 rounded-lg border border-[#E6EBF4] bg-gradient-to-br from-white to-[#F8FAFD] p-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#F1ECFE] text-[#7C3AED]"><Icon className="size-4" /></span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2">
                <p className="flex-1 text-[12px] font-semibold leading-snug text-[#111C3A]">{idea.title}</p>
                <button type="button" onClick={() => copyIdea(idea)} title="Copy this idea (title, why, outline and search phrases)" className="inline-flex shrink-0 items-center gap-1 rounded-md border border-[#E6EBF4] bg-white px-1.5 py-0.5 text-[10px] font-medium text-[#4B5872] hover:bg-[#F1F4F9]">
                  <Copy className="size-3" /> Copy
                </button>
              </div>
              <p className="mt-0.5 text-[10.5px] text-[#6B7A94]">{idea.why}</p>
              {idea.outline?.length || idea.keywords?.length ? (
                <details className="mt-1">
                  <summary className="cursor-pointer text-[10.5px] font-medium text-[#2563EB]">Outline &amp; search phrases</summary>
                  {idea.outline?.length ? (
                    <ol className="mt-1 list-decimal space-y-0.5 pl-4 text-[11px] leading-snug text-[#28354C]">
                      {idea.outline.map((h) => <li key={h}>{h}</li>)}
                    </ol>
                  ) : null}
                  {idea.keywords?.length ? (
                    <p className="mt-1.5 flex flex-wrap items-center gap-1 text-[10px] text-[#6B7A94]">
                      <span className="font-medium">Search phrases:</span>
                      {idea.keywords.map((k) => <span key={k} className="rounded bg-[#F1F4F9] px-1.5 py-0.5 normal-case text-[#28354C]">{k}</span>)}
                    </p>
                  ) : null}
                </details>
              ) : null}
              <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px]"><Chip>{idea.format}</Chip>{idea.inspiredBy ? <span className="text-[#6B7A94]">inspired by <SiteLabel domain={idea.inspiredBy} color={colorOf(idea.inspiredBy)} /></span> : null}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Gaps({ ai, colorOf }: { ai: AnalyzerResult; colorOf: ColorOf }) {
  if (!ai.gaps.length) return <p className="text-[11.5px] text-[#6B7A94]">No clear gaps.</p>;
  return (
    <ul className="space-y-1.5">
      {ai.gaps.map((g) => (
        <li key={g.topic} className="rounded-md border-l-[3px] border-[#E29208] bg-[#FFFBEB]/60 p-2">
          <p className="text-[11.5px] font-semibold text-[#111C3A]">{g.topic}</p>
          {g.why ? <p className="text-[10.5px] text-[#6B7A94]">{g.why}</p> : null}
          <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[10.5px]">{g.competitors.map((d) => <SiteLabel key={d} domain={d} color={colorOf(d)} />)}<SourceLink url={g.url} /></p>
        </li>
      ))}
    </ul>
  );
}

export function Profiles({ ai, report, sites, colorOf }: { ai: AnalyzerResult; report: RunReport; sites: StudySite[]; colorOf: ColorOf }) {
  const [open, setOpen] = useState<string>(sites[1]?.domain ?? sites[0]?.domain ?? "");
  const profile = ai.sites.find((s) => s.domain === open);
  if (!ai.sites.length) return <p className="text-[11.5px] text-[#6B7A94]">Re-check to see each website up close.</p>;
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {ai.sites.map((s) => (
          <button key={s.domain} type="button" onClick={() => setOpen(s.domain)} className={cn("rounded-full border px-2.5 py-1 text-[11px]", open === s.domain ? "border-[#2563EB] bg-[#EFF4FC]" : sites.find((x) => x.domain === s.domain)?.role === "own" ? "border-[#BFD3F7] bg-[#F5F8FF]" : "border-[#E6EBF4] hover:bg-[#F8FAFD]")}>
            <SiteLabel domain={s.domain} color={colorOf(s.domain)} own={sites.find((x) => x.domain === s.domain)?.role === "own"} />
          </button>
        ))}
      </div>
      {profile ? (
        <div className={cn("grid gap-3", (report.sites.find((e) => e.domain === profile.domain)?.image) && "md:grid-cols-[220px_minmax(0,1fr)]")}>
          <SiteImage ev={report.sites.find((e) => e.domain === profile.domain)} domain={profile.domain} />
          <div className="min-w-0 space-y-2.5">
            {profile.promise ? <p className="text-[15px] font-semibold leading-snug text-[#111C3A]">“{profile.promise}”</p> : null}
            <p className="text-[12px] leading-relaxed text-[#28354C]">{profile.summary}</p>
            <div className="flex flex-wrap gap-1.5">
              {profile.tone ? <Chip tone="violet">Tone: {profile.tone}</Chip> : null}
              {profile.offerings.map((o) => <Chip key={o} tone="info">{o}</Chip>)}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {profile.audience ? <p className="rounded-md bg-[#F8FAFD] p-2 text-[11px] text-[#4B5872]"><span className="mb-0.5 flex items-center gap-1 font-semibold text-[#111C3A]"><Target className="size-3.5 text-[#3B69B8]" />Who they speak to</span>{profile.audience}</p> : null}
              {profile.positioning ? <p className="rounded-md bg-[#F8FAFD] p-2 text-[11px] text-[#4B5872]"><span className="mb-0.5 flex items-center gap-1 font-semibold text-[#111C3A]"><TrendingUp className="size-3.5 text-[#3B69B8]" />How they position</span>{profile.positioning}</p> : null}
            </div>
            <div className="grid gap-2.5 md:grid-cols-2">
              {[{ title: "Strengths", items: profile.strengths, color: "#12A06D", Icon: ThumbsUp }, { title: "Weak spots", items: profile.weaknesses, color: "#DC3A32", Icon: ThumbsDown }].map(({ title, items, color, Icon }) => (
                <div key={title}>
                  <p className="mb-1 flex items-center gap-1 text-[10.5px] font-bold uppercase" style={{ color }}><Icon className="size-3" />{title}</p>
                  {items.length ? <ul className="space-y-1.5">{items.map((p) => <li key={p.point} className="rounded-md border-l-[3px] bg-[#FAFBFD] py-1.5 pl-2.5 pr-2" style={{ borderLeftColor: color }}><p className="text-[11.5px] font-semibold text-[#111C3A]">{p.point}</p>{p.evidence ? <p className="line-clamp-2 text-[10.5px] text-[#6B7A94]">{p.evidence}</p> : null}<SourceLink url={p.url} /></li>)}</ul> : <p className="text-[11px] text-[#94A3B8]">Nothing the pages clearly show.</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Speed & tech                                                        */
/* ------------------------------------------------------------------ */

const SPEED_TONE: Record<SpeedCategory, string> = { good: "text-[#0B845C]", "needs-improvement": "text-[#B45309]", poor: "text-[#C0261F]" };

/** Real visitors' speed (Chrome UX Report): what people actually experienced on phones, not a one-off lab test. */
function RealUsers({ field }: { field: RealUserSpeed | null }) {
  if (!field) return <p className="mt-2 border-t border-[#EEF2F8] pt-1.5 text-[10px] leading-snug text-[#94A3B8]">Real visitors: too few for Google to report.</p>;
  const rows = [
    ["Main content shows", field.lcpMs ? `${(field.lcpMs.p75 / 1000).toFixed(1)}s` : null, field.lcpMs?.category],
    ["Reacts to a tap", field.inpMs ? `${Math.round(field.inpMs.p75)} ms` : null, field.inpMs?.category],
    ["Layout stays still", field.cls ? field.cls.p75.toFixed(2) : null, field.cls?.category],
  ] as const;
  return (
    <div className="mt-2 border-t border-[#EEF2F8] pt-1.5 text-[10.5px]">
      <p className="font-semibold text-[#4B5872]">Real visitors{field.scope === "origin" ? " (whole site)" : ""}</p>
      {rows.map(([label, value, category]) => (
        <p key={label} className="flex justify-between gap-2 text-[#6B7A94]">
          <span>{label}</span>
          <span className={cn("font-semibold", category ? SPEED_TONE[category] : "text-[#94A3B8]")}>{value ?? "—"}</span>
        </p>
      ))}
    </div>
  );
}

export function SpeedBoard({ report, sites, colorOf }: { report: RunReport; sites: StudySite[]; colorOf: ColorOf }) {
  const labelOf = useSiteLabelOf();
  const rows = sites.map((s) => ({ site: s, ev: report.sites.find((e) => e.domain === s.domain) }));
  const lcp = rows.filter((r) => r.ev?.speed?.lcpMs != null).map((r) => ({ domain: r.site.domain, label: r.site.role === "own" ? `${labelOf(r.site.domain)} (you)` : labelOf(r.site.domain), seconds: Number((r.ev!.speed!.lcpMs! / 1000).toFixed(1)) }));
  return (
    <div className="space-y-4">
      <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" }}>
        {rows.map(({ site, ev }) => (
          <div key={site.domain} className={cn("min-w-0 overflow-hidden rounded-lg border p-2.5", site.role === "own" ? "border-[#2563EB] bg-[#F5F8FF] ring-1 ring-[#2563EB]/20" : "border-[#E6EBF4]")}>
            <SiteLabel domain={site.domain} color={colorOf(site.domain)} own={site.role === "own"} wrap />
            {ev?.speed ? (
              <div className="mt-2 grid grid-cols-3 gap-1 text-center text-[9.5px] text-[#6B7A94]">
                {([["Speed", ev.speed.performance], ["SEO", ev.speed.seo], ["Access.", ev.speed.accessibility]] as const).map(([label, v]) => (
                  <div key={label} className="flex flex-col items-center gap-0.5"><ScoreDial value={v} tone={tone(v)} size={50} label={`${label} ${v ?? "n/a"}`} />{label}</div>
                ))}
              </div>
            ) : <p className="mt-2 text-[10.5px] text-[#94A3B8]">{ev?.speedError ?? "Not measured."}</p>}
            {ev?.speed && ev.speed.field !== undefined ? <RealUsers field={ev.speed.field} /> : null}
          </div>
        ))}
      </div>
      {lcp.length ? (
        <div>
          <p className="mb-1 text-[11px] font-semibold text-[#6B7A94]">Time until the main content shows on a phone (seconds, lower is better)</p>
          <div className="h-[160px] normal-case">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lcp} layout="vertical" margin={{ top: 4, right: 30, bottom: 4, left: 8 }}>
                <CartesianGrid {...GRID_PROPS} horizontal={false} vertical />
                <XAxis type="number" {...AXIS_PROPS} />
                <YAxis type="category" dataKey="label" width={180} {...AXIS_PROPS} tickFormatter={(d: string) => (d.length > 26 ? `${d.slice(0, 25)}…` : d)} />
                <ReferenceLine x={2.5} stroke="#12A06D" strokeDasharray="4 3" label={{ value: "good ≤ 2.5s", position: "top", fontSize: 9.5, fill: "#0B845C" }} />
                <Tooltip content={({ active, payload }) => (active && payload?.[0] ? <ChartTooltip title={String(payload[0].payload.domain)} rows={[{ name: "Largest paint", value: `${payload[0].value}s`, color: colorOf(String(payload[0].payload.domain)) }]} /> : null)} cursor={{ fill: "#F1F4F9" }} />
                <Bar dataKey="seconds" radius={[0, 4, 4, 0]} maxBarSize={16}>{lcp.map((r) => <Cell key={r.domain} fill={colorOf(r.domain)} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}
    </div>
  );
}

type Check = { label: string; value: (e: SiteEvidence) => boolean | number | string | FeatureState | null; good?: (v: never) => boolean; better?: "high" | "low"; hint?: string };
const featureState = (e: SiteEvidence, key: keyof SiteFeatures, legacy: boolean): FeatureState => e.features?.[key]?.state ?? (legacy ? "present" : "not_observed");
const newFeature = (e: SiteEvidence, key: keyof SiteFeatures): FeatureState => e.features?.[key]?.state ?? "not_observed";
const FEATURE_LABEL: Record<FeatureState, string> = { present: "Present", absent_confirmed: "Absent", not_observed: "Not verified", render_failed: "Render failed" };
const featureTone = (value: FeatureState) => value === "present" ? "bg-[#E7F6EF] text-[#0B845C]" : value === "absent_confirmed" ? "bg-[#FEF2F2] text-[#B91C1C]" : "bg-[#FFFBEB] text-[#92400E]";
const isFeatureState = (value: unknown): value is FeatureState => typeof value === "string" && value in FEATURE_LABEL;
const CHECKS: { group: string; rows: Check[] }[] = [
  {
    group: "Search basics",
    rows: [
      { label: "Pages in sitemap", value: (e) => e.tech?.sitemapUrls ?? null, better: "high", hint: "How many pages the site lists for Google. More listed pages = more chances to appear in search." },
      { label: "robots.txt", value: (e) => e.tech?.robotsTxt ?? null, hint: "A small file that tells Google what it may read. Every site should have one." },
      { label: "One H1 on home page", value: (e) => (e.tech ? e.tech.h1Count === 1 : null), hint: "The main headline. Exactly one helps Google understand the page." },
      { label: "Title length (30–60)", value: (e) => e.tech?.titleLength ?? null, good: ((v: number) => v >= 30 && v <= 60) as never, hint: "Characters in the blue headline shown in Google. 30–60 fits without being cut." },
      { label: "Meta description (70–160)", value: (e) => e.tech?.descriptionLength ?? null, good: ((v: number) => v >= 70 && v <= 160) as never, hint: "The grey text under the headline in Google. 0 means Google writes its own." },
      { label: "Canonical tag", value: (e) => e.tech?.canonical ?? null, hint: "Tells Google which address is the real one, so copies don’t compete." },
      { label: "Social share tags (Open Graph)", value: (e) => e.tech?.openGraph ?? null, hint: "Controls the picture and title when the link is shared on WhatsApp, Facebook, LinkedIn." },
      { label: "Mobile viewport", value: (e) => e.tech?.viewport ?? null, hint: "Makes the page fit phone screens." },
      { label: "Images with alt text", value: (e) => (e.tech && e.tech.imagesTotal ? Math.round((e.tech.imagesWithAlt / e.tech.imagesTotal) * 100) : null), better: "high", hint: "% of home page images described in words — helps Google Images and blind visitors." },
      { label: "Structured data types", value: (e) => e.metrics.schemaTypes.length, better: "high", hint: "Hidden labels (Event, Organization…) that can earn rich results like dates and logos in Google." },
      { label: "Google knows the brand", value: (e) => (e.brand ? e.brand.status === "matched" : null), hint: "Whether Google’s Knowledge Graph lists this business with this website." },
    ],
  },
  {
    group: "Content",
    rows: [
      { label: "Key pages read", value: (e) => e.metrics.pages, better: "high", hint: "Home plus the main About / Services / Contact-type pages we could open." },
      { label: "Words on those pages", value: (e) => e.metrics.words, better: "high", hint: "Visible text. More useful text usually means more search topics covered." },
      { label: "Pages updated in 30 days", value: (e) => e.tech?.sitemapRecent30 ?? null, better: "high", hint: "From the sitemap dates: how actively the site adds or updates pages right now." },
      { label: "Pages updated in 90 days", value: (e) => e.tech?.sitemapRecent90 ?? null, better: "high", hint: "The same over three months. “—” means the sitemap has no dates." },
      { label: "Last sitemap update", value: (e) => e.tech?.sitemapLatest ?? null, hint: "The newest date in the sitemap." },
      { label: "Blog / news section", value: (e) => featureState(e, "blog", e.tech?.hasBlog === true), hint: "Present only when an article section or article evidence was actually observed." },
      { label: "Newest dated content", value: (e) => e.tech?.latestDate ?? null, hint: "Latest publish date found. Empty = no dated content, so freshness is unknown." },
      { label: "Different calls to action", value: (e) => e.metrics.ctas, better: "high", hint: "Buttons like Register, Book, Donate, Contact that ask the visitor to act." },
      { label: "Images", value: (e) => e.metrics.images, better: "high", hint: "Pictures in the main content of the pages read." },
    ],
  },
  {
    group: "What they offer",
    rows: [
      { label: "Products / catalogue", value: (e) => newFeature(e, "products"), hint: "A product range, catalogue or shop page was seen." },
      { label: "Buy online", value: (e) => newFeature(e, "onlineStore"), hint: "Cart, checkout or “buy now” on the site." },
      { label: "Prices on the website", value: (e) => newFeature(e, "prices"), hint: "At least one price is written on a page (₹, Rs, INR, $…)." },
      { label: "Events / registration", value: (e) => newFeature(e, "events"), hint: "Events, exhibitions, stall booking or visitor registration." },
      { label: "Portfolio / projects", value: (e) => newFeature(e, "portfolio"), hint: "Past work, case studies or a project gallery." },
      { label: "Client names or logos", value: (e) => newFeature(e, "clients"), hint: "Clients, partners or brands shown as proof." },
      { label: "Testimonials / reviews", value: (e) => newFeature(e, "testimonials"), hint: "What customers say, on the site itself." },
    ],
  },
  {
    group: "Reach & trust",
    rows: [
      { label: "Phone", value: (e) => featureState(e, "phone", e.metrics.contact.phone), hint: "A phone number observed in static or rendered content." },
      { label: "WhatsApp", value: (e) => featureState(e, "whatsapp", e.metrics.contact.whatsapp), hint: "A WhatsApp chat link or button observed during the check." },
      { label: "Email", value: (e) => featureState(e, "email", e.metrics.contact.email), hint: "An email address observed in static or rendered content." },
      { label: "Contact form", value: (e) => featureState(e, "contactForm", e.metrics.contact.form), hint: "A rendered form to send an enquiry or register." },
      { label: "Social profiles linked", value: (e) => e.metrics.social.length, better: "high", hint: "Facebook, Instagram, LinkedIn, YouTube… linked from the site." },
      { label: "HTTPS", value: (e) => e.https, hint: "The padlock in the browser. Google and visitors expect it." },
    ],
  },
];

export function TechTable({ report, sites, colorOf }: { report: RunReport; sites: StudySite[]; colorOf: ColorOf }) {
  const cols = sites.map((s) => ({ site: s, ev: report.sites.find((e) => e.domain === s.domain && e.reachable) ?? null }));
  const [showHints, setShowHints] = useState(false);
  return (
    <div className="overflow-x-auto">
      <div className="mb-1 flex justify-end">
        <button type="button" onClick={() => setShowHints((v) => !v)} aria-pressed={showHints} className={cn("rounded-md px-2 py-1 text-[10.5px] font-medium", showHints ? "bg-[#EFF4FC] text-[#2563EB]" : "text-[#6B7A94] hover:bg-[#F1F4F9]")}>{showHints ? "Hide explanations" : "Show explanations"}</button>
      </div>
      <table className="w-full min-w-[640px] text-[11.5px]">
        <thead>
          <tr className="border-b border-[#EEF2F8]">
            <th className="w-[240px] py-2 text-left" />
            {cols.map((c) => <th key={c.site.domain} className={cn("px-2 py-2 text-left text-[11px] font-normal", c.site.role === "own" && "rounded-t-md bg-[#EFF4FC]")}><SiteLabel domain={c.site.domain} color={colorOf(c.site.domain)} own={c.site.role === "own"} /></th>)}
          </tr>
        </thead>
        {CHECKS.map((g) => (
          <tbody key={g.group}>
            <tr><td colSpan={cols.length + 1} className="pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wide text-[#6B7A94]">{g.group}</td></tr>
            {g.rows.map((row) => {
              const values = cols.map((c) => (c.ev ? row.value(c.ev) : null));
              const nums = values.filter((v): v is number => typeof v === "number");
              const best = row.better && nums.length > 1 ? (row.better === "high" ? Math.max(...nums) : Math.min(...nums)) : null;
              return (
                <tr key={row.label} className="border-t border-[#F2F5FA]">
                  <td className="py-1.5 pr-3 align-top text-[#28354C]">
                    <span className="font-medium" title={row.hint}>{row.label}</span>
                    {row.hint && showHints ? <span className="block text-[10.5px] leading-snug text-[#94A3B8]">{row.hint}</span> : null}
                  </td>
                  {values.map((v, i) => {
                    const ok = typeof v === "number" && row.good ? (row.good as (n: number) => boolean)(v) : null;
                    return (
                      <td key={cols[i]!.site.domain} className={cn("px-2 py-1.5", cols[i]!.site.role === "own" && "bg-[#EFF4FC]")}>
                        {isFeatureState(v) ? (
                          <span className={cn("inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold", featureTone(v))}>{FEATURE_LABEL[v]}</span>
                        ) : typeof v === "boolean" ? (
                          v ? <span className="grid size-5 place-items-center rounded-full bg-[#E7F6EF] text-[#0F9D6E]"><Check className="size-3" aria-label="yes" /></span> : <span className="grid size-5 place-items-center rounded-full bg-[#FEF2F2] text-[#DC3A32]"><X className="size-3" aria-label="no" /></span>
                        ) : v == null ? (
                          <span className="text-[#A3B0C2]">—</span>
                        ) : (
                          <span className={cn("rounded px-1.5 py-0.5 font-semibold tabular-nums", (typeof v === "number" && v === best) || ok === true ? "bg-[#E7F6EF] text-[#0B845C]" : ok === false ? "bg-[#FEF2F2] text-[#B91C1C]" : "text-[#28354C]")}>
                            {typeof v === "number" ? fmt(v) : v}{row.label.startsWith("Images with alt") && typeof v === "number" ? "%" : ""}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        ))}
      </table>
      <p className="mt-2 text-[10.5px] text-[#94A3B8]">Measured during the check (green = best or within the recommended range). Traffic, rankings and backlinks are not visible on pages, so they are not shown.</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Action plan                                                         */
/* ------------------------------------------------------------------ */

const COLUMNS = [
  { when: "this week", title: "This week", icon: Zap, accent: "#DC3A32" },
  { when: "this month", title: "This month", icon: CalendarDays, accent: "#E29208" },
  { when: "this quarter", title: "This quarter", icon: CalendarClock, accent: "#2563EB" },
] as const;

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
const STATUS: { value: ActionStatus; label: string }[] = [
  { value: "todo", label: "To do" },
  { value: "doing", label: "Doing" },
  { value: "done", label: "Done" },
];

export interface ActionTracking {
  states: Record<string, ActionState>;
  onStatus: (action: string, status: ActionStatus) => void;
  onTask: (action: string, reason: string, priority: "high" | "medium" | "low") => void;
  busy: string | null;
  canTask: boolean;
}

export function ActionBoard({ ai, colorOf, tracking }: { ai: AnalyzerResult; colorOf: ColorOf; tracking?: ActionTracking }) {
  const actions = ai.actions.map((a, i) => ({ ...a, n: i + 1, when: a.when ?? (a.priority === "high" ? "this week" : a.priority === "medium" ? "this month" : "this quarter") }));
  const stateOf = (action: string) => (tracking ? Object.values(tracking.states).find((st) => norm(st.action) === norm(action)) : undefined);
  const done = actions.filter((a) => stateOf(a.action)?.status === "done").length;
  const doing = actions.filter((a) => stateOf(a.action)?.status === "doing").length;
  return (
    <div className="space-y-2">
      {tracking ? (
        <div className="rounded-lg border border-[#E6EBF4] bg-white p-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
            <span className="font-semibold text-[#111C3A]">{done} of {actions.length} done{doing ? ` · ${doing} in progress` : ""}</span>
            <span className="text-[11px] text-[#6B7A94]">Mark progress here; the next check shows if your scores moved.</span>
          </div>
          <span className="mt-1.5 flex h-2 overflow-hidden rounded-full bg-[#EEF2F8]">
            <span className="h-full bg-[#12A06D]" style={{ width: `${(done / Math.max(1, actions.length)) * 100}%` }} />
            <span className="h-full bg-[#F59E0B]" style={{ width: `${(doing / Math.max(1, actions.length)) * 100}%` }} />
          </span>
        </div>
      ) : null}
      <div className="grid gap-1 lg:grid-cols-3">
        {COLUMNS.map((col) => {
          const items = actions.filter((a) => a.when === col.when);
          const Icon = col.icon;
          return (
            <div key={col.when} className="rounded-xl bg-[#F8FAFD] p-2.5 ring-1 ring-inset ring-[#E6EBF4]">
              <p className="mb-2 flex items-center justify-between text-[12px] font-bold text-[#111C3A]">
                <span className="flex items-center gap-1.5"><span className="grid size-6 place-items-center rounded-md text-white" style={{ background: col.accent }}><Icon className="size-3.5" /></span>{col.title}</span>
                <Chip tone="muted">{items.length}</Chip>
              </p>
              <ul className="space-y-2">
                {items.map((a) => {
                  const quick = a.effort === "low" && (a.impact ?? a.priority) === "high";
                  return (
                    <li key={a.n} className={cn("rounded-lg border bg-white p-2.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]", stateOf(a.action)?.status === "done" ? "border-[#A7F3D0] bg-[#F0FDF4]" : "border-[#E6EBF4]")}>
                      <p className={cn("text-[12px] font-semibold leading-snug text-[#111C3A]", stateOf(a.action)?.status === "done" && "line-through decoration-[#12A06D]/60")}>{a.action}</p>
                      {a.reason ? <p className="mt-1 text-[10.5px] text-[#6B7A94]">{a.reason}</p> : null}
                      <p className="mt-1.5 flex flex-wrap items-center gap-1">
                        {quick ? <Chip tone="good"><Zap className="mr-0.5 inline size-2.5" />Quick win</Chip> : null}
                        <Chip tone={(a.impact ?? a.priority) === "high" ? "bad" : (a.impact ?? a.priority) === "medium" ? "warn" : "muted"}>{a.impact ?? a.priority} impact</Chip>
                        <Chip>{a.effort} effort</Chip>
                      </p>
                      {a.learnFrom ? <p className="mt-1 text-[10.5px] text-[#4B5872]">Learn from <SiteLabel domain={a.learnFrom} color={colorOf(a.learnFrom)} /></p> : null}
                      {a.evidenceUrls?.length ? <p className="mt-1 flex flex-wrap gap-1.5 text-[10px] text-[#6B7A94]">Evidence {a.evidenceUrls.map((url) => <SourceLink key={url} url={url} />)}</p> : null}
                      {tracking ? (
                        <div className="mt-2 flex flex-wrap items-center justify-between gap-1.5 border-t border-[#EEF2F8] pt-2">
                          <div className="inline-flex rounded-md border border-[#DAE1EC] bg-[#F5F7FB] p-0.5" role="radiogroup" aria-label="Progress">
                            {STATUS.map((st) => {
                              const active = (stateOf(a.action)?.status ?? "todo") === st.value;
                              return (
                                <button key={st.value} type="button" role="radio" aria-checked={active} disabled={tracking.busy === a.action} onClick={() => tracking.onStatus(a.action, st.value)} className={cn("rounded px-2 py-0.5 text-[10.5px] font-semibold", active ? (st.value === "done" ? "bg-[#12A06D] text-white" : st.value === "doing" ? "bg-[#F59E0B] text-white" : "bg-white text-[#111C3A] shadow-sm") : "text-[#6B7A94] hover:text-[#111C3A]")}>
                                  {st.label}
                                </button>
                              );
                            })}
                          </div>
                          {stateOf(a.action)?.taskId ? (
                            <a href="/competitor-analyzer#analyzer-tasks" className="text-[10.5px] font-semibold text-[#0B845C] hover:underline">✓ Task created</a>
                          ) : tracking.canTask ? (
                            <button type="button" disabled={tracking.busy === a.action} onClick={() => tracking.onTask(a.action, a.reason, a.impact ?? a.priority)} className="text-[10.5px] font-semibold text-[#2563EB] hover:underline disabled:opacity-50">+ Create action task</button>
                          ) : null}
                        </div>
                      ) : null}
                    </li>
                  );
                })}
                {!items.length ? <li className="text-[11px] text-[#94A3B8]">Nothing here.</li> : null}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export function History({ study, colorOf }: { study: StudyDetail; colorOf: ColorOf }) {
  const labelOf = useSiteLabelOf();
  const points = study.history.filter((h) => h.overall);
  if (points.length < 2) {
    return <p className="flex items-center gap-2 text-[11.5px] text-[#6B7A94]"><Calendar className="size-4" />Every re-check adds a point here, so you see who is improving and who is slipping. Re-check in a week or two.</p>;
  }
  const domains = study.sites.map((s) => s.domain);
  const data = points.map((h) => ({ label: new Date(h.at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }), ...h.overall }));
  return (
    <div>
      <div className="h-[220px] normal-case">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 6, right: 10, bottom: 0, left: -18 }}>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="label" {...AXIS_PROPS} />
            <YAxis {...AXIS_PROPS} domain={[0, 100]} />
            <Tooltip content={({ active, payload, label }) => (active && payload?.length ? <ChartTooltip title={String(label)} rows={payload.map((p) => ({ name: String(p.name), value: String(p.value), color: String(p.color) }))} /> : null)} />
            {domains.map((d) => <Line key={d} type="monotone" dataKey={d} name={d} stroke={colorOf(d)} strokeWidth={study.sites[0]?.domain === d ? 3 : 2} dot={{ r: 3 }} connectNulls />)}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <ChartLegend className="justify-center normal-case" items={domains.map((d) => ({ key: d, label: d === study.sites[0]?.domain ? `${labelOf(d)} (you)` : labelOf(d), color: colorOf(d) }))} />
    </div>
  );
}

export function Opportunities({ ai }: { ai: AnalyzerResult }) {
  if (!ai.opportunities.length) return null;
  return (
    <ul className="space-y-1.5">
      {ai.opportunities.map((o) => <li key={o} className="flex gap-2 rounded-md bg-[#F5F3FF] p-2 text-[11.5px] text-[#28354C]"><ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-[#7C3AED]" />{o}</li>)}
    </ul>
  );
}

const AREA_MEANING: Record<string, string> = {
  "Message clarity": "Can a visitor tell within seconds who you are, what you offer and for whom?",
  "Trust & proof": "Testimonials, numbers, awards, partners, certificates — reasons to believe you.",
  "Calls to action": "Clear buttons and next steps: register, book, contact, donate.",
  "Content depth": "How much genuinely useful information the pages give.",
  "Ease of contact": "Phone, WhatsApp, email and forms that are easy to find.",
  "Search basics": "Titles, descriptions, headings and technical tags Google needs.",
  "Speed & mobile": "How fast and comfortable the site is on a phone.",
};

export function AreaGuide({ ai }: { ai: AnalyzerResult }) {
  return (
    <dl className="divide-y divide-[#F2F5FA]">
      {ai.scores.map((s) => (
        <div key={s.area} className="py-2 first:pt-0">
          <dt className="text-[12px] font-semibold text-[#111C3A]">{s.area}</dt>
          <dd className="text-[11px] text-[#6B7A94]">{AREA_MEANING[s.area] ?? ""}</dd>
          {s.note ? <dd className="mt-0.5 text-[11px] text-[#28354C]"><span className="font-medium text-[#2563EB]">Here:</span> {s.note}</dd> : null}
        </div>
      ))}
    </dl>
  );
}
