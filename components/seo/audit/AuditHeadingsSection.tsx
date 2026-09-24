"use client";

import React, { useState } from "react";
import { Heading } from "lucide-react";
import { StatusChip } from "../SeoBadges";

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

export default function AuditHeadingsSection({ page }: { page: any }) {
  const [selectedHeadingLevel, setSelectedHeadingLevel] = useState<number | null>(null);
  const [selectedHeadingIndex, setSelectedHeadingIndex] = useState<number | null>(null);

  if (!page) return null;

  return (
    <section id="section-headings" className="scroll-mt-36 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-700 pb-3">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-[12px] font-black text-slate-950 shadow-md">
            06
          </span>
          <h3 className="text-[17px] font-extrabold tracking-wide text-white uppercase">Heading Hierarchy & Outline</h3>
        </div>
        <span className="text-[11.5px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-700/80 px-3.5 py-1 rounded-full">
          H1-H6 Structure Audit
        </span>
      </div>

      <SectionCard
        title="Heading Structure & Hierarchy"
        icon={<Heading className="w-5 h-5" />}
        note="Hierarchy is checked for missing/multiple H1, skipped levels, empty and duplicated headings."
      >
        <div className="mb-4 flex flex-wrap gap-2.5 items-center">
          {Object.entries(page?.headingCounts ?? {}).map(([tag, count]) => {
            const level = Number(tag.replace(/\D/g, ""));
            const isSelected = selectedHeadingLevel === level;
            return (
              <button
                key={tag}
                type="button"
                aria-pressed={isSelected}
                onClick={() => {
                  setSelectedHeadingLevel(isSelected ? null : level);
                  setSelectedHeadingIndex(null);
                }}
                className={`rounded-lg border px-3 py-1.5 text-[12px] font-black transition-all cursor-pointer ${
                  isSelected
                    ? "border-emerald-400 bg-emerald-500 text-slate-950 shadow-md"
                    : "border-slate-700 bg-slate-800 text-slate-200 hover:border-emerald-500/50 hover:bg-slate-700"
                }`}
              >
                {tag.toUpperCase()}: {count as React.ReactNode}
              </button>
            );
          })}
          <StatusChip value={page?.h1Status} />
        </div>

        {(page?.headingIssues ?? []).length > 0 && (
          <ul className="mb-4 list-inside list-disc text-[12.5px] text-red-300 font-bold bg-red-950/60 p-3.5 rounded-xl border border-red-700/60 space-y-1">
            {(page?.headingIssues ?? []).map((issue: string, index: number) => (
              <li key={`${issue}-${index}`}>{issue}</li>
            ))}
          </ul>
        )}

        <div className="max-h-[360px] overflow-y-auto rounded-xl border border-slate-700 bg-slate-900/90 p-1">
          {(page?.headingSequence ?? []).length === 0 ? (
            <p className="p-4 text-[13px] text-slate-300">No headings found on page.</p>
          ) : (
            (page?.headingSequence ?? []).map((heading: { level: number; text: string }, index: number) => {
              const isExactSelection = selectedHeadingIndex === index;
              const isLevelSelection = selectedHeadingIndex === null && selectedHeadingLevel === heading.level;
              const isHighlighted = isExactSelection || isLevelSelection;
              return (
                <div
                  key={`${index}-${heading.text}`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isExactSelection}
                  onClick={() => {
                    setSelectedHeadingIndex(isExactSelection ? null : index);
                    setSelectedHeadingLevel(isExactSelection ? null : heading.level);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedHeadingIndex(isExactSelection ? null : index);
                      setSelectedHeadingLevel(isExactSelection ? null : heading.level);
                    }
                  }}
                  className={`flex cursor-pointer items-center gap-3 border-b border-slate-800 px-3 py-2.5 text-[12.5px] outline-none transition-colors last:border-0 rounded-lg ${
                    isHighlighted
                      ? "border-emerald-500/60 bg-emerald-950/60 shadow-[inset_3px_0_0_#10b981]"
                      : "hover:bg-slate-800/80"
                  }`}
                  style={{ paddingLeft: `${14 + (heading.level - 1) * 18}px` }}
                >
                  <span
                    className={`shrink-0 rounded px-2 py-0.5 font-mono text-[11px] font-black ${
                      isHighlighted ? "bg-emerald-400 text-slate-950" : "bg-slate-800 text-slate-200"
                    }`}
                  >
                    H{heading.level}
                  </span>
                  <span className={heading.text ? "text-white font-bold" : "italic text-red-400"}>
                    {heading.text || "(empty heading)"}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </SectionCard>
    </section>
  );
}
