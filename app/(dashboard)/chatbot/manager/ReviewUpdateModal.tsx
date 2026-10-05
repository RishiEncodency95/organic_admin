"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, ArrowUpRight, Globe, Info, Plus, SquareArrowOutUpRight, X } from "lucide-react";

/*
 * "Review Content Update" popup — opened from "Review Changes" on a knowledge source in the
 * AI Knowledge & Answers tab. The before/after text is a demo example, not a real crawl.
 * Closes only from the ✕, Cancel, or after Keep Current / Approve Update — not on outside
 * clicks or Escape. Rendered into document.body so the page's zoom does not shrink it.
 */

export type ReviewSource = { id: number; name: string; url?: string };

type Props = {
  /** null keeps the popup closed */
  source: ReviewSource | null;
  onClose: () => void;
  onApprove: (note: string) => void;
  onKeep: (note: string) => void;
};

const CURRENT = "Visitors can register online to attend Bharat Organic Expo.";
const ADDED = "Show your registration confirmation at entry.";

export default function ReviewUpdateModal({ source, onClose, onApprove, onKeep }: Props) {
  const [note, setNote] = useState("");
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = source !== null;

  // Closes only from the ✕ or Cancel — no outside-click or Escape handlers on purpose
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!source || typeof document === "undefined") return null;

  const url = source.url ?? "bharatorganicexpo.com";

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 font-sans">
      <div aria-hidden="true" className="absolute inset-0 bg-[#0b1f14]/55 backdrop-blur-[2px]" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-update-title"
        className="relative flex max-h-[calc(100vh-32px)] w-[680px] max-w-full flex-col rounded-[14px] bg-white text-[#0f172a] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)]"
      >
        <div className="min-h-0 overflow-y-auto px-[24px] pb-[16px] pt-[16px]">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 id="review-update-title" className="text-[22px] font-bold leading-tight text-[#0f2a52]">
                Review Content Update
              </h2>
              <p className="mt-[2px] text-[14px] text-[#475569]">Compare the change and approve it for your chatbot draft.</p>
            </div>
            <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="-mr-[4px] grid h-[30px] w-[30px] place-items-center rounded-full text-[#0f172a] transition hover:bg-slate-100">
              <X className="h-[20px] w-[20px]" />
            </button>
          </div>

          {/* Source */}
          <div className="mt-[12px] flex items-center gap-[14px] rounded-[10px] border border-[#e5e7eb] px-[12px] py-[8px]">
            <span className="grid h-[44px] w-[44px] shrink-0 place-items-center rounded-full bg-[#eef3fb] text-[#1e3a8a]">
              <Globe className="h-[26px] w-[26px]" strokeWidth={1.8} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[16.5px] font-bold text-[#0f2a52]">{source.name.replace(/\b\w/g, (c) => c.toUpperCase())}</p>
              <p className="text-[14px] text-[#475569]">{url}</p>
            </div>
            <a
              href={`https://${url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-[34px] items-center gap-[8px] rounded-[7px] border border-[#2f8a4c] bg-white px-[12px] text-[13.5px] font-medium text-[#14532d] transition hover:bg-[#f1f7ee]"
            >
              <SquareArrowOutUpRight className="h-[16px] w-[16px]" /> Open Website <ArrowUpRight className="h-[14px] w-[14px]" />
            </a>
            <span className="inline-flex h-[34px] items-center gap-[8px] rounded-[7px] bg-[#fdf1d8] px-[12px] text-[13.5px] text-[#b45309]">
              <span className="h-[9px] w-[9px] rounded-full bg-[#f59e0b]" /> Pending Review
            </span>
          </div>

          {/* Before / after */}
          <div className="mt-[12px] grid grid-cols-[1fr_32px_1fr] items-stretch">
            <div className="overflow-hidden rounded-[8px] border border-[#e5e7eb]">
              <p className="bg-[#f3f5f8] px-[14px] py-[7px] text-[14.5px] font-bold text-[#0f172a]">Current Content</p>
              <p className="px-[18px] py-[10px] text-[14.5px] leading-snug text-[#0f172a]">{CURRENT}</p>
            </div>
            <span className="grid place-items-center text-[#334155]">
              <ArrowRight className="h-[18px] w-[18px]" />
            </span>
            <div className="overflow-hidden rounded-[8px] border border-[#d6ecdc]">
              <p className="bg-[#eaf6ee] px-[14px] py-[7px] text-[14.5px] font-bold text-[#0f172a]">Updated Content</p>
              <div className="px-[16px] pb-[10px] pt-[10px] text-[14.5px] leading-snug text-[#0f172a]">
                <p className="px-[2px]">{CURRENT}</p>
                <p className="mt-[4px] rounded-[5px] bg-[#dcf3e1] px-[8px] py-[4px] text-[#14532d]">{ADDED}</p>
              </div>
            </div>
          </div>

          <p className="mt-[10px] flex items-center gap-[12px] rounded-[7px] bg-[#eaf6ee] px-[14px] py-[7px] text-[14.5px] font-medium text-[#14532d]">
            <Plus className="h-[18px] w-[18px]" strokeWidth={2.6} /> Added: Entry confirmation instruction
          </p>
          <p className="mt-[4px] text-[12px] text-[#64748b]">Demo example • Verify the instruction on the source website.</p>

          {/* Note */}
          <p className="mt-[10px] text-[14px] text-[#0f172a]">Internal note (optional)</p>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={200}
            placeholder="Add a note for your team"
            className="mt-[4px] h-[36px] w-full rounded-[7px] border border-[#cbd5e1] bg-white px-[14px] text-[14px] text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#15633a] focus:ring-2 focus:ring-[#15633a]/15"
          />

          <p className="mt-[10px] flex items-center gap-[10px] text-[13px] text-[#475569]">
            <Info className="h-[17px] w-[17px] fill-[#94a3b8] text-white" /> Approved updates are saved to draft and go live when published.
          </p>

          {/* Actions */}
          <div className="mt-[10px] flex items-center gap-[12px] border-t border-[#eef0f2] pt-[12px]">
            <button
              type="button"
              onClick={() => onKeep(note.trim())}
              className="h-[36px] rounded-[7px] border border-[#94a3b8] bg-white px-[18px] text-[14px] font-medium text-[#0f172a] transition hover:bg-slate-50"
            >
              Keep Current
            </button>
            <button type="button" onClick={onClose} className="ml-auto h-[36px] px-[16px] text-[14px] font-medium text-[#0f172a] transition hover:text-[#15633a]">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onApprove(note.trim())}
              className="h-[36px] rounded-[7px] bg-[#15633a] px-[20px] text-[14px] font-semibold text-white shadow-sm transition hover:bg-[#124f2f]"
            >
              Approve Update
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
