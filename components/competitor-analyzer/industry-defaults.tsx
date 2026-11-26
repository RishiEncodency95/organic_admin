"use client";
import { useState } from 'react';
import { toast } from 'sonner';
import { ChevronDown, Globe, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/components/infrastructure/lib/cn';
import { useCanManage } from './permissions';
import { PROFILE_OPTIONS, useIndustrySettings, useSaveIndustrySettings, type IndustrySettings, type ProfileId } from './industry-api';

const FIELD = 'h-9 w-full rounded-md border border-[#DAE1EC] bg-white px-2.5 text-[12.5px] text-[#111C3A] outline-none focus:border-[#2563EB]';
const CRAWL_FIELDS = [
  { key: 'maxPagesPerSite', label: 'Pages per website', hint: 'Up to 10', min: 1, max: 10 },
  { key: 'maxPagesPerRun', label: 'Total content pages', hint: '9 to 50', min: 9, max: 50 },
  { key: 'concurrency', label: 'Websites at once', hint: '1 or 2', min: 1, max: 2 },
  { key: 'maxHttpRequests', label: 'HTTP request cap', hint: '20 to 150', min: 20, max: 150 },
] as const;

function Label({ text, hint, children }: { text: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-2 text-[11.5px] font-medium text-[#28354C]">{text}{hint ? <span className="text-[10.5px] font-normal text-[#94A3B8]">{hint}</span> : null}</span>
      <span className="mt-1 block">{children}</span>
    </label>
  );
}

export function IndustryDefaults() {
  const canManage = useCanManage(), query = useIndustrySettings(), save = useSaveIndustrySettings();
  const [draft, setDraft] = useState<IndustrySettings | null>(null), [domain, setDomain] = useState(''), [profile, setProfile] = useState<ProfileId>('expo-organic-v1');
  const value = draft ?? query.data;
  if (!canManage) return null;
  const update = (change: Partial<IndustrySettings>) => { if (value) setDraft({ ...value, ...change }); };
  const rules = value ? Object.entries(value.domainProfiles) : [];
  const addRule = () => {
    if (!value) return;
    const host = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    if (!host || !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(host)) { toast.error('Enter a public website domain'); return; }
    update({ domainProfiles: { ...value.domainProfiles, [host]: profile } });
    setDomain('');
  };
  return (
    <details className="group rounded-xl border border-[#E6EBF4] bg-white normal-case shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="block text-[13px] font-semibold text-[#111C3A]">Analysis defaults and industry profiles</span>
          <span className="block text-[11px] text-[#6B7A94]">Choose how new analyses are set up and how many pages are read.</span>
        </span>
        <ChevronDown className="size-4 shrink-0 text-[#94A3B8] transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="border-t border-[#EEF2F8] p-4">
        {query.error ? <p role="alert" className="text-xs text-red-700">{query.error.message}</p> : !value ? <p className="text-xs text-[#6B7A94]">Loading saved settings…</p> : (
          <div className="space-y-4">
            <section>
              <h3 className="text-[12px] font-semibold text-[#111C3A]">Defaults for new analyses</h3>
              <div className="mt-2 grid gap-3 md:grid-cols-2">
                <Label text="Primary website"><input value={value.primaryWebsite} onChange={(e) => update({ primaryWebsite: e.target.value })} className={FIELD} /></Label>
                <Label text="Default profile for other websites">
                  <select value={value.defaultProfile} onChange={(e) => update({ defaultProfile: e.target.value as ProfileId })} className={FIELD}>
                    {PROFILE_OPTIONS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                  </select>
                </Label>
              </div>
            </section>

            <section>
              <h3 className="text-[12px] font-semibold text-[#111C3A]">Website-specific profiles</h3>
              <p className="mt-0.5 text-[11px] text-[#6B7A94]">A rule picks the profile for a website automatically in a new analysis. Each analysis can still choose another one in Edit sites.</p>
              {rules.length ? (
                <ul className="mt-2 space-y-1.5">
                  {rules.map(([host, id]) => (
                    <li key={host} className="flex flex-wrap items-center gap-2 rounded-md border border-[#EEF2F8] bg-[#F8FAFD] px-2.5 py-1.5">
                      <Globe className="size-3.5 shrink-0 text-[#94A3B8]" aria-hidden />
                      <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-[#111C3A]">{host}</span>
                      <select aria-label={`Profile for ${host}`} value={id} onChange={(e) => update({ domainProfiles: { ...value.domainProfiles, [host]: e.target.value as ProfileId } })} className="h-8 rounded-md border border-[#DAE1EC] bg-white px-2 text-[12px]">
                        {PROFILE_OPTIONS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                      </select>
                      <button type="button" aria-label={`Remove rule for ${host}`} title="Remove rule" onClick={() => { const next = { ...value.domainProfiles }; delete next[host]; update({ domainProfiles: next }); }} className="grid size-8 place-items-center rounded-md text-[#94A3B8] hover:bg-[#FDF4F3] hover:text-[#C0261F]"><Trash2 className="size-3.5" /></button>
                    </li>
                  ))}
                </ul>
              ) : <p className="mt-2 text-[11.5px] text-[#94A3B8]">No website rules yet.</p>}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <input aria-label="Website domain for profile rule" placeholder="another-expo.com" value={domain} onChange={(e) => setDomain(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRule(); } }} className={cn(FIELD, 'w-52')} />
                <select aria-label="New domain profile" value={profile} onChange={(e) => setProfile(e.target.value as ProfileId)} className={cn(FIELD, 'w-auto')}>
                  {PROFILE_OPTIONS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
                <button type="button" onClick={addRule} className="inline-flex h-9 items-center gap-1 rounded-md border border-[#BFD3F7] bg-[#EFF4FC] px-3 text-[12px] font-medium text-[#1D4ED8] hover:bg-[#E3ECFB]"><Plus className="size-3.5" />Add rule</button>
              </div>
            </section>

            <section>
              <h3 className="text-[12px] font-semibold text-[#111C3A]">How much to read</h3>
              <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {CRAWL_FIELDS.map((field) => (
                  <Label key={field.key} text={field.label} hint={field.hint}>
                    <input type="number" min={field.min} max={field.max} value={value.crawlBudget[field.key]} onChange={(e) => update({ crawlBudget: { ...value.crawlBudget, [field.key]: Number(e.target.value) } })} className={FIELD} />
                  </Label>
                ))}
              </div>
              <p className="mt-2 rounded-md bg-[#F8FAFD] px-2.5 py-1.5 text-[11px] leading-snug text-[#6B7A94]">Limits cannot go above 10 pages per website and 50 content pages per analysis; up to 8 competitors share that total. Finding competitors checks up to 16 candidates within 50 requests.</p>
            </section>

            <div className="flex items-center justify-between gap-3 border-t border-[#EEF2F8] pt-3">
              <p className="text-[11px] text-[#94A3B8]">{draft ? 'You have unsaved changes.' : 'All changes saved.'}</p>
              <button type="button" disabled={save.isPending || !draft} onClick={() => save.mutate(value, { onSuccess: () => { setDraft(null); toast.success('Analysis defaults saved'); }, onError: (error) => toast.error(error.message) })} className="h-9 rounded-md bg-[#2563EB] px-4 text-[12.5px] font-semibold text-white hover:bg-[#1D4ED8] disabled:opacity-50">{save.isPending ? 'Saving…' : 'Save analysis defaults'}</button>
            </div>
          </div>
        )}
      </div>
    </details>
  );
}
