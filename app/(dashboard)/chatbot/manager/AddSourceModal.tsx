"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, CircleHelp, CloudUpload, Eye, FileText, Globe, Info, MessageSquareText, NotebookPen, Plus, Settings, X } from "lucide-react";

/*
 * "Add Knowledge Source" popup — opened from "Add Source" in the AI Knowledge & Answers tab.
 * Design preview: nothing is fetched, uploaded or indexed; the source is added to the
 * table as a draft. Closes only from the ✕, Cancel or after importing — not on outside
 * clicks or Escape. Rendered into document.body so the page's zoom does not shrink it.
 */

export type SourceKind = "web" | "pdf" | "manual";

export type NewSource = { kind: SourceKind; name: string; url?: string; topic: string; owner: string };

const TOPICS = ["General Information", "Exhibitors", "Visitors", "Buyer–Seller Meet", "Conference & Awards"] as const;
const OWNERS = ["Content Team", "Sales Team", "Visitor Team", "Admin"] as const;
const FREQUENCIES = ["Daily", "Weekly", "Monthly", "Manually"] as const;
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const FILE_TYPES = /\.(pdf|docx|txt)$/i;

const KIND_TABS: { kind: SourceKind; label: string; icon: typeof Globe }[] = [
  { kind: "web", label: "Website Page", icon: Globe },
  { kind: "pdf", label: "Document", icon: FileText },
  { kind: "manual", label: "Text / FAQ", icon: MessageSquareText },
];

/** Sample values shown when the popup opens on each tab */
const DEFAULT_NAME: Record<SourceKind, string> = { web: "Expo Information", pdf: "Exhibitor Brochure 2027", manual: "" };
const DEFAULT_TOPIC: Record<SourceKind, (typeof TOPICS)[number]> = { web: "General Information", pdf: "Exhibitors", manual: "General Information" };
const DEFAULT_OWNER: Record<SourceKind, (typeof OWNERS)[number]> = { web: "Content Team", pdf: "Sales Team", manual: "Content Team" };

type Props = {
  /** Tab to open on; null keeps the popup closed */
  kind: SourceKind | null;
  onClose: () => void;
  onImport: (source: NewSource) => void;
};

type ErrorKey = "name" | "url" | "file" | "question" | "answer" | "text";

const label = "mb-[4px] block text-[13.5px] font-semibold text-[#0f172a]";
const input =
  "h-[36px] w-full rounded-[7px] border bg-white px-[14px] text-[14px] text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#15633a] focus:ring-2 focus:ring-[#15633a]/15";
const Req = () => <span className="text-[#dc2626]"> *</span>;
const formatSize = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

function FieldSelect<T extends string>({ value, options, onChange, ariaLabel }: { value: T; options: readonly T[]; onChange: (v: T) => void; ariaLabel: string }) {
  return (
    <label className="relative block">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        aria-label={ariaLabel}
        className="h-[36px] w-full cursor-pointer appearance-none rounded-[7px] border border-[#cbd5e1] bg-white pl-[14px] pr-[36px] text-[14px] text-[#0f172a] outline-none transition focus:border-[#15633a]"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-[13px] top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-[#0f172a]" />
    </label>
  );
}

/** Collapsible row used for "Advanced options" and "Reference / internal note" */
function Expandable({ icon: Icon, title, children }: { icon: typeof Settings; title: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-[7px] border border-[#e5e7eb]">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex h-[36px] w-full items-center gap-[10px] px-[12px] text-[13.5px] text-[#0f172a]">
        <Icon className="h-[16px] w-[16px]" /> {title}
        <ChevronDown className={`ml-auto h-[16px] w-[16px] transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="border-t border-[#eef0f2] px-[12px] py-[8px] text-[13px] text-[#334155]">{children}</div>}
    </div>
  );
}

/** Mount with a `key` per opening so each one starts fresh */
export default function AddSourceModal({ kind, onClose, onImport }: Props) {
  const start = kind ?? "web";
  const [tab, setTab] = useState<SourceKind>(start);
  const [name, setName] = useState(DEFAULT_NAME[start]);
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>(DEFAULT_TOPIC[start]);
  const [owner, setOwner] = useState<(typeof OWNERS)[number]>(DEFAULT_OWNER[start]);
  // Website
  const [url, setUrl] = useState("https://bharatorganicexpo.com/");
  const [frequency, setFrequency] = useState<(typeof FREQUENCIES)[number]>("Daily");
  const [includeLinked, setIncludeLinked] = useState(false);
  // Document
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  // Text / FAQ
  const [textMode, setTextMode] = useState<"faq" | "text">("faq");
  const [question, setQuestion] = useState("When and where is Bharat Organic Expo 2027?");
  const [answerLang, setAnswerLang] = useState<"en" | "hi">("en");
  const [answer, setAnswer] = useState({
    en: "Bharat Organic Expo 2027 will be held from 19–21 February 2027 at Bharat Mandapam, New Delhi.",
    hi: "भारत ऑर्गेनिक एक्सपो 2027, 19–21 फ़रवरी 2027 को भारत मंडपम, नई दिल्ली में होगा।",
  });
  const [phrases, setPhrases] = useState(["Expo kab hai?", "Where is the expo?"]);
  const [newPhrase, setNewPhrase] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [reference, setReference] = useState("");

  const [errors, setErrors] = useState<Partial<Record<ErrorKey, string>>>({});
  const closeRef = useRef<HTMLButtonElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const open = kind !== null;

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

  const pickFile = (f: File | undefined | null) => {
    if (!f) return;
    if (!FILE_TYPES.test(f.name)) return setErrors((e) => ({ ...e, file: "Only PDF, DOCX or TXT files can be imported." }));
    if (f.size > MAX_FILE_BYTES) return setErrors((e) => ({ ...e, file: "This file is larger than 10 MB." }));
    setFile(f);
    setErrors((e) => ({ ...e, file: undefined }));
    if (!name.trim()) setName(f.name.replace(/\.[^.]+$/, ""));
  };

  const addPhrase = () => {
    const p = newPhrase?.trim();
    if (p && !phrases.includes(p)) setPhrases((prev) => [...prev, p]);
    setNewPhrase(null);
  };

  const submit = () => {
    const next: typeof errors = {};
    let host: string | undefined;
    let sourceName = name.trim();
    if (tab === "web") {
      if (!sourceName) next.name = "Please enter a source name.";
      try {
        const parsed = new URL(url.trim());
        if (!/^https?:$/.test(parsed.protocol)) throw new Error();
        host = `${parsed.hostname}${parsed.pathname === "/" ? "" : parsed.pathname}`;
      } catch {
        next.url = "Enter a full website address, e.g. https://bharatorganicexpo.com/";
      }
    } else if (tab === "pdf") {
      if (!sourceName) next.name = "Please enter a source name.";
      if (!file) next.file = "Please choose a PDF, DOCX or TXT file.";
    } else if (textMode === "faq") {
      if (!question.trim()) next.question = "Please enter the question.";
      if (!answer.en.trim() && !answer.hi.trim()) next.answer = "Please write the answer.";
      sourceName = question.trim();
    } else {
      if (!sourceName) next.name = "Please enter a title.";
      if (!text.trim()) next.text = "Please add the text content.";
    }
    setErrors(next);
    if (Object.keys(next).length) return;
    onImport({ kind: tab, name: sourceName, url: host, topic, owner });
  };

  const fieldError = (key: ErrorKey) =>
    errors[key] && (
      <p role="alert" className="mt-[3px] text-[12px] text-[#dc2626]">
        {errors[key]}
      </p>
    );
  const border = (key: ErrorKey) => (errors[key] ? "border-[#f87171]" : "border-[#cbd5e1]");
  const topicOwner = (
    <div className="grid grid-cols-2 gap-x-[18px]">
      <div>
        <p className={label}>
          Topic
          <Req />
        </p>
        <FieldSelect value={topic} options={TOPICS} onChange={setTopic} ariaLabel="Topic" />
      </div>
      <div>
        <p className={label}>
          Review owner
          <Req />
        </p>
        <FieldSelect value={owner} options={OWNERS} onChange={setOwner} ariaLabel="Review owner" />
      </div>
    </div>
  );
  const sourceNameField = (title = "Source name", placeholder = "e.g. Visitor FAQ") => (
    <>
      <p className={label}>
        {title}
        <Req />
      </p>
      <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder={placeholder} className={`${input} ${border("name")}`} />
      {fieldError("name")}
    </>
  );
  const infoBar = (text_: string) => (
    <p className="mt-[12px] flex items-center gap-[12px] rounded-[7px] bg-[#f3f5f8] px-[12px] py-[8px] text-[13px] text-[#334155]">
      <Info className="h-[18px] w-[18px] shrink-0" /> {text_}
    </p>
  );

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 font-sans">
      <div aria-hidden="true" className="absolute inset-0 bg-[#0b1f14]/55 backdrop-blur-[2px]" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-source-title"
        className="relative flex max-h-[calc(100vh-32px)] w-[600px] max-w-full flex-col rounded-[14px] bg-white text-[#0f172a] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)]"
      >
        <div className="min-h-0 overflow-y-auto px-[24px] pb-[16px] pt-[16px]">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 id="add-source-title" className="text-[22px] font-bold leading-tight text-[#0f2a52]">
                Add Knowledge Source
              </h2>
              <div className="mt-[3px] flex items-center gap-[14px]">
                <p className="text-[14px] text-[#475569]">{tab === "manual" ? "Write" : "Add"} information Organic Mitra can use to answer visitors.</p>
                <span className="inline-flex items-center gap-[6px] rounded-[6px] bg-[#eef1f4] px-[9px] py-[3px] text-[12px] text-[#334155]">
                  <Eye className="h-[14px] w-[14px]" /> Design preview
                </span>
              </div>
            </div>
            <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="-mr-[6px] grid h-[30px] w-[30px] place-items-center rounded-full text-[#0f172a] transition hover:bg-slate-100">
              <X className="h-[20px] w-[20px]" />
            </button>
          </div>

          {/* Source type */}
          <div className="mt-[12px] grid grid-cols-3 gap-[2px]">
            {KIND_TABS.map(({ kind: k, label: tabLabel, icon: Icon }) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setTab(k);
                  setErrors({});
                }}
                aria-pressed={tab === k}
                className={`flex h-[38px] items-center justify-center gap-[10px] rounded-[7px] border text-[14px] transition ${
                  tab === k ? "border-[#cfe9d6] border-b-[3px] border-b-[#15633a] bg-[#eaf6ee] font-medium text-[#14532d]" : "border-[#e5e7eb] bg-white text-[#0f172a] hover:border-[#15633a]"
                }`}
              >
                <Icon className={`h-[19px] w-[19px] ${tab === k ? "text-[#15633a]" : ""}`} /> {tabLabel}
              </button>
            ))}
          </div>

          {/* ── Website page ── */}
          {tab === "web" && (
            <div className="mt-[12px]">
              {sourceNameField()}
              <p className={`${label} mt-[10px]`}>
                Website URL
                <Req />
              </p>
              <input value={url} onChange={(e) => setUrl(e.target.value.trim())} inputMode="url" placeholder="https://" className={`${input} ${border("url")}`} />
              {fieldError("url") || (
                <p className="mt-[3px] text-[12.5px] text-[#475569]">{includeLinked ? "This page and linked pages on the same site will be imported." : "Only this page will be imported."}</p>
              )}
              <div className="mt-[10px]">{topicOwner}</div>
              <div className="mt-[10px] w-[calc(50%-9px)]">
                <p className={label}>Check for updates</p>
                <FieldSelect value={frequency} options={FREQUENCIES} onChange={setFrequency} ariaLabel="Check for updates" />
                <p className="mt-[3px] whitespace-nowrap text-[12.5px] text-[#475569]">New changes require review before publishing.</p>
              </div>
              <div className="mt-[12px]">
                <Expandable icon={Settings} title="Advanced options">
                  <label className="flex cursor-pointer items-center gap-[10px]">
                    <input type="checkbox" checked={includeLinked} onChange={() => setIncludeLinked((v) => !v)} className="h-[16px] w-[16px] accent-[#15633a]" />
                    Also import linked pages on the same website
                  </label>
                </Expandable>
              </div>
              {infoBar("New sources are saved as drafts. Review imported content before publishing.")}
            </div>
          )}

          {/* ── Document ── */}
          {tab === "pdf" && (
            <div className="mt-[12px]">
              {sourceNameField("Source name", "e.g. Exhibitor Brochure 2027")}
              <p className={`${label} mt-[10px]`}>
                Document
                <Req />
              </p>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  pickFile(e.dataTransfer.files?.[0]);
                }}
                className={`flex flex-col items-center rounded-[8px] border border-dashed px-[12px] py-[12px] text-center transition ${
                  dragging ? "border-[#15633a] bg-[#eaf6ee]" : errors.file ? "border-[#f87171] bg-[#fdf6f6]" : "border-[#cbd5e1] bg-[#f8fafc]"
                }`}
              >
                <CloudUpload className="h-[30px] w-[30px] text-[#334155]" strokeWidth={1.6} />
                <p className="mt-[2px] text-[14px] text-[#0f172a]">
                  Drop a file here or{" "}
                  <button type="button" onClick={() => fileRef.current?.click()} className="font-medium text-[#15803d] hover:underline">
                    Browse Files
                  </button>
                </p>
                <p className="text-[12px] text-[#64748b]">PDF, DOCX or TXT • Up to 10 MB</p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={(e) => {
                  pickFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              {file && (
                <div className="mt-[6px] flex items-center gap-[14px] rounded-[8px] border border-[#e5e7eb] px-[14px] py-[8px]">
                  <FileText className="h-[26px] w-[26px] text-[#334155]" strokeWidth={1.6} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] text-[#0f172a]">{file.name}</span>
                    <span className="block text-[12.5px] text-[#475569]">{formatSize(file.size)} • Ready to import</span>
                  </span>
                  <button type="button" onClick={() => setFile(null)} aria-label="Remove file" className="grid h-[28px] w-[28px] place-items-center rounded-full text-[#0f172a] hover:bg-slate-100">
                    <X className="h-[18px] w-[18px]" />
                  </button>
                </div>
              )}
              {fieldError("file")}
              <div className="mt-[10px]">{topicOwner}</div>
              <p className="mt-[6px] text-[12.5px] text-[#475569]">To update this source later, upload a replacement file.</p>
              <div className="mt-[10px]">
                <Expandable icon={Settings} title="Advanced options">
                  Imported text is split into short passages so Organic Mitra can quote the right part.
                </Expandable>
              </div>
              {infoBar("Imported content stays in draft until reviewed and published.")}
            </div>
          )}

          {/* ── Text / FAQ ── */}
          {tab === "manual" && (
            <div className="mt-[10px]">
              <div className="grid grid-cols-2 gap-[2px]">
                {(
                  [
                    ["faq", "FAQ", CircleHelp],
                    ["text", "General Text", FileText],
                  ] as const
                ).map(([mode, modeLabel, Icon]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      setTextMode(mode);
                      setErrors({});
                    }}
                    aria-pressed={textMode === mode}
                    className={`flex h-[36px] items-center justify-center gap-[10px] rounded-[7px] border text-[14px] transition ${
                      textMode === mode ? "border-[#cfe9d6] border-b-[3px] border-b-[#15633a] bg-[#eaf6ee] font-medium text-[#14532d]" : "border-[#e5e7eb] bg-white text-[#0f172a] hover:border-[#15633a]"
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" /> {modeLabel}
                  </button>
                ))}
              </div>

              <div className="mt-[10px]">{topicOwner}</div>

              {textMode === "faq" ? (
                <>
                  <p className={`${label} mt-[10px]`}>
                    Question
                    <Req />
                  </p>
                  <input value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={150} className={`${input} ${border("question")}`} />
                  {fieldError("question")}

                  <div className="mt-[10px] flex items-end justify-between">
                    <p className={label}>
                      Answer
                      <Req />
                    </p>
                    <div className="mb-[4px] flex overflow-hidden rounded-[7px] bg-[#eef1f4] p-[2px]">
                      {(["en", "hi"] as const).map((l) => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => setAnswerLang(l)}
                          aria-pressed={answerLang === l}
                          className={`h-[28px] w-[76px] rounded-[6px] text-[13.5px] transition ${answerLang === l ? "bg-[#15633a] font-medium text-white" : "text-[#0f172a]"}`}
                        >
                          {l === "en" ? "English" : "हिंदी"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={answer[answerLang]}
                    onChange={(e) => setAnswer({ ...answer, [answerLang]: e.target.value })}
                    rows={3}
                    maxLength={1000}
                    placeholder={answerLang === "en" ? "Write the answer in English" : "हिंदी में जवाब लिखें"}
                    className={`${input} h-[72px] resize-y py-[7px] leading-snug ${border("answer")}`}
                  />
                  {fieldError("answer")}

                  <p className={`${label} mt-[10px]`}>
                    Similar questions <span className="font-normal text-[#475569]">(optional)</span>
                  </p>
                  <div className="flex flex-wrap items-center gap-[8px]">
                    {phrases.map((p) => (
                      <span key={p} className="inline-flex h-[30px] items-center gap-[12px] rounded-full border border-[#e5e7eb] bg-[#f3f5f8] pl-[14px] pr-[10px] text-[13.5px] text-[#0f172a]">
                        {p}
                        <button type="button" onClick={() => setPhrases((prev) => prev.filter((x) => x !== p))} aria-label={`Remove ${p}`} className="hover:text-[#dc2626]">
                          <X className="h-[14px] w-[14px]" />
                        </button>
                      </span>
                    ))}
                    {newPhrase !== null ? (
                      <input
                        autoFocus
                        value={newPhrase}
                        onChange={(e) => setNewPhrase(e.target.value)}
                        onBlur={addPhrase}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") addPhrase();
                          if (e.key === "Escape") setNewPhrase(null);
                        }}
                        maxLength={80}
                        placeholder="Type, press Enter"
                        className="h-[30px] w-[170px] rounded-full border border-[#2f8a4c] px-[12px] text-[13.5px] outline-none"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setNewPhrase("")}
                        className="inline-flex h-[30px] items-center gap-[8px] rounded-[7px] border border-dashed border-[#2f8a4c] px-[14px] text-[13.5px] font-medium text-[#14532d] transition hover:bg-[#f1f7ee]"
                      >
                        <Plus className="h-[16px] w-[16px]" /> Add
                      </button>
                    )}
                  </div>
                  <p className="mt-[4px] text-[12.5px] text-[#475569]">Helps match different ways visitors ask this question.</p>
                </>
              ) : (
                <>
                  <div className="mt-[10px]">{sourceNameField("Title", "e.g. Visitor guidelines")}</div>
                  <p className={`${label} mt-[10px]`}>
                    Content
                    <Req />
                  </p>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={5}
                    maxLength={5000}
                    placeholder="Write the information Organic Mitra should use…"
                    className={`${input} h-[120px] resize-y py-[7px] leading-snug ${border("text")}`}
                  />
                  {fieldError("text")}
                </>
              )}

              <div className="mt-[10px]">
                <Expandable
                  icon={NotebookPen}
                  title={
                    <>
                      Reference / internal note <span className="text-[#475569]">(optional)</span>
                    </>
                  }
                >
                  <textarea
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    rows={2}
                    maxLength={300}
                    placeholder="Source link or note for your team (not shown to visitors)"
                    className={`${input} h-[52px] resize-y py-[6px] text-[13.5px]`}
                  />
                </Expandable>
              </div>
              {infoBar("Saved as draft. Review and publish before visitors receive this answer.")}
            </div>
          )}

          {/* Actions */}
          <div className="mt-[12px] flex justify-end gap-[12px]">
            <button type="button" onClick={onClose} className="h-[36px] rounded-[7px] border border-[#cbd5e1] bg-white px-[22px] text-[14px] font-medium text-[#0f172a] transition hover:bg-slate-50">
              Cancel
            </button>
            <button type="button" onClick={submit} className="h-[36px] rounded-[7px] bg-[#15633a] px-[20px] text-[14px] font-semibold text-white shadow-sm transition hover:bg-[#124f2f]">
              {tab === "manual" ? "Save to Draft" : "Import to Draft"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
