"use client";

import Link from "next/link";
import { CalendarCheck2, CalendarX2, Globe2, KeyRound, ShieldAlert } from "lucide-react";
import { CountBars, Donut, SERIES } from "./charts";
import { formatDateTime } from "./format";
import { useDomainAnalytics } from "./monitoring-api";
import type { DomainAnalytics } from "./monitoring-types";
import { Chip, EmptyState, Notice, Section, Skeleton, StatStrip } from "./ui";

const CERT_LABEL: Record<string, string> = { VALID: "Valid", EXPIRING: "Expiring (≤ 30 days)", EXPIRED: "Expired", UNKNOWN: "Not checked / unknown" };

/** Portfolio-level domain charts. Every series is computed from stored rows and check history, never sampled or invented. */
export function DomainSummaryCards() {
  const q = useDomainAnalytics();
  if (q.isLoading) return <Skeleton className="h-[86px]" />;
  if (q.isError || !q.data) return null;
  const d: DomainAnalytics = q.data;
  if (d.totals.domains === 0) return null;
  return (
    <StatStrip
      title="Domain summary"
      items={[
        { label: "Domains", value: d.totals.domains, icon: Globe2, tip: `${d.totals.domains} tracked` },
        { label: "Expiry known", value: d.totals.withKnownExpiry, tone: "green", icon: CalendarCheck2, tip: "Registry or confirmed" },
        { label: "Expiry unknown", value: d.totals.unknownExpiry, tone: d.totals.unknownExpiry ? "amber" : undefined, icon: CalendarX2, tip: "Not published / not looked up" },
        { label: "DNSSEC", value: `${d.totals.dnssecSigned} signed`, icon: KeyRound, tip: `${d.totals.dnssecUnsigned} unsigned` },
        { label: "Certificates at risk", value: (d.certificates.EXPIRING ?? 0) + (d.certificates.EXPIRED ?? 0), tone: (d.certificates.EXPIRING ?? 0) + (d.certificates.EXPIRED ?? 0) ? "amber" : undefined, icon: ShieldAlert, tip: "≤ 30 days or expired" },
      ]}
    />
  );
}

/** Charts + DNS changes — table ke neeche aate hain. Single-domain portfolio ke liye compact summary. */
export function DomainAnalyticsCharts() {
  const q = useDomainAnalytics();
  if (q.isLoading) return <div className="grid gap-1 lg:grid-cols-3"><Skeleton className="h-52" /><Skeleton className="h-52" /><Skeleton className="h-52" /></div>;
  if (q.isError || !q.data) return <Notice tone="red" title="Domain analytics could not be loaded">{q.error instanceof Error ? q.error.message : "Try again shortly."}</Notice>;
  const d: DomainAnalytics = q.data;
  if (d.totals.domains === 0) return null;
  const hasHistory = d.checkHistory.some((x) => x.dnsOk + x.dnsFailed + x.rdapOk + x.rdapFailed > 0);
  const failTotal = d.checkHistory.reduce((s, x) => s + x.dnsFailed + x.rdapFailed, 0);
  return (
    <div className="space-y-1">
      {/* Row 1: 2 graphs — expiry + lookups */}
      <div className="grid gap-1 lg:grid-cols-2">
        <Section title="Expiry timeline" description="Domains by time until registry expiry"><CountBars ariaLabel="Domains grouped by time to expiry" rows={d.expiryWindows} color={SERIES.cpu} height={180} /></Section>
        <Section title="Lookups completed" description="Registry + DNS checks per day, last 14 days">
          {hasHistory ? <CountBars ariaLabel="Successful lookups per day" rows={d.checkHistory.map((x) => ({ label: x.day.slice(8), value: x.dnsOk + x.rdapOk }))} color={SERIES.rx} height={180} /> : <p className="px-1 py-2 text-xs font-normal capitalize text-slate-400">No checks recorded yet.</p>}
        </Section>
      </div>
      {/* Row 2: 3 small — registrar + certificate + failures */}
      <div className="grid gap-1 lg:grid-cols-3">
        <Section title="Registrar" description="Domains grouped by registrar">
          {d.registrars.length === 0 ? (
            <p className="px-1 py-2 text-xs font-normal capitalize text-slate-400">No registrar data yet.</p>
          ) : (
            <ul className="space-y-1">
              {d.registrars.map((r) => (
                <li key={r.label} className="flex items-center justify-between gap-1 text-xs font-normal text-slate-600">
                  <span className="truncate">{r.label}</span>
                  <span className="shrink-0 tabular-nums text-slate-800">{r.value}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>
        <Section title="Certificate health" description="Live TLS state of monitored hostnames">
          {Object.values(d.certificates).every((v) => !v) ? (
            <p className="px-1 py-2 text-xs font-normal capitalize text-slate-400">No certificate data yet.</p>
          ) : (
            <ul className="space-y-1">
              {Object.entries(d.certificates).filter(([, v]) => v > 0).map(([k, v]) => (
                <li key={k} className="flex items-center justify-between gap-1 text-xs font-normal text-slate-600">
                  <span className="truncate">{CERT_LABEL[k] ?? k}</span>
                  <span className="shrink-0 tabular-nums text-slate-800">{v}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>
        {failTotal > 0 ? (
          <Section title="Lookup failures" description="Failed registry or DNS checks per day">
            <CountBars ariaLabel="Failed lookups per day" rows={d.checkHistory.map((x) => ({ label: x.day.slice(8), value: x.dnsFailed + x.rdapFailed }))} color={SERIES.cpu} height={160} />
          </Section>
        ) : (
          <Section title="Lookup failures" description="Failed registry or DNS checks per day">
            <p className="px-1 py-2 text-xs font-normal capitalize text-slate-400">No failures — all lookups succeeded.</p>
          </Section>
        )}
      </div>
      {d.dnsChanges.length > 0 && (
        <Section title="Recent DNS changes" description="Detected between consecutive snapshots (last 90 days)" flush>
          <ul className="divide-y divide-slate-100 text-xs">
            {d.dnsChanges.slice(0, 8).map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-1 px-4 py-2">
                <Link href={`/infrastructure/assets/${c.assetId}`} className="font-medium normal-case text-slate-800 hover:text-red-700">{c.domain}</Link>
                <span className="flex flex-wrap items-center gap-1">{c.types.map((t) => <Chip key={t}>{t}</Chip>)}<span className="text-slate-500">{formatDateTime(c.at)}</span></span>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

/** Back-compat: cards + charts ek saath (koi aur jagah use kare to). */
export function DomainAnalyticsSection() {
  return (
    <div className="space-y-1">
      <DomainSummaryCards />
      <DomainAnalyticsCharts />
    </div>
  );
}
