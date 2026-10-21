"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarDays, CheckCircle2, CreditCard, Download, Plus } from "lucide-react";
import { toast } from "sonner";
import { PaymentDialog, SubscriptionDialog } from "./dialogs";
import { CYCLE_LABEL, KIND_LABEL, PAYMENT_LABEL, RENEWAL_KIND_LABEL, daysLabel, daysTone, formatMoney, formatMoneyList, providerName } from "./format";
import { downloadExport, errorMessage, useDashboard, useInfraCapabilities, usePaymentHistory, useRenewals, useScope, useServers, useDomains, useSubscriptions } from "./hooks";
import { BarList, Chip, DateValue, EmptyState, ListSkeleton, Notice, Section, Select, Td, Th, btn, btnPrimary, useRoleFlags } from "./ui";
import type { SubscriptionRow } from "./types";

type Tab = "renewals" | "subscriptions" | "calendar" | "reports";

const WINDOWS = [
  { value: "", label: "All dates" }, { value: "overdue", label: "Overdue" }, { value: "7", label: "Next 7 days" }, { value: "15", label: "Next 15 days" },
  { value: "30", label: "Next 30 days" }, { value: "60", label: "Next 60 days" }, { value: "90", label: "Next 90 days" },
];

export function BillingPage() {
  const { companyId } = useScope();
  const { canBill: canManage } = useRoleFlags();
  const caps = useInfraCapabilities();
  const [tab, setTab] = useState<Tab>("renewals");
  const [win, setWin] = useState("");
  const [kind, setKind] = useState("");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<SubscriptionRow | null>(null);
  const [paying, setPaying] = useState<SubscriptionRow | null>(null);
  const renewals = useRenewals({ window: win || undefined, kind: kind || undefined });
  const subs = useSubscriptions();
  const dash = useDashboard();
  const history = usePaymentHistory(Boolean(caps.data?.billingRead));
  // Asset choices for the "add subscription" dialog.
  const servers = useServers({ limit: 100 });
  const domains = useDomains({ limit: 100 });
  const options = [...(servers.data?.items ?? []), ...(domains.data?.items ?? [])].map((a) => ({ id: a.id, name: a.name, type: a.type }));
  const canSeeBilling = Boolean(caps.data?.billingRead);

  const TABS: Array<{ id: Tab; label: string }> = [{ id: "renewals", label: "Upcoming renewals" }, { id: "subscriptions", label: "Subscriptions" }, { id: "calendar", label: "Calendar" }, { id: "reports", label: "Expense reports" }];

  return (
    <div className="space-y-1">
      {!canSeeBilling && caps.data && <Notice tone="blue" title="Amounts are hidden">Your role does not include billing access. Dates remain visible.</Notice>}
      <div role="tablist" aria-label="Billing sections" className="flex gap-1 overflow-x-auto border-b border-slate-200">
        {TABS.map((t) => <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={`shrink-0 border-b-2 px-3 py-2 text-xs font-semibold transition ${tab === t.id ? "border-red-600 text-red-600" : "border-transparent text-slate-500 hover:text-slate-900"}`}>{t.label}</button>)}
      </div>

      {tab === "renewals" && (
        <Section title="Renewals & expiries" description="Projected dates are labelled and never trigger reminders." flush
          action={<button type="button" className={btn} onClick={() => void downloadExport(companyId, "renewals").catch((e) => toast.error(errorMessage(e)))}><Download className="size-3.5" />Export CSV</button>}>
          <div className="flex flex-wrap gap-2 border-b border-slate-200 bg-white px-4 py-3">
            <Select label="Window" value={win} onChange={setWin} options={WINDOWS} />
            <Select label="Type" value={kind} onChange={setKind} options={[{ value: "", label: "All types" }, ...Object.entries(RENEWAL_KIND_LABEL).map(([value, label]) => ({ value, label }))]} />
          </div>
          {renewals.isLoading ? <ListSkeleton /> : renewals.isError ? <div className="p-4"><Notice tone="red" title="Renewals could not be loaded">{errorMessage(renewals.error)}</Notice></div> : (renewals.data?.items.length ?? 0) === 0 ? (
            <EmptyState icon={CalendarDays} title="No dates in this view" description="Renewal and expiry dates appear when a registry or certificate reports them, or when you enter them on a subscription." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse">
                <thead><tr><Th>Asset</Th><Th>What</Th><Th>Date</Th><Th>When</Th>{canSeeBilling && <Th>Amount</Th>}{canSeeBilling && <Th>Payment</Th>}</tr></thead>
                <tbody>
                  {renewals.data!.items.map((i) => (
                    <tr key={i.key} className="hover:bg-slate-50/70">
                      <Td><Link className="font-semibold text-slate-900 hover:text-red-700" href={`/infrastructure/assets/${i.assetId}`}>{i.assetName}</Link><div className="text-[11px] text-slate-500">{i.label}</div></Td>
                      <Td>{RENEWAL_KIND_LABEL[i.kind]}</Td>
                      <Td><DateValue date={i.date} source={i.source} verified={i.verified} /></Td>
                      <Td><Chip tone={daysTone(i.daysRemaining)}>{daysLabel(i.daysRemaining)}</Chip></Td>
                      {canSeeBilling && <Td>{i.amount !== null ? formatMoney(i.amount, i.currency) : <span className="text-slate-400">Not set</span>}</Td>}
                      {canSeeBilling && <Td>{i.paymentStatus ? PAYMENT_LABEL[i.paymentStatus] : "—"}</Td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      )}

      {tab === "subscriptions" && (
        <Section title="Subscriptions" description="One row per recurring charge. Payment history is kept per billing cycle." flush
          action={canManage ? <button type="button" className={btnPrimary} onClick={() => setAdding(true)}><Plus className="size-3.5" />Add subscription</button> : undefined}>
          {subs.isLoading ? <ListSkeleton /> : (subs.data?.length ?? 0) === 0 ? (
            <EmptyState icon={CreditCard} title="No subscriptions yet" description="Add hosting, VPS, domain or SSL subscriptions to track due dates and costs." action={canManage ? <button className={btnPrimary} onClick={() => setAdding(true)}>Add subscription</button> : undefined} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse">
                <thead><tr><Th>Asset</Th><Th>Type</Th><Th>Cycle</Th>{canSeeBilling && <Th>Amount</Th>}<Th>Next due</Th><Th>Expires</Th>{canSeeBilling && <Th>Status</Th>}<Th /></tr></thead>
                <tbody>
                  {subs.data!.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/70">
                      <Td><Link className="font-semibold text-slate-900 hover:text-red-700" href={`/infrastructure/assets/${s.assetId}`}>{s.assetName}</Link><div className="text-[11px] text-slate-500">{s.label ?? providerName(s.provider)}</div></Td>
                      <Td>{KIND_LABEL[s.kind] ?? s.kind}</Td>
                      <Td>{CYCLE_LABEL[s.cycle]}</Td>
                      {canSeeBilling && <Td>{formatMoney(s.amount ?? null, s.currency ?? null)}</Td>}
                      <Td><DateValue date={s.nextDueDate} source={s.dateSources.nextDueDate?.source ?? (s.nextDueDate ? "manual" : undefined)} verified={Boolean(s.dateSources.nextDueDate)} unknownText="Unknown" /></Td>
                      <Td><DateValue date={s.expirationDate} source={s.dateSources.expirationDate?.source ?? (s.expirationDate ? "manual" : undefined)} verified={Boolean(s.dateSources.expirationDate)} unknownText="Unknown" /></Td>
                      {canSeeBilling && <Td>{s.paymentStatus ? PAYMENT_LABEL[s.paymentStatus] : "—"}</Td>}
                      <Td>{canManage && (
                        <span className="flex gap-1.5">
                          {s.nextDueDate && <button type="button" className={btn} onClick={() => setPaying(s)}><CheckCircle2 className="size-3.5" />Paid</button>}
                          <button type="button" className={btn} onClick={() => setEditing(s)}>Edit</button>
                        </span>
                      )}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      )}

      {tab === "calendar" && <RenewalCalendar items={renewals.data?.items ?? []} loading={renewals.isLoading} />}

      {tab === "reports" && (
        canSeeBilling ? (
          <div className="grid gap-1 lg:grid-cols-2">
            <Section title="Monthly equivalent by provider" description="Each subscription divided to a per-month figure, per currency.">
              <BarList rows={(dash.data?.billing?.byProvider ?? []).map((p) => ({ label: providerName(p.provider), value: p.monthly.reduce((s, m) => s + m.amount, 0), sub: formatMoneyList(p.monthly) }))} empty="No subscription amounts recorded yet." />
            </Section>
            <Section title="Projection: next 12 months" description={dash.data?.billing?.note}>
              <BarList rows={(dash.data?.billing?.monthlyProjection ?? []).map((m) => ({ label: m.month, value: m.totals.reduce((s, x) => s + x.amount, 0), sub: formatMoneyList(m.totals) })).filter((r) => r.value > 0)} empty="No confirmed due dates with amounts yet." />
              {dash.data?.billing && <p className="mt-3 text-[11px] font-medium text-slate-500">Yearly equivalent: {formatMoneyList(dash.data.billing.yearlyEquivalent)}</p>}
            </Section>
            <Section title="Payments recorded" description="Confirmed payments by month.">
              <BarList rows={(history.data ?? []).map((m) => ({ label: m.month, value: m.totals.reduce((s, x) => s + x.amount, 0), sub: formatMoneyList(m.totals) }))} empty="No payments have been confirmed yet." />
            </Section>
          </div>
        ) : <EmptyState title="Reports need billing access" />
      )}

      {adding && <SubscriptionDialog open onOpenChange={setAdding} assetOptions={options} />}
      {editing && <SubscriptionDialog open onOpenChange={(o) => !o && setEditing(null)} existing={editing} assetId={editing.assetId} />}
      {paying && <PaymentDialog open onOpenChange={(o) => !o && setPaying(null)} subscription={{ id: paying.id, nextDueDate: paying.nextDueDate, amount: paying.amount ?? null, currency: paying.currency ?? null }} assetName={paying.assetName} />}
    </div>
  );
}

function RenewalCalendar({ items, loading }: { items: Array<{ key: string; date: string; assetId: string; assetName: string; kind: keyof typeof RENEWAL_KIND_LABEL; verified: boolean }>; loading: boolean }) {
  const [offset, setOffset] = useState(0);
  const base = new Date();
  const first = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + offset, 1));
  const label = first.toLocaleString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
  const days = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  const lead = (first.getUTCDay() + 6) % 7; // Monday first
  const key = (d: number) => `${first.getUTCFullYear()}-${String(first.getUTCMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const byDay = new Map<string, typeof items>();
  for (const i of items) byDay.set(i.date, [...(byDay.get(i.date) ?? []), i]);
  return (
    <Section title={label} action={<><button type="button" className={btn} onClick={() => setOffset((o) => o - 1)}>Previous</button><button type="button" className={btn} onClick={() => setOffset(0)}>Today</button><button type="button" className={btn} onClick={() => setOffset((o) => o + 1)}>Next</button></>}>
      {loading ? <ListSkeleton rows={3} /> : (
        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-sm border border-slate-200 bg-slate-200 text-[11px]">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d} className="bg-slate-50 px-2 py-1.5 font-semibold text-slate-500">{d}</div>)}
          {Array.from({ length: lead }, (_, i) => <div key={`l${i}`} className="min-h-20 bg-slate-50/60" />)}
          {Array.from({ length: days }, (_, i) => {
            const events = byDay.get(key(i + 1)) ?? [];
            return (
              <div key={i} className="min-h-20 bg-white p-1.5">
                <div className="font-semibold text-slate-500">{i + 1}</div>
                {events.slice(0, 3).map((e) => <Link key={e.key} href={`/infrastructure/assets/${e.assetId}`} className={`mt-0.5 block truncate rounded-sm px-1 py-0.5 font-semibold ${e.verified ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800"}`} title={`${e.assetName} · ${RENEWAL_KIND_LABEL[e.kind]}${e.verified ? "" : " (not confirmed)"}`}>{e.assetName}</Link>)}
                {events.length > 3 && <div className="mt-0.5 text-slate-500">+{events.length - 3} more</div>}
              </div>
            );
          })}
        </div>
      )}
    </Section>
  );
}
