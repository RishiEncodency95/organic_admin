"use client";

import React from "react";
import { RefreshCw, Sparkles, History } from "lucide-react";
import { formatDateTime } from "../SeoBadges";

function DarkRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-3 border-b border-slate-700/40 py-2.5 text-[12.5px] last:border-0">
      <span className="font-semibold text-slate-400">{label}</span>
      <span className="min-w-0 break-words font-medium text-slate-100">{value ?? "—"}</span>
    </div>
  );
}

function SectionCard({ title, icon, children, note }: { title: string; icon: React.ReactNode; children: React.ReactNode; note?: string }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-[#1e293b] p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-3 border-b border-slate-700/70 pb-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-600/10 text-emerald-400 border border-emerald-500/30">
          {icon}
        </div>
        <div>
          <h4 className="text-[15px] font-bold text-white tracking-wide">{title}</h4>
          {note && <p className="text-[11px] text-slate-400 mt-0.5">{note}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

export function AuditAiFixesSection({
  aiLoading,
  aiState,
  generateAi,
}: {
  aiLoading: boolean;
  aiState: any;
  generateAi: (force: boolean) => Promise<void>;
}) {
  return (
    <section id="section-ai-fixes" className="scroll-mt-36 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-[11px] font-black text-white shadow-lg shadow-emerald-500/20">
            14
          </span>
          <h3 className="text-[17px] font-extrabold tracking-wide text-white uppercase">Automated Page Technical Audit</h3>
        </div>
      </div>

      <SectionCard
        title="Real-Time Full Page Audit & Actionable Fixes"
        icon={<Sparkles className="w-5 h-5 text-emerald-400" />}
        note="Comprehensive technical analysis evaluates crawled page metrics, title tag density, open graph schema, and structural hierarchy."
      >
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={aiLoading}
            onClick={() => void generateAi(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-[13px] font-black text-white shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            {aiLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-white" />
                <span>Running Deep Technical Page Audit...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-emerald-300" />
                <span>{aiState?.recommendation ? "Re-Run Full Technical Audit" : "⚡ Generate Full Audit Report"}</span>
              </>
            )}
          </button>

          {aiLoading && (
            <div className="flex items-center gap-2 text-[12px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-4 py-2.5 rounded-xl animate-pulse">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              Crawling live page facts & running multi-point technical audit...
            </div>
          )}
        </div>

        {aiState?.message && (
          <div className="mb-4 rounded-xl border border-amber-500/40 bg-amber-950/40 p-4 text-[12.5px] text-amber-200">
            {aiState.message}
          </div>
        )}

        {!aiLoading && !aiState?.recommendation && (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-8 text-center">
            <Sparkles className="mx-auto mb-3 h-10 w-10 text-emerald-400" />
            <h5 className="text-[14px] font-bold text-white">No Audit Report Generated Yet</h5>
            <p className="mt-1 text-[12px] text-slate-400">
              Click <strong>⚡ Generate Full Audit Report</strong> above for a deep, real-time technical analysis.
            </p>
          </div>
        )}

        {aiState?.recommendation?.summary && (
          <div className="mb-5 rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/80 to-slate-900/90 p-5 text-[13px] leading-relaxed text-emerald-200 shadow-xl">
            <p className="font-black text-white text-[14.5px] flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Strategic Executive Summary:
            </p>
            <p className="font-medium text-slate-200">{aiState.recommendation.summary}</p>
          </div>
        )}

        {/* Positive Signals Section (What's Working Well) */}
        {Array.isArray(aiState?.recommendation?.positiveSignals) && aiState.recommendation.positiveSignals.length > 0 && (
          <div className="mb-6 rounded-2xl border border-teal-500/30 bg-[#0f172a] p-5 shadow-lg">
            <h5 className="text-[13.5px] font-black uppercase tracking-wider text-teal-400 flex items-center gap-2 mb-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-500/20 text-teal-300 font-bold text-[11px]">✓</span>
              What's Working Well (Positive Signals)
            </h5>
            <div className="grid gap-2 sm:grid-cols-2">
              {aiState.recommendation.positiveSignals.map((sig: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2.5 rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-[12px] text-slate-200">
                  <span className="text-emerald-400 shrink-0 font-bold">✔</span>
                  <span>{sig}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <h5 className="text-[13.5px] font-black uppercase tracking-wider text-white mb-3">
          Actionable Technical Recommendations ({aiState?.recommendation?.items?.length ?? 0})
        </h5>

        {(aiState?.recommendation?.items ?? []).map((item: any, index: number) => (
          <div
            key={index}
            className="mb-4 rounded-2xl border border-slate-700/60 bg-[#0f172a] p-5 shadow-xl transition-all hover:border-emerald-500/60"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
              <span className="text-[14px] font-bold text-white">{item.title}</span>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-0.5 text-[10.5px] font-black uppercase tracking-wider ${
                    item.priority === "high" ? "bg-red-500/20 text-red-300 border border-red-500/40" : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  }`}
                >
                  {item.priority} Priority
                </span>
                {item.ruleId && (
                  <span className="rounded-md bg-slate-800 border border-slate-700 px-2 py-0.5 font-mono text-[10.5px] font-bold text-slate-300">
                    {item.ruleId}
                  </span>
                )}
              </div>
            </div>
            <p className="mb-2 text-[12px] leading-relaxed text-slate-300">
              <strong className="text-white">Why it matters:</strong> {item.whyItMatters}
            </p>
            <p className="mb-3 text-[12px] leading-relaxed text-slate-100">
              <strong className="text-emerald-400">Recommended Fix:</strong> {item.recommendedFix}
            </p>

            {item.implementation && (
              <div className="my-3 overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
                <div className="bg-slate-900 border-b border-slate-800 px-4 py-1.5 text-[10.5px] font-bold text-slate-300 uppercase tracking-wider">
                  Suggested Code Implementation
                </div>
                <pre className="p-4 text-[11.5px] font-mono text-cyan-300 whitespace-pre-wrap break-words max-w-full">
                  {item.implementation}
                </pre>
              </div>
            )}

            {item.suggestedTitle && (
              <DarkRow label="Suggested Title" value={<span className="font-bold text-emerald-300">{item.suggestedTitle}</span>} />
            )}
            {item.suggestedDescription && (
              <DarkRow label="Suggested Meta" value={<span className="text-slate-200">{item.suggestedDescription}</span>} />
            )}
            {(item.headingSuggestions ?? []).length > 0 && (
              <DarkRow label="Heading Ideas" value={item.headingSuggestions.join(" · ")} />
            )}
            {(item.internalLinkSuggestions ?? []).length > 0 && (
              <DarkRow
                label="Internal Links"
                value={item.internalLinkSuggestions
                  .map((link: any) => `${link.anchorText} → ${link.fromOrTo}`)
                  .join(" · ")}
              />
            )}
          </div>
        ))}

        {aiState?.recommendation && (
          <div className="mt-4 flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span>Audit Status: Active Enterprise Crawl Inspection</span>
            <span>Generated: {formatDateTime(aiState.recommendation.generatedAt)}</span>
          </div>
        )}
      </SectionCard>
    </section>
  );
}

export function AuditHistorySection({ history }: { history: any[] }) {
  return (
    <section id="section-history" className="scroll-mt-36 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-[11px] font-black text-white shadow-lg shadow-blue-500/20">
            15
          </span>
          <h3 className="text-[17px] font-extrabold tracking-wide text-white uppercase">Historical Audit Logs</h3>
        </div>
        <span className="text-[11px] font-semibold text-blue-400 bg-blue-950/60 border border-blue-800/60 px-3 py-1 rounded-full">
          Snapshot Timeline
        </span>
      </div>

      <SectionCard title="Audit History Timeline" icon={<History className="w-5 h-5" />} note="One row per completed audit that included this URL.">
        {(history ?? []).length === 0 ? (
          <p className="text-[13px] text-slate-400">No historical snapshots recorded yet for this page.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-700/60 bg-[#0f172a]/70">
            <table className="w-full text-[12.5px]">
              <thead className="bg-[#1e293b]/80 border-b border-slate-700/60 text-slate-300">
                <tr>
                  <th className="py-2.5 px-4 text-left font-bold">Crawl Date</th>
                  <th className="py-2.5 px-4 text-right font-bold">SEO Score</th>
                  <th className="py-2.5 px-4 text-right font-bold">Issues</th>
                  <th className="py-2.5 px-4 text-right font-bold">Words</th>
                  <th className="py-2.5 px-4 text-right font-bold">Clicks</th>
                  <th className="py-2.5 px-4 text-right font-bold">Avg Position</th>
                </tr>
              </thead>
              <tbody>
                {(history ?? []).map((entry: any, idx: number) => (
                  <tr key={entry.capturedAt} className={`border-b border-slate-800/60 hover:bg-slate-800/40 ${idx % 2 === 0 ? "bg-slate-900/30" : ""}`}>
                    <td className="py-2.5 px-4 text-slate-100 font-semibold">{formatDateTime(entry.capturedAt)}</td>
                    <td className="py-2.5 px-4 text-right tabular-nums font-black text-emerald-400">
                      {entry.score ?? "—"}
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-red-400 font-bold">
                      {entry.issueCounts?.total ?? 0}
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-slate-400">{entry.wordCount ?? 0}</td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-slate-400">{entry.clicks ?? "—"}</td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-blue-400 font-bold">
                      {entry.position ? entry.position.toFixed(1) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </section>
  );
}
