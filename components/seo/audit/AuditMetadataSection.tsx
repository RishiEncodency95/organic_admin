"use client";

import React from "react";
import { FileCode, Tag } from "lucide-react";
import { StatusChip } from "../SeoBadges";

function DarkRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-3 border-b border-slate-700/40 py-2.5 text-[12.5px] last:border-0">
      <span className="font-semibold text-slate-400">{label}</span>
      <span className={`min-w-0 break-words font-medium text-slate-100 ${mono ? "font-mono text-[11.5px] text-purple-300" : ""}`}>
        {value ?? "—"}
      </span>
    </div>
  );
}

function SectionCard({ title, icon, children, note }: { title: string; icon: React.ReactNode; children: React.ReactNode; note?: string }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-[#1e293b] p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-3 border-b border-slate-700/70 pb-3">
        <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
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

export default function AuditMetadataSection({ page }: { page: any }) {
  if (!page) return null;

  return (
    <section id="section-metadata" className="scroll-mt-36 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-violet-600 text-[11px] font-black text-white shadow-lg shadow-purple-500/20">
            03
          </span>
          <h3 className="text-[17px] font-extrabold tracking-wide text-white uppercase">Metadata & Directives</h3>
        </div>
        <span className="text-[11px] font-semibold text-purple-400 bg-purple-950/60 border border-purple-800/60 px-3 py-1 rounded-full">
          Meta Tags & Canonicals
        </span>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <SectionCard title="Meta Title & Description" icon={<FileCode className="w-5 h-5" />}>
          <DarkRow
            label="Title"
            value={
              <span className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-white">{page.title ?? "Missing"}</span>
                <StatusChip value={page.titleStatus} title={`${page.titleLength} characters`} />
              </span>
            }
          />
          <DarkRow
            label="Description"
            value={
              <span className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-200">{page.metaDescription ?? "Missing"}</span>
                <StatusChip
                  value={page.descriptionStatus}
                  title={`${page.metaDescriptionLength} characters`}
                />
              </span>
            }
          />
          <DarkRow label="Meta Robots" value={page.metaRobots ?? "Not set (defaults to index,follow)"} />
          <DarkRow label="Viewport" value={page.viewport} />
        </SectionCard>

        <SectionCard title="Canonical Tags" icon={<Tag className="w-5 h-5" />}>
          <DarkRow label="Declared" value={page.canonical} mono />
          <DarkRow label="Resolves To" value={page.canonicalNormalized} mono />
          <DarkRow label="Status" value={<StatusChip value={page.canonicalStatus} />} />
          <DarkRow label="Tags Found" value={page.canonicalCount} />
        </SectionCard>
      </div>

      <SectionCard
        title="Meta Keywords Analysis"
        icon={<Tag className="w-5 h-5" />}
        note="Modern Google Search does not use this tag as a ranking signal. It does not affect the SEO score."
      >
        <DarkRow label="Detected" value={page.metaKeywords ? "Yes" : "No"} />
        <DarkRow label="Value" value={page.metaKeywords ?? "Not present"} />
        <DarkRow label="Keyword Count" value={page.metaKeywords ? page.metaKeywordCount : "Not available"} />
      </SectionCard>
    </section>
  );
}
