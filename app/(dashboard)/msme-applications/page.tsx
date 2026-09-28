"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Table, { Column } from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import { Input, Select } from "@/components/ui/Input";
import {
  msmeApi,
  MSME_STATUS_LABELS,
  MSME_REVIEW_LABELS,
  type MsmeApplication,
  type MsmeApplicationStatus,
  type MsmeReviewStatus,
} from "@/lib/msmeApi";
import { formatDateTime } from "@/lib/statusMeta";
import { ApiRequestError } from "@/lib/api";

const REVIEW_TONE: Record<MsmeReviewStatus, "neutral" | "pending" | "danger" | "success"> = {
  PENDING_REVIEW: "pending",
  APPROVED: "success",
  REJECTED: "danger",
  NEEDS_INFO: "neutral",
};

const STATUS_TONE: Record<MsmeApplicationStatus, "neutral" | "pending" | "progress" | "danger" | "success"> = {
  DRAFT: "neutral",
  ENTERPRISE_SAVED: "pending",
  PARTICIPATION_SAVED: "progress",
  PAYMENT_PENDING: "pending",
  PAYMENT_FAILED: "danger",
  SUBMITTED: "success",
};

const STALL_RATE = 11000;
const GST_RATE = 0.18;

function stallAmount(stallSize?: string): number | null {
  const size = Number(stallSize);
  if (!size || Number.isNaN(size)) return null;
  return Math.round(size * STALL_RATE * (1 + GST_RATE));
}

export default function MsmeApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<MsmeApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const load = () => {
    setLoading(true);
    setError(null);
    msmeApi
      .list()
      .then(setApplications)
      .catch((err) => {
        setError(err instanceof ApiRequestError ? err.message : "Could not load MSME applications.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    return applications.filter((app) => {
      if (statusFilter && app.status !== statusFilter) return false;
      if (!search.trim()) return true;
      const term = search.trim().toLowerCase();
      return [
        app.applicationId,
        app.enterprise?.enterpriseName,
        app.enterprise?.udyamNumber,
        app.enterprise?.email,
        app.enterprise?.mobile,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [applications, search, statusFilter]);

  const columns: Column<MsmeApplication>[] = [
    { key: "applicationId", header: "Application ID", render: (a) => <span className="font-semibold">{a.applicationId}</span> },
    {
      key: "enterprise",
      header: "Enterprise",
      render: (a) => (
        <div>
          <p className="font-medium text-text-primary">{a.enterprise?.enterpriseName || "—"}</p>
          <p className="text-xs text-text-muted">{a.enterprise?.udyamNumber || "No Udyam number"}</p>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (a) => (
        <div>
          <p>{a.enterprise?.mobile || "—"}</p>
          <p className="text-xs text-text-muted">{a.enterprise?.email || "—"}</p>
        </div>
      ),
    },
    { key: "category", header: "Category", render: (a) => a.enterprise?.category || "—" },
    {
      key: "stall",
      header: "Stall",
      render: (a) =>
        a.participation?.stallType ? `${a.participation.stallType} · ${a.participation.stallSize || "?"} sqm` : "—",
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      render: (a) => {
        const amount = a.payment?.amount ?? stallAmount(a.participation?.stallSize);
        return amount ? `₹${amount.toLocaleString("en-IN")}` : "—";
      },
    },
    { key: "status", header: "Status", render: (a) => <Badge tone={STATUS_TONE[a.status]}>{MSME_STATUS_LABELS[a.status]}</Badge> },
    {
      key: "review",
      header: "Review",
      render: (a) =>
        a.reviewStatus ? <Badge tone={REVIEW_TONE[a.reviewStatus]}>{MSME_REVIEW_LABELS[a.reviewStatus]}</Badge> : "—",
    },
    { key: "createdAt", header: "Created", render: (a) => formatDateTime(a.createdAt) },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">MSME Applications</h1>
        <p className="text-xs text-text-muted">
          PMS Support applications submitted through the MSME apply flow (/participate/msme/apply).
        </p>
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
            placeholder="Search by name, Udyam number, email or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-56">
          <Select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {Object.entries(MSME_STATUS_LABELS).map(([value, label]) => (
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
        rowKey={(a) => a._id}
        loading={loading}
        emptyMessage="No MSME applications match these filters."
        onRowClick={(a) => router.push(`/msme-applications/${a.applicationId}`)}
        pageSize={15}
      />
    </div>
  );
}
