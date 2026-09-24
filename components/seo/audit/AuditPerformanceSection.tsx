"use client";

import React from "react";
import { Zap } from "lucide-react";
import { formatDateTime, formatMs, formatNumber, ScorePill } from "../SeoBadges";

function DarkRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-3 border-b border-slate-700/40 py-2.5 text-[12.5px] last:border-0">
      <span className="font-semibold text-slate-400">{label}</span>
      <span className="min-w-0 break-words font-medium text-slate-100">{value ?? "—"}</span>
    </div>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-[#1e293b] p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-3 border-b border-slate-700/70 pb-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-lime-500/20 to-emerald-600/10 text-lime-400 border border-lime-500/30">
          {icon}
        </div>
        <h4 className="text-[15px] font-bold text-white tracking-wide">{title}</h4>
      </div>
      {children}
    </div>
  );
}

export default function AuditPerformanceSection({ performance }: { performance: any }) {
  return (
    <section id="section-performance" className="scroll-mt-36 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-r from-lime-500 to-emerald-600 text-[11px] font-black text-white shadow-lg shadow-lime-500/20">
            10
          </span>
          <h3 className="text-[17px] font-extrabold tracking-wide text-white uppercase">Performance & Core Web Vitals</h3>
        </div>
        <span className="text-[11px] font-semibold text-lime-400 bg-lime-950/60 border border-lime-800/60 px-3 py-1 rounded-full">
          Lighthouse & PageSpeed Insights
        </span>
      </div>

      {(performance?.audits ?? []).length === 0 ? (
        <SectionCard title="Lighthouse Audit Status" icon={<Zap className="w-5 h-5" />}>
          <p className="text-[13px] text-slate-400">
            No PageSpeed Insights audit has been run for this URL. Audits run for a configurable set of important pages.
          </p>
        </SectionCard>
      ) : (
        (performance?.audits ?? []).map((audit: any) => (
          <SectionCard key={audit.id} title={`Lighthouse Audit — ${audit.strategy}`} icon={<Zap className="w-5 h-5" />}>
            {audit.status === "error" ? (
              <p className="text-[13px] text-red-400 font-bold">{audit.error}</p>
            ) : (
              <>
                <div className="mb-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Performance", value: audit.lab.performance },
                    { label: "Accessibility", value: audit.lab.accessibility },
                    { label: "Best Practices", value: audit.lab.bestPractices },
                    { label: "SEO Score", value: audit.lab.seo },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-slate-900/60 border border-slate-700/60 py-4 shadow-inner"
                    >
                      <ScorePill score={item.value} size="lg" />
                      <span className="text-[11.5px] font-bold text-slate-300 mt-1">{item.label}</span>
                    </div>
                  ))}
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-4">
                    <h5 className="mb-1 text-[13.5px] font-bold text-white">Lab Metrics (Lighthouse)</h5>
                    <p className="mb-2 text-[10.5px] text-slate-400">{performance?.labNote}</p>
                    <DarkRow label="LCP" value={formatMs(audit.lab.lcpMs)} />
                    <DarkRow label="CLS" value={audit.lab.clsScore?.toFixed(3) ?? "—"} />
                    <DarkRow label="TBT" value={formatMs(audit.lab.tbtMs)} />
                    <DarkRow label="FCP" value={formatMs(audit.lab.fcpMs)} />
                    <DarkRow label="Speed Index" value={formatMs(audit.lab.speedIndexMs)} />
                    <DarkRow label="Server / TTFB" value={formatMs(audit.lab.serverResponseMs)} />
                    <DarkRow
                      label="Transferred"
                      value={
                        audit.lab.totalByteWeight == null
                          ? "Not available"
                          : `${formatNumber(audit.lab.totalByteWeight)} bytes`
                      }
                    />
                    <DarkRow label="Resources" value={audit.lab.resourceCount ?? "Not available"} />
                  </div>

                  <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-4">
                    <h5 className="mb-1 text-[13.5px] font-bold text-white">Field Data (CrUX Real Users)</h5>
                    <p className="mb-2 text-[10.5px] text-slate-400">{performance?.fieldNote}</p>
                    {audit.field.available ? (
                      <>
                        <DarkRow label="Source" value={audit.field.source === "url" ? "This URL" : "Origin"} />
                        <DarkRow label="LCP" value={formatMs(audit.field.lcpMs as number | null)} />
                        <DarkRow
                          label="CLS"
                          value={
                            audit.field.clsScore == null ? "—" : (audit.field.clsScore as number).toFixed(3)
                          }
                        />
                        <DarkRow label="INP" value={formatMs(audit.field.inpMs as number | null)} />
                        <DarkRow label="FCP" value={formatMs(audit.field.fcpMs as number | null)} />
                        <DarkRow label="TTFB" value={formatMs(audit.field.ttfbMs as number | null)} />
                      </>
                    ) : (
                      <p className="text-[12.5px] text-slate-400">
                        Not available — Google has no Chrome UX Report sample for this URL yet.
                      </p>
                    )}
                  </div>
                </div>

                {audit.opportunities.length > 0 && (
                  <div className="mt-4 border-t border-slate-700/60 pt-3">
                    <h5 className="mb-2 text-[13.5px] font-bold text-white">Performance Opportunities</h5>
                    {audit.opportunities.map((opportunity: any) => (
                      <div
                        key={opportunity.id}
                        className="flex justify-between border-b border-slate-800/60 py-2 text-[12px] last:border-0"
                      >
                        <span className="text-slate-200 font-medium">{opportunity.title}</span>
                        <span className="tabular-nums font-bold text-orange-400">
                          {formatMs(opportunity.savingsMs)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <p className="mt-3 text-[11px] text-slate-400">
                  Measured {formatDateTime(audit.fetchedAt)}
                  {audit.lighthouseVersion ? ` · Lighthouse ${audit.lighthouseVersion}` : ""}
                </p>
              </>
            )}
          </SectionCard>
        ))
      )}
    </section>
  );
}
