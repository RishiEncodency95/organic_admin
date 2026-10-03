import React, { useEffect, useState } from 'react';
import { Users, Info, ArrowRight, Plus, Trash2, Save, Mail } from 'lucide-react';
import Swal from 'sweetalert2';
import {
  loadHrSettings,
  saveHrSettings,
  RECIPIENT_TYPE_LABEL,
  type HrRecipient,
  type HrSettings,
  type RecipientType,
} from '@/lib/hrSettings';
import { staffApi } from '@/lib/staffApi';
import { rolesApi } from '@/lib/rolesApi';
import type { Role, StaffMember } from '@/lib/types';

const Toggle = ({ checked, disabled, onChange, label }: { checked?: boolean, disabled?: boolean, onChange?: (next: boolean) => void, label?: string }) => (
  <button
    type="button"
    role="switch"
    aria-checked={!!checked}
    aria-label={label}
    disabled={disabled || !onChange}
    onClick={() => onChange?.(!checked)}
    className={`w-[32px] h-[18px] flex items-center rounded-full p-[2px] transition-colors duration-200 ease-in-out ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${checked ? 'bg-[#148943]' : 'bg-[#E1E6EC]'}`}
  >
    <div className={`bg-white w-[14px] h-[14px] rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${checked ? 'translate-x-[14px]' : 'translate-x-0'}`} />
  </button>
);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// To = main receiver, CC = visible copy, BCC = hidden copy.
const TYPE_STYLE: Record<RecipientType, { on: string; hint: string }> = {
  to: { on: 'bg-[#148943] text-white border-[#148943]', hint: 'Main receiver of the email' },
  cc: { on: 'bg-[#2563EB] text-white border-[#2563EB]', hint: 'Gets a copy; everyone can see this address' },
  bcc: { on: 'bg-[#7C3AED] text-white border-[#7C3AED]', hint: 'Gets a hidden copy; other receivers cannot see this address' },
};
const TYPES: RecipientType[] = ['to', 'cc', 'bcc'];

const inputCls =
  'w-full h-[30px] border border-[#E1E6EC] rounded-[6px] px-[8px] text-[11px] font-medium text-[#172762] outline-none focus:border-[#148943] focus:ring-1 focus:ring-[#148943] placeholder:text-[#94A3B8]';

const blankRecipient = (): HrRecipient => ({ name: '', designation: '', email: '', type: 'cc', active: true });

// Checks the list before saving; returns the cleaned list or an error message.
const validate = (recipients: HrRecipient[]): { list: HrRecipient[] } | { error: string } => {
  const list = recipients
    .map((r) => ({ ...r, name: r.name.trim(), designation: r.designation.trim(), email: r.email.trim().toLowerCase() }))
    .filter((r) => r.name || r.designation || r.email);
  const seen = new Set<string>();
  for (const r of list) {
    if (!r.email) return { error: `Add an email ID for ${r.name || 'every recipient'}.` };
    if (!EMAIL_RE.test(r.email)) return { error: `"${r.email}" is not a valid email ID.` };
    if (seen.has(r.email)) return { error: `${r.email} is added more than once.` };
    seen.add(r.email);
  }
  if (list.length === 0) return { error: 'Add at least one HR recipient.' };
  if (!list.some((r) => r.active && r.type === 'to')) return { error: 'Keep at least one active recipient in "To".' };
  return { list };
};

export default function HRWorkflowSettings() {
  const [settings, setSettings] = useState<HrSettings | null>(null);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  // Name comes from Staff Management, Designation from Users & Roles.
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    let active = true;
    staffApi
      .list()
      .then((list) => active && setStaff((list || []).filter((s) => s.status === 'ACTIVE')))
      .catch(() => active && setStaff([]));
    rolesApi
      .list()
      .then((list) => active && setRoles((list || []).filter((r) => r.status === 'ACTIVE')))
      .catch(() => active && setRoles([]));
    return () => {
      active = false;
    };
  }, []);

  // Picking a staff member fills their email and role; both can still be changed.
  const pickStaff = (index: number, name: string) => {
    const member = staff.find((s) => s.name === name);
    updateRecipient(index, {
      name,
      ...(member?.email ? { email: member.email } : {}),
      ...(member?.roleName ? { designation: member.roleName } : {}),
    });
  };

  useEffect(() => {
    let active = true;
    loadHrSettings()
      .then((data) => {
        if (!active) return;
        setSettings(data);
        setLoadError('');
      })
      .catch((err) => active && setLoadError((err as Error)?.message || 'Could not load HR settings'));
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const updateRecipient = (index: number, patch: Partial<HrRecipient>) =>
    setSettings((prev) =>
      prev ? { ...prev, recipients: prev.recipients.map((r, i) => (i === index ? { ...r, ...patch } : r)) } : prev
    );
  const removeRecipient = (index: number) =>
    setSettings((prev) => (prev ? { ...prev, recipients: prev.recipients.filter((_, i) => i !== index) } : prev));
  const addRecipient = () =>
    setSettings((prev) => (prev ? { ...prev, recipients: [...prev.recipients, blankRecipient()] } : prev));

  const save = async () => {
    if (!settings) return;
    const checked = validate(settings.recipients);
    if ('error' in checked) {
      Swal.fire({ icon: 'warning', title: 'Check HR recipients', text: checked.error, confirmButtonColor: '#148943' });
      return;
    }
    setSaving(true);
    try {
      const saved = await saveHrSettings({ ...settings, recipients: checked.list });
      if (saved) setSettings(saved);
      Swal.fire({
        icon: 'success',
        title: 'HR settings saved',
        text: 'Forward to HR will now use these recipients.',
        confirmButtonColor: '#148943',
      });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Could not save', text: (err as Error)?.message || 'Please try again.', confirmButtonColor: '#dc2626' });
    } finally {
      setSaving(false);
    }
  };

  const activeByType = (type: RecipientType) =>
    (settings?.recipients || []).filter((r) => r.active && r.type === type && r.email.trim()).map((r) => r.name.trim() || r.email.trim());

  return (
    <div className="flex flex-col gap-[16px] py-[8px]">

      {/* 1. HR & Workflow */}
      <div className="bg-white rounded-[8px] border border-[#E1E6EC] p-[20px] shadow-sm">
        <div className="flex items-start justify-between mb-[12px]">
          <div className="flex items-center gap-[16px]">
            <div className="w-[48px] h-[48px] rounded-full bg-[#E8F5E9] text-[#148943] flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#172762]">HR & Workflow</h2>
              <p className="text-[11px] font-medium text-[#506083] mt-[4px]">Manage how applications are forwarded to HR team for review.</p>
            </div>
          </div>
          <div className="bg-[#E8F5E9] rounded-[6px] p-[12px] flex items-start gap-[10px] max-w-[360px]">
            <div className="mt-[2px] text-[#148943]">
              <Info size={16} className="fill-[#148943] text-white" />
            </div>
            <p className="text-[10px] font-medium text-[#148943] leading-[1.4]">
              These settings control how applications are shared with HR and how HR status is managed and displayed on the system.
            </p>
          </div>
        </div>

        <div className="pt-[16px] border-t border-[#E1E6EC]">
          {/* HR Recipient(s) */}
          <div className="flex items-end justify-between gap-[16px] mb-[10px]">
            <div>
              <label className="block text-[11px] font-bold text-[#172762]">
                HR Recipient(s) <span className="text-red-500">*</span>
              </label>
              <p className="text-[9.5px] font-medium text-[#506083] mt-[4px]">
                Pick the name from Staff Management and the designation from Users &amp; Roles, type the email ID, then choose how they receive the forward email.
              </p>
            </div>
            <div className="flex items-center gap-[10px] flex-wrap justify-end">
              {TYPES.map((t) => (
                <div key={t} className="flex items-center gap-[4px]" title={TYPE_STYLE[t].hint}>
                  <span className={`px-[6px] py-[1px] rounded-[4px] border text-[9px] font-bold ${TYPE_STYLE[t].on}`}>{RECIPIENT_TYPE_LABEL[t]}</span>
                  <span className="text-[9px] font-medium text-[#506083]">{TYPE_STYLE[t].hint}</span>
                </div>
              ))}
            </div>
          </div>

          {!settings ? (
            <div className="border border-[#E1E6EC] rounded-[6px] p-[16px] text-[11px] font-semibold text-[#506083] flex items-center justify-between">
              {loadError ? (
                <>
                  <span className="text-[#DC2626]">{loadError}</span>
                  <button
                    type="button"
                    onClick={() => setReloadKey((k) => k + 1)}
                    className="px-[10px] py-[4px] border border-[#E1E6EC] rounded-[6px] text-[10px] font-bold text-[#172762] hover:bg-gray-50"
                  >
                    Retry
                  </button>
                </>
              ) : (
                'Loading HR recipients...'
              )}
            </div>
          ) : (
            <>
              <div className="border border-[#E1E6EC] rounded-[6px] overflow-hidden">
                <div className="grid grid-cols-[1.1fr_1fr_1.5fr_150px_60px_36px] gap-[8px] bg-[#F4F7FB] px-[10px] py-[7px] text-[10px] font-bold text-[#506083]">
                  <div>Name</div>
                  <div>Designation</div>
                  <div>Email ID</div>
                  <div>Send As</div>
                  <div className="text-center">Active</div>
                  <div />
                </div>
                {settings.recipients.length === 0 && (
                  <div className="px-[10px] py-[14px] text-[11px] font-medium text-[#94A3B8] text-center">
                    No HR recipients yet. Click &quot;Add Recipient&quot; to add one.
                  </div>
                )}
                {settings.recipients.map((r, i) => (
                  <div
                    key={r.id || `new-${i}`}
                    className={`grid grid-cols-[1.1fr_1fr_1.5fr_150px_60px_36px] gap-[8px] items-center px-[10px] py-[7px] border-t border-[#E1E6EC] ${r.active ? '' : 'bg-[#FAFBFC] opacity-70'}`}
                  >
                    <select
                      value={r.name}
                      onChange={(e) => pickStaff(i, e.target.value)}
                      className={`${inputCls} bg-white cursor-pointer`}
                    >
                      <option value="">Select staff member</option>
                      {/* Keep a saved name visible even if it is not (or no longer) in Staff Management. */}
                      {r.name && !staff.some((s) => s.name === r.name) && <option value={r.name}>{r.name}</option>}
                      {staff.map((s) => (
                        <option key={s._id} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={r.designation}
                      onChange={(e) => updateRecipient(i, { designation: e.target.value })}
                      className={`${inputCls} bg-white cursor-pointer`}
                    >
                      <option value="">Select designation</option>
                      {r.designation && !roles.some((role) => role.name === r.designation) && (
                        <option value={r.designation}>{r.designation}</option>
                      )}
                      {roles.map((role) => (
                        <option key={role._id} value={role.name}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                    <div className="relative">
                      <Mail size={12} className="absolute left-[8px] top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                      <input
                        type="email"
                        value={r.email}
                        onChange={(e) => updateRecipient(i, { email: e.target.value })}
                        placeholder="name@company.com"
                        className={`${inputCls} pl-[24px] ${r.email && !EMAIL_RE.test(r.email.trim()) ? 'border-[#DC2626]' : ''}`}
                      />
                    </div>
                    <div className="flex rounded-[6px] overflow-hidden border border-[#E1E6EC] w-fit">
                      {TYPES.map((t) => (
                        <button
                          key={t}
                          type="button"
                          title={TYPE_STYLE[t].hint}
                          onClick={() => updateRecipient(i, { type: t })}
                          className={`px-[10px] h-[28px] text-[10px] font-bold border-l first:border-l-0 transition-colors ${
                            r.type === t ? TYPE_STYLE[t].on : 'bg-white text-[#506083] border-[#E1E6EC] hover:bg-[#F4F7FB]'
                          }`}
                        >
                          {RECIPIENT_TYPE_LABEL[t]}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-center">
                      <Toggle checked={r.active} label={`${r.name || r.email || 'Recipient'} active`} onChange={(active) => updateRecipient(i, { active })} />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRecipient(i)}
                      aria-label="Remove recipient"
                      className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center text-[#94A3B8] hover:text-[#DC2626] hover:bg-[#FEE2E2] transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-start justify-between gap-[16px] mt-[10px]">
                <button
                  type="button"
                  onClick={addRecipient}
                  className="flex items-center gap-[4px] px-[10px] py-[5px] border border-dashed border-[#148943] text-[#148943] rounded-[6px] text-[10px] font-bold hover:bg-[#E8F5E9] transition-colors"
                >
                  <Plus size={12} />
                  Add Recipient
                </button>
                <div className="text-[9.5px] font-medium text-[#506083] text-right leading-[1.6]">
                  <div><b className="text-[#148943]">To:</b> {activeByType('to').join(', ') || '—'}</div>
                  <div><b className="text-[#2563EB]">CC:</b> {activeByType('cc').join(', ') || '—'}</div>
                  <div><b className="text-[#7C3AED]">BCC:</b> {activeByType('bcc').join(', ') || '—'}</div>
                </div>
              </div>
              <p className="text-[9.5px] font-medium text-[#506083] mt-[6px]">
                Active members show in the &quot;Forward to HR&quot; popup and receive the email notification when an application is forwarded.
              </p>
            </>
          )}

          <div className="grid grid-cols-2 gap-[32px] mt-[18px] pt-[16px] border-t border-[#E1E6EC]">
            {/* Forward to HR */}
            <div>
              <h3 className="text-[11px] font-bold text-[#172762] mb-[10px]">Forward to HR</h3>
              <div className="flex gap-[12px]">
                <div className="mt-[2px]">
                  <Toggle
                    checked={settings?.manualForward}
                    disabled={!settings}
                    label="Manual Forward by Website Team"
                    onChange={(manualForward) => setSettings((prev) => (prev ? { ...prev, manualForward } : prev))}
                  />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-[#172762]">Manual Forward by Website Team</div>
                  <p className="text-[9.5px] font-medium text-[#506083] mt-[4px] leading-[1.3]">
                    Website team can manually forward selected applications to HR.
                  </p>
                </div>
              </div>
            </div>

            {/* Notify HR */}
            <div>
              <h3 className="text-[11px] font-bold text-[#172762] mb-[10px]">Notify HR</h3>
              <div className="flex gap-[12px]">
                <div className="mt-[2px]">
                  <Toggle
                    checked={settings?.notifyHr}
                    disabled={!settings}
                    label="Send email notification"
                    onChange={(notifyHr) => setSettings((prev) => (prev ? { ...prev, notifyHr } : prev))}
                  />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-[#172762]">Send email notification</div>
                  <p className="text-[9.5px] font-medium text-[#506083] mt-[4px] leading-[1.3]">
                    HR will receive email with candidate details when forwarded.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-[16px]">
            <button
              type="button"
              onClick={save}
              disabled={!settings || saving}
              className="flex items-center gap-[4px] px-[14px] py-[7px] bg-[#148943] text-white rounded-[6px] text-[10px] font-bold hover:bg-[#117639] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={11} />
              {saving ? 'Saving...' : 'Save HR Settings'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. HR Status Tracking */}
      <div className="bg-white rounded-[8px] border border-[#E1E6EC] p-[20px] shadow-sm">
        <div className="flex items-center gap-[16px] mb-[20px]">
          <div className="w-[48px] h-[48px] rounded-full bg-[#E8F5E9] text-[#148943] flex items-center justify-center font-bold text-[20px]">
            2
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-[#172762]">HR Status Tracking</h2>
            <p className="text-[11px] font-medium text-[#506083] mt-[4px]">Manage application status flow and default settings for HR review.</p>
          </div>
        </div>

        <div>
          <h3 className="text-[11px] font-bold text-[#172762] mb-[14px]">Status Flow (Read Only for Website Team)</h3>
          
          <div className="flex items-center flex-wrap gap-[6px]">
            <div className="bg-[#EBF3FF] text-[#2563EB] px-[16px] py-[8px] rounded-[6px] text-[10px] font-bold min-w-[90px] text-center">Sent to HR</div>
            <ArrowRight size={14} className="text-[#94A3B8]" />
            <div className="bg-[#EBF3FF] text-[#2563EB] px-[16px] py-[8px] rounded-[6px] text-[10px] font-bold min-w-[100px] text-center">Under Review</div>
            <ArrowRight size={14} className="text-[#94A3B8]" />
            <div className="bg-[#FFF3E0] text-[#D97706] px-[16px] py-[8px] rounded-[6px] text-[10px] font-bold min-w-[90px] text-center">Shortlisted</div>
            <ArrowRight size={14} className="text-[#94A3B8]" />
            <div className="bg-[#F3E8FF] text-[#9333EA] px-[16px] py-[8px] rounded-[6px] text-[10px] font-bold min-w-[90px] text-center">Interview</div>
            <ArrowRight size={14} className="text-[#94A3B8]" />
            <div className="bg-[#E8F5E9] text-[#148943] px-[16px] py-[8px] rounded-[6px] text-[10px] font-bold min-w-[90px] text-center">Selected</div>
            <ArrowRight size={14} className="text-[#94A3B8]" />
            <div className="bg-[#FEE2E2] text-[#DC2626] px-[16px] py-[8px] rounded-[6px] text-[10px] font-bold min-w-[90px] text-center">Rejected</div>
            <ArrowRight size={14} className="text-[#94A3B8]" />
            <div className="bg-[#F1F5F9] text-[#475569] px-[16px] py-[8px] rounded-[6px] text-[10px] font-bold min-w-[90px] text-center">On Hold</div>
            <ArrowRight size={14} className="text-[#94A3B8]" />
            <div className="bg-[#E8F5E9] text-[#148943] px-[16px] py-[8px] rounded-[6px] text-[10px] font-bold min-w-[90px] text-center">Joined</div>
          </div>

          <div className="mt-[20px] bg-[#F4F7FB] rounded-[6px] p-[12px] flex items-center gap-[10px]">
            <div className="text-[#2563EB]">
              <Info size={16} className="fill-[#2563EB] text-white" />
            </div>
            <p className="text-[10px] font-medium text-[#506083]">
              HR team will update the status. Website team cannot change HR status.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Status Sync & Visibility */}
      <div className="bg-white rounded-[8px] border border-[#E1E6EC] p-[20px] shadow-sm mb-[20px]">
        <div className="flex items-center gap-[16px] mb-[20px]">
          <div className="w-[48px] h-[48px] rounded-full bg-[#E8F5E9] text-[#148943] flex items-center justify-center font-bold text-[20px]">
            3
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-[#172762]">Status Sync & Visibility</h2>
            <p className="text-[11px] font-medium text-[#506083] mt-[4px]">Choose what HR information to show in the applications list and candidate details page.</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-[32px] pt-[8px]">
          {/* Show HR Status */}
          <div>
            <h3 className="text-[11px] font-bold text-[#172762] mb-[10px]">Show HR Status</h3>
            <div className="flex gap-[12px]">
              <div className="mt-[2px]"><Toggle checked={true} /></div>
              <div>
                <p className="text-[9.5px] font-medium text-[#506083] leading-[1.3]">
                  Display latest HR status in applications list and candidate details page.
                </p>
              </div>
            </div>
          </div>

          {/* Show Latest HR Remark */}
          <div>
            <h3 className="text-[11px] font-bold text-[#172762] mb-[10px]">Show Latest HR Remark</h3>
            <div className="flex gap-[12px]">
              <div className="mt-[2px]"><Toggle checked={true} /></div>
              <div>
                <p className="text-[9.5px] font-medium text-[#506083] leading-[1.3]">
                  Display latest remark / comment from HR.
                </p>
              </div>
            </div>
          </div>

          {/* Show Updated By & Date/Time */}
          <div>
            <h3 className="text-[11px] font-bold text-[#172762] mb-[10px]">Show Updated By & Date/Time</h3>
            <div className="flex gap-[12px]">
              <div className="mt-[2px]"><Toggle checked={true} /></div>
              <div>
                <p className="text-[9.5px] font-medium text-[#506083] leading-[1.3]">
                  Display name of HR member and last updated date & time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
