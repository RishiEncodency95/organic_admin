"use client";

import { useImperativeHandle, useRef, useState, type Ref } from "react";
import Image from "next/image";
import Link from "next/link";
import { History, Info, LockKeyhole, Plus, Save, Upload, UsersRound, X } from "lucide-react";
import { LOGO, Select, cardClass, inputClass as baseInput, type Notify, type TabHandle } from "./managerUi";

/*
 * "Settings" tab of the Chatbot Manager — design preview with sample settings kept in
 * component state; nothing is saved to or used by the website chatbot.
 * Sized so both columns fit in the Buttons & Flows tab's height (the tabs share one cell).
 */

// ─── Sample data ─────────────────────────────────────────────────────────────

const LANGUAGES = ["English", "हिंदी", "Hinglish"] as const;
type Language = (typeof LANGUAGES)[number];

const TIMEZONES = ["Asia/Kolkata", "Asia/Dubai", "Europe/London", "America/New_York"] as const;
const WORKING_DAYS = ["Mon – Fri", "Mon – Sat", "All days"] as const;
const TIMES = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"] as const;
const RETENTION = ["Set retention period", "30 days", "90 days", "6 months", "1 year"] as const;

type MessageSet = { welcomeGreeting: string; welcomeMessage: string; closingGreeting: string; unknownAnswer: string };

const MESSAGES: Record<"en" | "hi", MessageSet> = {
  en: {
    welcomeGreeting: "Namo Gange Namaskar! 🙏",
    welcomeMessage: "I’m Organic Mitra, your expo assistant. How can I help you today?",
    closingGreeting: "Namo Gange Namaste! 🙏",
    unknownAnswer: "I don’t have a verified answer yet. Would you like help from our team?",
  },
  hi: {
    welcomeGreeting: "नमो गंगे नमस्कार! 🙏",
    welcomeMessage: "मैं Organic Mitra हूँ, आपका एक्सपो सहायक। मैं आपकी क्या मदद कर सकता हूँ?",
    closingGreeting: "नमो गंगे नमस्ते! 🙏",
    unknownAnswer: "मेरे पास अभी इसका पक्का जवाब नहीं है। क्या आप हमारी टीम से मदद लेना चाहेंगे?",
  },
};

// ─── Small pieces ────────────────────────────────────────────────────────────

/* Same tightened fields as the other manager tabs */
const inputClass = `${baseInput} !h-[31px] !text-[13.4px]`;
const labelClass = "mb-[3px] block text-[12.6px] text-[#334155]";
const fieldSelect = "!h-[31px] !text-[13.4px]";
const titleClass = "text-[18.1px] font-bold leading-tight text-[#0f2a1c]";
const subClass = "mt-[1px] text-[12.6px] text-[#64748b]";
const textareaClass =
  "h-[44px] w-full resize-none rounded-[7px] border border-[#dfe3e8] bg-white px-[12px] py-[4px] text-[13.4px] leading-snug text-[#0f172a] outline-none transition focus:border-[#15633a] focus:ring-2 focus:ring-[#15633a]/15";
const Req = () => <span className="text-[#dc2626]"> *</span>;

function Switch({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={onChange} className={`relative h-[22px] w-[42px] shrink-0 rounded-full transition ${on ? "bg-[#15633a]" : "bg-[#cbd5e1]"}`}>
      <span className={`absolute top-[3px] h-[16px] w-[16px] rounded-full bg-white shadow transition-all ${on ? "left-[23px]" : "left-[3px]"}`} />
    </button>
  );
}

function ToggleRow({ title, note, on, onChange }: { title: string; note: string; on: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between gap-[16px]">
      <div className="min-w-0">
        <p className="text-[13.1px] font-medium leading-tight text-[#0f172a]">{title}</p>
        <p className="text-[12.1px] leading-tight text-[#64748b]">{note}</p>
      </div>
      <Switch on={on} onChange={onChange} label={title} />
    </div>
  );
}

// ─── Tab ─────────────────────────────────────────────────────────────────────

type Props = { onChange: () => void; onOpenHistory: () => void; notify: Notify; ref?: Ref<TabHandle> };

const MESSAGE_LABELS: Record<keyof MessageSet, string> = {
  welcomeGreeting: "Welcome Greeting",
  welcomeMessage: "Welcome Message",
  closingGreeting: "Closing Greeting",
  unknownAnswer: "Unknown Answer Message",
};

export default function SettingsTab({ onChange, onOpenHistory, notify, ref }: Props) {
  const [identity, setIdentity] = useState({ name: "Organic Mitra", subtitle: "Bharat Organic Expo Assistant", launcher: "Ask Organic Mitra" });
  const [avatar, setAvatar] = useState(LOGO);
  const [languages, setLanguages] = useState<Language[]>([...LANGUAGES]);
  const [defaultLang, setDefaultLang] = useState<Language>("English");
  const [enabled, setEnabled] = useState(true);
  const [msgLang, setMsgLang] = useState<"en" | "hi">("en");
  const [messages, setMessages] = useState(MESSAGES);
  const [team, setTeam] = useState({
    timezone: "Asia/Kolkata" as (typeof TIMEZONES)[number],
    days: "Mon – Sat" as (typeof WORKING_DAYS)[number],
    from: "10:00 AM" as (typeof TIMES)[number],
    to: "6:00 PM" as (typeof TIMES)[number],
    outside: "Our team is currently unavailable. Leave your enquiry and we’ll follow up during working hours.",
  });
  const [memory, setMemory] = useState({ remember: true, reuse: true, link: true });
  const [retention, setRetention] = useState<(typeof RETENTION)[number]>("Set retention period");
  const fileRef = useRef<HTMLInputElement>(null);
  // Red borders on empty required fields after a failed save
  const [showErrors, setShowErrors] = useState(false);

  const edit = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    onChange();
  };
  const setMessage = (key: keyof MessageSet, value: string) => {
    setMessages((prev) => ({ ...prev, [msgLang]: { ...prev[msgLang], [key]: value } }));
    onChange();
  };
  const removeLanguage = (l: Language) => {
    if (languages.length === 1) return;
    const next = languages.filter((x) => x !== l);
    setLanguages(next);
    if (defaultLang === l) setDefaultLang(next[0]);
    onChange();
  };
  const addLanguage = (l: Language) => {
    setLanguages((prev) => LANGUAGES.filter((x) => x === l || prev.includes(x)));
    onChange();
  };
  const msg = messages[msgLang];
  const missing = (value: string) => (showErrors && !value.trim() ? "!border-[#dc2626]" : "");

  /** First empty required field, switching the message tab to it if needed */
  const findProblem = () => {
    if (!identity.name.trim()) return "Add the chatbot name.";
    if (!identity.subtitle.trim()) return "Add the subtitle.";
    if (!identity.launcher.trim()) return "Add the launcher label.";
    for (const l of ["en", "hi"] as const) {
      const key = (Object.keys(MESSAGE_LABELS) as (keyof MessageSet)[]).find((k) => !messages[l][k].trim());
      if (key) {
        setMsgLang(l);
        return `Add the ${MESSAGE_LABELS[key]} (${l === "en" ? "English" : "हिंदी"}).`;
      }
    }
    if (!team.outside.trim()) return "Add the outside hours message.";
    if (TIMES.indexOf(team.from) >= TIMES.indexOf(team.to)) return "Working hours must end after they start.";
    return "";
  };

  const save = () => {
    const problem = findProblem();
    if (problem) {
      setShowErrors(true);
      notify(problem, { tone: "error" });
      return;
    }
    setShowErrors(false);
    onChange();
    notify("Settings saved to draft");
  };

  useImperativeHandle(ref, () => ({ save }));

  return (
    <div className="grid h-full grid-cols-[704px_1fr] gap-[15px]">
      {/* ── Left: identity + messages ── */}
      <div className="flex min-h-0 flex-col gap-[10px]">
        <div className={`${cardClass} px-[16px] pb-[8px] pt-[7px]`}>
          <p className={titleClass}>Identity &amp; Appearance</p>
          <p className={subClass}>Set how Organic Mitra appears to visitors.</p>

          <div className="mt-[6px] grid grid-cols-[132px_1fr] gap-x-[16px]">
            <div className="flex flex-col items-center gap-[6px]">
              <div className="grid h-[104px] w-[132px] place-items-center rounded-[10px] bg-[#eef6ef]">
                <span className="grid h-[84px] w-[84px] place-items-center rounded-full bg-white shadow-sm">
                  <Image src={avatar} alt="Chatbot avatar" width={160} height={160} unoptimized={avatar.startsWith("blob:")} className="h-[60px] w-[60px] object-contain" />
                </span>
              </div>
              <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-[8px] text-[13.4px] text-[#1d4ed8] hover:underline">
                <Upload className="h-[16px] w-[16px]" /> Change Avatar
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) edit(setAvatar)(URL.createObjectURL(file));
                }}
              />
            </div>

            <div className="flex flex-col gap-[4px]">
              <div className="grid grid-cols-[202px_1fr] gap-x-[18px]">
                <label>
                  <span className={labelClass}>
                    Chatbot Name
                    <Req />
                  </span>
                  <input value={identity.name} onChange={(e) => edit(setIdentity)({ ...identity, name: e.target.value })} maxLength={30} className={`${inputClass} ${missing(identity.name)}`} />
                </label>
                <label>
                  <span className={labelClass}>
                    Subtitle
                    <Req />
                  </span>
                  <input value={identity.subtitle} onChange={(e) => edit(setIdentity)({ ...identity, subtitle: e.target.value })} maxLength={50} className={`${inputClass} ${missing(identity.subtitle)}`} />
                </label>
              </div>
              <label>
                <span className={labelClass}>
                  Launcher Label
                  <Req />
                </span>
                <input value={identity.launcher} onChange={(e) => edit(setIdentity)({ ...identity, launcher: e.target.value })} maxLength={30} className={`${inputClass} ${missing(identity.launcher)}`} />
              </label>
              <div className="grid grid-cols-[184px_1fr] gap-x-[18px]">
                <div>
                  <span className={labelClass}>
                    Default Language
                    <Req />
                  </span>
                  <Select value={defaultLang} options={languages} onChange={edit(setDefaultLang)} label="Default language" selectClassName={fieldSelect} />
                </div>
                <div>
                  <span className={labelClass}>
                    Enabled Languages
                    <Req />
                  </span>
                  <div className="flex h-[31px] items-center gap-[6px] rounded-[7px] border border-[#dfe3e8] px-[3px]">
                    {languages.map((l) => (
                      <span key={l} className="inline-flex h-[24px] items-center gap-[8px] rounded-[5px] bg-[#e8f5ec] pl-[9px] pr-[7px] text-[12.6px] text-[#14532d]">
                        {l}
                        <button type="button" onClick={() => removeLanguage(l)} aria-label={`Remove ${l}`} disabled={languages.length === 1} className="hover:text-[#dc2626] disabled:opacity-40">
                          <X className="h-[14px] w-[14px]" />
                        </button>
                      </span>
                    ))}
                    {/* Shown only when a language was removed: pick it to enable it again */}
                    {languages.length < LANGUAGES.length && (
                      <label title="Add a language" className="relative ml-auto grid h-[24px] w-[24px] shrink-0 cursor-pointer place-items-center rounded-[5px] text-[#14532d] hover:bg-[#e8f5ec]">
                        <Plus className="h-[15px] w-[15px]" />
                        <select
                          value=""
                          onChange={(e) => addLanguage(e.target.value as Language)}
                          aria-label="Add a language"
                          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        >
                          <option value="" disabled>
                            Add language…
                          </option>
                          {LANGUAGES.filter((l) => !languages.includes(l)).map((l) => (
                            <option key={l} value={l}>
                              {l}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-[6px] flex items-center gap-[18px]">
            <div>
              <p className="text-[13.1px] leading-tight text-[#0f172a]">Chatbot Enabled</p>
              <p className="text-[12.1px] leading-tight text-[#64748b]">Make the chatbot available to visitors on the website.</p>
            </div>
            <Switch on={enabled} onChange={() => edit(setEnabled)(!enabled)} label="Chatbot enabled" />
          </div>
        </div>

        <div className={`${cardClass} flex flex-1 flex-col px-[16px] pb-[8px] pt-[7px]`}>
          <p className={titleClass}>Greetings &amp; Messages</p>
          <p className={subClass}>Configure the key messages used in conversation.</p>

          <div className="mt-[4px] flex border-b border-[#e5e7eb]">
            {(["en", "hi"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setMsgLang(l)}
                aria-pressed={msgLang === l}
                className={`-mb-px w-[80px] border-b-[3px] pb-[4px] text-[13.4px] transition ${
                  msgLang === l ? "border-[#15633a] font-medium text-[#14532d]" : "border-transparent text-[#475569] hover:text-[#15633a]"
                }`}
              >
                {l === "en" ? "English" : "हिंदी"}
              </button>
            ))}
          </div>

          <div className="mt-[4px] grid grid-cols-[306px_1fr] gap-x-[18px] gap-y-[4px]">
            <label>
              <span className={labelClass}>
                Welcome Greeting
                <Req />
              </span>
              <input value={msg.welcomeGreeting} onChange={(e) => setMessage("welcomeGreeting", e.target.value)} maxLength={60} className={`${inputClass} ${missing(msg.welcomeGreeting)}`} />
            </label>
            <label>
              <span className={labelClass}>
                Welcome Message
                <Req />
              </span>
              <textarea value={msg.welcomeMessage} onChange={(e) => setMessage("welcomeMessage", e.target.value)} rows={2} maxLength={200} className={`${textareaClass} ${missing(msg.welcomeMessage)}`} />
            </label>
            <label>
              <span className={labelClass}>
                Closing Greeting
                <Req />
              </span>
              <input value={msg.closingGreeting} onChange={(e) => setMessage("closingGreeting", e.target.value)} maxLength={60} className={`${inputClass} ${missing(msg.closingGreeting)}`} />
            </label>
            <label>
              <span className={labelClass}>
                Unknown Answer Message
                <Req />
              </span>
              <textarea value={msg.unknownAnswer} onChange={(e) => setMessage("unknownAnswer", e.target.value)} rows={2} maxLength={200} className={`${textareaClass} ${missing(msg.unknownAnswer)}`} />
            </label>
          </div>

          <p className="mt-auto flex items-center gap-[12px] pt-[6px] text-[12.4px] text-[#64748b]">
            <Info className="h-[16px] w-[16px]" /> Closing greeting appears only when chat ends.
          </p>
        </div>
      </div>

      {/* ── Right: availability + returning visitors ── */}
      <div className="flex min-h-0 flex-col gap-[10px]">
        <div className={`${cardClass} px-[16px] pb-[8px] pt-[7px]`}>
          <p className={titleClass}>Team Availability</p>
          <p className={subClass}>Set when your team is available to respond to enquiries.</p>

          <div className="mt-[4px] grid grid-cols-2 gap-x-[18px]">
            <div>
              <span className={labelClass}>
                Timezone
                <Req />
              </span>
              <Select value={team.timezone} options={TIMEZONES} onChange={(timezone) => edit(setTeam)({ ...team, timezone })} label="Timezone" selectClassName={fieldSelect} />
            </div>
            <div>
              <span className={labelClass}>
                Working Days
                <Req />
              </span>
              <Select value={team.days} options={WORKING_DAYS} onChange={(days) => edit(setTeam)({ ...team, days })} label="Working days" selectClassName={fieldSelect} />
            </div>
          </div>

          <p className={`${labelClass} mt-[4px]`}>
            Working Hours
            <Req />
          </p>
          <div className="grid grid-cols-[1fr_56px_1fr] items-center">
            <Select value={team.from} options={TIMES} onChange={(from) => edit(setTeam)({ ...team, from })} label="Working hours from" selectClassName={fieldSelect} />
            <span className="text-center text-[13.4px] text-[#64748b]">to</span>
            <Select value={team.to} options={TIMES} onChange={(to) => edit(setTeam)({ ...team, to })} label="Working hours to" selectClassName={fieldSelect} />
          </div>

          <label className="mt-[4px] block">
            <span className={labelClass}>
              Outside Hours Message
              <Req />
            </span>
            <textarea value={team.outside} onChange={(e) => edit(setTeam)({ ...team, outside: e.target.value })} rows={2} maxLength={250} className={`${textareaClass} ${missing(team.outside)}`} />
          </label>

          <p className="mt-[4px] flex items-center gap-[12px] text-[12.4px] text-[#64748b]">
            <Info className="h-[16px] w-[16px]" /> Sample schedule — set your actual team hours.
          </p>
        </div>

        <div className={`${cardClass} flex flex-1 flex-col px-[16px] pb-[8px] pt-[7px]`}>
          <p className={titleClass}>Returning Visitors &amp; History</p>
          <p className={subClass}>Manage how visitor information is remembered and accessed.</p>

          <div className="mt-[4px] flex flex-col gap-[4px]">
            <ToggleRow
              title="Remember visitor on this browser"
              note="Keep basic preferences to improve experience."
              on={memory.remember}
              onChange={() => edit(setMemory)({ ...memory, remember: !memory.remember })}
            />
            <ToggleRow title="Reuse details in current session" note="Pre-fill known information during this visit." on={memory.reuse} onChange={() => edit(setMemory)({ ...memory, reuse: !memory.reuse })} />
            <ToggleRow
              title="Link verified enquiries to existing profile"
              note="Match enquiries with existing visitor profile (if verified)."
              on={memory.link}
              onChange={() => edit(setMemory)({ ...memory, link: !memory.link })}
            />
          </div>

          <div className="mt-[4px] flex items-start gap-[12px] rounded-[8px] border border-[#dbe5f7] bg-[#f3f7fd] px-[12px] py-[4px]">
            <LockKeyhole className="mt-[2px] h-[17px] w-[17px] shrink-0 text-[#1d4ed8]" />
            <p className="text-[11.6px] leading-snug text-[#1e3a8a]">
              Login or OTP verification is required before showing previous private chats or enquiry status.
              <br />
              <span className="text-[#64748b]">Browser recognition alone does not verify identity.</span>
            </p>
          </div>

          <div className="mt-[4px] grid grid-cols-[296px_1fr] items-end gap-x-[24px]">
            <div>
              <span className={labelClass}>Conversation Retention</span>
              <Select value={retention} options={RETENTION} onChange={edit(setRetention)} label="Conversation retention" selectClassName={fieldSelect} />
            </div>
            <div>
              <span className={labelClass}>Access &amp; Permissions</span>
              <Link href="/roles" className="flex h-[31px] items-center gap-[10px] text-[13.4px] text-[#1d4ed8] underline underline-offset-2 hover:text-[#15633a]">
                <UsersRound className="h-[18px] w-[18px] no-underline" /> Configure Roles
              </Link>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pl-[4px]">
          <span className="flex items-center gap-[10px] text-[12.4px] text-[#64748b]">
            <Info className="h-[16px] w-[16px]" /> Draft changes apply after publishing.
          </span>
          <div className="flex items-center gap-[24px]">
            <button
              type="button"
              onClick={save}
              className="inline-flex h-[33px] items-center gap-[8px] rounded-[7px] bg-[#15633a] px-[18px] text-[13.4px] font-medium text-white shadow-sm transition hover:bg-[#124f2f]"
            >
              <Save className="h-[16px] w-[16px]" /> Save Settings
            </button>
            <button type="button" onClick={onOpenHistory} className="flex items-center gap-[7px] text-[13.1px] text-[#1d4ed8] hover:underline">
              <History className="h-[16px] w-[16px]" /> Version History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
