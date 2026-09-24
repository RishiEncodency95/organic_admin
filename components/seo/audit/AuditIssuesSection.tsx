"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { formatDateTime, SeverityBadge } from "../SeoBadges";

function SectionCard({ title, icon, children, note }: { title: string; icon: React.ReactNode; children: React.ReactNode; note?: string }) {
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-gradient-to-b from-[#182238] to-[#121a2c] p-6 shadow-xl backdrop-blur-md">
      <div className="flex items-center gap-3 mb-3 border-b border-slate-700/50 pb-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-red-500/20 to-rose-600/10 text-red-400 border border-red-500/30">
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

export default function AuditIssuesSection({ issues }: { issues: any[] }) {
  return (
    <section id="section-issues" className="scroll-mt-36 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-r from-red-500 to-rose-600 text-[11px] font-black text-white shadow-lg shadow-red-500/20">
            13
          </span>
          <h3 className="text-[17px] font-extrabold tracking-wide text-white uppercase">Detected SEO Issues</h3>
        </div>
        <span className="text-[11px] font-semibold text-red-400 bg-red-950/60 border border-red-800/60 px-3 py-1 rounded-full">
          Rules Engine Audit ({issues?.length ?? 0} Issues)
        </span>
      </div>

      <SectionCard
        title={`Audit Issues List (${issues?.length ?? 0})`}
        icon={<AlertCircle className="w-5 h-5" />}
        note="Every issue below was detected by the rules engine from crawled facts."
      >
        {(issues ?? []).length === 0 ? (
          <p className="text-[13px] text-emerald-300 font-bold bg-emerald-950/40 p-4 rounded-xl border border-emerald-800/60 flex items-center gap-2">
            <span className="text-emerald-400 font-black">✓</span> No open SEO issues detected on this page!
          </p>
        ) : (
          <div className="space-y-3">
            {(issues ?? []).map((issue: any) => (
              <div
                key={issue.id}
                className="border border-slate-700/60 bg-[#0f172a]/70 p-4 rounded-xl hover:border-red-500/50 transition-colors"
              >
                <div className="mb-1.5 flex flex-wrap items-center gap-2.5">
                  <SeverityBadge severity={issue.severity} />
                  <span className="text-[13.5px] font-bold text-white">{issue.title}</span>
                  <span className="rounded-md bg-slate-800 border border-slate-700/60 px-2 py-0.5 font-mono text-[10.5px] font-bold text-slate-300">
                    {issue.ruleId}
                  </span>
                </div>
                <p className="text-[12px] text-slate-300 leading-relaxed mt-1">{issue.detail}</p>
                <p className="mt-2 text-[10.5px] font-medium text-slate-400">
                  First detected: {formatDateTime(issue.firstSeenAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </section>
  );
}
