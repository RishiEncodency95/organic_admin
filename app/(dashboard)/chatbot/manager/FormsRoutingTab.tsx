"use client";

import { useState } from "react";
import { GripVertical, History, Info, Pencil, Plus, Save } from "lucide-react";
import { Select, cardClass, inputClass as baseInput } from "./managerUi";

/*
 * "Forms & Routing" tab of the Chatbot Manager — design preview with sample forms and
 * routing kept in component state; nothing is saved to or used by the website chatbot.
 * Sized so both columns fit in the Buttons & Flows tab's height (the tabs share one cell).
 */

// ─── Sample data ─────────────────────────────────────────────────────────────

const FIELD_TYPES = ["Text", "Phone", "Email", "Session value", "Dropdown", "Date"] as const;
type FieldType = (typeof FIELD_TYPES)[number];

type Field = { id: number; label: string; type: FieldType; required: boolean; show: boolean };

const FORMS = ["Quotation Request", "Callback Request", "Visitor Registration"] as const;
type FormName = (typeof FORMS)[number];

const INITIAL_FIELDS: Field[] = [
  { id: 1, label: "Full Name", type: "Text", required: true, show: true },
  { id: 2, label: "Mobile / WhatsApp", type: "Phone", required: true, show: true },
  { id: 3, label: "Company Name", type: "Text", required: false, show: true },
  { id: 4, label: "Email", type: "Email", required: false, show: true },
  { id: 5, label: "Stall Preference", type: "Session value", required: false, show: true },
];

const RECORD_TYPES = ["Lead", "Enquiry", "Support", "Feedback", "Complaint"] as const;
const TOPICS = ["Stall Booking", "Visitor Registration", "Buyer–Seller Meet", "Sponsorship", "PMS Support"] as const;
const TEAMS = ["Sales Team", "Registration Team", "Buyer Team", "HR Team", "Team Lead", "Admin"] as const;
const METHODS = ["Round Robin", "Least Busy", "Fixed Person", "Manual"] as const;
const PRIORITIES = ["Low", "Medium", "High", "Urgent"] as const;
const RESPONSE_TARGETS = ["30 minutes", "1 working hour", "4 working hours", "1 working day"] as const;

const INITIAL_RULES = [
  { topic: "Visitor Registration", team: "Registration Team" },
  { topic: "Buyer – Seller Meet", team: "Buyer Team" },
  { topic: "Careers", team: "HR Team" },
  { topic: "Complaints", team: "Team Lead" },
];

// ─── Small pieces ────────────────────────────────────────────────────────────

/* Same tightened fields as the Questions & Answers tab */
const inputClass = `${baseInput} !h-[34px]`;
const labelClass = "mb-[4px] block text-[13.6px] text-[#334155]";
const fieldSelect = "!h-[34px] !text-[14.6px]";
const titleClass = "text-[20.5px] font-bold leading-tight text-[#0f2a1c]";
const Req = () => <span className="text-[#dc2626]"> *</span>;

function Switch({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={onChange} className={`relative h-[21px] w-[36px] shrink-0 rounded-full transition ${on ? "bg-[#15633a]" : "bg-[#cbd5e1]"}`}>
      <span className={`absolute top-[2.5px] h-[16px] w-[16px] rounded-full bg-white shadow transition-all ${on ? "left-[17.5px]" : "left-[2.5px]"}`} />
    </button>
  );
}

const Check = ({ checked, onChange, label, disabled = false }: { checked: boolean; onChange: () => void; label: string; disabled?: boolean }) => (
  <input
    type="checkbox"
    checked={checked}
    onChange={onChange}
    disabled={disabled}
    aria-label={label}
    className="h-[19px] w-[19px] cursor-pointer rounded-[4px] accent-[#15633a] disabled:cursor-not-allowed"
  />
);

const outlineButton =
  "inline-flex h-[34px] items-center gap-[9px] rounded-[7px] border border-[#2f8a4c] bg-white px-[16px] text-[14.6px] font-medium text-[#14532d] transition hover:bg-[#f1f7ee]";
const solidButton =
  "inline-flex h-[36px] items-center gap-[10px] rounded-[7px] bg-[#15633a] px-[20px] text-[14.6px] font-medium text-white shadow-sm transition hover:bg-[#124f2f]";

/** Five field rows fit the shared height; more rows scroll inside the table */
const ROW_HEIGHT = 40;
const VISIBLE_ROWS = 5;

// ─── Tab ─────────────────────────────────────────────────────────────────────

export default function FormsRoutingTab({ onChange, onOpenHistory }: { onChange: () => void; onOpenHistory: () => void }) {
  const [form, setForm] = useState<FormName>("Quotation Request");
  const [formActive, setFormActive] = useState(true);
  const [fields, setFields] = useState(INITIAL_FIELDS);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submission, setSubmission] = useState({
    recordType: "Lead" as (typeof RECORD_TYPES)[number],
    topic: "Stall Booking" as (typeof TOPICS)[number],
    submitLabel: "Submit Request",
    consent: "I agree to be contacted about this enquiry.",
    confirmation: "Your quotation request has been received. Our sales team will contact you.",
  });
  const [routing, setRouting] = useState({
    team: "Sales Team" as (typeof TEAMS)[number],
    method: "Round Robin" as (typeof METHODS)[number],
    priority: "Medium" as (typeof PRIORITIES)[number],
    inApp: true,
    email: true,
    target: "1 working hour" as (typeof RESPONSE_TARGETS)[number],
    escalate: "Team Lead" as (typeof TEAMS)[number],
  });
  const [rules, setRules] = useState(INITIAL_RULES);
  const [editRules, setEditRules] = useState(false);

  const updateField = (id: number, patch: Partial<Field>) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
    onChange();
  };
  const addField = () => {
    const id = Math.max(0, ...fields.map((f) => f.id)) + 1;
    setFields((prev) => [...prev, { id, label: "New Field", type: "Text", required: false, show: true }]);
    setEditingId(id);
    onChange();
  };

  return (
    <div className="grid h-full grid-cols-[778px_1fr] gap-[15px]">
      {/* ── Left: form fields + submission ── */}
      <div className="flex min-h-0 flex-col gap-[12px]">
        <div className={`${cardClass} px-[16px] pb-[10px] pt-[8px]`}>
          <div className="flex items-start justify-between gap-[12px]">
            <div className="min-w-0">
              <p className={titleClass}>Enquiry Forms</p>
              <p className="mt-[2px] text-[14.1px] text-[#64748b]">Choose what visitors submit and where it goes.</p>
            </div>
            <div className="flex shrink-0 items-center gap-[10px] pt-[2px]">
              <Select value={form} options={FORMS} onChange={setForm} label="Form" className="w-[174px]" selectClassName="!text-[14.1px]" />
              <span className="inline-flex h-[36px] items-center gap-[12px] rounded-[7px] bg-[#f1f7f2] px-[12px] text-[14.1px] text-[#14532d]">
                {formActive ? "Active" : "Inactive"}
                <Switch on={formActive} onChange={() => {
                    setFormActive((v) => !v);
                    onChange();
                  }} label={`${form} active`} />
              </span>
              <button type="button" className={`${outlineButton} !h-[36px]`}>
                <Plus className="h-[18px] w-[18px]" /> Add Form
              </button>
            </div>
          </div>

          {/* Fields */}
          <div className="mt-[8px] overflow-hidden rounded-[8px] border border-[#eef0f2]">
            <div className="grid grid-cols-[46px_216px_178px_116px_110px_1fr] items-center bg-[#f7f8fa] px-[4px] py-[5px] text-[13.6px] text-[#334155]">
              <span />
              <span>Field Label</span>
              <span>Type</span>
              <span className="text-center">Required</span>
              <span className="text-center">Show</span>
              <span className="text-center">Edit</span>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: ROW_HEIGHT * VISIBLE_ROWS + VISIBLE_ROWS }}>
              {fields.map((f) => (
                <div
                  key={f.id}
                  style={{ height: ROW_HEIGHT }}
                  className="grid grid-cols-[46px_216px_178px_116px_110px_1fr] items-center border-t border-[#eef0f2] px-[4px] text-[14.6px] text-[#0f172a]"
                >
                  <GripVertical className="mx-auto h-[18px] w-[18px] text-[#64748b]" />
                  {editingId === f.id ? (
                    <input
                      autoFocus
                      value={f.label}
                      onChange={(e) => updateField(f.id, { label: e.target.value })}
                      onBlur={() => setEditingId(null)}
                      onKeyDown={(e) => (e.key === "Enter" || e.key === "Escape") && setEditingId(null)}
                      maxLength={40}
                      aria-label="Field label"
                      className="mr-[14px] h-[30px] rounded-[6px] border border-[#2f8a4c] px-[10px] text-[14.6px] outline-none"
                    />
                  ) : (
                    <span className="truncate pr-[10px]">{f.label}</span>
                  )}
                  <span className="pr-[34px]">
                    <Select value={f.type} options={FIELD_TYPES} onChange={(type) => updateField(f.id, { type })} label={`${f.label} type`} selectClassName="!h-[32px] !text-[14.1px]" />
                  </span>
                  <span className="flex justify-center">
                    <Check checked={f.required} onChange={() => updateField(f.id, { required: !f.required })} label={`${f.label} required`} />
                  </span>
                  <span className="flex justify-center">
                    <Switch on={f.show} onChange={() => updateField(f.id, { show: !f.show })} label={`Show ${f.label}`} />
                  </span>
                  <span className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => setEditingId(f.id)}
                      aria-label={`Edit ${f.label}`}
                      className="grid h-[30px] w-[38px] place-items-center rounded-[7px] border border-[#dfe3e8] bg-white text-[#0f172a] transition hover:border-[#15633a] hover:text-[#15633a]"
                    >
                      <Pencil className="h-[16px] w-[16px]" />
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-[8px] flex items-center justify-between">
            <p className="flex items-center gap-[12px] text-[13.4px] text-[#64748b]">
              <Info className="h-[18px] w-[18px]" /> Reuse details already provided in the current session.
            </p>
            <button type="button" onClick={addField} className={outlineButton}>
              <Plus className="h-[18px] w-[18px]" /> Add Field
            </button>
          </div>
        </div>

        <div className={`${cardClass} flex flex-1 flex-col px-[18px] pb-[10px] pt-[8px]`}>
          <p className={titleClass}>Submission Settings</p>
          <div className="mt-[6px] grid grid-cols-2 gap-x-[18px] gap-y-[6px]">
            <div>
              <span className={labelClass}>
                Record Type
                <Req />
              </span>
              <Select value={submission.recordType} options={RECORD_TYPES} onChange={(recordType) => setSubmission({ ...submission, recordType })} label="Record type" selectClassName={fieldSelect} />
            </div>
            <div>
              <span className={labelClass}>
                Topic
                <Req />
              </span>
              <Select value={submission.topic} options={TOPICS} onChange={(topic) => setSubmission({ ...submission, topic })} label="Topic" selectClassName={fieldSelect} />
            </div>
            <label>
              <span className={labelClass}>
                Submit Button Label
                <Req />
              </span>
              <input value={submission.submitLabel} onChange={(e) => setSubmission({ ...submission, submitLabel: e.target.value })} maxLength={30} className={inputClass} />
            </label>
            <label>
              <span className={labelClass}>
                Consent Text
                <Req />
              </span>
              <input value={submission.consent} onChange={(e) => setSubmission({ ...submission, consent: e.target.value })} maxLength={120} className={inputClass} />
            </label>
          </div>
          <label className="mt-[6px] block">
            <span className={labelClass}>
              Confirmation Message
              <Req />
            </span>
            <textarea
              value={submission.confirmation}
              onChange={(e) => setSubmission({ ...submission, confirmation: e.target.value })}
              rows={2}
              maxLength={300}
              className="h-[50px] w-full resize-y rounded-[7px] border border-[#dfe3e8] bg-white px-[14px] py-[7px] text-[14.6px] text-[#0f172a] outline-none transition focus:border-[#15633a] focus:ring-2 focus:ring-[#15633a]/15"
            />
          </label>
          <div className="mt-auto flex justify-end pt-[8px]">
            <button type="button" onClick={onChange} className={solidButton}>
              <Save className="h-[18px] w-[18px]" /> Save Form
            </button>
          </div>
        </div>
      </div>

      {/* ── Right: assignment + routing rules ── */}
      <div className="flex min-h-0 flex-col gap-[12px]">
        <div className={`${cardClass} px-[18px] pb-[10px] pt-[8px]`}>
          <p className={titleClass}>Assignment &amp; Notifications</p>
          <div className="mt-[6px] grid grid-cols-2 gap-x-[18px] gap-y-[6px]">
            <div>
              <span className={labelClass}>
                Assign To
                <Req />
              </span>
              <Select value={routing.team} options={TEAMS} onChange={(team) => setRouting({ ...routing, team })} label="Assign to" selectClassName={fieldSelect} />
            </div>
            <div>
              <span className={labelClass}>
                Assignment Method
                <Req />
              </span>
              <Select value={routing.method} options={METHODS} onChange={(method) => setRouting({ ...routing, method })} label="Assignment method" selectClassName={fieldSelect} />
            </div>
            <div>
              <span className={labelClass}>
                Default Priority
                <Req />
              </span>
              <Select value={routing.priority} options={PRIORITIES} onChange={(priority) => setRouting({ ...routing, priority })} label="Default priority" selectClassName={fieldSelect} />
            </div>
          </div>

          <p className={`${labelClass} mt-[6px]`}>
            Notify Assigned Employee
            <Req />
          </p>
          <div className="flex items-start gap-[44px] text-[14.6px] text-[#0f172a]">
            <label className="flex cursor-pointer items-center gap-[12px]">
              <Check checked={routing.inApp} onChange={() => setRouting({ ...routing, inApp: !routing.inApp })} label="Notify in-app" />
              In-app
            </label>
            <label className="flex cursor-pointer items-center gap-[12px]">
              <Check checked={routing.email} onChange={() => setRouting({ ...routing, email: !routing.email })} label="Notify by email" />
              Email
            </label>
            <div>
              <label className="flex items-center gap-[12px] text-[#64748b]" title="Connect the WhatsApp integration in Settings first">
                <Check checked={false} onChange={() => undefined} label="Notify on WhatsApp" disabled />
                <span className="text-[#0f172a]">WhatsApp</span>
                <Info className="h-[15px] w-[15px]" />
              </label>
              <p className="ml-[31px] mt-[2px] text-[13.4px] text-[#64748b]">Integration required</p>
            </div>
          </div>

          <div className="mt-[6px] grid grid-cols-2 gap-x-[18px]">
            <div>
              <span className={labelClass}>
                First Response Target
                <Req />
              </span>
              <Select value={routing.target} options={RESPONSE_TARGETS} onChange={(target) => setRouting({ ...routing, target })} label="First response target" selectClassName={fieldSelect} />
            </div>
            <div>
              <span className={labelClass}>
                Escalate Overdue To
                <Req />
              </span>
              <Select value={routing.escalate} options={TEAMS} onChange={(escalate) => setRouting({ ...routing, escalate })} label="Escalate overdue to" selectClassName={fieldSelect} />
            </div>
          </div>

          <div className="mt-[10px] flex items-center justify-between">
            <p className="flex items-center gap-[12px] text-[13.1px] text-[#64748b]">
              <Info className="h-[18px] w-[18px]" /> Targets follow configured working hours.
            </p>
            <button type="button" onClick={onChange} className={solidButton}>
              <Save className="h-[18px] w-[18px]" /> Save Routing
            </button>
          </div>
        </div>

        <div className={`${cardClass} flex flex-1 flex-col px-[18px] pb-[10px] pt-[8px]`}>
          <div className="flex items-center justify-between">
            <p className={titleClass}>Other Routing Rules</p>
            <button
              type="button"
              onClick={() => {
                if (editRules) onChange();
                setEditRules((v) => !v);
              }}
              className="text-[14.6px] font-medium text-[#1d4ed8] underline underline-offset-2 hover:text-[#15633a]"
            >
              {editRules ? "Done" : "Edit Rules"}
            </button>
          </div>
          <div className="mt-[8px] overflow-hidden rounded-[8px] border border-[#eef0f2]">
            <div className="grid grid-cols-2 bg-[#f7f8fa] px-[16px] py-[6px] text-[13.6px] text-[#334155]">
              <span>Topic</span>
              <span>Team</span>
            </div>
            {rules.map((r, i) => (
              <div key={r.topic} className="grid h-[33px] grid-cols-2 items-center border-t border-[#eef0f2] px-[16px] text-[13.6px] text-[#0f172a]">
                <span>{r.topic}</span>
                {editRules ? (
                  <Select
                    value={r.team as (typeof TEAMS)[number]}
                    options={TEAMS}
                    onChange={(team) => setRules((prev) => prev.map((x, j) => (j === i ? { ...x, team } : x)))}
                    label={`${r.topic} team`}
                    selectClassName="!h-[28px] !text-[13.6px]"
                  />
                ) : (
                  <span>{r.team}</span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-auto flex items-center justify-between pt-[10px] text-[13.1px]">
            <span className="flex items-center gap-[12px] text-[#64748b]">
              <Info className="h-[18px] w-[18px]" /> Draft changes are not live until published.
            </span>
            <button type="button" onClick={onOpenHistory} className="flex items-center gap-[8px] text-[14.1px] text-[#1d4ed8] hover:underline">
              <History className="h-[18px] w-[18px]" /> Version History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
