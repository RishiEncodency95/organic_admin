"use client";

import { useEffect, useState } from "react";
import { Loader2, Download, FolderKanban, HeartHandshake, Receipt } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatCard from "@/components/ui/StatCard";
import { TrendChart } from "@/components/charts/TrendChart";
import { MagnitudeBarChart, MagnitudeDatum } from "@/components/charts/MagnitudeBarChart";
import { DonutChart, DonutDatum } from "@/components/charts/DonutChart";
import { CAUSE_LABELS, CAUSE_COLORS, CAUSE_COLOR_FALLBACK, KPI_COLORS } from "@/lib/chartColors";
import { reportsApi, ReportsOverview, ReportSnapshot } from "@/lib/reportsApi";
import { formatCurrency, CASE_STATUS_META } from "@/lib/statusMeta";
import { CaseStatus } from "@/lib/types";

const ALL_STATUSES: CaseStatus[] = [
  "NEW",
  "UNDER_VERIFICATION",
  "APPROVED",
  "VOLUNTEER_ASSIGNED",
  "TRANSPORT_ARRANGED",
  "CREMATION_IN_PROGRESS",
  "CREMATION_COMPLETED",
  "DOCS_UPLOADED",
  "CLOSED",
  "REJECTED",
  "CANCELLED",
];

const DEFAULT_OVERVIEW: ReportsOverview = {
  cases: {
    total: 0,
    open: 0,
    critical: 0,
    byStatus: {
      NEW: 0,
      UNDER_VERIFICATION: 0,
      APPROVED: 0,
      VOLUNTEER_ASSIGNED: 0,
      TRANSPORT_ARRANGED: 0,
      CREMATION_IN_PROGRESS: 0,
      CREMATION_COMPLETED: 0,
      DOCS_UPLOADED: 0,
      CLOSED: 0,
      REJECTED: 0,
      CANCELLED: 0,
    },
  },
  requests: { total: 0, pending: 0 },
  volunteers: { total: 0, active: 0 },
  donations: {
    totalRaised: 0,
    totalDonations: 0,
    thisMonthRaised: 0,
    thisMonthDonations: 0,
    byCause: {},
  },
  expenses: { pendingAmount: 0, pendingCount: 0, approvedAmount: 0, approvedCount: 0 },
};

function shortDate(dateKey: string): string {
  if (!dateKey || typeof dateKey !== "string") return "";
  const parts = dateKey.split("-");
  if (parts.length < 3) return dateKey;
  const [, m, d] = parts;
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthIdx = Number(m) - 1;
  return `${d} ${MONTHS[monthIdx] ?? m}`;
}

export default function ReportsPage() {
  const [overview, setOverview] = useState<ReportsOverview>(DEFAULT_OVERVIEW);
  const [snapshots, setSnapshots] = useState<ReportSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<"cases" | "donations" | null>(null);

  useEffect(() => {
    Promise.all([reportsApi.overview(), reportsApi.snapshots(30)])
      .then(([o, s]) => {
        if (o && typeof o === "object" && !Array.isArray(o) && (o as ReportsOverview).cases?.byStatus) {
          setOverview(o);
        } else {
          setOverview(DEFAULT_OVERVIEW);
        }
        setSnapshots(Array.isArray(s) ? s : []);
      })
      .catch(() => {
        setOverview(DEFAULT_OVERVIEW);
        setSnapshots([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async (kind: "cases" | "donations") => {
    setExporting(kind);
    try {
      if (kind === "cases") await reportsApi.exportCases();
      else await reportsApi.exportDonations();
    } finally {
      setExporting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-text-muted">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  const safeSnapshots = Array.isArray(snapshots) ? snapshots : [];
  const raisedTrend = safeSnapshots.map((s) => ({ label: shortDate(s.date), value: s.donations?.totalRaised ?? 0 }));
  const openCasesTrend = safeSnapshots.map((s) => ({ label: shortDate(s.date), value: s.cases?.open ?? 0 }));

  const byStatus = overview.cases?.byStatus ?? DEFAULT_OVERVIEW.cases.byStatus;
  const statusData: MagnitudeDatum[] = ALL_STATUSES.filter((s) => (byStatus[s] ?? 0) > 0).map((status) => ({
    label: CASE_STATUS_META[status]?.label ?? status,
    value: byStatus[status] ?? 0,
  }));

  const byCause = overview.donations?.byCause ?? {};
  const causeEntries = Object.entries(byCause).filter(([, v]) => (v ?? 0) > 0);
  const causeData: DonutDatum[] = causeEntries.map(([cause, amount]) => ({
    key: cause,
    label: CAUSE_LABELS[cause] ?? cause,
    value: amount,
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Reports</h1>
        <p className="text-xs text-text-muted">Full breakdowns and exportable registers.</p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card padding="sm">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">Total Raised — Last 30 Days</h2>
          <TrendChart data={raisedTrend} valueFormatter={formatCurrency} />
        </Card>
        <Card padding="sm">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">Open Cases — Last 30 Days</h2>
          <TrendChart data={openCasesTrend} valueFormatter={(v) => `${v} case${v === 1 ? "" : "s"}`} />
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-1 lg:grid-cols-4">
        <StatCard
          icon={FolderKanban}
          label="Total Cases"
          value={overview.cases?.total ?? 0}
          hint={`${overview.cases?.open ?? 0} open`}
          accentColor={KPI_COLORS.cases}
        />
        <StatCard
          icon={HeartHandshake}
          label="Total Raised"
          value={formatCurrency(overview.donations?.totalRaised ?? 0)}
          accentColor={KPI_COLORS.donations}
        />
        <StatCard
          icon={Receipt}
          label="Expenses Approved"
          value={formatCurrency(overview.expenses?.approvedAmount ?? 0)}
          hint={`${overview.expenses?.approvedCount ?? 0} entries`}
          accentColor={KPI_COLORS.requests}
        />
        <StatCard
          icon={Receipt}
          label="Pending Approval"
          value={formatCurrency(overview.expenses?.pendingAmount ?? 0)}
          hint={`${overview.expenses?.pendingCount ?? 0} entries`}
          tone={(overview.expenses?.pendingCount ?? 0) > 0 ? "danger" : "neutral"}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card padding="sm">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Cases by Status</h2>
          <MagnitudeBarChart data={statusData} emptyLabel="No cases yet." />
          <Button size="sm" variant="secondary" className="mt-3 w-full" onClick={() => handleExport("cases")} loading={exporting === "cases"}>
            <Download className="h-3.5 w-3.5" /> Export Case Register (CSV)
          </Button>
        </Card>

        <Card padding="sm">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Donations by Cause</h2>
          <DonutChart
            data={causeData}
            colorFor={(key) => CAUSE_COLORS[key] ?? CAUSE_COLOR_FALLBACK}
            valueFormatter={formatCurrency}
            emptyLabel="No successful donations yet."
          />
          <Button
            size="sm"
            variant="secondary"
            className="mt-3 w-full"
            onClick={() => handleExport("donations")}
            loading={exporting === "donations"}
          >
            <Download className="h-3.5 w-3.5" /> Export Donation Register (CSV)
          </Button>
        </Card>
      </div>
    </div>
  );
}
