"use client";

import { useState } from "react";
import { KeyRound, Link2Off, Plug, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { ConnectionDialog } from "./dialogs";
import { infraApi } from "./api";
import { CAPABILITY_LABEL, CONNECTION_STATUS, formatDateTime, formatRam, formatRelative, formatStorage } from "./format";
import { errorMessage, useInfraMutation, useProviders } from "./hooks";
import { Chip, ConfirmButton, EmptyState, Modal, Notice, Section, Skeleton, Spinner, Td, Th, btn, btnPrimary, field, useRoleFlags } from "./ui";
import type { Connection, ProviderCatalogueEntry, RemoteInstance } from "./types";

const CAP_ROWS: Array<[keyof ProviderCatalogueEntry["capabilities"], string]> = [["inventory", "Inventory"], ["configuration", "Configuration"], ["networking", "Networking"], ["billing", "Billing dates"], ["utilization", "Live usage"]];

export function ProvidersPage() {
  const q = useProviders();
  const { canManage } = useRoleFlags();
  const [connect, setConnect] = useState<ProviderCatalogueEntry | null>(null);
  const [replace, setReplace] = useState<Connection | null>(null);
  const [browse, setBrowse] = useState<Connection | null>(null);
  const test = useInfraMutation((c, id: string) => infraApi.testConnection(c, id), { success: (r) => (r.status === "CONNECTED" ? "Connection works." : "The provider did not accept the connection.") });
  const sync = useInfraMutation((c, id: string) => infraApi.syncConnection(c, id), { success: (r) => `Synchronised: ${r.seen} found, ${r.created} added, ${r.updated} updated${r.status === "PARTIAL" ? " (partial: some pages failed)" : ""}.` });
  const disconnect = useInfraMutation((c, id: string) => infraApi.disconnect(c, id), { success: "Disconnected. Credentials were deleted; imported assets were kept." });

  if (q.isLoading) return <Skeleton className="h-64" />;
  if (q.isError || !q.data) return <Notice tone="red" title="Providers could not be loaded" action={<button className={btn} onClick={() => void q.refetch()}>Try again</button>}>{errorMessage(q.error)}</Notice>;
  const { connections, providers } = q.data;
  const live = providers.filter((p) => p.live);
  const manual = providers.filter((p) => !p.live);

  return (
    <div className="space-y-1">
      <Notice tone="blue" title="Read-only by design">
        Provider connections only read inventory. This module cannot power, reset, reinstall or delete servers, change firewalls or run commands, and it never asks for SSH or root credentials.
      </Notice>

      <Section title="Connected accounts" description="Each connection can be tested, synchronised and disconnected independently." flush>
        {connections.length === 0 ? (
          <EmptyState icon={Plug} title="No provider account connected" description="You can use the whole module without one: add servers manually. Connect Contabo to import instances automatically." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {connections.map((c) => {
              const st = CONNECTION_STATUS[c.status];
              return (
                <li key={c.id} className="space-y-2 px-4 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{c.label} <span className="font-medium text-slate-500">· {c.providerLabel}</span></p>
                      <p className="text-[11px] font-medium text-slate-500">
                        {c.credentialHint ? Object.entries(c.credentialHint).map(([k, v]) => `${k}: ${v}`).join(" · ") : "No credentials saved"} · {c.importedAssets} imported · last sync {formatRelative(c.lastSyncAt)}
                        {c.lastSuccessfulSyncAt ? ` · last success ${formatDateTime(c.lastSuccessfulSyncAt)}` : ""}
                      </p>
                    </div>
                    <Chip tone={st.tone}>{st.label}</Chip>
                  </div>
                  {c.lastError && <Notice tone={c.status === "AUTH_FAILED" ? "red" : "amber"} title={c.status === "AUTH_FAILED" ? "Authentication failed" : "Last attempt reported a problem"}>{c.lastError}</Notice>}
                  {canManage && c.status !== "DISCONNECTED" && (
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className={btn} disabled={!c.credentialsSaved || test.isPending} onClick={() => test.mutate(c.id)}>{test.isPending && test.variables === c.id ? <Spinner /> : <KeyRound className="size-3.5" />}Test</button>
                      <button type="button" className={btn} disabled={!c.credentialsSaved || sync.isPending} onClick={() => sync.mutate(c.id, { onError: (e) => toast.error(errorMessage(e)) })}>{sync.isPending && sync.variables === c.id ? <Spinner /> : <RefreshCw className="size-3.5" />}Sync now</button>
                      <button type="button" className={btn} disabled={!c.credentialsSaved} onClick={() => setBrowse(c)}><Search className="size-3.5" />Browse &amp; import</button>
                      <button type="button" className={btn} onClick={() => setReplace(c)}>Replace credentials</button>
                      <ConfirmButton label={<><Link2Off className="size-3.5" />Disconnect</>} confirmLabel="Delete credentials & disconnect" onConfirm={() => disconnect.mutate(c.id)} />
                    </div>
                  )}
                  {canManage && c.status === "DISCONNECTED" && <button type="button" className={btn} onClick={() => setReplace(c)}>Reconnect with new credentials</button>}
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Section title="Available providers" description="What each provider can supply automatically, and what stays manual." flush>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse">
            <thead><tr><Th>Provider</Th>{CAP_ROWS.map(([, l]) => <Th key={l}>{l}</Th>)}<Th /></tr></thead>
            <tbody>
              {[...live, ...manual].map((p) => (
                <tr key={p.key}>
                  <Td><span className="font-semibold text-slate-900">{p.label}</span></Td>
                  {CAP_ROWS.map(([k]) => { const cap = CAPABILITY_LABEL[p.capabilities[k]]; return <Td key={k}><Chip tone={cap.tone}>{cap.label}</Chip></Td>; })}
                  <Td>{p.live && canManage ? <button type="button" className={btnPrimary} onClick={() => setConnect(p)}>Connect</button> : p.live ? null : <span className="text-[11px] text-slate-500">Add servers manually</span>}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {connect && <ConnectionDialog open onOpenChange={(o) => !o && setConnect(null)} provider={connect} />}
      {replace && providers.find((p) => p.key === replace.provider) && <ConnectionDialog open onOpenChange={(o) => !o && setReplace(null)} provider={providers.find((p) => p.key === replace.provider)!} connection={replace} />}
      {browse && <ImportDialog connection={browse} onClose={() => setBrowse(null)} />}
    </div>
  );
}

function ImportDialog({ connection, onClose }: { connection: Connection; onClose: () => void }) {
  const [instances, setInstances] = useState<RemoteInstance[] | null>(null);
  const [partial, setPartial] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [clientId, setClientId] = useState("");
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const load = useInfraMutation((c, _: void) => infraApi.instances(c, connection.id), {});
  const imp = useInfraMutation((c, body: { remoteIds?: string[]; all?: boolean; clientId: string | null }) => infraApi.importInstances(c, connection.id, body), { success: (r) => `${r.created} imported, ${r.skipped} already present.` });

  const fetchList = () => load.mutate(undefined, { onSuccess: (r) => { setInstances(r.instances); setPartial(r.errors); setLoadErr(null); }, onError: (e) => setLoadErr(errorMessage(e)) });
  const free = (instances ?? []).filter((i) => !i.imported);

  return (
    <Modal open onOpenChange={(o) => !o && onClose()} wide title={`Import from ${connection.label}`} description="Choose instances to add to your inventory. Already imported instances are never duplicated.">
      {instances === null ? (
        <div className="space-y-1">
          {loadErr && <Notice tone="red" title="Could not read the provider account">{loadErr}</Notice>}
          <button type="button" className={btnPrimary} onClick={fetchList} disabled={load.isPending}>{load.isPending && <Spinner />}Load instances</button>
        </div>
      ) : (
        <div className="space-y-1">
          {partial.length > 0 && <Notice tone="amber" title="The list may be incomplete">{partial[0]}</Notice>}
          {instances.length === 0 ? <EmptyState title="This account has no instances" /> : (
            <div className="max-h-72 overflow-auto rounded-sm border border-slate-200">
              <table className="w-full border-collapse">
                <thead><tr><Th /><Th>Name</Th><Th>IP</Th><Th>Capacity</Th><Th>Status</Th></tr></thead>
                <tbody>
                  {instances.map((i) => (
                    <tr key={i.remoteId}>
                      <Td><input type="checkbox" disabled={i.imported} aria-label={`Select ${i.name}`} checked={selected.includes(i.remoteId)} onChange={() => setSelected((s) => (s.includes(i.remoteId) ? s.filter((x) => x !== i.remoteId) : [...s, i.remoteId]))} /></Td>
                      <Td><span className="font-semibold">{i.name}</span>{i.imported && <Chip tone="green">Imported</Chip>}</Td>
                      <Td>{i.ipv4 ?? "—"}</Td>
                      <Td>{i.vcpu ?? "?"} vCPU · {formatRam(i.ramMb)} · {formatStorage(i.storageGb)}</Td>
                      <Td>{i.providerStatus ?? "—"}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className={btn} onClick={onClose}>Close</button>
            <button type="button" className={btn} disabled={!free.length || imp.isPending} onClick={() => imp.mutate({ all: true, clientId: clientId || null }, { onSuccess: onClose })}>Import all new ({free.length})</button>
            <button type="button" className={btnPrimary} disabled={!selected.length || imp.isPending} onClick={() => imp.mutate({ remoteIds: selected, clientId: clientId || null }, { onSuccess: onClose })}>{imp.isPending && <Spinner />}Import selected ({selected.length})</button>
          </div>
        </div>
      )}
    </Modal>
  );
}
