"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { AlertTriangle, Map as MapIcon } from "lucide-react";
import Table, { Column } from "@/components/ui/Table";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { casesApi, SlaBreach } from "@/lib/casesApi";
import { CaseSummary, CaseStatus } from "@/lib/types";
import { CASE_STATUS_META, CASE_PRIORITY_META, formatDateTime } from "@/lib/statusMeta";

// Leaflet touches `window` at load time — must never run during SSR. Toggled on-demand rather
// than always rendered: with a busy caseload, a wall-to-wall pin map isn't a great default view —
// this page's job is the sortable/filterable list, so the map is an opt-in extra, not the default.
const CasesMap = dynamic(() => import("@/components/charts/CasesMap"), {
  ssr: false,
  loading: () => <div className="flex h-72 items-center justify-center text-xs text-text-muted">Loading map…</div>,
});

const STATUS_TABS: { key: CaseStatus | ""; label: string }[] = [
  { key: "", label: "All" },
  { key: "NEW", label: "New" },
  { key: "UNDER_VERIFICATION", label: "Under Verification" },
  { key: "APPROVED", label: "Approved" },
  { key: "VOLUNTEER_ASSIGNED", label: "Volunteer Assigned" },
  { key: "TRANSPORT_ARRANGED", label: "Transport Arranged" },
  { key: "CREMATION_IN_PROGRESS", label: "Cremation In Progress" },
  { key: "CREMATION_COMPLETED", label: "Cremation Completed" },
  { key: "DOCS_UPLOADED", label: "Docs Uploaded" },
  { key: "CLOSED", label: "Closed" },
  { key: "REJECTED", label: "Rejected" },
  { key: "CANCELLED", label: "Cancelled" },
];

export default function CasesPage() {
  const router = useRouter();
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<CaseStatus | "">("");
  const [breaches, setBreaches] = useState<SlaBreach[]>([]);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    casesApi.slaBreaches().then(setBreaches).catch(() => setBreaches([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    casesApi
      .list(tab ? { status: tab } : undefined)
      .then((data) => !cancelled && setCases(data))
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [tab]);

  const columns: Column<CaseSummary>[] = [
    { key: "caseId", header: "Case ID", render: (c) => <span className="font-medium">{c.caseId}</span> },
    {
      key: "requester",
      header: "Family",
      render: (c) => (c.request ? `${c.request.requester.name} · ${c.request.requester.phone}` : "—"),
    },
    { key: "city", header: "City", render: (c) => c.city },
    {
      key: "priority",
      header: "Priority",
      render: (c) => <Badge tone={CASE_PRIORITY_META[c.priority].tone}>{CASE_PRIORITY_META[c.priority].label}</Badge>,
    },
    {
      key: "status",
      header: "Status",
      render: (c) => <Badge tone={CASE_STATUS_META[c.status].tone}>{CASE_STATUS_META[c.status].label}</Badge>,
    },
    { key: "documentCount", header: "Docs", align: "center", render: (c) => c.documentCount },
    { key: "createdAt", header: "Opened", render: (c) => formatDateTime(c.createdAt) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Cases</h1>
          <p className="text-xs text-text-muted">Operational cases from verification through closure.</p>
        </div>
        <button
          onClick={() => setShowMap((v) => !v)}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
            showMap ? "border-accent bg-accent-soft text-accent" : "border-surface-border text-text-secondary hover:bg-surface-sunken"
          }`}
        >
          <MapIcon className="h-3.5 w-3.5" />
          {showMap ? "Hide Map" : "Show Map"}
        </button>
      </div>

      {showMap && (
        <Card padding="sm">
          <CasesMap />
        </Card>
      )}

      {breaches.length > 0 && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-800">
            <AlertTriangle className="h-3.5 w-3.5" />
            {breaches.length} case{breaches.length === 1 ? "" : "s"} breaching SLA
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {breaches.map((b) => (
              <button
                key={`${b._id}-${b.breachReason}`}
                onClick={() => router.push(`/cases/${b._id}`)}
                className="rounded-md border border-amber-300 bg-white px-2 py-1 text-[11px] font-medium text-amber-800 hover:bg-amber-100"
                title={b.breachReason}
              >
                {b.caseId} — {b.breachReason}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              tab === t.key ? "bg-accent text-white" : "bg-surface-card text-text-secondary hover:bg-surface-sunken"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Table
        columns={columns}
        rows={cases}
        rowKey={(c) => c._id}
        loading={loading}
        emptyMessage="No cases here."
        onRowClick={(c) => router.push(`/cases/${c._id}`)}
      />
    </div>
  );
}
