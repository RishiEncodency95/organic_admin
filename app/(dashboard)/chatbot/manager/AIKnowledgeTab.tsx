"use client";

import { Fragment, useCallback, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleHelp,
  Database,
  FileText,
  FlaskConical,
  Flag,
  Globe,
  Info,
  Lock,
  Plus,
  RotateCw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  ThumbsUp,
  UsersRound,
  ChevronRight,
} from "lucide-react";
import { BotAvatar, ConfirmDialog, LOGO, RowMenu, Select, cardClass, type ConfirmOptions, type Notify } from "./managerUi";
import ReviewUpdateModal from "./ReviewUpdateModal";
import AddSourceModal, { type NewSource, type SourceKind } from "./AddSourceModal";
import ReviewQuestionModal, { type ReviewItem } from "./ReviewQuestionModal";

/*
 * "AI Knowledge & Answers" tab of the Chatbot Manager — design preview. Sources, review
 * items and test replies are sample data kept in component state (nothing is crawled,
 * indexed or answered by a real model). Sized to fit the shared Buttons & Flows height.
 */

// ─── Sample data ─────────────────────────────────────────────────────────────

type SourceStatus = "Published" | "Update pending" | "Draft";
type Source = { id: number; name: string; url?: string; kind: "web" | "pdf" | "manual"; topic: string; status: SourceStatus; checked: string; owner?: string };

const INITIAL_SOURCES: Source[] = [
  { id: 1, name: "Expo information", url: "bharatorganicexpo.com", kind: "web", topic: "General", status: "Published", checked: "Today, 10:20 AM" },
  { id: 2, name: "Exhibitor brochure.pdf", kind: "pdf", topic: "Exhibitors", status: "Published", checked: "01 Oct 2026" },
  { id: 3, name: "Visitor information", kind: "web", topic: "Visitors", status: "Update pending", checked: "Today, 10:20 AM" },
];

const TOPICS = ["All topics", "General", "Exhibitors", "Visitors"] as const;

/** Questions the bot could not answer (sample). `awaiting` = sent to the team for confirmation */
type QueueItem = ReviewItem & { action: "Add Answer" | "Review"; awaiting?: boolean };

const INITIAL_REVIEW: QueueItem[] = [
  {
    id: 1,
    question: "Is parking available?",
    asked: 8,
    topic: "Venue",
    owner: "Visitor Team",
    action: "Add Answer",
    visitorMessage: "Is there parking at Bharat Mandapam for visitors?",
    botReply: "I don’t have verified parking details yet. Would you like me to connect you with our team?",
  },
  {
    id: 2,
    question: "Can I change my stall size?",
    asked: 3,
    topic: "Stall Booking",
    owner: "Sales Team",
    action: "Review",
    visitorMessage: "I requested a 12 sq.m stall. Can I change it to 18 sq.m?",
    botReply: "I need our sales team to confirm this. Would you like me to connect you?",
  },
];

const APPROVED = [
  { question: "What are the expo dates?", topic: "Event Information", updated: "02 Oct 2026" },
  { question: "How do I book a stall?", topic: "Stall Booking", updated: "01 Oct 2026" },
  { question: "Is visitor registration free?", topic: "Visitors", updated: "30 Sep 2026" },
];

const SUB_TABS = ["Knowledge Sources", "Approved Answers", "Review Queue"] as const;

const STATUS_PILL: Record<SourceStatus, string> = {
  Published: "bg-[#e6f6ea] text-[#15803d] [&>i]:bg-[#16a34a]",
  "Update pending": "bg-[#fdf3e1] text-[#d97706] [&>i]:bg-[#f59e0b]",
  Draft: "bg-[#f1f3f5] text-[#475569] [&>i]:bg-[#94a3b8]",
};

/** Sample knowledge: which source answers which kind of question */
const KNOWLEDGE = [
  {
    sourceId: 1,
    match: /(kab|kahan|when|where|date|venue|expo)/,
    detail: "Event dates & venue",
    en: "Bharat Organic Expo will be held from 19–21 February 2027 at Bharat Mandapam, New Delhi.",
    hi: "Bharat Organic Expo 19–21 February 2027 ko Bharat Mandapam, New Delhi mein hoga.",
  },
  {
    sourceId: 2,
    match: /(stall|booth|exhibit|brochure|price|pricing|sq\.?m)/,
    detail: "Stall sizes & booking",
    en: "Stalls are available in 9, 12 and 18 sq.m sizes. You can request a quotation from the Book a Stand page.",
    hi: "Stall 9, 12 aur 18 sq.m size mein milte hain. Book a Stand page se quotation maang sakte hain.",
  },
  {
    sourceId: 3,
    match: /(visitor|register|registration|entry|ticket|pass)/,
    detail: "Visitor registration",
    en: "Visitor registration is free. Register online and show your confirmation at the entry.",
    hi: "Visitor registration free hai. Online register karein aur entry par confirmation dikhayein.",
  },
];

type TestResult = { found: boolean; text: string; source?: { name: string; detail: string; url?: string }; draftOnly?: boolean };

/**
 * Very small stand-in for the model: matches the question to a sample source. "Live" only
 * uses published sources (an update waiting for review keeps its published content);
 * "Draft" also uses draft sources.
 */
const answerFor = (question: string, language: string, sources: Source[], mode: "Live" | "Draft"): TestResult => {
  const q = question.toLowerCase();
  const english = language === "English";
  const hit = KNOWLEDGE.find((k) => k.match.test(q));
  const source = hit && sources.find((s) => s.id === hit.sourceId);
  if (hit && source && (mode === "Draft" || source.status !== "Draft")) {
    return { found: true, text: english ? hit.en : hit.hi, source: { name: source.name, detail: hit.detail, url: source.url } };
  }
  return {
    found: false,
    draftOnly: !!hit && !!source,
    text: english ? "I don’t have a verified answer yet. Would you like help from our team?" : "Iska verified jawab abhi mere paas nahi hai. Kya aap hamari team se baat karna chahenge?",
  };
};

// ─── Tab ─────────────────────────────────────────────────────────────────────

type Props = { onChange: () => void; onGoToTab: (tab: string) => void; notify: Notify };

export default function AIKnowledgeTab({ onChange, onGoToTab, notify }: Props) {
  const [sub, setSub] = useState<(typeof SUB_TABS)[number]>("Knowledge Sources");
  const [sources, setSources] = useState(INITIAL_SOURCES);
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>("All topics");
  const [addOpen, setAddOpen] = useState(false);
  const [checking, setChecking] = useState(false);
  const [mode, setMode] = useState<"Live" | "Draft">("Draft");
  const [question, setQuestion] = useState("Expo kab aur kahan hai?");
  const [language, setLanguage] = useState("Hinglish");
  const [result, setResult] = useState(() => answerFor("Expo kab aur kahan hai?", "Hinglish", INITIAL_SOURCES, "Draft"));
  const [confirm, setConfirm] = useState<ConfirmOptions | null>(null);
  const closeConfirm = useCallback(() => setConfirm(null), []);
  const [rating, setRating] = useState<"correct" | "fix" | null>(null);
  // Unanswered questions and the one whose "Review Question" popup is open
  const [reviewItems, setReviewItems] = useState(INITIAL_REVIEW);
  const [reviewQuestionId, setReviewQuestionId] = useState<number | null>(null);
  const reviewQuestion = reviewItems.find((r) => r.id === reviewQuestionId) ?? null;
  // Source whose "Review Content Update" popup is open
  const [reviewId, setReviewId] = useState<number | null>(null);
  const reviewSource = sources.find((x) => x.id === reviewId) ?? null;
  const finishReview = () => {
    setSources((prev) => prev.map((x) => (x.id === reviewId ? { ...x, status: "Published", checked: "Just now" } : x)));
    setReviewId(null);
  };

  const viewSource = (s: Source) =>
    setConfirm({
      title: s.name,
      hideCancel: true,
      confirmLabel: "Done",
      run: () => undefined,
      body: (
        <dl className="grid grid-cols-[110px_1fr] gap-y-[4px] text-[13.5px]">
          <dt className="text-[#64748b]">Type</dt>
          <dd className="text-[#0f172a]">{s.kind === "web" ? "Website page" : s.kind === "pdf" ? "PDF document" : "Manual answer"}</dd>
          {s.url && (
            <>
              <dt className="text-[#64748b]">Address</dt>
              <dd className="truncate text-[#0f172a]">{s.url}</dd>
            </>
          )}
          <dt className="text-[#64748b]">Topic</dt>
          <dd className="text-[#0f172a]">{s.topic}</dd>
          <dt className="text-[#64748b]">Live status</dt>
          <dd className="text-[#0f172a]">{s.status}</dd>
          <dt className="text-[#64748b]">Last checked</dt>
          <dd className="text-[#0f172a]">{s.checked}</dd>
          {s.owner && (
            <>
              <dt className="text-[#64748b]">Review owner</dt>
              <dd className="text-[#0f172a]">{s.owner}</dd>
            </>
          )}
          <dt className="col-span-2 mt-[6px] text-[12.5px] text-[#64748b]">Demo data — the document content is not stored in this preview.</dt>
        </dl>
      ),
    });

  const deleteSource = (s: Source) =>
    setConfirm({
      title: `Delete “${s.name}”?`,
      body: "Organic Mitra will stop using this source. Published answers from it stay live until you publish this change.",
      confirmLabel: "Delete Source",
      danger: true,
      run: () => {
        const index = sources.findIndex((x) => x.id === s.id);
        setSources((prev) => prev.filter((x) => x.id !== s.id));
        onChange();
        notify(`“${s.name}” removed`, { undo: () => setSources((prev) => [...prev.slice(0, index), s, ...prev.slice(index)]) });
      },
    });

  const dismissQuestion = (r: QueueItem) => {
    const index = reviewItems.findIndex((x) => x.id === r.id);
    setReviewItems((prev) => prev.filter((x) => x.id !== r.id));
    notify("Question dismissed", { undo: () => setReviewItems((prev) => [...prev.slice(0, index), r, ...prev.slice(index)]) });
  };

  const q = search.trim().toLowerCase();
  const visible = sources.filter((s) => (topic === "All topics" || s.topic === topic) && (!q || s.name.toLowerCase().includes(q) || s.topic.toLowerCase().includes(q)));
  const published = sources.filter((s) => s.status === "Published").length;
  const pending = sources.filter((s) => s.status !== "Published").length;

  // "Add Knowledge Source" popup: which tab it opens on (null = closed) and a key per opening
  const [addKind, setAddKind] = useState<SourceKind | null>(null);
  const [addKey, setAddKey] = useState(0);
  const openAdd = (kind: SourceKind) => {
    setAddOpen(false);
    setAddKey((k) => k + 1);
    setAddKind(kind);
  };
  const addSource = (src: NewSource) => {
    const id = Math.max(0, ...sources.map((s) => s.id)) + 1;
    const topicLabel = src.topic === "General Information" ? "General" : src.topic;
    setSources((prev) => [...prev, { id, name: src.name, url: src.url, kind: src.kind, topic: topicLabel, status: "Draft", checked: "Just now", owner: src.owner }]);
    setAddKind(null);
    onChange();
    notify(`“${src.name}” added as a draft source`);
  };
  const checkUpdates = () => {
    setChecking(true);
    window.setTimeout(() => {
      setSources((prev) => prev.map((s) => (s.kind === "web" ? { ...s, checked: "Just now" } : s)));
      setChecking(false);
      notify("Website sources checked — no new changes found");
    }, 900);
  };
  const runTest = (text = question, testMode = mode) => {
    setResult(answerFor(text, language, sources, testMode));
    setRating(null);
  };

  const subTabButton = (t: (typeof SUB_TABS)[number]) => (
    <button
      key={t}
      type="button"
      onClick={() => setSub(t)}
      className={`h-[30px] rounded-[7px] border px-[14px] text-[13.6px] transition ${
        sub === t ? "border-[#cfe9d6] border-b-[3px] border-b-[#15633a] bg-[#eaf6ee] font-medium text-[#14532d]" : "border-[#dfe3e8] bg-white text-[#0f172a] hover:border-[#15633a]"
      }`}
    >
      {t === "Review Queue" ? `Review Queue (${reviewItems.length})` : t}
    </button>
  );

  return (
    <div className="flex h-full flex-col">
      <ConfirmDialog confirm={confirm} onClose={closeConfirm} />
      <ReviewQuestionModal
        key={`question-${reviewQuestionId ?? "closed"}`}
        item={reviewQuestion}
        onClose={() => setReviewQuestionId(null)}
        onSave={() => {
          setReviewItems((prev) => prev.filter((r) => r.id !== reviewQuestionId));
          setReviewQuestionId(null);
          onChange();
          notify("Answer saved as a draft");
        }}
        onNeedsConfirmation={() => {
          setReviewItems((prev) => prev.map((r) => (r.id === reviewQuestionId ? { ...r, awaiting: true } : r)));
          setReviewQuestionId(null);
          notify("Sent to the team for confirmation");
        }}
      />
      <AddSourceModal key={addKey} kind={addKind} onClose={() => setAddKind(null)} onImport={addSource} />
      <ReviewUpdateModal
        key={reviewId ?? "closed"}
        source={reviewSource}
        onClose={() => setReviewId(null)}
        onApprove={() => {
          finishReview();
          onChange();
          notify("Update approved — it goes live after publishing");
        }}
        onKeep={() => {
          finishReview();
          notify("Kept the current published content");
        }}
      />
      {/* Sub-tabs + status strip */}
      <div className="flex items-center gap-[10px]">{SUB_TABS.map(subTabButton)}</div>
      <div className="mt-[6px] flex h-[32px] items-center gap-[20px] rounded-[10px] border border-[#e3e8e4] bg-white px-[14px] text-[13.1px] text-[#334155]">
        <span className="inline-flex items-center gap-[8px] rounded-full bg-[#eaf6ee] py-[3px] pl-[4px] pr-[12px] font-medium text-[#14532d]">
          <span className="grid h-[22px] w-[22px] place-items-center rounded-full bg-white">
            <Image src={LOGO} alt="" width={40} height={40} className="h-[16px] w-[16px] object-contain" />
          </span>
          Hybrid AI
        </span>
        <span className="h-[16px] w-px bg-[#cbd5e1]" />
        <span>Live knowledge: v1.2</span>
        <span className="h-[16px] w-px bg-[#cbd5e1]" />
        <span className="flex items-center gap-[8px]">
          <Database className="h-[16px] w-[16px]" /> {published} published sources
        </span>
        <span className="h-[16px] w-px bg-[#cbd5e1]" />
        <span className="flex items-center gap-[8px] text-[#d97706]">
          <span className="h-[10px] w-[10px] rounded-full bg-[#f59e0b]" /> {pending} update{pending === 1 ? "" : "s"} to review
        </span>
        <span className="h-[16px] w-px bg-[#cbd5e1]" />
        <span className="flex items-center gap-[8px]">
          <FlaskConical className="h-[16px] w-[16px]" /> Demo data (not actual crawl)
        </span>
      </div>

      <div className="mt-[8px] grid min-h-0 flex-1 grid-cols-[772px_1fr] gap-[14px]">
        {/* ── Left ── */}
        <div className="flex min-h-0 flex-col gap-[8px]">
          {sub === "Knowledge Sources" && (
            <div className={`${cardClass} px-[14px] pb-[6px] pt-[8px]`}>
              <div className="flex items-center gap-[10px]">
                <p className="mr-auto text-[19.6px] font-bold leading-tight text-[#0f2a1c]">Knowledge Sources</p>
                <span className="relative">
                  <button
                    type="button"
                    onClick={() => setAddOpen((v) => !v)}
                    aria-expanded={addOpen}
                    className="inline-flex h-[32px] items-center gap-[9px] rounded-[7px] bg-[#15633a] px-[14px] text-[14.1px] font-medium text-white shadow-sm transition hover:bg-[#124f2f]"
                  >
                    <Plus className="h-[17px] w-[17px]" /> Add Source <ChevronDown className="h-[15px] w-[15px]" />
                  </button>
                  {addOpen && (
                    <>
                      <button type="button" aria-label="Close menu" className="fixed inset-0 z-10 cursor-default" onClick={() => setAddOpen(false)} />
                      <span className="absolute right-0 top-full z-20 mt-[4px] block w-[180px] overflow-hidden rounded-[8px] border border-[#e5e7eb] bg-white py-[4px] text-[13.6px] shadow-lg">
                        {(
                          [
                            ["web", "Website page", Globe],
                            ["pdf", "PDF document", FileText],
                            ["manual", "Manual answer", Plus],
                          ] as const
                        ).map(([kind, name, Icon]) => (
                          <button key={kind} type="button" onClick={() => openAdd(kind)} className="flex w-full items-center gap-[10px] px-[12px] py-[7px] text-left hover:bg-[#f1f7ee]">
                            <Icon className="h-[15px] w-[15px]" /> {name}
                          </button>
                        ))}
                      </span>
                    </>
                  )}
                </span>
                <button
                  type="button"
                  onClick={checkUpdates}
                  disabled={checking}
                  className="inline-flex h-[32px] items-center gap-[9px] rounded-[7px] border border-[#cbd5e1] bg-white px-[14px] text-[14.1px] text-[#0f172a] transition hover:border-[#15633a] disabled:opacity-70"
                >
                  <RotateCw className={`h-[16px] w-[16px] ${checking ? "animate-spin" : ""}`} /> {checking ? "Checking..." : "Check for Updates"}
                </button>
              </div>

              <div className="mt-[6px] flex items-center gap-[12px]">
                <label className="relative flex-1">
                  <Search className="pointer-events-none absolute left-[13px] top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-[#475569]" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search sources..."
                    className="h-[32px] w-full rounded-[7px] border border-[#dfe3e8] bg-white pl-[38px] pr-[12px] text-[13.6px] text-[#0f172a] outline-none placeholder:text-[#94a3b8] focus:border-[#15633a]"
                  />
                </label>
                <label className="relative w-[200px]">
                  <span className="pointer-events-none absolute left-[13px] top-1/2 -translate-y-1/2 text-[13.1px] text-[#64748b]">Topic:</span>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value as (typeof TOPICS)[number])}
                    aria-label="Topic"
                    className="h-[32px] w-full cursor-pointer appearance-none rounded-[7px] border border-[#dfe3e8] bg-white pl-[58px] pr-[32px] text-[13.6px] text-[#0f172a] outline-none focus:border-[#15633a]"
                  >
                    {TOPICS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-[11px] top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#0f172a]" />
                </label>
              </div>

              <div className="mt-[6px] overflow-hidden rounded-[8px] border border-[#eef0f2] text-[13.6px]">
                <div className="grid grid-cols-[214px_84px_158px_148px_1fr] items-center bg-[#f7f8fa] px-[14px] py-[3px] text-[#0f172a]">
                  <span className="pl-[10px]">Source</span>
                  <span>Topic</span>
                  <span>Live status</span>
                  <span>Last checked</span>
                  <span>Action</span>
                </div>
                {visible.length === 0 && <p className="border-t border-[#eef0f2] py-[12px] text-center text-[#64748b]">No sources match.</p>}
                {visible.map((s) => {
                  const Icon = s.kind === "pdf" ? FileText : s.kind === "web" ? Globe : Plus;
                  return (
                    <div key={s.id} className="border-t border-[#eef0f2]">
                      <div className="grid h-[40px] grid-cols-[214px_84px_158px_148px_1fr] items-center px-[14px] text-[#0f172a]">
                        <span className="flex min-w-0 items-center gap-[12px]">
                          <Icon className="h-[19px] w-[19px] shrink-0 text-[#334155]" />
                          <span className="min-w-0">
                            <span className="block truncate leading-tight">{s.name}</span>
                            {s.url && <span className="block truncate text-[12.1px] leading-tight text-[#64748b]">{s.url}</span>}
                          </span>
                        </span>
                        <span>{s.topic}</span>
                        <span>
                          <span className={`inline-flex h-[24px] items-center gap-[8px] rounded-[6px] px-[10px] text-[12.6px] ${STATUS_PILL[s.status]}`}>
                            <i className="h-[9px] w-[9px] rounded-full" />
                            {s.status}
                          </span>
                        </span>
                        <span>{s.checked}</span>
                        <span className="flex items-center gap-[12px]">
                          {s.status === "Update pending" ? (
                            <button
                              type="button"
                              onClick={() => setReviewId(s.id)}
                              className="h-[27px] w-[80px] rounded-[7px] border border-[#2f8a4c] bg-white text-[13.6px] font-medium text-[#14532d] transition hover:bg-[#f1f7ee]"
                            >
                              Review
                            </button>
                          ) : s.url ? (
                            <a
                              href={`https://${s.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="grid h-[27px] w-[80px] place-items-center rounded-[7px] border border-[#2f8a4c] bg-white text-[13.6px] font-medium text-[#14532d] transition hover:bg-[#f1f7ee]"
                            >
                              View
                            </a>
                          ) : (
                            <button
                              type="button"
                              onClick={() => viewSource(s)}
                              className="h-[27px] w-[80px] rounded-[7px] border border-[#2f8a4c] bg-white text-[13.6px] font-medium text-[#14532d] transition hover:bg-[#f1f7ee]"
                            >
                              View
                            </button>
                          )}
                          <RowMenu
                            label={`More actions for ${s.name}`}
                            items={[
                              { label: "View details", onSelect: () => viewSource(s) },
                              ...(s.url ? [{ label: "Open website page", onSelect: () => window.open(`https://${s.url}`, "_blank", "noopener,noreferrer") }] : []),
                              ...(s.kind === "web"
                                ? [
                                    {
                                      label: "Check this page now",
                                      onSelect: () => {
                                        setSources((prev) => prev.map((x) => (x.id === s.id ? { ...x, checked: "Just now" } : x)));
                                        notify(`“${s.name}” checked — no new changes found`);
                                      },
                                    },
                                  ]
                                : []),
                              { label: "Delete source", danger: true, onSelect: () => deleteSource(s) },
                            ]}
                          />
                        </span>
                      </div>
                      {s.status === "Update pending" && (
                        <p className="mx-[12px] mb-[4px] flex items-center gap-[10px] rounded-[6px] bg-[#fdf6e7] px-[10px] py-[2px] text-[11.6px] text-[#b45309]">
                          <Info className="h-[14px] w-[14px] fill-[#f59e0b] text-white" /> Published content stays active until the update is approved.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="mt-[3px] text-[12.1px] text-[#64748b]">Showing {visible.length} sources • Review content before publishing.</p>
            </div>
          )}

          {sub === "Approved Answers" && (
            <div className={`${cardClass} px-[14px] pb-[8px] pt-[8px]`}>
              <div className="flex items-center justify-between">
                <p className="text-[20.5px] font-bold leading-tight text-[#0f2a1c]">Approved Answers</p>
                <button type="button" onClick={() => onGoToTab("Questions & Answers")} className="flex items-center gap-[8px] text-[13.6px] font-medium text-[#15633a] hover:underline">
                  Manage in Questions &amp; Answers <ArrowRight className="h-[15px] w-[15px]" />
                </button>
              </div>
              <div className="mt-[8px] overflow-hidden rounded-[8px] border border-[#eef0f2] text-[13.6px]">
                <div className="grid grid-cols-[1fr_180px_140px] bg-[#f7f8fa] px-[14px] py-[5px]">
                  <span>Question</span>
                  <span>Topic</span>
                  <span>Last updated</span>
                </div>
                {APPROVED.map((a) => (
                  <div key={a.question} className="grid h-[38px] grid-cols-[1fr_180px_140px] items-center border-t border-[#eef0f2] px-[14px]">
                    <span className="flex items-center gap-[10px]">
                      <Check className="h-[15px] w-[15px] text-[#15803d]" /> {a.question}
                    </span>
                    <span>{a.topic}</span>
                    <span className="text-[#64748b]">{a.updated}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sub !== "Approved Answers" && (
            <div className={`${cardClass} flex h-[42px] shrink-0 items-center gap-[14px] px-[14px]`}>
              {/* One line at any width: the rules shrink and truncate (full text on hover), the
                  title and button never wrap */}
              <p className="shrink-0 whitespace-nowrap text-[16.6px] font-bold text-[#0f2a1c]">Answer Controls</p>
              <div className="ml-auto flex min-w-0 items-center gap-[14px]">
                {(
                  [
                    { icon: <ShieldCheck className="h-[17px] w-[17px] shrink-0 fill-[#16a34a] text-white" />, text: "Approved content only" },
                    { icon: <Lock className="h-[16px] w-[16px] shrink-0 text-[#15803d]" />, text: "Verified pricing & status" },
                    { icon: <UsersRound className="h-[17px] w-[17px] shrink-0 text-[#15803d]" />, text: "Auto handover when unanswered" },
                  ] as const
                ).map((rule, i) => (
                  <Fragment key={rule.text}>
                    {i > 0 && <span className="h-[16px] w-px shrink-0 bg-[#cbd5e1]" />}
                    <span title={rule.text} className="flex min-w-0 items-center gap-[6px] text-[11.6px] text-[#475569]">
                      {rule.icon}
                      <span className="truncate">{rule.text}</span>
                    </span>
                  </Fragment>
                ))}
              </div>
              <button
                type="button"
                onClick={() => onGoToTab("Settings")}
                className="inline-flex h-[27px] shrink-0 items-center gap-[7px] whitespace-nowrap rounded-[7px] border border-[#cbd5e1] bg-white px-[10px] text-[12.1px] text-[#0f172a] transition hover:border-[#15633a]"
              >
                <Settings className="h-[15px] w-[15px] shrink-0" /> Edit Rules
              </button>
            </div>
          )}

          <div className={`${cardClass} flex min-h-0 flex-1 flex-col px-[14px] pb-[8px] pt-[8px]`}>
            <div className="flex items-center justify-between">
              <p className="text-[17.6px] font-bold text-[#0f2a1c]">Needs Your Review ({reviewItems.length})</p>
              <button type="button" onClick={() => setSub("Review Queue")} className="flex items-center gap-[8px] text-[13.6px] font-medium text-[#15633a] hover:underline">
                View All <ArrowRight className="h-[15px] w-[15px]" />
              </button>
            </div>
            <div className="mt-[4px] overflow-hidden rounded-[8px] border border-[#eef0f2] text-[13.6px]">
              <div className="grid grid-cols-[264px_122px_168px_1fr] bg-[#f7f8fa] px-[18px] py-[4px] text-[#0f172a]">
                <span>Question</span>
                <span>Asked</span>
                <span>Owner</span>
                <span>Action</span>
              </div>
              {reviewItems.length === 0 && <p className="border-t border-[#eef0f2] py-[10px] text-center text-[#64748b]">All caught up — nothing waiting for review.</p>}
              {reviewItems.map((r) => (
                <div key={r.id} className="grid h-[36px] grid-cols-[264px_122px_168px_1fr] items-center border-t border-[#eef0f2] px-[18px] text-[#0f172a]">
                  <span className="truncate">{r.question}</span>
                  <span className="text-[12.6px] text-[#64748b]">{r.asked} times</span>
                  <span>{r.owner}</span>
                  <span className="flex items-center gap-[30px]">
                    <button
                      type="button"
                      onClick={() => setReviewQuestionId(r.id)}
                      className={`h-[26px] w-[100px] rounded-[7px] border bg-white text-[12.6px] font-medium transition ${
                        r.awaiting ? "border-[#f5c27a] text-[#b45309] hover:bg-[#fffaf0]" : "border-[#2f8a4c] text-[#14532d] hover:bg-[#f1f7ee]"
                      }`}
                    >
                      {r.awaiting ? "Awaiting Team" : r.action}
                    </button>
                    <RowMenu
                      label={`More actions for “${r.question}”`}
                      items={[
                        { label: r.awaiting ? "Open review" : r.action, onSelect: () => setReviewQuestionId(r.id) },
                        {
                          label: "Test this question",
                          onSelect: () => {
                            setQuestion(r.question);
                            runTest(r.question);
                          },
                        },
                        { label: "Dismiss", danger: true, onSelect: () => dismissQuestion(r) },
                      ]}
                    />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: tester ── */}
        <div className={`${cardClass} flex min-h-0 flex-col px-[14px] pb-[8px] pt-[8px]`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[19.6px] font-bold leading-tight text-[#0f2a1c]">Test Organic Mitra</p>
              <p className="text-[13.1px] text-[#64748b]">Test responses before publishing.</p>
            </div>
            <div className="flex overflow-hidden rounded-[7px] border border-[#dfe3e8]">
              {(["Live", "Draft"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m);
                    runTest(question, m);
                  }}
                  aria-pressed={mode === m}
                  className={`h-[29px] w-[80px] text-[13.1px] transition ${mode === m ? "bg-[#15633a] font-medium text-white" : "bg-white text-[#0f172a] hover:bg-slate-50"}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-[6px] grid grid-cols-[1fr_92px_120px] gap-[8px]">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runTest()}
              maxLength={150}
              aria-label="Test question"
              className="h-[32px] rounded-[7px] border border-[#dfe3e8] bg-white px-[12px] text-[13.6px] text-[#0f172a] outline-none focus:border-[#15633a]"
            />
            <Select value={language} options={["Hinglish", "English", "Hindi"]} onChange={setLanguage} label="Language" selectClassName="!h-[32px] !pl-[10px] !pr-[28px] !text-[13.1px]" />
            <button
              type="button"
              onClick={() => runTest()}
              className="inline-flex h-[32px] items-center justify-center gap-[8px] rounded-[7px] bg-[#15633a] text-[13.1px] font-medium text-white shadow-sm transition hover:bg-[#124f2f]"
            >
              <Send className="h-[16px] w-[16px]" /> Test Answer
            </button>
          </div>

          <div className="mt-[8px] rounded-[10px] bg-[#f1f7f2] px-[12px] py-[12px]">
            <div className="flex items-start gap-[12px]">
              <BotAvatar size={38} />
              <div className="min-w-0 flex-1">
                <div className="rounded-[10px] bg-white px-[12px] py-[6px] text-[13.6px] leading-snug text-[#0f172a] shadow-sm">{result.text}</div>
                {result.found ? (
                  <>
                    <span className="mt-[6px] inline-flex items-center gap-[8px] rounded-[6px] bg-[#dcf3e1] px-[10px] py-[2px] text-[12.6px] text-[#15803d]">
                      <Check className="h-[15px] w-[15px] rounded-full bg-[#16a34a] p-[2px] text-white" strokeWidth={3} /> Source found
                    </span>
                    <div className="mt-[5px] flex items-center gap-[12px] rounded-[8px] bg-[#e9eef0] px-[12px] py-[4px]">
                      <FileText className="h-[19px] w-[19px] text-[#334155]" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.6px] text-[#0f172a]">{result.source?.name}</span>
                        <span className="block text-[12.1px] text-[#64748b]">{result.source?.detail}</span>
                      </span>
                      {result.source?.url ? (
                        <a href={`https://${result.source.url}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-[6px] text-[13.1px] text-[#15633a] hover:underline">
                          View source <ArrowUpRight className="h-[14px] w-[14px]" />
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const s = sources.find((x) => x.name === result.source?.name);
                            if (s) viewSource(s);
                          }}
                          className="flex items-center gap-[6px] text-[13.1px] text-[#15633a] hover:underline"
                        >
                          View source <ArrowUpRight className="h-[14px] w-[14px]" />
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <span className="mt-[8px] inline-flex items-center gap-[8px] rounded-[6px] bg-[#fdf3e1] px-[10px] py-[3px] text-[13.1px] text-[#b45309]">
                    <Info className="h-[15px] w-[15px]" /> {result.draftOnly ? "Only in draft knowledge — not live yet" : "No approved source — would hand over to the team"}
                  </span>
                )}
                <p className="mt-[4px] text-[12.1px] text-[#475569]">Knowledge version: {mode === "Draft" ? "Draft v1.3" : "Live v1.2"}</p>
                <div className="mt-[4px] flex justify-end gap-[10px]">
                  <button
                    type="button"
                    onClick={() => {
                      setRating("correct");
                      notify("Marked as correct — thanks for checking");
                    }}
                    aria-pressed={rating === "correct"}
                    className={`inline-flex h-[27px] items-center gap-[8px] rounded-[7px] border px-[11px] text-[12.6px] transition ${rating === "correct" ? "border-[#15633a] bg-[#eaf6ee] text-[#14532d]" : "border-[#dfe3e8] bg-white text-[#334155] hover:border-[#15633a]"}`}
                  >
                    <ThumbsUp className="h-[15px] w-[15px]" /> Correct
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (rating === "fix") return;
                      setRating("fix");
                      const text = question.trim() || "Untitled question";
                      if (!reviewItems.some((r) => r.question.toLowerCase() === text.toLowerCase())) {
                        setReviewItems((prev) => [
                          ...prev,
                          {
                            id: Math.max(0, ...prev.map((r) => r.id)) + 1,
                            question: text,
                            asked: 1,
                            topic: "General",
                            owner: "Admin",
                            action: "Review",
                            visitorMessage: text,
                            botReply: result.text,
                          },
                        ]);
                      }
                      notify("Added to Needs Your Review for correction");
                    }}
                    aria-pressed={rating === "fix"}
                    className={`inline-flex h-[27px] items-center gap-[8px] rounded-[7px] border px-[11px] text-[12.6px] transition ${rating === "fix" ? "border-[#d97706] bg-[#fdf3e1] text-[#b45309]" : "border-[#dfe3e8] bg-white text-[#334155] hover:border-[#d97706]"}`}
                  >
                    <Flag className="h-[15px] w-[15px]" /> Needs correction
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setQuestion("Is parking available?");
              runTest("Is parking available?");
            }}
            className="mt-auto flex items-center gap-[12px] border-b border-[#eef0f2] py-[8px] text-left transition hover:bg-[#f8faf9]"
          >
            <CircleHelp className="h-[22px] w-[22px] shrink-0 text-[#334155]" />
            <span className="flex-1">
              <span className="block text-[13.6px] font-medium text-[#0f2a1c]">Test unanswered question</span>
              <span className="block text-[12.6px] text-[#64748b]">Check the visitor message and team handover.</span>
            </span>
            <ChevronRight className="h-[18px] w-[18px] text-[#334155]" />
          </button>
          <p className="mt-[4px] flex items-center gap-[10px] text-[12.1px] text-[#64748b]">
            <Info className="h-[15px] w-[15px]" /> Test only • No visitor message or enquiry created.
          </p>
        </div>
      </div>
    </div>
  );
}
