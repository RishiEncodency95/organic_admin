"use client";

import Link from "next/link";
import { useState } from "react";
import { Download, Globe2, Plus, RefreshCw, Server, Upload } from "lucide-react";
import { toast } from "sonner";
import { BulkDomainsDialog, DomainDialog, ServerDialog } from "./dialogs";
import { DomainAnalyticsCharts, DomainSummaryCards } from "./domain-analytics";
import { ENV_LABEL, rdapInfo, daysLabel, daysTone, formatRam, formatRelative, formatStorage, providerName } from "./format";
import { downloadExport, errorMessage, useDomains, useInfraMutation, useScope, useServers } from "./hooks";
import { infraApi } from "./api";
import { Chip, DateValue, EmptyState, ListSkeleton, Notice, Pager, SearchBox, Section, Select, Td, Th, btn, btnPrimary, useRoleFlags } from "./ui";
import type { Asset } from "./types";

const ENV_OPTIONS = [{ value: "", label: "All environments" }, ...Object.entries(ENV_LABEL).map(([value, label]) => ({ value, label }))];

function FilterBar({ q, setQ, env, setEnv, archived, setArchived, children }: { q: string; setQ: (v: string) => void; env: string; setEnv: (v: string) => void; archived: boolean; setArchived: (v: boolean) => void; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-4 py-3">
      <SearchBox value={q} onChange={setQ} placeholder="Search name, host, IP, registrar or tag" />
      <Select label="Environment" value={env} onChange={setEnv} options={ENV_OPTIONS} />
      <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
        <input type="checkbox" checked={archived} onChange={(e) => setArchived(e.target.checked)} />
        Show archived
      </label>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ servers */

export function ServersPage() {
  const { canWrite } = useRoleFlags();
  const [q, setQ] = useState("");
  const [env, setEnv] = useState("");
  const [archived, setArchived] = useState(false);
  const [sort, setSort] = useState("-created");
  const [page, setPage] = useState(1);
  const [adding, setAdding] = useState(false);
  const { companyId } = useScope();
  const list = useServers({ q, environment: env, archived: archived ? "true" : undefined, sort, page, limit: 20 });
  const items = list.data?.items ?? [];

  return (
    <>
      <Section
        title="Servers & hosting"
        description="Provisioned capacity is shown, not live usage. Imported servers refresh from the provider; manual ones are yours to maintain."
        flush
        action={
          <>
            <button type="button" className={btn} onClick={() => void downloadExport(companyId, "servers").catch((e) => toast.error(errorMessage(e)))}><Download className="size-3.5" />Export CSV</button>
            {canWrite && <button type="button" className={btnPrimary} onClick={() => setAdding(true)}><Plus className="size-3.5" />Add server</button>}
          </>
        }
      >
        <FilterBar q={q} setQ={(v) => { setQ(v); setPage(1); }} env={env} setEnv={(v) => { setEnv(v); setPage(1); }} archived={archived} setArchived={(v) => { setArchived(v); setPage(1); }}>
          <Select label="Sort" value={sort} onChange={setSort} options={[{ value: "-created", label: "Newest" }, { value: "name", label: "Name A–Z" }, { value: "-name", label: "Name Z–A" }, { value: "-updated", label: "Recently updated" }]} />
        </FilterBar>
        {list.isError ? (
          <div className="p-4"><Notice tone="red" title="Servers could not be loaded" action={<button className={btn} onClick={() => void list.refetch()}>Try again</button>}>{errorMessage(list.error)}</Notice></div>
        ) : list.isLoading ? (
          <ListSkeleton />
        ) : items.length === 0 ? (
          <EmptyState icon={Server} title={q || env ? "No servers match these filters" : "No servers yet"} description="Add a server by hand, or connect a provider on the Providers page to import instances." action={canWrite ? <button className={btnPrimary} onClick={() => setAdding(true)}>Add server</button> : undefined} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">
              <thead><tr><Th>Server</Th><Th>Provider</Th><Th>Address</Th><Th>Provisioned</Th><Th>Provider status</Th><Th>Source</Th></tr></thead>
              <tbody>
                {items.map((a) => <ServerRow key={a.id} a={a} />)}
              </tbody>
            </table>
          </div>
        )}
        <Pager page={list.data?.page ?? page} limit={20} total={list.data?.total ?? 0} onPage={setPage} noun="servers" />
      </Section>
      {adding && <ServerDialog key="new" open onOpenChange={setAdding} />}
    </>
  );
}

function ServerRow({ a }: { a: Asset }) {
  const s = a.server;
  return (
    <tr className="hover:bg-slate-50/70">
      <Td>
        <Link href={`/infrastructure/assets/${a.id}`} className="font-semibold text-slate-900 hover:text-red-700">{a.name}</Link>
        <div className="mt-0.5 flex flex-wrap gap-1"><Chip>{ENV_LABEL[a.environment]}</Chip>{a.archivedAt && <Chip tone="amber">Archived</Chip>}</div>
      </Td>
      <Td>{providerName(a.provider)}</Td>
      <Td>{s?.ipv4 ?? s?.ipv6 ?? s?.hostname ?? <span className="text-slate-400">Not available</span>}</Td>
      <Td>{s?.vcpu ? `${s.vcpu} vCPU · ` : ""}{formatRam(s?.ramMb ?? null)} · {formatStorage(s?.storageGb ?? null)}</Td>
      <Td>{s?.providerStatus ? <Chip tone={s.providerStatus === "running" ? "green" : "slate"}>{s.providerStatus}</Chip> : <span className="text-slate-400">Not reported</span>}{s?.syncState === "NOT_LISTED" && <div className="mt-0.5"><Chip tone="amber">Not in latest provider listing</Chip></div>}</Td>
      <Td>{a.source === "provider_api" ? <span>Provider API<br /><span className="text-[11px] text-slate-500">synced {formatRelative(s?.lastSyncedAt)}</span></span> : "Manual entry"}</Td>
    </tr>
  );
}

/* ------------------------------------------------------------------ domains */

export function DomainsPage() {
  const { canWrite } = useRoleFlags();
  const { companyId } = useScope();
  const [q, setQ] = useState("");
  const [env, setEnv] = useState("");
  const [archived, setArchived] = useState(false);
  const [sort, setSort] = useState("-created");
  const [page, setPage] = useState(1);
  const [now] = useState(() => Date.now());
  const [adding, setAdding] = useState(false);
  const [bulk, setBulk] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const list = useDomains({ q, environment: env, archived: archived ? "true" : undefined, sort, page, limit: 20 });
  const items = list.data?.items ?? [];
  const refresh = useInfraMutation((c, ids: string[]) => infraApi.bulkRefresh(c, ids), { success: (r) => `Refresh queued for ${r.queued} domain${r.queued === 1 ? "" : "s"}.` });

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const allSelected = items.length > 0 && items.every((i) => selected.includes(i.id));

  return (
    <div className="space-y-1">
      {/* Order: stat cards → domains table → charts */}
      <DomainSummaryCards />
      <Section
        title="Domains & DNS"
        description="Registration data comes from public registry (RDAP) lookups. Dates are never inferred."
        flush
        action={
          <>
            <button type="button" className={btn} disabled={!selected.length || refresh.isPending} onClick={() => refresh.mutate(selected, { onSuccess: () => setSelected([]) })}><RefreshCw className="size-3.5" />Refresh{selected.length ? ` (${selected.length})` : ""}</button>
            <button type="button" className={btn} onClick={() => void downloadExport(companyId, "domains").catch((e) => toast.error(errorMessage(e)))}><Download className="size-3.5" />Export CSV</button>
            {canWrite && <button type="button" className={btn} onClick={() => setBulk(true)}><Upload className="size-3.5" />Bulk import</button>}
            {canWrite && <button type="button" className={btnPrimary} onClick={() => setAdding(true)}><Plus className="size-3.5" />Add domain</button>}
          </>
        }
      >
        <FilterBar q={q} setQ={(v) => { setQ(v); setPage(1); }} env={env} setEnv={(v) => { setEnv(v); setPage(1); }} archived={archived} setArchived={(v) => { setArchived(v); setPage(1); }}>
          <Select label="Sort" value={sort} onChange={setSort} options={[{ value: "-created", label: "Newest" }, { value: "name", label: "Name A–Z" }, { value: "-name", label: "Name Z–A" }, { value: "-updated", label: "Recently updated" }]} />
        </FilterBar>
        {list.isError ? (
          <div className="p-4"><Notice tone="red" title="Domains could not be loaded" action={<button className={btn} onClick={() => void list.refetch()}>Try again</button>}>{errorMessage(list.error)}</Notice></div>
        ) : list.isLoading ? (
          <ListSkeleton />
        ) : items.length === 0 ? (
          <EmptyState icon={Globe2} title={q || env ? "No domains match these filters" : "No domains yet"} description="Add a domain to see its registrar, expiry, nameservers, DNS records and certificate." action={canWrite ? <button className={btnPrimary} onClick={() => setAdding(true)}>Add domain</button> : undefined} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] border-collapse">
              <thead><tr><Th className="w-8"><input type="checkbox" aria-label="Select all" checked={allSelected} onChange={() => setSelected(allSelected ? [] : items.map((i) => i.id))} /></Th><Th>Domain</Th><Th>Registrar</Th><Th>Expires</Th><Th>Countdown</Th><Th>Registry data</Th><Th>Last checked</Th></tr></thead>
              <tbody>
                {items.map((a) => {
                  const d = a.domain;
                  const exp = d?.effectiveExpiry;
                  const days = exp?.date ? Math.round((new Date(exp.date).getTime() - now) / 86_400_000) : null;
                  const st = rdapInfo(d?.rdapState);
                  return (
                    <tr key={a.id} className="hover:bg-slate-50/70">
                      <Td><input type="checkbox" aria-label={`Select ${a.name}`} checked={selected.includes(a.id)} onChange={() => toggle(a.id)} /></Td>
                      <Td>
                        <Link href={`/infrastructure/assets/${a.id}`} className="font-semibold normal-case text-slate-900 hover:text-red-700">{d?.unicodeName ?? a.name}</Link>
                        <div className="mt-0.5 flex flex-wrap gap-1"><Chip>{ENV_LABEL[a.environment]}</Chip>{a.archivedAt && <Chip tone="amber">Archived</Chip>}</div>
                      </Td>
                                      <Td>{d?.registrar ?? <span className="text-slate-400">Not available</span>}</Td>
                      <Td><DateValue date={exp?.date ?? null} source={exp?.source} verified={exp?.verified} unknownText="Unknown" /></Td>
                      <Td>{exp?.date ? <Chip tone={daysTone(days)}>{daysLabel(days)}</Chip> : <span className="text-slate-400">—</span>}</Td>
                      <Td><span title={st.hint}><Chip tone={st.tone}>{st.label}</Chip></span></Td>
                      <Td>{d?.rdapCheckedAt ? formatRelative(d.rdapCheckedAt) : "Not yet"}<span className="block text-[11px] text-slate-500">{d?.dnsCheckedAt ? `DNS ${formatRelative(d.dnsCheckedAt)}` : ""}</span></Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pager page={list.data?.page ?? page} limit={20} total={list.data?.total ?? 0} onPage={setPage} noun="domains" />
      </Section>
      <DomainAnalyticsCharts />
      {adding && <DomainDialog open onOpenChange={setAdding} />}
      {bulk && <BulkDomainsDialog open onOpenChange={setBulk} />}
    </div>
  );
}
