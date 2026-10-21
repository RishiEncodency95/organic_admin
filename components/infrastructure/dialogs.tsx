"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { infraApi } from "./api";
import { CYCLE_LABEL, ENV_LABEL, KIND_LABEL, SERVER_TYPE_LABEL, TRI_LABEL, PAYMENT_LABEL, providerName } from "./format";
import { errorMessage, useInfraMutation, useScope } from "./hooks";
import { Modal, FormRow, TextInput, btn, btnPrimary, field, textarea, Spinner, Notice, useRoleFlags } from "./ui";
import type { Asset, Connection, ProviderCatalogueEntry, Subscription, SubscriptionRow } from "./types";

const ENVS = Object.entries(ENV_LABEL) as Array<[keyof typeof ENV_LABEL, string]>;

const nullable = (v: string) => (v.trim() === "" ? null : v.trim());
const num = (v: string) => (v.trim() === "" ? null : Number(v));

/* ------------------------------------------------------------------ server */

export function ServerDialog({ open, onOpenChange, asset }: { open: boolean; onOpenChange: (o: boolean) => void; asset?: Asset | null }) {
  const { canManage } = useRoleFlags();
  const imported = asset?.source === "provider_api";
  const s = asset?.server;
  const [f, setF] = useState(() => ({
    name: asset?.name ?? "", clientId: asset?.client?.id ?? "", environment: asset?.environment ?? "PRODUCTION", provider: asset?.provider ?? "", serverType: s?.serverType ?? "VPS", planName: s?.planName ?? "",
    hostname: s?.hostname ?? "", ipv4: s?.ipv4 ?? "", ipv6: s?.ipv6 ?? "", region: s?.region ?? "", datacenter: s?.datacenter ?? "", os: s?.operatingSystem ?? "",
    vcpu: s?.vcpu?.toString() ?? "", ramMb: s?.ramMb?.toString() ?? "", storageGb: s?.storageGb?.toString() ?? "", ownerName: asset?.ownerName ?? "", ownerEmail: asset?.ownerEmail ?? "", tags: (asset?.tags ?? []).join(", "), notes: asset?.notes ?? "",
  }));
  const [err, setErr] = useState<string | null>(null);
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));
  const save = useInfraMutation(
    (c, body: Record<string, unknown>) => (asset ? infraApi.updateAsset(c, asset.id, body) : infraApi.createServer(c, body)),
    { success: asset ? "Server updated." : "Server added." },
  );
  const submit = () => {
    if (!f.name.trim()) return setErr("Give the server a name.");
    setErr(null);
    const body: Record<string, unknown> = {
      name: f.name.trim(), clientId: f.clientId || null, environment: f.environment, ownerName: nullable(f.ownerName), ownerEmail: nullable(f.ownerEmail),
      tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean), notes: nullable(f.notes),
    };
    if (!imported) {
      Object.assign(body, {
        provider: nullable(f.provider), serverType: f.serverType, planName: nullable(f.planName), hostname: nullable(f.hostname), ipv4: nullable(f.ipv4), ipv6: nullable(f.ipv6),
        region: nullable(f.region), datacenter: nullable(f.datacenter), operatingSystem: nullable(f.os), vcpu: num(f.vcpu), ramMb: num(f.ramMb), storageGb: num(f.storageGb),
      });
    }
    save.mutate(body, { onSuccess: () => onOpenChange(false), onError: (e) => setErr(errorMessage(e)) });
  };
  return (
    <Modal open={open} onOpenChange={onOpenChange} wide title={asset ? "Edit server" : "Add a server"} description={imported ? "Configuration of imported servers is owned by the provider and refreshes on sync. You can edit the business details." : "Enter what you know. Capacity fields describe what was provisioned, not live usage."}>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormRow label="Display name *">{(id) => <TextInput id={id} value={f.name} onChange={(e) => set("name", e.target.value)} maxLength={200} />}</FormRow>
        <FormRow label="Environment">{(id) => <select id={id} className={field} value={f.environment} onChange={(e) => set("environment", e.target.value as never)}>{ENVS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>}</FormRow>
        <FormRow label="Provider">{(id) => <TextInput id={id} value={f.provider} onChange={(e) => set("provider", e.target.value)} disabled={imported} placeholder="e.g. hetzner, hostinger, aws" />}</FormRow>
        <FormRow label="Server type">{(id) => <select id={id} className={field} value={f.serverType} disabled={imported} onChange={(e) => set("serverType", e.target.value)}>{Object.entries(SERVER_TYPE_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>}</FormRow>
        <FormRow label="Plan / product">{(id) => <TextInput id={id} value={f.planName} onChange={(e) => set("planName", e.target.value)} disabled={imported} />}</FormRow>
        <FormRow label="Hostname">{(id) => <TextInput id={id} value={f.hostname} onChange={(e) => set("hostname", e.target.value)} disabled={imported} />}</FormRow>
        <FormRow label="Public IPv4">{(id) => <TextInput id={id} value={f.ipv4} onChange={(e) => set("ipv4", e.target.value)} disabled={imported} placeholder="203.0.113.10" />}</FormRow>
        <FormRow label="Public IPv6">{(id) => <TextInput id={id} value={f.ipv6} onChange={(e) => set("ipv6", e.target.value)} disabled={imported} />}</FormRow>
        <FormRow label="Region">{(id) => <TextInput id={id} value={f.region} onChange={(e) => set("region", e.target.value)} disabled={imported} />}</FormRow>
        <FormRow label="Datacenter">{(id) => <TextInput id={id} value={f.datacenter} onChange={(e) => set("datacenter", e.target.value)} disabled={imported} />}</FormRow>
        <FormRow label="Operating system">{(id) => <TextInput id={id} value={f.os} onChange={(e) => set("os", e.target.value)} disabled={imported} />}</FormRow>
        <FormRow label="vCPU (provisioned)">{(id) => <TextInput id={id} inputMode="numeric" value={f.vcpu} onChange={(e) => set("vcpu", e.target.value)} disabled={imported} />}</FormRow>
        <FormRow label="RAM in MB (provisioned)">{(id) => <TextInput id={id} inputMode="numeric" value={f.ramMb} onChange={(e) => set("ramMb", e.target.value)} disabled={imported} />}</FormRow>
        <FormRow label="Storage in GB (provisioned)">{(id) => <TextInput id={id} inputMode="numeric" value={f.storageGb} onChange={(e) => set("storageGb", e.target.value)} disabled={imported} />}</FormRow>
        <FormRow label="Owner / contact">{(id) => <TextInput id={id} value={f.ownerName} onChange={(e) => set("ownerName", e.target.value)} />}</FormRow>
        <FormRow label="Owner email" hint="Also receives renewal reminders for this asset.">{(id) => <TextInput id={id} type="email" value={f.ownerEmail} onChange={(e) => set("ownerEmail", e.target.value)} />}</FormRow>
        <FormRow label="Tags" hint="Comma separated.">{(id) => <TextInput id={id} value={f.tags} onChange={(e) => set("tags", e.target.value)} />}</FormRow>
      </div>
      <FormRow label="Notes">{(id) => <textarea id={id} className={textarea} rows={3} value={f.notes} maxLength={4000} onChange={(e) => set("notes", e.target.value)} />}</FormRow>
      {err && <Notice tone="red" title={err} />}
      <div className="flex justify-end gap-2">
        <button type="button" className={btn} onClick={() => onOpenChange(false)}>Cancel</button>
        <button type="button" className={btnPrimary} onClick={submit} disabled={save.isPending}>{save.isPending && <Spinner />}{asset ? "Save changes" : "Add server"}</button>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ domain */

export function DomainDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { canManage } = useRoleFlags();
  const [domain, setDomain] = useState("");
  const [clientId, setClientId] = useState("");
  const [environment, setEnvironment] = useState("PRODUCTION");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const save = useInfraMutation((c, body: Record<string, unknown>) => infraApi.createDomain(c, body), { success: "Domain added. Registry, DNS and SSL lookups are running." });
  const submit = () => {
    if (!domain.trim()) return setErr("Enter a domain name.");
    setErr(null);
    save.mutate({ domain: domain.trim(), clientId: clientId || null, environment, ownerEmail: nullable(ownerEmail) }, {
      onSuccess: () => { setDomain(""); onOpenChange(false); },
      onError: (e) => setErr(errorMessage(e)),
    });
  };
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Add a domain" description="Registration and expiry are read from the registry's public RDAP service. Internationalised names are converted automatically.">
      <FormRow label="Domain name *" hint="For example example.com, example.co.in or example.store">{(id) => <TextInput id={id} value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="example.com" autoFocus />}</FormRow>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormRow label="Environment">{(id) => <select id={id} className={field} value={environment} onChange={(e) => setEnvironment(e.target.value)}>{ENVS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>}</FormRow>
        <FormRow label="Owner email" hint="Receives renewal reminders.">{(id) => <TextInput id={id} type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} />}</FormRow>
      </div>
      {err && <Notice tone="red" title={err} />}
      <div className="flex justify-end gap-2">
        <button type="button" className={btn} onClick={() => onOpenChange(false)}>Cancel</button>
        <button type="button" className={btnPrimary} onClick={submit} disabled={save.isPending}>{save.isPending && <Spinner />}Add domain</button>
      </div>
    </Modal>
  );
}

export function BulkDomainsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [text, setText] = useState("");
  const [clientId, setClientId] = useState("");
  const [results, setResults] = useState<Array<{ input: string; status: string; message?: string }> | null>(null);
  const save = useInfraMutation((c, body: { domains: string[]; clientId: string | null }) => infraApi.bulkDomains(c, body), { success: (r) => `${r.created} domain${r.created === 1 ? "" : "s"} added.` });
  const submit = () => {
    const domains = [...new Set(text.split(/[\s,;]+/).map((d) => d.trim()).filter(Boolean))];
    if (!domains.length) return;
    save.mutate({ domains: domains.slice(0, 200), clientId: clientId || null }, { onSuccess: (r) => setResults(r.results) });
  };
  return (
    <Modal open={open} onOpenChange={(o) => { if (!o) setResults(null); onOpenChange(o); }} wide title="Bulk import domains" description="Paste up to 200 domains, separated by spaces, commas or new lines.">
      {!results ? (
        <>
          <FormRow label="Domains">{(id) => <textarea id={id} className={textarea} rows={8} value={text} onChange={(e) => setText(e.target.value)} placeholder={"example.com\nexample.in\nbrand.store"} />}</FormRow>
          <div className="flex justify-end gap-2">
            <button type="button" className={btn} onClick={() => onOpenChange(false)}>Cancel</button>
            <button type="button" className={btnPrimary} onClick={submit} disabled={save.isPending || !text.trim()}>{save.isPending && <Spinner />}Import</button>
          </div>
        </>
      ) : (
        <>
          <ul className="max-h-72 divide-y divide-slate-100 overflow-y-auto rounded-sm border border-slate-200 text-xs">
            {results.map((r, i) => (
              <li key={`${r.input}-${i}`} className="flex items-start justify-between gap-3 px-3 py-2">
                <span className="break-all font-semibold text-slate-800">{r.input}</span>
                <span className={r.status === "created" ? "text-emerald-700" : r.status === "duplicate" ? "text-amber-700" : "text-rose-700"}>{r.status === "created" ? "Added" : r.message ?? r.status}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-end"><button type="button" className={btnPrimary} onClick={() => { setResults(null); setText(""); onOpenChange(false); }}>Done</button></div>
        </>
      )}
    </Modal>
  );
}

/* ------------------------------------------------------------ subscription */

type AssetOption = { id: string; name: string; type: string };

export function SubscriptionDialog({ open, onOpenChange, assetId, assetOptions, existing }: { open: boolean; onOpenChange: (o: boolean) => void; assetId?: string; assetOptions?: AssetOption[]; existing?: Subscription | SubscriptionRow | null }) {
  const e = existing;
  const [f, setF] = useState(() => ({
    assetId: assetId ?? "", kind: e?.kind ?? "", label: e?.label ?? "", providerName: ("providerName" in (e ?? {}) ? (e as Subscription).providerName : (e as SubscriptionRow | undefined)?.provider) ?? "",
    cycle: e?.cycle ?? "MONTHLY", customIntervalMonths: e?.customIntervalMonths?.toString() ?? "", currency: (e?.currency as string | undefined) ?? "INR", amount: e?.amount?.toString() ?? "",
    autoRenew: e?.autoRenew ?? "UNKNOWN", paymentStatus: (e?.paymentStatus as string | undefined) ?? "UNKNOWN", lastPaymentDate: e?.lastPaymentDate ?? "", nextDueDate: e?.nextDueDate ?? "",
    renewalDate: e?.renewalDate ?? "", expirationDate: e?.expirationDate ?? "", invoiceRef: (e?.invoiceRef as string | null | undefined) ?? "", billingAccount: (e?.billingAccount as string | null | undefined) ?? "", notes: (e?.notes as string | null | undefined) ?? "",
    confirmed: true,
  }));
  const [err, setErr] = useState<string | null>(null);
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));
  const save = useInfraMutation((c, body: Record<string, unknown>) => infraApi.saveSubscription(c, e?.id ?? null, body), { success: e ? "Subscription updated." : "Subscription saved." });
  const submit = () => {
    if (!e && !f.assetId) return setErr("Choose the asset this subscription belongs to.");
    if (f.cycle === "CUSTOM" && !f.customIntervalMonths) return setErr("Enter the custom cycle length in months.");
    if (!/^[A-Za-z]{3}$/.test(f.currency)) return setErr("Currency must be a 3-letter code such as INR or USD.");
    setErr(null);
    const date = (v: string) => (v ? v : null);
    const body: Record<string, unknown> = {
      ...(e ? {} : { assetId: f.assetId }), ...(f.kind ? { kind: f.kind } : {}), label: nullable(f.label), providerName: nullable(f.providerName), billingAccount: nullable(f.billingAccount),
      cycle: f.cycle, customIntervalMonths: f.cycle === "CUSTOM" ? Number(f.customIntervalMonths) : null, currency: f.currency.toUpperCase(), amount: num(f.amount), autoRenew: f.autoRenew,
      paymentStatus: f.paymentStatus, lastPaymentDate: date(f.lastPaymentDate), nextDueDate: date(f.nextDueDate), renewalDate: date(f.renewalDate), expirationDate: date(f.expirationDate),
      invoiceRef: nullable(f.invoiceRef), notes: nullable(f.notes), datesConfirmed: f.confirmed,
    };
    save.mutate(body, { onSuccess: () => onOpenChange(false), onError: (er) => setErr(errorMessage(er)) });
  };
  return (
    <Modal open={open} onOpenChange={onOpenChange} wide title={e ? "Edit subscription" : "Add a subscription"} description="Every date is optional and stored on its own. Leave a date empty if it is not known: it will be shown as not available.">
      <div className="grid gap-3 sm:grid-cols-2">
        {!e && (
          <FormRow label="Asset *">
            {(id) => (
              <select id={id} className={field} value={f.assetId} onChange={(ev) => set("assetId", ev.target.value)} disabled={Boolean(assetId)}>
                <option value="">Choose a server or domain…</option>
                {(assetOptions ?? []).map((a) => <option key={a.id} value={a.id}>{a.name} ({a.type.toLowerCase()})</option>)}
              </select>
            )}
          </FormRow>
        )}
        <FormRow label="Type">{(id) => <select id={id} className={field} value={f.kind} onChange={(ev) => set("kind", ev.target.value)}><option value="">Automatic</option>{Object.entries(KIND_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>}</FormRow>
        <FormRow label="Label">{(id) => <TextInput id={id} value={f.label} onChange={(ev) => set("label", ev.target.value)} placeholder="e.g. VPS S SSD · 12 months" />}</FormRow>
        <FormRow label="Provider / registrar">{(id) => <TextInput id={id} value={f.providerName} onChange={(ev) => set("providerName", ev.target.value)} />}</FormRow>
        <FormRow label="Billing cycle">{(id) => <select id={id} className={field} value={f.cycle} onChange={(ev) => set("cycle", ev.target.value as never)}>{Object.entries(CYCLE_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>}</FormRow>
        {f.cycle === "CUSTOM" && <FormRow label="Cycle length (months)">{(id) => <TextInput id={id} inputMode="numeric" value={f.customIntervalMonths} onChange={(ev) => set("customIntervalMonths", ev.target.value)} />}</FormRow>}
        <FormRow label="Amount per cycle">{(id) => <TextInput id={id} inputMode="decimal" value={f.amount} onChange={(ev) => set("amount", ev.target.value)} placeholder="Leave empty if unknown" />}</FormRow>
        <FormRow label="Currency">{(id) => <TextInput id={id} value={f.currency} maxLength={3} onChange={(ev) => set("currency", ev.target.value.toUpperCase())} />}</FormRow>
        <FormRow label="Next payment due">{(id) => <TextInput id={id} type="date" value={f.nextDueDate} onChange={(ev) => set("nextDueDate", ev.target.value)} />}</FormRow>
        <FormRow label="Last payment date">{(id) => <TextInput id={id} type="date" value={f.lastPaymentDate} onChange={(ev) => set("lastPaymentDate", ev.target.value)} />}</FormRow>
        <FormRow label="Subscription renewal date">{(id) => <TextInput id={id} type="date" value={f.renewalDate} onChange={(ev) => set("renewalDate", ev.target.value)} />}</FormRow>
        <FormRow label="Service expiration date" hint="Only when explicitly known, e.g. from an invoice.">{(id) => <TextInput id={id} type="date" value={f.expirationDate} onChange={(ev) => set("expirationDate", ev.target.value)} />}</FormRow>
        <FormRow label="Auto-renew">{(id) => <select id={id} className={field} value={f.autoRenew} onChange={(ev) => set("autoRenew", ev.target.value as never)}>{Object.entries(TRI_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>}</FormRow>
        <FormRow label="Payment status">{(id) => <select id={id} className={field} value={f.paymentStatus} onChange={(ev) => set("paymentStatus", ev.target.value)}>{Object.entries(PAYMENT_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>}</FormRow>
        <FormRow label="Invoice reference">{(id) => <TextInput id={id} value={f.invoiceRef} onChange={(ev) => set("invoiceRef", ev.target.value)} />}</FormRow>
        <FormRow label="Billing account">{(id) => <TextInput id={id} value={f.billingAccount} onChange={(ev) => set("billingAccount", ev.target.value)} />}</FormRow>
      </div>
      <label className="flex items-start gap-2 text-xs font-medium text-slate-700">
        <input type="checkbox" className="mt-0.5" checked={f.confirmed} onChange={(ev) => set("confirmed", ev.target.checked)} />
        <span>I have confirmed these dates (from the provider, an invoice or the registrar). Unconfirmed estimates are shown as such and do not trigger reminders.</span>
      </label>
      <FormRow label="Notes">{(id) => <textarea id={id} className={textarea} rows={2} value={f.notes} onChange={(ev) => set("notes", ev.target.value)} />}</FormRow>
      {err && <Notice tone="red" title={err} />}
      <div className="flex justify-end gap-2">
        <button type="button" className={btn} onClick={() => onOpenChange(false)}>Cancel</button>
        <button type="button" className={btnPrimary} onClick={submit} disabled={save.isPending}>{save.isPending && <Spinner />}Save</button>
      </div>
    </Modal>
  );
}

export function PaymentDialog({ open, onOpenChange, subscription, assetName }: { open: boolean; onOpenChange: (o: boolean) => void; subscription: { id: string; nextDueDate: string | null; amount?: number | null; currency?: string | null }; assetName: string }) {
  const today = new Date().toISOString().slice(0, 10);
  const [covers, setCovers] = useState(subscription.nextDueDate ?? "");
  const [paidAt, setPaidAt] = useState(today);
  const [amount, setAmount] = useState(subscription.amount?.toString() ?? "");
  const [invoiceRef, setInvoiceRef] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const save = useInfraMutation(
    (c, body: Record<string, unknown>) => infraApi.confirmPayment(c, subscription.id, body),
    { success: (r) => (r.advanced ? `Payment recorded. Next due ${r.nextDueDate}.` : "Payment recorded.") },
  );
  const submit = () => {
    if (!covers || !paidAt || amount === "") return setErr("Enter the due date, payment date and amount.");
    setErr(null);
    save.mutate({ coversDueDate: covers, paidAt, amount: Number(amount), currency: subscription.currency ?? undefined, invoiceRef: nullable(invoiceRef) ?? undefined }, {
      onSuccess: () => onOpenChange(false),
      onError: (e) => setErr(errorMessage(e)),
    });
  };
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Confirm a payment" description={`Record that ${assetName} was actually paid. Receiving an invoice is not a payment.`}>
      <FormRow label="Due date being paid *" hint="When this matches the current due date, the next due date moves forward by one billing cycle.">{(id) => <TextInput id={id} type="date" value={covers} onChange={(e) => setCovers(e.target.value)} />}</FormRow>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormRow label="Paid on *">{(id) => <TextInput id={id} type="date" value={paidAt} max={today} onChange={(e) => setPaidAt(e.target.value)} />}</FormRow>
        <FormRow label={`Amount paid *${subscription.currency ? ` (${subscription.currency})` : ""}`}>{(id) => <TextInput id={id} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />}</FormRow>
      </div>
      <FormRow label="Invoice / receipt reference">{(id) => <TextInput id={id} value={invoiceRef} onChange={(e) => setInvoiceRef(e.target.value)} />}</FormRow>
      {err && <Notice tone="red" title={err} />}
      <div className="flex justify-end gap-2">
        <button type="button" className={btn} onClick={() => onOpenChange(false)}>Cancel</button>
        <button type="button" className={btnPrimary} onClick={submit} disabled={save.isPending}>{save.isPending && <Spinner />}Confirm payment</button>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------- connections */

export function ConnectionDialog({ open, onOpenChange, provider, connection }: { open: boolean; onOpenChange: (o: boolean) => void; provider: ProviderCatalogueEntry; connection?: Connection | null }) {
  const [label, setLabel] = useState(connection?.label ?? `${provider.label} account`);
  const [values, setValues] = useState<Record<string, string>>({});
  const [err, setErr] = useState<string | null>(null);
  const create = useInfraMutation(
    (c, body: { label: string; credentials?: Record<string, string> }) => (connection ? infraApi.replaceCredentials(c, connection.id, body.credentials ?? {}) : infraApi.createConnection(c, { provider: provider.key, ...body })),
    { success: (r) => (r.status === "CONNECTED" ? "Connected." : "Saved. The provider did not accept the credentials; see the connection status.") },
  );
  const hasAll = provider.credentialFields.every((f) => (values[f.key] ?? "").trim());
  const submit = (withCredentials: boolean) => {
    if (!label.trim()) return setErr("Give the connection a name.");
    if (withCredentials && !hasAll) return setErr("Fill in every credential field, or save without credentials to add them later.");
    setErr(null);
    create.mutate({ label: label.trim(), ...(withCredentials ? { credentials: values } : {}) }, { onSuccess: () => { setValues({}); onOpenChange(false); }, onError: (e) => setErr(errorMessage(e)) });
  };
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={connection ? `Replace ${provider.label} credentials` : `Connect ${provider.label}`} description="Credentials are encrypted on the server and never shown again. Access is read-only: this module cannot start, stop, reinstall or delete servers.">
      {!connection && <FormRow label="Connection name">{(id) => <TextInput id={id} value={label} onChange={(e) => setLabel(e.target.value)} />}</FormRow>}
      {provider.credentialFields.map((f) => (
        <FormRow key={f.key} label={f.label}>
          {(id) => <TextInput id={id} type={f.secret ? "password" : "text"} autoComplete="off" spellCheck={false} value={values[f.key] ?? ""} onChange={(e) => setValues((p) => ({ ...p, [f.key]: e.target.value }))} />}
        </FormRow>
      ))}
      {err && <Notice tone="red" title={err} />}
      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" className={btn} onClick={() => onOpenChange(false)}>Cancel</button>
        {!connection && <button type="button" className={btn} onClick={() => submit(false)} disabled={create.isPending}>Save without credentials</button>}
        <button type="button" className={btnPrimary} onClick={() => submit(true)} disabled={create.isPending}>{create.isPending && <Spinner />}Save &amp; test</button>
      </div>
    </Modal>
  );
}

export { providerName };
