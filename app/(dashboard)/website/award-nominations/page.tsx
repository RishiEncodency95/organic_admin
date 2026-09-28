"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ExternalLink, RefreshCw, Trash2, XCircle } from "lucide-react";
import Table, { Column } from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Input, Select } from "@/components/ui/Input";
import { formatDateTime } from "@/lib/statusMeta";
import { ApiRequestError } from "@/lib/api";
import {
  nominationsApi,
  NOMINATION_STATUS_LABELS,
  type AwardNomination,
  type NominationStatus,
} from "@/lib/nominationsApi";

const STATUS_TONE: Record<NominationStatus, "pending" | "progress" | "success" | "danger"> = {
  pending: "pending",
  shortlisted: "progress",
  approved: "success",
  rejected: "danger",
};

function Verified({ ok }: { ok: boolean }) {
  return ok ? (
    <CheckCircle2 className="inline h-3.5 w-3.5 text-green-600" aria-label="Verified" />
  ) : (
    <XCircle className="inline h-3.5 w-3.5 text-gray-400" aria-label="Not verified" />
  );
}

function DetailRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-3 border-b border-surface-border py-2 text-sm last:border-0">
      <dt className="font-medium text-text-muted">{label}</dt>
      <dd className="whitespace-pre-wrap break-words text-text-primary">{value || "—"}</dd>
    </div>
  );
}

function FileLink({ url, name }: { url: string; name: string }) {
  if (!url) return <>—</>;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent underline">
      {name || "Open file"} <ExternalLink className="h-3 w-3" />
    </a>
  );
}

export default function AwardNominationsPage() {
  const [nominations, setNominations] = useState<AwardNomination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selected, setSelected] = useState<AwardNomination | null>(null);
  const [savingStatus, setSavingStatus] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<AwardNomination | null>(null);
  const [deleting, setDeleting] = useState(false);

  // State is only set once the request settles, so this is safe to start from an effect.
  const fetchNominations = () =>
    nominationsApi
      .list()
      .then(setNominations)
      .catch((err) => {
        setError(err instanceof ApiRequestError ? err.message : "Could not load award nominations.");
      })
      .finally(() => setLoading(false));

  useEffect(() => {
    fetchNominations();
  }, []);

  const load = () => {
    setLoading(true);
    setError(null);
    fetchNominations();
  };

  const categories = useMemo(
    () => Array.from(new Set(nominations.map((n) => n.awardCategory).filter(Boolean))).sort(),
    [nominations]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return nominations.filter((n) => {
      if (statusFilter && n.status !== statusFilter) return false;
      if (categoryFilter && n.awardCategory !== categoryFilter) return false;
      if (!term) return true;
      return [n.orgName, n.contactPerson, n.email, n.mobile, n.city]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term));
    });
  }, [nominations, search, statusFilter, categoryFilter]);

  const changeStatus = async (nomination: AwardNomination, status: NominationStatus) => {
    setSavingStatus(true);
    try {
      const updated = await nominationsApi.updateStatus(nomination._id, status);
      setNominations((prev) => prev.map((n) => (n._id === updated._id ? updated : n)));
      setSelected(updated);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not update the status.");
    } finally {
      setSavingStatus(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await nominationsApi.remove(pendingDelete._id);
      setNominations((prev) => prev.filter((n) => n._id !== pendingDelete._id));
      if (selected?._id === pendingDelete._id) setSelected(null);
      setPendingDelete(null);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not delete the nomination.");
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<AwardNomination>[] = [
    {
      key: "nominee",
      header: "Nominee",
      render: (n) => (
        <div>
          <p className="font-medium text-text-primary">{n.orgName}</p>
          <p className="text-xs text-text-muted">{n.applicantType}</p>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (n) => (
        <div>
          <p>{n.contactPerson}</p>
          <p className="text-xs text-text-muted">
            {n.mobile} <Verified ok={n.mobileVerified} />
          </p>
          <p className="text-xs text-text-muted">
            {n.email} <Verified ok={n.emailVerified} />
          </p>
        </div>
      ),
    },
    { key: "category", header: "Award Category", render: (n) => n.awardCategory || "—" },
    {
      key: "location",
      header: "Location",
      render: (n) => [n.city, n.stateCountry].filter(Boolean).join(", ") || "—",
    },
    { key: "experience", header: "Experience", render: (n) => n.yearsExperience || "—" },
    {
      key: "status",
      header: "Status",
      render: (n) => <Badge tone={STATUS_TONE[n.status] ?? "pending"}>{NOMINATION_STATUS_LABELS[n.status] ?? n.status}</Badge>,
    },
    { key: "createdAt", header: "Submitted", render: (n) => formatDateTime(n.createdAt) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Award Nominations</h1>
          <p className="text-xs text-text-muted">
            Nominations submitted through the website form (/awards/nominations). Click a row to see the full nomination.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {error && (
        <div className="border border-status-danger-bg bg-status-danger-bg/40 px-3 py-2 text-sm text-status-danger-text">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Input
            label="Search"
            placeholder="Search by name, contact person, email, mobile or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-64">
          <Select label="Award Category" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-full sm:w-48">
          <Select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {Object.entries(NOMINATION_STATUS_LABELS).map(([value, label]) => (
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
        emptyMessage="No award nominations match these filters."
        onRowClick={setSelected}
        pageSize={15}
      />

      <Modal
        isOpen={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? `Nomination — ${selected.orgName}` : "Nomination"}
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
                  disabled={savingStatus}
                  onChange={(e) => changeStatus(selected, e.target.value as NominationStatus)}
                  className="h-8 rounded-md border border-surface-border bg-surface-card px-2 text-xs text-text-primary"
                >
                  {Object.entries(NOMINATION_STATUS_LABELS).map(([value, label]) => (
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
            <dl>
              <DetailRow label="Applicant Type" value={selected.applicantType} />
              <DetailRow label="Full Name / Org" value={selected.orgName} />
              <DetailRow label="Contact Person" value={selected.contactPerson} />
              <DetailRow label="Designation" value={selected.designation} />
              <DetailRow
                label="Mobile"
                value={
                  <>
                    {selected.mobile} <Verified ok={selected.mobileVerified} />
                  </>
                }
              />
              <DetailRow
                label="Email"
                value={
                  <>
                    {selected.email} <Verified ok={selected.emailVerified} />
                  </>
                }
              />
              <DetailRow label="Website" value={selected.website} />
              <DetailRow label="City" value={selected.city} />
              <DetailRow label="State / Country" value={selected.stateCountry} />
              <DetailRow label="Award Category" value={selected.awardCategory} />
              <DetailRow label="Brief Profile" value={selected.briefProfile} />
              <DetailRow label="Years of Experience" value={selected.yearsExperience} />
              <DetailRow label="Team Size" value={selected.teamSize} />
              <DetailRow label="Key Services" value={selected.keyServices} />
              <DetailRow label="Key Achievements" value={selected.keyAchievements} />
              <DetailRow label="Unique Contribution" value={selected.uniqueContribution} />
              <DetailRow label="Impact Created" value={selected.impactCreated} />
              <DetailRow label="Innovation" value={selected.innovation} />
              <DetailRow label="Why Deserve" value={selected.whyDeserve} />
              <DetailRow label="Profile Deck" value={<FileLink url={selected.deckFile} name={selected.deckFileName} />} />
              <DetailRow label="Certifications" value={<FileLink url={selected.certFile} name={selected.certFileName} />} />
              <DetailRow label="Images / Videos" value={<FileLink url={selected.mediaFile} name={selected.mediaFileName} />} />
              <DetailRow label="Social Link" value={selected.socialLink} />
              <DetailRow label="Declaration" value={selected.declaration ? "Accepted" : "Not accepted"} />
              <DetailRow label="Submitted" value={formatDateTime(selected.createdAt)} />
            </dl>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        title="Delete nomination"
        description={`The nomination from "${pendingDelete?.orgName ?? ""}" will be permanently removed.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
