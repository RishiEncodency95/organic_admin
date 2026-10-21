"use client";

import { useState, type ReactNode } from "react";
import { Activity, Box, Check, Clipboard, HardDrive, KeyRound, ShieldCheck, Terminal } from "lucide-react";
import { toast } from "sonner";
import { env } from "./lib/env";
import { MonitoringChart, SERIES, UsageBar, formatBytes, formatUnit } from "./charts";
import { formatDateTime, formatMoney, formatRelative, providerName, SERVER_TYPE_LABEL } from "./format";
import { useInfraMutation } from "./hooks";
import { monitoringApi, useMetrics, useMonitoring, useProviderDetails, useThresholds } from "./monitoring-api";
import type { HealthStatus, MonitoringStatus, RangeKey } from "./monitoring-types";
import type { AssetDetail } from "./types";
import { Chip, ConfirmButton, DateValue, EmptyState, KeyValue, Modal, Notice, Section, Skeleton, Spinner, StatStrip, Td, Th, btn, btnPrimary } from "./ui";

/* ------------------------------------------------------------ small parts */

export const RANGES: Array<{ id: RangeKey; label: string }> = [{ id: "1h", label: "1 h" }, { id: "6h", label: "6 h" }, { id: "24h", label: "24 h" }, { id: "7d", label: "7 d" }, { id: "30d", label: "30 d" }];

export function RangeSelect({ value, onChange }: { value: RangeKey; onChange: (r: RangeKey) => void }) {
  return (
    <div role="group" aria-label="Time range" className="inline-flex overflow-hidden rounded-sm border border-slate-300">
      {RANGES.map((r) => (
        <button key={r.id} type="button" aria-pressed={value === r.id} onClick={() => onChange(r.id)} className={`h-8 px-2.5 text-xs font-semibold transition ${value === r.id ? "bg-red-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>{r.label}</button>
      ))}
    </div>
  );
}

const HEALTH_TONE: Record<HealthStatus, "green" | "amber" | "red" | "slate"> = { ok: "green", warning: "amber", critical: "red", unknown: "slate" };
const HEALTH_LABEL: Record<HealthStatus, string> = { ok: "Healthy", warning: "Warning", critical: "Critical", unknown: "Unknown" };
export const COLLECTOR_LABEL = { not_configured: "Not configured", pending: "Waiting for data", online: "Reporting", stale: "Delayed", offline: "Offline", revoked: "Removed" } as const;
const COLLECTOR_TONE = { not_configured: "slate", pending: "blue", online: "green", stale: "amber", offline: "amber", revoked: "slate" } as const;

export function StatusChip({ status }: { status: HealthStatus }) {
  return <Chip tone={HEALTH_TONE[status]}>{HEALTH_LABEL[status]}</Chip>;
}
export function CollectorChip({ state }: { state: keyof typeof COLLECTOR_LABEL }) {
  return <Chip tone={COLLECTOR_TONE[state]}>Monitoring: {COLLECTOR_LABEL[state]}</Chip>;
}

/** States where which source a number comes from, and how fresh it is, must be obvious. */
export function SourceNote({ source, at }: { source: "provider" | "guest"; at?: string | null }) {
  return (
    <span className="text-[10.5px] font-medium text-slate-500">
      {source === "provider" ? "Provisioned · provider API" : "Measured · guest OS collector"}
      {at ? ` · ${formatRelative(at)}` : ""}
    </span>
  );
}

function Metric({ label, value, sub, tone, tip }: { label: string; value: ReactNode; sub?: ReactNode; tone?: "red" | "amber" | "green"; tip?: string }) {
  const color = tone === "red" ? "text-rose-700" : tone === "amber" ? "text-amber-700" : "text-slate-900";
  return (
    <div className="rounded-sm border border-slate-200 bg-white p-2.5" title={tip}>
      <p className="truncate text-[11px] font-semibold text-slate-500">{label}</p>
      <p className={`mt-1 text-lg font-semibold leading-none tracking-tight tabular-nums ${color}`}>{value}</p>
      {sub && <p className="mt-1 truncate text-[10.5px] font-medium text-slate-500">{sub}</p>}
    </div>
  );
}

const pctTone = (v: number | null | undefined, warn: number, crit = 101) => (v === null || v === undefined ? undefined : v >= crit ? "red" : v >= warn ? "amber" : "green");

/** Shown instead of zeros when no guest collector exists. */
export function NotMonitored({ state, canManage, onSetup, what }: { state: MonitoringStatus["state"]; canManage: boolean; onSetup: () => void; what: string }) {
  const offline = state === "offline" || state === "stale";
  const pending = state === "pending";
  return (
    <Section title="Advanced monitoring not configured" description={pending ? "A collector token exists, but the first sample has not arrived yet." : offline ? "A collector is registered but is not reporting right now." : `${what} come from an optional collector running on the server. The provider API alone cannot supply them.`}>
      <EmptyState
        icon={Activity}
        title={pending ? "Waiting for the first sample" : offline ? "The collector has stopped reporting" : "No guest metrics yet"}
        description={pending ? "Run the collector on the server (Monitoring setup shows the exact command). This page updates by itself once data arrives." : offline ? "The server itself may still be running. Check the provider status on the Overview tab, then check the collector on the server." : "Nothing is shown rather than zeros. Set up the collector to see CPU, memory, disk and network history."}
        action={canManage ? <button type="button" className={btnPrimary} onClick={onSetup}><Terminal className="size-3.5" />{offline || pending ? "Open monitoring setup" : "Set up monitoring"}</button> : <span className="text-[11px] font-medium text-slate-500">An Owner or Admin can set this up.</span>}
      />
    </Section>
  );
}

/* ------------------------------------------------------------ setup wizard */

export function MonitoringSetupDialog({ assetId, assetName, status, open, onOpenChange }: { assetId: string; assetName: string; status: MonitoringStatus | undefined; open: boolean; onOpenChange: (o: boolean) => void }) {
  const [token, setToken] = useState<string | null>(null);
  const [reveal, setReveal] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const create = useInfraMutation((c, _: void) => monitoringApi.createCollector(c, assetId, assetName), { success: "Collector token created. Copy it now: it is shown only once." });
  const revoke = useInfraMutation((c, _: void) => monitoringApi.revokeCollector(c, assetId), { success: "Collector removed. Its token no longer works." });
  const base = typeof window !== "undefined" ? (env.apiBaseUrl.startsWith("http") ? env.apiBaseUrl : `${window.location.origin}${env.apiBaseUrl}`) : env.apiBaseUrl;
  const ingest = `${base.replace(/\/$/, "")}/infrastructure/ingest`;
  const unreachable = /localhost|127\.0\.0\.1|\[::1\]/.test(ingest);
  const configured = status?.collector?.configured;
  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      toast.error("Copy is not available in this browser. Select the text and copy it manually.");
    }
  };
  const runCmd = `OMNI_URL="${ingest}" \\\nOMNI_TOKEN="${token ?? "<your token>"}" \\\npython3 omni-collector.py --once`;
  const unit = `[Unit]\nDescription=OmniPlatform collector\nAfter=network-online.target\n\n[Service]\nUser=nobody\nEnvironment=OMNI_URL=${ingest}\nEnvironment=OMNI_TOKEN=${token ?? "<your token>"}\nExecStart=/usr/bin/python3 /opt/omni/omni-collector.py\nRestart=always\nNoNewPrivileges=true\nProtectSystem=strict\nProtectHome=true\n\n[Install]\nWantedBy=multi-user.target`;

  return (
    <Modal open={open} onOpenChange={(o) => { if (!o) { setToken(null); setReveal(false); } onOpenChange(o); }} wide title={`Monitoring setup · ${assetName}`} description="Optional and opt-in. Nothing is installed or changed on the server by this app: you run the collector yourself.">
      <div className="space-y-3 text-xs font-medium text-slate-700">
        <ol className="list-decimal space-y-1 pl-4">
          <li>Create a collector token below (one per server, shown once, stored only as a hash).</li>
          <li>Copy <code className="rounded-sm bg-slate-100 px-1">docs/monitoring/omni-collector.py</code> from the repository to the server and read it: it only reads <code className="rounded-sm bg-slate-100 px-1">/proc</code>, listens on no port, and needs no root.</li>
          <li>Test it once with the command below, then keep it running with systemd, cron or tmux.</li>
        </ol>
        {unreachable && <Notice tone="amber" title="This API address is local to your machine">The server cannot reach <strong>{ingest}</strong>. Replace the host with your public API address in the commands below.</Notice>}

        <div className="rounded-sm border border-slate-200 p-3">
          <p className="font-semibold text-slate-900">Collector status</p>
          <p className="mt-0.5 text-slate-600">
            {configured ? `Token ending …${status?.collector?.tokenHint}. Last sample ${status?.collector?.lastSampleAt ? formatRelative(status.collector.lastSampleAt) : "never"}.` : "No active collector for this server."}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" className={btnPrimary} disabled={create.isPending} onClick={() => create.mutate(undefined, { onSuccess: (r) => { setToken(r.token); setReveal(true); } })}>
              {create.isPending ? <Spinner /> : <KeyRound className="size-3.5" />}{configured ? "Rotate token" : "Create token"}
            </button>
            {configured && <ConfirmButton label="Remove collector" confirmLabel="Remove and invalidate token" onConfirm={() => revoke.mutate(undefined, { onSuccess: () => setToken(null) })} />}
          </div>
          {configured && !token && <p className="mt-2 text-[11px] text-slate-500">Rotating replaces the token: the running collector stops being accepted until you give it the new one.</p>}
        </div>

        {token && (
          <div className="space-y-2 rounded-sm border border-emerald-200 bg-emerald-50/60 p-3">
            <p className="font-semibold text-emerald-900">Your token (shown once)</p>
            <div className="flex items-center gap-2">
              <code className="min-w-0 flex-1 break-all rounded-sm bg-white px-2 py-1.5 font-mono text-[11px] text-slate-900">{reveal ? token : `${token.slice(0, 12)}••••••••••••••••`}</code>
              <button type="button" className={btn} onClick={() => setReveal((r) => !r)}>{reveal ? "Hide" : "Show"}</button>
              <button type="button" className={btn} onClick={() => void copy("token", token)}>{copied === "token" ? <Check className="size-3.5" /> : <Clipboard className="size-3.5" />}Copy</button>
            </div>
            <p className="text-[11px] text-emerald-900">Treat it like a password. If it leaks, rotate or remove it here.</p>
          </div>
        )}

        <div className="space-y-1.5">
          <p className="font-semibold text-slate-900">1 · Test once</p>
          <pre className="overflow-x-auto rounded-sm bg-slate-900 p-3 font-mono text-[11px] leading-relaxed text-slate-100">{runCmd}</pre>
          <button type="button" className={btn} onClick={() => void copy("cmd", runCmd)}>{copied === "cmd" ? <Check className="size-3.5" /> : <Clipboard className="size-3.5" />}Copy command</button>
        </div>
        <details className="rounded-sm border border-slate-200 p-3">
          <summary className="cursor-pointer font-semibold text-slate-900">2 · Run continuously (systemd unit, hardened)</summary>
          <pre className="mt-2 overflow-x-auto rounded-sm bg-slate-900 p-3 font-mono text-[11px] leading-relaxed text-slate-100">{unit}</pre>
          <button type="button" className={`${btn} mt-2`} onClick={() => void copy("unit", unit)}>{copied === "unit" ? <Check className="size-3.5" /> : <Clipboard className="size-3.5" />}Copy unit</button>
        </details>
        <p className="text-[11px] text-slate-500">Security: HTTPS and certificate validation are mandatory; the collector sends at most one sample per 30 s; the API accepts at most one per 15 s per server; telemetry is bound to this server by its token, not by anything in the payload. Never put the token in a public repository.</p>
      </div>
    </Modal>
  );
}

/* --------------------------------------------------------------- tab: health */

export function HealthSummary({ status }: { status: MonitoringStatus }) {
  const h = status.health;
  return (
    <Section title="Health" description={`Confidence: ${h.confidence}. Missing data is shown as unknown, never as a fault.`}
      action={<StatusChip status={h.overall} />}>
      <ul className="grid gap-1 sm:grid-cols-2 xl:grid-cols-3">
        {h.dimensions.map((d) => (
          <li key={d.key} className="rounded-sm border border-slate-200 p-2.5">
            <div className="flex items-center justify-between gap-2"><span className="text-[11px] font-semibold text-slate-600">{d.label}</span><StatusChip status={d.status} /></div>
            <p className="mt-1 text-[11px] font-medium text-slate-600">{d.reason}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* --------------------------------------------------------- tab: performance */

export function PerformanceTab({ assetId, canManage, onSetup }: { assetId: string; canManage: boolean; onSetup: () => void }) {
  const [range, setRange] = useState<RangeKey>("24h");
  const st = useMonitoring(assetId);
  const hasData = Boolean(st.data?.latest);
  const m = useMetrics(assetId, range, hasData);
  const th = useThresholds();
  if (st.isLoading) return <Skeleton className="h-64" />;
  if (!st.data) return <Notice tone="red" title="Monitoring could not be loaded" />;
  const s = st.data;
  if (!hasData) return <NotMonitored state={s.state} canManage={canManage} onSetup={onSetup} what="CPU, memory and load" />;
  const l = s.latest!;
  const pts = m.data?.points ?? [];
  const stale = s.state !== "online";
  const peak = (key: string) => pts.reduce<number | null>((acc, p) => (p[key] === null || p[key] === undefined ? acc : Math.max(acc ?? 0, p[key] as number)), null);
  const avg = (key: string) => {
    const v = pts.map((p) => p[key]).filter((x): x is number => typeof x === "number");
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
  };
  const cores = s.host?.cpuCores ?? null;
  const t = th.data ?? s.thresholds;
  return (
    <div className="space-y-1">
      {stale && <Notice tone="amber" title="These values are not current">Last sample {formatRelative(l.at)}. The collector is {COLLECTOR_LABEL[s.state].toLowerCase()}.</Notice>}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SourceNote source="guest" at={l.at} />
        <RangeSelect value={range} onChange={setRange} />
      </div>
      <div className="grid grid-cols-2 gap-1 md:grid-cols-3 xl:grid-cols-6">
        <Metric label="CPU" value={formatUnit(l.cpuPct, "pct")} sub={`User ${formatUnit(l.cpuUserPct, "pct")} · System ${formatUnit(l.cpuSystemPct, "pct")}`} tone={pctTone(l.cpuPct, t.cpuPct ?? 85)} tip="Share of CPU time that was not idle in the last sampling interval." />
        <Metric label="Memory" value={formatUnit(l.memUsedPct, "pct")} sub={`${formatBytes((l.memTotalBytes ?? 0) - (l.memAvailBytes ?? 0))} of ${formatBytes(l.memTotalBytes)}`} tone={pctTone(l.memUsedPct, t.memPct ?? 90)} tip="Used = total minus available (cache that can be reclaimed counts as available)." />
        <Metric label="Swap" value={l.swapTotalBytes ? formatUnit(l.swapUsedPct, "pct") : "None"} sub={l.swapTotalBytes ? `${formatBytes(l.swapUsedBytes)} of ${formatBytes(l.swapTotalBytes)}` : "No swap configured"} tone={pctTone(l.swapUsedPct, t.swapPct ?? 50)} />
        <Metric label="Load (1 / 5 / 15 min)" value={l.load[0] !== null && l.load[0] !== undefined ? l.load[0].toFixed(2) : "—"} sub={`${l.load[1]?.toFixed(2) ?? "—"} · ${l.load[2]?.toFixed(2) ?? "—"}${cores ? ` · ${cores} cores` : ""}`} tone={cores && l.load[0] !== null && l.load[0] !== undefined ? pctTone((l.load[0] / cores) * 100, 100, 200) : undefined} tip="Load average counts runnable and uninterruptible tasks. Compare it with the core count." />
        <Metric label="I/O wait" value={formatUnit(l.cpuIowaitPct, "pct")} sub="Time waiting on disk" tip="High values mean the CPU is idle because storage is slow (an I/O saturation indicator)." />
        <Metric label="CPU steal" value={formatUnit(l.cpuStealPct, "pct")} sub="Taken by the hypervisor" tip="Noisy-neighbour indicator on shared virtualised hosts." />
      </div>
      <div className="grid gap-1 xl:grid-cols-2">
        <Section title="CPU usage" description={`Average ${formatUnit(avg("cpuAvg"), "pct")} · peak ${formatUnit(peak("cpuMax"), "pct")}`}>
          <MonitoringChart ariaLabel="CPU usage over time" data={pts} unit="pct" yMax={100} series={[{ key: "cpuAvg", label: "CPU avg", color: SERIES.cpu }, { key: "cpuMax", label: "CPU peak", color: SERIES.muted }]} kind="line" />
        </Section>
        <Section title="Memory usage" description={`Average ${formatUnit(avg("memAvg"), "pct")} · peak ${formatUnit(peak("memMax"), "pct")}`}>
          <MonitoringChart ariaLabel="Memory usage over time" data={pts} unit="pct" yMax={100} series={[{ key: "memAvg", label: "Memory", color: SERIES.mem }, { key: "swapAvg", label: "Swap", color: SERIES.swap }]} />
        </Section>
        <Section title="Load average" description="1 and 5 minute averages">
          <MonitoringChart ariaLabel="Load average over time" data={pts} unit="load" series={[{ key: "load1", label: "1 min", color: SERIES.load }, { key: "load5", label: "5 min", color: SERIES.muted }]} kind="line" />
        </Section>
        <Section title="CPU breakdown" description="User, system and I/O wait">
          <MonitoringChart ariaLabel="CPU breakdown over time" data={pts} unit="pct" yMax={100} series={[{ key: "cpuUser", label: "User", color: SERIES.cpu }, { key: "cpuSystem", label: "System", color: SERIES.tx }, { key: "cpuIowait", label: "I/O wait", color: SERIES.disk }]} kind="line" />
        </Section>
      </div>
      {m.data && <p className="text-[11px] font-medium text-slate-500">{m.data.bucketsWithData} of {m.data.bucketsTotal} intervals have data · averaged per {Math.round((m.data.bucketSeconds ?? 0) / 60)} min · gaps mean no samples were received.</p>}
    </div>
  );
}

/* ------------------------------------------------------------- tab: storage */

export function StorageTab({ asset, canManage, onSetup }: { asset: AssetDetail; canManage: boolean; onSetup: () => void }) {
  const [range, setRange] = useState<RangeKey>("7d");
  const st = useMonitoring(asset.id);
  const hasData = Boolean(st.data?.latest);
  const m = useMetrics(asset.id, range, hasData);
  const s = asset.server;
  return (
    <div className="space-y-1">
      <Section title="Provisioned storage" description="What the provider allocated. This is not how much is used.">
        <div className="flex flex-wrap items-center gap-2"><KeyValue rows={[{ label: "Allocated disk", value: s?.storageGb ? `${s.storageGb} GB` : null }, { label: "Storage type", value: s?.storageType }]} /><SourceNote source="provider" at={s?.lastSyncedAt} /></div>
      </Section>
      {st.isLoading ? <Skeleton className="h-48" /> : !st.data?.latest ? (
        <NotMonitored state={st.data?.state ?? "not_configured"} canManage={canManage} onSetup={onSetup} what="Filesystem usage, inodes and disk throughput" />
      ) : (
        <>
          <Section title="Filesystems" description="Measured inside the operating system" action={<SourceNote source="guest" at={st.data.latest.at} />} flush>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse">
                <thead><tr><Th>Mount</Th><Th>Type</Th><Th>Used</Th><Th>Free</Th><Th>Capacity</Th><Th>Inodes</Th><Th>State</Th></tr></thead>
                <tbody>
                  {st.data.latest.filesystems.map((f) => (
                    <tr key={f.mount}>
                      <Td className="font-mono normal-case">{f.mount}</Td><Td className="normal-case">{f.fstype ?? "—"}</Td>
                      <Td><UsageBar value={f.usedPct} warn={st.data!.thresholds.diskWarnPct} crit={st.data!.thresholds.diskCritPct} /></Td>
                      <Td>{formatBytes(f.totalBytes - f.usedBytes)}</Td><Td>{formatBytes(f.totalBytes)}</Td>
                      <Td><UsageBar value={f.inodesUsedPct} warn={80} crit={95} label="n/a" /></Td>
                      <Td>{f.readOnly ? <Chip tone="amber">Read-only</Chip> : <span className="text-slate-500">Read-write</span>}</Td>
                    </tr>
                  ))}
                  {st.data.latest.filesystems.length === 0 && <tr><Td>No filesystems reported</Td></tr>}
                </tbody>
              </table>
            </div>
          </Section>
          <div className="flex justify-end"><RangeSelect value={range} onChange={setRange} /></div>
          <div className="grid gap-1 xl:grid-cols-2">
            <Section title="Disk usage trend" description="Highest filesystem usage"><MonitoringChart ariaLabel="Disk usage over time" data={m.data?.points ?? []} unit="pct" yMax={100} series={[{ key: "diskMax", label: "Peak", color: SERIES.disk }, { key: "diskAvg", label: "Average", color: SERIES.muted }]} /></Section>
            <Section title="Disk throughput" description={`Read ${formatBytes(st.data.latest.diskReadBps, true)} · write ${formatBytes(st.data.latest.diskWriteBps, true)} now`}><MonitoringChart ariaLabel="Disk throughput over time" data={m.data?.points ?? []} unit="bytesPerSec" kind="line" series={[{ key: "diskRead", label: "Read", color: SERIES.rx }, { key: "diskWrite", label: "Write", color: SERIES.tx }]} /></Section>
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------- tab: network */

export function NetworkTab({ asset, canManage, onSetup }: { asset: AssetDetail; canManage: boolean; onSetup: () => void }) {
  const [range, setRange] = useState<RangeKey>("24h");
  const st = useMonitoring(asset.id);
  const hasData = Boolean(st.data?.latest);
  const m = useMetrics(asset.id, range, hasData);
  const s = asset.server;
  const l = st.data?.latest;
  return (
    <div className="space-y-1">
      <Section title="Addresses" action={<SourceNote source="provider" at={s?.lastSyncedAt} />}>
        <KeyValue rows={[{ label: "Hostname", value: s?.hostname }, { label: "Public IPv4", value: s?.ipv4 }, { label: "Public IPv6", value: s?.ipv6 }, { label: "Additional IPs", value: s?.additionalIps.length ? s.additionalIps.join(", ") : null }]} />
      </Section>
      {st.isLoading ? <Skeleton className="h-40" /> : !l ? (
        <NotMonitored state={st.data?.state ?? "not_configured"} canManage={canManage} onSetup={onSetup} what="Traffic, packet errors and drops" />
      ) : (
        <>
          <div className="flex items-center justify-between"><SourceNote source="guest" at={l.at} /><RangeSelect value={range} onChange={setRange} /></div>
          <div className="grid grid-cols-2 gap-1 md:grid-cols-4">
            <Metric label="Inbound" value={formatBytes(l.netRxBps, true)} sub="All non-loopback interfaces" />
            <Metric label="Outbound" value={formatBytes(l.netTxBps, true)} />
            <Metric label="Errors / s" value={formatUnit(l.netErrPerSec, "number")} tone={(l.netErrPerSec ?? 0) >= (st.data?.thresholds.netErrPerSec ?? 10) ? "amber" : undefined} />
            <Metric label="Drops / s" value={formatUnit(l.netDropPerSec, "number")} />
          </div>
          <Section title="Throughput"><MonitoringChart ariaLabel="Network throughput over time" data={m.data?.points ?? []} unit="bytesPerSec" series={[{ key: "netRx", label: "Inbound", color: SERIES.rx }, { key: "netTx", label: "Outbound", color: SERIES.tx }]} /></Section>
          <Section title="Packet errors and drops"><MonitoringChart ariaLabel="Network errors over time" data={m.data?.points ?? []} unit="number" kind="line" series={[{ key: "netErr", label: "Errors/s", color: SERIES.cpu }, { key: "netDrop", label: "Drops/s", color: SERIES.disk }]} height={140} /></Section>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ tab: OS */

export function OsTab({ asset, canManage, onSetup }: { asset: AssetDetail; canManage: boolean; onSetup: () => void }) {
  const st = useMonitoring(asset.id);
  const s = asset.server;
  const host = st.data?.host;
  const services = st.data?.report?.services ?? [];
  const failed = services.filter((x) => !["active", "running", "enabled"].includes(x.state));
  return (
    <div className="space-y-1">
      <Section title="Provisioned configuration" action={<SourceNote source="provider" at={s?.lastSyncedAt} />}>
        <KeyValue rows={[
          { label: "Server type", value: s ? SERVER_TYPE_LABEL[s.serverType] ?? s.serverType : null }, { label: "Plan", value: s?.planName }, { label: "Image / OS (provider)", value: s?.operatingSystem },
          { label: "vCPU", value: s?.vcpu }, { label: "RAM", value: s?.ramMb ? `${(s.ramMb / 1024).toFixed(1)} GB` : null }, { label: "Disk", value: s?.storageGb ? `${s.storageGb} GB` : null },
          { label: "Region", value: s?.region }, { label: "Datacenter", value: s?.datacenter }, { label: "Provider status", value: s?.providerStatus },
        ]} />
      </Section>
      {!host ? (
        <NotMonitored state={st.data?.state ?? "not_configured"} canManage={canManage} onSetup={onSetup} what="Hostname, kernel, boot time and services" />
      ) : (
        <>
          <Section title="Operating system" description="Reported by the guest" action={<SourceNote source="guest" at={st.data?.latest?.at} />}>
            <KeyValue rows={[
              { label: "Hostname", value: host.hostname }, { label: "Distribution", value: host.os }, { label: "Kernel", value: host.kernel }, { label: "Architecture", value: host.arch },
              { label: "Booted", value: host.bootTime ? formatDateTime(host.bootTime) : null },
              { label: "OS uptime", value: st.data?.latest?.uptimeSec ? `${Math.floor(st.data.latest.uptimeSec / 86400)} d ${Math.floor((st.data.latest.uptimeSec % 86400) / 3600)} h` : null },
              { label: "Cores seen by the OS", value: host.cpuCores }, { label: "Collector", value: st.data?.collector?.agentVersion ? `v${st.data.collector.agentVersion}` : null },
            ]} />
          </Section>
          <Section title="Services" description="Only what the collector reports; no commands are run remotely." flush>
            {services.length === 0 ? <EmptyState icon={Activity} title="No services reported" description="This collector version reports host and container metrics. Service state is optional." /> : (
              <>
                {failed.length > 0 && <div className="p-3"><Notice tone="amber" title={`${failed.length} service${failed.length === 1 ? "" : "s"} not running`} /></div>}
                <ul className="divide-y divide-slate-100 text-xs">{services.map((x) => <li key={x.name} className="flex justify-between px-4 py-2"><span className="font-semibold normal-case text-slate-800">{x.name}</span><Chip tone={["active", "running", "enabled"].includes(x.state) ? "green" : "amber"}>{x.state}</Chip></li>)}</ul>
              </>
            )}
          </Section>
          <Section title="Linked websites" flush>
            {asset.linkedWebsites.length === 0 && asset.relations.length === 0 ? <EmptyState title="No linked websites or domains" description="Link domains to this server from a domain's page." /> : (
              <ul className="divide-y divide-slate-100 text-xs">
                {asset.linkedWebsites.map((w) => <li key={w.clientId} className="flex justify-between px-4 py-2"><span className="font-semibold">{w.clientName}</span><span className="normal-case text-slate-500">{w.url}</span></li>)}
                {asset.relations.map((r) => <li key={r.id} className="flex justify-between px-4 py-2"><span className="font-semibold normal-case">{r.asset.name}</span><span className="text-slate-500">{r.kind.toLowerCase().replace("_", " ")}</span></li>)}
              </ul>
            )}
          </Section>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ tab: containers */

export function ContainersTab({ assetId, canManage, onSetup }: { assetId: string; canManage: boolean; onSetup: () => void }) {
  const st = useMonitoring(assetId);
  if (st.isLoading) return <Skeleton className="h-48" />;
  const report = st.data?.report;
  if (!report || !st.data?.latest) return <NotMonitored state={st.data?.state ?? "not_configured"} canManage={canManage} onSetup={onSetup} what="Container state and usage" />;
  const list = report.containers;
  const by = (k: string) => list.filter((c) => c.state === k).length;
  return (
    <div className="space-y-1">
      <Notice tone="blue" title="Read-only view">Container state is reported by the collector (started with <code>--docker</code>). This app has no start, stop, restart or delete controls and never connects to the Docker socket.</Notice>
      <div className="grid grid-cols-2 gap-1 md:grid-cols-4">
        <Metric label="Containers" value={list.length} /><Metric label="Running" value={by("running")} tone="green" /><Metric label="Stopped / exited" value={by("exited") + by("created") + by("dead")} /><Metric label="Restarting" value={by("restarting")} tone={by("restarting") ? "amber" : undefined} />
      </div>
      <Section title="Containers" action={<SourceNote source="guest" at={st.data.latest.at} />} flush>
        {list.length === 0 ? <EmptyState icon={Box} title="No containers reported" description="Either Docker is not used here, or the collector was started without --docker." /> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead><tr><Th>Name</Th><Th>Image</Th><Th>State</Th><Th>Health</Th><Th>CPU</Th><Th>Memory</Th><Th>Restarts</Th></tr></thead>
              <tbody>
                {list.map((c) => (
                  <tr key={c.id}>
                    <Td><span className="font-semibold normal-case text-slate-900">{c.name}</span><div className="font-mono text-[10.5px] normal-case text-slate-500">{c.id}</div></Td>
                    <Td className="max-w-[240px] truncate normal-case" >{c.image || "—"}</Td>
                    <Td><Chip tone={c.state === "running" ? "green" : c.state === "restarting" ? "amber" : "slate"}>{c.state}</Chip><div className="text-[10.5px] text-slate-500">{c.status}</div></Td>
                    <Td>{c.health ?? "—"}</Td>
                    <Td>{c.cpuPct === null ? "—" : `${c.cpuPct.toFixed(1)}%`}</Td>
                    <Td>{c.memBytes === null ? "—" : `${formatBytes(c.memBytes)}${c.memLimitBytes ? ` / ${formatBytes(c.memLimitBytes)}` : ""}`}</Td>
                    <Td>{c.restartCount ?? "—"}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  );
}

/* ------------------------------------------------------------- tab: security */

export function SecurityTab({ asset, canManage, onSetup }: { asset: AssetDetail; canManage: boolean; onSetup: () => void }) {
  const st = useMonitoring(asset.id);
  const sec = st.data?.report?.security;
  const host = st.data?.host;
  return (
    <div className="space-y-1">
      <Notice tone="blue" title="Indicators, not a security rating">These are read-only facts from approved sources. Passing them does not mean the server is secure, and this is not a vulnerability scanner.</Notice>
      <Section title="Certificates (existing SSL module)" flush>
        {asset.relations.length === 0 ? <EmptyState title="No certificates linked to this server" description="Link a domain to this server to see its certificate state here." /> : (
          <ul className="divide-y divide-slate-100 text-xs">{asset.relations.filter((r) => r.asset.type === "DOMAIN").map((r) => <li key={r.id} className="flex justify-between px-4 py-2"><span className="font-semibold normal-case">{r.asset.name}</span><a className="text-red-700 hover:underline" href={`/infrastructure/assets/${r.asset.id}`}>Open SSL tab</a></li>)}</ul>
        )}
      </Section>
      {!st.data?.latest ? (
        <NotMonitored state={st.data?.state ?? "not_configured"} canManage={canManage} onSetup={onSetup} what="OS version, reboot-required and listening ports" />
      ) : (
        <>
          <Section title="Host indicators" action={<SourceNote source="guest" at={st.data.latest.at} />}>
            <KeyValue rows={[
              { label: "OS", value: host?.os }, { label: "Kernel", value: host?.kernel },
              { label: "Reboot required", value: sec?.rebootRequired === null || sec?.rebootRequired === undefined ? "Not reported" : sec.rebootRequired ? "Yes" : "No" },
              { label: "Pending updates", value: sec?.pendingUpdates ?? "Not reported" }, { label: "Security updates", value: sec?.securityUpdates ?? "Not reported" },
              { label: "Firewall", value: sec?.firewall ?? "Not reported" },
              { label: "Collector last seen", value: st.data.collector?.lastSeenAt ? formatRelative(st.data.collector.lastSeenAt) : null },
              { label: "Rejected samples", value: st.data.collector?.rejectedSamples ?? 0 },
            ]} />
          </Section>
          <Section title="Listening TCP ports" description="Port numbers only: no process names or command lines are collected." flush>
            {!sec || sec.listeningPorts.length === 0 ? <EmptyState icon={ShieldCheck} title="No listening ports reported" /> : (
              <div className="flex flex-wrap gap-1.5 p-3">{sec.listeningPorts.map((p) => <Chip key={`${p.proto}-${p.port}`}>{p.port}/{p.proto}</Chip>)}</div>
            )}
          </Section>
        </>
      )}
    </div>
  );
}

/* -------------------------------------------------- tab: provider & snapshots */

export function ProviderTab({ asset, canManage }: { asset: AssetDetail; canManage: boolean }) {
  const details = useProviderDetails(asset.id, canManage && asset.source === "provider_api");
  const reported = asset.server?.networkInfo?.providerReported ?? {};
  const rows: Array<{ label: string; value: ReactNode }> = [
    { label: "Provider", value: providerName(asset.provider) }, { label: "Account", value: asset.connection?.label ?? "Manual entry (no provider account)" },
    { label: "Instance ID", value: asset.remoteId }, { label: "Product", value: [asset.server?.planName, reported.productId].filter(Boolean).join(" · ") || null },
    { label: "Product type", value: reported.productType as string | null }, { label: "Image ID", value: reported.imageId as string | null },
    { label: "Default user", value: reported.defaultUser as string | null }, { label: "Host", value: reported.vHostName ? `${reported.vHostName}${reported.vHostNumber !== null && reported.vHostNumber !== undefined ? ` (#${reported.vHostNumber})` : ""}` : null },
    { label: "Region", value: [reported.regionName, asset.server?.datacenter].filter(Boolean).join(" · ") || asset.server?.region || null },
    { label: "Add-ons", value: reported.addOns as string | null }, { label: "MAC address", value: reported.macAddress as string | null },
    { label: "Created at provider", value: asset.server?.providerCreatedAt ? formatDateTime(asset.server.providerCreatedAt) : null },
    { label: "Provider status", value: asset.server?.providerStatus }, { label: "Suspension", value: asset.server?.providerSuspended === null || asset.server?.providerSuspended === undefined ? "Not reported by provider" : asset.server.providerSuspended ? "Suspended" : "Not suspended" },
    { label: "Provider cancellation date", value: reported.cancelDate ? `${reported.cancelDate} (a cancellation date, not a renewal date)` : "None reported" },
    { label: "Last synchronised", value: asset.server?.lastSyncedAt ? formatDateTime(asset.server.lastSyncedAt) : null },
    { label: "Renewal / payment dates", value: asset.source === "provider_api" ? "Not available from provider: enter them on the Billing tab" : "Manually managed" },
  ];
  const d = details.data;
  return (
    <div className="space-y-1">
      <Section title="Provider record" action={<SourceNote source="provider" at={asset.server?.lastSyncedAt} />}><KeyValue rows={rows} /></Section>
      {asset.source !== "provider_api" ? null : !canManage ? (
        <Notice tone="blue" title="Snapshots and provider history are visible to Owners and Admins" />
      ) : details.isLoading ? <Skeleton className="h-32" /> : !d?.available ? (
        <Notice tone={d?.reason === "manual" ? "blue" : "amber"} title="Snapshots and audit history are unavailable">{d?.message ?? "The provider could not be read."}</Notice>
      ) : (
        <>
          {d.errors.length > 0 && <Notice tone="amber" title="Some provider data could not be read">{d.errors.join(" · ")}</Notice>}
          <Section title="Snapshots" description="Read-only. Taking, restoring or deleting snapshots is not available here." flush>
            {d.snapshots.length === 0 ? <EmptyState icon={HardDrive} title="No snapshots" description="The provider reports no snapshots for this instance." /> : (
              <div className="overflow-x-auto"><table className="w-full min-w-[560px] border-collapse"><thead><tr><Th>Name</Th><Th>Created</Th><Th>Auto-delete</Th><Th>Image</Th></tr></thead>
                <tbody>{d.snapshots.map((s) => <tr key={s.id}><Td className="normal-case"><span className="font-semibold">{s.name ?? s.id}</span>{s.description && <div className="text-[11px] text-slate-500">{s.description}</div>}</Td><Td>{s.createdAt ? formatDateTime(s.createdAt) : "—"}</Td><Td>{s.autoDeleteAt ? formatDateTime(s.autoDeleteAt) : "None"}</Td><Td className="normal-case">{s.imageName ?? "—"}</Td></tr>)}</tbody></table></div>
            )}
          </Section>
          <Section title="Provider audit history" description="Changes made to this instance through the provider (field names only)." flush>
            {d.audits.length === 0 ? <EmptyState icon={Activity} title="No provider audit entries" /> : (
              <ul className="divide-y divide-slate-100 text-xs">{d.audits.map((a) => <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2"><span><span className="font-semibold text-slate-900">{a.action.toLowerCase()}</span>{a.changedFields.length > 0 && <span className="text-slate-500"> · {a.changedFields.join(", ")}</span>}</span><span className="normal-case text-slate-500">{a.actor ?? "unknown"} · {a.at ? formatDateTime(a.at) : "—"}</span></li>)}</ul>
            )}
          </Section>
        </>
      )}
    </div>
  );
}


/* --------------------------------------------------------- tab: overview */

export function ServerOverview({ asset, canManage, onSetup }: { asset: AssetDetail; canManage: boolean; onSetup: () => void }) {
  const st = useMonitoring(asset.id);
  const s = asset.server;
  const status = st.data;
  const l = status?.latest;
  const billing = asset.subscriptions[0];
  const ips = [s?.ipv4, s?.ipv6, ...(s?.additionalIps ?? [])].filter(Boolean) as string[];
  const providerTone = (s?.providerStatus ?? "").toLowerCase() === "running" ? "green" : s?.providerStatus ? "amber" : "slate";
  return (
    <div className="space-y-1">
      <StatStrip
        title="Server summary"
        items={[
          { label: "Provider status", value: s?.providerStatus ?? "Not reported", tone: providerTone === "green" ? "green" : providerTone === "amber" ? "amber" : undefined, sub: asset.source === "provider_api" ? `Synced ${formatRelative(s?.lastSyncedAt)}` : "Manual server", tip: "The provider control plane's view of the instance. It says nothing about what runs inside it." },
          { label: "Monitoring", value: status ? COLLECTOR_LABEL[status.state] : "…", tone: status?.state === "online" ? "green" : status?.state === "offline" || status?.state === "stale" ? "amber" : undefined, sub: l ? `Metrics ${formatRelative(l.at)}` : status?.state === "pending" ? "Run the collector" : "No guest metrics" },
          { label: "CPU", value: l ? formatUnit(l.cpuPct, "pct") : "—", tone: pctTone(l?.cpuPct, 85), sub: l ? "Measured" : `${s?.vcpu ?? "?"} vCPU provisioned` },
          { label: "Memory", value: l ? formatUnit(l.memUsedPct, "pct") : "—", tone: pctTone(l?.memUsedPct, 90), sub: l ? "Measured" : s?.ramMb ? `${(s.ramMb / 1024).toFixed(1)} GB provisioned` : undefined },
          { label: "Disk", value: l ? formatUnit(l.diskMaxUsedPct, "pct") : "—", tone: pctTone(l?.diskMaxUsedPct, 85, 95), sub: l ? "Fullest filesystem" : s?.storageGb ? `${s.storageGb} GB provisioned` : undefined },
          { label: "OS uptime", value: l?.uptimeSec ? `${Math.floor(l.uptimeSec / 86400)}d ${Math.floor((l.uptimeSec % 86400) / 3600)}h` : "—", sub: l?.uptimeSec ? "From the guest" : "Needs the collector" },
        ]}
      />
      {status ? <HealthSummary status={status} /> : <Skeleton className="h-28" />}
      {status && status.state === "not_configured" && (
        <Notice tone="blue" title="Advanced monitoring not configured" action={canManage ? <button type="button" className={btn} onClick={onSetup}>Set up</button> : undefined}>
          Provider data (below) is available without it. Install the optional collector to see CPU, memory, disk and network history and get pressure alerts.
        </Notice>
      )}
      <div className="grid gap-1 lg:grid-cols-2">
        <Section title="Identity & network" action={<SourceNote source="provider" at={s?.lastSyncedAt} />}>
          <KeyValue rows={[
            { label: "Server", value: asset.name }, { label: "Provider · plan", value: [providerName(asset.provider), s?.planName].filter(Boolean).join(" · ") },
            { label: "Region", value: [s?.region, s?.datacenter].filter(Boolean).join(" · ") || null }, { label: "IP addresses", value: ips.length ? <span className="font-mono normal-case">{ips.join(", ")}</span> : null },
            { label: "Environment", value: asset.environment.toLowerCase() },
            { label: "Linked websites", value: asset.linkedWebsites.length ? asset.linkedWebsites.map((w) => w.clientName).join(", ") : null },
            { label: "Linked assets", value: asset.relations.length ? asset.relations.map((r) => r.asset.name).join(", ") : null },
          ]} />
        </Section>
        <Section title="Billing & renewal" description="Contabo publishes no renewal date: it is entered and verified manually.">
          {billing && !billing.billingHidden ? (
            <KeyValue rows={[
              { label: "Plan", value: billing.label ?? s?.planName }, { label: "Cost", value: billing.amount !== null ? `${formatMoney(billing.amount, billing.currency)} / ${billing.cycle.toLowerCase()}` : null },
              { label: "Next payment", value: billing.nextDueDate ? <DateValue date={billing.nextDueDate} source={billing.dateSources.nextDueDate?.source ?? "manual"} verified={Boolean(billing.dateSources.nextDueDate)} /> : null },
              { label: "Expiration", value: billing.expirationDate ? <DateValue date={billing.expirationDate} source={billing.dateSources.expirationDate?.source ?? "manual"} verified={Boolean(billing.dateSources.expirationDate)} /> : null },
              { label: "Auto-renew", value: billing.autoRenew.toLowerCase() },
            ]} />
          ) : (
            <p className="text-xs font-medium text-slate-600">{billing?.billingHidden ? "Amounts are hidden for your role." : "No subscription is recorded yet. Add one on the Billing tab to track due dates and cost."}</p>
          )}
        </Section>
      </div>
      {status && status.alerts.length > 0 && (
        <Section title="Open alerts" flush>
          <ul className="divide-y divide-slate-100 text-xs">{status.alerts.map((a) => <li key={a.id} className="flex items-center justify-between gap-2 px-4 py-2"><span className="font-semibold">{a.title}</span><span className="flex items-center gap-2"><Chip tone={a.severity === "critical" ? "red" : "amber"}>{a.severity}</Chip><span className="text-slate-500">{formatRelative(a.raisedAt)}</span></span></li>)}</ul>
        </Section>
      )}
    </div>
  );
}
