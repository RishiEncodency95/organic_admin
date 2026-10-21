"use client";

import { daysLabel, formatRelative } from "./format";
import { StatusChip } from "./server-monitoring";
import type { HealthStatus } from "./monitoring-types";
import type { AssetDetail } from "./types";
import { Section } from "./ui";

interface Dimension {
  key: string;
  label: string;
  status: HealthStatus;
  reason: string;
}

const RANK: Record<HealthStatus, number> = { unknown: 0, ok: 1, warning: 2, critical: 3 };

/**
 * Explainable domain health from stored facts only. Missing data is "unknown", never a failure, and nothing here is a
 * security score: each line says exactly which check it came from.
 */
export function evaluateDomainHealth(a: AssetDetail, now = Date.now()): { overall: HealthStatus; dimensions: Dimension[]; confidence: "high" | "medium" | "low" } {
  const d = a.domain;
  const dims: Dimension[] = [];
  if (!d) return { overall: "unknown", dimensions: dims, confidence: "low" };

  const exp = d.effectiveExpiry?.date ? Math.round((new Date(d.effectiveExpiry.date).getTime() - now) / 86_400_000) : null;
  dims.push(
    exp === null
      ? { key: "registration", label: "Registration", status: "unknown", reason: "No expiry date is known. The registry did not publish one, or it has not been looked up yet." }
      : exp < 0
        ? { key: "registration", label: "Registration", status: "critical", reason: `The registration expired ${-exp} day${exp === -1 ? "" : "s"} ago.` }
        : exp <= 7
          ? { key: "registration", label: "Registration", status: "critical", reason: `Expires in ${daysLabel(exp)}.` }
          : exp <= 30
            ? { key: "registration", label: "Registration", status: "warning", reason: `Expires in ${daysLabel(exp)}.` }
            : { key: "registration", label: "Registration", status: "ok", reason: `Expires in ${exp} days (${d.effectiveExpiry?.source === "manual" ? "entered manually" : "registry"}).` },
  );

  const rdap = d.rdapState;
  dims.push(
    rdap === "OK"
      ? { key: "registry", label: "Registry lookup", status: "ok", reason: `Registry data received ${d.rdapCheckedAt ? formatRelative(d.rdapCheckedAt) : ""}.`.trim() }
      : rdap === "NEVER"
        ? { key: "registry", label: "Registry lookup", status: "unknown", reason: "Not looked up yet." }
        : ["NO_EXPIRY", "UNSUPPORTED", "RESTRICTED", "NOT_FOUND"].includes(rdap)
          ? { key: "registry", label: "Registry lookup", status: "unknown", reason: d.rdapError ?? "The registry does not provide this data for the domain." }
          : { key: "registry", label: "Registry lookup", status: "warning", reason: d.rdapError ?? "The last lookup failed. Previously known dates are kept." },
  );

  dims.push(
    d.dnsState === "OK"
      ? { key: "dns", label: "DNS resolution", status: "ok", reason: `All record types resolved ${d.dnsCheckedAt ? formatRelative(d.dnsCheckedAt) : ""}.`.trim() }
      : d.dnsState === "PARTIAL"
        ? { key: "dns", label: "DNS resolution", status: "warning", reason: d.dnsError ?? "Some record types could not be looked up." }
        : d.dnsState === "ERROR"
          ? { key: "dns", label: "DNS resolution", status: "warning", reason: d.dnsError ?? "DNS lookups failed. This can be a resolver problem, not necessarily the domain." }
          : { key: "dns", label: "DNS resolution", status: "unknown", reason: "Not checked yet." },
  );

  const ns = d.nameservers.length;
  dims.push(ns > 0 ? { key: "ns", label: "Nameservers", status: "ok", reason: `${ns} registered nameserver${ns === 1 ? "" : "s"}.` } : { key: "ns", label: "Nameservers", status: "unknown", reason: "The registry did not list nameservers." });

  const certs = a.certificates;
  const expired = certs.filter((c) => c.state === "EXPIRED").length;
  const expiring = certs.filter((c) => c.state === "EXPIRING").length;
  const untrusted = certs.filter((c) => c.trusted === false).length;
  dims.push(
    certs.length === 0 || certs.every((c) => !c.lastCheckedAt)
      ? { key: "ssl", label: "SSL certificate", status: "unknown", reason: "No certificate has been checked yet." }
      : expired
        ? { key: "ssl", label: "SSL certificate", status: "critical", reason: `${expired} certificate${expired === 1 ? " has" : "s have"} expired.` }
        : untrusted
          ? { key: "ssl", label: "SSL certificate", status: "warning", reason: `${untrusted} certificate${untrusted === 1 ? " is" : "s are"} not trusted (chain or hostname problem).` }
          : expiring
            ? { key: "ssl", label: "SSL certificate", status: "warning", reason: `${expiring} certificate${expiring === 1 ? "" : "s"} expiring within 30 days.` }
            : { key: "ssl", label: "SSL certificate", status: "ok", reason: "Valid and trusted at the last live check." },
  );

  dims.push(
    d.dnssec === true
      ? { key: "dnssec", label: "DNSSEC", status: "ok", reason: "The delegation is signed." }
      : { key: "dnssec", label: "DNSSEC", status: "unknown", reason: d.dnssec === false ? "Not signed. DNSSEC is optional." : "Not reported by the registry." },
  );

  const worst = dims.reduce<HealthStatus>((acc, x) => (RANK[x.status] > RANK[acc] ? x.status : acc), "unknown");
  const known = dims.filter((x) => x.status !== "unknown").length;
  return { overall: worst, dimensions: dims, confidence: known >= 5 ? "high" : known >= 3 ? "medium" : "low" };
}

export function DomainHealthCard({ asset }: { asset: AssetDetail }) {
  const h = evaluateDomainHealth(asset);
  return (
    <Section title="Domain health" description={`Confidence: ${h.confidence}. Each line names its source; unknown is not a failure and this is not a security rating.`} action={<StatusChip status={h.overall} />}>
      <ul className="grid gap-1 sm:grid-cols-2 xl:grid-cols-3">
        {h.dimensions.map((x) => (
          <li key={x.key} className="rounded-sm border border-slate-200 p-2.5">
            <div className="flex items-center justify-between gap-2"><span className="text-[11px] font-semibold text-slate-600">{x.label}</span><StatusChip status={x.status} /></div>
            <p className="mt-1 text-[11px] font-medium normal-case text-slate-600">{x.reason}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
