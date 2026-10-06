"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bot, CalendarDays, Clock3, Flag, Info, Mail, Phone, Send, StickyNote, UserRound, X } from "lucide-react";

/*
 * Enquiry detail popup, opened from a row's View / Review button in the inbox — design preview
 * with a sample chat history; replies and notes are kept on the page only and not sent to the visitor.
 * It closes only from the ✕ or Close — not on outside clicks or Escape. Rendered into
 * document.body so the inbox page's zoom does not shrink it.
 */

/** The inbox row being viewed */
export type EnquiryDetail = {
  id: number;
  name: string;
  tag: string;
  category: string;
  type: string;
  topic: string;
  detail: string;
  assignedTo: string;
  status: string;
  priority: string;
  followUp: string;
  lastActivity: string;
  channel: string;
  mobile?: string;
  email?: string;
  /** Opened from the Review button (overdue / pending review) */
  review: boolean;
};

/** What happened on the record from this page: replies to the visitor, internal notes, status events */
export type Activity = { kind: "reply" | "note" | "event"; text: string };

export type ComposeMode = "reply" | "note";

type Message = { from: "visitor" | "bot" | "agent" | "note" | "system"; text: string; time: string };

/** Sample conversation built from the row */
function sampleThread(e: EnquiryDetail): Message[] {
  const thread: Message[] = [
    { from: "visitor", text: `Hi, I need help with ${e.topic.toLowerCase()} — ${e.detail.toLowerCase()}.`, time: "10:02 AM" },
    { from: "bot", text: `Thanks for reaching out to Organic Mitra! I've noted your ${e.type.toLowerCase()} and shared it with our team. Someone will get back to you shortly.`, time: "10:02 AM" },
  ];
  if (e.assignedTo !== "Unassigned") thread.push({ from: "system", text: `Assigned to ${e.assignedTo}`, time: "10:05 AM" });
  if (e.category === "complaint") thread.push({ from: "visitor", text: "It has been a while and I still haven't received a reply. Please look into this.", time: "11:40 AM" });
  return thread;
}

const PRIORITY_CLASS: Record<string, string> = {
  High: "bg-[#fdecec] text-[#dc2626]",
  Medium: "bg-[#fdf3e1] text-[#d97706]",
  Low: "bg-[#f1f3f5] text-[#475569]",
};

type Props = {
  /** null keeps the popup closed */
  enquiry: EnquiryDetail | null;
  /** Activity already recorded from this page for the enquiry */
  activity: Activity[];
  /** Which composer tab opens first */
  initialMode?: ComposeMode;
  onClose: () => void;
  onReply: (text: string) => void;
  onNote: (text: string) => void;
  onAssign: () => void;
  onResolve: () => void;
};

const label = "text-[12px] text-[#64748b]";
const value = "text-[13.5px] font-medium text-[#0f172a]";

/** Mount with `key={enquiry.id}` so each enquiry starts with an empty reply box */
export default function EnquiryDetailModal({ enquiry, activity, initialMode = "reply", onClose, onReply, onNote, onAssign, onResolve }: Props) {
  const open = enquiry !== null;
  const [mode, setMode] = useState<ComposeMode>(initialMode);
  const [draft, setDraft] = useState("");
  const draftRef = useRef<HTMLTextAreaElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Closes only from the ✕ or Close — no outside-click or Escape handlers on purpose
  useEffect(() => {
    if (!open) return;
    if (initialMode === "note") draftRef.current?.focus();
    else closeRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open, initialMode]);

  // Keep the latest message in view
  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight });
  }, [open, activity.length]);

  if (!enquiry || typeof document === "undefined") return null;

  const unassigned = enquiry.assignedTo === "Unassigned";
  const resolved = enquiry.status === "Resolved";
  const thread: Message[] = [
    ...sampleThread(enquiry),
    ...activity.map((a): Message => ({ from: a.kind === "reply" ? "agent" : a.kind === "note" ? "note" : "system", text: a.text, time: "Just now" })),
  ];

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    if (mode === "reply") onReply(text);
    else onNote(text);
    setDraft("");
  };

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 font-sans">
      <div aria-hidden="true" className="absolute inset-0 bg-[#0b1f14]/55 backdrop-blur-[2px]" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
        className="relative flex max-h-[calc(100vh-32px)] w-[600px] max-w-full flex-col rounded-[14px] bg-white text-[#0f172a] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)]"
      >
        <div className="min-h-0 overflow-y-auto px-[22px] pb-[14px] pt-[14px]">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 id="detail-title" className="text-[20.5px] font-bold leading-tight text-[#0f2a1c]">
                {enquiry.review ? `Review ${enquiry.type}` : `${enquiry.type} Details`}
              </h2>
              <p className="text-[13px] text-[#475569]">{enquiry.review ? "Needs attention — reply to the visitor or take action." : "Chat history, contact details and status."}</p>
            </div>
            <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="-mr-[4px] grid h-[30px] w-[30px] place-items-center rounded-full text-[#0f172a] transition hover:bg-slate-100">
              <X className="h-[20px] w-[20px]" />
            </button>
          </div>

          {/* Enquiry */}
          <div className="mt-[10px] rounded-[9px] border border-[#d9ecdf] bg-[#eef7f0] px-[14px] py-[7px]">
            <p className="flex items-center gap-[12px] text-[14.5px] font-bold text-[#0f172a]">
              #OM-{1047 + enquiry.id} • {enquiry.name}
              <span className="rounded-[5px] bg-white px-[7px] py-[1px] text-[11px] font-medium text-[#15803d]">{enquiry.tag}</span>
              <span title="Sample enquiry" className="inline-flex items-center gap-[4px] rounded-[5px] bg-[#dcf3e1] px-[7px] py-[1px] text-[11px] font-medium text-[#15803d]">
                Demo data <Info className="h-[11px] w-[11px]" />
              </span>
            </p>
            <p className="text-[13.5px] text-[#334155]">
              {enquiry.type} • {enquiry.topic}
            </p>
            <p className="text-[13.5px] text-[#334155]">{enquiry.detail}</p>
          </div>

          {/* Facts */}
          <div className="mt-[10px] grid grid-cols-3 gap-x-[16px] gap-y-[8px] rounded-[9px] border border-[#eef0f2] px-[14px] py-[9px]">
            <div>
              <p className={label}>Assigned to</p>
              <p className={`flex items-center gap-[6px] ${value} ${unassigned ? "text-[#d97706]" : ""}`}>
                <UserRound className="h-[15px] w-[15px] shrink-0" /> <span className="truncate">{enquiry.assignedTo}</span>
              </p>
            </div>
            <div>
              <p className={label}>Status</p>
              <p className={value}>{enquiry.status}</p>
            </div>
            <div>
              <p className={label}>Priority</p>
              <span className={`inline-flex items-center gap-[5px] rounded-[5px] px-[8px] py-[1px] text-[12.5px] font-medium ${PRIORITY_CLASS[enquiry.priority] ?? PRIORITY_CLASS.Low}`}>
                <Flag className="h-[12px] w-[12px]" /> {enquiry.priority}
              </span>
            </div>
            <div>
              <p className={label}>Next follow-up</p>
              <p className={`flex items-center gap-[6px] ${value} ${enquiry.followUp === "Overdue" ? "text-[#dc2626]" : ""}`}>
                <CalendarDays className="h-[15px] w-[15px] shrink-0" /> {enquiry.followUp}
              </p>
            </div>
            <div>
              <p className={label}>Last activity</p>
              <p className={`flex items-center gap-[6px] ${value}`}>
                <Clock3 className="h-[15px] w-[15px] shrink-0" /> {enquiry.lastActivity}
              </p>
            </div>
            <div className="min-w-0">
              <p className={label}>Contact</p>
              {enquiry.mobile || enquiry.email ? (
                <>
                  {enquiry.mobile && (
                    <p className={`flex items-center gap-[6px] ${value}`}>
                      <Phone className="h-[14px] w-[14px] shrink-0" /> {enquiry.mobile}
                    </p>
                  )}
                  {enquiry.email && (
                    <p className={`flex min-w-0 items-center gap-[6px] ${value}`}>
                      <Mail className="h-[14px] w-[14px] shrink-0" /> <span className="truncate">{enquiry.email}</span>
                    </p>
                  )}
                </>
              ) : (
                <p className="text-[13.5px] text-[#94a3b8]">Not shared</p>
              )}
            </div>
          </div>

          {/* Chat history */}
          <p className="mb-[4px] mt-[10px] text-[13.5px] font-semibold text-[#0f172a]">Chat history</p>
          <div ref={chatRef} className="flex h-[220px] flex-col gap-[8px] overflow-y-auto rounded-[9px] border border-[#eef0f2] bg-[#f8faf9] px-[12px] py-[10px]">
            {thread.map((m, i) =>
              m.from === "system" ? (
                <p key={i} className="self-center rounded-full bg-[#eef0f2] px-[10px] py-[2px] text-[11.5px] text-[#475569]">
                  {m.text} • {m.time}
                </p>
              ) : m.from === "note" ? (
                <div key={i} className="max-w-[80%] self-end rounded-[10px] border border-[#f5e3bf] bg-[#fffaf0] px-[11px] py-[6px]">
                  <span className="mb-[2px] flex items-center gap-[4px] text-[11.5px] font-medium text-[#b45309]">
                    <StickyNote className="h-[12px] w-[12px]" /> Internal note • You • {m.time}
                  </span>
                  <span className="block whitespace-pre-wrap text-[13.5px] leading-snug text-[#0f172a]">{m.text}</span>
                </div>
              ) : (
                <div key={i} className={`flex max-w-[80%] flex-col ${m.from === "agent" ? "self-end items-end" : "self-start items-start"}`}>
                  <span className="mb-[2px] flex items-center gap-[4px] text-[11.5px] text-[#64748b]">
                    {m.from === "bot" && <Bot className="h-[12px] w-[12px]" />}
                    {m.from === "visitor" ? enquiry.name : m.from === "bot" ? "Organic Mitra" : "You"} • {m.time}
                  </span>
                  <span
                    className={`whitespace-pre-wrap rounded-[10px] px-[11px] py-[6px] text-[13.5px] leading-snug ${
                      m.from === "agent" ? "bg-[#15803d] text-white" : m.from === "bot" ? "border border-[#d9ecdf] bg-[#eef7f0] text-[#0f172a]" : "border border-[#e5e7eb] bg-white text-[#0f172a]"
                    }`}
                  >
                    {m.text}
                  </span>
                </div>
              )
            )}
          </div>

          {/* Reply / internal note */}
          <div role="tablist" aria-label="Message type" className="mt-[8px] flex gap-[4px]">
            {(["reply", "note"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => {
                  setMode(m);
                  draftRef.current?.focus();
                }}
                className={`rounded-[6px] px-[10px] py-[3px] text-[12.5px] font-medium transition ${
                  mode === m ? (m === "reply" ? "bg-[#dcf3e1] text-[#15803d]" : "bg-[#fdf0dc] text-[#b45309]") : "text-[#475569] hover:bg-slate-100"
                }`}
              >
                {m === "reply" ? `Reply via ${enquiry.channel}` : "Internal note"}
              </button>
            ))}
          </div>
          <div className="mt-[4px] flex items-end gap-[10px]">
            <textarea
              ref={draftRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={2}
              maxLength={500}
              placeholder={mode === "reply" ? `Reply to ${enquiry.name}… (Enter to send, Shift+Enter for a new line)` : "Note for your team — the visitor won't see this"}
              className={`h-[52px] w-full resize-none rounded-[7px] border px-[12px] ${mode === "note" ? "border-[#f5e3bf] bg-[#fffdf7]" : "border-[#cbd5e1] bg-white"} py-[5px] text-[13.5px] leading-snug text-[#0f172a] outline-none transition focus:border-[#15633a] focus:ring-2 focus:ring-[#15633a]/15`}
            />
            <button
              type="button"
              onClick={send}
              disabled={!draft.trim()}
              className="inline-flex h-[35px] shrink-0 items-center gap-[7px] rounded-[8px] bg-[#15803d] px-[16px] text-[13.5px] font-semibold text-white shadow-sm transition hover:bg-[#166534] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {mode === "reply" ? (
                <>
                  <Send className="h-[15px] w-[15px]" /> Send
                </>
              ) : (
                <>
                  <StickyNote className="h-[15px] w-[15px]" /> Add note
                </>
              )}
            </button>
          </div>

          <p className="mt-[8px] flex items-center gap-[10px] rounded-[7px] bg-[#f3f5f8] px-[11px] py-[6px] text-[12px] text-[#334155]">
            <Info className="h-[16px] w-[16px] shrink-0" /> Demo preview — replies and notes update this record only; nothing is sent to the visitor.
          </p>

          {/* Actions */}
          <div className="mt-[10px] flex justify-end gap-[12px]">
            <button type="button" onClick={onClose} className="h-[30px] rounded-[8px] border border-[#cbd5e1] bg-white px-[22px] text-[13.5px] font-semibold text-[#0f172a] transition hover:bg-slate-50">
              Close
            </button>
            <button type="button" onClick={onAssign} className="h-[30px] rounded-[8px] border border-[#f5c27a] bg-white px-[18px] text-[13.5px] font-semibold text-[#d97706] transition hover:bg-[#fffaf0]">
              {unassigned ? "Assign" : "Reassign"}
            </button>
            {!resolved && (
              <button type="button" onClick={onResolve} className="h-[30px] rounded-[8px] bg-[#15803d] px-[20px] text-[13.5px] font-semibold text-white shadow-sm transition hover:bg-[#166534]">
                Close / Resolve
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
