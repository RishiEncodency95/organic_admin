"use client";

import Link from "next/link";
import { useState } from "react";
import { Activity, AlertTriangle, Bell, CalendarClock, Download, Globe, MonitorUp, Plus, RefreshCw, Server } from "lucide-react";
import { toast } from "sonner";
import { infraApi } from "./api";
import { Donut, MonitoringChart, SERIES, UsageBar } from "./charts";
import { ServerDialog } from "./dialogs";
import { ENV_LABEL, daysLabel, daysTone, formatRelative, providerName } from "./format";
import { downloadExport, errorMessage, useInfraMutation, useProviders, useScope } from "./hooks";
import { useFleet, useFleetMetrics } from "./monitoring-api";
import type { RangeKey } from "./monitoring-types";
import { COLLECTOR_LABEL, RangeSelect } from "./server-monitoring";
import { Chip, EmptyState, ListSkeleton, Notice, Pager, SearchBox, Section, Select, Skeleton, Spinner, StatStrip, Td, Th, btn, btnPrimary, useRoleFlags } from "./ui";

const ENV_OPTIONS = [{ value: "", label: "All environments" }, ...Object.entries(ENV_LABEL).map(([value, label]) => ({ value, label }))];
const SORTS = [{ value: "name", label: "Name A–Z" }, { value: "-cpu", label: "CPU (high first)" }, { value: "-memory", label: "Memory (high first)" }, { value: "-disk", label: "Disk (high first)" }, { value: "-alerts", label: "Most alerts" }, { value: "renewal", label: "Next renewal" }];
const MONITORING = [{ value: "", label: "Any monitoring" }, { value: "monitored", label: "Monitored" }, { value: "unmonitored", label: "Not monitored" }, { value: "offline", label: "Collector offline" }];

const MON_TONE = { not_configured: "slate", pending: "blue", online: "green", stale: "amber", offline: "amber", revoked: "slate" } as const;

export function FleetPage() {
  const { canWrite, canManage } = useRoleFlags();
  const { companyId } = useScope();
  const [q, setQ] = useState("");
  const [provider, setProvider] = useState("");
  const [env, setEnv] = useState("");
  const [status, setStatus] = useState("");
  const [monitoring, setMonitoring] = useState("");
  const [attention, setAttention] = useState(false);
  const [sort, setSort] = useState("name");
  const [page, setPage] = useState(1);
  const [range, setRange] = useState<RangeKey>("24h");
  const [adding, setAdding] = useState(false);
  const reset = <T,>(set: (v: T) => void) => (v: T) => { set(v); setPage(1); };

  const fleet = useFleet({ q, provider, environment: env, status, monitoring, attention: attention ? "true" : undefined, sort, page, limit: 20 });
  const trend = useFleetMetrics(range);
  const providers = useProviders();
  const sync = useInfraMutation(async (c, ids: string[]) => {
    const out = await Promise.allSettled(ids.map((id) => infraApi.syncConnection(c, id)));
    return { ok: out.filter((o) => o.status === "fulfilled").length, failed: out.filter((o) => o.status === "rejected").length };
  }, { success: (r) => `Provider sync finished: ${r.ok} succeeded${r.failed ? `, ${r.failed} failed` : ""}.` });

  // The server computes the summary before applying filters, so the cards always describe the whole fleet.
  const s = fleet.data?.summary;
  const items = fleet.data?.items ?? [];
  const connected = (providers.data?.connections ?? []).filter((c) => c.status !== "DISCONNECTED" && c.credentialsSaved);
  const providerOptions = [{ value: "", label: "All providers" }, ...(s?.byProvider ?? []).map((p) => ({ value: p.label, label: providerName(p.label) }))];
  const statusOptions = [{ value: "", label: "Any provider status" }, ...(s?.byStatus ?? []).filter((x) => x.label !== "Not reported").map((x) => ({ value: x.label, label: x.label }))];
  const points = trend.data?.points ?? [];

  return (
    <div className="space-y-1">
      {s ? (
        <StatStrip
          title="Fleet summary"
          items={[
            { label: "Servers", value: s.total, icon: Server, tip: `${s.running} running · ${s.stopped} stopped${s.otherStatus ? ` · ${s.otherStatus} other` : ""}` },
            { label: "Monitored", value: `${s.monitored}/${s.total}`, tone: s.total > 0 && s.monitored === 0 ? "amber" : undefined, icon: MonitorUp, tip: s.collectorOffline ? `${s.collectorOffline} collector offline` : s.pendingSetup ? `${s.pendingSetup} waiting for first data` : `${s.unmonitored} not monitored` },
            { label: "Need attention", value: s.needingAttention, tone: s.needingAttention ? "red" : undefined, icon: AlertTriangle, tip: "Alerts, offline or pressure" },
            { label: "Load", value: `${s.cpuPressure} · ${s.memoryPressure} · ${s.diskPressure}`, tone: s.cpuPressure + s.memoryPressure + s.diskPressure ? "orange" : undefined, icon: Activity, tip: "CPU, memory, disk pressure ≥ 85% · 90% · 85% now" },
            { label: "Renewals", value: s.renewalsWithin30Days, tone: s.renewalsWithin30Days ? "amber" : undefined, icon: CalendarClock, tip: "Confirmed dates, due within 30 days" },
          ]}
        />
      ) : (
        <Skeleton className="h-[72px]" />
      )}

      {/* Servers table — stat cards ke turant neeche */}
      <Section
        title="Servers"
        description="Provider status comes from the provider API; CPU, memory and disk appear only for servers with an advanced-monitoring collector."
        flush
        action={
          <>
            {canManage && connected.length > 0 && (
              <button type="button" className={btn} disabled={sync.isPending} onClick={() => sync.mutate(connected.map((c) => c.id), { onError: (e) => toast.error(errorMessage(e)) })}>
                {sync.isPending ? <Spinner /> : <RefreshCw className="size-3.5" />}Sync providers
              </button>
            )}
            <button type="button" className={btn} onClick={() => void downloadExport(companyId, "servers").catch((e) => toast.error(errorMessage(e)))}><Download className="size-3.5" />Export CSV</button>
            {canWrite && <button type="button" className={btnPrimary} onClick={() => setAdding(true)}><Plus className="size-3.5" />Add server</button>}
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-4 py-3">
          <SearchBox value={q} onChange={reset(setQ)} placeholder="Search name, IP, region" />
          <Select label="Provider" value={provider} onChange={reset(setProvider)} options={providerOptions} />
          <Select label="Environment" value={env} onChange={reset(setEnv)} options={ENV_OPTIONS} />
          <Select label="Provider status" value={status} onChange={reset(setStatus)} options={statusOptions} />
          <Select label="Monitoring" value={monitoring} onChange={reset(setMonitoring)} options={MONITORING} />
          <Select label="Sort" value={sort} onChange={reset(setSort)} options={SORTS} />
          <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600"><input type="checkbox" checked={attention} onChange={(e) => reset(setAttention)(e.target.checked)} />Needs attention</label>
        </div>
        {fleet.isError ? (
          <div className="p-4"><Notice tone="red" title="Servers could not be loaded" action={<button className={btn} onClick={() => void fleet.refetch()}>Try again</button>}>{errorMessage(fleet.error)}</Notice></div>
        ) : fleet.isLoading ? (
          <ListSkeleton />
        ) : items.length === 0 ? (
          <EmptyState icon={Server} title={q || provider || env || status || monitoring || attention ? "No servers match these filters" : "No servers yet"} description="Add a server by hand, or connect a provider on the Providers page to import instances." action={canWrite ? <button className={btnPrimary} onClick={() => setAdding(true)}>Add server</button> : undefined} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] border-collapse">
              <thead><tr><Th>Server</Th><Th>Provider · region</Th><Th>Status</Th><Th>Monitoring</Th><Th>CPU</Th><Th>Memory</Th><Th>Disk</Th><Th>Alerts</Th><Th>Renewal</Th></tr></thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70">
                    <Td>
                      <Link href={`/infrastructure/assets/${r.id}`} className="font-semibold text-slate-900 hover:text-red-700">{r.name}</Link>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1"><Chip>{ENV_LABEL[r.environment]}</Chip><span className="text-[11px] normal-case text-slate-500">{r.ipv4 ?? ""}</span></div>
                    </Td>
                    <Td>{providerName(r.provider)}<div className="text-[11px] text-slate-500">{[r.plan, r.region].filter(Boolean).join(" · ") || "—"}</div></Td>
                    <Td>
                      {r.providerStatus ? <Chip tone={r.providerStatus.toLowerCase() === "running" ? "green" : "amber"}>{r.providerStatus}</Chip> : <span className="text-slate-400">Manual</span>}
                      {r.providerSuspended && <div className="mt-0.5"><Chip tone="red">Suspended</Chip></div>}
                      {r.syncState === "NOT_LISTED" && <div className="mt-0.5"><Chip tone="amber">Not in latest listing</Chip></div>}
                    </Td>
                    <Td><Chip tone={MON_TONE[r.monitoring]}>{COLLECTOR_LABEL[r.monitoring]}</Chip>{r.lastMetricsAt && <div className="text-[10.5px] text-slate-500">{formatRelative(r.lastMetricsAt)}</div>}</Td>
                    <Td><UsageBar value={r.cpuPct} warn={85} crit={95} label={r.monitoring === "not_configured" ? "Not monitored" : "No fresh data"} /></Td>
                    <Td><UsageBar value={r.memPct} warn={90} crit={97} label={r.monitoring === "not_configured" ? "Not monitored" : "No fresh data"} /></Td>
                    <Td><UsageBar value={r.diskPct} warn={85} crit={95} label={r.monitoring === "not_configured" ? "Not monitored" : "No fresh data"} /></Td>
                    <Td>{r.openAlerts ? <Chip tone="red">{r.openAlerts}</Chip> : <span className="text-slate-400">0</span>}</Td>
                    <Td>{r.nextRenewal ? <Chip tone={daysTone(r.nextRenewal.daysRemaining)}>{daysLabel(r.nextRenewal.daysRemaining)}</Chip> : <span className="text-slate-400">Unknown</span>}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager page={fleet.data?.page ?? page} limit={20} total={fleet.data?.total ?? 0} onPage={setPage} noun="servers" />
      </Section>

      {/* Charts — table ke neeche */}
      {s && s.total > 0 && (
        <Section title="Distribution">
          <div className="grid gap-1 lg:grid-cols-3">
            <div><p className="mb-1 text-[11px] font-medium capitalize text-slate-500">Provider</p><Donut ariaLabel="Servers by provider" height={96} rows={s.byProvider.map((p) => ({ label: providerName(p.label), value: p.value }))} /></div>
            <div><p className="mb-1 text-[11px] font-medium capitalize text-slate-500">Region</p><Donut ariaLabel="Servers by region" height={96} rows={s.byRegion} /></div>
            <div><p className="mb-1 text-[11px] font-medium capitalize text-slate-500">Provider status</p><Donut ariaLabel="Servers by provider status" height={96} rows={s.byStatus} /></div>
          </div>
        </Section>
      )}

      {s && s.monitored > 0 && (
        <Section title="Fleet resource trend" description={`Average across ${trend.data?.serversReporting ?? s.monitored} monitored server${(trend.data?.serversReporting ?? s.monitored) === 1 ? "" : "s"}. Unmonitored servers are not included.`} action={<RangeSelect value={range} onChange={setRange} />}>
          {trend.isLoading ? <Skeleton className="h-44" /> : (
            <div className="grid gap-1 lg:grid-cols-2">
              <MonitoringChart ariaLabel="Fleet CPU and memory" data={points} unit="pct" yMax={100} kind="line" series={[{ key: "cpuAvg", label: "CPU", color: SERIES.cpu }, { key: "memAvg", label: "Memory", color: SERIES.mem }, { key: "diskMax", label: "Disk (peak)", color: SERIES.disk }]} />
              <MonitoringChart ariaLabel="Fleet network traffic" data={points} unit="bytesPerSec" series={[{ key: "netRx", label: "Inbound", color: SERIES.rx }, { key: "netTx", label: "Outbound", color: SERIES.tx }]} />
            </div>
          )}
        </Section>
      )}
      {adding && <ServerDialog open onOpenChange={setAdding} />}
    </div>
  );
}
