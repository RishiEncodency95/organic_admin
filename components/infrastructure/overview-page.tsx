"use client";

import Link from "next/link";
import { useState } from "react";
import { Activity, AlertTriangle, ArrowRight, BadgeIndianRupee, CalendarClock, CalendarX2, Globe, Hourglass, MonitorUp, Server, ShieldCheck, Terminal } from "lucide-react";
import { CountBars, Donut, MonitoringChart, SERIES } from "./charts";
import { RENEWAL_KIND_LABEL, daysLabel, daysTone, formatDateTime, formatMoney, formatMoneyList, formatRelative, providerName } from "./format";
import { errorMessage, useDashboard } from "./hooks";
import { useFleetMetrics } from "./monitoring-api";
import type { RangeKey } from "./monitoring-types";
import { RangeSelect } from "./server-monitoring";
import { BarList, Chip, DateValue, EmptyState, Notice, Section, Skeleton, StatStrip, btn, btnPrimary } from "./ui";

/** A one-line "nothing here" instead of a tall empty card. */
function Quiet({ children }: { children: string }) {
  return <p className="px-4 py-3 text-xs font-medium capitalize text-slate-500">{children}</p>;
}

/** Big money in one short term for the card face (₹1,200 → ₹1.2k). Full figure lives in the hover card. */
function shortMoneyList(list: { amount: number; currency: string }[] | null | undefined): string {
  if (!list || list.length === 0) return "—";
  return list.map((m) => {
    const abs = Math.abs(m.amount);
    const sym = m.currency === "INR" ? "₹" : `${m.currency} `;
    if (abs >= 100000) return `${sym}${(m.amount / 100000).toFixed(m.amount % 100000 === 0 ? 0 : 1)}L`;
    if (abs >= 1000) return `${sym}${(m.amount / 1000).toFixed(m.amount % 1000 === 0 ? 0 : 1)}k`;
    return formatMoney(m.amount, m.currency);
  }).join(" · ");
}

export function InfrastructureOverviewPage() {
  const q = useDashboard();
  const d = q.data;
  const [range, setRange] = useState<RangeKey>("24h");
  const monitored = d?.totals.monitoredServers ?? 0;
  const trend = useFleetMetrics(range, monitored > 0);

  if (q.isError) {
    return (
      <Notice tone="red" title="The overview could not be loaded" action={<button type="button" className={btn} onClick={() => void q.refetch()}>Try again</button>}>
        {errorMessage(q.error)}
      </Notice>
    );
  }
  if (q.isLoading || !d) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-[72px]" />
        <Skeleton className="h-[72px]" />
        <Skeleton className="h-56" />
      </div>
    );
  }

  const t = d.totals;
  const billing = d.billing;

  if (d.inventory.total === 0 && t.connectedProviders === 0) {
    return (
      <Section title="Start your infrastructure inventory" description="Add servers and domains by hand, or connect a provider account to import them.">
        <EmptyState
          icon={Server}
          title="Nothing tracked yet"
          description="Domains are looked up through public registry (RDAP), DNS and TLS data. Servers can be entered manually or imported from Contabo."
          action={
            <>
              <Link href="/infrastructure/domains" className={btnPrimary}>Add a domain</Link>
              <Link href="/infrastructure/servers" className={btn}>Add a server</Link>
              <Link href="/infrastructure/providers" className={btn}>Connect a provider</Link>
            </>
          }
        />
      </Section>
    );
  }

  const unmonitored = t.servers - t.monitoredServers;
  const expiryRows = d.domainExpiryTimeline.map((m) => ({ label: m.month, value: m.count }));
  const hasExpiry = expiryRows.some((r) => r.value > 0);
  const providerRows = d.serverDistribution.byProvider.map((p) => ({ label: providerName(p.provider), value: p.count }));
  const projection = billing?.monthlyProjection ?? [];
  const currencies = new Set(projection.flatMap((m) => m.totals.map((x) => x.currency)));
  const hasProjection = projection.some((m) => m.totals.length > 0);
  const clientRows = d.byClient.filter((c) => c.servers + c.domains > 0);

  return (
    <div className="space-y-3">
      <StatStrip
        title="Infrastructure"
        items={[
          { label: "Servers", icon: Server, value: t.servers, tip: `${t.runningServers} running · ${t.connectedProviders} provider${t.connectedProviders === 1 ? "" : "s"}`, href: "/infrastructure/servers" },
          { label: "Monitored", icon: MonitorUp, value: `${t.monitoredServers}/${t.servers}`, tip: unmonitored > 0 ? `${unmonitored} not reporting` : "All reporting", href: "/infrastructure/servers", tone: t.servers > 0 && t.monitoredServers === 0 ? "amber" : undefined },
          { label: "Need attention", icon: AlertTriangle, value: t.serversNeedingAttention, tone: t.serversNeedingAttention ? "red" : undefined, tip: "Alerts or silent collector", href: "/infrastructure/servers?attention=true" },
          { label: "Domains", icon: Globe, value: t.domains, tip: `${t.sslCertificates} SSL certificate${t.sslCertificates === 1 ? "" : "s"}`, href: "/infrastructure/domains" },
          { label: "Expiring ≤ 30 d", icon: Hourglass, value: t.expiringWithin30Days, tone: t.expiringWithin7Days ? "orange" : t.expiringWithin30Days ? "amber" : undefined, tip: `${t.expiringWithin7Days} within 7 days`, href: "/infrastructure/billing?window=30" },
          { label: "Unknown dates", icon: CalendarX2, value: t.unknownRenewalDates, tone: t.overdueOrExpired ? "red" : t.unknownRenewalDates ? "amber" : undefined, tip: t.overdueOrExpired ? `${t.overdueOrExpired} overdue` : "No renewal date known", href: "/infrastructure/billing" },
          { label: "Open alerts", icon: ShieldCheck, value: t.openAlerts, tone: t.openAlerts ? "red" : undefined, href: "/infrastructure/alerts" },
          ...(billing
            ? [
                { label: "Cost / mo", icon: BadgeIndianRupee, value: shortMoneyList(billing.monthlyEquivalent), tip: billing.excluded.unknownAmount ? `${formatMoneyList(billing.monthlyEquivalent)} — ${billing.excluded.unknownAmount} without amount` : `${formatMoneyList(billing.monthlyEquivalent)} — Normalised estimate`, href: "/infrastructure/billing" },
                { label: "Due 30 d", icon: CalendarClock, value: shortMoneyList(billing.upcomingPayments30Days), tip: `${formatMoneyList(billing.upcomingPayments30Days)} — Confirmed due dates` },
              ]
            : []),
        ]}
      />

      {unmonitored > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-1 border border-amber-200 border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50 to-white px-4 shadow-sm py-2.5 text-xs font-medium capitalize text-slate-700">
          <span className="flex items-center gap-1"><Activity className="size-3.5 shrink-0 text-amber-600" />{unmonitored} server{unmonitored === 1 ? " is" : "s are"} not sending guest metrics yet. Provider data is shown, but CPU, memory and disk need the optional collector.</span>
          <Link href="/infrastructure/servers" className={btn}><Terminal className="size-3.5" />Open servers</Link>
        </div>
      )}

      {monitored > 0 && (
        <Section title="Server resources" description={`Average across ${trend.data?.serversReporting ?? monitored} monitored server${(trend.data?.serversReporting ?? monitored) === 1 ? "" : "s"} · measured by their collectors`} action={<RangeSelect value={range} onChange={setRange} />}>
          <div className="grid gap-3 lg:grid-cols-3">
            <MonitoringChart ariaLabel="Average CPU usage" data={trend.data?.points ?? []} unit="pct" yMax={100} height={170} series={[{ key: "cpuAvg", label: "CPU", color: SERIES.cpu }]} />
            <MonitoringChart ariaLabel="Average memory and disk usage" data={trend.data?.points ?? []} unit="pct" yMax={100} kind="line" height={170} series={[{ key: "memAvg", label: "Memory", color: SERIES.mem }, { key: "diskMax", label: "Disk (peak)", color: SERIES.disk }]} />
            <MonitoringChart ariaLabel="Network traffic" data={trend.data?.points ?? []} unit="bytesPerSec" height={170} series={[{ key: "netRx", label: "In", color: SERIES.rx }, { key: "netTx", label: "Out", color: SERIES.tx }]} />
          </div>
        </Section>
      )}

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Section title="Upcoming renewals" description="Confirmed and registry-reported dates, soonest first" flush action={<Link href="/infrastructure/billing" className={btn}>All renewals<ArrowRight className="size-3.5" /></Link>}>
          {d.upcoming.length === 0 ? (
            <Quiet>No dates to show yet. They appear when a registry reports them or you enter them on a subscription.</Quiet>
          ) : (
            <ul className="divide-y divide-slate-100">
              {d.upcoming.map((i) => (
                <li key={i.key} className="flex flex-wrap items-center gap-1 border-l-2 border-transparent px-4 py-2 transition hover:border-blue-400 hover:bg-blue-50/40">
                  <span className="flex size-8 shrink-0 items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm">
                    {i.kind === "domain_expiry" ? <Globe className="size-4" /> : <CalendarClock className="size-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link href={`/infrastructure/assets/${i.assetId}`} className="block truncate text-xs font-medium normal-case text-slate-800 hover:text-blue-700">{i.assetName}</Link>
                    <p className="mt-0.5 truncate text-[11px] font-normal text-slate-500">{RENEWAL_KIND_LABEL[i.kind]}{i.amount !== null ? ` · ${formatMoney(i.amount, i.currency)}` : ""}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Chip tone={daysTone(i.daysRemaining)}>{daysLabel(i.daysRemaining)}</Chip>
                    <DateValue date={i.date} source={i.source} verified={i.verified} hideSource />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Needs attention" flush action={<Link href="/infrastructure/alerts" className={btn}>Alerts<ArrowRight className="size-3.5" /></Link>}>
          {d.alerts.length === 0 && d.failedChecks.length === 0 ? (
            <p className="flex items-center gap-1 px-4 py-3 text-xs font-normal text-slate-600"><span className="flex size-7 items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm"><ShieldCheck className="size-3.5" /></span>No open alerts and no failed checks. All clear.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {d.alerts.map((a) => (
                <li key={a.id} className="border-l-2 border-transparent px-4 py-2 transition hover:border-amber-400 hover:bg-amber-50/40">
                  <div className="flex items-center gap-1"><Chip tone={a.severity === "critical" ? "red" : a.severity === "warning" ? "amber" : "blue"}>{a.severity}</Chip><span className="truncate text-xs font-normal text-slate-800">{a.title}</span></div>
                  <p className="mt-0.5 pl-0 text-[11px] font-normal text-slate-500">{formatDateTime(a.raisedAt)}</p>
                </li>
              ))}
              {d.failedChecks.map((c, i) => (
                <li key={`${c.name}-${i}`} className="border-l-2 border-transparent px-4 py-2 transition hover:border-rose-400 hover:bg-rose-50/40">
                  <div className="flex items-center gap-1"><Chip tone="red">Failed</Chip><span className="truncate text-xs font-normal text-slate-800">{c.name} · {c.check}</span></div>
                  {c.detail && <p className="mt-0.5 text-[11px] font-normal text-slate-500">{c.detail}</p>}
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      {(hasExpiry || providerRows.length > 1 || hasProjection || clientRows.length > 1) && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-3">
          {hasExpiry && (
            <Section title="Domain expiry" description="Domains expiring per month, next 12 months">
              <CountBars ariaLabel="Domains expiring per month" rows={expiryRows} formatLabel={(m) => m.slice(5)} height={170} />
            </Section>
          )}
          {providerRows.length > 1 && (
            <Section title="Servers by provider"><Donut ariaLabel="Servers by provider" rows={providerRows} height={140} /></Section>
          )}
          {clientRows.length > 1 && (
            <Section title="By client"><BarList rows={clientRows.map((c) => ({ label: c.name, value: c.servers + c.domains, sub: `${c.servers} servers · ${c.domains} domains${c.monthlyCost?.length ? ` · ${formatMoneyList(c.monthlyCost)}/mo` : ""}` }))} /></Section>
          )}
          {hasProjection && billing && (
            <Section title="Projected payments" description={currencies.size === 1 ? `Per month in ${[...currencies][0]}, from confirmed due dates` : "Per month, per currency"}>
              {currencies.size === 1 ? (
                <CountBars ariaLabel="Projected payments per month" color={SERIES.mem} rows={projection.map((m) => ({ label: m.month, value: m.totals[0]?.amount ?? 0 }))} formatLabel={(m) => m.slice(5)} height={170} />
              ) : (
                <BarList rows={projection.map((m) => ({ label: m.month, value: m.totals.reduce((s, x) => s + x.amount, 0), sub: formatMoneyList(m.totals) })).filter((r) => r.value > 0)} />
              )}
            </Section>
          )}
        </div>
      )}

      {d.recentSync.length > 0 && (
        <Section title="Recent checks" description="Latest automated lookups and provider syncs" flush>
          <ul className="divide-y divide-slate-100">
            {d.recentSync.slice(0, 5).map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-1 border-l-2 border-transparent px-4 py-2 text-xs capitalize transition hover:border-indigo-400 hover:bg-indigo-50/40">
                <span className="flex items-center gap-1 font-semibold text-slate-800"><span className={r.status === "SUCCEEDED" ? "flex size-6 shrink-0 items-center justify-center bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100" : r.status === "FAILED" ? "flex size-6 shrink-0 items-center justify-center bg-rose-50 text-rose-600 ring-1 ring-rose-100" : "flex size-6 shrink-0 items-center justify-center bg-amber-50 text-amber-600 ring-1 ring-amber-100"}><MonitorUp className="size-3.5" /></span>{r.kind.replace(/_/g, " ").toLowerCase()} <span className="font-medium capitalize text-slate-500">· {r.trigger}</span></span>
                <span className="flex items-center gap-1">
                  {r.error && <span className="max-w-xs truncate text-[11px] font-medium capitalize text-slate-500" title={r.error}>{r.error}</span>}
                  <Chip tone={r.status === "SUCCEEDED" ? "green" : r.status === "PARTIAL" ? "amber" : r.status === "FAILED" ? "red" : "slate"}>{r.status.toLowerCase()}</Chip>
                  <span className="text-[11px] capitalize text-slate-500">{formatRelative(r.startedAt)}</span>
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}
