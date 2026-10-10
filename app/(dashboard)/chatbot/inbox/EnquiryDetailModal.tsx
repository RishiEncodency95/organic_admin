"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { chatbotApi, type ChatMessage } from "@/lib/chatbotApi";
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
  /** The saved chat behind the record (its transcript is loaded from the server) */
  chatId?: string;
  /** Added by hand in the inbox: there is no website chat to show */
  manual?: boolean;
  createdAt?: string;
};

/** What happened on the record: replies to the visitor, internal notes, status events (saved with the chat) */
export type Activity = { kind: "reply" | "note" | "event"; text: string; by?: string; at?: string };

export type ComposeMode = "reply" | "note";

type Message = { from: "visitor" | "bot" | "agent" | "note" | "system"; text: string; time: string; by?: string; at: number };

/** "Today, 3:05 PM" / "12 Oct, 3:05 PM" */
const timeLabel = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const time = d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase();
  return d.toDateString() === new Date().toDateString() ? time : `${d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}, ${time}`;
};
const stamp = (iso?: string) => (iso ? new Date(iso).getTime() || 0 : 0);

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
  // The website conversation behind the record, loaded once per open record
  const [transcript, setTranscript] = useState<{ id: string; messages: ChatMessage[]; failed?: boolean } | null>(null);
  const chatId = enquiry?.manual ? undefined : enquiry?.chatId;
  const transcriptLoading = !!chatId && transcript?.id !== chatId;

  useEffect(() => {
    if (!chatId) return;
    let cancelled = false;
    chatbotApi
      .get(chatId)
      .then((chat) => !cancelled && setTranscript({ id: chatId, messages: chat.messages || [] }))
      .catch(() => !cancelled && setTranscript({ id: chatId, messages: [], failed: true }));
    return () => {
      cancelled = true;
    };
  }, [chatId]);

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
  }, [open, activity.length, transcript]);

  if (!enquiry || typeof document === "undefined") return null;

  const unassigned = enquiry.assignedTo === "Unassigned";
  const resolved = enquiry.status === "Resolved";
  // The visitor's chat (or the hand-entered enquiry) followed by the team's activity, in time order
  const opening: Message[] = enquiry.manual
    ? [{ from: "visitor", text: enquiry.detail || enquiry.topic, time: timeLabel(enquiry.createdAt), at: stamp(enquiry.createdAt) }]
    : (transcript && transcript.id === chatId ? transcript.messages : []).map((m): Message => ({
        from: m.role === "user" ? "visitor" : "bot",
        text: m.content,
        time: timeLabel(m.createdAt),
        at: stamp(m.createdAt),
      }));
  const thread: Message[] = [
    ...opening,
    ...activity.map((a): Message => ({
      from: a.kind === "reply" ? "agent" : a.kind === "note" ? "note" : "system",
      text: a.text,
      time: timeLabel(a.at) || "Just now",
      by: a.by,
      // Entries without a time (none are saved that way) go last
      at: stamp(a.at) || Number.MAX_SAFE_INTEGER,
    })),
  ].sort((a, b) => a.at - b.at);
  const whatsappTo = enquiry.mobile ? `91${enquiry.mobile.replace(/\D/g, "").slice(-10)}` : "";

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    if (mode === "reply") {
      onReply(text);
      // The reply reaches the visitor through your WhatsApp, with the message filled in
      if (whatsappTo) window.open(`https://wa.me/${whatsappTo}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    } else onNote(text);
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
        <div className="min-h-0 overflow-y-auto px-[18px] pb-[11px] pt-[11px]">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 id="detail-title" className="text-[18.5px] font-bold leading-tight text-[#0f2a1c]">
                {enquiry.review ? `Review ${enquiry.type}` : `${enquiry.type} Details`}
              </h2>
              <p className="text-[13px] text-[#475569]">{enquiry.review ? "Needs attention — reply to the visitor or take action." : "Chat history, contact details and status."}</p>
            </div>
            <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="-mr-[4px] grid h-[28px] w-[28px] place-items-center rounded-full text-[#0f172a] transition hover:bg-slate-100">
              <X className="h-[20px] w-[20px]" />
            </button>
          </div>

          {/* Enquiry */}
          <div className="mt-[7px] rounded-[9px] border border-[#d9ecdf] bg-[#eef7f0] px-[14px] py-[5px]">
            <p className="flex items-center gap-[12px] text-[14.5px] font-bold text-[#0f172a]">
              #OM-{1047 + enquiry.id} • {enquiry.name}
              <span className="rounded-[5px] bg-white px-[7px] py-[1px] text-[11px] font-medium text-[#15803d]">{enquiry.tag}</span>
              <span className="rounded-[5px] bg-white px-[7px] py-[1px] text-[11px] font-medium text-[#475569]">{enquiry.channel}</span>
            </p>
            <p className="text-[13.5px] text-[#334155]">
              {enquiry.type} • {enquiry.topic}
            </p>
            <p className="text-[13.5px] text-[#334155]">{enquiry.detail}</p>
          </div>

          {/* Facts */}
          <div className="mt-[7px] grid grid-cols-3 gap-x-[12px] gap-y-[6px] rounded-[9px] border border-[#eef0f2] px-[14px] py-[7px]">
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
          <p className="mb-[4px] mt-[7px] text-[13.5px] font-semibold text-[#0f172a]">Chat history</p>
          <div ref={chatRef} className="flex h-[190px] flex-col gap-[8px] overflow-y-auto rounded-[9px] border border-[#eef0f2] bg-[#f8faf9] px-[12px] py-[8px]">
            {transcriptLoading && <p className="self-center text-[12px] text-[#64748b]">Loading chat…</p>}
            {transcript?.failed && transcript.id === chatId && <p className="self-center text-[12px] text-[#dc2626]">Could not load the chat.</p>}
            {!transcriptLoading && !thread.length && <p className="self-center text-[12px] text-[#64748b]">The visitor only browsed the chatbot menu.</p>}
            {thread.map((m, i) =>
              m.from === "system" ? (
                <p key={i} className="self-center rounded-full bg-[#eef0f2] px-[10px] py-[2px] text-[11.5px] text-[#475569]">
                  {m.text} • {m.by ? `${m.by} • ` : ""}{m.time}
                </p>
              ) : m.from === "note" ? (
                <div key={i} className="max-w-[80%] self-end rounded-[10px] border border-[#f5e3bf] bg-[#fffaf0] px-[11px] py-[5px]">
                  <span className="mb-[2px] flex items-center gap-[4px] text-[11.5px] font-medium text-[#b45309]">
                    <StickyNote className="h-[12px] w-[12px]" /> Internal note • {m.by || "You"} • {m.time}
                  </span>
                  <span className="block whitespace-pre-wrap text-[13.5px] leading-snug text-[#0f172a]">{m.text}</span>
                </div>
              ) : (
                <div key={i} className={`flex max-w-[80%] flex-col ${m.from === "agent" ? "self-end items-end" : "self-start items-start"}`}>
                  <span className="mb-[2px] flex items-center gap-[4px] text-[11.5px] text-[#64748b]">
                    {m.from === "bot" && <Bot className="h-[12px] w-[12px]" />}
                    {m.from === "visitor" ? enquiry.name : m.from === "bot" ? "Organic Mitra" : m.by || "You"} • {m.time}
                  </span>
                  <span
                    className={`whitespace-pre-wrap rounded-[10px] px-[11px] py-[5px] text-[13.5px] leading-snug ${
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
          <div role="tablist" aria-label="Message type" className="mt-[6px] flex gap-[4px]">
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
                {m === "reply" ? (whatsappTo ? "Reply on WhatsApp" : "Log a reply") : "Internal note"}
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
              className={`h-[44px] w-full resize-none rounded-[7px] border px-[12px] ${mode === "note" ? "border-[#f5e3bf] bg-[#fffdf7]" : "border-[#cbd5e1] bg-white"} py-[5px] text-[13.5px] leading-snug text-[#0f172a] outline-none transition focus:border-[#15633a] focus:ring-2 focus:ring-[#15633a]/15`}
            />
            <button
              type="button"
              onClick={send}
              disabled={!draft.trim()}
              className="inline-flex h-[31px] shrink-0 items-center gap-[7px] rounded-[8px] bg-[#15803d] px-[16px] text-[13.5px] font-semibold text-white shadow-sm transition hover:bg-[#166534] disabled:cursor-not-allowed disabled:opacity-50"
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

          <p className="mt-[6px] flex items-center gap-[10px] rounded-[7px] bg-[#f3f5f8] px-[11px] py-[5px] text-[12px] text-[#334155]">
            <Info className="h-[16px] w-[16px] shrink-0" />
            {whatsappTo
              ? "Send saves the reply on this record and opens WhatsApp with it, ready to send to the visitor. Notes stay internal."
              : "No mobile number: replies are saved on this record as a log (contact the visitor yourself). Notes stay internal."}
          </p>

          {/* Actions */}
          <div className="mt-[7px] flex justify-end gap-[12px]">
            <button type="button" onClick={onClose} className="h-[28px] rounded-[8px] border border-[#cbd5e1] bg-white px-[18px] text-[13.5px] font-semibold text-[#0f172a] transition hover:bg-slate-50">
              Close
            </button>
            <button type="button" onClick={onAssign} className="h-[28px] rounded-[8px] border border-[#f5c27a] bg-white px-[18px] text-[13.5px] font-semibold text-[#d97706] transition hover:bg-[#fffaf0]">
              {unassigned ? "Assign" : "Reassign"}
            </button>
            {!resolved && (
              <button type="button" onClick={onResolve} className="h-[28px] rounded-[8px] bg-[#15803d] px-[20px] text-[13.5px] font-semibold text-white shadow-sm transition hover:bg-[#166534]">
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
