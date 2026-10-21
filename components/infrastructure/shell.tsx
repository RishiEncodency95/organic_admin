"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Server, Timer } from "lucide-react";
import { cn } from "./lib/cn";
import { useDashboard } from "./hooks";
import { formatRelative } from "./format";
import { Badge } from "./ui";

/** Same structure and styling as the Website module's shell: white header, status chips, hairline, text tabs. */
const TABS = [
  { href: "/infrastructure", label: "Overview", exact: true },
  { href: "/infrastructure/servers", label: "Servers & Hosting" },
  { href: "/infrastructure/domains", label: "Domains & DNS" },
  { href: "/infrastructure/certificates", label: "SSL Certificates" },
  { href: "/infrastructure/billing", label: "Billing & Renewals" },
  { href: "/infrastructure/providers", label: "Providers & Integrations" },
  { href: "/infrastructure/alerts", label: "Alerts & History" },
  { href: "/infrastructure/reports", label: "Reports" },
];

function activeHref(pathname: string): string {
  if (pathname.startsWith("/infrastructure/assets")) return "/infrastructure/servers";
  const hit = TABS.filter((t) => !t.exact && pathname.startsWith(t.href)).sort((a, b) => b.href.length - a.href.length)[0];
  return hit?.href ?? "/infrastructure";
}

export function InfrastructureShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/infrastructure";
  const dash = useDashboard();
  const d = dash.data;
  const t = d?.totals;
  const active = activeHref(pathname);

  return (
    <div className="-mx-4 -mt-5 min-h-[calc(100vh-4rem)] bg-gradient-to-br from-[#EEF3FC] via-[#F5F7FC] to-[#F2EFFC] px-4 pb-8 sm:-mx-5 sm:px-5 xl:-mx-6 xl:px-6">
      <div className="-mx-4 mb-4 border-b border-[#E3E9F2] bg-gradient-to-b from-[#FCFDFF] via-white to-[#F7FAFF] px-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)] sm:-mx-5 sm:px-5 xl:-mx-6 xl:px-6">
        <header className="pt-5">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-[#3B82F6] to-[#2563EB] text-white shadow-[0_4px_12px_-4px_rgba(37,99,235,0.5)] ring-1 ring-inset ring-white/20" aria-hidden>
              <Server className="size-6" />
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold capitalize tracking-tight text-[#0F1A38]">Infrastructure</h1>
              <p className="mt-1 max-w-2xl text-[13px] font-normal capitalize leading-relaxed text-[#64748B]">Servers, domains, DNS, certificates and renewals. A date is shown only when a source confirms it.</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {t && d ? (
                  <>
                    <Badge tone={t.servers === 0 ? "slate" : t.runningServers === t.servers ? "green" : t.runningServers > 0 ? "amber" : "red"} dot>{t.servers === 0 ? "No Servers" : t.runningServers === t.servers ? (t.servers === 1 ? "Server Live" : `${t.servers} Servers Live`) : `${t.runningServers}/${t.servers} Servers Live`}</Badge>
                    <Badge tone={t.servers === 0 ? "slate" : t.monitoredServers === t.servers ? "green" : t.monitoredServers > 0 ? "amber" : "slate"} dot>{t.monitoredServers === t.servers && t.servers > 0 ? (t.servers === 1 ? "Monitoring Live" : "All Monitored") : `${t.monitoredServers}/${t.servers} Monitored`}</Badge>
                    <Badge tone={t.domains === 0 ? "slate" : "blue"} dot>{t.domains} Domain{t.domains === 1 ? "" : "s"}</Badge>
                    {(d.certificateStates.EXPIRED ?? 0) > 0 ? (
                      <Badge tone="red" dot>{d.certificateStates.EXPIRED} SSL Expired</Badge>
                    ) : (d.certificateStates.EXPIRING ?? 0) > 0 ? (
                      <Badge tone="amber" dot>{d.certificateStates.EXPIRING} SSL Expiring</Badge>
                    ) : (d.certificateStates.VALID ?? 0) > 0 ? (
                      <Badge tone="green" dot>{d.certificateStates.VALID} SSL Valid</Badge>
                    ) : null}
                    {t.openAlerts > 0 ? <Badge tone="red" dot>{t.openAlerts} Open Alert{t.openAlerts === 1 ? "" : "s"}</Badge> : <Badge tone="green" dot>No Open Alerts</Badge>}
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium normal-case text-[#6B7A94]"><Timer className="size-3" aria-hidden />Updated {formatRelative(d.generatedAt)}</span>
                  </>
                ) : (
                  <span className="text-[11px] font-medium text-[#94A3B8]">Loading…</span>
                )}
              </div>
            </div>
          </div>
        </header>
        <div className="mt-4 border-t border-[#EEF2F8]">
          <nav aria-label="Servers and domains sections" className="scrollbar-thin -mb-px flex gap-1 overflow-x-auto">
            {TABS.map((tab) => {
              const isActive = tab.href === active;
              const count = tab.href.endsWith("/alerts") ? t?.openAlerts : undefined;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "shrink-0 cursor-pointer whitespace-nowrap border-b-2 px-3 py-3 text-[13px] font-semibold transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/35",
                    isActive ? "border-[#2563EB] bg-gradient-to-t from-[#E6EEFE] to-transparent text-[#1D4ED8]" : "border-transparent text-[#64748B] hover:border-[#CBD5E1] hover:bg-[#F4F7FC] hover:text-[#28354C]",
                  )}
                >
                  {tab.label}
                  {count !== undefined && count > 0 ? (
                    <span className={cn("ml-1.5 rounded-full px-1.5 py-px text-[10px] font-bold", isActive ? "bg-[#EAF2FE] text-[#1D4ED8]" : "bg-[#F1F4F9] text-[#64748B]")}>{count}</span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      <div className="space-y-4 [&_.font-mono]:normal-case">{children}</div>
    </div>
  );
}
