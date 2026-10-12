"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, RefreshCw, Save, Trash2, UserCheck } from "lucide-react";
import Table, { Column } from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Input, Select } from "@/components/ui/Input";
import { formatDateTime } from "@/lib/statusMeta";
import { ApiRequestError } from "@/lib/api";
import {
  advisoryNominationsApi,
  ADVISORY_STATUS_LABELS,
  type AdvisoryNomination,
  type AdvisoryNominationStatus,
} from "@/lib/advisoryNominationsApi";

/*
 * Advisory Board nominations from the website form (/about/nominate_advisory_board).
 * The team reviews them here: status (pending → shortlisted → approved / rejected) and an
 * internal note. The submitted content itself is not editable.
 */

const STATUS_TONE: Record<AdvisoryNominationStatus, "pending" | "progress" | "success" | "danger"> = {
  pending: "pending",
  shortlisted: "progress",
  approved: "success",
  rejected: "danger",
};

const errorText = (err: unknown, fallback: string) => (err instanceof ApiRequestError ? err.message : fallback);

function DetailRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[150px_1fr] gap-3 border-b border-surface-border py-2 text-sm last:border-0">
      <dt className="font-medium text-text-muted">{label}</dt>
      <dd className="whitespace-pre-wrap break-words text-text-primary">{value || "—"}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-3">
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-accent">{title}</h3>
      <dl>{children}</dl>
    </section>
  );
}

const linkedinHref = (url: string) => (/^https?:\/\//i.test(url) ? url : `https://${url}`);

export default function AdvisoryNominationsPage() {
  const [nominations, setNominations] = useState<AdvisoryNomination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<AdvisoryNomination | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [pendingDelete, setPendingDelete] = useState<AdvisoryNomination | null>(null);
  const [deleting, setDeleting] = useState(false);

  // State is only set once the request settles, so this is safe to start from an effect.
  const fetchNominations = () =>
    advisoryNominationsApi
      .list()
      .then(setNominations)
      .catch((err) => setError(errorText(err, "Could not load advisory nominations.")))
      .finally(() => setLoading(false));

  useEffect(() => {
    fetchNominations();
  }, []);

  const load = () => {
    setLoading(true);
    setError(null);
    fetchNominations();
  };

  const open = (n: AdvisoryNomination) => {
    setSelected(n);
    setNote(n.adminNote || "");
    setNotice("");
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: nominations.length };
    for (const n of nominations) c[n.status] = (c[n.status] || 0) + 1;
    return c;
  }, [nominations]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return nominations.filter((n) => {
      if (statusFilter && n.status !== statusFilter) return false;
      if (!term) return true;
      return [n.nominee.name, n.nominee.email, n.nominee.phone, n.nominee.organisation, n.nominator.name, n.nominator.email, n.expertiseArea]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(term));
    });
  }, [nominations, search, statusFilter]);

  const save = async (data: { status?: AdvisoryNominationStatus; adminNote?: string }) => {
    if (!selected) return;
    setSaving(true);
    setNotice("");
    try {
      const updated = await advisoryNominationsApi.update(selected._id, data);
      setNominations((prev) => prev.map((n) => (n._id === updated._id ? updated : n)));
      setSelected(updated);
      setNotice(data.status ? `Status changed to ${ADVISORY_STATUS_LABELS[data.status]}.` : "Note saved.");
    } catch (err) {
      setError(errorText(err, "Could not update the nomination."));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await advisoryNominationsApi.remove(pendingDelete._id);
      setNominations((prev) => prev.filter((n) => n._id !== pendingDelete._id));
      if (selected?._id === pendingDelete._id) setSelected(null);
      setPendingDelete(null);
    } catch (err) {
      setError(errorText(err, "Could not delete the nomination."));
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<AdvisoryNomination>[] = [
    {
      key: "nominee",
      header: "Nominee",
      render: (n) => (
        <div>
          <p className="font-medium text-text-primary">{n.nominee.name}</p>
          <p className="text-xs text-text-muted">
            {n.nominee.designation}, {n.nominee.organisation}
          </p>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Nominee Contact",
      render: (n) => (
        <div className="text-xs">
          <p>{n.nominee.phone}</p>
          <p className="text-text-muted">{n.nominee.email}</p>
        </div>
      ),
    },
    { key: "expertise", header: "Expertise / Sector", render: (n) => <span className="text-xs">{[n.expertiseArea, n.nominee.industry].filter(Boolean).join(" · ")}</span> },
    {
      key: "nominator",
      header: "Nominated By",
      render: (n) =>
        n.selfNomination ? (
          <span className="inline-flex items-center gap-1 text-xs text-text-muted">
            <UserCheck className="h-3.5 w-3.5" /> Self-nomination
          </span>
        ) : (
          <div className="text-xs">
            <p>{n.nominator.name}</p>
            <p className="text-text-muted">{n.relationship}</p>
          </div>
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (n) => <Badge tone={STATUS_TONE[n.status] ?? "pending"}>{ADVISORY_STATUS_LABELS[n.status] ?? n.status}</Badge>,
    },
    { key: "createdAt", header: "Submitted", render: (n) => formatDateTime(n.createdAt) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Advisory Nominations</h1>
          <p className="text-xs text-text-muted">
            Advisory Board nominations from the website (/about/nominate_advisory_board). Click a row to review it.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {/* Status counts — click to filter */}
      <div className="flex flex-wrap gap-2">
        {(["", "pending", "shortlisted", "approved", "rejected"] as const).map((s) => (
          <button
            key={s || "all"}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              statusFilter === s ? "border-accent bg-accent text-white" : "border-surface-border text-text-secondary hover:border-accent"
            }`}
          >
            {s ? ADVISORY_STATUS_LABELS[s] : "All"} ({(s ? counts[s] : counts.all) || 0})
          </button>
        ))}
      </div>

      {error && <div className="border border-status-danger-bg bg-status-danger-bg/40 px-3 py-2 text-sm text-status-danger-text">{error}</div>}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Input label="Search" placeholder="Search nominee, nominator, email, mobile, organisation or expertise..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="w-full sm:w-48">
          <Select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {Object.entries(ADVISORY_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <Table
        columns={columns}
        rows={filtered}
        rowKey={(n) => n._id}
        loading={loading}
        emptyMessage={nominations.length ? "No nominations match these filters." : "No advisory nominations yet."}
        onRowClick={open}
        pageSize={15}
      />

      <Modal
        isOpen={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? `Nomination — ${selected.nominee.name}` : "Nomination"}
        size="lg"
        footer={
          selected && (
            <div className="flex w-full flex-wrap items-center justify-between gap-2">
              <Button variant="danger" size="sm" onClick={() => setPendingDelete(selected)}>
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted">Status</span>
                <select
                  value={selected.status}
                  disabled={saving}
                  onChange={(e) => save({ status: e.target.value as AdvisoryNominationStatus })}
                  className="h-8 rounded-md border border-surface-border bg-surface-card px-2 text-xs text-text-primary"
                >
                  {Object.entries(ADVISORY_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )
        }
      >
        {selected && (
          <div className="max-h-[60vh] overflow-y-auto pr-1">
            <Section title="Nominee">
              <DetailRow label="Name" value={selected.nominee.name} />
              <DetailRow label="Designation" value={selected.nominee.designation} />
              <DetailRow label="Organisation" value={selected.nominee.organisation} />
              <DetailRow label="Industry / Sector" value={selected.nominee.industry} />
              <DetailRow label="Mobile" value={selected.nominee.phone} />
              <DetailRow label="Email" value={selected.nominee.email} />
              <DetailRow
                label="LinkedIn"
                value={
                  selected.nominee.linkedin && (
                    <a href={linkedinHref(selected.nominee.linkedin)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent underline">
                      {selected.nominee.linkedin} <ExternalLink className="h-3 w-3" />
                    </a>
                  )
                }
              />
            </Section>
            <Section title="Expertise & Contribution">
              <DetailRow label="Area of Expertise" value={selected.expertiseArea} />
              <DetailRow label="Key Achievements" value={selected.achievements} />
              <DetailRow label="Why the Board" value={selected.reason} />
            </Section>
            <Section title="Nominated By">
              <DetailRow label="Relationship" value={selected.selfNomination ? "Self-nomination" : selected.relationship} />
              {!selected.selfNomination && (
                <>
                  <DetailRow label="Name" value={selected.nominator.name} />
                  <DetailRow label="Designation" value={selected.nominator.designation} />
                  <DetailRow label="Organisation" value={selected.nominator.organisation} />
                  <DetailRow label="Mobile" value={selected.nominator.phone} />
                  <DetailRow label="Email" value={selected.nominator.email} />
                </>
              )}
            </Section>
            <Section title="Other">
              <DetailRow label="Additional Info" value={selected.additionalInfo} />
              <DetailRow label="Declaration" value={selected.declaration ? "Accepted" : "Not accepted"} />
              <DetailRow label="Submitted" value={formatDateTime(selected.createdAt)} />
              {selected.statusUpdatedAt && (
                <DetailRow label="Status Updated" value={`${formatDateTime(selected.statusUpdatedAt)}${selected.statusUpdatedBy ? ` by ${selected.statusUpdatedBy}` : ""}`} />
              )}
            </Section>

            <section className="rounded-md border border-surface-border p-3">
              <label className="mb-1 block text-xs font-semibold text-text-secondary">Internal note (only the team sees this)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={2000}
                rows={3}
                placeholder="e.g. Called on 12 Oct, interested — share board details"
                className="w-full rounded-md border border-surface-border bg-surface-card px-2.5 py-1.5 text-sm text-text-primary outline-none focus:border-accent"
              />
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-xs text-green-700">{notice}</span>
                <Button size="sm" onClick={() => save({ adminNote: note })} disabled={saving || note === (selected.adminNote || "")}>
                  <Save className="h-3.5 w-3.5" /> Save note
                </Button>
              </div>
            </section>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        title="Delete nomination"
        description={`The nomination of "${pendingDelete?.nominee.name ?? ""}" will be permanently removed.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
