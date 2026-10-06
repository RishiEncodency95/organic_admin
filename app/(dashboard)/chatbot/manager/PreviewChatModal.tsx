"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ExternalLink, RotateCcw, Send, X } from "lucide-react";
import { BotAvatar, LOGO } from "./managerUi";
import { chatbotManagerApi } from "@/lib/chatbotManagerApi";

/*
 * Clickable preview of the draft Welcome Menu, opened from the manager header's "Preview".
 * Menu clicks follow the draft buttons; typed questions and next options are answered by the
 * real bot with the draft (unpublished) answers and knowledge. Nothing is saved as a chat. Mount it only while open, so every opening starts a fresh conversation. Closes from ✕ or Escape. Rendered into document.body so the page zoom does not
 * shrink it.
 */

export type PreviewButton = {
  id: number;
  label: string;
  hindi: string;
  action: string;
  reply: string;
  options: string[];
  target: string;
  active: boolean;
};

type Message = { from: "bot" | "user"; text: string; pills?: { label: string; run: () => void }[]; note?: string; link?: string };

type Props = {
  open: boolean;
  buttons: PreviewButton[];
  /** Hindi text for sample strings (falls back to the English text) */
  hindi: Record<string, string>;
  onClose: () => void;
};

export default function PreviewChatModal({ open, buttons, hindi, onClose }: Props) {
  const [lang, setLang] = useState<"en" | "hi">("en");
  // null = fresh conversation (just the welcome message)
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const t = (text: string) => (lang === "hi" ? hindi[text] ?? text : text);
  const active = buttons.filter((b) => b.active);
  const labelOf = (b: PreviewButton) => (lang === "hi" && b.hindi ? b.hindi : b.label);

  const menuPills = () => active.map((b) => ({ label: labelOf(b), run: () => press(b) }));

  const welcome = (): Message => ({
    from: "bot",
    text: lang === "hi" ? "नमो गंगे नमस्कार! 🙏\nमैं आपकी क्या मदद कर सकता हूँ?" : "Namo Gange Namaskar! 🙏\nHow can I help you today?",
    pills: menuPills(),
  });
  const shown = messages ?? [welcome()];

  const backToMenu = { label: lang === "hi" ? "↩ मुख्य मेनू" : "↩ Main menu", run: () => say(lang === "hi" ? "मुख्य मेनू" : "Main menu", { from: "bot", text: lang === "hi" ? "और किसमें मदद करूँ?" : "What else can I help with?", pills: menuPills() }) };

  /** Adds the visitor's click and the bot's answer, removing the old buttons */
  const say = (userText: string, reply: Message) =>
    setMessages((prev) => [...(prev ?? [welcome()]).map((m) => ({ ...m, pills: undefined })), { from: "user", text: userText }, reply]);

  const press = (b: PreviewButton) => {
    const reply = t(b.reply) || "…";
    switch (b.action) {
      case "Show Options":
        return say(labelOf(b), {
          from: "bot",
          text: reply,
          pills: [
            ...b.options.filter((o) => o.trim()).map((o) => ({
              label: t(o),
              run: () => ask(t(o)),
            })),
            backToMenu,
          ],
        });
      case "Open Link":
        return say(labelOf(b), { from: "bot", text: reply, link: b.target, pills: [backToMenu] });
      case "Open Form":
        return say(labelOf(b), { from: "bot", text: reply, note: `“${b.target || "Form"}” form opens here`, pills: [backToMenu] });
      case "Talk to Team":
        return say(labelOf(b), { from: "bot", text: reply, note: `Hands over to ${b.target || "the team"}`, pills: [backToMenu] });
      default:
        return say(labelOf(b), { from: "bot", text: reply, pills: [backToMenu] });
    }
  };

  /** Sends a question to the real bot (draft knowledge) and shows its reply */
  const ask = (question: string) => {
    const q = question.trim();
    if (!q || thinking) return;
    const history = (messages ?? [])
      .filter((m) => m.text && m.text !== "…")
      .map((m) => ({ role: m.from === "user" ? ("user" as const) : ("assistant" as const), content: m.text }))
      .slice(-10);
    setInput("");
    setThinking(true);
    setMessages((prev) => [...(prev ?? [welcome()]).map((m) => ({ ...m, pills: undefined })), { from: "user", text: q }, { from: "bot", text: "…" }]);
    chatbotManagerApi
      .test({ question: q, mode: "draft", language: lang === "hi" ? "हिंदी" : "Auto", history })
      .then((r): Message => ({ from: "bot", text: r.text, note: r.found ? undefined : lang === "hi" ? "पक्का जवाब नहीं — Review Queue में जाएगा" : "No verified answer — goes to the Review Queue", pills: [backToMenu] }))
      .catch((e: Error): Message => ({ from: "bot", text: e.message || "The AI could not reply.", note: "Error", pills: [backToMenu] }))
      .then((reply) => setMessages((prev) => [...(prev ?? []).slice(0, -1), reply]))
      .finally(() => setThinking(false));
  };

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 font-sans">
      <div aria-hidden="true" onClick={onClose} className="absolute inset-0 bg-[#0b1f14]/55 backdrop-blur-[2px]" />

      <div role="dialog" aria-modal="true" aria-label="Chatbot preview" className="relative flex h-[620px] max-h-[calc(100vh-32px)] w-[400px] max-w-full flex-col overflow-hidden rounded-[16px] bg-[#f3f8f1] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)]">
        {/* Header */}
        <div className="flex h-[66px] shrink-0 items-center gap-[12px] bg-gradient-to-br from-[#1f6b2a] to-[#14532d] px-[16px] text-white">
          <span className="grid h-[44px] w-[44px] shrink-0 place-items-center rounded-full bg-white shadow-md ring-[3px] ring-white/25">
            <Image src={LOGO} alt="Organic Mitra" width={64} height={64} className="h-[34px] w-[34px] object-contain" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[17px] font-semibold leading-tight">Organic Mitra</p>
            <p className="text-[12.5px] text-white/85">Draft preview — not live</p>
          </div>
          <div className="flex overflow-hidden rounded-[6px] border border-white/30 text-[12.5px]">
            {(["en", "hi"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => {
                  setLang(l);
                  setMessages(null);
                }} aria-pressed={lang === l} className={`px-[8px] py-[3px] ${lang === l ? "bg-white font-semibold text-[#14532d]" : "text-white hover:bg-white/10"}`}>
                {l === "en" ? "EN" : "हिं"}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setMessages(null)} aria-label="Restart conversation" title="Restart" className="grid h-[30px] w-[30px] place-items-center rounded-full hover:bg-white/10">
            <RotateCcw className="h-[17px] w-[17px]" />
          </button>
          <button type="button" onClick={onClose} aria-label="Close preview" className="grid h-[30px] w-[30px] place-items-center rounded-full hover:bg-white/10">
            <X className="h-[20px] w-[20px]" />
          </button>
        </div>

        {/* Messages */}
        <div ref={listRef} className="flex min-h-0 flex-1 flex-col gap-[10px] overflow-y-auto px-[12px] py-[12px]">
          {shown.map((m, i) =>
            m.from === "user" ? (
              <span key={i} className="max-w-[80%] self-end rounded-[10px] rounded-br-[3px] bg-[#15633a] px-[14px] py-[7px] text-[14px] text-white">
                {m.text}
              </span>
            ) : (
              <div key={i} className="flex items-start gap-[10px]">
                <BotAvatar size={32} />
                <div className="min-w-0 max-w-[290px]">
                  <div className="whitespace-pre-line rounded-[10px] bg-white px-[12px] py-[8px] text-[14px] leading-snug text-[#0f172a] shadow-sm">{m.text}</div>
                  {m.link && (
                    <a
                      href={/^https?:\/\//.test(m.link) ? m.link : `https://${m.link}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-[6px] inline-flex max-w-full items-center gap-[6px] rounded-[7px] border border-[#2f8a4c] bg-white px-[10px] py-[4px] text-[13px] text-[#14532d] hover:bg-[#f1f7ee]"
                    >
                      <ExternalLink className="h-[14px] w-[14px] shrink-0" /> <span className="truncate">{m.link || "Link not set"}</span>
                    </a>
                  )}
                  {m.note && <p className="mt-[4px] text-[12px] italic text-[#64748b]">{m.note}</p>}
                  {m.pills && m.pills.length > 0 && (
                    <div className="mt-[6px] flex flex-wrap gap-[6px]">
                      {m.pills.map((p) => (
                        <button key={p.label} type="button" onClick={p.run} className="inline-flex h-[30px] items-center rounded-[8px] border border-[#2f8a4c] bg-white px-[11px] text-[13px] text-[#14532d] transition hover:bg-[#ebf6ee]">
                          {p.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          )}
          {active.length === 0 && <p className="text-center text-[13px] text-[#b45309]">No active buttons — turn at least one button on to show the menu.</p>}
        </div>

        {/* Input: typed questions go to the real bot */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
          className="flex shrink-0 items-center gap-[10px] border-t border-[#e3e8e4] bg-white px-[14px] py-[8px]"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={500}
            placeholder={lang === "hi" ? "सवाल लिखें…" : "Type a question…"}
            aria-label="Preview question"
            className="h-[36px] min-w-0 flex-1 rounded-full border border-[#dfe3e8] px-[16px] text-[14px] text-[#0f172a] outline-none placeholder:text-[#94a3b8] focus:border-[#15633a]"
          />
          <button
            type="submit"
            disabled={!input.trim() || thinking}
            aria-label="Send"
            className="grid h-[36px] w-[36px] place-items-center rounded-full bg-[#15633a] text-white transition hover:bg-[#124f2f] disabled:bg-[#15633a]/40"
          >
            <Send className="h-[17px] w-[17px]" />
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
