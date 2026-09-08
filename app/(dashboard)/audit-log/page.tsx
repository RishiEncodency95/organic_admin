"use client";

import { useEffect, useState } from "react";
import Table, { Column } from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { Select } from "@/components/ui/Input";
import { auditApi } from "@/lib/auditApi";
import { AuditLogEntry } from "@/lib/types";
import { formatDateTime } from "@/lib/statusMeta";

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [actionTypes, setActionTypes] = useState<string[]>([]);
  const [entityTypes, setEntityTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [selected, setSelected] = useState<AuditLogEntry | null>(null);

  useEffect(() => {
    auditApi.actionTypes().then(setActionTypes).catch(() => setActionTypes([]));
    auditApi.entityTypes().then(setEntityTypes).catch(() => setEntityTypes([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    auditApi
      .list({ action: actionFilter || undefined, entityType: entityFilter || undefined })
      .then(setLogs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [actionFilter, entityFilter]);

  const columns: Column<AuditLogEntry>[] = [
    { key: "at", header: "When", render: (l) => formatDateTime(l.at) },
    { key: "actorName", header: "Actor", render: (l) => l.actorName },
    { key: "action", header: "Action", render: (l) => <Badge tone="neutral">{l.action}</Badge> },
    { key: "entityType", header: "Entity", render: (l) => l.entityType },
    { key: "entityId", header: "Entity ID", render: (l) => (l.entityId ? l.entityId.slice(-8) : "—") },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Audit Log</h1>
        <p className="text-xs text-text-muted">
          Immutable record of every sensitive action (BR-08) — most recent 200 entries matching the filters below.
        </p>
      </div>

      <div className="grid max-w-md grid-cols-2 gap-3">
        <Select label="Action" value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
          <option value="">All actions</option>
          {actionTypes.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </Select>
        <Select label="Entity Type" value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)}>
          <option value="">All entities</option>
          {entityTypes.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </Select>
      </div>

      <Table columns={columns} rows={logs} rowKey={(l) => l._id} loading={loading} emptyMessage="No audit entries match these filters." onRowClick={setSelected} />

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.action ?? ""} size="lg">
        {selected && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="font-semibold uppercase tracking-wide text-text-muted">When</p>
                <p className="text-text-primary">{formatDateTime(selected.at)}</p>
              </div>
              <div>
                <p className="font-semibold uppercase tracking-wide text-text-muted">Actor</p>
                <p className="text-text-primary">{selected.actorName}</p>
              </div>
              <div>
                <p className="font-semibold uppercase tracking-wide text-text-muted">Entity</p>
                <p className="text-text-primary">
                  {selected.entityType} {selected.entityId ? `(${selected.entityId})` : ""}
                </p>
              </div>
            </div>
            {selected.before !== undefined && (
              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted">Before</p>
                <pre className="overflow-x-auto rounded-lg bg-surface-sunken p-3 text-[11px]">{JSON.stringify(selected.before, null, 2)}</pre>
              </div>
            )}
            {selected.after !== undefined && (
              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted">After</p>
                <pre className="overflow-x-auto rounded-lg bg-surface-sunken p-3 text-[11px]">{JSON.stringify(selected.after, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
