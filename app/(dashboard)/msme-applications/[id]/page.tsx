"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Building2, FileText, CreditCard, ShieldCheck, ClipboardCheck } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import {
  msmeApi,
  MSME_STATUS_LABELS,
  MSME_REVIEW_LABELS,
  type MsmeApplication,
  type MsmeApplicationStatus,
  type MsmeReviewStatus,
} from "@/lib/msmeApi";
import { formatDateTime, formatCurrency } from "@/lib/statusMeta";
import { ApiRequestError } from "@/lib/api";

const STATUS_TONE: Record<MsmeApplicationStatus, "neutral" | "pending" | "progress" | "danger" | "success"> = {
  DRAFT: "neutral",
  ENTERPRISE_SAVED: "pending",
  PARTICIPATION_SAVED: "progress",
  PAYMENT_PENDING: "pending",
  PAYMENT_FAILED: "danger",
  SUBMITTED: "success",
};

const REVIEW_TONE: Record<MsmeReviewStatus, "neutral" | "pending" | "danger" | "success"> = {
  PENDING_REVIEW: "pending",
  APPROVED: "success",
  REJECTED: "danger",
  NEEDS_INFO: "neutral",
};

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">{label}</p>
      <p className="text-sm text-text-primary">{value || value === 0 ? value : "—"}</p>
    </div>
  );
}

export default function MsmeApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [application, setApplication] = useState<MsmeApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [reviewSaving, setReviewSaving] = useState<MsmeReviewStatus | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const load = () => {
    if (!params.id) return;
    setLoading(true);
    setError(null);
    msmeApi
      .getById(params.id)
      .then(setApplication)
      .catch((err) => {
        setError(err instanceof ApiRequestError ? err.message : "Could not load this application.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [params.id]);

  const handleReview = async (reviewStatus: MsmeReviewStatus) => {
    if (!params.id) return;
    setReviewSaving(reviewStatus);
    setReviewError(null);
    try {
      const updated = await msmeApi.updateReviewStatus(params.id, { reviewStatus, note: reviewNote || undefined });
      setApplication(updated);
      setReviewNote("");
    } catch (err) {
      setReviewError(err instanceof ApiRequestError ? err.message : "Could not update the review status.");
    } finally {
      setReviewSaving(null);
    }
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => router.push("/msme-applications")}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Back to MSME Applications
      </button>

      {loading && <Spinner />}

      {!loading && error && <EmptyState icon={Building2} title="Could not load application" description={error} />}

      {!loading && !error && !application && (
        <EmptyState icon={Building2} title="Application not found" />
      )}

      {!loading && application && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="text-lg font-semibold text-text-primary">{application.applicationId}</h1>
              <p className="text-xs text-text-muted">
                Created {formatDateTime(application.createdAt)}
                {application.submittedAt ? ` · Submitted ${formatDateTime(application.submittedAt)}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={STATUS_TONE[application.status]}>{MSME_STATUS_LABELS[application.status]}</Badge>
              {application.reviewStatus && (
                <Badge tone={REVIEW_TONE[application.reviewStatus]}>{MSME_REVIEW_LABELS[application.reviewStatus]}</Badge>
              )}
            </div>
          </div>

          {/* Enterprise Details */}
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-accent" />
              <h2 className="text-sm font-semibold text-text-primary">Enterprise Details</h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Enterprise Name" value={application.enterprise?.enterpriseName} />
              <Field label="Udyam Number" value={application.enterprise?.udyamNumber} />
              <Field label="Enterprise Type" value={application.enterprise?.enterpriseType} />
              <Field label="Major Activity" value={application.enterprise?.majorActivity} />
              <Field label="Constitution" value={application.enterprise?.constitution} />
              <Field label="Entrepreneur Category" value={application.enterprise?.category} />
              <Field label="Gender" value={application.enterprise?.gender} />
              <Field label="Date of Incorporation" value={application.enterprise?.dateOfIncorporation} />
              <Field label="GSTIN" value={application.enterprise?.gstin} />
              <Field label="PAN" value={application.enterprise?.pan} />
              <Field
                label="Mobile"
                value={
                  application.enterprise?.mobile
                    ? `${application.enterprise.mobile}${application.enterprise.verifiedMobile ? " ✓ Verified" : ""}`
                    : undefined
                }
              />
              <Field
                label="Email"
                value={
                  application.enterprise?.email
                    ? `${application.enterprise.email}${application.enterprise.verifiedEmail ? " ✓ Verified" : ""}`
                    : undefined
                }
              />
              <div className="sm:col-span-2 lg:col-span-3">
                <Field
                  label="Registered Address"
                  value={[application.enterprise?.address, application.enterprise?.district, application.enterprise?.state, application.enterprise?.pincode]
                    .filter(Boolean)
                    .join(", ")}
                />
              </div>
            </div>

            {application.enterprise?.bank && (
              <div className="mt-4 border-t border-surface-border pt-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Bank Details</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Field label="Account Holder" value={application.enterprise.bank.accountHolderName} />
                  <Field label="Bank Name" value={application.enterprise.bank.bankName} />
                  <Field label="Account Number" value={application.enterprise.bank.accountNumber} />
                  <Field label="IFSC / Branch" value={[application.enterprise.bank.ifsc, application.enterprise.bank.branch].filter(Boolean).join(" · ")} />
                </div>
              </div>
            )}
          </Card>

          {/* Participation Details */}
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-accent" />
              <h2 className="text-sm font-semibold text-text-primary">Participation Details</h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Stall Type" value={application.participation?.stallType} />
              <Field label="Stall Size" value={application.participation?.stallSize ? `${application.participation.stallSize} sqm` : undefined} />
              <Field label="Preferred Location" value={application.participation?.stallLocation} />
            </div>

            {application.participation?.contactPerson && (
              <div className="mt-4 border-t border-surface-border pt-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Contact Person</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Field label="Name" value={application.participation.contactPerson.name} />
                  <Field label="Designation" value={application.participation.contactPerson.designation} />
                  <Field
                    label="Mobile"
                    value={
                      application.participation.contactPerson.mobile
                        ? `${application.participation.contactPerson.mobile}${application.participation.contactPerson.verifiedMobile ? " ✓ Verified" : ""}`
                        : undefined
                    }
                  />
                  <Field
                    label="Email"
                    value={
                      application.participation.contactPerson.email
                        ? `${application.participation.contactPerson.email}${application.participation.contactPerson.verifiedEmail ? " ✓ Verified" : ""}`
                        : undefined
                    }
                  />
                </div>
              </div>
            )}
          </Card>

          {/* Payment Details */}
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-accent" />
              <h2 className="text-sm font-semibold text-text-primary">Payment Details</h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Amount" value={application.payment?.amount ? formatCurrency(application.payment.amount) : undefined} />
              <Field label="Status" value={application.payment?.status} />
              <Field label="Razorpay Order ID" value={application.payment?.razorpayOrderId} />
              <Field label="Razorpay Payment ID" value={application.payment?.razorpayPaymentId} />
              <Field label="Paid At" value={application.payment?.paidAt ? formatDateTime(application.payment.paidAt) : undefined} />
            </div>
          </Card>

          {/* Eligibility (placeholder until the eligibility engine is built) */}
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-accent" />
              <h2 className="text-sm font-semibold text-text-primary">Eligibility</h2>
            </div>
            {application.eligibility?.checked ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Field label="Eligible" value={application.eligibility.eligible ? "Yes" : "No"} />
                <Field label="Category" value={application.eligibility.category} />
                <Field label="Support Percentage" value={application.eligibility.supportPercentage ? `${application.eligibility.supportPercentage}%` : undefined} />
              </div>
            ) : (
              <p className="text-sm text-text-muted">Not yet assessed — the MSME eligibility engine has not been built.</p>
            )}
          </Card>

          {/* Staff Review */}
          {application.status === "SUBMITTED" && (
            <Card>
              <div className="mb-3 flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-accent" />
                <h2 className="text-sm font-semibold text-text-primary">Staff Review</h2>
              </div>

              {application.reviewedBy && (
                <p className="mb-3 text-xs text-text-muted">
                  Last reviewed by {application.reviewedBy}
                  {application.reviewedAt ? ` on ${formatDateTime(application.reviewedAt)}` : ""}
                  {application.reviewNote ? ` — "${application.reviewNote}"` : ""}
                </p>
              )}

              {reviewError && <p className="mb-3 text-sm text-status-danger-text">{reviewError}</p>}

              <Textarea
                label="Note (optional)"
                placeholder="Reason for approval, rejection, or what's missing..."
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                rows={2}
              />

              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="primary" loading={reviewSaving === "APPROVED"} disabled={!!reviewSaving} onClick={() => handleReview("APPROVED")}>
                  Approve
                </Button>
                <Button variant="danger" loading={reviewSaving === "REJECTED"} disabled={!!reviewSaving} onClick={() => handleReview("REJECTED")}>
                  Reject
                </Button>
                <Button variant="secondary" loading={reviewSaving === "NEEDS_INFO"} disabled={!!reviewSaving} onClick={() => handleReview("NEEDS_INFO")}>
                  Needs Info
                </Button>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
