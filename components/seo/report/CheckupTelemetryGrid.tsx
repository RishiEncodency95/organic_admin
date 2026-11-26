"use client";

import React from "react";
import { Search, Database, Check, AlertTriangle, X } from "lucide-react";
import type { CheckupSource, CheckupStatus } from "@/lib/seoCheckupData";
import { sourceLabel } from "@/lib/seoCheckupData";

const STATUS_ICONS: Record<CheckupStatus, React.ElementType> = {
  passed: Check,
  warning: AlertTriangle,
  failed: X,
};

const INPUT_TONES: Record<CheckupStatus, string> = {
  passed: "border-emerald-200 bg-emerald-50/50",
  warning: "border-amber-200 bg-amber-50/50",
  failed: "border-red-200 bg-red-50/50",
};

const INPUT_VALUE_TONES: Record<CheckupStatus, string> = {
  passed: "text-emerald-700",
  warning: "text-amber-700",
  failed: "text-red-700",
};

const SOURCE_STYLES: Record<CheckupSource, string> = {
  measured: "border-blue-200 bg-blue-50 text-blue-700",
  crawl: "border-emerald-200 bg-emerald-50 text-emerald-700",
  derived: "border-amber-200 bg-amber-50 text-amber-700",
  not_tested: "border-slate-300 bg-slate-100 text-slate-600",
  not_connected: "border-slate-300 bg-slate-100 text-slate-600",
};

const SOURCE_HINT: Record<CheckupSource, string> = {
  measured: "Measured live over the network during this audit run",
  crawl: "Read from the live HTML of the crawled route",
  derived: "Calculated from real crawl inputs using published thresholds",
  not_tested: "Optional probe had no API credentials, so this was not tested",
  not_connected: "Optional data source is not connected",
};

export interface AuditTelemetryInput {
  label: string;
  value: string;
  source?: CheckupSource;
  status?: CheckupStatus;
}

interface CheckupTelemetryGridProps {
  pageTitle: string;
  titleLen: number;
  pageDesc?: string | null;
  descLen?: number | null;
  inputs: AuditTelemetryInput[];
}

export default function CheckupTelemetryGrid({
  pageTitle,
  titleLen,
  pageDesc,
  descLen,
  inputs,
}: CheckupTelemetryGridProps) {
  return (
    <div className="space-y-4">
      {/* 1. Meta Tags Under Audit */}
      <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <h3 className="flex items-center gap-2 border-b border-slate-100 pb-3 text-sm font-extrabold text-slate-900">
          <Search className="h-4 w-4 text-[#0b2a6b]" />
          Live Meta Tags Under Audit
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                Title Tag
              </span>
              <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                titleLen >= 30 && titleLen <= 70
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}>
                {titleLen} characters
              </span>
            </div>
            <p className="font-mono text-[11.5px] font-bold text-slate-900 break-words">{pageTitle}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                Meta Description
              </span>
              <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                descLen != null && descLen >= 120 && descLen <= 160
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}>
                {descLen != null ? `${descLen} characters` : "missing"}
              </span>
            </div>
            <p className="font-mono text-[11.5px] text-slate-800 break-words">
              {pageDesc ?? "No meta description is currently served on this route."}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Full Traceable Inputs Grid */}
      <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
            <Database className="h-4 w-4 text-[#0b2a6b]" />
            Technical Audit Telemetry & Live Inputs
          </h3>
          <span className="text-xs font-semibold text-slate-500">Each value says where it comes from</span>
        </div>

        <div className="grid grid-cols-1 items-start gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {inputs.map((input) => {
            const StatusIcon = input.status ? STATUS_ICONS[input.status] : null;
            return (
              <div
                key={input.label}
                title={input.source ? SOURCE_HINT[input.source] : undefined}
                className={`flex flex-col gap-1 rounded-xl border p-3 min-w-0 h-fit self-start ${
                  input.status ? INPUT_TONES[input.status] : "border-slate-200 bg-slate-50/70"
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <span className="text-[11px] font-bold text-slate-700 leading-tight">
                    {input.label}
                  </span>
                  {StatusIcon && input.status && (
                    <StatusIcon
                      className={`h-3.5 w-3.5 shrink-0 ${
                        input.status === "passed"
                          ? "text-emerald-600"
                          : input.status === "warning"
                          ? "text-amber-600"
                          : "text-red-600"
                      }`}
                    />
                  )}
                </div>
                <span
                  className={`font-mono text-xs font-bold leading-tight ${
                    input.status ? INPUT_VALUE_TONES[input.status] : "text-slate-900"
                  }`}
                >
                  {input.value}
                </span>
                {input.source && (
                  <div className="mt-1">
                    <span
                      className={`inline-block rounded border px-1.5 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-wide ${
                        SOURCE_STYLES[input.source]
                      }`}
                    >
                      {sourceLabel(input.source)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

