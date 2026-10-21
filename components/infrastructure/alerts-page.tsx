"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell, BellOff, CheckCircle2, Clock, RotateCcw } from "lucide-react";
import { infraApi } from "./api";
import { formatDate, formatDateTime } from "./format";
import { errorMessage, useAlerts, useInfraMutation, useInfraSettings } from "./hooks";
import { Chip, EmptyState, FormRow, ListSkeleton, Notice, Pager, Section, Select, Spinner, TextInput, btn, btnPrimary, useRoleFlags } from "./ui";
import type { InfraAlert } from "./types";

const STATES = [{ value: "active", label: "Active" }, { value: "RESOLVED", label: "Resolved" }, { value: "", label: "All" }];
const KINDS = [{ value: "", label: "All types" }, { value: "RENEWAL_DUE", label: "Renewals" }, { value: "DOMAIN_EXPIRY", label: "Domain expiry" }, { value: "SSL_EXPIRY", label: "SSL expiry" }, { value: "DNS_CHANGE", label: "DNS changes" }, { value: "SYNC_FAILURE", label: "Sync failures" }];

export function AlertsPage() {
  const { canWrite } = useRoleFlags();
  const [state, setState] = useState("active");
  const [kind, setKind] = useState("");
  const [page, setPage] = useState(1);
  const q = useAlerts({ state: state || undefined, kind: kind || undefined, page, limit: 20 });
  const act = useInfraMutation((c, v: { id: string; action: string; snoozeDays?: number }) => infraApi.alertAction(c, v.id, { action: v.action, snoozeDays: v.snoozeDays }), { success: "Alert updated." });

  return (
    <div className="space-y-1">
      <Section title="Alerts & history" description="Each threshold alerts once per date. Acknowledge, snooze or resolve; resolved alerts close themselves when the date moves." flush>
        <div className="flex flex-wrap gap-2 border-b border-slate-200 bg-white px-4 py-3">
          <Select label="State" value={state} onChange={(v) => { setState(v); setPage(1); }} options={STATES} />
          <Select label="Type" value={kind} onChange={(v) => { setKind(v); setPage(1); }} options={KINDS} />
        </div>
        {q.isLoading ? <ListSkeleton /> : q.isError ? <div className="p-4"><Notice tone="red" title="Alerts could not be loaded">{errorMessage(q.error)}</Notice></div> : (q.data?.items.length ?? 0) === 0 ? (
          <EmptyState icon={Bell} title="No alerts here" description="Reminders appear when a confirmed renewal, domain or certificate date approaches." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {q.data!.items.map((a) => <AlertRow key={a.id} a={a} canWrite={canWrite} busy={act.isPending && act.variables?.id === a.id} onAction={(action, snoozeDays) => act.mutate({ id: a.id, action, snoozeDays })} />)}
          </ul>
        )}
        <Pager page={q.data?.page ?? page} limit={20} total={q.data?.total ?? 0} onPage={setPage} noun="alerts" />
      </Section>
      <SettingsCard />
    </div>
  );
}

function AlertRow({ a, canWrite, busy, onAction }: { a: InfraAlert; canWrite: boolean; busy: boolean; onAction: (action: string, snoozeDays?: number) => void }) {
  const tone = a.severity === "critical" ? "red" : a.severity === "warning" ? "amber" : "blue";
  const delivered = a.delivery.deliveredAt;
  return (
    <li className="space-y-1.5 px-4 py-3 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Chip tone={tone}>{a.severity}</Chip>
          <Link href={`/infrastructure/assets/${a.asset.id}`} className="truncate font-semibold text-slate-900 hover:text-red-700">{a.title}</Link>
        </div>
        <div className="flex items-center gap-1.5">
          <Chip tone={a.state === "OPEN" ? "red" : a.state === "RESOLVED" ? "green" : "slate"}>{a.state.toLowerCase()}{a.state === "SNOOZED" && a.snoozedUntil ? ` until ${formatDate(a.snoozedUntil)}` : ""}</Chip>
          {canWrite && a.state !== "RESOLVED" && (
            <>
              {a.state === "OPEN" && <button type="button" className={btn} disabled={busy} onClick={() => onAction("acknowledge")}><CheckCircle2 className="size-3.5" />Acknowledge</button>}
              <button type="button" className={btn} disabled={busy} onClick={() => onAction("snooze", 7)}><Clock className="size-3.5" />Snooze 7d</button>
              <button type="button" className={btn} disabled={busy} onClick={() => onAction("resolve")}>Resolve</button>
            </>
          )}
          {canWrite && a.state === "RESOLVED" && <button type="button" className={btn} disabled={busy} onClick={() => onAction("reopen")}><RotateCcw className="size-3.5" />Reopen</button>}
        </div>
      </div>
      <p className="font-medium text-slate-600">{a.message}</p>
      <p className="text-[11px] font-medium text-slate-500">
        Raised {formatDateTime(a.raisedAt)} · {delivered ? `notified ${formatDateTime(delivered)}` : a.delivery.error ? `delivery failed (attempt ${a.delivery.attempts}): ${a.delivery.error}` : `delivery pending (attempt ${a.delivery.attempts})`}
      </p>
    </li>
  );
}

function SettingsCard() {
  const { canManage } = useRoleFlags();
  const q = useInfraSettings();
  const [days, setDays] = useState<string | null>(null);
  const [extra, setExtra] = useState<string | null>(null);
  const save = useInfraMutation((c, body: Parameters<typeof infraApi.saveSettings>[1]) => infraApi.saveSettings(c, body), { success: "Reminder settings saved." });
  if (!q.data) return null;
  const s = q.data;
  const daysValue = days ?? s.thresholdDays.join(", ");
  const extraValue = extra ?? s.extraRecipients.join(", ");
  const parse = () => daysValue.split(/[,\s]+/).filter(Boolean).map(Number);
  return (
    <Section title="Reminder settings" description="Applied to every renewal, domain and certificate date in this company.">
      <div className="grid gap-3 sm:grid-cols-2">
        <FormRow label="Remind this many days before" hint="Comma separated. 0 = on the day itself.">{(id) => <TextInput id={id} value={daysValue} disabled={!canManage} onChange={(e) => setDays(e.target.value)} />}</FormRow>
        <FormRow label="Extra email recipients" hint="Owners and Admins are always notified in-app and by email.">{(id) => <TextInput id={id} value={extraValue} disabled={!canManage} onChange={(e) => setExtra(e.target.value)} placeholder="ops@example.com" />}</FormRow>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-700">
        <label className="inline-flex items-center gap-1.5"><input type="checkbox" disabled={!canManage} checked={s.inAppEnabled} onChange={(e) => save.mutate({ inAppEnabled: e.target.checked })} />In-app notifications</label>
        <label className="inline-flex items-center gap-1.5"><input type="checkbox" disabled={!canManage} checked={s.emailEnabled} onChange={(e) => save.mutate({ emailEnabled: e.target.checked })} />Email</label>
        {!s.emailTransportConfigured && <span className="text-amber-800">Email is not configured on this server, so email reminders are skipped.</span>}
        <span className="text-slate-500 inline-flex items-center gap-1"><BellOff className="size-3.5" />WhatsApp and quiet hours are not available for these alerts.</span>
      </div>
      {canManage && (
        <div className="mt-3 flex justify-end">
          <button type="button" className={btnPrimary} disabled={save.isPending} onClick={() => save.mutate({ thresholdDays: parse(), extraRecipients: extraValue.split(/[,\s]+/).filter(Boolean) })}>{save.isPending && <Spinner />}Save settings</button>
        </div>
      )}
    </Section>
  );
}
