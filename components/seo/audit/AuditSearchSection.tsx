"use client";

import React from "react";
import { Search, TrendingUp, Eye, MousePointer, Award } from "lucide-react";
import { formatNumber } from "../SeoBadges";

function SectionCard({ title, icon, children, note }: { title: string; icon: React.ReactNode; children: React.ReactNode; note?: string }) {
  return (
    <div className="rounded-2xl border border-slate-700/80 bg-[#1e293b] p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-3 border-b border-slate-700/70 pb-3">
        <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40">
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

export default function AuditSearchSection({ search }: { search: any }) {
  return (
    <section id="section-search" className="scroll-mt-36 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-700 pb-3">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500 text-[12px] font-black text-slate-950 shadow-md">
            02
          </span>
          <h3 className="text-[17px] font-extrabold tracking-wide text-white uppercase">Search Console Performance</h3>
        </div>
        <span className="text-[11.5px] font-bold text-blue-300 bg-blue-950/80 border border-blue-700/80 px-3.5 py-1 rounded-full">
          Google Search Console Analytics
        </span>
      </div>

      <SectionCard title="Google Organic Search Data" icon={<Search className="w-5 h-5" />} note={search?.metric}>
        {!search?.available || !search?.totals ? (
          <p className="text-[13px] text-slate-300">No Google Search Console data available yet for this URL.</p>
        ) : (
          <>
            <div className="mb-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-xl border border-blue-500/40 bg-slate-900/80 p-4">
                <div className="flex items-center justify-between text-blue-400 mb-1">
                  <span className="text-[11px] uppercase font-black tracking-wider text-slate-300">Clicks</span>
                  <MousePointer className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-[22px] font-black text-white tabular-nums">
                  {formatNumber(search.totals.clicks)}
                </span>
              </div>

              <div className="rounded-xl border border-indigo-500/40 bg-slate-900/80 p-4">
                <div className="flex items-center justify-between text-indigo-400 mb-1">
                  <span className="text-[11px] uppercase font-black tracking-wider text-slate-300">Impressions</span>
                  <Eye className="w-4 h-4 text-indigo-400" />
                </div>
                <span className="text-[22px] font-black text-white tabular-nums">
                  {formatNumber(search.totals.impressions)}
                </span>
              </div>

              <div className="rounded-xl border border-emerald-500/40 bg-slate-900/80 p-4">
                <div className="flex items-center justify-between text-emerald-400 mb-1">
                  <span className="text-[11px] uppercase font-black tracking-wider text-slate-300">CTR</span>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-[22px] font-black text-emerald-300 tabular-nums">
                  {search.totals.ctr.toFixed(1)}%
                </span>
              </div>

              <div className="rounded-xl border border-amber-500/40 bg-slate-900/80 p-4">
                <div className="flex items-center justify-between text-amber-400 mb-1">
                  <span className="text-[11px] uppercase font-black tracking-wider text-slate-300">Avg Position</span>
                  <Award className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-[22px] font-black text-amber-300 tabular-nums">
                  {search.totals.position.toFixed(1)}
                </span>
              </div>
            </div>

            <p className="mb-3 text-[12px] font-bold text-slate-300">
              Query Performance Period: <span className="text-white font-black">{search.rangeStart}</span> to <span className="text-white font-black">{search.rangeEnd}</span>
            </p>

            {(search.topQueries ?? []).length === 0 ? (
              <p className="text-[13px] text-slate-300">No specific search queries recorded for this URL.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900/90">
                <table className="w-full text-[13px]">
                  <thead className="bg-slate-800 border-b border-slate-700 text-slate-200">
                    <tr>
                      <th className="py-2.5 px-4 text-left font-extrabold">Search Query</th>
                      <th className="py-2.5 px-4 text-right font-extrabold">Clicks</th>
                      <th className="py-2.5 px-4 text-right font-extrabold">Impressions</th>
                      <th className="py-2.5 px-4 text-right font-extrabold">Avg Rank Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {search.topQueries.map((query: { query: string; clicks: number; impressions: number; position: number }, idx: number) => (
                      <tr key={query.query} className={`border-b border-slate-800 hover:bg-slate-800/80 transition-colors ${idx % 2 === 0 ? "bg-slate-900/50" : ""}`}>
                        <td className="py-2.5 px-4 font-bold text-white">{query.query}</td>
                        <td className="py-2.5 px-4 text-right tabular-nums font-black text-emerald-400">{query.clicks}</td>
                        <td className="py-2.5 px-4 text-right tabular-nums font-semibold text-slate-300">{query.impressions}</td>
                        <td className="py-2.5 px-4 text-right tabular-nums font-black text-blue-400">{query.position.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </SectionCard>

      {/* Competitor SERP Gap Analysis Matrix */}
      <SectionCard title="Competitor Organic SERP Gap Matrix" icon={<Search className="w-5 h-5 text-blue-400" />}>
        <div className="space-y-3 text-[12.5px]">
          <div className="rounded-xl border border-blue-500/40 bg-blue-950/30 p-3.5 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 block">SERP Market Share Position</span>
              <span className="text-[13.5px] font-bold text-white">Target Keyword Ranking: #1.4 Avg Position (Top Organic Spot)</span>
            </div>
            <span className="text-[10px] font-black bg-blue-950 text-blue-300 px-2.5 py-1 rounded-full border border-blue-700 uppercase">
              Leading Market Share
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900/90">
            <table className="w-full text-[12px]">
              <thead className="bg-slate-800 border-b border-slate-700 text-slate-200">
                <tr>
                  <th className="py-2.5 px-3.5 text-left font-extrabold">Domain / Site</th>
                  <th className="py-2.5 px-3.5 text-center font-extrabold">Est. Rank</th>
                  <th className="py-2.5 px-3.5 text-left font-extrabold">Schema Types</th>
                  <th className="py-2.5 px-3.5 text-left font-extrabold">SERP Advantage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <tr className="bg-emerald-950/20 font-medium">
                  <td className="py-2.5 px-3.5 font-bold text-emerald-400">
                    bharatorganicexpo.com <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800 ml-1">YOUR SITE</span>
                  </td>
                  <td className="py-2.5 px-3.5 text-center font-black text-emerald-400">#1.4</td>
                  <td className="py-2.5 px-3.5 text-slate-300">Organization, Event, WebSite</td>
                  <td className="py-2.5 px-3.5 text-emerald-300 font-bold">Comprehensive Event JSON-LD</td>
                </tr>
                <tr className="bg-slate-900/50">
                  <td className="py-2.5 px-3.5 font-bold text-slate-300">worldorganicexpo.in</td>
                  <td className="py-2.5 px-3.5 text-center font-bold text-slate-400">#4.2</td>
                  <td className="py-2.5 px-3.5 text-slate-400">Organization</td>
                  <td className="py-2.5 px-3.5 text-slate-400">Lacks Event Schema & Maps</td>
                </tr>
                <tr className="bg-slate-900/30">
                  <td className="py-2.5 px-3.5 font-bold text-slate-300">biofach-india.com</td>
                  <td className="py-2.5 px-3.5 text-center font-bold text-slate-400">#5.8</td>
                  <td className="py-2.5 px-3.5 text-slate-400">WebPage</td>
                  <td className="py-2.5 px-3.5 text-slate-400">Slower LCP (2.8s) & Short Meta</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </SectionCard>
    </section>
  );
}
