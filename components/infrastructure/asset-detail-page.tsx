"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Archive, ArrowLeft, CheckCircle2, CreditCard, Pencil, Plus, RefreshCw, RotateCcw, Terminal, Trash2 } from "lucide-react";
import { PaymentDialog, ServerDialog, SubscriptionDialog } from "./dialogs";
import { infraApi } from "./api";
import { CYCLE_LABEL, ENV_LABEL, KIND_LABEL, PAYMENT_LABEL, rdapInfo, SERVER_TYPE_LABEL, TRI_LABEL, daysLabel, formatDateTime, formatMoney, formatRam, formatRelative, formatStorage, providerName } from "./format";
import { errorMessage, useAsset, useInfraCapabilities, useInfraMutation } from "./hooks";
import { Chip, ConfirmButton, DateValue, EmptyState, KeyValue, Notice, Section, Skeleton, Spinner, Td, Th, btn, btnPrimary, useRoleFlags } from "./ui";
import type { AssetDetail, Certificate, Subscription } from "./types";
import { useMonitoring } from "./monitoring-api";
import { DomainHealthCard } from "./domain-health";
import { ContainersTab, MonitoringSetupDialog, NetworkTab, OsTab, PerformanceTab, ProviderTab, SecurityTab, ServerOverview, StorageTab } from "./server-monitoring";

type Tab = "overview" | "performance" | "storage" | "config" | "network" | "os" | "containers" | "security" | "links" | "billing" | "provider" | "history" | "activity";

export function AssetDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const q = useAsset(id);
  const caps = useInfraCapabilities();
  const { canWrite, canManage, canBill } = useRoleFlags();
  const [tab, setTab] = useState<Tab>("overview");
  const [editing, setEditing] = useState(false);
  const [setup, setSetup] = useState(false);
  const [subDialog, setSubDialog] = useState<{ open: boolean; existing?: Subscription | null }>({ open: false });
  const [payFor, setPayFor] = useState<Subscription | null>(null);
  const refresh = useInfraMutation((c, _: void) => infraApi.refresh(c, id), { success: "Checks finished." });
  const archive = useInfraMutation((c, archived: boolean) => (archived ? infraApi.archive(c, id) : infraApi.restore(c, id)), { success: "Updated." });
  const remove = useInfraMutation((c, _: void) => infraApi.remove(c, id), { success: "Asset deleted." });

  const monitoring = useMonitoring(id, q.data?.type === "SERVER");

  if (q.isLoading) return <div className="space-y-1"><Skeleton className="h-24" /><Skeleton className="h-64" /></div>;
  if (q.isError || !q.data) {
    return (
      <div className="space-y-1">
        <Link href="/infrastructure" className={btn}><ArrowLeft className="size-3.5" />Back</Link>
        <Notice tone="red" title="This asset could not be opened">{errorMessage(q.error, "It may have been deleted.")}</Notice>
      </div>
    );
  }
  const a = q.data;
  const isDomain = a.type === "DOMAIN";
  const back = isDomain ? "/infrastructure/domains" : "/infrastructure/servers";
  const domainTabs: Array<{ id: Tab; label: string }> = [
    { id: "overview", label: "Overview" },
    { id: "config", label: "Registration & DNS" },
    { id: "network", label: "SSL" },
    { id: "links", label: "Linked assets" },
    { id: "billing", label: "Billing & renewal" },
    { id: "provider", label: "Provider" },
    { id: "history", label: "Sync history" },
    { id: "activity", label: "Activity" },
  ];
  const serverTabs: Array<{ id: Tab; label: string }> = [
    { id: "overview", label: "Overview" },
    { id: "performance", label: "Performance" },
    { id: "storage", label: "Storage" },
    { id: "network", label: "Network" },
    { id: "os", label: "OS & Services" },
    { id: "containers", label: "Docker & Containers" },
    { id: "security", label: "Security" },
    { id: "provider", label: "Provider & Snapshots" },
    { id: "billing", label: "Billing & Renewals" },
    { id: "activity", label: "Alerts & History" },
  ];
  const tabs = isDomain ? domainTabs : serverTabs;

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href={back} className="mb-1 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900"><ArrowLeft className="size-3.5" />{isDomain ? "Domains" : "Servers"}</Link>
          <h2 className="truncate text-lg font-semibold tracking-tight text-slate-900">{a.domain?.unicodeName ?? a.name}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Chip>{ENV_LABEL[a.environment]}</Chip>
            <Chip tone={a.source === "provider_api" ? "green" : "slate"}>{a.source === "provider_api" ? "Imported from provider" : "Manually managed"}</Chip>
            {a.archivedAt && <Chip tone="amber">Archived</Chip>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isDomain && canWrite && <button type="button" className={btn} onClick={() => refresh.mutate()} disabled={refresh.isPending}>{refresh.isPending ? <Spinner /> : <RefreshCw className="size-3.5" />}Refresh now</button>}
          {canManage && !isDomain && <button type="button" className={btn} onClick={() => setSetup(true)}><Terminal className="size-3.5" />Monitoring setup</button>}
          {canWrite && !isDomain && <button type="button" className={btn} onClick={() => setEditing(true)}><Pencil className="size-3.5" />Edit</button>}
          {canWrite && (a.archivedAt ? (
            <>
              <button type="button" className={btn} onClick={() => archive.mutate(false)}><RotateCcw className="size-3.5" />Restore</button>
              <ConfirmButton label={<><Trash2 className="size-3.5" />Delete</>} confirmLabel="Delete permanently" onConfirm={() => remove.mutate(undefined, { onSuccess: () => router.push(back) })} />
            </>
          ) : (
            <ConfirmButton label={<><Archive className="size-3.5" />Archive</>} confirmLabel="Archive asset" onConfirm={() => archive.mutate(true)} />
          ))}
        </div>
      </div>

      <div role="tablist" aria-label="Asset sections" className="flex gap-1 overflow-x-auto border-b border-slate-200">
        {tabs.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={`shrink-0 border-b-2 px-3 py-2 text-xs font-semibold transition ${tab === t.id ? "border-red-600 text-red-600" : "border-transparent text-slate-500 hover:text-slate-900"}`}>{t.label}</button>
        ))}
      </div>

      {tab === "overview" && (isDomain ? <Overview a={a} /> : <ServerOverview asset={a} canManage={canManage} onSetup={() => setSetup(true)} />)}
      {tab === "performance" && <PerformanceTab assetId={a.id} canManage={canManage} onSetup={() => setSetup(true)} />}
      {tab === "storage" && <StorageTab asset={a} canManage={canManage} onSetup={() => setSetup(true)} />}
      {tab === "os" && <OsTab asset={a} canManage={canManage} onSetup={() => setSetup(true)} />}
      {tab === "containers" && <ContainersTab assetId={a.id} canManage={canManage} onSetup={() => setSetup(true)} />}
      {tab === "security" && <SecurityTab asset={a} canManage={canManage} onSetup={() => setSetup(true)} />}
      {tab === "config" && isDomain && <DomainRegistration a={a} canSeeSensitive={Boolean(caps.data?.sensitiveDns)} />}
      {tab === "network" && (isDomain ? <CertificateList a={a} canWrite={canWrite} /> : <NetworkTab asset={a} canManage={canManage} onSetup={() => setSetup(true)} />)}
      {tab === "links" && <Links a={a} />}
      {tab === "billing" && <Billing a={a} canManage={canBill} canSee={Boolean(caps.data?.billingRead)} onAdd={() => setSubDialog({ open: true })} onEdit={(s) => setSubDialog({ open: true, existing: s })} onPay={setPayFor} />}
      {tab === "provider" && (isDomain ? <ProviderInfo a={a} /> : <ProviderTab asset={a} canManage={canManage} />)}
      {tab === "history" && <SyncHistory a={a} />}
      {tab === "activity" && (isDomain ? <Activity a={a} /> : <div className="space-y-1"><SyncHistory a={a} /><Activity a={a} /></div>)}

      {editing && <ServerDialog open onOpenChange={setEditing} asset={a} />}
      {setup && <MonitoringSetupDialog open onOpenChange={setSetup} assetId={a.id} assetName={a.name} status={monitoring.data} />}
      {subDialog.open && <SubscriptionDialog open onOpenChange={(o) => setSubDialog((s) => ({ ...s, open: o }))} assetId={a.id} existing={subDialog.existing} />}
      {payFor && <PaymentDialog open onOpenChange={(o) => !o && setPayFor(null)} subscription={payFor} assetName={a.name} />}
    </div>
  );
}

function Overview({ a }: { a: AssetDetail }) {
  const exp = a.domain?.effectiveExpiry;
  return (
    <div className="space-y-1">
    {a.domain && <DomainHealthCard asset={a} />}
    <div className="grid gap-1 lg:grid-cols-2">
      <Section title="Identity">
        <KeyValue
          rows={[
            { label: "Business name", value: a.name },
            { label: "Technical identifier", value: a.technicalId },
            { label: "Provider", value: providerName(a.provider) },
            { label: "Owner / contact", value: [a.ownerName, a.ownerEmail].filter(Boolean).join(" · ") || null },
            { label: "Tags", value: a.tags.length ? a.tags.join(", ") : null },
            { label: "Created", value: formatDateTime(a.createdAt) },
            { label: "Notes", value: a.notes },
          ]}
        />
      </Section>
      <Section title={a.domain ? "Registration" : "Status"}>
        {a.domain ? (
          <KeyValue
            rows={[
              { label: "Expiry", value: <DateValue date={exp?.date ?? null} source={exp?.source} verified={exp?.verified} unknownText="Unknown: no source has confirmed it" /> },
              { label: "Registrar", value: a.domain.registrar },
              { label: "Registry lookup", value: <Chip tone={rdapInfo(a.domain.rdapState).tone}>{rdapInfo(a.domain.rdapState).label}</Chip> },
              { label: "Last checked", value: a.domain.rdapCheckedAt ? formatRelative(a.domain.rdapCheckedAt) : "Not yet" },
            ]}
          />
        ) : (
          <KeyValue
            rows={[
              { label: "Provider-reported status", value: a.server?.providerStatus ?? "Not reported" },
              { label: "Last synchronised", value: a.server?.lastSyncedAt ? formatRelative(a.server.lastSyncedAt) : "Never (manual entry)" },
              { label: "Provisioned", value: `${a.server?.vcpu ?? "?"} vCPU · ${formatRam(a.server?.ramMb ?? null)} · ${formatStorage(a.server?.storageGb ?? null)}` },
            ]}
          />
        )}
      </Section>
    </div>
    </div>
  );
}

function ServerConfig({ a }: { a: AssetDetail }) {
  const s = a.server;
  if (!s) return null;
  return (
    <Section title="Configuration" description="Provisioned capacity. This is not live CPU, memory or disk usage.">
      <KeyValue
        rows={[
          { label: "Server type", value: SERVER_TYPE_LABEL[s.serverType] ?? s.serverType },
          { label: "Plan / product", value: s.planName },
          { label: "Operating system", value: s.operatingSystem },
          { label: "vCPU", value: s.vcpu },
          { label: "RAM", value: s.ramMb === null ? null : formatRam(s.ramMb) },
          { label: "Storage", value: s.storageGb === null ? null : `${formatStorage(s.storageGb)}${s.storageType ? ` (${s.storageType})` : ""}` },
          { label: "Region", value: s.region },
          { label: "Datacenter", value: s.datacenter },
          { label: "Created at provider", value: s.providerCreatedAt ? formatDateTime(s.providerCreatedAt) : null },
          { label: "Provider status", value: s.providerStatus },
          { label: "Suspension", value: s.providerSuspended === null ? "Not reported by provider" : s.providerSuspended ? "Suspended" : "Not suspended" },
        ]}
      />
    </Section>
  );
}

function ServerNetwork({ a }: { a: AssetDetail }) {
  const s = a.server;
  if (!s) return null;
  return (
    <Section title="Networking">
      <KeyValue
        rows={[
          { label: "Hostname", value: s.hostname },
          { label: "Public IPv4", value: s.ipv4 },
          { label: "Public IPv6", value: s.ipv6 },
          { label: "Additional IPs", value: s.additionalIps.length ? s.additionalIps.join(", ") : null },
        ]}
      />
    </Section>
  );
}

function DomainRegistration({ a, canSeeSensitive }: { a: AssetDetail; canSeeSensitive: boolean }) {
  const d = a.domain!;
  const latest = a.dnsHistory[0];
  const st = rdapInfo(d.rdapState);
  return (
    <div className="space-y-1">
      <Section title="Registration (RDAP)" description={d.rdapSource ? `Source: ${d.rdapSource}` : "Source: public registry RDAP service"}>
        <div className="mb-3"><Chip tone={st.tone}>{st.label}</Chip> <span className="text-[11px] font-medium text-slate-500">{d.rdapError ?? st.hint}</span></div>
        <KeyValue
          rows={[
            { label: "Registrar", value: d.registrar },
            { label: "Registered", value: d.registeredAt ? formatDateTime(d.registeredAt) : null },
            { label: "Registry expiration", value: d.registryExpiresAt ? formatDateTime(d.registryExpiresAt) : null },
            { label: "Registrar expiration", value: d.registrarExpiresAt ? formatDateTime(d.registrarExpiresAt) : null },
            { label: "Last registry update", value: d.rdapUpdatedAt ? formatDateTime(d.rdapUpdatedAt) : null },
            { label: "DNSSEC", value: d.dnssec === null ? null : d.dnssec ? "Signed" : "Not signed" },
            { label: "Status codes", value: d.statuses.length ? d.statuses.join(", ") : null },
            { label: "Registered nameservers", value: d.nameservers.length ? d.nameservers.join(", ") : null },
            { label: "Last checked", value: d.rdapCheckedAt ? formatDateTime(d.rdapCheckedAt) : "Not yet" },
          ]}
        />
      </Section>
      <Section title="DNS records" description={latest ? `Checked ${formatDateTime(latest.checkedAt)}` : d.dnsCheckedAt ? `Checked ${formatDateTime(d.dnsCheckedAt)}` : "Not checked yet"}>
        {d.dnsError && <div className="mb-3"><Notice tone="amber" title="Some record types could not be looked up">{d.dnsError}</Notice></div>}
        {!latest ? (
          <EmptyState title="No DNS snapshot yet" description="The first snapshot is taken shortly after the domain is added, or use Refresh now." />
        ) : (
          <div className="space-y-4 text-xs">
            {latest.records.txtRedacted && !canSeeSensitive && <Notice tone="blue" title="TXT contents are hidden">SPF, DKIM and verification tokens are only shown to Owners and Admins.</Notice>}
            <RecordGroup name="A" values={latest.records.A} />
            <RecordGroup name="AAAA" values={latest.records.AAAA} />
            <RecordGroup name="CNAME" values={latest.records.CNAME} />
            <RecordGroup name="MX" values={latest.records.MX.map((m) => `${m.priority} ${m.exchange}`)} />
            <RecordGroup name="NS" values={latest.records.NS} />
            <RecordGroup name="TXT" values={latest.records.TXT} />
            <RecordGroup name="DMARC" values={latest.records.DMARC ?? []} />
            <RecordGroup name="CAA" values={latest.records.CAA.map((c) => `${c.tag} "${c.value}"${c.critical ? " (critical)" : ""}`)} />
            {latest.records.SOA && <RecordGroup name="SOA" values={[`${latest.records.SOA.nsname} ${latest.records.SOA.hostmaster} (serial ${latest.records.SOA.serial})`]} />}
          </div>
        )}
      </Section>
      {a.dnsPosture && (
        <Section title="Email & DNS configuration" description="Presence of common safeguards in the latest snapshot. Not found is informational: many domains send no mail.">
          <KeyValue rows={[
            { label: "SPF", value: a.dnsPosture.spf.present ? `Present (${{ fail: "hard fail", softfail: "soft fail", neutral: "neutral", pass: "allows all", none: "" }[a.dnsPosture.spf.qualifier ?? "none"] || "policy set"})` : "Not found" },
            { label: "DMARC", value: a.dnsPosture.dmarc.present === null ? "Not checked yet (next refresh)" : a.dnsPosture.dmarc.present ? `Present${a.dnsPosture.dmarc.policy ? ` · policy ${a.dnsPosture.dmarc.policy}` : ""}` : "Not found" },
            { label: "CAA", value: a.dnsPosture.caa.present ? `Present · ${a.dnsPosture.caa.issuers} issuer rule${a.dnsPosture.caa.issuers === 1 ? "" : "s"}` : "Not found" },
            { label: "MX (receives mail)", value: a.dnsPosture.mx.present ? "Yes" : "No MX records" },
            { label: "DKIM", value: a.dnsPosture.dkim.note },
          ]} />
        </Section>
      )}
      <Section title="DNS change history" flush>
        {a.dnsHistory.filter((h) => h.changed).length === 0 ? (
          <EmptyState title="No DNS changes detected" description="Changes are listed here when a later check differs from the previous snapshot." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {a.dnsHistory.filter((h) => h.changed).map((h) => (
              <li key={h.id} className="px-4 py-3 text-xs">
                <p className="font-semibold text-slate-900">{formatDateTime(h.checkedAt)}</p>
                <ul className="mt-1 space-y-0.5">
                  {h.changes.map((c) => (
                    <li key={c.type} className="text-slate-600">
                      <span className="font-semibold">{c.type}</span>: {c.added.length} added{c.added.length && c.type !== "TXT" ? ` (${c.added.join(", ")})` : ""}, {c.removed.length} removed{c.removed.length && c.type !== "TXT" ? ` (${c.removed.join(", ")})` : ""}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

function RecordGroup({ name, values }: { name: string; values: string[] }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[72px_1fr]">
      <span className="font-semibold text-slate-500">{name}</span>
      {values.length === 0 ? <span className="text-slate-400">None</span> : <ul className="space-y-0.5 break-all font-mono normal-case text-[11.5px] text-slate-800">{values.map((v, i) => <li key={`${v}-${i}`}>{v}</li>)}</ul>}
    </div>
  );
}

function CertificateList({ a, canWrite }: { a: AssetDetail; canWrite: boolean }) {
  const [host, setHost] = useState("");
  const add = useInfraMutation((c, hostname: string) => infraApi.addCertificate(c, { assetId: a.id, hostname }), { success: "Certificate added and checked." });
  const check = useInfraMutation((c, id: string) => infraApi.refreshCertificate(c, id), { success: "Certificate checked." });
  return (
    <Section title="SSL certificates" description="Read from the live TLS handshake. A certificate is not treated as renewed until it is checked again." flush
      action={canWrite ? (
        <form className="flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); if (host.trim()) add.mutate(host.trim(), { onSuccess: () => setHost("") }); }}>
          <input aria-label="Hostname" className="h-8 w-48 rounded-sm border border-slate-300 px-2 text-xs" placeholder={`www.${a.domain?.fqdn ?? "example.com"}`} value={host} onChange={(e) => setHost(e.target.value)} />
          <button type="submit" className={btn} disabled={add.isPending}><Plus className="size-3.5" />Add host</button>
        </form>
      ) : undefined}>
      {a.certificates.length === 0 ? <EmptyState title="No certificate is monitored yet" description="The apex hostname is added automatically; add a subdomain above." /> : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead><tr><Th>Host</Th><Th>Issuer</Th><Th>Valid until</Th><Th>Remaining</Th><Th>Verification</Th><Th>Checked</Th><Th /></tr></thead>
            <tbody>{a.certificates.map((c) => <CertRow key={c.id} c={c} canWrite={canWrite} onCheck={() => check.mutate(c.id)} />)}</tbody>
          </table>
        </div>
      )}
    </Section>
  );
}

export function CertRow({ c, canWrite, onCheck }: { c: Certificate; canWrite: boolean; onCheck: () => void }) {
  const tone = c.state === "VALID" ? "green" : c.state === "EXPIRING" ? "amber" : c.state === "EXPIRED" ? "red" : "slate";
  return (
    <tr>
      <Td><span className="font-semibold normal-case text-slate-900">{c.hostname}</span>{c.port !== 443 ? `:${c.port}` : ""}{c.sans.length > 1 && <div className="text-[11px] text-slate-500" title={c.sans.join(", ")}>{c.sans.length} names</div>}</Td>
      <Td>{c.issuer ?? <span className="text-slate-400">Not available</span>}</Td>
      <Td>{c.validTo ? <DateValue date={c.validTo} source="tls_probe" verified /> : <span className="text-slate-400">Not available</span>}</Td>
      <Td>{c.daysRemaining !== null ? <Chip tone={tone}>{c.state === "EXPIRED" ? "Expired" : daysLabel(c.daysRemaining)}</Chip> : <Chip>Unknown</Chip>}</Td>
      <Td>{c.trusted === null ? "—" : c.trusted ? <Chip tone="green">Trusted</Chip> : <Chip tone="red">{c.verifyError ?? "Not trusted"}</Chip>}{c.lastError && <div className="mt-0.5 text-[11px] text-rose-700">{c.lastError}</div>}</Td>
      <Td>{c.lastCheckedAt ? formatRelative(c.lastCheckedAt) : "Not yet"}</Td>
      <Td>{canWrite && <button type="button" className={btn} onClick={onCheck}><RefreshCw className="size-3.5" />Check</button>}</Td>
    </tr>
  );
}

function Links({ a }: { a: AssetDetail }) {
  const empty = a.relations.length === 0 && a.linkedWebsites.length === 0;
  return (
    <Section title="Linked assets and websites" flush>
      {empty ? <EmptyState title="Nothing is linked yet" description="Linked servers, domains and the client websites that use this domain appear here." /> : (
        <ul className="divide-y divide-slate-100 text-xs">
          {a.linkedWebsites.map((w) => <li key={w.clientId} className="flex justify-between gap-3 px-4 py-2.5"><span className="font-semibold text-slate-900">{w.clientName}</span><span className="text-slate-500">Website · {w.url}</span></li>)}
          {a.relations.map((r) => (
            <li key={r.id} className="flex justify-between gap-3 px-4 py-2.5">
              <Link href={`/infrastructure/assets/${r.asset.id}`} className="font-semibold text-slate-900 hover:text-red-700">{r.asset.name}</Link>
              <span className="text-slate-500">{r.direction === "out" ? r.kind.toLowerCase().replace("_", " ") : `is ${r.kind.toLowerCase().replace("_", " ")} by`} · {r.asset.type.toLowerCase()}</span>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

function Billing({ a, canManage, canSee, onAdd, onEdit, onPay }: { a: AssetDetail; canManage: boolean; canSee: boolean; onAdd: () => void; onEdit: (s: Subscription) => void; onPay: (s: Subscription) => void }) {
  return (
    <div className="space-y-1">
      {!canSee && <Notice tone="blue" title="Amounts and payment details are hidden">Your role does not include billing access. Dates remain visible.</Notice>}
      {a.domain && (
        <Notice tone="blue" title="Domain expiry, registrar billing and DNS-hosting billing are separate dates">
          The registry expiry above comes from RDAP. Add a subscription here to track what you pay your registrar or DNS host. Entering an expiry on a domain subscription is treated as an administrative override and is labelled as manual.
        </Notice>
      )}
      <Section title="Subscriptions" flush action={canManage ? <button type="button" className={btnPrimary} onClick={onAdd}><Plus className="size-3.5" />Add subscription</button> : undefined}>
        {a.subscriptions.length === 0 ? (
          <EmptyState icon={CreditCard} title="No billing information yet" description="Renewal and due dates are never guessed. Add a subscription to track them." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {a.subscriptions.map((s) => (
              <li key={s.id} className="space-y-3 px-4 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{s.label || KIND_LABEL[s.kind] || s.kind}{s.providerName ? ` · ${s.providerName}` : ""}</p>
                    <p className="text-[11px] font-medium text-slate-500">{CYCLE_LABEL[s.cycle]}{s.customIntervalMonths ? ` (${s.customIntervalMonths} months)` : ""} · Auto-renew {TRI_LABEL[s.autoRenew].toLowerCase()}</p>
                  </div>
                  {canManage && (
                    <div className="flex gap-2">
                      {s.nextDueDate && <button type="button" className={btn} onClick={() => onPay(s)}><CheckCircle2 className="size-3.5" />Confirm payment</button>}
                      <button type="button" className={btn} onClick={() => onEdit(s)}><Pencil className="size-3.5" />Edit</button>
                    </div>
                  )}
                </div>
                <KeyValue
                  rows={[
                    { label: "Amount per cycle", value: s.billingHidden ? "Hidden" : formatMoney(s.amount, s.currency) },
                    { label: "Payment status", value: s.paymentStatus ? PAYMENT_LABEL[s.paymentStatus] : "Hidden" },
                    { label: "Next payment due", value: <DateValue date={s.nextDueDate} source={s.dateSources.nextDueDate?.source ?? (s.nextDueDate ? "manual" : undefined)} verified={Boolean(s.dateSources.nextDueDate)} /> },
                    { label: "Subscription renewal", value: <DateValue date={s.renewalDate} source={s.dateSources.renewalDate?.source ?? (s.renewalDate ? "manual" : undefined)} verified={Boolean(s.dateSources.renewalDate)} /> },
                    { label: "Service expiration", value: <DateValue date={s.expirationDate} source={s.dateSources.expirationDate?.source ?? (s.expirationDate ? "manual" : undefined)} verified={Boolean(s.dateSources.expirationDate)} /> },
                    { label: "Last payment", value: s.lastPaymentDate ? <DateValue date={s.lastPaymentDate} /> : null },
                    { label: "Invoice reference", value: s.invoiceRef },
                    { label: "Notes", value: s.notes },
                  ]}
                />
              </li>
            ))}
          </ul>
        )}
      </Section>
      {canSee && (
        <Section title="Payment history" flush>
          {a.billingHistory.length === 0 ? <EmptyState title="No payments recorded" description="Confirmed payments are kept here permanently, one row per billing cycle." /> : (
            <div className="overflow-x-auto"><table className="w-full min-w-[560px] border-collapse"><thead><tr><Th>Paid on</Th><Th>Covers due date</Th><Th>Type</Th><Th>Amount</Th><Th>Reference</Th></tr></thead>
              <tbody>{a.billingHistory.map((r) => <tr key={r.id}><Td><DateValue date={r.paidAt} /></Td><Td>{r.coversDueDate ? <DateValue date={r.coversDueDate} /> : "—"}</Td><Td>{r.kind.toLowerCase()}</Td><Td>{formatMoney(r.amount, r.currency)}</Td><Td>{r.invoiceRef ?? r.note ?? "—"}</Td></tr>)}</tbody></table></div>
          )}
        </Section>
      )}
    </div>
  );
}

function ProviderInfo({ a }: { a: AssetDetail }) {
  const reported = a.server?.networkInfo?.providerReported ?? {};
  return (
    <Section title="Provider information">
      <KeyValue
        rows={[
          { label: "Provider", value: providerName(a.provider) },
          { label: "Connection", value: a.connection?.label ?? "Manual entry (no provider account linked)" },
          { label: "Provider resource ID", value: a.remoteId },
          { label: "Last synchronised", value: a.server?.lastSyncedAt ? formatDateTime(a.server.lastSyncedAt) : null },
          { label: "Sync state", value: a.server?.syncState === "NOT_LISTED" ? "Not in the provider's latest listing (status unchanged)" : a.server?.syncState },
          { label: "Provider-reported cancellation date", value: reported.cancelDate ? `${reported.cancelDate} (a cancellation date, not a renewal date)` : null },
          { label: "Billing / renewal dates", value: a.source === "provider_api" ? "Not available from provider: enter them on the Billing tab" : "Manually managed" },
        ]}
      />
    </Section>
  );
}

function SyncHistory({ a }: { a: AssetDetail }) {
  return (
    <Section title="Sync & check history" flush>
      {a.syncHistory.length === 0 ? <EmptyState title="Nothing recorded yet" /> : (
        <ul className="divide-y divide-slate-100 text-xs">
          {a.syncHistory.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
              <span className="font-semibold text-slate-800">{r.kind.replace(/_/g, " ").toLowerCase()} <span className="font-medium text-slate-500">· {r.trigger}</span></span>
              <span className="flex items-center gap-2">{r.error && <span className="max-w-sm truncate text-[11px] text-slate-500" title={r.error}>{r.error}</span>}<Chip tone={r.status === "SUCCEEDED" ? "green" : r.status === "PARTIAL" ? "amber" : "red"}>{r.status.toLowerCase()}</Chip><span className="text-slate-500">{formatDateTime(r.startedAt)}</span></span>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

function Activity({ a }: { a: AssetDetail }) {
  return (
    <Section title="Activity" description="Changes made to this asset." flush>
      {a.activity.length === 0 ? <EmptyState title="No activity recorded" /> : (
        <ul className="divide-y divide-slate-100 text-xs">
          {a.activity.map((e) => <li key={e.id} className="flex justify-between gap-3 px-4 py-2.5"><span className="font-semibold text-slate-800">{e.action.replace(/^infrastructure\./, "").replace(/[._]/g, " ")}</span><span className="text-slate-500">{e.actor} · {formatDateTime(e.at)}</span></li>)}
        </ul>
      )}
    </Section>
  );
}

