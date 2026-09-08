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

function shortDate(dateKey: string): string {
  const [, m, d] = dateKey.split("-");
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d} ${MONTHS[Number(m) - 1]}`;
}

export default function ReportsPage() {
  const [overview, setOverview] = useState<ReportsOverview | null>(null);
  const [snapshots, setSnapshots] = useState<ReportSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<"cases" | "donations" | null>(null);

  useEffect(() => {
    Promise.all([reportsApi.overview(), reportsApi.snapshots(30)])
      .then(([o, s]) => {
        setOverview(o);
        setSnapshots(s);
      })
      .catch(() => {})
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

  if (loading || !overview) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-text-muted">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  const raisedTrend = snapshots.map((s) => ({ label: shortDate(s.date), value: s.donations.totalRaised }));
  const openCasesTrend = snapshots.map((s) => ({ label: shortDate(s.date), value: s.cases.open }));

  const statusData: MagnitudeDatum[] = ALL_STATUSES.filter((s) => overview.cases.byStatus[s] > 0).map((status) => ({
    label: CASE_STATUS_META[status].label,
    value: overview.cases.byStatus[status],
  }));

  const causeEntries = Object.entries(overview.donations.byCause).filter(([, v]) => v > 0);
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
          value={overview.cases.total}
          hint={`${overview.cases.open} open`}
          accentColor={KPI_COLORS.cases}
        />
        <StatCard
          icon={HeartHandshake}
          label="Total Raised"
          value={formatCurrency(overview.donations.totalRaised)}
          accentColor={KPI_COLORS.donations}
        />
        <StatCard
          icon={Receipt}
          label="Expenses Approved"
          value={formatCurrency(overview.expenses.approvedAmount)}
          hint={`${overview.expenses.approvedCount} entries`}
          accentColor={KPI_COLORS.requests}
        />
        <StatCard
          icon={Receipt}
          label="Pending Approval"
          value={formatCurrency(overview.expenses.pendingAmount)}
          hint={`${overview.expenses.pendingCount} entries`}
          tone={overview.expenses.pendingCount > 0 ? "danger" : "neutral"}
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
