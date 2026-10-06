"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  ChevronDown,
  CloudUpload,
  Eye,
  FileText,
  History,
  Info,
  MessageCircleMore,
  MessageSquareText,
  Minus,
  Paperclip,
  Pencil,
  Plus,
  Send,
  Settings,
  Trash2,
  Workflow,
  X,
  type LucideIcon,
} from "lucide-react";
import { DESIGN_WIDTH, useFitWidth } from "@/components/chatbot/useFitWidth";
import {
  BotAvatar,
  ConfirmDialog,
  DragHandle,
  LOGO,
  ToastBar,
  inputClass,
  reorder,
  selectClass,
  useReorder,
  type ConfirmOptions,
  type Notify,
  type TabHandle,
  type Toast,
} from "./managerUi";
import QuestionsAnswersTab from "./QuestionsAnswersTab";
import FormsRoutingTab from "./FormsRoutingTab";
import SettingsTab from "./SettingsTab";
import AIKnowledgeTab from "./AIKnowledgeTab";
import PublishModal, { type PublishTab, type Version } from "./PublishModal";
import DeleteButtonModal from "./DeleteButtonModal";
import PreviewChatModal from "./PreviewChatModal";

/*
 * Chatbot Manager — design preview. The menu below is sample data kept in page state
 * (see the "Design preview" chip); nothing is saved to or published on the website.
 *
 * Laid out at the design's width with the design's pixel sizes, then zoomed to the
 * available width (see useFitWidth). The dashboard layout's AdminContentScale remaps many
 * text-[Npx] classes with !important, so this page sticks to sizes outside that list.
 */

// ─── Sample data ─────────────────────────────────────────────────────────────

const ACTIONS = ["Show Options", "Show Answer", "Open Form", "Open Link", "Talk to Team"] as const;
type Action = (typeof ACTIONS)[number];

type MenuButton = {
  id: number;
  label: string;
  hindi: string;
  action: Action;
  nextStep: string;
  active: boolean;
  reply: string;
  options: string[];
  /** Link URL, form name or team — used by Open Link / Open Form / Talk to Team */
  target: string;
};

/** Where Open Form / Talk to Team buttons can send the visitor (sample lists) */
const FORM_TARGETS = ["Quotation Request", "Callback Request", "Visitor Registration"];
const TEAM_TARGETS = ["Sales Team", "Registration Team", "Buyer Team", "Team Lead", "Admin"];

/** What a button needs before it can be saved; returns the first problem or "" */
function problemWith(b: MenuButton) {
  if (!b.label.trim()) return "Add a button label.";
  if (!b.reply.trim()) return "Add the reply message.";
  if (b.action === "Show Options" && !b.options.some((o) => o.trim())) return "Add at least one next option, or change the action.";
  if (b.action === "Show Options" && b.options.some((o) => !o.trim())) return "Fill in or remove the empty option.";
  if (b.action === "Open Link" && !/^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(b.target.trim())) return "Enter a valid link, e.g. bharatorganicexpo.com/visit.";
  if ((b.action === "Open Form" || b.action === "Talk to Team") && !b.target) return `Choose a ${b.action === "Open Form" ? "form" : "team"}.`;
  return "";
}

const same = (a: MenuButton | undefined, b: MenuButton) => !!a && JSON.stringify(a) === JSON.stringify(b);

const INITIAL_BUTTONS: MenuButton[] = [
  {
    id: 1,
    label: "Book a Stall",
    hindi: "स्टॉल बुक करें",
    action: "Show Options",
    nextStep: "Stall Options",
    active: true,
    reply: "Happy to help! What would you like to explore?",
    options: ["Stall Sizes", "Stall Pricing", "Get Brochure", "Talk to Sales"],
    target: "",
  },
  {
    id: 2,
    label: "Visit the Expo",
    hindi: "एक्सपो देखने आएं",
    action: "Show Answer",
    nextStep: "Visitor Information",
    active: true,
    reply: "Visitor registration is free. Here is how to register.",
    options: [],
    target: "",
  },
  {
    id: 3,
    label: "MSME / PMS Support",
    hindi: "MSME / PMS सहायता",
    action: "Show Options",
    nextStep: "PMS Guidance",
    active: true,
    reply: "Here is the support available for eligible exhibitors.",
    options: ["Eligibility", "Documents", "Talk to Team"],
    target: "",
  },
  {
    id: 4,
    label: "More Options",
    hindi: "और विकल्प",
    action: "Show Options",
    nextStep: "Additional Topics",
    active: true,
    reply: "Here are some more topics I can help with.",
    options: ["Buyer–Seller Meet", "Conference", "Sponsorship"],
    target: "",
  },
];

/** Hindi preview text for the reply and next options of the sample buttons */
const HINDI: Record<string, string> = {
  "Happy to help! What would you like to explore?": "ज़रूर! आप क्या जानना चाहेंगे?",
  "Stall Sizes": "स्टॉल साइज़",
  "Stall Pricing": "स्टॉल की कीमत",
  "Get Brochure": "ब्रोशर पाएं",
  "Talk to Sales": "सेल्स टीम से बात करें",
};

const TABS: { label: string; icon: LucideIcon }[] = [
  { label: "Buttons & Flows", icon: Workflow },
  { label: "Questions & Answers", icon: MessageSquareText },
  { label: "AI Knowledge & Answers", icon: MessageCircleMore },
  { label: "Forms & Routing", icon: FileText },
  { label: "Settings", icon: Settings },
];

// ─── Small pieces ────────────────────────────────────────────────────────────

function ActionSelect({ value, onChange, className = "" }: { value: Action; onChange: (a: Action) => void; className?: string }) {
  return (
    <label className={`relative block ${className}`}>
      <select value={value} onChange={(e) => onChange(e.target.value as Action)} className={selectClass} aria-label="Action">
        {ACTIONS.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-[13px] top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-[#0f172a]" />
    </label>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={onChange} className="flex items-center gap-[10px]">
      <span className={`relative h-[21px] w-[36px] rounded-full transition ${on ? "bg-[#16a34a]" : "bg-[#cbd5e1]"}`}>
        <span className={`absolute top-[2.5px] h-[16px] w-[16px] rounded-full bg-white shadow transition-all ${on ? "left-[17.5px]" : "left-[2.5px]"}`} />
      </span>
      <span className={`text-[13.6px] ${on ? "text-[#15803d]" : "text-[#64748b]"}`}>{on ? "Active" : "Inactive"}</span>
    </button>
  );
}

/* Tighter fields for the "Edit Button" form */
const editLabel = "mb-[2px] block text-[13.1px] text-[#334155]";
const editInput = `${inputClass} !h-[32px] !text-[14.1px]`;

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex h-[32px] items-center rounded-[8px] border border-[#2f8a4c] bg-white px-[12px] text-[13.6px] text-[#14532d]">{children}</span>
);

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ChatbotManagerPage() {
  const { ref, zoom } = useFitWidth();
  const [tab, setTab] = useState(TABS[0].label);
  const [buttons, setButtons] = useState(INITIAL_BUTTONS);
  const [selectedId, setSelectedId] = useState(1);
  const [draft, setDraft] = useState<MenuButton>(INITIAL_BUTTONS[0]);
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [published, setPublished] = useState({ version: 2, pending: true });
  // Publish popup (null = closed) and the sample version list, newest (live) first
  const [publishTab, setPublishTab] = useState<PublishTab | null>(null);
  const [versions, setVersions] = useState<Version[]>([
    { minor: 2, date: "02 Oct 2026, 10:15 AM", by: "Admin", note: "Added MSME / PMS support flow." },
    { minor: 1, date: "01 Oct 2026, 4:30 PM", by: "Admin", note: "First published menu." },
  ]);
  const publish = (note: string) => {
    const date = new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true }).replace(" am", " AM").replace(" pm", " PM");
    setVersions((prev) => [{ minor: prev[0].minor + 1, date, by: "Admin", note }, ...prev]);
    setPublished((p) => ({ version: p.version + 1, pending: false }));
    setPublishTab(null);
  };

  // Toasts and confirm popups shared by every tab
  const [toast, setToast] = useState<Toast | null>(null);
  const notify: Notify = useCallback((text, options) => setToast((prev) => ({ id: (prev?.id ?? 0) + 1, text, tone: options?.tone ?? "success", undo: options?.undo })), []);
  const closeToast = useCallback(() => setToast(null), []);
  const [confirm, setConfirm] = useState<ConfirmOptions | null>(null);
  const closeConfirm = useCallback(() => setConfirm(null), []);
  const [previewOpen, setPreviewOpen] = useState(false);
  const closePreview = useCallback(() => setPreviewOpen(false), []);
  // Header "Save Draft" saves whatever the open tab is editing
  const qaRef = useRef<TabHandle>(null);
  const formsRef = useRef<TabHandle>(null);
  const settingsRef = useRef<TabHandle>(null);
  // Red borders on missing fields after a failed save
  const [showErrors, setShowErrors] = useState(false);
  const [editingStep, setEditingStep] = useState<number | null>(null);

  const saved = buttons.find((b) => b.id === draft.id);
  const dirty = !same(saved, draft);
  const problem = problemWith(draft);

  /** Runs `next` now, or after asking what to do with unsaved edits */
  const guard = (next: () => void) => {
    if (!dirty) return next();
    setConfirm({
      title: "Save changes to this button?",
      body: `“${draft.label || "Untitled"}” has unsaved changes.`,
      confirmLabel: "Save & continue",
      run: () => {
        if (!saveDraft()) return;
        next();
      },
      secondary: { label: "Discard", run: next },
    });
  };

  const select = (b: MenuButton) => {
    if (b.id === draft.id) return;
    guard(() => {
      setSelectedId(b.id);
      setDraft(b);
      setShowErrors(false);
    });
  };
  const update = (id: number, patch: Partial<MenuButton>) => {
    setButtons((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
    if (id === selectedId) setDraft((d) => ({ ...d, ...patch }));
    setPublished((p) => ({ ...p, pending: true }));
  };
  /** Saves the open button; returns false (and points at the problem) if it is incomplete */
  const saveDraft = () => {
    if (problem) {
      setShowErrors(true);
      notify(problem, { tone: "error" });
      return false;
    }
    const clean = { ...draft, label: draft.label.trim(), options: draft.options.map((o) => o.trim()), target: draft.target.trim() };
    setButtons((prev) => prev.map((b) => (b.id === clean.id ? clean : b)));
    setDraft(clean);
    setShowErrors(false);
    setPublished((p) => ({ ...p, pending: true }));
    notify(`“${clean.label}” saved to draft`);
    return true;
  };
  const cancelDraft = () => {
    setDraft(buttons.find((b) => b.id === selectedId) ?? buttons[0]);
    setShowErrors(false);
  };
  const addButton = () =>
    guard(() => {
      const id = Math.max(...buttons.map((b) => b.id)) + 1;
      const b: MenuButton = { id, label: "New Button", hindi: "", action: "Show Answer", nextStep: "New Step", active: false, reply: "", options: [], target: "" };
      setButtons((prev) => [...prev, b]);
      setSelectedId(id);
      setDraft(b);
      setShowErrors(false);
      setPublished((p) => ({ ...p, pending: true }));
    });

  /** Header "Save Draft": saves the open tab's editor */
  const saveAll = () => {
    if (tab === "Buttons & Flows") {
      if (dirty) saveDraft();
      else notify("Draft saved — no new button changes");
    } else if (tab === "Questions & Answers") qaRef.current?.save();
    else if (tab === "Forms & Routing") formsRef.current?.save();
    else if (tab === "Settings") settingsRef.current?.save();
    else notify("Draft saved");
  };

  const ids = useMemo(() => buttons.map((b) => b.id), [buttons]);
  const drag = useReorder(ids, (from, to) => {
    setButtons((prev) => reorder(prev, from, to));
    setPublished((p) => ({ ...p, pending: true }));
  });

  /** Action-specific default target when the action changes */
  const withAction = (b: MenuButton, action: Action): MenuButton => ({
    ...b,
    action,
    target: action === "Open Form" ? FORM_TARGETS[0] : action === "Talk to Team" ? TEAM_TARGETS[0] : action === "Open Link" ? (b.action === "Open Link" ? b.target : "") : "",
    options: action === "Show Options" ? (b.options.length ? b.options : ["New Option"]) : b.options,
  });

  // Button waiting for delete confirmation (null = popup closed)
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const deleteTarget = buttons.find((b) => b.id === deleteId) ?? null;
  const closeDelete = useCallback(() => setDeleteId(null), []);
  const deleteButton = () => {
    const index = buttons.findIndex((b) => b.id === deleteId);
    const rest = buttons.filter((b) => b.id !== deleteId);
    setButtons(rest);
    // Deleting the open button moves the editor to its neighbour
    if (deleteId === selectedId) select(rest[Math.min(index, rest.length - 1)]);
    setPublished((p) => ({ ...p, pending: true }));
    setDeleteId(null);
    notify(`“${deleteTarget?.label}” deleted`);
  };

  const markDraft = () => setPublished((p) => ({ ...p, pending: true }));
  const panelClass = (name: string) => `[grid-area:1/1] ${tab === name ? "" : "invisible pointer-events-none"}`;
  const panelProps = (name: string) => ({ "aria-hidden": tab !== name, inert: tab !== name });

  const activeButtons = buttons.filter((b) => b.active);
  const t = (text: string) => (lang === "hi" ? HINDI[text] ?? text : text);
  const label = (b: MenuButton) => (lang === "hi" && b.hindi ? b.hindi : b.label);

  return (
    <div ref={ref} className="w-full overflow-x-hidden bg-white">
      <div style={{ zoom, width: DESIGN_WIDTH }} className="flex flex-col px-[16px] pb-[5px] pt-[5px] text-[#0f172a]">
        {/* ── Header (the page name is already in the top bar) ── */}
        <div className="flex items-center justify-between gap-x-3">
          <div className="flex min-w-0 items-center gap-[14px]">
            <p className="min-w-0 truncate text-[17.5px] font-medium text-[#334155]">
              {tab === "AI Knowledge & Answers" ? "Control Organic Mitra’s knowledge and responses" : "Control buttons, answers and the visitor journey"}
            </p>
            <span
              title="Changes on this page are not saved to the website"
              className="inline-flex shrink-0 items-center gap-[7px] whitespace-nowrap rounded-[6px] border border-[#cfe9d6] bg-[#eefaf1] px-[11px] py-[4px] text-[13.4px] font-medium text-[#15803d]"
            >
              <Eye className="h-[15px] w-[15px]" /> Design preview
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-[12px]">
            {published.pending && (
              <span className="inline-flex h-[30px] items-center gap-[8px] whitespace-nowrap rounded-[6px] bg-[#fdf3e1] px-[12px] text-[13.4px] text-[#b45309]">
                <span className="h-[8px] w-[8px] rounded-full bg-[#f59e0b]" /> Draft changes
              </span>
            )}
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="h-[37px] whitespace-nowrap rounded-[7px] border border-[#d6dae0] bg-white px-[20px] text-[14.6px] font-medium text-[#0f172a] transition hover:border-[#15633a]"
            >
              Preview
            </button>
            <button
              type="button"
              onClick={saveAll}
              className="h-[37px] whitespace-nowrap rounded-[7px] border border-[#d6dae0] bg-white px-[20px] text-[14.6px] font-medium text-[#0f172a] transition hover:border-[#15633a]"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => setPublishTab("publish")}
              className="inline-flex h-[37px] items-center gap-[9px] whitespace-nowrap rounded-[7px] bg-[#15633a] px-[20px] text-[14.6px] font-medium text-white shadow-sm transition hover:bg-[#124f2f]"
            >
              <CloudUpload className="h-[18px] w-[18px]" /> Publish Changes
            </button>
          </div>
        </div>

        <DeleteButtonModal button={deleteTarget} onClose={closeDelete} onConfirm={deleteButton} />
        {previewOpen && <PreviewChatModal open buttons={buttons.map((b) => (b.id === draft.id ? draft : b))} hindi={HINDI} onClose={closePreview} />}
        <ConfirmDialog confirm={confirm} onClose={closeConfirm} />
        <ToastBar key={toast?.id} toast={toast} onDone={closeToast} />

        <PublishModal
          tab={publishTab}
          onTabChange={setPublishTab}
          onClose={() => setPublishTab(null)}
          versions={versions}
          hasDraft={published.pending}
          onPublish={(note) => {
            publish(note);
            notify("Changes published to the chatbot");
          }}
          onRestore={markDraft}
        />

        {/* ── Tabs ── */}
        <div className="mt-[6px] flex items-end gap-[8px] border-b border-[#e5e7eb]">
          {TABS.map(({ label: name, icon: Icon }) => (
            <button
              key={name}
              type="button"
              onClick={() => setTab(name)}
              className={`-mb-px flex items-center gap-[12px] border-b-[3px] px-[18px] pb-[9px] pt-[2px] text-[15.6px] transition ${
                tab === name ? "border-[#15633a] font-semibold text-[#15633a]" : "border-transparent text-[#475569] hover:text-[#15633a]"
              }`}
            >
              <Icon className="h-[20px] w-[20px]" /> {name}
            </button>
          ))}
        </div>

        {/* Tab panels share one grid cell: the hidden ones keep their space, so switching tabs
            never changes the page height */}
        <div className="mt-[8px] grid">
          <div {...panelProps("Buttons & Flows")} className={`${panelClass("Buttons & Flows")} grid grid-cols-[822px_1fr] gap-[15px]`}>
            {/* ── Left: menu + editor ── */}
            <div className="rounded-[12px] border border-[#e3e8e4] bg-white px-[16px] pb-[10px] pt-[8px] shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[20.5px] font-bold leading-tight text-[#0f2a1c]">Welcome Menu</p>
                  <p className="mt-[2px] text-[13.6px] text-[#64748b]">{activeButtons.length} active button{activeButtons.length === 1 ? "" : "s"}</p>
                </div>
                <button
                  type="button"
                  onClick={addButton}
                  className="inline-flex h-[36px] items-center gap-[9px] rounded-[7px] border border-[#2f8a4c] bg-white px-[18px] text-[14.6px] font-medium text-[#14532d] transition hover:bg-[#f1f7ee]"
                >
                  <Plus className="h-[18px] w-[18px]" /> Add Button
                </button>
              </div>

              {/* Buttons table */}
              <div className="mt-[10px] overflow-hidden rounded-[8px] border border-[#eef0f2]">
                <div className="grid grid-cols-[37px_50px_180px_152px_145px_120px_1fr] items-center bg-[#f7f8fa] px-[8px] py-[6px] text-[13.6px] text-[#475569]">
                  <span />
                  <span>Order</span>
                  <span>Button Label</span>
                  <span>Action</span>
                  <span>Next Step</span>
                  <span>Status</span>
                  <span className="text-center">Actions</span>
                </div>
                {buttons.map((b, i) => (
                  <div
                    key={b.id}
                    {...drag.row(b.id)}
                    onClick={() => select(b)}
                    className={`${drag.rowClass(b.id)} grid h-[45px] cursor-pointer grid-cols-[37px_50px_180px_152px_145px_120px_1fr] items-center border-t border-[#eef0f2] px-[8px] text-[14.6px] transition ${
                      selectedId === b.id ? "bg-[#ebf6ee]" : "hover:bg-[#f8faf9]"
                    }`}
                  >
                    <DragHandle props={drag.handle(b.id, b.label)} className="h-[28px] w-[22px]" />
                    <span className="text-[#0f172a]">{i + 1}</span>
                    <span className="truncate pr-[10px] text-[#0f172a]">{b.label}</span>
                    <span onClick={(e) => e.stopPropagation()} className="pr-[18px]">
                      <ActionSelect
                        value={b.action}
                        onChange={(action) => {
                          const next = withAction(b.id === draft.id ? draft : b, action);
                          update(b.id, { action, target: next.target, options: next.options });
                        }}
                      />
                    </span>
                    {/* Next Step: click to rename (Enter / Esc / click away to finish) */}
                    {editingStep === b.id ? (
                      <input
                        autoFocus
                        defaultValue={b.nextStep}
                        onClick={(e) => e.stopPropagation()}
                        onBlur={(e) => {
                          const v = e.target.value.trim();
                          if (v && v !== b.nextStep) update(b.id, { nextStep: v });
                          setEditingStep(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") e.currentTarget.blur();
                          if (e.key === "Escape") setEditingStep(null);
                        }}
                        maxLength={30}
                        aria-label={`Next step for ${b.label}`}
                        className="mr-[10px] h-[30px] min-w-0 rounded-[6px] border border-[#2f8a4c] px-[8px] text-[13.6px] outline-none"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingStep(b.id);
                        }}
                        title="Click to rename this step"
                        className="truncate pr-[10px] text-left text-[13.6px] text-[#0f172a] decoration-dotted underline-offset-4 hover:underline"
                      >
                        {b.nextStep}
                      </button>
                    )}
                    <span onClick={(e) => e.stopPropagation()}>
                      <Toggle on={b.active} onChange={() => update(b.id, { active: !b.active })} label={`${b.label} status`} />
                    </span>
                    <span className="flex justify-center gap-[6px]">
                      <button
                        type="button"
                        onClick={() => select(b)}
                        aria-label={`Edit ${b.label}`}
                        title="Edit"
                        className="grid h-[32px] w-[34px] place-items-center rounded-[7px] border border-[#dfe3e8] bg-white text-[#0f172a] transition hover:border-[#15633a] hover:text-[#15633a]"
                      >
                        <Pencil className="h-[16px] w-[16px]" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(b.id);
                        }}
                        disabled={buttons.length === 1}
                        aria-label={`Delete ${b.label}`}
                        title={buttons.length === 1 ? "The menu needs at least one button" : "Delete"}
                        className="grid h-[32px] w-[34px] place-items-center rounded-[7px] border border-[#dfe3e8] bg-white text-[#dc2626] transition hover:border-[#dc2626] hover:bg-[#fdf2f2] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#dfe3e8] disabled:hover:bg-white"
                      >
                        <Trash2 className="h-[16px] w-[16px]" />
                      </button>
                    </span>
                  </div>
                ))}
              </div>

              {/* Editor */}
              <div className="mt-[8px] rounded-[10px] border border-[#eef0f2] px-[14px] pb-[6px] pt-[7px]">
                <p className="text-[16.5px] font-bold leading-tight text-[#0f2a1c]">Edit Button: {draft.label || "Untitled"}</p>
                <div className="mt-[5px] grid grid-cols-2 gap-x-[24px] gap-y-[5px]">
                  <label>
                    <span className={editLabel}>
                      Button Label <span className="text-[#dc2626]">*</span>
                    </span>
                    <input value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} maxLength={30} aria-invalid={showErrors && !draft.label.trim()} className={`${editInput} ${showErrors && !draft.label.trim() ? "!border-[#dc2626]" : ""}`} />
                  </label>
                  <label>
                    <span className={editLabel}>Hindi Label</span>
                    <input value={draft.hindi} onChange={(e) => setDraft({ ...draft, hindi: e.target.value })} maxLength={30} className={editInput} />
                  </label>
                  <div>
                    <span className={editLabel}>
                      Action <span className="text-[#dc2626]">*</span>
                    </span>
                    <ActionSelect value={draft.action} onChange={(action) => setDraft(withAction(draft, action))} className="[&_select]:h-[32px] [&_select]:text-[14.1px]" />
                  </div>
                  <label className="row-span-1">
                    <span className={editLabel}>
                      Reply Message <span className="text-[#dc2626]">*</span>
                    </span>
                    <textarea
                      value={draft.reply}
                      onChange={(e) => setDraft({ ...draft, reply: e.target.value })}
                      rows={2}
                      maxLength={300}
                      aria-invalid={showErrors && !draft.reply.trim()}
                      className={`h-[40px] w-full resize-y rounded-[7px] border ${showErrors && !draft.reply.trim() ? "border-[#dc2626]" : "border-[#dfe3e8]"} bg-white px-[12px] py-[4px] text-[14.1px] leading-snug text-[#0f172a] outline-none transition focus:border-[#15633a] focus:ring-2 focus:ring-[#15633a]/15`}
                    />
                  </label>
                </div>

                <p className="mt-[5px] text-[13.6px] font-medium text-[#0f172a]">
                  {draft.action === "Open Link" ? "Link URL" : draft.action === "Open Form" ? "Form to Open" : draft.action === "Talk to Team" ? "Hand Over To" : "Next Options"}
                </p>
                <div className="mt-[3px] flex h-[30px] items-center gap-[16px]">
                  {draft.action === "Open Link" ? (
                    <input
                      value={draft.target}
                      onChange={(e) => setDraft({ ...draft, target: e.target.value })}
                      maxLength={200}
                      placeholder="e.g. bharatorganicexpo.com/visitor-registration"
                      aria-label="Link URL"
                      aria-invalid={showErrors && !!problem && problem.includes("link")}
                      className={`${editInput} !h-[30px] ${showErrors && problem.includes("link") ? "!border-[#dc2626]" : ""}`}
                    />
                  ) : draft.action === "Open Form" || draft.action === "Talk to Team" ? (
                    <label className="relative block w-[300px]">
                      <select
                        value={draft.target}
                        onChange={(e) => setDraft({ ...draft, target: e.target.value })}
                        aria-label={draft.action === "Open Form" ? "Form to open" : "Team"}
                        className={`${selectClass} !h-[30px] !text-[14.1px]`}
                      >
                        {(draft.action === "Open Form" ? FORM_TARGETS : TEAM_TARGETS).map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-[13px] top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-[#0f172a]" />
                    </label>
                  ) : draft.action === "Show Answer" ? (
                    <span className="text-[13.6px] text-[#64748b]">No options — this button shows an answer.</span>
                  ) : draft.options.length === 0 ? (
                    <span className={`text-[13.6px] ${showErrors ? "text-[#dc2626]" : "text-[#64748b]"}`}>No options yet — add at least one for visitors to choose.</span>
                  ) : (
                    draft.options.map((o, idx) => (
                      <span
                        key={idx}
                        className={`flex h-[30px] min-w-0 flex-1 items-center rounded-[7px] border bg-white ${showErrors && !o.trim() ? "border-[#dc2626]" : "border-[#dfe3e8]"}`}
                      >
                        <input
                          value={o}
                          onChange={(e) => setDraft({ ...draft, options: draft.options.map((x, j) => (j === idx ? e.target.value : x)) })}
                          maxLength={30}
                          aria-label={`Option ${idx + 1}`}
                          className="h-full min-w-0 flex-1 rounded-l-[7px] bg-transparent px-[12px] text-[14.1px] text-[#0f172a] outline-none"
                        />
                        <button
                          type="button"
                          onClick={(e) => e.currentTarget.parentElement?.querySelector("input")?.select()}
                          aria-label={`Edit option ${idx + 1}`}
                          className="grid h-full w-[30px] shrink-0 place-items-center border-l border-[#dfe3e8] text-[#0f172a] hover:text-[#15633a]"
                        >
                          <Pencil className="h-[14px] w-[14px]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDraft({ ...draft, options: draft.options.filter((_, j) => j !== idx) })}
                          aria-label={`Remove option ${idx + 1}`}
                          title="Remove option"
                          className="grid h-full w-[28px] shrink-0 place-items-center rounded-r-[7px] border-l border-[#dfe3e8] text-[#64748b] hover:bg-[#fdf2f2] hover:text-[#dc2626]"
                        >
                          <X className="h-[14px] w-[14px]" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                <div className="mt-[6px] flex items-end justify-between">
                  <div>
                    <button
                      type="button"
                      onClick={() => setDraft({ ...draft, options: [...draft.options, "New Option"] })}
                      disabled={draft.action !== "Show Options" || draft.options.length >= 4}
                      title={draft.action !== "Show Options" ? "Options are used with the “Show Options” action" : draft.options.length >= 4 ? "Up to 4 options" : undefined}
                      className="inline-flex h-[31px] items-center gap-[8px] rounded-[7px] border border-[#2f8a4c] bg-white px-[14px] text-[13.6px] font-medium text-[#14532d] transition hover:bg-[#f1f7ee] disabled:opacity-50"
                    >
                      <Plus className="h-[16px] w-[16px]" /> Add Option
                    </button>
                    <p className="mt-[4px] flex items-center gap-[10px] text-[12.6px] text-[#64748b]">
                      <Info className="h-[16px] w-[16px]" /> Button changes go live only after publishing.
                    </p>
                  </div>
                  <div className="flex items-center gap-[12px] pb-[4px]">
                    <button
                      type="button"
                      onClick={() => setDeleteId(draft.id)}
                      disabled={buttons.length === 1}
                      title={buttons.length === 1 ? "The menu needs at least one button" : undefined}
                      className="inline-flex h-[32px] items-center gap-[7px] rounded-[7px] border border-[#f3a5a5] bg-white px-[14px] text-[13.6px] font-medium text-[#dc2626] transition hover:bg-[#fdf2f2] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
                    >
                      <Trash2 className="h-[15px] w-[15px]" /> Delete
                    </button>
                    <button
                      type="button"
                      onClick={cancelDraft}
                      className="h-[32px] rounded-[7px] border border-[#d6dae0] bg-white px-[20px] text-[13.6px] font-medium text-[#0f172a] transition hover:border-[#15633a]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={saveDraft}
                      className="h-[32px] rounded-[7px] bg-[#15633a] px-[26px] text-[13.6px] font-medium text-white shadow-sm transition hover:bg-[#124f2f] disabled:opacity-60"
                    >
                      Save Button
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right: visitor preview ── */}
            <div className="flex flex-col rounded-[12px] border border-[#e3e8e4] bg-white px-[16px] pb-[10px] pt-[10px] shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[20.5px] font-bold leading-tight text-[#0f2a1c]">Visitor Preview</p>
                  <p className="mt-[2px] text-[13.6px] text-[#64748b]">Preview of draft changes</p>
                </div>
                <div className="flex overflow-hidden rounded-[7px] border border-[#dfe3e8]">
                  {(["en", "hi"] as const).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLang(l)}
                      aria-pressed={lang === l}
                      className={`h-[37px] px-[16px] text-[14.6px] transition ${
                        lang === l ? "border border-[#2f8a4c] bg-[#ebf6ee] font-medium text-[#14532d]" : "text-[#334155] hover:bg-[#f8faf9]"
                      }`}
                    >
                      {l === "en" ? "English" : "हिंदी"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-[10px] flex flex-1 flex-col overflow-hidden rounded-[14px] border border-[#e3e8e4] bg-[#f3f8f1]">
                {/* Chat header */}
                <div className="flex h-[66px] items-center gap-[12px] bg-gradient-to-br from-[#1f6b2a] to-[#14532d] px-[16px] text-white">
                  <span className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-full bg-white shadow-md ring-[3px] ring-white/25">
                    <Image src={LOGO} alt="Organic Mitra" width={64} height={64} className="h-[36px] w-[36px] object-contain" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[19.5px] font-semibold leading-tight">Organic Mitra</p>
                    <p className="mt-[2px] text-[14.1px] text-white/90">Bharat Organic Expo Assistant</p>
                  </div>
                  <Minus className="h-[22px] w-[22px]" />
                  <X className="ml-[16px] h-[22px] w-[22px]" />
                </div>

                {/* Messages */}
                <div className="flex flex-1 flex-col gap-[4px] px-[12px] pb-[8px] pt-[12px]">
                  <div className="flex items-start gap-[12px]">
                    <BotAvatar />
                    <div>
                      <div className="rounded-[10px] bg-white px-[13px] py-[8px] text-[14.6px] leading-snug text-[#0f172a] shadow-sm">
                        {lang === "hi" ? "नमो गंगे नमस्कार! 🙏" : "Namo Gange Namaskar! 🙏"}
                        <br />
                        {lang === "hi" ? "मैं आपकी क्या मदद कर सकता हूँ?" : "How can I help you today?"}
                      </div>
                      <p className="mt-[4px] text-[12.1px] text-[#64748b]">11:30 AM</p>
                    </div>
                  </div>
                  <div className="ml-[46px] mt-[4px] flex flex-wrap gap-[6px]">
                    {activeButtons.map((b) => (
                      <Pill key={b.id}>{label(b)}</Pill>
                    ))}
                  </div>

                  <div className="mt-[8px] flex flex-col items-end">
                    <span className="rounded-[10px] rounded-br-[3px] bg-[#15633a] px-[16px] py-[8px] text-[14.6px] text-white">{label(draft)}</span>
                    <span className="mt-[4px] flex items-center gap-[6px] pr-[18px] text-[12.1px] text-[#64748b]">
                      11:31 AM
                      <svg viewBox="0 0 24 24" fill="none" stroke="#15633a" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" className="h-[15px] w-[15px]" aria-hidden="true">
                        <path d="M2 12.5l4.5 4.5L15 8.5M10 16l1 1 8.5-8.5" />
                      </svg>
                    </span>
                  </div>

                  <div className="mt-[4px] flex items-start gap-[12px]">
                    <BotAvatar />
                    <div className="max-w-[290px]">
                      <div className="rounded-[10px] bg-white px-[13px] py-[8px] text-[14.6px] leading-snug text-[#0f172a] shadow-sm">{t(draft.reply) || "…"}</div>
                      <p className="mt-[4px] text-[12.1px] text-[#64748b]">11:31 AM</p>
                    </div>
                  </div>
                  {draft.options.length > 0 && (
                    <div className="ml-[46px] mt-[4px] flex flex-wrap gap-[6px]">
                      {draft.options.map((o, idx) => (
                        <Pill key={idx}>{t(o)}</Pill>
                      ))}
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="flex items-center gap-[12px] border-t border-[#e3e8e4] bg-white px-[14px] py-[8px]">
                  <Paperclip className="h-[19px] w-[19px] text-[#64748b]" />
                  <span className="flex h-[36px] flex-1 items-center rounded-full border border-[#dfe3e8] px-[16px] text-[14.6px] text-[#94a3b8]">
                    {lang === "hi" ? "अपना सवाल लिखें..." : "Type your question..."}
                  </span>
                  <span className="grid h-[36px] w-[36px] place-items-center rounded-full bg-[#15633a] text-white">
                    <Send className="h-[18px] w-[18px]" />
                  </span>
                </div>
              </div>

              <div className="mt-[10px] flex items-center justify-between text-[13.4px]">
                <div className="flex items-center gap-[12px]">
                  <span className="text-[#64748b]">Published version: v1.{published.version}</span>
                  <span className="h-[14px] w-px bg-[#cbd5e1]" />
                  {published.pending ? (
                    <span className="flex items-center gap-[7px] text-[#d97706]">
                      <span className="h-[9px] w-[9px] rounded-full bg-[#f59e0b]" /> Draft not published
                    </span>
                  ) : (
                    <span className="flex items-center gap-[7px] text-[#15803d]">
                      <span className="h-[9px] w-[9px] rounded-full bg-[#16a34a]" /> All changes published
                    </span>
                  )}
                </div>
                <button type="button" onClick={() => setPublishTab("history")} className="flex items-center gap-[7px] text-[#1d4ed8] hover:underline">
                  <History className="h-[17px] w-[17px]" /> Version History
                </button>
              </div>
            </div>
          </div>

          <div {...panelProps("Questions & Answers")} className={panelClass("Questions & Answers")}>
            <QuestionsAnswersTab ref={qaRef} onChange={markDraft} onOpenHistory={() => setPublishTab("history")} notify={notify} />
          </div>

          <div {...panelProps("AI Knowledge & Answers")} className={panelClass("AI Knowledge & Answers")}>
            <AIKnowledgeTab onChange={markDraft} onGoToTab={setTab} notify={notify} />
          </div>

          <div {...panelProps("Forms & Routing")} className={panelClass("Forms & Routing")}>
            <FormsRoutingTab ref={formsRef} onChange={markDraft} onOpenHistory={() => setPublishTab("history")} notify={notify} />
          </div>

          <div {...panelProps("Settings")} className={panelClass("Settings")}>
            <SettingsTab ref={settingsRef} onChange={markDraft} onOpenHistory={() => setPublishTab("history")} notify={notify} />
          </div>
        </div>
      </div>
    </div>
  );
}
