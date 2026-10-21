"use client";

import Link from "next/link";
import { Fragment } from "react";
import { ShieldCheck } from "lucide-react";
import { infraApi } from "./api";
import { CertRow } from "./asset-detail-page";
import { errorMessage, useCertificates, useInfraMutation } from "./hooks";
import { Chip, EmptyState, ListSkeleton, Notice, Section, Td, Th, btn, useRoleFlags } from "./ui";

export function CertificatesPage() {
  const { canWrite } = useRoleFlags();
  const q = useCertificates();
  const check = useInfraMutation((c, id: string) => infraApi.refreshCertificate(c, id), { success: "Certificate checked." });
  const rows = q.data ?? [];
  const counts = rows.reduce<Record<string, number>>((acc, c) => ({ ...acc, [c.state]: (acc[c.state] ?? 0) + 1 }), {});

  return (
    <Section
      title="SSL certificates"
      description="Read from the live TLS handshake of each monitored hostname. Auto-renew is shown only when verified separately; otherwise the next check decides."
      flush
      action={<div className="flex gap-1.5"><Chip tone="green">{counts.VALID ?? 0} valid</Chip><Chip tone="amber">{counts.EXPIRING ?? 0} expiring</Chip><Chip tone="red">{counts.EXPIRED ?? 0} expired</Chip></div>}
    >
      {q.isLoading ? <ListSkeleton /> : q.isError ? <div className="p-4"><Notice tone="red" title="Certificates could not be loaded" action={<button className={btn} onClick={() => void q.refetch()}>Try again</button>}>{errorMessage(q.error)}</Notice></div> : rows.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="No certificates monitored yet" description="Add a domain: its apex hostname is monitored automatically. Add subdomains on the domain's SSL tab." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse">
            <thead><tr><Th>Host</Th><Th>Issuer</Th><Th>Valid until</Th><Th>Remaining</Th><Th>Verification</Th><Th>Checked</Th><Th /></tr></thead>
            <tbody>
              {rows.map((c) => (
                <Fragment key={c.id}>
                  <CertRow c={c} canWrite={canWrite} onCheck={() => check.mutate(c.id)} />
                  {c.asset && <tr><Td className="!border-b-0 pt-0 text-[11px] text-slate-500" >{""}</Td><Td className="!border-b-0 pt-0 text-[11px] text-slate-500">Domain: <Link href={`/infrastructure/assets/${c.asset.id}`} className="font-semibold hover:text-red-700">{c.asset.name}</Link>{c.asset.client ? ` · ${c.asset.client}` : ""}</Td><Td>{""}</Td><Td>{""}</Td><Td>{""}</Td><Td>{""}</Td><Td>{""}</Td></tr>}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Section>
  );
}

