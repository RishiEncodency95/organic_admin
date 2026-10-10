"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bell, CheckCircle2, ChevronDown, CircleAlert, GripVertical, Info, ListOrdered, Pencil, Plus, Save, Settings, Trash2, X } from "lucide-react";
import { ApiRequestError } from "@/lib/api";
import { notificationSettingsApi, type AssignmentRule, type StaffCapacity } from "@/lib/notificationSettingsApi";
import { INBOX_TEAMS } from "../chatbot/inbox/ReassignEnquiryModal";
import { DESIGN_WIDTH, useFitWidth } from "@/components/chatbot/useFitWidth";
import { Select, cardClass, inputClass as baseInput } from "../chatbot/manager/managerUi";
import AlertRulesTab, { DEFAULT_ALERTS, withAlertDefaults, type AlertSettings } from "./AlertRulesTab";

/*
 * Notification Settings (opened from the profile menu): which team and employee get each new
 * enquiry in Inbox & Leads, and the team alerts. Saved with PUT /admin/chats/routing and
 * applied by the backend to new website requests and hand-added enquiries; until the first
 * save the inbox keeps the Chatbot Manager's Forms & Routing teams.
 *
 * Laid out at the design's width with the design's pixel sizes, then zoomed to the
 * available width (see useFitWidth). The dashboard layout's AdminContentScale remaps many
 * text-[Npx] classes with !important, so this page sticks to sizes outside that list.
 */

// ─── Options and starting rules ──────────────────────────────────────────────

const TEAMS = [...new Set<string>(["Sales Team", "Business Development", "Registration Team", "Buyer Coordinator", "PMS Coordinator", "HR Team", "Concerned Team", ...INBOX_TEAMS])];
const ASSIGNMENT_TYPES = ["Assign in Rotation", "Fixed Employee", "Assign by Topic", "Least Busy"] as const;

type Rule = AssignmentRule;

const rule = (ruleId: number, topic: string, team: string, type: Rule["type"]): Rule => ({
  ruleId,
  topic,
  team,
  type,
  backup: "",
  active: false,
  employees: [],
  maxOpen: 20,
  during: "Any Time",
  unavailable: "Use Next Available Employee",
  noneAvailable: "Queue for Team Lead",
  keepOwner: true,
  noResponse: "Notify Team Lead",
  reassign: false,
  delay: "Set delay",
});

// Suggested topics until the first save; each starts off until it has employees
const STARTING_RULES: Rule[] = [
  rule(1, "Stall Booking & Quotation", "Sales Team", "Assign in Rotation"),
  rule(2, "Sponsorship & Partnership", "Business Development", "Assign in Rotation"),
  rule(3, "Visitor Registration", "Registration Team", "Assign in Rotation"),
  rule(4, "Buyer-Seller Meet", "Buyer Coordinator", "Fixed Employee"),
  rule(5, "MSME / PMS Support", "PMS Coordinator", "Fixed Employee"),
  rule(6, "Careers", "HR Team", "Assign in Rotation"),
  rule(7, "Complaints", "Concerned Team", "Assign by Topic"),
];

const DURING = ["Any Time", "Team Working Hours", "Custom Schedule"] as const;
const UNAVAILABLE = ["Use Next Available Employee", "Assign to Backup Owner", "Keep in Queue"] as const;
const NONE_AVAILABLE = ["Queue for Team Lead", "Assign to Backup Owner", "Notify Admin"] as const;
const NO_RESPONSE = ["Notify Team Lead", "Notify Backup Owner", "Do Nothing"] as const;
const DELAYS = ["Set delay", "30 minutes", "1 hour", "2 hours", "4 hours"] as const;
const UNMATCHED = ["General Support", ...TEAMS.filter((t) => t !== "General Support")];

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
  const [rules, setRules] = useState<Rule[]>(STARTING_RULES);
  const [selectedId, setSelectedId] = useState(1);
  const [unmatched, setUnmatched] = useState("General Support");
  const [alerts, setAlerts] = useState<AlertSettings>(DEFAULT_ALERTS);
  const [staff, setStaff] = useState<StaffCapacity[]>([]);
  const [everSaved, setEverSaved] = useState<boolean | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [reload, setReload] = useState(0);
  const [dragId, setDragId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    notificationSettingsApi
      .get()
      .then(({ settings, staff }) => {
        if (cancelled) return;
        setStaff(staff);
        setEverSaved(Boolean(settings));
        if (settings) {
          setRules(settings.rules);
          setSelectedId(settings.rules[0]?.ruleId ?? 0);
          setUnmatched(settings.unmatched || "General Support");
          setAlerts(withAlertDefaults(settings.alerts as Partial<AlertSettings> | null));
        }
        setDirty(false);
      })
      .catch((err) => !cancelled && setMessage({ ok: false, text: err instanceof ApiRequestError ? err.message : "Could not load the settings." }));
    return () => {
      cancelled = true;
    };
  }, [reload]);

  const activeStaff = staff.filter((m) => m.active).map((m) => m.name);
  const openOf = (name: string) => staff.find((m) => m.name === name)?.open ?? 0;
  const backupOptions = [{ value: "", label: "No backup" }, ...activeStaff.map((n) => ({ value: n, label: n }))];
  const backupChoices = (current: string) => (current && !activeStaff.includes(current) ? [{ value: current, label: `${current} (inactive)` }, ...backupOptions] : backupOptions);

  const touch = () => {
    setDirty(true);
    setMessage(null);
  };
  const selected: Rule | undefined = rules.find((r) => r.ruleId === selectedId) ?? rules[0];
  const updateRule = (id: number, patch: Partial<Rule>) => {
    setRules((prev) => prev.map((r) => (r.ruleId === id ? { ...r, ...patch } : r)));
    touch();
  };
  const setDetail = (patch: Partial<Rule>) => {
    if (selected) updateRule(selected.ruleId, patch);
  };
  const addRule = () => {
    const id = Math.max(0, ...rules.map((r) => r.ruleId)) + 1;
    setRules((prev) => [...prev, rule(id, "New Topic", "Sales Team", "Assign in Rotation")]);
    setSelectedId(id);
    touch();
  };
  const removeRule = (id: number) => {
    const rest = rules.filter((r) => r.ruleId !== id);
    setRules(rest);
    if (selectedId === id) setSelectedId(rest[0]?.ruleId ?? 0);
    touch();
  };
  const move = (id: number, to: number) => {
    setRules((prev) => {
      const from = prev.findIndex((r) => r.ruleId === id);
      if (from < 0 || to < 0 || to >= prev.length || from === to) return prev;
      const next = [...prev];
      const [r] = next.splice(from, 1);
      next.splice(to, 0, r);
      return next;
    });
    touch();
  };

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await notificationSettingsApi.save({ rules, unmatched, alerts });
      setEverSaved(true);
      setDirty(false);
      setMessage({ ok: true, text: `Saved at ${new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })} — applies to new enquiries in Inbox & Leads.` });
    } catch (err) {
      setMessage({ ok: false, text: err instanceof ApiRequestError ? err.message : "Could not save the settings." });
    } finally {
      setSaving(false);
    }
  };
  // Back to the last saved settings
  const cancel = () => {
    setMessage(null);
    if (everSaved) {
      setReload((n) => n + 1);
      return;
    }
    setRules(STARTING_RULES);
    setSelectedId(1);
    setUnmatched("General Support");
    setAlerts(DEFAULT_ALERTS);
    setDirty(false);
  };

  // The hidden tab stays mounted (keeps its edits) but takes no space, so the footer sits right under the content
  const panelClass = (name: string) => (tab === name ? "" : "hidden");
  const panelProps = (name: string) => ({ "aria-hidden": tab !== name, inert: tab !== name });

  const saveButton = (
    <button
      type="button"
      onClick={save}
      disabled={saving || everSaved === null}
      className="inline-flex h-[36px] items-center gap-[10px] rounded-[7px] bg-[#15633a] px-[20px] text-[14.6px] font-medium text-white shadow-sm transition hover:bg-[#124f2f] disabled:opacity-60"
    >
      <Save className="h-[18px] w-[18px]" /> {saving ? "Saving…" : "Save Settings"}
    </button>
  );

  return (
    <div ref={ref} className="w-full overflow-x-hidden bg-white">
      <div style={{ zoom, width: DESIGN_WIDTH }} className="flex flex-col px-[16px] pb-[8px] pt-[6px] text-[#0f172a]">
        {/* ── Header (the page name is already in the top bar) ── */}
        <div className="flex items-center justify-between gap-x-3">
          <div className="flex min-w-0 items-center gap-[14px]">
            <p className="min-w-0 truncate text-[17.5px] font-medium text-[#334155]">Manage enquiry assignment, team alerts and escalation</p>
            {everSaved !== null && (
              <span
                title={everSaved ? "These rules decide the team and owner of new enquiries" : "The inbox uses the Chatbot Manager's Forms & Routing teams until you save"}
                className={`inline-flex shrink-0 items-center gap-[7px] whitespace-nowrap rounded-[6px] border px-[11px] py-[4px] text-[13.4px] font-medium ${
                  dirty ? "border-[#fde68a] bg-[#fffbeb] text-[#b45309]" : everSaved ? "border-[#cfe9d6] bg-[#eefaf1] text-[#15803d]" : "border-[#e2e8f0] bg-[#f8fafc] text-[#475569]"
                }`}
              >
                {dirty ? <CircleAlert className="h-[15px] w-[15px]" /> : <CheckCircle2 className="h-[15px] w-[15px]" />}
                {dirty ? "Unsaved changes" : everSaved ? "Live" : "Not saved yet"}
              </span>
            )}
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
                {rules.length === 0 && <p className="border-t border-[#eef0f2] px-[16px] py-[10px] text-[14.1px] text-[#64748b]">No rules — every enquiry goes to the default routing below.</p>}
                {rules.map((r, index) => (
                  <div
                    key={r.ruleId}
                    onClick={() => setSelectedId(r.ruleId)}
                    draggable
                    onDragStart={() => setDragId(r.ruleId)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (dragId !== null) move(dragId, index);
                      setDragId(null);
                    }}
                    className={`${RULE_GRID} h-[38px] cursor-pointer border-t border-[#eef0f2] text-[14.1px] transition ${selected?.ruleId === r.ruleId ? "bg-[#ebf6ee]" : "hover:bg-[#f8faf9]"}`}
                  >
                    <span title="Drag to change the order" className="flex cursor-grab justify-center">
                      <GripVertical className="h-[18px] w-[18px] text-[#475569]" />
                    </span>
                    <span onClick={(e) => e.stopPropagation()} className="pr-[10px]">
                      <input
                        value={r.topic}
                        onChange={(e) => updateRule(r.ruleId, { topic: e.target.value.slice(0, 80) })}
                        onFocus={() => setSelectedId(r.ruleId)}
                        aria-label="Topic / request"
                        title="Enquiries whose topic shares a key word with this name use this rule"
                        className="h-[30px] w-full truncate rounded-[6px] border border-transparent bg-transparent px-[6px] text-[14.1px] text-[#0f172a] outline-none hover:border-[#dfe3e8] focus:border-[#15633a] focus:bg-white"
                      />
                    </span>
                    <span onClick={(e) => e.stopPropagation()} className="pr-[22px]">
                      <Select value={r.team} options={TEAMS.includes(r.team) ? TEAMS : [r.team, ...TEAMS]} onChange={(team) => updateRule(r.ruleId, { team })} label={`${r.topic} team`} selectClassName="!h-[30px] !text-[13.6px]" />
                    </span>
                    <span onClick={(e) => e.stopPropagation()} className="pr-[34px]">
                      <Select value={r.type} options={ASSIGNMENT_TYPES} onChange={(type) => updateRule(r.ruleId, { type })} label={`${r.topic} assignment type`} selectClassName="!h-[30px] !text-[13.6px]" />
                    </span>
                    <span onClick={(e) => e.stopPropagation()} className="pr-[46px]">
                      <Select value={r.backup} options={backupChoices(r.backup)} onChange={(backup) => updateRule(r.ruleId, { backup })} label={`${r.topic} backup`} selectClassName="!h-[30px] !text-[13.6px]" />
                    </span>
                    <span onClick={(e) => e.stopPropagation()} className="flex justify-center">
                      <Switch on={r.active} onChange={() => updateRule(r.ruleId, { active: !r.active })} label={`${r.topic} active`} />
                    </span>
                    <span className="flex justify-center gap-[6px]">
                      <button
                        type="button"
                        onClick={() => setSelectedId(r.ruleId)}
                        aria-label={`Edit ${r.topic}`}
                        className="grid h-[30px] w-[44px] place-items-center rounded-[7px] border border-[#dfe3e8] bg-white text-[#0f172a] transition hover:border-[#15633a] hover:text-[#15633a]"
                      >
                        <Pencil className="h-[16px] w-[16px]" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRule(r.ruleId);
                        }}
                        aria-label={`Delete ${r.topic}`}
                        className="grid h-[30px] w-[36px] place-items-center rounded-[7px] border border-[#dfe3e8] bg-white text-[#64748b] transition hover:border-[#dc2626] hover:text-[#dc2626]"
                      >
                        <Trash2 className="h-[15px] w-[15px]" />
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-[808px_1fr] gap-[14px]">
              {/* Rule details */}
              {selected ? (
              <div className={`${cardClass} px-[18px] pb-[8px] pt-[8px]`}>
                <div className="flex items-center gap-[12px]">
                  <p className="truncate text-[21.5px] font-bold leading-tight text-[#0f2a1c]">Rule Details — {selected.topic}</p>
                  <span className={`inline-flex shrink-0 items-center gap-[6px] rounded-[6px] px-[9px] py-[3px] text-[12.6px] ${selected.active ? "bg-[#eefaf1] text-[#15803d]" : "bg-[#f1f5f9] text-[#64748b]"}`}>
                    {selected.active ? "Active" : "Off"}
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
                      {selected.employees.length === 0 && (
                        <span className="px-[4px] py-[2px] text-[12.6px] text-[#94a3b8]">{activeStaff.length ? "Add staff from the list" : "No active staff — add them in Staff"}</span>
                      )}
                      {selected.employees.map((e) => (
                        <span key={e} className="inline-flex h-[24px] items-center gap-[10px] rounded-[5px] bg-[#f1f3f5] pl-[10px] pr-[8px] text-[12.6px] text-[#0f172a]">
                          {e}
                          <button type="button" aria-label={`Remove ${e}`} onClick={() => setDetail({ employees: selected.employees.filter((x) => x !== e) })} className="hover:text-[#dc2626]">
                            <X className="h-[13px] w-[13px]" />
                          </button>
                        </span>
                      ))}
                      <label className="absolute inset-y-0 right-0 grid w-[40px] place-items-center">
                        <select
                          value=""
                          onChange={(e) => e.target.value && setDetail({ employees: [...selected.employees, e.target.value] })}
                          aria-label="Add eligible employee"
                          className="absolute inset-0 cursor-pointer opacity-0"
                        >
                          <option value="">Add employee</option>
                          {activeStaff.filter((e) => !selected.employees.includes(e)).map((e) => (
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
                      value={String(selected.maxOpen)}
                      onChange={(e) => setDetail({ maxOpen: Number(e.target.value.replace(/\D/g, "").slice(0, 3)) || 0 })}
                      inputMode="numeric"
                      className={inputClass}
                    />
                    <span className="mt-[4px] block text-[12.6px] text-[#94a3b8]">0 = no limit</span>
                  </label>

                  <div>
                    <span className={labelClass}>
                      Assign Only During
                      <Req />
                    </span>
                    <Select value={selected.during} options={DURING} onChange={(during) => setDetail({ during })} label="Assign only during" selectClassName={fieldSelect} />
                  </div>
                  <div>
                    <span className={labelClass}>
                      When Employee Unavailable / At Limit
                      <Req />
                    </span>
                    <Select value={selected.unavailable} options={UNAVAILABLE} onChange={(unavailable) => setDetail({ unavailable })} label="When employee unavailable" selectClassName={fieldSelect} />
                  </div>

                  <div>
                    <span className={labelClass}>
                      Backup Owner
                      <Req />
                    </span>
                    <Select value={selected.backup} options={backupChoices(selected.backup)} onChange={(backup) => setDetail({ backup })} label="Backup owner" selectClassName={fieldSelect} />
                  </div>
                  <div>
                    <span className={labelClass}>
                      If No Employee Available
                      <Req />
                    </span>
                    <Select value={selected.noneAvailable} options={NONE_AVAILABLE} onChange={(noneAvailable) => setDetail({ noneAvailable })} label="If no employee available" selectClassName={fieldSelect} />
                  </div>
                </div>

                <label className="mt-[6px] flex cursor-pointer items-start gap-[10px]">
                  <input
                    type="checkbox"
                    checked={selected.keepOwner}
                    onChange={() => setDetail({ keepOwner: !selected.keepOwner })}
                    className="mt-[1px] h-[18px] w-[18px] cursor-pointer accent-[#15633a]"
                  />
                  <span>
                    <span className="block text-[14.1px] text-[#0f172a]">Keep returning enquiries with existing owner</span>
                    <span className="block text-[12.6px] text-[#64748b]">Use verified visitor profile; respect staff access and availability.</span>
                  </span>
                </label>

                <div className="mt-[8px] flex items-center gap-[18px]">
                  <span className="text-[14.1px] font-medium text-[#0f172a]">No Response Action</span>
                  <Select value={selected.noResponse} options={NO_RESPONSE} onChange={(noResponse) => setDetail({ noResponse })} label="No response action" className="w-[204px]" selectClassName={fieldSelect} />
                  <label className="ml-[14px] flex cursor-pointer items-center gap-[10px] text-[14.1px] text-[#0f172a]">
                    <input type="checkbox" checked={selected.reassign} onChange={() => setDetail({ reassign: !selected.reassign })} className="h-[18px] w-[18px] cursor-pointer accent-[#15633a]" />
                    Reassign after overdue delay
                  </label>
                  <Select
                    value={selected.delay}
                    options={DELAYS}
                    onChange={(delay) => setDetail({ delay })}
                    label="Overdue delay"
                    className={`w-[190px] ${selected.reassign ? "" : "pointer-events-none opacity-50"}`}
                    selectClassName={`${fieldSelect} ${selected.reassign ? "" : "!bg-[#f7f8fa] !text-[#94a3b8]"}`}
                  />
                </div>
              </div>
              ) : (
                <div className={`${cardClass} px-[18px] py-[12px] text-[14.1px] text-[#64748b]`}>Add a rule to set who gets each enquiry.</div>
              )}

              {/* Team capacity + default routing */}
              <div className={`${cardClass} flex flex-col px-[16px] pb-[8px] pt-[8px]`}>
                <p className="text-[19.5px] font-bold leading-tight text-[#0f2a1c]">Team Capacity</p>
                <div className="mt-[6px] overflow-hidden rounded-[8px] border border-[#eef0f2] text-[13.6px]">
                  <div className="grid grid-cols-[174px_1fr_96px] bg-[#f7f8fa] px-[14px] py-[5px] font-medium text-[#0f172a]">
                    <span>Employee</span>
                    <span>Availability</span>
                    <span>Open / Limit</span>
                  </div>
                  {(selected?.employees.length ?? 0) === 0 && <p className="border-t border-[#eef0f2] px-[14px] py-[6px] text-[#94a3b8]">No eligible employees on this rule.</p>}
                  {(selected?.employees ?? []).map((name) => {
                    const open = openOf(name);
                    const limit = selected?.maxOpen ?? 0;
                    const status = !activeStaff.includes(name) ? "Inactive" : limit && open >= limit ? "At limit" : "Available";
                    return (
                      <div key={name} className="grid h-[30px] grid-cols-[174px_1fr_96px] items-center border-t border-[#eef0f2] px-[14px] text-[#0f172a]">
                        <span className="truncate">{name}</span>
                        <span className={`flex items-center gap-[9px] ${status === "Available" ? "text-[#15803d]" : "text-[#ea7a0c]"}`}>
                          <span className={`h-[11px] w-[11px] rounded-full ${status === "Available" ? "bg-[#16a34a]" : "bg-[#f59e0b]"}`} /> {status}
                        </span>
                        <span className="pl-[6px]">
                          {open} / {limit || "∞"}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <p className="mt-[10px] text-[19.5px] font-bold leading-tight text-[#0f2a1c]">Default Routing</p>
                <span className={`${labelClass} mt-[4px]`}>
                  Unmatched Topic
                  <Req />
                </span>
                <Select
                  value={unmatched}
                  options={UNMATCHED.includes(unmatched) ? UNMATCHED : [unmatched, ...UNMATCHED]}
                  onChange={(v) => {
                    setUnmatched(v);
                    touch();
                  }}
                  label="Unmatched topic"
                  selectClassName={fieldSelect}
                />
                <p className="mt-[4px] text-[12.6px] text-[#94a3b8]">Enquiries not matching any topic will be assigned here.</p>

                <div className="mt-auto flex items-start justify-between pt-[8px]">
                  <div>
                    <p className="text-[14.1px] font-medium text-[#0f172a]">Rules checked in priority order</p>
                    <p className="text-[12.6px] text-[#94a3b8]">Top to bottom — drag a row, or move the selected rule up.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => selected && move(selected.ruleId, rules.findIndex((r) => r.ruleId === selected.ruleId) - 1)}
                    disabled={!selected || rules[0]?.ruleId === selected.ruleId}
                    className="flex items-center gap-[10px] text-[14.1px] text-[#15633a] underline underline-offset-2 hover:text-[#124f2f] disabled:opacity-40"
                  >
                    <ListOrdered className="h-[18px] w-[18px] text-[#0f172a]" /> Move Selected Up
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div {...panelProps("Alert Rules")} className={panelClass("Alert Rules")}>
            <AlertRulesTab
              value={alerts}
              onChange={(next) => {
                setAlerts(next);
                touch();
              }}
            />
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="mt-[10px] flex items-center gap-[16px]">
          <p
            className={`flex h-[36px] flex-1 items-center gap-[12px] rounded-[7px] px-[12px] text-[13.1px] ${
              message ? (message.ok ? "bg-[#eefaf1] text-[#15803d]" : "bg-[#fef2f2] text-[#dc2626]") : "bg-[#f1f4f8] text-[#64748b]"
            }`}
          >
            <Info className="h-[19px] w-[19px] text-[#334155]" />
            {message
              ? message.text
              : tab === "Alert Rules"
                ? "Mandatory alerts cannot be disabled by employees."
                : "Changes affect new enquiries; existing owners change only through configured reassignment."}
          </p>
          {dirty && (
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
