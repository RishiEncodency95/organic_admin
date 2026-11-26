"use client";

import { Activity, ExternalLink, Info, ShieldCheck } from "lucide-react";
import type { Report } from "@/lib/competitorAnalyzerApi";
import { Badge } from "./ui";
import DisplayText from "./DisplayText";

export function EvidenceDiagnostics({ report: r }: { report: Report }) {
  const issues = r.quality.issues ?? [];
  const fallback = r.sites.filter((s) => s.coverage.status !== "complete").map((s) => ({ domain: s.domain, code: "coverage", message: `Pages Read: ${s.coverage.read}/${s.coverage.selected}. Missing Page Types: ${(s.coverage.missingPriorityKinds ?? []).join(", ") || "Not Recorded"}.`, nextStep: "Review The Study Scope And Page Budget Before Re-checking.", urls: [] }));
  const shown = issues.length ? issues : fallback;
  return <details data-evidence-diagnostics className="rounded-xl border border-amber-200 bg-amber-50/50 px-3 py-2 text-xs text-slate-700">
    <summary className="flex cursor-pointer flex-wrap items-center gap-2 font-medium"><ShieldCheck size={15} /><span>Evidence Quality</span><Badge value={r.quality.status} /><span>{r.quality.completeness}% Sample Coverage</span><span className="ml-auto text-xs text-slate-600">Reasons & Next Steps</span></summary>
    <p className="mt-3 leading-relaxed"><DisplayText text={r.quality.rule} /></p>
    <div className="mt-2 grid gap-1 md:grid-cols-2">{shown.map((i, n) => <div key={`${i.domain}:${i.code}:${n}`} className="min-w-0 rounded-lg border border-amber-100 bg-white p-3"><p className="normal-case break-all font-semibold text-slate-800">{i.domain}</p><p className="mt-1 leading-relaxed"><DisplayText text={i.message} /></p><p className="mt-2 font-medium text-emerald-800"><DisplayText text={i.nextStep ?? "Review The Affected Pages And Provider Health Before Re-checking."} /></p>{i.urls?.map((url) => <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="normal-case mt-1 flex items-center gap-1 break-all text-emerald-800 underline"><ExternalLink size={12} className="shrink-0" />{url}</a>)}</div>)}</div>
    {!shown.length && <p className="mt-2">No Sample Collection Issues Were Recorded.</p>}
    <p className="mt-2">Re-check Starts A New Run And May Use AI Budget When Enabled.</p>
  </details>;
}

export function AiUsagePanel({ report: r }: { report: Report }) {
  const ai = r.ai;
  const number = (value?: number | null) => value == null ? "Not Recorded" : value.toLocaleString("en-IN");
  return <details data-ai-usage className="rounded-xl border border-[#dce5dc] bg-white px-3 py-2 text-xs text-slate-700">
    <summary className="flex cursor-pointer flex-wrap items-center gap-2 font-medium"><Activity size={15} /><span>AI Usage For This Report</span><Badge value={ai?.status ?? "not_available"} /><span className="ml-auto text-slate-600">Tokens, Cost & Status</span></summary>
    <dl className="mt-3 grid grid-cols-2 gap-1 md:grid-cols-5">{[["Input Tokens", number(ai?.usage?.inputTokens)], ["Output Tokens", number(ai?.usage?.outputTokens)], ["Total Tokens", number(ai?.usage?.totalTokens)], ["Saved Output Limit", number(ai?.outputLimit)], ["Estimated Cost (USD)", ai?.costUsd == null ? "Not Available" : `$${ai.costUsd.toFixed(4)}`]].map(([label, value]) => <div key={label} className="rounded-lg bg-[#f3f6ef] p-2.5"><dt className="text-slate-600">{label}</dt><dd className="normal-case mt-1 font-semibold text-slate-800">{value}</dd></div>)}</dl>
    <p className="normal-case mt-2 break-all">Model: {ai?.model ?? "Not Recorded"}</p>
    {ai?.error && <p role="status" className="mt-2 rounded-lg bg-amber-50 p-2 leading-relaxed text-amber-900"><DisplayText text={ai.error} /></p>}
    <p className="mt-2 flex items-start gap-1.5 leading-relaxed text-slate-600"><Info size={13} className="mt-0.5 shrink-0" />Usage Covers This Comparison Call. Cost Is An Estimate From Saved Token Rates; Discovery And Translations Are Separate Calls. Historical Limits Are Shown Only When Saved.</p>
  </details>;
}

export function PageMatches({ report: r }: { report: Report }) {
  if (!r.pageComparisons?.length) return <p className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600">Service & City Page Matches Will Be Saved By The Updated Analyzer On The Next Run.</p>;
  return <details data-page-matches className="rounded-xl border border-[#dce5dc] bg-white p-3 text-xs text-slate-700"><summary className="cursor-pointer font-semibold">Matching Service & City Pages · {r.pageComparisons.filter((p) => p.ownPage && p.competitorPage).length}/{r.pageComparisons.length} Pairs Found</summary><p className="mt-2 leading-relaxed">Matched By Service Terms In URLs And Headings. A City Match Is Shown Only When Both Pages Name That Requested City. Price Scope Still Needs Review.</p><div className="mt-3 grid gap-1 lg:grid-cols-2">{r.pageComparisons.map((p) => <div key={`${p.competitor}:${p.service}`} className="min-w-0 rounded-lg border border-slate-200 p-3"><p className="font-semibold"><DisplayText text={`${p.service.replace(/_/g, " ")} · ${p.place ?? "City Match Not Established"}`} /></p><p className="normal-case mt-1 break-all text-slate-600">{p.competitor}</p><div className="mt-2 space-y-2">{[["Moksha", p.ownPage], ["Competitor", p.competitorPage]].map(([label, raw]) => { const page = raw as { url: string; title: string | null } | null; return <div key={String(label)}><span className="font-medium">{String(label)}: </span>{page ? <a className="normal-case break-all text-emerald-800 underline" href={page.url} target="_blank" rel="noopener noreferrer">{page.url}</a> : <span>Not Found In Sample</span>}</div>; })}</div></div>)}</div></details>;
}
