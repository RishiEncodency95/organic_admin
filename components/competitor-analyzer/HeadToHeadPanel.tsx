"use client";

import { ArrowDownRight, ArrowUpRight, CheckCheck, ChevronRight, ExternalLink, Quote, Scale, ShieldCheck } from "lucide-react";
import type { Claim, Report, ReportSite } from "@/lib/competitorAnalyzerApi";
import { colorFor } from "./charts";
import DisplayText from "./DisplayText";
import SiteIcon from "./SiteIcon";

const shortSource = (url: string) => {
  try { const parsed = new URL(url); return `${parsed.hostname}${parsed.pathname === "/" ? "" : parsed.pathname}`; }
  catch { return url; }
};

function SourceQuote({ source }: { source: { url: string; quote: string } }) {
  return <div className="mt-3 overflow-hidden rounded-xl border border-[#e8ede4] bg-[#f9fbf6]">
    <blockquote className="flex items-start gap-2 px-3 py-3 text-[11px] leading-[1.75] text-[#778270]"><Quote size={13} className="mt-1 shrink-0 text-[#a4b398]" /><span>“<DisplayText text={source.quote} />”</span></blockquote>
    <a href={source.url} title={source.url} target="_blank" rel="noreferrer noopener" className="flex items-center gap-1.5 border-t border-[#e9eee4] bg-white/70 px-3 py-2 text-[10px] text-[#64834e] transition hover:bg-[#f0f5e9]"><ShieldCheck size={11} className="shrink-0" /><span className="normal-case min-w-0 flex-1 truncate">{shortSource(source.url)}</span><ExternalLink size={10} className="shrink-0" /><span className="shrink-0 text-[9px] font-medium">Source</span></a>
  </div>;
}

function Finding({ claim, index, own }: { claim: Claim; index: number; own: boolean }) {
  return <article className="min-w-0 rounded-xl border border-white bg-white p-3 shadow-[0_1px_4px_rgba(23,50,29,.03)] md:p-4">
    <div className="mb-2 flex items-center gap-2"><span className={`flex h-5 w-5 items-center justify-center rounded-md text-[9px] font-bold ${own ? "bg-[#eef4e7] text-[#7f9b62]" : "bg-[#edf2f7] text-[#7d98ae]"}`}>0{index + 1}</span><span className="text-[9px] font-semibold text-slate-400">Website evidence</span></div>
    <p className="text-xs font-medium leading-[1.8] text-[#4d5f47]"><DisplayText text={claim.evidence.some((e) => e.quote === claim.text) ? "Observed Website Statement" : claim.text} /></p>
    {claim.evidence[0] && <SourceQuote source={claim.evidence[0]} />}
    {claim.evidence.length > 1 && <details className="mt-2 text-[10px] text-slate-400"><summary className="cursor-pointer">{claim.evidence.length - 1} additional source{claim.evidence.length > 2 ? "s" : ""}</summary>{claim.evidence.slice(1).map((source, i) => <SourceQuote key={i} source={source} />)}</details>}
  </article>;
}

function FindingsColumn({ own, name, findings, extractive = false }: { own: boolean; name: string; findings: Claim[]; extractive?: boolean }) {
  return <div className={`min-w-0 rounded-2xl border p-1 ${own ? "border-[#e0e9d7] bg-[#f0f5e9]" : "border-[#e1e8ee] bg-[#eef3f8]"}`}>
    <div className="flex items-center justify-between gap-2 px-3 py-3">
      <div className="flex min-w-0 items-center gap-2"><span className={`rounded-lg p-1.5 ${own ? "bg-[#e2ecd5] text-[#6e8e51]" : "bg-[#e1eaf2] text-[#65839e]"}`}>{own ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}</span><div><h4 className={`text-xs font-semibold ${own ? "text-[#4f6e38]" : "text-[#5b7892]"}`}>{extractive ? own ? "Moksha website evidence" : "Competitor website evidence" : own ? "Where Moksha leads" : "Where they lead"}</h4><p className="mt-0.5 truncate text-[9px] text-slate-400"><DisplayText text={name} /></p></div></div>
      <span className="shrink-0 rounded-full border border-white bg-white/80 px-2 py-1 text-[9px] font-semibold text-slate-400">{findings.length} finding{findings.length === 1 ? "" : "s"}</span>
    </div>
    <div className="space-y-1">{findings.length ? findings.map((claim, i) => <Finding key={i} claim={claim} index={i} own={own} />) : <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-xl bg-white/80 p-5 text-center"><CheckCheck size={22} className="text-slate-300" /><p className="text-[11px] font-medium text-slate-400">No supported lead observed</p><p className="max-w-52 text-[10px] leading-relaxed text-slate-400">The sampled pages did not provide enough evidence to identify a difference on this side.</p></div>}</div>
  </div>;
}

function ScoreStrip({ own, competitor, sites }: { own: ReportSite; competitor: ReportSite; sites: ReportSite[] }) {
  return <div className="grid gap-1 border-y border-[#e8ede4] bg-[#fbfcf8] p-2 sm:grid-cols-2">
    {[own, competitor].map((site) => <div key={site.domain} className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5"><span className="w-12 text-[10px] font-medium text-slate-400">{site.role === "own" ? "You" : "Them"}</span><div className="min-w-0 flex-1"><div className="h-1.5 overflow-hidden rounded-full bg-[#edf1e8]"><div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, site.score?.overall ?? 0))}%`, background: colorFor(sites, site.domain) }} /></div></div><b className="text-sm font-semibold text-[#4a6540]">{site.score?.overall ?? "—"}<span className="ml-1 text-[9px] font-normal text-slate-300">/100</span></b></div>)}
  </div>;
}

export default function HeadToHeadPanel({ report, runId, favicon }: { report: Report; runId: string; favicon?: (domain: string) => (() => Promise<Blob>) | null }) {
  const own = report.sites.find((s) => s.role === "own")!;
  const competitors = report.sites.filter((s) => s.role === "competitor");
  return <div className="space-y-1">
    <div className="rounded-2xl border border-[#e0e7da] bg-[#f7f9f2] p-3 md:p-4"><div className="flex items-start justify-between gap-2"><div><p className="mb-1 text-[9px] font-semibold tracking-wider text-[#94a282]">Compare the evidence</p><h3 className="text-base font-semibold tracking-tight text-[#405f32]">A closer look. A clearer difference.</h3><p className="mt-1 text-[11px] leading-relaxed text-slate-400">Website strengths on both sides, with the exact page that supports each finding.</p></div><span className="rounded-xl border border-[#e0e8d6] bg-white px-3 py-2 text-[10px] font-medium text-[#81976d]">{competitors.length} comparisons</span></div><div className="mt-3 flex flex-wrap gap-1">{competitors.map((site) => <button key={site.domain} type="button" onClick={() => document.getElementById(`h2h-${site.domain}`)?.scrollIntoView({ behavior: "smooth", block: "start" })} className="inline-flex items-center gap-1.5 rounded-lg border border-[#e0e7d9] bg-white px-2.5 py-1.5 text-[10px] text-slate-500 hover:bg-[#eef4e7]"><span className="h-1.5 w-1.5 rounded-full" style={{ background: colorFor(report.sites, site.domain) }} /><DisplayText text={site.siteName ?? site.domain} /><ChevronRight size={10} className="text-slate-300" /></button>)}</div></div>
    {competitors.map((competitor, i) => {
      const ai = report.ai?.result?.headToHead.find((h) => h.competitor === competitor.domain);
      const measured = report.measuredHeadToHead?.find((h) => h.competitor === competitor.domain);
      const useAi = !!ai && (ai.ownLeads.length > 0 || ai.competitorLeads.length > 0);
      const comparison = useAi ? ai : measured ?? ai;
      return <section key={competitor.domain} id={`h2h-${competitor.domain}`} data-analyzer-card className="scroll-mt-20 overflow-hidden rounded-2xl border border-[#dfe7d9] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 md:p-4">
          <div className="flex min-w-0 items-center gap-2.5"><SiteIcon cacheKey={`h2h:${runId}:${competitor.domain}`} load={favicon?.(competitor.domain) ?? null} domain={competitor.domain} /><div className="min-w-0"><p className="mb-0.5 text-[9px] text-slate-400">Comparison 0{i + 1}</p><h3 className="text-sm font-semibold text-[#35532d]"><DisplayText text={`Moksha vs ${competitor.siteName ?? competitor.domain}`} /></h3><p className="normal-case mt-0.5 text-[10px] text-slate-400">{competitor.domain}</p></div></div>
          <div className="rounded-xl border border-[#e6ecdf] bg-[#f8faf5] px-2.5 py-2"><p className="text-xs font-medium text-[#4e6441]">{useAi ? report.ai.grounding?.startsWith("extractive") ? "AI-selected, verified website excerpts." : "Historical AI interpretation · review against its source." : "Comparison from saved website evidence. Available even when AI analysis could not finish."}</p><p className="mt-0.5 text-xs text-slate-600">Measured website score · not service quality</p></div>
        </div>
        <ScoreStrip own={own} competitor={competitor} sites={report.sites} />
        {comparison ? <>
          <div className="grid gap-1 p-1 md:grid-cols-2"><FindingsColumn own extractive={useAi && !!report.ai.grounding?.startsWith("extractive")} name={own.siteName ?? "Moksha Voyage"} findings={comparison.ownLeads} /><FindingsColumn own={false} extractive={useAi && !!report.ai.grounding?.startsWith("extractive")} name={competitor.siteName ?? competitor.domain} findings={comparison.competitorLeads} /></div>
          {comparison.verdict && <div className="m-1 mt-0 flex items-start gap-2.5 rounded-xl border border-[#e9ede4] bg-[#fafbf7] p-3.5"><span className="mt-0.5 rounded-lg border border-[#e4eade] bg-white p-1.5 text-[#8b9b7c]"><Scale size={14} /></span><div><p className="mb-1 text-[9px] font-semibold text-[#8b9b7b]">Comparison takeaway</p><p className="text-[11px] leading-[1.85] text-[#7a8771]"><DisplayText text={comparison.verdict} /></p></div></div>}
        </> : <p className="p-5 text-xs text-slate-400">No supported comparison was saved for this website.</p>}
      </section>;
    })}
  </div>;
}
