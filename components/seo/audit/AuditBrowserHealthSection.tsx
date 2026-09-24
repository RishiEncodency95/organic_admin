"use client";

import React from "react";
import { Monitor, Server } from "lucide-react";

function DarkRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-3 border-b border-slate-700/40 py-2.5 text-[12.5px] last:border-0">
      <span className="font-semibold text-slate-400">{label}</span>
      <span className={`min-w-0 break-words font-medium text-slate-100 ${mono ? "font-mono text-[11.5px] text-teal-300" : ""}`}>
        {value ?? "—"}
      </span>
    </div>
  );
}

function SectionCard({ title, icon, children, note }: { title: string; icon: React.ReactNode; children: React.ReactNode; note?: string }) {
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-gradient-to-b from-[#182238] to-[#121a2c] p-6 shadow-xl backdrop-blur-md">
      <div className="flex items-center gap-3 mb-3 border-b border-slate-700/50 pb-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-600/10 text-teal-400 border border-teal-500/30">
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

export function AuditBrowserHealthSection({ page }: { page: any }) {
  if (!page) return null;

  return (
    <section id="section-browser-health" className="scroll-mt-36 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-r from-teal-500 to-emerald-600 text-[11px] font-black text-white shadow-lg shadow-teal-500/20">
            11
          </span>
          <h3 className="text-[17px] font-extrabold tracking-wide text-white uppercase">Browser Telemetry</h3>
        </div>
        <span className="text-[11px] font-semibold text-teal-400 bg-teal-950/60 border border-teal-800/60 px-3 py-1 rounded-full">
          Console Errors & JS Telemetry
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {!page.renderedWithJs && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-4 text-[12.5px] leading-relaxed text-emerald-300">
            Browser telemetry was not measured for this page. Turn on <strong>JS rendering</strong> on the SEO dashboard
            and run a new audit to capture it.
          </div>
        )}
        {(["jsExceptions", "consoleErrors", "consoleWarnings", "failedRequests"] as const).map((key) => (
          <SectionCard
            key={key}
            title={`${key.replace(/([A-Z])/g, " $1")}${
              page?.renderedWithJs ? ` (${page?.browserHealth?.[key]?.length ?? 0})` : " — not measured"
            }`}
            icon={<Monitor className="w-5 h-5" />}
            note={
              page?.renderedWithJs
                ? "Captured during the JavaScript-rendered crawl."
                : "A zero count is not shown because this page did not receive a browser-rendered audit."
            }
          >
            {(page?.browserHealth?.[key]?.length ?? 0) === 0 ? (
              <p className="text-[12.5px] text-slate-400">
                {page?.renderedWithJs ? "✓ No problems measured in telemetry." : "Not available"}
              </p>
            ) : (
              (page?.browserHealth?.[key] ?? []).map((problem: any, index: number) => (
                <div
                  key={`${problem.type}-${problem.message}-${index}`}
                  className="border-b border-slate-800/60 py-2.5 text-[12px] last:border-0"
                >
                  <p className="font-bold text-white">{problem.message}</p>
                  {problem.resourceUrl && (
                    <p className="mt-0.5 truncate font-mono text-cyan-300 text-[11px]" title={problem.resourceUrl}>
                      {problem.resourceUrl}
                    </p>
                  )}
                  <p className="mt-0.5 text-slate-400">
                    {problem.resourceType ?? problem.type}
                    {problem.statusCode ? ` · HTTP ${problem.statusCode}` : ""}
                  </p>
                </div>
              ))
            )}
          </SectionCard>
        ))}
      </div>
    </section>
  );
}

export function AuditInfrastructureSection({ page }: { page: any }) {
  if (!page) return null;

  return (
    <section id="section-infrastructure" className="scroll-mt-36 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 text-[11px] font-black text-white shadow-lg shadow-blue-500/20">
            12
          </span>
          <h3 className="text-[17px] font-extrabold tracking-wide text-white uppercase">Infrastructure & CDN</h3>
        </div>
        <span className="text-[11px] font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-3 py-1 rounded-full">
          Server & Cache Verification
        </span>
      </div>

      <SectionCard
        title="CDN & Server Cache Detection"
        icon={<Server className="w-5 h-5" />}
        note="This is evidence-based infrastructure detection; absence of indicators is not treated as a severe SEO issue."
      >
        <DarkRow label="Status" value={(page?.cdn?.status ?? "detected").replaceAll("_", " ")} />
        <DarkRow label="Provider" value={page?.cdn?.provider ?? "Not available"} />
        <DarkRow label="Cache-Control" value={page?.cdn?.cacheControl ?? "Not available"} mono />
        <DarkRow label="Server Header" value={page?.cdn?.server ?? "Not available"} />
        <DarkRow
          label="Evidence"
          value={
            (page?.cdn?.evidence ?? []).length
              ? page.cdn.evidence.join(" · ")
              : "No CDN indicators found"
          }
        />
      </SectionCard>
    </section>
  );
}
