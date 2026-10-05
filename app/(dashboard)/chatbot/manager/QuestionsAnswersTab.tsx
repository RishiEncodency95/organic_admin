"use client";

import { useCallback, useImperativeHandle, useMemo, useState, type Ref } from "react";
import { History, Info, Pencil, Plus, Search, Send, Trash2, X } from "lucide-react";
import {
  BotAvatar,
  ConfirmDialog,
  DragHandle,
  Select,
  cardClass,
  cardTitleClass,
  inputClass as baseInput,
  reorder,
  useReorder,
  type ConfirmOptions,
  type Notify,
  type TabHandle,
} from "./managerUi";
import ReviewQuestionModal, { type ReviewItem } from "./ReviewQuestionModal";

/*
 * "Questions & Answers" tab of the Chatbot Manager — design preview with sample answers
 * kept in component state; nothing is saved to or used by the website chatbot.
 */

// ─── Sample data ─────────────────────────────────────────────────────────────

const TOPICS = ["Event Information", "Stall Booking", "PMS Support", "Venue", "Booking", "Visitor Registration"] as const;
type Topic = (typeof TOPICS)[number];

const STATUSES = ["Approved", "Draft", "Needs Review"] as const;
type Status = (typeof STATUSES)[number];

const NEXT_ACTIONS = ["None", "Open Website Page", "Show Options", "Open Form", "Talk to Team"] as const;
type NextAction = (typeof NEXT_ACTIONS)[number];

type Answer = {
  id: number;
  question: string;
  topic: Topic;
  status: Status;
  phrases: string[];
  answer: { en: string; hi: string };
  nextAction: NextAction;
  nextTarget: string;
};

const INITIAL_ANSWERS: Answer[] = [
  {
    id: 1,
    question: "What are the expo dates?",
    topic: "Event Information",
    status: "Approved",
    phrases: ["Expo kab hai?", "Event dates?", "When is the expo?"],
    answer: {
      en: "Bharat Organic Expo 2027 will be held from 19–21 February 2027 at Bharat Mandapam (Pragati Maidan), New Delhi.",
      hi: "Bharat Organic Expo 2027, 19–21 February 2027 ko Bharat Mandapam (Pragati Maidan), New Delhi mein hoga.",
    },
    nextAction: "Open Website Page",
    nextTarget: "Event Information",
  },
  {
    id: 2,
    question: "How do I book a stall?",
    topic: "Stall Booking",
    status: "Approved",
    phrases: ["Stall kaise book karein?", "Book a booth"],
    answer: {
      en: "You can book a stall from the Book a Stand page or ask our sales team for a quotation.",
      hi: "Aap Book a Stand page se stall book kar sakte hain ya sales team se quotation le sakte hain.",
    },
    nextAction: "Open Website Page",
    nextTarget: "Book a Stand",
  },
  {
    id: 3,
    question: "What documents are needed for PMS support?",
    topic: "PMS Support",
    status: "Needs Review",
    phrases: ["PMS documents"],
    answer: { en: "", hi: "" },
    nextAction: "Talk to Team",
    nextTarget: "PMS Support Team",
  },
];

const PAGES = ["Event Information", "Book a Stand", "Visitor Registration", "PMS Guidance", "Contact Us"];

/** Choices for the second "Optional Next Action" dropdown, per action (sample lists) */
const TARGETS: Record<NextAction, string[]> = {
  None: ["—"],
  "Open Website Page": PAGES,
  "Show Options": ["Stall Options", "Visitor Information", "PMS Guidance", "Additional Topics"],
  "Open Form": ["Quotation Request", "Callback Request", "Visitor Registration"],
  "Talk to Team": ["Sales Team", "Registration Team", "PMS Support Team", "Team Lead"],
};

/** What an answer needs before it can be saved; returns the first problem or "" */
const problemWith = (a: Answer) => (!a.question.trim() ? "Add the question." : !a.answer.en.trim() ? "Write the approved answer in English." : "");

/** Questions the bot could not answer (sample). `awaiting` = sent to the team for confirmation */
type QueueItem = Omit<ReviewItem, "topic"> & { topic: Topic; action: "Add Answer" | "Review"; awaiting?: boolean };

const REVIEW_QUEUE: QueueItem[] = [
  {
    id: 1,
    question: "Is parking available?",
    topic: "Venue",
    action: "Add Answer",
    asked: 8,
    owner: "Visitor Team",
    visitorMessage: "Is there parking at Bharat Mandapam for visitors?",
    botReply: "I don’t have verified parking details yet. Would you like me to connect you with our team?",
  },
  {
    id: 2,
    question: "Can I change my stall size?",
    topic: "Booking",
    action: "Review",
    asked: 3,
    owner: "Sales Team",
    visitorMessage: "I requested a 12 sq.m stall. Can I change it to 18 sq.m?",
    botReply: "I need our sales team to confirm this. Would you like me to connect you?",
  },
];

const STATUS_PILL: Record<Status, string> = {
  Approved: "bg-[#e6f6ea] text-[#15803d] [&>i]:bg-[#16a34a]",
  Draft: "bg-[#f1f3f5] text-[#475569] [&>i]:bg-[#94a3b8]",
  "Needs Review": "bg-[#fdf3e1] text-[#d97706] [&>i]:bg-[#f59e0b]",
};

const StatusPill = ({ status }: { status: Status }) => (
  <span className={`inline-flex h-[28px] items-center gap-[9px] rounded-[6px] px-[11px] text-[13.6px] ${STATUS_PILL[status]}`}>
    <i className="h-[9px] w-[9px] rounded-full" />
    {status}
  </span>
);

/* Slightly tighter fields than the Buttons tab, so this tab fits in the same height */
const inputClass = `${baseInput} !h-[34px]`;
const labelClass = "mb-[4px] block text-[13.6px] text-[#334155]";
const fieldSelect = "!h-[34px] !text-[14.6px]";

const normalize = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N} ]/gu, "").trim();

// ─── Tab ─────────────────────────────────────────────────────────────────────

type Props = { onChange: () => void; onOpenHistory: () => void; notify: Notify; ref?: Ref<TabHandle> };

export default function QuestionsAnswersTab({ onChange, onOpenHistory, notify, ref }: Props) {
  const [answers, setAnswers] = useState(INITIAL_ANSWERS);
  const [selectedId, setSelectedId] = useState(1);
  const [draft, setDraft] = useState<Answer>(INITIAL_ANSWERS[0]);
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState<"All Topics" | Topic>("All Topics");
  const [statusFilter, setStatusFilter] = useState<"All Status" | Status>("All Status");
  const [showErrors, setShowErrors] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmOptions | null>(null);
  const closeConfirm = useCallback(() => setConfirm(null), []);
  const [newPhrase, setNewPhrase] = useState<string | null>(null);
  const [queue, setQueue] = useState(REVIEW_QUEUE);
  // Queue item whose "Review Question" popup is open
  const [reviewId, setReviewId] = useState<number | null>(null);
  const reviewing = queue.find((x) => x.id === reviewId) ?? null;
  const [test, setTest] = useState({ question: "Expo kab hai?", language: "Hinglish" });
  const [result, setResult] = useState<{ text: string; source: string } | null>({
    text: INITIAL_ANSWERS[0].answer.hi,
    source: "Approved answer — Event dates",
  });

  const q = search.trim().toLowerCase();
  const rows = answers.filter(
    (a) =>
      (!q || a.question.toLowerCase().includes(q) || a.phrases.some((p) => p.toLowerCase().includes(q))) &&
      (topicFilter === "All Topics" || a.topic === topicFilter) &&
      (statusFilter === "All Status" || a.status === statusFilter)
  );

  const saved = answers.find((a) => a.id === draft.id);
  const dirty = !saved || JSON.stringify(saved) !== JSON.stringify(draft);
  const problem = problemWith(draft);
  const counts = (status: Status) => answers.filter((a) => a.status === status).length;

  /** Saves the open answer; returns false (and points at the problem) if it is incomplete */
  const save = () => {
    if (problem) {
      setShowErrors(true);
      notify(problem, { tone: "error" });
      return false;
    }
    const clean = { ...draft, question: draft.question.trim() };
    setAnswers((prev) => (prev.some((a) => a.id === clean.id) ? prev.map((a) => (a.id === clean.id ? clean : a)) : [...prev, clean]));
    setDraft(clean);
    setSelectedId(clean.id);
    setShowErrors(false);
    onChange();
    notify(`Answer saved — “${clean.question}”`);
    return true;
  };

  useImperativeHandle(ref, () => ({ save: () => (dirty ? save() : notify("Draft saved — no new answer changes")) }));

  /** Runs `next` now, or after asking what to do with unsaved edits */
  const guard = (next: () => void) => {
    if (!dirty || (!saved && !draft.question.trim() && !draft.answer.en.trim())) return next();
    setConfirm({
      title: "Save changes to this answer?",
      body: `“${draft.question || "New answer"}” has unsaved changes.`,
      confirmLabel: "Save & continue",
      run: () => {
        if (save()) next();
      },
      secondary: { label: "Discard", run: next },
    });
  };

  const select = (a: Answer) => {
    if (a.id === draft.id) return;
    guard(() => {
      setSelectedId(a.id);
      setDraft(a);
      setNewPhrase(null);
      setShowErrors(false);
    });
  };

  const startNew = (question = "", topic: Topic = "Event Information", status: Status = "Draft") =>
    guard(() => {
      const id = Math.max(0, ...answers.map((a) => a.id)) + 1;
      setSelectedId(id);
      setDraft({ id, question, topic, status, phrases: [], answer: { en: "", hi: "" }, nextAction: "None", nextTarget: TARGETS.None[0] });
      setNewPhrase(null);
      setShowErrors(false);
    });

  const remove = () => {
    if (!saved) return;
    setConfirm({
      title: "Delete this answer?",
      body: `“${saved.question}” will no longer be used by Organic Mitra. The change goes live only after publishing.`,
      confirmLabel: "Delete Answer",
      danger: true,
      run: () => {
        const index = answers.findIndex((a) => a.id === saved.id);
        const rest = answers.filter((a) => a.id !== saved.id);
        setAnswers(rest);
        const next = rest[Math.min(index, rest.length - 1)];
        if (next) {
          setSelectedId(next.id);
          setDraft(next);
        } else {
          const id = saved.id + 1;
          setSelectedId(id);
          setDraft({ id, question: "", topic: "Event Information", status: "Draft", phrases: [], answer: { en: "", hi: "" }, nextAction: "None", nextTarget: TARGETS.None[0] });
        }
        setShowErrors(false);
        onChange();
        notify("Answer deleted", { undo: () => setAnswers((prev) => [...prev.slice(0, index), saved, ...prev.slice(index)]) });
      },
    });
  };

  const rowIds = useMemo(() => answers.map((a) => a.id), [answers]);
  const drag = useReorder(rowIds, (from, to) => {
    setAnswers((prev) => reorder(prev, from, to));
    onChange();
  });

  const addPhrase = () => {
    const phrase = newPhrase?.trim();
    if (phrase && !draft.phrases.includes(phrase)) setDraft({ ...draft, phrases: [...draft.phrases, phrase] });
    setNewPhrase(null);
  };

  /** Matches the test question against approved questions and their similar phrases */
  const runTest = () => {
    const text = normalize(test.question);
    if (!text) return setResult(null);
    const hit = answers.find(
      (a) => a.status === "Approved" && [a.question, ...a.phrases].some((p) => normalize(p) === text || normalize(p).includes(text) || text.includes(normalize(p)))
    );
    setResult(
      hit
        ? { text: test.language === "English" ? hit.answer.en : hit.answer.hi || hit.answer.en, source: `Approved answer — ${hit.question.replace(/\?$/, "")}` }
        : { text: "No approved answer found. This question will go to Questions Needing Review.", source: "No match" }
    );
  };

  return (
    <div className="grid h-full grid-cols-[778px_1fr] gap-[15px]">
      <ConfirmDialog confirm={confirm} onClose={closeConfirm} />
      <ReviewQuestionModal
        key={reviewId ?? "closed"}
        item={reviewing}
        onClose={() => setReviewId(null)}
        onSave={({ en, hi }) => {
          if (!reviewing) return;
          // The verified answer becomes a draft entry in the knowledge list
          const id = Math.max(0, ...answers.map((a) => a.id)) + 1;
          const entry: Answer = {
            id,
            question: reviewing.question,
            topic: reviewing.topic,
            status: "Draft",
            phrases: [],
            answer: { en, hi },
            nextAction: "None",
            nextTarget: PAGES[0],
          };
          setAnswers((prev) => [...prev, entry]);
          setSelectedId(id);
          setDraft(entry);
          setShowErrors(false);
          setQueue((prev) => prev.filter((x) => x.id !== reviewing.id));
          setReviewId(null);
          onChange();
          notify("Answer added as a draft — review and approve it below");
        }}
        onNeedsConfirmation={() => {
          setQueue((prev) => prev.map((x) => (x.id === reviewId ? { ...x, awaiting: true } : x)));
          setReviewId(null);
          notify("Sent to the team for confirmation");
        }}
      />
      {/* ── Left: knowledge base + editor ── */}
      <div className={`${cardClass} flex flex-col px-[16px] pb-[10px] pt-[8px]`}>
        <div className="flex items-center justify-between">
          <p className={cardTitleClass}>Knowledge &amp; Answers</p>
          <button
            type="button"
            onClick={() => startNew()}
            className="inline-flex h-[32px] items-center gap-[9px] rounded-[7px] border border-[#2f8a4c] bg-white px-[18px] text-[14.6px] font-medium text-[#14532d] transition hover:bg-[#f1f7ee]"
          >
            <Plus className="h-[18px] w-[18px]" /> Add Answer
          </button>
        </div>

        <div className="mt-[6px] flex items-center gap-[12px]">
          <label className="relative w-[334px]">
            <Search className="pointer-events-none absolute left-[14px] top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#475569]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search question or keyword..." className={`${inputClass} !pl-[42px] !text-[13.6px]`} />
          </label>
          <Select value={topicFilter} options={["All Topics", ...TOPICS] as const} onChange={setTopicFilter} label="Topic" className="w-[160px]" selectClassName="!h-[34px]" />
          <Select value={statusFilter} options={["All Status", ...STATUSES] as const} onChange={setStatusFilter} label="Status" className="w-[160px]" selectClassName="!h-[34px]" />
        </div>

        <div className="mt-[6px] flex items-center gap-[10px]">
          {STATUSES.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setStatusFilter(statusFilter === name ? "All Status" : name)}
              aria-pressed={statusFilter === name}
              title={statusFilter === name ? "Show all statuses" : `Show only ${name}`}
              className={`h-[28px] rounded-[6px] border px-[14px] text-[13.6px] transition ${
                statusFilter === name ? "border-[#15633a] bg-[#15633a] font-medium text-white" : "border-[#d6dae0] bg-white text-[#0f172a] hover:border-[#15633a]"
              }`}
            >
              {name} ({counts(name)})
            </button>
          ))}
        </div>

        {/* Answers table */}
        <div className="mt-[6px] overflow-hidden rounded-[8px] border border-[#eef0f2]">
          <div className="grid grid-cols-[52px_323px_155px_160px_1fr] items-center bg-[#f7f8fa] px-[2px] py-[5px] text-[13.6px] text-[#475569]">
            <span />
            <span>Question</span>
            <span>Topic</span>
            <span>Status</span>
            <span className="text-center">Edit</span>
          </div>
          {rows.length === 0 && <p className="border-t border-[#eef0f2] py-[14px] text-center text-[13.6px] text-[#64748b]">No answers match these filters.</p>}
          {rows.map((a) => (
            <div
              key={a.id}
              {...drag.row(a.id)}
              onClick={() => select(a)}
              className={`${drag.rowClass(a.id)} grid h-[40px] cursor-pointer grid-cols-[52px_323px_155px_160px_1fr] items-center border-t border-[#eef0f2] px-[2px] text-[14.6px] transition ${
                selectedId === a.id ? "bg-[#ebf6ee]" : "hover:bg-[#f8faf9]"
              }`}
            >
              <DragHandle props={drag.handle(a.id, a.question)} className="mx-auto h-[28px] w-[24px]" />
              <span className="truncate pr-[10px] text-[#0f172a]">{a.question}</span>
              <span className="truncate pr-[10px] text-[#0f172a]">{a.topic}</span>
              <span>
                <StatusPill status={a.status} />
              </span>
              <span className="flex justify-center">
                <button
                  type="button"
                  onClick={() => select(a)}
                  aria-label={`Edit ${a.question}`}
                  className="grid h-[30px] w-[38px] place-items-center rounded-[7px] border border-[#dfe3e8] bg-white text-[#0f172a] transition hover:border-[#15633a] hover:text-[#15633a]"
                >
                  <Pencil className="h-[16px] w-[16px]" />
                </button>
              </span>
            </div>
          ))}
        </div>

        {/* Editor */}
        <div className="mt-[8px] flex flex-1 flex-col rounded-[10px] border border-[#eef0f2] px-[16px] pb-[8px] pt-[8px]">
          <div className="flex items-center justify-between">
            <p className="text-[17.5px] font-bold text-[#0f2a1c]">{saved ? "Edit Answer" : "New Answer"}</p>
            <div className="flex items-center gap-[12px]">
            <button
              type="button"
              onClick={remove}
              disabled={!saved}
              title={saved ? "Delete this answer" : "Not saved yet"}
              className="inline-flex h-[30px] items-center gap-[7px] rounded-[7px] border border-[#f3a5a5] bg-white px-[12px] text-[13.6px] font-medium text-[#dc2626] transition hover:bg-[#fdf2f2] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
            >
              <Trash2 className="h-[15px] w-[15px]" /> Delete
            </button>
            <div className="flex overflow-hidden rounded-[7px] border border-[#dfe3e8]">
              {(["en", "hi"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  aria-pressed={lang === l}
                  className={`h-[30px] px-[18px] text-[14.6px] transition ${
                    lang === l ? "border border-[#2f8a4c] bg-[#ebf6ee] font-medium text-[#14532d]" : "text-[#334155] hover:bg-[#f8faf9]"
                  }`}
                >
                  {l === "en" ? "English" : "हिंदी"}
                </button>
              ))}
            </div>
            </div>
          </div>

          <div className="mt-[4px] grid grid-cols-2 gap-x-[18px]">
            <label>
              <span className={labelClass}>
                Question <span className="text-[#dc2626]">*</span>
              </span>
              <input
                value={draft.question}
                onChange={(e) => setDraft({ ...draft, question: e.target.value })}
                maxLength={150}
                aria-invalid={showErrors && !draft.question.trim()}
                className={`${inputClass} ${showErrors && !draft.question.trim() ? "!border-[#dc2626]" : ""}`}
              />
            </label>
            <div>
              <span className={labelClass}>
                Topic <span className="text-[#dc2626]">*</span>
              </span>
              <Select value={draft.topic} options={TOPICS} onChange={(topic) => setDraft({ ...draft, topic })} label="Topic" selectClassName={fieldSelect} />
            </div>
          </div>

          <p className={`${labelClass} mt-[6px] flex items-center gap-[8px]`}>
            Similar Questions <Info className="h-[15px] w-[15px]" aria-label="Other ways visitors ask this question" />
          </p>
          <div className="flex flex-wrap items-center gap-[10px]">
            {draft.phrases.map((p) => (
              <span key={p} className="inline-flex h-[30px] items-center gap-[12px] rounded-full bg-[#f1f3f5] pl-[16px] pr-[12px] text-[14.1px] text-[#0f172a]">
                {p}
                <button type="button" aria-label={`Remove ${p}`} onClick={() => setDraft({ ...draft, phrases: draft.phrases.filter((x) => x !== p) })} className="text-[#334155] hover:text-[#dc2626]">
                  <X className="h-[15px] w-[15px]" />
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
                placeholder="Type a phrase, press Enter"
                className="h-[30px] w-[210px] rounded-full border border-[#2f8a4c] px-[14px] text-[14.1px] outline-none"
              />
            ) : (
              <button
                type="button"
                onClick={() => setNewPhrase("")}
                className="inline-flex h-[30px] items-center gap-[9px] rounded-[7px] border border-[#2f8a4c] bg-white px-[16px] text-[14.6px] font-medium text-[#14532d] transition hover:bg-[#f1f7ee]"
              >
                <Plus className="h-[17px] w-[17px]" /> Add phrase
              </button>
            )}
          </div>

          <label className="mt-[6px] block">
            <span className={labelClass}>
              Approved Answer <span className="text-[#dc2626]">*</span>
            </span>
            <textarea
              value={draft.answer[lang]}
              onChange={(e) => setDraft({ ...draft, answer: { ...draft.answer, [lang]: e.target.value } })}
              rows={2}
              maxLength={600}
              placeholder={lang === "en" ? "Write the answer in English" : "हिंदी / Hinglish में जवाब लिखें"}
              aria-invalid={showErrors && lang === "en" && !draft.answer.en.trim()}
              className={`h-[50px] w-full resize-y rounded-[7px] border ${showErrors && !draft.answer.en.trim() ? "border-[#dc2626]" : "border-[#dfe3e8]"} bg-white px-[14px] py-[7px] text-[14.6px] leading-snug text-[#0f172a] outline-none transition focus:border-[#15633a] focus:ring-2 focus:ring-[#15633a]/15`}
            />
          </label>

          <p className={`${labelClass} mt-[6px] flex items-center gap-[8px]`}>
            Optional Next Action <Info className="h-[15px] w-[15px]" aria-label="What the chatbot offers after this answer" />
          </p>
          <div className="grid grid-cols-[282px_1fr] gap-x-[18px]">
            <Select
              value={draft.nextAction}
              options={NEXT_ACTIONS}
              onChange={(nextAction) => setDraft({ ...draft, nextAction, nextTarget: TARGETS[nextAction][0] })}
              label="Next action"
              selectClassName={fieldSelect}
            />
            <fieldset disabled={draft.nextAction === "None"} className="min-w-0 disabled:opacity-50" title={draft.nextAction === "None" ? "Choose a next action first" : undefined}>
              <Select
                value={draft.nextTarget}
                options={[...new Set([draft.nextTarget, ...TARGETS[draft.nextAction]])]}
                onChange={(nextTarget) => setDraft({ ...draft, nextTarget })}
                label="Next action target"
                selectClassName={`${fieldSelect} disabled:cursor-not-allowed`}
              />
            </fieldset>
          </div>

          <div className="mt-auto flex items-center justify-between pt-[8px]">
            <p className="flex items-center gap-[10px] text-[12.6px] text-[#64748b]">
              <Info className="h-[17px] w-[17px] shrink-0" /> AI uses approved content; uncertain questions go to review.
            </p>
            <div className="flex items-center gap-[12px]">
              <span className="text-[14.6px] text-[#334155]">Status:</span>
              <label className="relative">
                <span
                  className={`pointer-events-none absolute left-[13px] top-1/2 h-[9px] w-[9px] -translate-y-1/2 rounded-full ${
                    draft.status === "Approved" ? "bg-[#16a34a]" : draft.status === "Draft" ? "bg-[#94a3b8]" : "bg-[#f59e0b]"
                  }`}
                />
                <Select value={draft.status} options={STATUSES} onChange={(status) => setDraft({ ...draft, status })} label="Answer status" className="w-[126px]" selectClassName="!h-[34px] !pl-[30px] !text-[14.1px]" />
              </label>
              <button
                type="button"
                onClick={save}
                className="h-[34px] rounded-[7px] bg-[#15633a] px-[16px] text-[14.6px] font-medium text-white shadow-sm transition hover:bg-[#124f2f] disabled:opacity-60"
              >
                Save Answer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: review queue + tester ── */}
      <div className="flex min-h-0 flex-col gap-[15px]">
        <div className={`${cardClass} px-[16px] pb-[12px] pt-[10px]`}>
          <p className={`${cardTitleClass} flex items-center gap-[12px]`}>
            Questions Needing Review
            <span className="grid h-[26px] w-[26px] place-items-center rounded-full bg-[#fde7b0] text-[13.6px] font-semibold text-[#92400e]">{queue.length}</span>
          </p>
          <div className="mt-[10px] overflow-hidden rounded-[8px] border border-[#eef0f2]">
            <div className="grid grid-cols-[220px_1fr_130px] items-center bg-[#f7f8fa] px-[14px] py-[6px] text-[13.6px] text-[#475569]">
              <span>Question</span>
              <span>Topic</span>
              <span className="text-center">Action</span>
            </div>
            {queue.length === 0 && <p className="border-t border-[#eef0f2] py-[14px] text-center text-[13.6px] text-[#64748b]">Nothing waiting for review.</p>}
            {queue.map((item) => (
              <div key={item.id} className="grid h-[54px] grid-cols-[220px_1fr_130px] items-center border-t border-[#eef0f2] px-[14px] text-[14.6px] text-[#0f172a]">
                <span className="truncate pr-[8px]">{item.question}</span>
                <span className="truncate">{item.topic}</span>
                <button
                  type="button"
                  onClick={() => setReviewId(item.id)}
                  className={`inline-flex h-[38px] items-center justify-center gap-[7px] rounded-[7px] border bg-white text-[14.6px] font-medium transition ${
                    item.awaiting
                      ? "border-[#f5c27a] text-[#b45309] hover:bg-[#fffaf0]"
                      : item.action === "Add Answer"
                        ? "border-[#2f8a4c] text-[#14532d] hover:bg-[#f1f7ee]"
                        : "border-[#d6dae0] text-[#0f172a] hover:border-[#15633a]"
                  }`}
                >
                  {item.awaiting ? (
                    "Awaiting Team"
                  ) : (
                    <>
                      {item.action === "Add Answer" && <Plus className="h-[17px] w-[17px]" />}
                      {item.action}
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className={`${cardClass} flex flex-1 flex-col px-[16px] pb-[10px] pt-[10px]`}>
          <p className={cardTitleClass}>Test an Answer</p>
          <div className="mt-[8px] grid grid-cols-[208px_108px_1fr] items-end gap-x-[14px]">
            <label>
              <span className={labelClass}>Test Question</span>
              <input
                value={test.question}
                onChange={(e) => setTest({ ...test, question: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && runTest()}
                maxLength={150}
                className={inputClass}
              />
            </label>
            <div>
              <span className={labelClass}>Language</span>
              <Select value={test.language} options={["Hinglish", "English", "Hindi"]} onChange={(language) => setTest({ ...test, language })} label="Language" selectClassName={fieldSelect} />
            </div>
            <button
              type="button"
              onClick={runTest}
              className="inline-flex h-[36px] items-center justify-center gap-[10px] rounded-[7px] border border-[#2f8a4c] bg-white text-[14.6px] font-medium text-[#14532d] transition hover:bg-[#f1f7ee]"
            >
              <Send className="h-[18px] w-[18px] fill-[#15633a]" /> Test Reply
            </button>
          </div>

          <div className="mt-[14px] flex-1 rounded-[10px] bg-[#f1f7f2] px-[16px] pt-[40px]">
            {result && (
              <div className="flex items-start gap-[16px]">
                <BotAvatar size={36} />
                <div className="min-w-0">
                  <div className="rounded-[10px] bg-white px-[14px] py-[9px] text-[14.6px] leading-snug text-[#0f172a] shadow-sm">{result.text}</div>
                  <span className="mt-[10px] inline-block rounded-[5px] bg-[#e5e9ec] px-[13px] py-[4px] text-[13.1px] text-[#334155]">Source: {result.source}</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-[10px] flex items-center justify-between text-[12.6px]">
            <span className="flex items-center gap-[10px] text-[#64748b]">
              <Info className="h-[17px] w-[17px]" /> Answer quality feedback can be reviewed from Overview.
            </span>
            <button type="button" onClick={onOpenHistory} className="flex items-center gap-[7px] text-[#1d4ed8] hover:underline">
              <History className="h-[17px] w-[17px]" /> Version History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
