"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Building2, CalendarClock, ClipboardCheck, CreditCard, Globe2, Printer } from "lucide-react";
import Swal from "sweetalert2";
import { ApiRequestError } from "@/lib/api";
import {
  exhibitorRegistrationApi,
  formatMoney,
  type ExhibitorContact,
  type ExhibitorRegistration,
  type ExhibitorStatus,
} from "@/lib/exhibitorRegistrationApi";
import { STATUS_LABEL, STATUS_STYLES, formatDateTime } from "@/components/visitor-registrations/VisitorRegistrationsList";
import { PAYMENT_LABEL, PAYMENT_STYLES } from "@/components/book-a-stand/ExhibitorRegistrationsList";
import { DetailTable, SectionHeading, Td, Th, labelOf, renderValue } from "@/components/overview/OverviewParts";

const NEXT_STATUSES: Record<ExhibitorStatus, { status: ExhibitorStatus; label: string; className: string }[]> = {
  pending: [
    { status: "confirmed", label: "Confirm", className: "bg-[#3e8914] hover:bg-[#2f6d0f]" },
    { status: "cancelled", label: "Cancel", className: "bg-red-600 hover:bg-red-700" },
  ],
  confirmed: [
    { status: "pending", label: "Move to Pending", className: "bg-amber-500 hover:bg-amber-600" },
    { status: "cancelled", label: "Cancel", className: "bg-red-600 hover:bg-red-700" },
  ],
  cancelled: [
    { status: "pending", label: "Move to Pending", className: "bg-amber-500 hover:bg-amber-600" },
    { status: "confirmed", label: "Confirm", className: "bg-[#3e8914] hover:bg-[#2f6d0f]" },
  ],
};

const LIST_TITLE = { domestic: "Domestic Exhibitors", international: "International Exhibitors" };

const personName = (c?: ExhibitorContact) => [c?.title, c?.firstName, c?.lastName].filter(Boolean).join(" ");

export default function ExhibitorOverviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [r, setR] = useState<ExhibitorRegistration | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    exhibitorRegistrationApi
      .get(id)
      .then((data) => active && setR(data))
      .catch((err) => active && setError(err instanceof ApiRequestError ? err.message : "Could not load this booking."));
    return () => {
      active = false;
    };
  }, [id]);

  const changeStatus = async (status: ExhibitorStatus) => {
    if (!r) return;
    const confirm = await Swal.fire({
      title: `Mark as ${STATUS_LABEL[status]}?`,
      text: `${r.registrationNo} — ${r.exhibitorName}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: `Yes, ${STATUS_LABEL[status]}`,
      confirmButtonColor: "#3e8914",
      background: "#1e2433",
      color: "#e2e8f0",
    });
    if (!confirm.isConfirmed) return;
    setSaving(true);
    try {
      const updated = await exhibitorRegistrationApi.updateStatus(r._id, status);
      setR((prev) => (prev ? { ...prev, status: updated.status, statusUpdatedBy: updated.statusUpdatedBy, statusUpdatedAt: updated.statusUpdatedAt } : prev));
    } catch (err) {
      Swal.fire({ icon: "error", title: "Could not update", text: err instanceof ApiRequestError ? err.message : "Please try again.", background: "#1e2433", color: "#e2e8f0" });
    } finally {
      setSaving(false);
    }
  };

  if (error) return <div className="p-10 text-center text-[12px] font-semibold text-red-600">{error}</div>;
  if (!r) return <div className="p-10 text-center text-[12px] text-slate-500">Loading booking…</div>;

  const Icon = r.category === "international" ? Globe2 : Building2;
  const listPath = `/book-a-stand/${r.category}`;
  const money = (n?: number) => formatMoney(n, r.currency);
  const f = r.finance || {};
  const extra = Object.entries(r.details || {});
  const pairs = Array.from({ length: Math.ceil(extra.length / 2) }, (_, i) => extra.slice(i * 2, i * 2 + 2));
  const contacts = [r.contact1, r.contact2].filter((c) => c && (c.firstName || c.email || c.mobile)) as ExhibitorContact[];

  return (
    <div className="min-h-[calc(100vh-100px)] w-full bg-slate-50 p-4 pb-10 print:bg-white print:p-0">
      {/* Top bar */}
      <div className="mb-5 flex flex-col gap-3 bg-[#23471d] p-3 px-5 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div className="flex items-center gap-2 text-[12px] font-medium">
          <button type="button" onClick={() => router.back()} className="transition-opacity hover:opacity-80" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span>
            <Link href="/" className="hover:underline">Dashboard</Link> /{" "}
            <Link href={listPath} className="hover:underline">{LIST_TITLE[r.category]}</Link> / {r.exhibitorName}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <button type="button" onClick={() => window.print()} className="flex items-center gap-2 bg-white px-4 py-1.5 text-[12px] font-bold text-slate-800 shadow-sm transition-colors hover:bg-slate-100">
            <Printer className="h-4 w-4" /> Print
          </button>
          <button type="button" onClick={() => router.push(listPath)} className="flex items-center gap-1.5 bg-red-600 px-4 py-1.5 text-[12px] font-bold text-white shadow-sm transition-colors hover:bg-red-700">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>
      </div>

      <div className="border-2 border-gray-200 bg-white p-5 shadow-sm">
        <SectionHeading
          action={
            <div className="flex flex-wrap items-center gap-2.5 print:hidden">
              {NEXT_STATUSES[r.status].map((n) => (
                <button
                  key={n.status}
                  type="button"
                  disabled={saving}
                  onClick={() => changeStatus(n.status)}
                  className={`px-3.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-white shadow-xs transition-colors disabled:opacity-60 ${n.className}`}
                >
                  {n.label}
                </button>
              ))}
              <span className="border border-[#3e8914]/30 bg-[#3e8914]/10 px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider text-[#23471d]">
                {r.category === "international" ? "International Exhibitor" : "Domestic Exhibitor"}
              </span>
            </div>
          }
        >
          Stand Booking Overview
        </SectionHeading>

        {r.stallConflict && (
          <div className="mb-4 flex items-start gap-2 border-2 border-red-200 bg-red-50 p-3 text-[11.5px] font-semibold text-red-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            Payment received, but stall {r.stallNumber} was booked by someone else at the same moment. Please allot another stall to this exhibitor.
          </div>
        )}

        {/* Highlight card */}
        <div className="mb-6 flex flex-col items-start justify-between gap-4 border-2 border-emerald-200 bg-[#f0fdf4] p-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center border-2 border-[#3e8914] bg-white shadow-sm">
              <Icon className="h-7 w-7 text-[#3e8914]" />
            </div>
            <div>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-emerald-700" />
                <h3 className="text-[13px] font-bold uppercase tracking-wide text-emerald-950">{r.exhibitorName}</h3>
                <span className={`rounded-[4px] px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLES[r.status]}`}>{STATUS_LABEL[r.status]}</span>
                <span className={`rounded-[4px] border px-2 py-0.5 text-[10px] font-bold ${PAYMENT_STYLES[r.paymentStatus]}`}>{PAYMENT_LABEL[r.paymentStatus]}</span>
              </div>
              <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-emerald-800">
                <CalendarClock className="h-3.5 w-3.5" />
                Booked: {formatDateTime(r.createdAt)}
                {r.eventName ? ` · ${r.eventName}` : ""}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-600">Reg No:</span>
                <span className="border border-purple-300 bg-white px-2.5 py-1 font-mono text-[12px] font-extrabold tracking-wider text-purple-950 shadow-xs">
                  {r.registrationNo}
                </span>
              </div>
            </div>
          </div>
          <div className="border-2 border-dashed border-[#4B1426]/40 bg-white px-4 py-2 text-center">
            <p className="text-[9.5px] font-bold uppercase tracking-wide text-gray-500">Stall</p>
            <p className="font-mono text-[16px] font-extrabold tracking-wider text-[#4B1426]">{r.stallNumber || "—"}</p>
            <p className="text-[10px] font-semibold text-slate-500">
              {[r.hall, r.stallType, r.stallArea ? `${r.stallArea} m²` : ""].filter(Boolean).join(" · ")}
            </p>
          </div>
        </div>

        <DetailTable>
          <tr>
            <Th>Exhibitor / Company</Th>
            <Td className="text-[12.5px] font-semibold" style={{ color: "#2563eb" }}>{r.exhibitorName}</Td>
            <Th>Registration No</Th>
            <Td className="font-mono font-bold" style={{ color: "#4E1F6E" }}>{r.registrationNo}</Td>
          </tr>
          <tr>
            <Th>Fascia Name</Th>
            <Td className="font-semibold" style={{ color: "#063B00" }}>{r.fasciaName}</Td>
            <Th>Date of Booking</Th>
            <Td className="font-semibold" style={{ color: "#dc2626" }}>{formatDateTime(r.createdAt)}</Td>
          </tr>
          <tr>
            <Th>Type of Business</Th>
            <Td>{r.typeOfBusiness}</Td>
            <Th>Nature of Business</Th>
            <Td>{r.natureOfBusiness}</Td>
          </tr>
          <tr>
            <Th>Industry / Sector</Th>
            <Td>{r.industrySector}</Td>
            <Th>Website</Th>
            <Td className="text-blue-600">{r.website}</Td>
          </tr>
          <tr>
            <Th>Address</Th>
            <Td colSpan={3}>{[r.address, r.city, r.state, r.pincode, r.country].filter(Boolean).join(", ")}</Td>
          </tr>
          <tr>
            <Th>GST No.</Th>
            <Td className="font-mono">{r.gstNo}</Td>
            <Th>PAN No.</Th>
            <Td className="font-mono">{r.panNo}</Td>
          </tr>
          <tr>
            <Th>Status</Th>
            <Td>
              <span className={`rounded-[4px] px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLES[r.status]}`}>{STATUS_LABEL[r.status]}</span>
            </Td>
            <Th>Status Updated By</Th>
            <Td className="font-semibold text-[#4B1426]">
              {r.statusUpdatedBy}
              {r.statusUpdatedAt && <span className="ml-2 text-[10px] font-medium text-blue-600">{formatDateTime(r.statusUpdatedAt)}</span>}
            </Td>
          </tr>
        </DetailTable>

        {contacts.length > 0 && (
          <div className="mt-8">
            <SectionHeading>Contact Persons</SectionHeading>
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse border border-slate-200 text-[11px]">
                <thead>
                  <tr className="bg-[#f6f9f4] text-left text-slate-600">
                    {["#", "Name", "Designation", "Email", "Mobile", "Alternate No."].map((h) => (
                      <th key={h} className="border border-slate-200 px-3 py-2 font-bold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((c, i) => (
                    <tr key={i} className={i === 0 ? "bg-emerald-50/50" : "bg-white"}>
                      <td className="border border-slate-200 px-3 py-2 font-semibold text-slate-500">{i + 1}</td>
                      <td className="border border-slate-200 px-3 py-2 font-semibold text-[#2563eb]">
                        {personName(c) || "—"}
                        {i === 0 && <span className="ml-2 rounded border border-emerald-200 bg-white px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">PRIMARY</span>}
                      </td>
                      <td className="border border-slate-200 px-3 py-2">{c.designation || "—"}</td>
                      <td className="border border-slate-200 px-3 py-2">{c.email || "—"}</td>
                      <td className="border border-slate-200 px-3 py-2 font-semibold text-[#166534]">{c.mobile || "—"}</td>
                      <td className="border border-slate-200 px-3 py-2">{c.alternateNo || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-8">
          <SectionHeading>Stall &amp; Payment</SectionHeading>
          <DetailTable>
            <tr>
              <Th>Stall No. / Hall</Th>
              <Td className="font-mono font-bold text-[#4B1426]">{[r.stallNumber, r.hall].filter(Boolean).join(" / ")}</Td>
              <Th>Stall Type / Scheme</Th>
              <Td>{[r.stallType, r.plScheme].filter(Boolean).join(" · ")}</Td>
            </tr>
            <tr>
              <Th>Area</Th>
              <Td>{r.stallArea ? `${r.stallArea} m²` : undefined}</Td>
              <Th>Rate per m²</Th>
              <Td>{r.ratePerSqm ? money(r.ratePerSqm) : undefined}</Td>
            </tr>
            <tr>
              <Th>Gross Amount</Th>
              <Td>{f.grossAmount !== undefined ? `${money(f.grossAmount)}${f.plIncrementPercent ? ` (incl. ${f.plIncrementPercent}% PL)` : ""}` : undefined}</Td>
              <Th>Stall Discount</Th>
              <Td>{f.stallDiscountAmount ? `− ${money(f.stallDiscountAmount)} (${f.stallDiscountPercent}%)` : undefined}</Td>
            </tr>
            <tr>
              <Th>Full Payment Discount</Th>
              <Td>{f.fullPaymentDiscountAmount ? `− ${money(f.fullPaymentDiscountAmount)} (${f.fullPaymentDiscountPercent}%)` : undefined}</Td>
              <Th>Taxable Value</Th>
              <Td className="font-semibold">{f.subtotal !== undefined ? money(f.subtotal) : undefined}</Td>
            </tr>
            <tr>
              <Th>GST ({f.gstPercent ?? 18}%)</Th>
              <Td>{f.gstAmount !== undefined ? money(f.gstAmount) : undefined}</Td>
              <Th>TDS</Th>
              <Td>{f.tdsAmount ? `− ${money(f.tdsAmount)} (${f.tdsPercent}%)` : undefined}</Td>
            </tr>
            <tr>
              <Th>Net Payable</Th>
              <Td className="text-[13px] font-extrabold text-[#063B00]">{money(r.netPayable)}</Td>
              <Th>Payment Plan</Th>
              <Td>{r.paymentPlanLabel}</Td>
            </tr>
            <tr>
              <Th>Amount Paid</Th>
              <Td className="font-bold text-emerald-700">{money(r.amountPaid)}</Td>
              <Th>Balance</Th>
              <Td className={r.balanceAmount > 0 ? "font-bold text-red-600" : "font-semibold"}>{money(r.balanceAmount)}</Td>
            </tr>
            <tr>
              <Th>Payment Status</Th>
              <Td>
                <span className={`inline-flex items-center gap-1 rounded-[4px] border px-2 py-0.5 text-[10px] font-bold ${PAYMENT_STYLES[r.paymentStatus]}`}>
                  <CreditCard className="h-3 w-3" /> {PAYMENT_LABEL[r.paymentStatus]}
                </span>
              </Td>
              <Th>Paid On</Th>
              <Td>{r.paidAt ? formatDateTime(r.paidAt) : undefined}</Td>
            </tr>
            <tr>
              <Th>Razorpay Payment ID</Th>
              <Td className="font-mono text-[10.5px]">{r.razorpayPaymentId}</Td>
              <Th>Razorpay Order ID</Th>
              <Td className="font-mono text-[10.5px]">{r.razorpayOrderId}</Td>
            </tr>
          </DetailTable>
        </div>

        {pairs.length > 0 && (
          <div className="mt-8">
            <SectionHeading>Other Form Details</SectionHeading>
            <DetailTable>
              {pairs.map((pair) => (
                <tr key={pair[0][0]}>
                  <Th>{labelOf(pair[0][0])}</Th>
                  <Td colSpan={pair[1] ? undefined : 3}>{renderValue(pair[0][1])}</Td>
                  {pair[1] && (
                    <>
                      <Th>{labelOf(pair[1][0])}</Th>
                      <Td>{renderValue(pair[1][1])}</Td>
                    </>
                  )}
                </tr>
              ))}
            </DetailTable>
          </div>
        )}
      </div>
    </div>
  );
}
