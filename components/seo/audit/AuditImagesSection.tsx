"use client";

import React from "react";
import { Image as ImageIcon } from "lucide-react";

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-gradient-to-b from-[#182238] to-[#121a2c] p-6 shadow-xl backdrop-blur-md">
      <div className="flex items-center gap-3 mb-3 border-b border-slate-700/50 pb-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-600/10 text-orange-400 border border-orange-500/30">
          {icon}
        </div>
        <h4 className="text-[15px] font-bold text-white tracking-wide">{title}</h4>
      </div>
      {children}
    </div>
  );
}

export default function AuditImagesSection({ page }: { page: any }) {
  if (!page) return null;

  return (
    <section id="section-images" className="scroll-mt-36 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-[11px] font-black text-white shadow-lg shadow-orange-500/20">
            08
          </span>
          <h3 className="text-[17px] font-extrabold tracking-wide text-white uppercase">Image Assets & Alt Tags</h3>
        </div>
        <span className="text-[11px] font-semibold text-orange-400 bg-orange-950/60 border border-orange-800/60 px-3 py-1 rounded-full">
          Image Audit ({page?.imageCount ?? 0})
        </span>
      </div>

      <SectionCard title={`Image Optimization Summary (${page?.imageCount ?? 0} Images)`} icon={<ImageIcon className="w-5 h-5" />}>
        <div className="mb-4 flex flex-wrap gap-2 text-[11.5px]">
          <span className="rounded-lg bg-slate-800 border border-slate-700/60 px-3 py-1 font-bold text-slate-200">
            Total: {page?.imageCount ?? 0}
          </span>
          <span
            className={`rounded-lg px-3 py-1 font-bold ${
              (page?.imagesMissingAlt ?? 0) > 0
                ? "bg-red-950/80 text-red-300 border border-red-800/80"
                : "bg-slate-800 border border-slate-700/60 text-slate-200"
            }`}
          >
            Missing Alt: {page?.imagesMissingAlt ?? 0}
          </span>
          <span className="rounded-lg bg-slate-800 border border-slate-700/60 px-3 py-1 font-bold text-slate-200">
            Decorative: {page?.imagesEmptyAlt ?? 0}
          </span>
          <span className="rounded-lg bg-slate-800 border border-slate-700/60 px-3 py-1 font-bold text-slate-200">
            Lazy Loaded: {page?.imagesLazyLoaded ?? 0}
          </span>
          <span
            className={`rounded-lg px-3 py-1 font-bold ${
              (page?.imagesWithoutDimensions ?? 0) > 0
                ? "bg-amber-950/80 text-amber-300 border border-amber-800/80"
                : "bg-slate-800 border border-slate-700/60 text-slate-200"
            }`}
          >
            No Dimensions: {page?.imagesWithoutDimensions ?? 0}
          </span>
        </div>

        <div className="max-h-[380px] overflow-y-auto rounded-xl border border-slate-700/60 bg-[#0f172a]/70 p-1">
          {(page?.images ?? []).length === 0 ? (
            <p className="p-4 text-[13px] text-slate-400">No image tags found on this page.</p>
          ) : (
            (page?.images ?? []).map((image: any, index: number) => (
              <div
                key={`${image.src}-${index}`}
                className="flex items-start gap-3 border-b border-slate-800/60 p-3 text-[12px] last:border-0 hover:bg-slate-800/40 rounded-lg transition-colors"
              >
                <ImageIcon className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
                <div className="min-w-0 flex-1">
                  <span className="block truncate font-mono text-slate-100 font-bold" title={image.src}>
                    {image.src}
                  </span>
                  <span className={image.hasAlt ? "text-slate-400 font-medium" : "text-red-400 font-bold"}>
                    {image.hasAlt
                      ? `alt: "${image.alt}"`
                      : image.isDecorative
                      ? "decorative (empty alt)"
                      : "Missing alt attribute"}
                    {image.width && image.height ? ` · ${image.width}×${image.height}` : " · no dimensions"}
                    {image.loading ? ` · ${image.loading}` : ""}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </SectionCard>
    </section>
  );
}
