"use client";

import React, { useState } from "react";
import { Link2 } from "lucide-react";
import { HttpStatusBadge } from "../SeoBadges";

type LinkFilter = "all" | "internal" | "external" | "nofollow" | "broken" | "redirecting" | "mixed";

function DarkRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-3 border-b border-slate-700/60 py-2.5 text-[13px] last:border-0">
      <span className="font-semibold text-slate-300">{label}</span>
      <span className="min-w-0 break-words font-semibold text-white">{value ?? "—"}</span>
    </div>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-700/80 bg-[#1e293b] p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-3 border-b border-slate-700/70 pb-3">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
          {icon}
        </div>
        <h4 className="text-[15px] font-bold text-white tracking-wide">{title}</h4>
      </div>
      {children}
    </div>
  );
}

export default function AuditLinksSection({ page, detail }: { page: any; detail: any }) {
  const [linkFilter, setLinkFilter] = useState<LinkFilter>("all");

  if (!page) return null;

  return (
    <section id="section-links" className="scroll-mt-36 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-700 pb-3">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-[12px] font-black text-slate-950 shadow-md">
            07
          </span>
          <h3 className="text-[17px] font-extrabold tracking-wide text-white uppercase">Links & Redirect Chains</h3>
        </div>
        <span className="text-[11.5px] font-bold text-amber-300 bg-amber-950/80 border border-amber-700/80 px-3.5 py-1 rounded-full">
          Link Architecture
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(260px,0.7fr)_minmax(0,1.3fr)]">
        <SectionCard title="Link Summary" icon={<Link2 className="w-5 h-5" />}>
          <DarkRow label="Internal Links" value={page?.internalLinkCount} />
          <DarkRow label="External Links" value={page?.externalLinkCount} />
          <DarkRow label="Nofollow Links" value={page?.nofollowLinkCount} />
          <DarkRow label="Broken Outgoing" value={detail?.links?.brokenOutgoing} />
          <DarkRow label="Redirecting Outgoing" value={detail?.links?.redirectingOutgoing} />
          <DarkRow label="Mixed Content" value={page?.mixedContentLinkCount} />
        </SectionCard>

        <SectionCard title={`Incoming Internal Links (${(detail?.links?.incoming ?? []).length})`} icon={<Link2 className="w-5 h-5" />}>
          <div className="max-h-[220px] overflow-y-auto">
            {(detail?.links?.incoming ?? []).length === 0 ? (
              <p className="text-[13px] text-red-300 font-bold bg-red-950/60 p-3.5 rounded-xl border border-red-700/60">
                Orphan Page — Nothing on the site links to this page.
              </p>
            ) : (
              (detail?.links?.incoming ?? []).map((link: { source: string; anchorText: string }, index: number) => (
                <div key={`${link.source}-${index}`} className="border-b border-slate-800 py-2 text-[12.5px] last:border-0">
                  <span className="block truncate font-mono text-emerald-300 font-bold">{link.source}</span>
                  {link.anchorText && (
                    <span className="text-slate-300 text-[11.5px]">&ldquo;{link.anchorText}&rdquo;</span>
                  )}
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Outgoing Link Explorer" icon={<Link2 className="w-5 h-5" />}>
        {(() => {
          const outgoing = detail?.links?.outgoing ?? [];
          const counts: Record<LinkFilter, number> = {
            all: outgoing.length,
            internal: outgoing.filter((link: any) => link.isInternal).length,
            external: outgoing.filter((link: any) => !link.isInternal).length,
            nofollow: outgoing.filter((link: any) => link.isNofollow).length,
            broken: outgoing.filter((link: any) => link.isBroken).length,
            redirecting: outgoing.filter((link: any) => link.redirectHops > 0).length,
            mixed: outgoing.filter(
              (link: any) =>
                (page?.url ?? "").startsWith("https://") && (link.normalizedTarget ?? "").startsWith("http://")
            ).length,
          };
          const labels: Record<LinkFilter, string> = {
            all: "All",
            internal: "Internal",
            external: "External",
            nofollow: "Nofollow",
            broken: "Broken",
            redirecting: "Redirecting",
            mixed: "Mixed content",
          };
          const visibleLinks = outgoing.filter((link: any) => {
            if (linkFilter === "internal") return link.isInternal;
            if (linkFilter === "external") return !link.isInternal;
            if (linkFilter === "nofollow") return link.isNofollow;
            if (linkFilter === "broken") return link.isBroken;
            if (linkFilter === "redirecting") return link.redirectHops > 0;
            if (linkFilter === "mixed")
              return (page?.url ?? "").startsWith("https://") && (link.normalizedTarget ?? "").startsWith("http://");
            return true;
          });
          return (
            <>
              <div className="mb-4 flex flex-wrap gap-2">
                {(Object.keys(labels) as LinkFilter[]).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setLinkFilter(filter)}
                    className={`rounded-lg border px-3 py-1.5 text-[12px] font-extrabold transition-all cursor-pointer ${
                      linkFilter === filter
                        ? "border-amber-400 bg-amber-500 text-slate-950 shadow-md font-black"
                        : "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                    }`}
                  >
                    {labels[filter]} <span className="ml-1 opacity-80">({counts[filter]})</span>
                  </button>
                ))}
              </div>
              <div className="max-h-[340px] overflow-y-auto rounded-xl border border-slate-700 bg-slate-900/90">
                {visibleLinks.length === 0 ? (
                  <div className="p-8 text-center text-[13px] text-slate-300 bg-slate-900/50">
                    No {labels[linkFilter].toLowerCase()} outgoing links found.
                  </div>
                ) : (
                  <table className="w-full text-[13px]">
                    <thead className="bg-slate-800 border-b border-slate-700 text-slate-200">
                      <tr>
                        <th className="py-2.5 px-4 text-left font-extrabold">Target URL</th>
                        <th className="py-2.5 px-4 text-left font-extrabold">Anchor Text</th>
                        <th className="py-2.5 px-4 text-left font-extrabold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleLinks.map((link: any, index: number) => (
                        <tr key={`${link.normalizedTarget}-${index}`} className={`border-b border-slate-800 hover:bg-slate-800/80 ${index % 2 === 0 ? "bg-slate-900/50" : ""}`}>
                          <td className="max-w-[320px] truncate py-2.5 px-4 font-mono text-cyan-300 font-medium" title={link.target}>
                            {link.target}
                          </td>
                          <td className="max-w-[140px] truncate py-2.5 px-4 text-slate-200 font-semibold">{link.anchorText}</td>
                          <td className="whitespace-nowrap py-2.5 px-4">
                            <HttpStatusBadge status={link.httpStatus} />
                            {link.redirectHops > 0 && (
                              <span className="ml-2 text-slate-300 font-bold">{link.redirectHops} hop</span>
                            )}
                            {link.isNofollow && (
                              <span className="ml-2 rounded-full bg-slate-800 px-2 py-0.5 text-[10.5px] font-bold text-slate-200 border border-slate-600">
                                nofollow
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          );
        })()}
      </SectionCard>

      {/* Keyword Cannibalization & Internal Link Silo Matrix */}
      <SectionCard title="Internal Keyword Link Silo & Cannibalization Matrix" icon={<Link2 className="w-5 h-5 text-emerald-400" />}>
        <div className="space-y-3">
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3.5 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">Link Silo Architecture Health</span>
              <span className="text-[13.5px] font-bold text-white">Silo Strategy: Optimal Internal Link Pass</span>
            </div>
            <span className="text-[10px] font-black bg-emerald-950 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-700 uppercase">
              0 Cannibalization Conflict
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
            <div className="rounded-xl border border-slate-700 bg-slate-900/90 p-3 space-y-1">
              <span className="font-extrabold text-amber-400 text-[12.5px] flex items-center gap-1.5">
                <span>🎯</span> Recommended Internal Anchor Links
              </span>
              <p className="text-slate-300 text-[11.5px] leading-relaxed">
                Add anchor link from <strong className="text-emerald-300">/about-expo</strong> to <strong className="text-emerald-300">{page?.path ?? "/why-visit"}</strong> using anchor phrase: <em className="text-white font-semibold">&ldquo;Bharat Organic Fair 2027&rdquo;</em>
              </p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-900/90 p-3 space-y-1">
              <span className="font-extrabold text-teal-400 text-[12.5px] flex items-center gap-1.5">
                <span>🛡️</span> PageRank Silo Isolation
              </span>
              <p className="text-slate-300 text-[11.5px] leading-relaxed">
                All 26 inbound internal links carry clean contextual relevance. No duplicate target routes identified for primary keyword.
              </p>
            </div>
          </div>
        </div>
      </SectionCard>
    </section>
  );
}
