"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bell, ChevronDown, Eye, GripVertical, Info, ListOrdered, Pencil, Plus, Save, Settings, X } from "lucide-react";
import { DESIGN_WIDTH, useFitWidth } from "@/components/chatbot/useFitWidth";
import { Select, cardClass, inputClass as baseInput } from "../chatbot/manager/managerUi";
import AlertRulesTab from "./AlertRulesTab";

/*
 * Notification Settings — design preview opened from the profile menu. The rules below are
 * sample data kept in page state (see the "Design preview" chip); nothing is saved.
 *
 * Laid out at the design's width with the design's pixel sizes, then zoomed to the
 * available width (see useFitWidth). The dashboard layout's AdminContentScale remaps many
 * text-[Npx] classes with !important, so this page sticks to sizes outside that list.
 */

// ─── Sample data ─────────────────────────────────────────────────────────────

const TEAMS = ["Sales Team", "Business Development", "Registration Team", "Buyer Coordinator", "PMS Coordinator", "HR Team", "Concerned Team"] as const;
const ASSIGNMENT_TYPES = ["Assign in Rotation", "Fixed Employee", "Assign by Topic", "Least Busy"] as const;
const BACKUPS = ["Sales Team Lead", "Team Lead", "Registration Lead", "HR Lead"] as const;

type Rule = {
  id: number;
  topic: string;
  team: (typeof TEAMS)[number];
  type: (typeof ASSIGNMENT_TYPES)[number];
  backup: (typeof BACKUPS)[number];
  active: boolean;
};

const INITIAL_RULES: Rule[] = [
  { id: 1, topic: "Stall Booking & Quotation", team: "Sales Team", type: "Assign in Rotation", backup: "Sales Team Lead", active: true },
  { id: 2, topic: "Sponsorship & Partnership", team: "Business Development", type: "Assign in Rotation", backup: "Team Lead", active: true },
  { id: 3, topic: "Visitor Registration", team: "Registration Team", type: "Assign in Rotation", backup: "Registration Lead", active: true },
  { id: 4, topic: "Buyer-Seller Meet", team: "Buyer Coordinator", type: "Fixed Employee", backup: "Team Lead", active: true },
  { id: 5, topic: "MSME / PMS Support", team: "PMS Coordinator", type: "Fixed Employee", backup: "Team Lead", active: true },
  { id: 6, topic: "Careers", team: "HR Team", type: "Assign in Rotation", backup: "HR Lead", active: true },
  { id: 7, topic: "Complaints", team: "Concerned Team", type: "Assign by Topic", backup: "Team Lead", active: true },
];

const EMPLOYEES = ["Sales Executive 01", "Sales Executive 02", "Sales Executive 03", "Sales Executive 04"];

const CAPACITY = [
  { name: "Sales Executive 01", status: "Available", open: 12 },
  { name: "Sales Executive 02", status: "Available", open: 8 },
  { name: "Sales Executive 03", status: "Away", open: 5 },
] as const;

const DURING = ["Team Working Hours", "Any Time", "Custom Schedule"] as const;
const UNAVAILABLE = ["Use Next Available Employee", "Assign to Backup Owner", "Keep in Queue"] as const;
const NONE_AVAILABLE = ["Queue for Team Lead", "Assign to Backup Owner", "Notify Admin"] as const;
const NO_RESPONSE = ["Notify Team Lead", "Notify Backup Owner", "Do Nothing"] as const;
const DELAYS = ["Set delay", "30 minutes", "1 hour", "2 hours", "4 hours"] as const;
const UNMATCHED = ["General Support", "Sales Team", "Admin"] as const;

// ─── Small pieces ────────────────────────────────────────────────────────────

const inputClass = `${baseInput} !h-[31px] !text-[13.6px]`;
const labelClass = "mb-[3px] block text-[13.6px] text-[#0f172a]";
const fieldSelect = "!h-[31px] !text-[13.6px]";
const Req = () => <span className="text-[#dc2626]"> *</span>;

function Switch({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={onChange} className={`relative h-[24px] w-[46px] shrink-0 rounded-full transition ${on ? "bg-[#15633a]" : "bg-[#cbd5e1]"}`}>
      <span className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow transition-all ${on ? "left-[25px]" : "left-[3px]"}`} />
    </button>
  );
}

const TABS = [
  { label: "Assignment Rules", icon: Settings },
  { label: "Alert Rules", icon: Bell },
] as const;

const RULE_GRID = "grid grid-cols-[52px_296px_258px_230px_234px_96px_1fr] items-center";

// ─── Page ────────────────────────────────────────────────────────────────────

export default function NotificationSettingsPage() {
  const { ref, zoom } = useFitWidth();
  const [tab, setTab] = useState<(typeof TABS)[number]["label"]>("Assignment Rules");
  const [rules, setRules] = useState(INITIAL_RULES);
  const [selectedId, setSelectedId] = useState(1);
  const [detail, setDetail] = useState({
    employees: ["Sales Executive 01", "Sales Executive 02", "Sales Executive 03"],
    maxOpen: "20",
    during: "Team Working Hours" as (typeof DURING)[number],
    unavailable: "Use Next Available Employee" as (typeof UNAVAILABLE)[number],
    backup: "Sales Team Lead" as (typeof BACKUPS)[number],
    noneAvailable: "Queue for Team Lead" as (typeof NONE_AVAILABLE)[number],
    keepOwner: true,
    noResponse: "Notify Team Lead" as (typeof NO_RESPONSE)[number],
    reassign: false,
    delay: "Set delay" as (typeof DELAYS)[number],
  });
  const [unmatched, setUnmatched] = useState<(typeof UNMATCHED)[number]>("General Support");
  const [saved, setSaved] = useState<string | null>(null);

  const selected = rules.find((r) => r.id === selectedId) ?? rules[0];
  const updateRule = (id: number, patch: Partial<Rule>) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    setSaved(null);
  };
  const addRule = () => {
    const id = Math.max(0, ...rules.map((r) => r.id)) + 1;
    setRules((prev) => [...prev, { id, topic: "New Topic", team: "Sales Team", type: "Assign in Rotation", backup: "Team Lead", active: false }]);
    setSelectedId(id);
  };
  const save = () => setSaved(new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }));
  const cancel = () => {
    setRules(INITIAL_RULES);
    setSelectedId(1);
    setSaved(null);
  };

  // The hidden tab stays mounted (keeps its edits) but takes no space, so the footer sits right under the content
  const panelClass = (name: string) => (tab === name ? "" : "hidden");
  const panelProps = (name: string) => ({ "aria-hidden": tab !== name, inert: tab !== name });

  const saveButton = (
    <button
      type="button"
      onClick={save}
      className="inline-flex h-[36px] items-center gap-[10px] rounded-[7px] bg-[#15633a] px-[20px] text-[14.6px] font-medium text-white shadow-sm transition hover:bg-[#124f2f]"
    >
      <Save className="h-[18px] w-[18px]" /> Save Settings
    </button>
  );

  return (
    <div ref={ref} className="w-full overflow-x-hidden bg-white">
      <div style={{ zoom, width: DESIGN_WIDTH }} className="flex flex-col px-[16px] pb-[8px] pt-[6px] text-[#0f172a]">
        {/* ── Header (the page name is already in the top bar) ── */}
        <div className="flex items-center justify-between gap-x-3">
          <div className="flex min-w-0 items-center gap-[14px]">
            <p className="min-w-0 truncate text-[17.5px] font-medium text-[#334155]">Manage enquiry assignment, team alerts and escalation</p>
            <span
              title="Changes on this page are not saved"
              className="inline-flex shrink-0 items-center gap-[7px] whitespace-nowrap rounded-[6px] border border-[#cfe9d6] bg-[#eefaf1] px-[11px] py-[4px] text-[13.4px] font-medium text-[#15803d]"
            >
              <Eye className="h-[15px] w-[15px]" /> Design preview
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-[12px]">
            <Link
              href="/chatbot/manager"
              className="inline-flex h-[36px] items-center gap-[10px] whitespace-nowrap rounded-[7px] border border-[#cbd5e1] bg-white px-[14px] text-[14.6px] font-medium text-[#0f172a] transition hover:border-[#15633a]"
            >
              <ArrowLeft className="h-[18px] w-[18px]" /> Back to Chatbot Manager
            </Link>
            {saveButton}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="mt-[8px] flex items-end gap-[8px] border-b border-[#e5e7eb]">
          {TABS.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => setTab(label)}
              className={`-mb-px flex items-center gap-[12px] border-b-[3px] px-[12px] pb-[9px] pt-[2px] text-[15.6px] transition ${
                tab === label ? "border-[#15633a] font-medium text-[#15633a]" : "border-transparent text-[#334155] hover:text-[#15633a]"
              }`}
            >
              <Icon className="h-[20px] w-[20px]" /> {label}
            </button>
          ))}
        </div>

        <div className="mt-[10px]">
          <div {...panelProps("Assignment Rules")} className={`${panelClass("Assignment Rules")} flex flex-col gap-[10px]`}>
            {/* Enquiry assignment */}
            <div className={`${cardClass} px-[16px] pb-[8px] pt-[8px]`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[21.5px] font-bold leading-tight text-[#0f2a1c]">Enquiry Assignment</p>
                  <p className="mt-[1px] text-[14.6px] text-[#64748b]">Route each topic to the right team and responsible employee.</p>
                </div>
                <button
                  type="button"
                  onClick={addRule}
                  className="inline-flex h-[36px] items-center gap-[10px] rounded-[7px] border border-[#94a3b8] bg-white px-[16px] text-[14.6px] font-medium text-[#0f172a] transition hover:border-[#15633a] hover:text-[#15633a]"
                >
                  <Plus className="h-[18px] w-[18px]" /> Add Rule
                </button>
              </div>

              <div className="mt-[6px] overflow-hidden rounded-[8px] border border-[#eef0f2]">
                <div className={`${RULE_GRID} bg-[#f7f8fa] py-[5px] text-[13.6px] font-medium text-[#0f172a]`}>
                  <span />
                  <span>Topic / Request</span>
                  <span>Assigned Team / Employee</span>
                  <span>Assignment Type</span>
                  <span>Backup</span>
                  <span className="text-center">Active</span>
                  <span className="text-center">Edit</span>
                </div>
                {rules.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedId(r.id)}
                    className={`${RULE_GRID} h-[38px] cursor-pointer border-t border-[#eef0f2] text-[14.1px] transition ${selectedId === r.id ? "bg-[#ebf6ee]" : "hover:bg-[#f8faf9]"}`}
                  >
                    <GripVertical className="mx-auto h-[18px] w-[18px] text-[#475569]" />
                    <span className="truncate pr-[10px] text-[#0f172a]">{r.topic}</span>
                    <span onClick={(e) => e.stopPropagation()} className="pr-[22px]">
                      <Select value={r.team} options={TEAMS} onChange={(team) => updateRule(r.id, { team })} label={`${r.topic} team`} selectClassName="!h-[30px] !text-[13.6px]" />
                    </span>
                    <span onClick={(e) => e.stopPropagation()} className="pr-[34px]">
                      <Select value={r.type} options={ASSIGNMENT_TYPES} onChange={(type) => updateRule(r.id, { type })} label={`${r.topic} assignment type`} selectClassName="!h-[30px] !text-[13.6px]" />
                    </span>
                    <span onClick={(e) => e.stopPropagation()} className="pr-[46px]">
                      <Select value={r.backup} options={BACKUPS} onChange={(backup) => updateRule(r.id, { backup })} label={`${r.topic} backup`} selectClassName="!h-[30px] !text-[13.6px]" />
                    </span>
                    <span onClick={(e) => e.stopPropagation()} className="flex justify-center">
                      <Switch on={r.active} onChange={() => updateRule(r.id, { active: !r.active })} label={`${r.topic} active`} />
                    </span>
                    <span className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => setSelectedId(r.id)}
                        aria-label={`Edit ${r.topic}`}
                        className="grid h-[30px] w-[44px] place-items-center rounded-[7px] border border-[#dfe3e8] bg-white text-[#0f172a] transition hover:border-[#15633a] hover:text-[#15633a]"
                      >
                        <Pencil className="h-[16px] w-[16px]" />
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-[808px_1fr] gap-[14px]">
              {/* Rule details */}
              <div className={`${cardClass} px-[18px] pb-[8px] pt-[8px]`}>
                <div className="flex items-center gap-[12px]">
                  <p className="truncate text-[21.5px] font-bold leading-tight text-[#0f2a1c]">Rule Details — {selected.topic}</p>
                  <span className="inline-flex shrink-0 items-center gap-[6px] rounded-[6px] bg-[#eefaf1] px-[9px] py-[3px] text-[12.6px] text-[#15803d]">
                    <Eye className="h-[14px] w-[14px]" /> Sample configuration
                  </span>
                </div>
                <p className="mt-[1px] text-[14.1px] text-[#64748b]">Configure how enquiries for this topic are assigned to your team.</p>

                <div className="mt-[8px] grid grid-cols-2 gap-x-[30px] gap-y-[6px]">
                  <div>
                    <span className={labelClass}>
                      Eligible Employees
                      <Req />
                    </span>
                    <div className="relative flex min-h-[62px] flex-wrap content-start gap-[6px] rounded-[7px] border border-[#dfe3e8] py-[5px] pl-[6px] pr-[40px]">
                      {detail.employees.map((e) => (
                        <span key={e} className="inline-flex h-[24px] items-center gap-[10px] rounded-[5px] bg-[#f1f3f5] pl-[10px] pr-[8px] text-[12.6px] text-[#0f172a]">
                          {e}
                          <button type="button" aria-label={`Remove ${e}`} onClick={() => setDetail({ ...detail, employees: detail.employees.filter((x) => x !== e) })} className="hover:text-[#dc2626]">
                            <X className="h-[13px] w-[13px]" />
                          </button>
                        </span>
                      ))}
                      <label className="absolute inset-y-0 right-0 grid w-[40px] place-items-center">
                        <select
                          value=""
                          onChange={(e) => e.target.value && setDetail({ ...detail, employees: [...detail.employees, e.target.value] })}
                          aria-label="Add eligible employee"
                          className="absolute inset-0 cursor-pointer opacity-0"
                        >
                          <option value="">Add employee</option>
                          {EMPLOYEES.filter((e) => !detail.employees.includes(e)).map((e) => (
                            <option key={e} value={e}>
                              {e}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none h-[16px] w-[16px] text-[#0f172a]" />
                      </label>
                    </div>
                  </div>
                  <label>
                    <span className={labelClass}>
                      Maximum Open Enquiries / Employee
                      <Req />
                    </span>
                    <input
                      value={detail.maxOpen}
                      onChange={(e) => setDetail({ ...detail, maxOpen: e.target.value.replace(/\D/g, "").slice(0, 3) })}
                      inputMode="numeric"
                      className={inputClass}
                    />
                    <span className="mt-[4px] block text-[12.6px] text-[#94a3b8]">e.g. 20</span>
                  </label>

                  <div>
                    <span className={labelClass}>
                      Assign Only During
                      <Req />
                    </span>
                    <Select value={detail.during} options={DURING} onChange={(during) => setDetail({ ...detail, during })} label="Assign only during" selectClassName={fieldSelect} />
                  </div>
                  <div>
                    <span className={labelClass}>
                      When Employee Unavailable / At Limit
                      <Req />
                    </span>
                    <Select value={detail.unavailable} options={UNAVAILABLE} onChange={(unavailable) => setDetail({ ...detail, unavailable })} label="When employee unavailable" selectClassName={fieldSelect} />
                  </div>

                  <div>
                    <span className={labelClass}>
                      Backup Owner
                      <Req />
                    </span>
                    <Select value={detail.backup} options={BACKUPS} onChange={(backup) => setDetail({ ...detail, backup })} label="Backup owner" selectClassName={fieldSelect} />
                  </div>
                  <div>
                    <span className={labelClass}>
                      If No Employee Available
                      <Req />
                    </span>
                    <Select value={detail.noneAvailable} options={NONE_AVAILABLE} onChange={(noneAvailable) => setDetail({ ...detail, noneAvailable })} label="If no employee available" selectClassName={fieldSelect} />
                  </div>
                </div>

                <label className="mt-[6px] flex cursor-pointer items-start gap-[10px]">
                  <input
                    type="checkbox"
                    checked={detail.keepOwner}
                    onChange={() => setDetail({ ...detail, keepOwner: !detail.keepOwner })}
                    className="mt-[1px] h-[18px] w-[18px] cursor-pointer accent-[#15633a]"
                  />
                  <span>
                    <span className="block text-[14.1px] text-[#0f172a]">Keep returning enquiries with existing owner</span>
                    <span className="block text-[12.6px] text-[#64748b]">Use verified visitor profile; respect staff access and availability.</span>
                  </span>
                </label>

                <div className="mt-[8px] flex items-center gap-[18px]">
                  <span className="text-[14.1px] font-medium text-[#0f172a]">No Response Action</span>
                  <Select value={detail.noResponse} options={NO_RESPONSE} onChange={(noResponse) => setDetail({ ...detail, noResponse })} label="No response action" className="w-[204px]" selectClassName={fieldSelect} />
                  <label className="ml-[14px] flex cursor-pointer items-center gap-[10px] text-[14.1px] text-[#0f172a]">
                    <input type="checkbox" checked={detail.reassign} onChange={() => setDetail({ ...detail, reassign: !detail.reassign })} className="h-[18px] w-[18px] cursor-pointer accent-[#15633a]" />
                    Reassign after overdue delay
                  </label>
                  <Select
                    value={detail.delay}
                    options={DELAYS}
                    onChange={(delay) => setDetail({ ...detail, delay })}
                    label="Overdue delay"
                    className={`w-[190px] ${detail.reassign ? "" : "pointer-events-none opacity-50"}`}
                    selectClassName={`${fieldSelect} ${detail.reassign ? "" : "!bg-[#f7f8fa] !text-[#94a3b8]"}`}
                  />
                </div>
              </div>

              {/* Team capacity + default routing */}
              <div className={`${cardClass} flex flex-col px-[16px] pb-[8px] pt-[8px]`}>
                <p className="text-[19.5px] font-bold leading-tight text-[#0f2a1c]">Team Capacity (Demo)</p>
                <div className="mt-[6px] overflow-hidden rounded-[8px] border border-[#eef0f2] text-[13.6px]">
                  <div className="grid grid-cols-[174px_1fr_96px] bg-[#f7f8fa] px-[14px] py-[5px] font-medium text-[#0f172a]">
                    <span>Employee</span>
                    <span>Availability</span>
                    <span>Open / Limit</span>
                  </div>
                  {CAPACITY.map((c) => (
                    <div key={c.name} className="grid h-[30px] grid-cols-[174px_1fr_96px] items-center border-t border-[#eef0f2] px-[14px] text-[#0f172a]">
                      <span>{c.name}</span>
                      <span className={`flex items-center gap-[9px] ${c.status === "Away" ? "text-[#ea7a0c]" : "text-[#15803d]"}`}>
                        <span className={`h-[11px] w-[11px] rounded-full ${c.status === "Away" ? "bg-[#f59e0b]" : "bg-[#16a34a]"}`} /> {c.status}
                      </span>
                      <span className="pl-[6px]">
                        {c.open} / {detail.maxOpen || "—"}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="mt-[10px] text-[19.5px] font-bold leading-tight text-[#0f2a1c]">Default Routing</p>
                <span className={`${labelClass} mt-[4px]`}>
                  Unmatched Topic
                  <Req />
                </span>
                <Select value={unmatched} options={UNMATCHED} onChange={setUnmatched} label="Unmatched topic" selectClassName={fieldSelect} />
                <p className="mt-[4px] text-[12.6px] text-[#94a3b8]">Enquiries not matching any topic will be assigned here.</p>

                <div className="mt-auto flex items-start justify-between pt-[8px]">
                  <div>
                    <p className="text-[14.1px] font-medium text-[#0f172a]">Rules checked in priority order</p>
                    <p className="text-[12.6px] text-[#94a3b8]">Rules are evaluated from top to bottom.</p>
                  </div>
                  <button type="button" className="flex items-center gap-[10px] text-[14.1px] text-[#15633a] underline underline-offset-2 hover:text-[#124f2f]">
                    <ListOrdered className="h-[18px] w-[18px] text-[#0f172a]" /> Reorder Rules
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div {...panelProps("Alert Rules")} className={panelClass("Alert Rules")}>
            <AlertRulesTab onChange={() => setSaved(null)} />
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="mt-[10px] flex items-center gap-[16px]">
          <p className="flex h-[36px] flex-1 items-center gap-[12px] rounded-[7px] bg-[#f1f4f8] px-[12px] text-[13.1px] text-[#64748b]">
            <Info className="h-[19px] w-[19px] text-[#334155]" />
            {saved
              ? `Settings saved at ${saved} (design preview — not applied to live enquiries).`
              : tab === "Alert Rules"
                ? "Mandatory alerts cannot be disabled by employees."
                : "Changes affect new enquiries; existing owners change only through configured reassignment."}
          </p>
          {tab === "Assignment Rules" && (
            <button
              type="button"
              onClick={cancel}
              className="h-[36px] rounded-[7px] border border-[#cbd5e1] bg-white px-[24px] text-[14.6px] font-medium text-[#0f172a] transition hover:border-[#15633a]"
            >
              Cancel
            </button>
          )}
          {saveButton}
        </div>
      </div>
    </div>
  );
}
