"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, FileText, Info, UserRound, X } from "lucide-react";
import { LOGO } from "./managerUi";

/*
 * "Review Question" popup — opened from "Add Answer" / "Review" in the AI Knowledge &
 * Answers tab's "Needs Your Review" list. Design preview with sample conversations; the
 * answer is only kept in page state. Closes only from the ✕, Cancel or after saving /
 * sending for confirmation — not on outside clicks or Escape. Rendered into document.body
 * so the page's zoom does not shrink it.
 */

export type ReviewItem = {
  id: number;
  question: string;
  asked: number;
  topic: string;
  owner: string;
  visitorMessage: string;
  botReply: string;
};

export type VerifiedAnswer = { en: string; hi: string; reference: string };

type Props = {
  /** null keeps the popup closed */
  item: ReviewItem | null;
  onClose: () => void;
  onSave: (answer: VerifiedAnswer) => void;
  onNeedsConfirmation: () => void;
};

const ExclamationDot = ({ size = 18 }: { size?: number }) => (
  <span className="grid shrink-0 place-items-center rounded-full bg-[#f59e0b] text-white" style={{ width: size, height: size }}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.4} strokeLinecap="round" style={{ width: size * 0.62, height: size * 0.62 }} aria-hidden="true">
      <path d="M12 6v8M12 18.5h.01" />
    </svg>
  </span>
);

/** Mount with `key={item.id}` so each question starts empty */
export default function ReviewQuestionModal({ item, onClose, onSave, onNeedsConfirmation }: Props) {
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [answer, setAnswer] = useState({ en: "", hi: "" });
  const [reference, setReference] = useState("");
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = item !== null;

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

  if (!item || typeof document === "undefined") return null;

  // Both a verified answer (in either language) and a reference are required
  const canSave = (answer.en.trim() || answer.hi.trim()) && reference.trim();

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 font-sans">
      <div aria-hidden="true" className="absolute inset-0 bg-[#0b1f14]/55 backdrop-blur-[2px]" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-question-title"
        className="relative flex max-h-[calc(100vh-32px)] w-[640px] max-w-full flex-col rounded-[14px] bg-white text-[#0f172a] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)]"
      >
        <div className="min-h-0 overflow-y-auto px-[18px] pb-[12px] pt-[12px]">
          {/* Header */}
          <div className="flex items-start gap-[12px]">
            <div className="min-w-0 flex-1">
              <h2 id="review-question-title" className="text-[19px] font-bold leading-tight text-[#0f2a52]">
                Review Question
              </h2>
              <p className="mt-[2px] text-[14px] text-[#475569]">Add a verified answer to improve future replies.</p>
            </div>
            <span title="This conversation is sample data" className="mt-[12px] inline-flex items-center gap-[7px] rounded-[6px] bg-[#fdf1d8] px-[9px] py-[3px] text-[12.5px] text-[#92400e]">
              <ExclamationDot size={14} /> Demo data
            </span>
            <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="-mr-[6px] grid h-[28px] w-[28px] place-items-center rounded-full text-[#0f172a] transition hover:bg-slate-100">
              <X className="h-[20px] w-[20px]" />
            </button>
          </div>

          {/* Question */}
          <div className="mt-[7px] rounded-[10px] border border-[#e5e7eb] px-[14px] py-[7px]">
            <p className="text-[16.5px] font-bold text-[#0f2a52]">{item.question}</p>
            <span className="mt-[5px] inline-flex items-center gap-[8px] rounded-[6px] bg-[#fdf1d8] px-[10px] py-[3px] text-[13.5px] text-[#b45309]">
              <ExclamationDot /> No supported answer
            </span>
            <p className="mt-[5px] text-[13.5px] text-[#475569]">
              Asked {item.asked} times <span className="mx-[8px]">•</span> Topic: {item.topic} <span className="mx-[8px]">•</span> Owner: {item.owner}
            </p>
          </div>

          {/* Conversation */}
          <div className="mt-[7px] grid grid-cols-2 gap-[12px]">
            <div>
              <p className="flex items-center gap-[10px] text-[13.5px] font-medium text-[#0f172a]">
                <span className="grid h-[24px] w-[24px] place-items-center rounded-[5px] bg-[#e8eef7] text-[#1e3a8a]">
                  <UserRound className="h-[16px] w-[16px]" fill="currentColor" />
                </span>
                Latest visitor message
              </p>
              <p className="mt-[5px] rounded-[8px] bg-[#f3f5f8] px-[14px] py-[6px] text-[13.5px] leading-snug text-[#0f172a]">{item.visitorMessage}</p>
            </div>
            <div className="border-l border-[#eef0f2] pl-[16px]">
              <p className="flex items-center gap-[10px] text-[13.5px] font-medium text-[#0f172a]">
                <span className="grid h-[24px] w-[24px] place-items-center rounded-full bg-[#eaf6ee]">
                  <Image src={LOGO} alt="" width={40} height={40} className="h-[18px] w-[18px] object-contain" />
                </span>
                Organic Mitra replied
              </p>
              <p className="mt-[5px] rounded-[8px] bg-[#eef6f1] px-[14px] py-[6px] text-[13.5px] leading-snug text-[#0f172a]">{item.botReply}</p>
            </div>
          </div>
          <div className="mt-[5px] flex justify-end border-b border-[#eef0f2] pb-[8px]">
            <Link href="/chatbot/inbox" className="flex items-center gap-[6px] text-[13.5px] text-[#15633a] underline underline-offset-2 hover:text-[#124f2f]">
              View conversation <ArrowUpRight className="h-[15px] w-[15px]" />
            </Link>
          </div>

          {/* Verified answer */}
          <div className="mt-[7px] flex items-end justify-between">
            <p className="text-[14px] font-medium text-[#0f172a]">
              Verified answer <span className="text-[#dc2626]">*</span>
            </p>
            <div className="flex overflow-hidden rounded-[7px] border border-[#dfe3e8]">
              {(["en", "hi"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  aria-pressed={lang === l}
                  className={`h-[28px] w-[94px] text-[13px] transition ${lang === l ? "bg-[#15633a] font-medium text-white" : "bg-white text-[#0f172a] hover:bg-slate-50"}`}
                >
                  {l === "en" ? "English" : "हिंदी"}
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={answer[lang]}
            onChange={(e) => setAnswer({ ...answer, [lang]: e.target.value })}
            rows={2}
            maxLength={1000}
            placeholder={lang === "en" ? "Enter the answer confirmed by your team..." : "टीम द्वारा पुष्टि किया गया जवाब लिखें..."}
            className="mt-[5px] h-[62px] w-full resize-y rounded-[7px] border border-[#cbd5e1] bg-white px-[14px] py-[5px] text-[14px] leading-snug text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#15633a] focus:ring-2 focus:ring-[#15633a]/15"
          />
          <p className="mt-[3px] text-[12.5px] text-[#475569]">Use an approved policy or confirm with the responsible team.</p>

          <p className="mt-[7px] text-[14px] font-medium text-[#0f172a]">
            Reference / confirmation <span className="text-[#dc2626]">*</span>
          </p>
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            maxLength={200}
            placeholder="Add source link, policy or team confirmation..."
            className="mt-[5px] h-[32px] w-full rounded-[7px] border border-[#cbd5e1] bg-white px-[14px] text-[14px] text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#15633a] focus:ring-2 focus:ring-[#15633a]/15"
          />

          <p className="mt-[7px] flex items-center gap-[12px] rounded-[7px] bg-[#f3f5f8] px-[14px] py-[6px] text-[12.5px] text-[#334155]">
            <FileText className="h-[17px] w-[17px] shrink-0" /> This answer is saved to draft. Publish after review and testing.
          </p>
          <p className="mt-[6px] flex items-center gap-[12px] border-t border-[#eef0f2] pt-[8px] text-[12.5px] text-[#334155]">
            <span className="flex w-full items-center gap-[12px] rounded-[7px] bg-[#f3f5f8] px-[14px] py-[6px]">
              <Info className="h-[17px] w-[17px] shrink-0" /> Saving knowledge does not reply to the visitor. Use Inbox to send a response.
            </span>
          </p>

          {/* Actions */}
          <div className="mt-[9px] flex items-center gap-[12px]">
            <button
              type="button"
              onClick={onNeedsConfirmation}
              className="inline-flex h-[28px] items-center gap-[10px] rounded-[7px] bg-[#fdf1d8] px-[14px] text-[14px] text-[#b45309] transition hover:bg-[#fbe6bb]"
            >
              <ExclamationDot /> Needs Team Confirmation
            </button>
            <button type="button" onClick={onClose} className="ml-auto h-[28px] rounded-[7px] border border-[#cbd5e1] bg-white px-[18px] text-[14px] font-medium text-[#0f172a] transition hover:bg-slate-50">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSave({ en: answer.en.trim(), hi: answer.hi.trim(), reference: reference.trim() })}
              disabled={!canSave}
              title={canSave ? undefined : "Add a verified answer and a reference first"}
              className="h-[28px] rounded-[7px] bg-[#15633a] px-[18px] text-[14px] font-semibold text-white shadow-sm transition hover:bg-[#124f2f] disabled:cursor-not-allowed disabled:bg-[#a7d5b6]"
            >
              Save Answer Draft
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
