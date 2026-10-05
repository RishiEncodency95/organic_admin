"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Info, X } from "lucide-react";

/*
 * "Close / Resolve" popup, opened from a row's ⋮ menu in the inbox — design preview; the
 * visitor message is not actually sent. It closes only from the ✕, Cancel or after
 * resolving — not on outside clicks or Escape. Rendered into document.body so the inbox
 * page's zoom does not shrink it.
 */

/** The inbox row being resolved */
export type ResolveTarget = { id: number; name: string; type: string; topic: string; category: string; assignedTo: string };

export type Resolution = { status: string; outcome: string; summary: string; sendUpdate: boolean; channel: string; message: string; requestFeedback: boolean };

const STATUSES = ["Resolved", "Closed – no response", "Closed – duplicate", "Closed – not relevant"] as const;
const CHANNELS = ["Website chat", "WhatsApp", "Email", "SMS"] as const;

/** Sample outcomes and default texts per inbox category */
const PRESETS: Record<string, { outcomes: string[]; summary: string; issue: string }> = {
  support: {
    outcomes: ["Registration issue fixed", "Information shared", "Referred to team"],
    summary: "Visitor registration completed successfully. Confirmation shared with the visitor.",
    issue: "registration issue",
  },
  lead: {
    outcomes: ["Quotation shared", "Booking confirmed", "Not interested", "Referred to team"],
    summary: "Quotation shared and next steps confirmed with the visitor.",
    issue: "enquiry",
  },
  enquiry: {
    outcomes: ["Information shared", "Registration link sent", "Referred to team"],
    summary: "Requested participation details shared with the visitor.",
    issue: "enquiry",
  },
  complaint: {
    outcomes: ["Issue resolved", "Apology and update shared", "Escalated to management"],
    summary: "Complaint reviewed with the team; visitor informed of the resolution.",
    issue: "complaint",
  },
  feedback: {
    outcomes: ["Feedback noted", "Shared with website team", "Change planned"],
    summary: "Feedback reviewed and shared with the website team.",
    issue: "feedback",
  },
};

const presetFor = (category: string) => PRESETS[category] ?? PRESETS.enquiry;

type Props = {
  /** null keeps the popup closed */
  enquiry: ResolveTarget | null;
  onClose: () => void;
  onResolve: (result: Resolution) => void;
};

const label = "mb-[3px] block text-[13.5px] font-semibold text-[#0f172a]";
const fieldBox = "relative flex h-[33px] items-center rounded-[7px] border border-[#cbd5e1] bg-white px-[12px] transition focus-within:border-[#15633a] focus-within:ring-2 focus-within:ring-[#15633a]/15";
const hiddenSelect = "absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed";
const textarea =
  "w-full resize-y rounded-[7px] border border-[#cbd5e1] bg-white px-[12px] py-[5px] text-[13.5px] leading-snug text-[#0f172a] outline-none transition focus:border-[#15633a] focus:ring-2 focus:ring-[#15633a]/15 disabled:bg-slate-50 disabled:text-slate-400";

function FieldSelect<T extends string>({ value, options, onChange, ariaLabel, disabled = false }: { value: T; options: readonly T[]; onChange: (v: T) => void; ariaLabel: string; disabled?: boolean }) {
  return (
    <label className={`${fieldBox} ${disabled ? "bg-slate-50 text-slate-400" : ""}`}>
      <span className="flex-1 truncate text-[13.5px]">{value}</span>
      <ChevronDown className="h-[15px] w-[15px] shrink-0" />
      <select value={value} onChange={(e) => onChange(e.target.value as T)} aria-label={ariaLabel} disabled={disabled} className={hiddenSelect}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Mount with `key={enquiry.id}` so each enquiry starts from its own defaults */
export default function ResolveEnquiryModal({ enquiry, onClose, onResolve }: Props) {
  const open = enquiry !== null;
  const preset = presetFor(enquiry?.category ?? "");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("Resolved");
  const [outcome, setOutcome] = useState(preset.outcomes[0]);
  const [summary, setSummary] = useState(preset.summary);
  const [sendUpdate, setSendUpdate] = useState(true);
  const [channel, setChannel] = useState<(typeof CHANNELS)[number]>("Website chat");
  const [message, setMessage] = useState(`Your ${preset.issue} has been resolved. Please contact us here if you need further help.\n\nNamo Gange Namaste!`);
  const [requestFeedback, setRequestFeedback] = useState(false);
  const [error, setError] = useState("");
  const closeRef = useRef<HTMLButtonElement>(null);

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

  if (!enquiry || typeof document === "undefined") return null;

  const submit = () => {
    if (!summary.trim()) return setError("Please add a resolution summary.");
    if (sendUpdate && !message.trim()) return setError("Please write the message for the visitor, or untick “Send update to visitor”.");
    onResolve({ status, outcome, summary: summary.trim(), sendUpdate, channel, message: message.trim(), requestFeedback });
  };

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 font-sans">
      <div aria-hidden="true" className="absolute inset-0 bg-[#0b1f14]/55 backdrop-blur-[2px]" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="resolve-title"
        className="relative flex max-h-[calc(100vh-32px)] w-[520px] max-w-full flex-col rounded-[14px] bg-white text-[#0f172a] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)]"
      >
        <div className="min-h-0 overflow-y-auto px-[22px] pb-[14px] pt-[14px]">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 id="resolve-title" className="text-[20.5px] font-bold leading-tight text-[#0f2a1c]">
                Close / Resolve
              </h2>
              <p className="text-[13px] text-[#475569]">Record the outcome and update the visitor.</p>
            </div>
            <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="-mr-[4px] grid h-[30px] w-[30px] place-items-center rounded-full text-[#0f172a] transition hover:bg-slate-100">
              <X className="h-[20px] w-[20px]" />
            </button>
          </div>

          {/* Enquiry */}
          <div className="mt-[10px] rounded-[9px] border border-[#d9ecdf] bg-[#eef7f0] px-[14px] py-[7px]">
            <p className="flex items-center gap-[12px] text-[14.5px] font-bold text-[#0f172a]">
              #OM-{1047 + enquiry.id} • {enquiry.name}
              <span title="Sample enquiry" className="inline-flex items-center gap-[4px] rounded-[5px] bg-[#dcf3e1] px-[7px] py-[1px] text-[11px] font-medium text-[#15803d]">
                Demo data <Info className="h-[11px] w-[11px]" />
              </span>
            </p>
            <p className="text-[13.5px] text-[#334155]">
              {enquiry.type} • {enquiry.topic}
            </p>
            <p className="text-[13.5px] text-[#334155]">Owner: {enquiry.assignedTo}</p>
          </div>

          {/* Status + outcome */}
          <div className="mt-[10px] grid grid-cols-2 gap-x-[16px]">
            <div>
              <p className={label}>
                Final status <span className="text-[#dc2626]">*</span>
              </p>
              <FieldSelect value={status} options={STATUSES} onChange={setStatus} ariaLabel="Final status" />
            </div>
            <div>
              <p className={label}>
                Outcome <span className="text-[#dc2626]">*</span>
              </p>
              <FieldSelect value={outcome} options={preset.outcomes} onChange={setOutcome} ariaLabel="Outcome" />
            </div>
          </div>

          {/* Summary */}
          <p className={`${label} mt-[8px]`}>
            Resolution summary <span className="text-[#dc2626]">*</span>
          </p>
          <textarea
            value={summary}
            onChange={(e) => {
              setSummary(e.target.value);
              setError("");
            }}
            rows={2}
            maxLength={500}
            placeholder="What was done to resolve this enquiry?"
            className={`${textarea} h-[52px]`}
          />
          <p className="mt-[2px] text-[12px] text-[#64748b]">Saved internally in Activity.</p>

          {/* Visitor update */}
          <div className="mt-[8px] border-t border-[#eef0f2] pt-[8px]">
            <label className="flex cursor-pointer items-start gap-[12px]">
              <input type="checkbox" checked={sendUpdate} onChange={() => setSendUpdate((v) => !v)} className="mt-[1px] h-[19px] w-[19px] cursor-pointer accent-[#15803d]" />
              <span>
                <span className="block text-[13.5px] font-semibold leading-tight text-[#0f172a]">Send update to visitor</span>
                <span className="block text-[12px] text-[#475569]">Share the resolution with the visitor via the selected channel.</span>
              </span>
            </label>

            <div className="mt-[6px] grid grid-cols-[150px_1fr] gap-x-[16px]">
              <div>
                <p className={`${label} ${sendUpdate ? "" : "text-slate-400"}`}>Channel</p>
                <FieldSelect value={channel} options={CHANNELS} onChange={setChannel} ariaLabel="Channel" disabled={!sendUpdate} />
              </div>
              <div>
                <p className={`${label} ${sendUpdate ? "" : "text-slate-400"}`}>Visitor message</p>
                <textarea
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    setError("");
                  }}
                  disabled={!sendUpdate}
                  rows={3}
                  maxLength={500}
                  className={`${textarea} h-[72px]`}
                />
              </div>
            </div>
          </div>

          {/* Feedback */}
          <label className="mt-[8px] flex cursor-pointer items-start gap-[12px] border-t border-[#eef0f2] pt-[8px]">
            <input type="checkbox" checked={requestFeedback} onChange={() => setRequestFeedback((v) => !v)} className="mt-[1px] h-[19px] w-[19px] cursor-pointer accent-[#15803d]" />
            <span>
              <span className="block text-[13.5px] font-semibold leading-tight text-[#0f172a]">Request feedback</span>
              <span className="block text-[12px] text-[#475569]">Show a simple rating after resolution.</span>
            </span>
          </label>

          <p className="mt-[8px] flex items-center gap-[10px] rounded-[7px] bg-[#f3f5f8] px-[11px] py-[6px] text-[12px] text-[#334155]">
            <Info className="h-[16px] w-[16px] shrink-0" /> Pending follow-up will be cleared. New replies reopen this enquiry.
          </p>

          {error && (
            <p role="alert" className="mt-[6px] text-[12px] text-[#dc2626]">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="mt-[10px] flex justify-end gap-[12px]">
            <button type="button" onClick={onClose} className="h-[30px] rounded-[8px] border border-[#cbd5e1] bg-white px-[22px] text-[13.5px] font-semibold text-[#0f172a] transition hover:bg-slate-50">
              Cancel
            </button>
            <button type="button" onClick={submit} className="h-[30px] rounded-[8px] bg-[#15803d] px-[20px] text-[13.5px] font-semibold text-white shadow-sm transition hover:bg-[#166534]">
              {sendUpdate ? "Resolve & Send" : "Resolve"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
