"use client";

import React from "react";
import { Activity, ShieldCheck, Layers } from "lucide-react";
import { HttpStatusBadge, formatDateTime, formatMs, formatNumber, ScorePill } from "../SeoBadges";

function DarkRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-3 border-b border-slate-700/60 py-2.5 text-[13px] last:border-0">
      <span className="font-semibold text-slate-300">{label}</span>
      <span className={`min-w-0 break-words font-semibold text-white ${mono ? "font-mono text-[12px] text-cyan-300" : ""}`}>
        {value ?? "—"}
      </span>
    </div>
  );
}

function SectionCard({ title, icon, children, note }: { title: string; icon: React.ReactNode; children: React.ReactNode; note?: string }) {
  return (
    <div className="rounded-2xl border border-slate-700/80 bg-[#1e293b] p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-3 border-b border-slate-700/70 pb-3">
        <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
          {icon}
        </div>
        <div>
          <h4 className="text-[15px] font-bold text-white tracking-wide">{title}</h4>
          {note && <p className="text-[11.5px] text-slate-300 mt-0.5">{note}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

export default function AuditOverviewSection({ page }: { page: any }) {
  if (!page) return null;

  return (
    <section id="section-overview" className="scroll-mt-36 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-700 pb-3">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-[12px] font-black text-slate-950 shadow-md">
            01
          </span>
          <h3 className="text-[17px] font-extrabold tracking-wide text-white uppercase">Overview Audit</h3>
        </div>
        <span className="text-[11.5px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-700/80 px-3.5 py-1 rounded-full">
          Crawl & Structure Metrics
        </span>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <SectionCard title="Crawl & Index Health" icon={<Activity className="w-5 h-5" />}>
          <DarkRow label="HTTP Status" value={<HttpStatusBadge status={page.httpStatus} />} />
          <DarkRow
            label="Indexable"
            value={
              page.indexable ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11.5px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/50">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Indexable
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11.5px] font-bold bg-red-500/20 text-red-300 border border-red-500/50">
                  No — {page.indexabilityReason ?? "not indexable"}
                </span>
              )
            }
          />
          <DarkRow label="Content Type" value={page.contentType} />
          <DarkRow label="Response Time" value={formatMs(page.responseTimeMs)} />
          <DarkRow label="Crawled At" value={formatDateTime(page.lastCrawledAt)} />
          <DarkRow label="In Sitemap" value={page.inSitemap ? "Yes ✓" : "No ✕"} />
          {page.redirected && <DarkRow label="Final URL" value={page.finalUrl} mono />}
          {page.fetchError && <DarkRow label="Fetch Error" value={page.fetchError} />}
        </SectionCard>

        <SectionCard title="Page Architecture" icon={<Layers className="w-5 h-5" />}>
          <DarkRow label="Word Count" value={formatNumber(page.wordCount)} />
          <DarkRow label="Crawl Depth" value={page.depth ?? "Not reachable from home"} />
          <DarkRow
            label="Internal Inbound"
            value={page.isOrphan ? `${page.inLinks} — Orphan Page` : page.inLinks}
          />
          <DarkRow label="Internal Outbound" value={page.outLinks} />
          <DarkRow label="Broken Links" value={page.brokenLinks} />
          <DarkRow label="Language" value={page.lang} />
        </SectionCard>
      </div>

      <SectionCard
        title="SEO Score Breakdown"
        icon={<ShieldCheck className="w-5 h-5" />}
        note="Each open issue subtracts a fixed penalty by severity. Categories with no data are not scored."
      >
        {(page.scoreBreakdown ?? []).length === 0 ? (
          <p className="text-[13px] text-emerald-300 font-bold bg-emerald-950/60 p-3.5 rounded-xl border border-emerald-700/60">
            ✓ Excellent! No penalties — this page has zero open issues.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {(page.scoreBreakdown ?? []).map((entry: { category: string; score: number | null }) => (
              <div
                key={entry.category}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-900/80 p-3 shadow-sm"
              >
                <span className="text-[12.5px] font-bold capitalize text-slate-100">{entry.category}</span>
                <ScorePill score={entry.score} />
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </section>
  );
}
