"use client";

import React from "react";
import { Code2 } from "lucide-react";
import { StatusChip } from "../SeoBadges";

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-gradient-to-b from-[#182238] to-[#121a2c] p-6 shadow-xl backdrop-blur-md">
      <div className="flex items-center gap-3 mb-3 border-b border-slate-700/50 pb-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/10 text-indigo-400 border border-indigo-500/30">
          {icon}
        </div>
        <h4 className="text-[15px] font-bold text-white tracking-wide">{title}</h4>
      </div>
      {children}
    </div>
  );
}

export default function AuditSchemaSection({ page }: { page: any }) {
  if (!page) return null;

  return (
    <section id="section-schema" className="scroll-mt-36 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-[11px] font-black text-white shadow-lg shadow-indigo-500/20">
            09
          </span>
          <h3 className="text-[17px] font-extrabold tracking-wide text-white uppercase">Schema & Rich Snippets</h3>
        </div>
        <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-3 py-1 rounded-full">
          JSON-LD Structured Data
        </span>
      </div>

      <SectionCard title="JSON-LD Structured Data Validation" icon={<Code2 className="w-5 h-5" />}>
        {(page?.schemas ?? []).length === 0 ? (
          <p className="text-[13px] text-slate-400">No JSON-LD structured data blocks found on this page.</p>
        ) : (
          (page?.schemas ?? []).map((block: any, index: number) => (
            <div key={index} className="mb-3 rounded-xl border border-slate-700/60 bg-[#0f172a]/70 p-4 last:mb-0">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-[13px] font-bold text-white">
                  {(block.types ?? []).join(", ") || "Unknown Schema Type"}
                </span>
                <StatusChip value={block.valid ? "valid" : "invalid"} />
              </div>
              {(block.errors ?? []).map((issue: string) => (
                <p key={issue} className="text-[11.5px] text-red-400 font-semibold mt-1">
                  • Error: {issue}
                </p>
              ))}
              {(block.warnings ?? []).map((issue: string) => (
                <p key={issue} className="text-[11.5px] text-amber-400 font-medium mt-1">
                  • Warning: {issue}
                </p>
              ))}
            </div>
          ))
        )}

        {(page?.breadcrumbIssues ?? []).length > 0 && (
          <div className="mt-4 border-t border-slate-700/60 pt-3">
            <span className="text-[13px] font-bold text-white block mb-1">Breadcrumb Issues</span>
            {(page?.breadcrumbIssues ?? []).map((issue: string) => (
              <p key={issue} className="text-[11.5px] text-red-400 font-semibold">
                • {issue}
              </p>
            ))}
          </div>
        )}
      </SectionCard>
    </section>
  );
}
