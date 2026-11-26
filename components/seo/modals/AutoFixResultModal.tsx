"use client";

import React from "react";
import { ShieldCheck, CheckCircle2, Download, X } from "lucide-react";
import type { FixLogEntry } from "@/lib/seoAuditApi";

interface AutoFixResultModalProps {
  data: {
    open: boolean;
    totalPages: number;
    fixedCount: number;
    failedCount: number;
    logs: FixLogEntry[];
  } | null;
  onClose: () => void;
  onDownloadExcel: () => void;
}

export default function AutoFixResultModal({
  data,
  onClose,
  onDownloadExcel,
}: AutoFixResultModalProps) {
  if (!data?.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl text-slate-100 animate-in zoom-in-95 duration-150 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-5 bg-slate-950/50">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Autonomous SEO Self-Healing Report</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer transition p-1 rounded-md"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs [scrollbar-width:thin]">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pages Checked</div>
              <div className="text-xl font-black text-white mt-0.5">{data.totalPages}</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-700">
              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Healed & Saved</div>
              <div className="text-xl font-black text-emerald-300 mt-0.5">{data.fixedCount}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Failed</div>
              <div className="text-xl font-black text-slate-300 mt-0.5">{data.failedCount}</div>
            </div>
          </div>

          {/* Log Preview Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Exact Metadata Inserted Into MongoDB:
              </span>
              <span className="text-[10px] text-slate-400">
                Showing latest {Math.min(data.logs.length, 12)} updates
              </span>
            </div>

            <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/60 p-2 space-y-2 [scrollbar-width:thin]">
              {data.logs.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-xs">
                  {data.fixedCount > 0
                    ? `${data.fixedCount} page(s) were fixed. Open "Resolved issues history" to inspect each change.`
                    : "Nothing was written: no page needed a fix, or the AI could not produce usable text. Check the history for details."}
                </div>
              ) : (
                data.logs.slice(0, 15).map((log, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg border border-slate-800/80 bg-slate-900/70 text-[11px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-400 font-mono">{log.route || "/"}</span>
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9.5px] font-bold uppercase text-slate-300">
                        {log.issueType}
                      </span>
                    </div>
                    {log.issueType === "title" && (
                      <div className="text-slate-200">
                        <div className="text-slate-400 line-through">
                          {typeof log.previousValue === "string" ? log.previousValue || "(empty)" : log.previousValue?.metaTitle || "(empty)"}
                        </div>
                        <span className="text-slate-400">New title:</span> &ldquo;{typeof log.newValue === "string" ? log.newValue : log.newValue?.metaTitle}&rdquo;
                      </div>
                    )}
                    {log.issueType === "description" && (
                      <div className="text-slate-300 line-clamp-2">
                        <span className="block text-slate-500 line-through">
                          {typeof log.previousValue === "string" ? log.previousValue || "(empty)" : log.previousValue?.metaDescription || "(empty)"}
                        </span>
                        <span className="text-slate-400">New description:</span> {typeof log.newValue === "string" ? log.newValue : log.newValue?.metaDescription}
                      </div>
                    )}
                    {log.issueType === "canonical" && (
                      <div className="text-cyan-300 font-mono text-[10px]">
                        <span className="text-slate-400">Canonical:</span> {typeof log.newValue === "string" ? log.newValue : log.newValue?.canonicalUrl}
                      </div>
                    )}
                    {log.issueType === "schema" && (
                      <div className="text-purple-300 font-mono text-[10px]">
                        <span className="text-slate-400">Structured Data:</span> JSON-LD schema saved
                      </div>
                    )}
                    {log.issueType === "robots" && (
                      <div className="text-emerald-300 text-[10px]">
                        <span className="text-slate-400">Robots:</span> Index: true, Follow: true
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Excel Download Banner */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <span className="text-[11px] text-slate-300">
              Want the full item-by-item spreadsheet with before & after values?
            </span>
            <button
              type="button"
              onClick={onDownloadExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-[11px] font-bold text-emerald-300 cursor-pointer transition shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Excel (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md cursor-pointer transition"
          >
            Close & View Updated Audit Report
          </button>
        </div>
      </div>
    </div>
  );
}

