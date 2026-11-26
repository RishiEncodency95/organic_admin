"use client";

import React from "react";
import { Gauge, Smartphone, Monitor } from "lucide-react";
import type { CheckupSource, PageSpeedSnapshot } from "@/lib/seoCheckupData";
import { sourceLabel } from "@/lib/seoCheckupData";

const SOURCE_STYLES: Record<CheckupSource, string> = {
  measured: "border-blue-200 bg-blue-50 text-blue-700",
  crawl: "border-emerald-200 bg-emerald-50 text-emerald-700",
  derived: "border-amber-200 bg-amber-50 text-amber-700",
  not_tested: "border-slate-300 bg-slate-100 text-slate-600",
  not_connected: "border-slate-300 bg-slate-100 text-slate-600",
};

export function ScoreRing({
  value,
  color,
  label,
  sub,
  source,
}: {
  value: number | null;
  color: string;
  label: React.ReactNode;
  sub: string;
  source?: CheckupSource;
}) {
  const displayValue = value ?? 0;
  return (
    <div className="flex flex-col items-center justify-between text-center h-full">
      {label}
      <div className="relative my-3 flex items-center justify-center">
        <svg className="h-36 w-36 -rotate-90">
          <circle cx="72" cy="72" r="58" stroke="#e2e8f0" strokeWidth="10" fill="transparent" />
          <circle
            cx="72"
            cy="72"
            r="58"
            stroke={value == null ? "#cbd5e1" : color}
            strokeWidth="10"
            strokeDasharray={2 * Math.PI * 58}
            strokeDashoffset={2 * Math.PI * 58 * (1 - displayValue / 100)}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {value == null ? (
            <span className="text-3xl font-black tracking-tight text-slate-400">n/a</span>
          ) : (
            <>
              <span className="text-4xl font-black tracking-tight text-slate-900">{value}</span>
              <span className="text-[11px] font-bold text-slate-400">/ 100</span>
            </>
          )}
        </div>
      </div>
      <p className="text-xs font-medium text-slate-600">{sub}</p>
      {source && (
        <span
          className={`mt-2 inline-flex rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
            SOURCE_STYLES[source]
          }`}
        >
          {source === "measured"
            ? "Measured score"
            : source === "crawl"
            ? "From crawler"
            : source === "not_tested"
            ? "Not tested"
            : "Derived"}
        </span>
      )}
    </div>
  );
}

interface ReportScoreDialsProps {
  seoScore: number | null;
  scoreSource?: CheckupSource;
  totalChecks: number;
  effectivePageSpeed: PageSpeedSnapshot | null;
  activeStrategy: "mobile" | "desktop";
  onStrategyChange: (strategy: "mobile" | "desktop") => void;
  summary: string;
  failedCount: number;
  warningCount: number;
  passedCount: number;
}

export default function ReportScoreDials({
  seoScore,
  scoreSource,
  totalChecks,
  effectivePageSpeed,
  activeStrategy,
  onStrategyChange,
  summary,
  failedCount,
  warningCount,
  passedCount,
}: ReportScoreDialsProps) {
  const psScore = effectivePageSpeed?.scores?.performance ?? null;
  const psColor =
    psScore != null
      ? psScore >= 90
        ? "#059669"
        : psScore >= 50
        ? "#d97706"
        : "#e11d48"
      : "#0b2a6b";

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
      {/* 1. Overall SEO Health Score */}
      <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/50 to-white p-5 shadow-xs md:col-span-4 flex flex-col justify-between">
        <ScoreRing
          value={seoScore}
          color="#059669"
          source={scoreSource}
          label={
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
              General SEO Health Score
            </span>
          }
          sub={`${totalChecks} automated tests evaluated`}
        />
      </div>

      {/* 2. PageSpeed Performance Dial */}
      <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-b from-blue-50/50 to-white p-5 shadow-xs md:col-span-4 flex flex-col justify-between">
        <ScoreRing
          value={psScore}
          color={psColor}
          source={effectivePageSpeed?.ok ? "measured" : "not_tested"}
          label={
            <div className="flex flex-col items-center gap-1.5 w-full">
              <span className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#0b2a6b]">
                <Gauge className="h-4 w-4 text-[#0b2a6b]" /> PageSpeed Performance
              </span>
              {/* Strategy Toggle */}
              <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => onStrategyChange("mobile")}
                  className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 transition cursor-pointer ${
                    activeStrategy === "mobile"
                      ? "bg-white text-[#0b2a6b] shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Smartphone className="h-3 w-3" /> Mobile
                </button>
                <button
                  type="button"
                  onClick={() => onStrategyChange("desktop")}
                  className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 transition cursor-pointer ${
                    activeStrategy === "desktop"
                      ? "bg-white text-[#0b2a6b] shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Monitor className="h-3 w-3" /> Desktop
                </button>
              </div>
            </div>
          }
          sub={
            effectivePageSpeed?.ok
              ? `Live Lighthouse ${activeStrategy} score`
              : `Google PageSpeed ${activeStrategy} score`
          }
        />
      </div>

      {/* 3. Status Breakdown & Health Snapshot */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-gradient-to-b from-slate-50/80 to-white p-5 shadow-xs md:col-span-4">
        <div>
          <h3 className="mb-1 text-xs font-extrabold uppercase tracking-wider text-slate-800">
            SEO Health Snapshot
          </h3>
          <p className="mb-3 text-xs leading-relaxed text-slate-600 line-clamp-3">{summary}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center">
          <div className="rounded-xl border border-red-200 bg-red-50/80 p-2.5">
            <span className="block text-xl font-black text-red-600">{failedCount}</span>
            <span className="text-[10px] font-bold uppercase text-red-700">Failed</span>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-2.5">
            <span className="block text-xl font-black text-amber-600">{warningCount}</span>
            <span className="text-[10px] font-bold uppercase text-amber-700">Warnings</span>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-2.5">
            <span className="block text-xl font-black text-emerald-600">{passedCount}</span>
            <span className="text-[10px] font-bold uppercase text-emerald-700">Passed</span>
          </div>
        </div>
      </div>
    </div>
  );
}

