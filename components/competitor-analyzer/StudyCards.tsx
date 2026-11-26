"use client";

import Link from "next/link";
import { Archive, ArrowUpRight, CalendarClock, RotateCcw, Target } from "lucide-react";
import type { Study } from "@/lib/competitorAnalyzerApi";
import { reportFiles } from "@/lib/competitorAnalyzerApi";
import { Badge, btnGhost, fmtDate, ScoreBar } from "./ui";
import SiteIcon from "./SiteIcon";

export default function StudyCards({ studies, busyId, canManage, onArchive, onRestore }: { studies: Study[]; busyId: string; canManage: boolean; onArchive: (s: Study) => void; onRestore: (s: Study) => void }) {
  return <div className="grid gap-1 xl:grid-cols-2">{studies.map((study) => {
    const archived = study.status === "archived";
    const active = !!study.latestRun && ["queued", "running"].includes(study.latestRun.status);
    const own = study.latestSuccessfulRun?.report?.sites.find((s) => s.role === "own" || s.domain === study.ownDomain);
    const competitors = study.competitors.slice(0, 4);
    const busy = busyId === study._id;
    const scope = [...study.serviceFocus.map((s) => s.replace(/[_-]/g, " ")), ...study.geography.places].join(" · ") || "All sampled services";
    return <article data-analyzer-card key={study._id} className={`min-w-0 overflow-hidden rounded-2xl border ${archived ? "border-slate-200 bg-slate-50/60" : "border-[#e0e7dc] bg-[#fcfdf9]"}`}>
      <div className="flex items-center gap-2 border-b border-[#e8ede3] px-3 py-2">
        <SiteIcon cacheKey={`study:${study._id}`} load={() => reportFiles.studyIcon(study._id)} domain={study.ownDomain} />
        <div className="min-w-0 flex-1"><Link href={`/competitor-analyzer/${study._id}`} title={study.name} className="block truncate text-[13px] font-semibold leading-snug text-[#365335] hover:text-emerald-700">{study.name}</Link><p className="normal-case mt-0.5 truncate text-[10px] text-slate-400">{study.ownDomain}</p></div>
        <Badge value={archived ? "archived" : active ? study.latestRun!.status : "active"} label={archived ? "Archived" : active ? study.latestRun!.status : "Active"} />
      </div>
      <div className="space-y-1 px-2 py-1.5">
        <div className="grid grid-cols-3 divide-x divide-[#e8ede1] rounded-lg bg-white px-1 py-1.5">
          <div className="min-w-0 px-2"><p className="mb-1 text-[9px] text-[#91a083]">Website score</p><ScoreBar compact value={own?.score?.overall ?? null} /></div>
          <div className="min-w-0 px-2"><p className="mb-1 text-[9px] text-[#91a083]">Comparison set</p><p className="text-[11px] font-semibold text-[#586e48]">{competitors.length} competitors</p></div>
          <div className="min-w-0 px-2"><p className="mb-1 text-[9px] text-[#91a083]">Evidence</p>{study.latestSuccessfulRun?.quality ? <Badge value={study.latestSuccessfulRun.quality.status} /> : <span className="text-[10px] text-slate-400">Not checked</span>}</div>
        </div>
        <div className="rounded-lg border border-[#e9eee3] bg-white/80 px-2 py-1.5"><div className="flex flex-wrap items-center gap-1"><span className="mr-1 text-[9px] font-medium text-[#8d9c7e]">Compared</span>{competitors.map((c, i) => <span key={c.domain} className="normal-case inline-flex max-w-full items-center gap-1 rounded-md border border-[#e6ebdf] bg-[#f8faf5] px-1.5 py-0.5 text-[10px] text-[#79886a]"><span className="shrink-0 text-[8px] text-[#a4b096]">{i + 1}</span><span className="truncate" title={c.domain}>{c.domain}</span></span>)}</div>{study.competitors.length > 4 && <p className="mt-1 text-[9px] text-slate-400">{study.competitors.length - 4} more saved · next run uses 4 maximum</p>}</div>
        <div className="flex min-w-0 items-center gap-1.5 rounded-lg bg-[#f2f6ed] px-2 py-1 text-[10px] text-[#849476]"><Target size={11} className="shrink-0" /><span className="truncate" title={scope}>{scope}</span></div>
        <div className="grid grid-cols-2 gap-1"><div className="min-w-0 px-2 py-1"><p className="flex items-center gap-1 text-[9px] text-slate-400"><CalendarClock size={10} /> Last report</p><p className="mt-0.5 text-[10px] font-medium text-slate-600">{study.latestSuccessfulRun ? fmtDate(study.latestSuccessfulRun.finishedAt) : "No completed report"}</p></div><div className="min-w-0 px-2 py-1"><p className="text-[9px] text-slate-400">Latest attempt</p><div className="mt-0.5 flex flex-wrap items-center gap-1">{study.latestRun ? <><Badge value={study.latestRun.status} /><span className="text-[9px] text-slate-400">{fmtDate(study.latestRun.createdAt)}</span></> : <span className="text-[10px] text-slate-400">Not started</span>}</div></div></div>
      </div>
      <div className="flex items-center justify-between gap-1 border-t border-[#e8ede3] bg-white px-2 py-1">
        {canManage ? <button type="button" className={`${btnGhost} !min-h-7 !border-transparent !py-1 !text-[10px] !text-slate-400 hover:!text-[#5b7249]`} disabled={busy || active} onClick={() => archived ? onRestore(study) : onArchive(study)} title={active ? "Stop the active analysis before archiving" : undefined}>{archived ? <RotateCcw size={13} /> : <Archive size={13} />}{busy ? "Updating…" : archived ? "Restore study" : "Archive study"}</button> : <span />}
        <Link href={`/competitor-analyzer/${study._id}`} className="inline-flex items-center gap-1.5 rounded-lg bg-[#edf3e6] px-3 py-1.5 text-[10px] font-semibold text-[#5a7542] hover:bg-[#e2ecd6]">{archived ? "View saved report" : "Open study"}<ArrowUpRight size={13} /></Link>
      </div>
    </article>;
  })}</div>;
}
