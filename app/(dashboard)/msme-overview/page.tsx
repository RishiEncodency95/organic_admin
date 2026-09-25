"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FileCheck2, Hourglass, IndianRupee, ListChecks, ArrowRight } from "lucide-react";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import { msmeApi, MSME_STATUS_LABELS, type MsmeApplication, type MsmeApplicationStatus } from "@/lib/msmeApi";
import { formatDateTime } from "@/lib/statusMeta";
import { ApiRequestError } from "@/lib/api";

const KPI_COLORS = {
  total: "#176b27",
  submitted: "#1e7e34",
  pending: "#b78103",
  revenue: "#0977df",
};

const STATUS_TONE: Record<MsmeApplicationStatus, "neutral" | "pending" | "progress" | "danger" | "success"> = {
  DRAFT: "neutral",
  ENTERPRISE_SAVED: "pending",
  PARTICIPATION_SAVED: "progress",
  PAYMENT_PENDING: "pending",
  PAYMENT_FAILED: "danger",
  SUBMITTED: "success",
};

const IN_PROGRESS_STATUSES: MsmeApplicationStatus[] = ["DRAFT", "ENTERPRISE_SAVED", "PARTICIPATION_SAVED"];

export default function MsmeOverviewPage() {
  const [applications, setApplications] = useState<MsmeApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    msmeApi
      .list()
      .then(setApplications)
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Could not load MSME data."))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const submitted = applications.filter((a) => a.status === "SUBMITTED");
    const paymentPending = applications.filter((a) => a.status === "PAYMENT_PENDING");
    const inProgress = applications.filter((a) => IN_PROGRESS_STATUSES.includes(a.status));
    const revenue = applications
      .filter((a) => a.payment?.status === "PAID")
      .reduce((sum, a) => sum + (a.payment?.amount || 0), 0);

    const byCategory = new Map<string, number>();
    applications.forEach((a) => {
      const cat = a.enterprise?.category || "Not specified";
      byCategory.set(cat, (byCategory.get(cat) || 0) + 1);
    });

    return {
      total: applications.length,
      submitted: submitted.length,
      paymentPending: paymentPending.length,
      inProgress: inProgress.length,
      revenue,
      byCategory: Array.from(byCategory.entries()).sort((a, b) => b[1] - a[1]),
      recent: [...applications].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 5),
    };
  }, [applications]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">MSME Overview</h1>
        <p className="text-xs text-text-muted">
          Snapshot of PMS Support applications submitted through the MSME apply flow.
        </p>
      </div>

      {error && (
        <div className="border border-status-danger-bg bg-status-danger-bg/40 px-3 py-2 text-sm text-status-danger-text">
          {error}
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-1 lg:grid-cols-4">
            <StatCard icon={ListChecks} label="Total Applications" value={stats.total} accentColor={KPI_COLORS.total} />
            <StatCard icon={FileCheck2} label="Submitted" value={stats.submitted} accentColor={KPI_COLORS.submitted} />
            <StatCard
              icon={Hourglass}
              label="Payment Pending"
              value={stats.paymentPending}
              hint={`${stats.inProgress} still filling form`}
              tone={stats.paymentPending > 0 ? "danger" : "neutral"}
            />
            <StatCard icon={IndianRupee} label="Revenue Collected" value={`₹${stats.revenue.toLocaleString("en-IN")}`} accentColor={KPI_COLORS.revenue} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-text-primary">Recent Applications</h2>
                <Link href="/msme-applications" className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              {stats.recent.length === 0 ? (
                <p className="text-sm text-text-muted">No applications yet.</p>
              ) : (
                <div className="divide-y divide-surface-border">
                  {stats.recent.map((a) => (
                    <Link
                      key={a._id}
                      href={`/msme-applications/${a.applicationId}`}
                      className="flex items-center justify-between gap-2 py-2 text-sm hover:bg-surface-sunken"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-text-primary">{a.enterprise?.enterpriseName || a.applicationId}</p>
                        <p className="text-xs text-text-muted">{formatDateTime(a.createdAt)}</p>
                      </div>
                      <Badge tone={STATUS_TONE[a.status]}>{MSME_STATUS_LABELS[a.status]}</Badge>
                    </Link>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <h2 className="mb-3 text-sm font-semibold text-text-primary">By Entrepreneur Category</h2>
              {stats.byCategory.length === 0 ? (
                <p className="text-sm text-text-muted">No data yet.</p>
              ) : (
                <div className="space-y-2">
                  {stats.byCategory.map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">{category}</span>
                      <span className="font-semibold text-text-primary">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
