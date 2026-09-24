"use client";

import React from "react";
import { Share2, ExternalLink } from "lucide-react";

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
        <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
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

export default function AuditSocialSection({ page }: { page: any }) {
  if (!page) return null;

  return (
    <section id="section-social-seo" className="scroll-mt-36 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-700 pb-3">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500 text-[12px] font-black text-slate-950 shadow-md">
            05
          </span>
          <h3 className="text-[17px] font-extrabold tracking-wide text-white uppercase">Social SEO & Sharing Cards</h3>
        </div>
        <span className="text-[11.5px] font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-700/80 px-3.5 py-1 rounded-full">
          Open Graph & Twitter Cards
        </span>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <SectionCard
          title="Open Graph Tags"
          icon={<Share2 className="w-5 h-5" />}
          note={`Status: ${(page?.socialStatus?.openGraph ?? "valid").replaceAll("_", " ")}`}
        >
          <DarkRow label="og:title" value={page.ogTitle ?? "Not available"} />
          <DarkRow label="og:description" value={page.ogDescription ?? "Not available"} />
          <DarkRow label="og:image" value={page.ogImage ?? "Not available"} mono />
          {page.ogImage && (
            <a
              href={page.ogImage}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block overflow-hidden rounded-xl border border-slate-700 bg-slate-900 hover:opacity-90 transition-opacity group"
            >
              <div className="flex aspect-[1.91/1] max-h-52 items-center justify-center overflow-hidden bg-slate-950">
                <img src={page.ogImage} alt="Open Graph share preview" className="h-full w-full object-cover" />
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-slate-700 bg-slate-800 px-3.5 py-2.5 text-[11.5px] font-bold text-slate-200 group-hover:text-cyan-300">
                <span>Open Graph image preview</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
              </div>
            </a>
          )}
          <DarkRow label="og:url" value={page.ogUrl ?? "Not available"} mono />
          <DarkRow label="og:type" value={page.ogType ?? "Not available"} />
        </SectionCard>

        <SectionCard
          title="Twitter Card Specs"
          icon={<Share2 className="w-5 h-5" />}
          note="Social preview quality only; missing tags are not treated as critical ranking issues."
        >
          <DarkRow label="twitter:card" value={page.twitterCard ?? "Not available"} />
          <DarkRow label="twitter:title" value={page.twitterTitle ?? "Not available"} />
          <DarkRow label="twitter:description" value={page.twitterDescription ?? "Not available"} />
          <DarkRow label="twitter:image" value={page.twitterImage ?? "Not available"} mono />
          {page.twitterImage && (
            <a
              href={page.twitterImage}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block overflow-hidden rounded-xl border border-slate-700 bg-slate-900 hover:opacity-90 transition-opacity group"
            >
              <div className="flex aspect-[1.91/1] max-h-52 items-center justify-center overflow-hidden bg-slate-950">
                <img src={page.twitterImage} alt="Twitter Card share preview" className="h-full w-full object-cover" />
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-slate-700 bg-slate-800 px-3.5 py-2.5 text-[11.5px] font-bold text-slate-200 group-hover:text-cyan-300">
                <span>Twitter Card image preview</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
              </div>
            </a>
          )}
        </SectionCard>
      </div>
    </section>
  );
}
