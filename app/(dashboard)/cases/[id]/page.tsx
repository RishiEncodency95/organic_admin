"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, FileCheck2, Receipt, History, ShieldCheck, HandHeart, Navigation } from "lucide-react";
import { directionsUrl } from "@/lib/maps";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { casesApi, NearestVolunteer } from "@/lib/casesApi";
import { volunteersApi } from "@/lib/volunteersApi";
import { expenseCategoriesApi } from "@/lib/expenseCategoriesApi";
import {
  CaseDetail,
  CaseStatus,
  VerificationStatus,
  DocumentType,
  PaymentMode,
  AssignmentRole,
  ExpenseCategory,
} from "@/lib/types";
import {
  CASE_STATUS_META,
  CASE_PRIORITY_META,
  CASE_STATUS_TRANSITIONS,
  EXPENSE_STATUS_META,
  ASSIGNMENT_STATUS_META,
  formatDateTime,
  formatCurrency,
} from "@/lib/statusMeta";
import { ApiRequestError } from "@/lib/api";

const DOC_TYPES: DocumentType[] = [
  "DEATH_CERTIFICATE",
  "ID_PROOF",
  "ADDRESS_PROOF",
  "CREMATION_PROOF",
  "CONSENT_FORM",
  "BILL",
  "OTHER",
];
const PAYMENT_MODES: PaymentMode[] = ["CASH", "UPI", "CARD", "NETBANKING", "WALLET", "CHEQUE", "BANK_TRANSFER"];
const BLOCKED_FOR_ASSIGNMENT: CaseStatus[] = ["NEW", "UNDER_VERIFICATION", "REJECTED", "CANCELLED"];

export default function CaseDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [kase, setKase] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const isBusy = busyAction !== null;

  const load = useCallback(async () => {
    const data = await casesApi.getById(params.id);
    setKase(data);
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, [load]);

  // -------- Volunteer assignment --------
  // Nearest-first (see moksha-backend's geocoding.ts) rather than a flat active-volunteers list —
  // a volunteer with no coordinates yet (geocoding still pending/failed) still shows up, just
  // sorted after every distance-ranked one, so nobody silently disappears from the picker.
  const [activeVolunteers, setActiveVolunteers] = useState<NearestVolunteer[]>([]);
  const [pickedVolunteerId, setPickedVolunteerId] = useState("");
  const [assignRole, setAssignRole] = useState<AssignmentRole>("PRIMARY");

  useEffect(() => {
    casesApi.nearestVolunteers(params.id).then(setActiveVolunteers).catch(() => setActiveVolunteers([]));
  }, [params.id]);

  const handleAssignVolunteer = async () => {
    if (!kase || !pickedVolunteerId) return;
    setBusyAction("assignVolunteer");
    setActionError("");
    try {
      await volunteersApi.assignToCase(kase._id, pickedVolunteerId, assignRole);
      setPickedVolunteerId("");
      await load();
    } catch (err) {
      setActionError(err instanceof ApiRequestError ? err.message : "Could not assign volunteer.");
    } finally {
      setBusyAction(null);
    }
  };

  const handleWithdrawAssignment = async (assignmentId: string) => {
    if (!kase) return;
    const reason = window.prompt("Reason for withdrawing this volunteer (optional)?") ?? undefined;
    setBusyAction(`withdraw:${assignmentId}`);
    setActionError("");
    try {
      await casesApi.withdrawAssignment(kase._id, assignmentId, reason || undefined);
      await load();
    } catch (err) {
      setActionError(err instanceof ApiRequestError ? err.message : "Could not withdraw the assignment.");
    } finally {
      setBusyAction(null);
    }
  };

  // -------- Verify form --------
  const [verifyOutcome, setVerifyOutcome] = useState<VerificationStatus>("VERIFIED");
  const [verifyMethod, setVerifyMethod] = useState("CALL");
  const [verifyNote, setVerifyNote] = useState("");

  const handleVerify = async () => {
    if (!kase) return;
    setBusyAction("verify");
    setActionError("");
    try {
      await casesApi.verify(kase._id, { outcome: verifyOutcome, method: verifyMethod, note: verifyNote });
      setVerifyNote("");
      await load();
    } catch (err) {
      setActionError(err instanceof ApiRequestError ? err.message : "Could not record verification.");
    } finally {
      setBusyAction(null);
    }
  };

  // -------- Status transition --------
  const [nextStatus, setNextStatus] = useState<CaseStatus | "">("");

  const CANCELLABLE_STATUSES: CaseStatus[] = ["NEW", "UNDER_VERIFICATION", "APPROVED", "VOLUNTEER_ASSIGNED", "TRANSPORT_ARRANGED"];

  const handleCancelCase = async () => {
    if (!kase) return;
    const reason = window.prompt("Reason for cancelling this case?");
    if (!reason || reason.trim().length < 3) return;
    setBusyAction("cancel");
    setActionError("");
    try {
      await casesApi.cancel(kase._id, reason.trim());
      await load();
    } catch (err) {
      setActionError(err instanceof ApiRequestError ? err.message : "Could not cancel the case.");
    } finally {
      setBusyAction(null);
    }
  };

  const handlePrintSummary = async () => {
    if (!kase) return;
    try {
      const html = await casesApi.summaryHtml(kase._id);
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(html);
        win.document.close();
      }
    } catch {
      /* summary unavailable */
    }
  };

  const handleTransition = async () => {
    if (!kase || !nextStatus) return;
    setBusyAction("transition");
    setActionError("");
    try {
      await casesApi.transitionStatus(kase._id, nextStatus as CaseStatus);
      setNextStatus("");
      await load();
    } catch (err) {
      setActionError(err instanceof ApiRequestError ? err.message : "Could not update case status.");
    } finally {
      setBusyAction(null);
    }
  };

  // -------- Document upload --------
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<DocumentType>("DEATH_CERTIFICATE");
  const [isProof, setIsProof] = useState(false);

  const handleUploadDocument = async () => {
    if (!kase || !docFile) return;
    setBusyAction("uploadDocument");
    setActionError("");
    try {
      await casesApi.addDocument(kase._id, docFile, docType, isProof);
      setDocFile(null);
      setIsProof(false);
      await load();
    } catch (err) {
      setActionError(err instanceof ApiRequestError ? err.message : "Could not upload document.");
    } finally {
      setBusyAction(null);
    }
  };

  // -------- Expense --------
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [expCategoryId, setExpCategoryId] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expDate, setExpDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [expMode, setExpMode] = useState<PaymentMode>("CASH");
  const [expPayee, setExpPayee] = useState("");

  useEffect(() => {
    expenseCategoriesApi.list().then(setExpenseCategories).catch(() => setExpenseCategories([]));
  }, []);

  const handleAddExpense = async () => {
    if (!kase || !expCategoryId || !expAmount) return;
    setBusyAction("addExpense");
    setActionError("");
    try {
      await casesApi.addExpense(kase._id, {
        categoryId: expCategoryId,
        amount: Number(expAmount),
        expenseDate: new Date(expDate).toISOString(),
        paymentMode: expMode,
        payeeName: expPayee || undefined,
      });
      setExpCategoryId("");
      setExpAmount("");
      setExpPayee("");
      await load();
    } catch (err) {
      setActionError(err instanceof ApiRequestError ? err.message : "Could not submit expense.");
    } finally {
      setBusyAction(null);
    }
  };

  const handleDecideExpense = async (expenseId: string, decision: "APPROVED" | "REJECTED") => {
    if (!kase) return;
    setBusyAction(`decide:${expenseId}:${decision}`);
    setActionError("");
    try {
      await casesApi.decideExpense(kase._id, expenseId, decision);
      await load();
    } catch (err) {
      setActionError(err instanceof ApiRequestError ? err.message : "Could not record the decision.");
    } finally {
      setBusyAction(null);
    }
  };

  if (loading || !kase) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-text-muted">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  // Once verification is underway, steer admins to the Verify panel (which records the outcome
  // AND transitions) instead of the plain dropdown jumping straight to APPROVED/REJECTED.
  const rawNextStates = CASE_STATUS_TRANSITIONS[kase.status] ?? [];
  const transitionOptions =
    kase.status === "UNDER_VERIFICATION" ? [] : rawNextStates;

  const canAssignVolunteer = !BLOCKED_FOR_ASSIGNMENT.includes(kase.status);

  const request = kase.request;

  return (
    <div className="space-y-4 pb-8">
      <button
        onClick={() => router.push("/cases")}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Cases
      </button>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">{kase.caseId}</h1>
          <p className="text-xs text-text-muted">Opened {formatDateTime(kase.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={CASE_PRIORITY_META[kase.priority].tone}>{CASE_PRIORITY_META[kase.priority].label}</Badge>
          <Badge tone={CASE_STATUS_META[kase.status].tone}>{CASE_STATUS_META[kase.status].label}</Badge>
          <Button variant="secondary" size="sm" onClick={handlePrintSummary}>
            Print Summary
          </Button>
          {CANCELLABLE_STATUSES.includes(kase.status) && (
            <Button variant="danger" size="sm" onClick={handleCancelCase} loading={busyAction === "cancel"} disabled={isBusy}>
              Cancel Case
            </Button>
          )}
        </div>
      </div>

      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
          {actionError}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* Family / request info */}
          <Card>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Family Details</h2>
            {request ? (
              <div className="grid gap-3 sm:grid-cols-2 text-sm">
                <div>
                  <p className="text-[11px] font-semibold text-text-muted">Requester</p>
                  <p className="text-text-primary">
                    {request.requester.name} ({request.requester.relation})
                  </p>
                  <p className="text-text-secondary">{request.requester.phone}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-text-muted">Deceased</p>
                  <p className="text-text-primary">
                    {request.deceased.name}
                    {request.deceased.age ? `, ${request.deceased.age} yrs` : ""}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-[11px] font-semibold text-text-muted">Location</p>
                  <p className="text-text-primary">
                    {request.location.address}, {request.location.city}, {request.location.state} -{" "}
                    {request.location.pincode}
                  </p>
                  <a
                    href={directionsUrl(request.location.address, request.location.city, request.location.state, request.location.pincode)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
                  >
                    <Navigation className="h-3 w-3" /> Get Directions
                  </a>
                </div>
                {request.notes && (
                  <div className="sm:col-span-2">
                    <p className="text-[11px] font-semibold text-text-muted">Notes</p>
                    <p className="text-text-secondary">{request.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-text-muted">Linked request not found.</p>
            )}
          </Card>

          {/* Verification */}
          {kase.status === "UNDER_VERIFICATION" && (
            <Card>
              <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verify Case
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <Select label="Outcome" value={verifyOutcome} onChange={(e) => setVerifyOutcome(e.target.value as VerificationStatus)}>
                  <option value="VERIFIED">Verified</option>
                  <option value="REJECTED">Rejected</option>
                </Select>
                <Select label="Method" value={verifyMethod} onChange={(e) => setVerifyMethod(e.target.value)}>
                  <option value="CALL">Phone Call</option>
                  <option value="FIELD_VISIT">Field Visit</option>
                  <option value="DOCUMENT">Document</option>
                  <option value="VERBAL_PENDING_DOCS">Verbal (Docs Pending)</option>
                </Select>
                <div className="sm:col-span-2">
                  <Textarea
                    label="Verification Note"
                    required
                    rows={2}
                    value={verifyNote}
                    onChange={(e) => setVerifyNote(e.target.value)}
                    placeholder="What was confirmed, and how"
                  />
                </div>
              </div>
              <Button className="mt-3" size="sm" onClick={handleVerify} loading={busyAction === "verify"} disabled={isBusy || !verifyNote.trim()}>
                Submit Verification
              </Button>
            </Card>
          )}

          {/* Status transition */}
          {transitionOptions.length > 0 && (
            <Card>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Move Case Forward</h2>
              <div className="flex flex-wrap items-end gap-2">
                <div className="w-56">
                  <Select label="New Status" value={nextStatus} onChange={(e) => setNextStatus(e.target.value as CaseStatus)}>
                    <option value="">Select status...</option>
                    {transitionOptions.map((s) => (
                      <option key={s} value={s}>
                        {CASE_STATUS_META[s].label}
                      </option>
                    ))}
                  </Select>
                </div>
                <Button size="sm" onClick={handleTransition} loading={busyAction === "transition"} disabled={isBusy || !nextStatus}>
                  Update Status
                </Button>
              </div>
              {nextStatus === "CLOSED" && (
                <p className="mt-2 text-[11px] text-text-muted">
                  Closing requires at least one proof document and no expenses pending approval.
                </p>
              )}
            </Card>
          )}

          {/* Volunteer assignments */}
          <Card>
            <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted">
              <HandHeart className="h-3.5 w-3.5" />
              Volunteers Assigned ({kase.assignments.length})
            </h2>
            <div className="space-y-1.5">
              {kase.assignments.map((a) => (
                <div key={a._id} className="flex items-center justify-between rounded-lg border border-surface-border px-3 py-2 text-xs">
                  <div>
                    <p className="font-medium text-text-primary">
                      {a.volunteerName ?? "—"} · {a.volunteerPhone ?? "—"}
                    </p>
                    <p className="text-text-muted">{a.role}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={ASSIGNMENT_STATUS_META[a.status].tone}>{ASSIGNMENT_STATUS_META[a.status].label}</Badge>
                    {(a.status === "ASSIGNED" || a.status === "ACCEPTED") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleWithdrawAssignment(a._id)}
                        loading={busyAction === `withdraw:${a._id}`}
                        disabled={isBusy}
                      >
                        Withdraw
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {kase.assignments.length === 0 && <p className="text-xs text-text-muted">No volunteer assigned yet.</p>}
            </div>

            {canAssignVolunteer ? (
              <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-surface-border pt-3">
                <div className="w-56">
                  <Select
                    label="Volunteer"
                    value={pickedVolunteerId}
                    onChange={(e) => setPickedVolunteerId(e.target.value)}
                  >
                    <option value="">Select an active volunteer...</option>
                    {activeVolunteers.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.name} — {v.city} ({v.availability}){v.distanceKm !== null ? ` · ${v.distanceKm} km away` : ""}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="w-36">
                  <Select label="Role" value={assignRole} onChange={(e) => setAssignRole(e.target.value as AssignmentRole)}>
                    <option value="PRIMARY">Primary</option>
                    <option value="SUPPORT">Support</option>
                    <option value="DRIVER">Driver</option>
                  </Select>
                </div>
                <Button size="sm" onClick={handleAssignVolunteer} loading={busyAction === "assignVolunteer"} disabled={isBusy || !pickedVolunteerId}>
                  Assign
                </Button>
              </div>
            ) : (
              <p className="mt-3 border-t border-surface-border pt-3 text-xs text-text-muted">
                {kase.status === "REJECTED" || kase.status === "CANCELLED"
                  ? "This case is closed out — volunteers can no longer be assigned."
                  : "Verify and approve this case before assigning a volunteer."}
              </p>
            )}
          </Card>

          {/* Documents */}
          <Card>
            <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted">
              <FileCheck2 className="h-3.5 w-3.5" />
              Documents ({kase.documents.length})
            </h2>
            <div className="space-y-1.5">
              {kase.documents.map((doc) => (
                <a
                  key={doc._id}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg border border-surface-border px-3 py-2 text-xs hover:bg-surface-sunken"
                >
                  <span className="text-text-primary">{doc.fileName}</span>
                  <span className="flex items-center gap-1.5 text-text-muted">
                    {doc.docType}
                    {doc.isProof && <Badge tone="success">Proof</Badge>}
                  </span>
                </a>
              ))}
              {kase.documents.length === 0 && <p className="text-xs text-text-muted">No documents uploaded yet.</p>}
            </div>

            <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-surface-border pt-3">
              <input
                type="file"
                onChange={(e) => setDocFile(e.target.files?.[0] ?? null)}
                className="text-xs text-text-secondary file:mr-2 file:rounded-md file:border-0 file:bg-surface-sunken file:px-2.5 file:py-1.5 file:text-xs file:font-medium"
              />
              <div className="w-48">
                <Select value={docType} onChange={(e) => setDocType(e.target.value as DocumentType)}>
                  {DOC_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, " ")}
                    </option>
                  ))}
                </Select>
              </div>
              <label className="flex items-center gap-1.5 text-xs text-text-secondary">
                <input type="checkbox" checked={isProof} onChange={(e) => setIsProof(e.target.checked)} />
                Proof document
              </label>
              <Button size="sm" onClick={handleUploadDocument} loading={busyAction === "uploadDocument"} disabled={isBusy || !docFile}>
                Upload
              </Button>
            </div>
          </Card>

          {/* Expenses */}
          <Card>
            <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted">
              <Receipt className="h-3.5 w-3.5" />
              Expenses — Total {formatCurrency(kase.totalExpense)}
            </h2>
            <div className="space-y-1.5">
              {kase.expenses.map((exp) => (
                <div
                  key={exp._id}
                  className="flex items-center justify-between rounded-lg border border-surface-border px-3 py-2 text-xs"
                >
                  <div>
                    <p className="font-medium text-text-primary">
                      {exp.category} — {formatCurrency(exp.amount)}
                    </p>
                    <p className="text-text-muted">
                      {exp.paymentMode} · {formatDateTime(exp.expenseDate)}
                      {exp.payeeName ? ` · ${exp.payeeName}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={EXPENSE_STATUS_META[exp.status].tone}>{EXPENSE_STATUS_META[exp.status].label}</Badge>
                    {exp.status === "SUBMITTED" && (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleDecideExpense(exp._id, "REJECTED")}
                          loading={busyAction === `decide:${exp._id}:REJECTED`}
                          disabled={isBusy}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDecideExpense(exp._id, "APPROVED")}
                          loading={busyAction === `decide:${exp._id}:APPROVED`}
                          disabled={isBusy}
                        >
                          Approve
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {kase.expenses.length === 0 && <p className="text-xs text-text-muted">No expenses recorded yet.</p>}
            </div>

            <div className="mt-3 grid gap-2 border-t border-surface-border pt-3 sm:grid-cols-2 lg:grid-cols-5">
              <Select value={expCategoryId} onChange={(e) => setExpCategoryId(e.target.value)}>
                <option value="">Select category…</option>
                {expenseCategories
                  .filter((c) => c.isActive)
                  .map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
              </Select>
              <Input type="number" placeholder="Amount" value={expAmount} onChange={(e) => setExpAmount(e.target.value)} />
              <Input type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)} />
              <Select value={expMode} onChange={(e) => setExpMode(e.target.value as PaymentMode)}>
                {PAYMENT_MODES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
              <Input placeholder="Payee (optional)" value={expPayee} onChange={(e) => setExpPayee(e.target.value)} />
            </div>
            <Button size="sm" className="mt-2" onClick={handleAddExpense} loading={busyAction === "addExpense"} disabled={isBusy || !expCategoryId || !expAmount}>
              Submit Expense
            </Button>
          </Card>
        </div>

        {/* Timeline */}
        <div>
          <Card>
            <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted">
              <History className="h-3.5 w-3.5" />
              Timeline
            </h2>
            <div className="space-y-3">
              {kase.timeline.map((entry) => (
                <div key={entry._id} className="border-l-2 border-surface-border pl-3">
                  <p className="text-xs font-medium text-text-primary">
                    {entry.toStatus ? CASE_STATUS_META[entry.toStatus as CaseStatus]?.label ?? entry.event : entry.event}
                  </p>
                  {entry.note && <p className="text-[11px] text-text-secondary">{entry.note}</p>}
                  <p className="text-[10px] text-text-muted">
                    {formatDateTime(entry.at)} · {entry.visibility === "FAMILY" ? "Visible to family" : "Internal"}
                  </p>
                </div>
              ))}
              {kase.timeline.length === 0 && <p className="text-xs text-text-muted">No activity yet.</p>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
