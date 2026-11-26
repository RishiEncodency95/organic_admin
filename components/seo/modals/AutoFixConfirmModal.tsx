"use client";

import React from "react";
import { Zap, ShieldCheck, X } from "lucide-react";

interface AutoFixConfirmModalProps {
  isOpen: boolean;
  pendingCount: number;
  onConfirm: () => void;
  onClose: () => void;
}

export default function AutoFixConfirmModal({
  isOpen,
  pendingCount,
  onConfirm,
  onClose,
}: AutoFixConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-slate-100 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span>AI Self-Healing Intelligence ({pendingCount} issues)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer transition p-1 rounded-md"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3.5 mb-6 text-xs">
          <p className="text-slate-300 leading-relaxed">
            Clicking confirm will launch the autonomous AI agent on every page that has a fixable title, description, canonical, Open Graph or schema issue (up to 100 pages per run). Pages that are already fine are left untouched. It runs in the background and you can watch its progress.
          </p>

          {/* Accuracy & How it knows */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3.5 space-y-2">
            <div className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>How does AI know what to insert & ensure accuracy?</span>
            </div>
            <ul className="text-[11.5px] text-slate-300 space-y-1 pl-4 list-disc marker:text-emerald-400">
              <li>
                <strong>Route Context Mapping:</strong> AI inspects each specific URL path (e.g. <code>/services/asthi-visarjan</code>) and matches the exact service.
              </li>
              <li>
                <strong>Domain Verified:</strong> Generates Moksha Voyage specific metadata (Cremation, Repatriation, Pandit rites) — not generic text.
              </li>
              <li>
                <strong>SERP Strict Limits:</strong> Keeps Titles within 30-70 characters and Meta Descriptions within 120-160 characters (the same limits as the Page report).
              </li>
              <li>
                <strong>Audit Trail & Undo:</strong> Every change is logged in <code>SeoFixLog</code> with exact before/after snapshots for instant 1-click rollback.
              </li>
            </ul>
          </div>

          {/* What will be committed */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-[11.5px] text-slate-300">
            <span className="font-bold text-slate-200">Changes Committed Directly to MongoDB:</span>
            <div className="grid grid-cols-2 gap-1.5 mt-1.5 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400">✓ Optimized Meta Titles</span>
              <span className="flex items-center gap-1 text-emerald-400">✓ Empathetic Meta Descriptions</span>
              <span className="flex items-center gap-1 text-emerald-400">✓ Live Canonical URLs</span>
              <span className="flex items-center gap-1 text-emerald-400">✓ Social OpenGraph Cards</span>
              <span className="flex items-center gap-1 text-emerald-400">✓ FuneralService JSON-LD</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-black text-white shadow-lg shadow-emerald-950/40 cursor-pointer transition flex items-center justify-center gap-2"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Confirm & Heal All Pages</span>
          </button>
        </div>
      </div>
    </div>
  );
}

