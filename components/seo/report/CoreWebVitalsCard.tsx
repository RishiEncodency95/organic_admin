"use client";

import React from "react";
import { Gauge, Smartphone, Monitor, Zap, Clock, ShieldCheck, CheckCircle2 } from "lucide-react";
import type { PageSpeedSnapshot } from "@/lib/seoCheckupData";
import { formatCls, formatMs } from "@/lib/formatNumbers";

interface CoreWebVitalsCardProps {
  pagespeed: PageSpeedSnapshot | null;
  strategy: "mobile" | "desktop";
  onStrategyChange: (strategy: "mobile" | "desktop") => void;
}

export default function CoreWebVitalsCard({
  pagespeed,
  strategy,
  onStrategyChange,
}: CoreWebVitalsCardProps) {
  const scores = pagespeed?.scores;
  const metrics = pagespeed?.metrics;

  const scoreBadge = (score: number | null | undefined) => {
    if (score == null) return { text: "N/A", color: "text-slate-400 bg-slate-100 border-slate-200" };
    if (score >= 90) return { text: `${score}/100`, color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (score >= 50) return { text: `${score}/100`, color: "text-amber-700 bg-amber-50 border-amber-200" };
    return { text: `${score}/100`, color: "text-red-700 bg-red-50 border-red-200" };
  };

  const vitalBadge = (val: number | null | undefined, good: number, poor: number, unit = "s") => {
    if (val == null) return { display: "—", status: "No Data", tone: "bg-slate-50 border-slate-200 text-slate-500" };
    const num = unit === "s" ? (val / 1000).toFixed(2) : unit === "ms" ? formatMs(val) : formatCls(val);
    const numericVal = unit === "s" ? val / 1000 : val;
    if (numericVal <= good) {
      return { display: `${num}${unit}`, status: "Good", tone: "bg-emerald-50 border-emerald-200 text-emerald-700" };
    }
    if (numericVal <= poor) {
      return { display: `${num}${unit}`, status: "Needs Improvement", tone: "bg-amber-50 border-amber-200 text-amber-700" };
    }
    return { display: `${num}${unit}`, status: "Poor", tone: "bg-red-50 border-red-200 text-red-700" };
  };

  const fcp = vitalBadge(metrics?.fcpMs, 1.8, 3.0, "s");
  const lcp = vitalBadge(metrics?.lcpMs, 2.5, 4.0, "s");
  const cls = vitalBadge(metrics?.cls, 0.1, 0.25, "");
  const tbt = vitalBadge(metrics?.tbtMs, 200, 600, "ms");
  const ttfb = vitalBadge(metrics?.ttfbMs, 800, 1800, "ms");

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              Google PageSpeed & Core Web Vitals
            </h3>
            <p className="text-xs text-slate-500">
              Live Google Lighthouse performance audit and user-experience benchmarks
            </p>
          </div>
        </div>

        {/* Strategy Switch */}
        <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => onStrategyChange("mobile")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition cursor-pointer ${
              strategy === "mobile"
                ? "bg-white text-[#0b2a6b] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" /> Mobile View
          </button>
          <button
            type="button"
            onClick={() => onStrategyChange("desktop")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition cursor-pointer ${
              strategy === "desktop"
                ? "bg-white text-[#0b2a6b] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Monitor className="h-3.5 w-3.5" /> Desktop View
          </button>
        </div>
      </div>

      {!pagespeed && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-900">
          Not measured yet for this page on {strategy}. Google measures it live and the result appears here when the run finishes. Nothing is estimated from another page or device.
        </div>
      )}

      {/* Lighthouse 4 Pillars */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Performance", score: scores?.performance, icon: Gauge },
          { label: "Accessibility", score: scores?.accessibility, icon: ShieldCheck },
          { label: "Best Practices", score: scores?.bestPractices, icon: CheckCircle2 },
          { label: "SEO Rating", score: scores?.seo, icon: Zap },
        ].map((item) => {
          const badge = scoreBadge(item.score);
          const Icon = item.icon;
          return (
            <div key={item.label} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-center space-y-1">
              <span className="text-[11px] font-extrabold uppercase text-slate-500 block truncate">
                {item.label}
              </span>
              <div className="text-2xl font-black text-slate-900">{item.score ?? "—"}</div>
              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${badge.color}`}>
                {badge.text}
              </span>
            </div>
          );
        })}
      </div>

      {/* Core Web Vitals Benchmarks */}
      <div className="space-y-2 pt-2">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
          Core Web Vitals Field Diagnostics
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* FCP */}
          <div className="min-w-0 p-3 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-slate-500 block break-words">First Contentful Paint (FCP)</span>
            <div className="text-lg font-black text-slate-900 break-words">{fcp.display}</div>
            <span className={`inline-block text-[9.5px] font-bold px-2 py-0.5 rounded border ${fcp.tone}`}>
              {fcp.status} (target ≤ 1.8s)
            </span>
          </div>

          {/* LCP */}
          <div className="min-w-0 p-3 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-slate-500 block break-words">Largest Contentful Paint (LCP)</span>
            <div className="text-lg font-black text-slate-900 break-words">{lcp.display}</div>
            <span className={`inline-block text-[9.5px] font-bold px-2 py-0.5 rounded border ${lcp.tone}`}>
              {lcp.status} (target ≤ 2.5s)
            </span>
          </div>

          {/* CLS */}
          <div className="min-w-0 p-3 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-slate-500 block break-words">Layout Shift (CLS)</span>
            <div className="text-lg font-black text-slate-900 break-words">{cls.display}</div>
            <span className={`inline-block text-[9.5px] font-bold px-2 py-0.5 rounded border ${cls.tone}`}>
              {cls.status} (target ≤ 0.1)
            </span>
          </div>

          {/* TBT */}
          <div className="min-w-0 p-3 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-slate-500 block break-words">Total Blocking Time (TBT)</span>
            <div className="text-lg font-black text-slate-900 break-words">{tbt.display}</div>
            <span className={`inline-block text-[9.5px] font-bold px-2 py-0.5 rounded border ${tbt.tone}`}>
              {tbt.status} (target ≤ 200ms)
            </span>
          </div>

          {/* TTFB */}
          <div className="min-w-0 p-3 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-slate-500 block break-words">Server Time to First Byte</span>
            <div className="text-lg font-black text-slate-900 break-words">{ttfb.display}</div>
            <span className={`inline-block text-[9.5px] font-bold px-2 py-0.5 rounded border ${ttfb.tone}`}>
              {ttfb.status} (target ≤ 800ms)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

