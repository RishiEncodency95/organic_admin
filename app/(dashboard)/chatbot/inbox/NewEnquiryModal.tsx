"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Info, X } from "lucide-react";

/*
 * "New Enquiry" popup, opened from the inbox header — design preview; the enquiry is added to
 * the page's sample list only, not saved to the API. It closes only from the ✕, Cancel or
 * after creating — not on outside clicks or Escape. Rendered into document.body so the inbox
 * page's zoom does not shrink it.
 */

const TYPES = [
  { key: "enquiry", label: "Enquiry" },
  { key: "lead", label: "Lead" },
  { key: "support", label: "Support" },
  { key: "feedback", label: "Feedback" },
  { key: "complaint", label: "Complaint" },
] as const;

const TOPICS = ["Stall Booking", "Registration", "Buyer–Seller Meet", "Sponsorship", "Response Delay", "Website Experience", "Other"] as const;
const PRIORITIES = ["High", "Medium", "Low"] as const;
const SOURCES = ["Phone call", "Walk-in", "Email", "WhatsApp", "Website chat"] as const;

export type NewEnquiry = {
  name: string;
  mobile: string;
  email: string;
  category: (typeof TYPES)[number]["key"];
  type: string;
  topic: string;
  detail: string;
  priority: (typeof PRIORITIES)[number];
  assignedTo: string;
  source: string;
  /** Empty when no follow-up is scheduled */
  followUpAt: string;
};

type Props = {
  open: boolean;
  /** Owners to pick from; "Unassigned" is always offered first */
  owners: string[];
  onClose: () => void;
  onCreate: (enquiry: NewEnquiry) => void;
};

const label = "mb-[3px] block text-[13.5px] font-semibold text-[#0f172a]";
const fieldBox = "relative flex h-[33px] items-center rounded-[7px] border border-[#cbd5e1] bg-white px-[12px] transition focus-within:border-[#15633a] focus-within:ring-2 focus-within:ring-[#15633a]/15";
const hiddenSelect = "absolute inset-0 h-full w-full cursor-pointer opacity-0";
const input =
  "h-[33px] w-full rounded-[7px] border border-[#cbd5e1] bg-white px-[12px] text-[13.5px] text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#15633a] focus:ring-2 focus:ring-[#15633a]/15";
const required = <span className="text-[#dc2626]">*</span>;

function FieldSelect<T extends string>({ value, options, onChange, ariaLabel, display }: { value: T; options: readonly T[]; onChange: (v: T) => void; ariaLabel: string; display?: (v: T) => string }) {
  return (
    <label className={fieldBox}>
      <span className="flex-1 truncate text-[13.5px]">{display ? display(value) : value}</span>
      <ChevronDown className="h-[15px] w-[15px] shrink-0" />
      <select value={value} onChange={(e) => onChange(e.target.value as T)} aria-label={ariaLabel} className={hiddenSelect}>
        {options.map((o) => (
          <option key={o} value={o}>
            {display ? display(o) : o}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Mount with a fresh `key` per opening so the form starts empty */
export default function NewEnquiryModal({ open, owners, onClose, onCreate }: Props) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<NewEnquiry["category"]>("enquiry");
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>("Stall Booking");
  const [detail, setDetail] = useState("");
  const [priority, setPriority] = useState<NewEnquiry["priority"]>("Medium");
  const [assignedTo, setAssignedTo] = useState("Unassigned");
  const [source, setSource] = useState<(typeof SOURCES)[number]>("Phone call");
  const [followUpAt, setFollowUpAt] = useState("");
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

  if (!open || typeof document === "undefined") return null;

  const ownerOptions = ["Unassigned", ...owners.filter((o) => o !== "Unassigned")];
  const typeLabel = (key: string) => TYPES.find((t) => t.key === key)?.label ?? key;

  const submit = () => {
    if (!name.trim()) return setError("Please enter the visitor's name.");
    if (!mobile.trim() && !email.trim()) return setError("Please add a mobile number or an email.");
    if (mobile.trim() && !/^\+?[\d\s-]{10,15}$/.test(mobile.trim())) return setError("Please enter a valid mobile number.");
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Please enter a valid email.");
    if (!detail.trim()) return setError("Please describe the enquiry.");
    onCreate({
      name: name.trim(),
      mobile: mobile.trim(),
      email: email.trim(),
      category,
      type: typeLabel(category),
      topic,
      detail: detail.trim(),
      priority,
      assignedTo,
      source,
      followUpAt,
    });
  };

  const clearError = () => setError("");

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 font-sans">
      <div aria-hidden="true" className="absolute inset-0 bg-[#0b1f14]/55 backdrop-blur-[2px]" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-enquiry-title"
        className="relative flex max-h-[calc(100vh-32px)] w-[560px] max-w-full flex-col rounded-[14px] bg-white text-[#0f172a] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)]"
      >
        <div className="min-h-0 overflow-y-auto px-[22px] pb-[14px] pt-[14px]">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 id="new-enquiry-title" className="text-[20.5px] font-bold leading-tight text-[#0f2a1c]">
                New Enquiry
              </h2>
              <p className="text-[13px] text-[#475569]">Log an enquiry received outside the chatbot.</p>
            </div>
            <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="-mr-[4px] grid h-[30px] w-[30px] place-items-center rounded-full text-[#0f172a] transition hover:bg-slate-100">
              <X className="h-[20px] w-[20px]" />
            </button>
          </div>

          {/* Visitor */}
          <p className="mt-[10px] text-[12px] font-semibold uppercase tracking-wide text-[#15803d]">Visitor</p>
          <p className={`${label} mt-[4px]`}>Name {required}</p>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              clearError();
            }}
            maxLength={80}
            placeholder="Full name"
            className={input}
          />
          <div className="mt-[8px] grid grid-cols-2 gap-x-[16px]">
            <div>
              <p className={label}>Mobile</p>
              <input
                value={mobile}
                onChange={(e) => {
                  setMobile(e.target.value);
                  clearError();
                }}
                inputMode="tel"
                maxLength={15}
                placeholder="+91 98765 43210"
                className={input}
              />
            </div>
            <div>
              <p className={label}>Email</p>
              <input
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError();
                }}
                type="email"
                maxLength={120}
                placeholder="name@example.com"
                className={input}
              />
            </div>
          </div>
          <p className="mt-[2px] text-[12px] text-[#64748b]">At least one of mobile or email is required.</p>

          {/* Enquiry */}
          <p className="mt-[10px] border-t border-[#eef0f2] pt-[8px] text-[12px] font-semibold uppercase tracking-wide text-[#15803d]">Enquiry</p>
          <div className="mt-[4px] grid grid-cols-3 gap-x-[16px]">
            <div>
              <p className={label}>Type {required}</p>
              <FieldSelect value={category} options={TYPES.map((t) => t.key)} onChange={setCategory} ariaLabel="Type" display={typeLabel} />
            </div>
            <div>
              <p className={label}>Topic {required}</p>
              <FieldSelect value={topic} options={TOPICS} onChange={setTopic} ariaLabel="Topic" />
            </div>
            <div>
              <p className={label}>Priority</p>
              <FieldSelect value={priority} options={PRIORITIES} onChange={setPriority} ariaLabel="Priority" />
            </div>
          </div>

          <p className={`${label} mt-[8px]`}>Details {required}</p>
          <textarea
            value={detail}
            onChange={(e) => {
              setDetail(e.target.value);
              clearError();
            }}
            rows={2}
            maxLength={300}
            placeholder="What does the visitor need?"
            className="h-[52px] w-full resize-y rounded-[7px] border border-[#cbd5e1] bg-white px-[12px] py-[5px] text-[13.5px] leading-snug text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#15633a] focus:ring-2 focus:ring-[#15633a]/15"
          />

          {/* Handling */}
          <p className="mt-[10px] border-t border-[#eef0f2] pt-[8px] text-[12px] font-semibold uppercase tracking-wide text-[#15803d]">Handling</p>
          <div className="mt-[4px] grid grid-cols-3 gap-x-[16px]">
            <div>
              <p className={label}>Source</p>
              <FieldSelect value={source} options={SOURCES} onChange={setSource} ariaLabel="Source" />
            </div>
            <div>
              <p className={label}>Assign to</p>
              <FieldSelect value={assignedTo} options={ownerOptions} onChange={setAssignedTo} ariaLabel="Assign to" />
            </div>
            <div>
              <p className={label}>Follow-up</p>
              <input type="datetime-local" value={followUpAt} onChange={(e) => setFollowUpAt(e.target.value)} aria-label="Follow-up date and time" className={`${input} px-[8px]`} />
            </div>
          </div>

          <p className="mt-[10px] flex items-center gap-[10px] rounded-[7px] bg-[#f3f5f8] px-[11px] py-[6px] text-[12px] text-[#334155]">
            <Info className="h-[16px] w-[16px] shrink-0" /> Demo preview — the enquiry is added to this list only and is not saved.
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
              Create Enquiry
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
