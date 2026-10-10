"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, ChevronDown, Info, UserRound, Users, X } from "lucide-react";

/*
 * "Reassign Enquiry" popup, opened from a row of the inbox. Owners are the admin panel's staff
 * (Staff Management) with their open records; teams are the ones used in Forms & Routing.
 * It closes only from the ✕, Cancel or after confirming — not on outside clicks or Escape.
 * Rendered into document.body so the inbox page's zoom does not shrink it.
 */

/** Same teams as the Chatbot Manager's Forms & Routing */
export const INBOX_TEAMS = ["Sales Team", "Registration Team", "Buyer Team", "HR Team", "Team Lead", "Admin"] as const;
const TEAMS = INBOX_TEAMS;

/** A staff member records can be assigned to, with how many open records they hold */
export type OwnerInfo = { name: string; available: boolean; open: number; email?: string };

const REASONS = ["Current owner unavailable", "Workload balancing", "Needs topic expertise", "Visitor requested a change", "Other"] as const;

export type Reassignment = { team: string; owner: string; reason: string; note: string; notify: boolean };

/** The inbox row being (re)assigned */
export type EnquiryRef = { id: number; name: string; topic: string; detail: string; assignedTo: string; team?: string };

/** Usual team for each inbox topic, when the record has no team yet */
const TOPIC_TEAM: Record<string, (typeof TEAMS)[number]> = {
  "Stall Booking": "Sales Team",
  "Callback Request": "Sales Team",
  Sponsorship: "Sales Team",
  Partnership: "Sales Team",
  Registration: "Registration Team",
  "Buyer–Seller Meet": "Buyer Team",
};
const teamOf = (e: EnquiryRef | null): (typeof TEAMS)[number] =>
  (TEAMS as readonly string[]).includes(e?.team ?? "") ? (e!.team as (typeof TEAMS)[number]) : (TOPIC_TEAM[e?.topic ?? ""] ?? "Admin");

type Props = {
  /** null keeps the popup closed */
  enquiry: EnquiryRef | null;
  /** Staff to choose from */
  owners: OwnerInfo[];
  onClose: () => void;
  onConfirm: (result: Reassignment) => void;
};

const fieldBox = "relative flex h-[30px] items-center rounded-[7px] border border-[#cbd5e1] bg-white px-[12px] transition focus-within:border-[#15633a] focus-within:ring-2 focus-within:ring-[#15633a]/15";
const hiddenSelect = "absolute inset-0 h-full w-full cursor-pointer opacity-0";
const label = "mb-[3px] block text-[13.5px] font-semibold text-[#0f172a]";

/** Mount with `key={enquiry.id}` so each enquiry starts from its own defaults */
export default function ReassignEnquiryModal({ enquiry, owners, onClose, onConfirm }: Props) {
  const open = enquiry !== null;
  const unassigned = enquiry?.assignedTo === "Unassigned";
  const [team, setTeam] = useState<(typeof TEAMS)[number]>(() => teamOf(enquiry));
  // Starts on someone other than the current owner, preferring whoever is available with the fewest open records
  const [ownerName, setOwnerName] = useState(
    () => [...owners].filter((o) => o.name !== enquiry?.assignedTo).sort((a, b) => Number(b.available) - Number(a.available) || a.open - b.open)[0]?.name ?? owners[0]?.name ?? ""
  );
  const [reason, setReason] = useState<(typeof REASONS)[number]>(unassigned ? "Workload balancing" : "Current owner unavailable");
  const [note, setNote] = useState("");
  const [notify, setNotify] = useState(true);
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

  const owner: OwnerInfo = owners.find((o) => o.name === ownerName) ?? owners[0] ?? { name: "", available: false, open: 0 };
  const noStaff = owners.length === 0;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 font-sans">
      <div aria-hidden="true" className="absolute inset-0 bg-[#0b1f14]/55 backdrop-blur-[2px]" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reassign-title"
        className="relative flex max-h-[calc(100vh-32px)] w-[500px] max-w-full flex-col rounded-[14px] bg-white text-[#0f172a] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)]"
      >
        <div className="min-h-0 overflow-y-auto px-[18px] pb-[11px] pt-[11px]">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 id="reassign-title" className="text-[18.5px] font-bold leading-tight text-[#0f2a1c]">
                {unassigned ? "Assign Enquiry" : "Reassign Enquiry"}
              </h2>
              <p className="text-[13px] text-[#475569]">Admin / Team Lead only</p>
            </div>
            <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="-mr-[4px] grid h-[30px] w-[30px] place-items-center rounded-full text-[#0f172a] transition hover:bg-slate-100">
              <X className="h-[20px] w-[20px]" />
            </button>
          </div>

          {/* Enquiry */}
          <div className="mt-[7px] rounded-[9px] border border-[#d9ecdf] bg-[#eef7f0] px-[14px] py-[5px]">
            <p className="text-[14.5px] font-bold text-[#0f172a]">
              #OM-{1047 + enquiry.id} • {enquiry.name}
            </p>
            <p className="text-[13.5px] text-[#334155]">
              {enquiry.topic} • {enquiry.detail}
            </p>
          </div>

          {/* Current assignment */}
          <div className="mt-[6px] flex items-center gap-[12px] rounded-[9px] border border-[#eef0f2] px-[14px] py-[5px]">
            <span
              className={`rounded-[6px] px-[10px] py-[3px] text-[12.5px] font-medium ${unassigned ? "bg-[#fdf0dc] text-[#b45309]" : "bg-[#dcf3e1] text-[#15803d]"}`}
            >
              {unassigned ? "Unassigned" : "Assigned"}
            </span>
            <div>
              <p className="flex items-center gap-[8px] text-[14px] text-[#0f172a]">
                <Users className="h-[17px] w-[17px]" /> {enquiry.team || "No team yet"} <ArrowRight className="h-[16px] w-[16px]" />{" "}
                {unassigned ? "No owner yet" : enquiry.assignedTo}
              </p>
              <p className="ml-[25px] text-[12px] text-[#64748b]">Topic: {enquiry.topic}</p>
            </div>
          </div>

          {/* New team */}
          <p className={`${label} mt-[7px]`}>New team</p>
          <label className={fieldBox}>
            <Users className="mr-[10px] h-[16px] w-[16px] text-[#334155]" />
            <span className="flex-1 text-[13.5px]">{team}</span>
            <ChevronDown className="h-[15px] w-[15px] text-[#0f172a]" />
            <select
              value={team}
              onChange={(e) => {
                const next = e.target.value as (typeof TEAMS)[number];
                setTeam(next);
              }}
              aria-label="New team"
              className={hiddenSelect}
            >
              {TEAMS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          {/* New owner */}
          <p className={`${label} mt-[6px]`}>New owner</p>
          <label className={fieldBox}>
            <UserRound className="mr-[10px] h-[16px] w-[16px] text-[#334155]" />
            <span className="text-[13.5px]">{noStaff ? "No staff yet — add them in Staff Management" : owner.name}</span>
            <span className={`ml-[14px] rounded-[5px] px-[8px] py-0 text-[12px] ${owner.available ? "bg-[#dcf3e1] text-[#15803d]" : "bg-[#fdf0dc] text-[#b45309]"}`}>
              {owner.available ? "Available" : "Away"}
            </span>
            <ChevronDown className="ml-auto h-[15px] w-[15px] text-[#0f172a]" />
            <select value={owner.name} onChange={(e) => setOwnerName(e.target.value)} aria-label="New owner" className={hiddenSelect}>
              {owners.map((o) => (
                <option key={o.name} value={o.name}>
                  {o.name} — {o.available ? "Available" : "Away"} ({o.open} open)
                </option>
              ))}
            </select>
          </label>
          <p className="mt-[2px] text-[12px] text-[#64748b]">
            {owner.open} open enquir{owner.open === 1 ? "y" : "ies"}
            {owner.email ? ` • ${owner.email}` : ""}
          </p>

          {/* Reason */}
          <p className={`${label} mt-[5px]`}>
            Reason for reassignment <span className="text-[#dc2626]">*</span>
          </p>
          <label className={fieldBox}>
            <span className="flex-1 text-[13.5px]">{reason}</span>
            <ChevronDown className="h-[15px] w-[15px] text-[#0f172a]" />
            <select value={reason} onChange={(e) => setReason(e.target.value as (typeof REASONS)[number])} aria-label="Reason for reassignment" className={hiddenSelect}>
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>

          {/* Note */}
          <p className={`${label} mt-[6px]`}>
            Handover note <span className="font-normal text-[#475569]">(optional)</span>
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            maxLength={300}
            className="h-[40px] w-full resize-y rounded-[7px] border border-[#cbd5e1] bg-white px-[12px] py-[5px] text-[13.5px] text-[#0f172a] outline-none transition focus:border-[#15633a] focus:ring-2 focus:ring-[#15633a]/15"
          />

          {/* Notify */}
          <label className="mt-[6px] flex cursor-pointer items-start gap-[12px]">
            <input type="checkbox" checked={notify} onChange={() => setNotify((v) => !v)} className="mt-[1px] h-[19px] w-[19px] cursor-pointer accent-[#15803d]" />
            <span>
              <span className="block text-[13.5px] font-semibold leading-tight text-[#0f172a]">Notify new owner</span>
              <span className="block text-[12px] text-[#475569]">According to notification settings.</span>
            </span>
          </label>

          <p className="mt-[6px] flex items-center gap-[10px] rounded-[7px] bg-[#f3f5f8] px-[11px] py-[5px] text-[12px] text-[#334155]">
            <Info className="h-[16px] w-[16px] shrink-0" /> Chat history and follow-up are retained. This change is recorded in Activity.
          </p>

          {/* Actions */}
          <div className="mt-[7px] flex justify-end gap-[12px]">
            <button type="button" onClick={onClose} className="h-[28px] rounded-[8px] border border-[#cbd5e1] bg-white px-[18px] text-[13.5px] font-semibold text-[#0f172a] transition hover:bg-slate-50">
              Cancel
            </button>
            <button
              type="button"
              disabled={noStaff}
              onClick={() => {
                // "Notify new owner": opens an email to them with the enquiry
                if (notify && owner.email) {
                  const body = `${enquiry.name} — ${enquiry.topic}\n${enquiry.detail}\n\nReason: ${reason}${note.trim() ? `\nNote: ${note.trim()}` : ""}\n\nOpen it in Admin → AI Chatbot → Inbox & Leads.`;
                  window.open(`mailto:${owner.email}?subject=${encodeURIComponent(`Enquiry assigned to you: ${enquiry.name}`)}&body=${encodeURIComponent(body)}`, "_blank");
                }
                onConfirm({ team, owner: owner.name, reason, note: note.trim(), notify });
              }}
              className="h-[28px] rounded-[8px] bg-[#15803d] px-[20px] text-[13.5px] font-semibold text-white shadow-sm transition hover:bg-[#166534]"
            >
              {unassigned ? "Confirm Assignment" : "Confirm Reassignment"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
