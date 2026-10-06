"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CalendarClock, ClipboardCheck, Globe2, Printer, Users, UsersRound } from "lucide-react";
import Swal from "sweetalert2";
import { ApiRequestError } from "@/lib/api";
import {
  CATEGORY_LABEL,
  SUBTYPE_LABEL,
  visitorRegistrationApi,
  type VisitorRegistration,
  type VisitorStatus,
} from "@/lib/visitorRegistrationApi";
import { STATUS_LABEL, STATUS_STYLES, formatDateTime } from "@/components/visitor-registrations/VisitorRegistrationsList";
import { DetailTable, SHOWN_KEYS, SectionHeading, Td, Th, labelOf, renderValue } from "@/components/overview/OverviewParts";

function StatusBadge({ status }: { status: VisitorStatus }) {
  return <span className={`inline-block rounded-[4px] px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLES[status]}`}>{STATUS_LABEL[status]}</span>;
}

/* ───────── Page ───────── */

const NEXT_STATUSES: Record<VisitorStatus, { status: VisitorStatus; label: string; className: string }[]> = {
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

const CATEGORY_ICON = { domestic: Users, international: Globe2, group: UsersRound };
const LIST_TITLE = { domestic: "Domestic Visitors", international: "International Visitors", group: "Group Registrations" };

export default function VisitorOverviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [r, setR] = useState<VisitorRegistration | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    visitorRegistrationApi
      .get(id)
      .then((data) => active && setR(data))
      .catch((err) => active && setError(err instanceof ApiRequestError ? err.message : "Could not load this registration."));
    return () => {
      active = false;
    };
  }, [id]);

  const changeStatus = async (status: VisitorStatus) => {
    if (!r) return;
    const confirm = await Swal.fire({
      title: `Mark as ${STATUS_LABEL[status]}?`,
      text: `${r.registrationNo} — ${r.name}`,
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
      const updated = await visitorRegistrationApi.updateStatus(r._id, status);
      setR((prev) => (prev ? { ...prev, status: updated.status, statusUpdatedBy: updated.statusUpdatedBy, statusUpdatedAt: updated.statusUpdatedAt } : prev));
    } catch (err) {
      Swal.fire({ icon: "error", title: "Could not update", text: err instanceof ApiRequestError ? err.message : "Please try again.", background: "#1e2433", color: "#e2e8f0" });
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return <div className="p-10 text-center text-[12px] font-semibold text-red-600">{error}</div>;
  }
  if (!r) {
    return <div className="p-10 text-center text-[12px] text-slate-500">Loading registration…</div>;
  }

  const Icon = CATEGORY_ICON[r.category];
  const listPath = `/visitor-registrations/${r.category}`;
  const typeLabel = r.category === "domestic" ? SUBTYPE_LABEL[r.subType] || CATEGORY_LABEL.domestic : CATEGORY_LABEL[r.category];
  const extra = Object.entries(r.details || {}).filter(([k]) => !SHOWN_KEYS.has(k));
  const pairs = Array.from({ length: Math.ceil(extra.length / 2) }, (_, i) => extra.slice(i * 2, i * 2 + 2));

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
            <Link href={listPath} className="hover:underline">{LIST_TITLE[r.category]}</Link> / {r.name}
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
              <span className="border border-[#3e8914]/30 bg-[#3e8914]/10 px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider text-[#23471d]">{typeLabel}</span>
            </div>
          }
        >
          Registration Overview
        </SectionHeading>

        {/* Highlight card */}
        <div className="mb-6 flex flex-col items-start justify-between gap-4 border-2 border-emerald-200 bg-[#f0fdf4] p-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center border-2 border-[#3e8914] bg-white shadow-sm">
              <Icon className="h-7 w-7 text-[#3e8914]" />
            </div>
            <div>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-emerald-700" />
                <h3 className="text-[13px] font-bold uppercase tracking-wide text-emerald-950">
                  {r.category === "group" ? r.companyName || r.name : r.name}
                </h3>
                <StatusBadge status={r.status} />
              </div>
              <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-emerald-800">
                <CalendarClock className="h-3.5 w-3.5" />
                Registered: {formatDateTime(r.createdAt)}
                {r.category === "group" ? ` · ${r.persons.length} members` : ""}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-600">Reg No:</span>
                <span className="border border-purple-300 bg-white px-2.5 py-1 font-mono text-[12px] font-extrabold tracking-wider text-purple-950 shadow-xs">
                  {r.registrationNo}
                </span>
              </div>
            </div>
          </div>
          {r.eventName && (
            <div className="border-2 border-dashed border-[#4B1426]/40 bg-white px-4 py-2">
              <p className="text-[9.5px] font-bold uppercase tracking-wide text-gray-500">Registered For</p>
              <p className="font-mono text-[12px] font-extrabold tracking-wider text-[#4B1426]">{r.eventName}</p>
            </div>
          )}
        </div>

        <DetailTable>
          <tr>
            <Th>{r.category === "group" ? "Primary Contact" : "Full Name"}</Th>
            <Td className="text-[12.5px] font-semibold" style={{ color: "#2563eb" }}>{r.name}</Td>
            <Th>Registration No</Th>
            <Td className="font-mono font-bold" style={{ color: "#4E1F6E" }}>{r.registrationNo}</Td>
          </tr>
          <tr>
            <Th>Date of Registration</Th>
            <Td className="font-semibold" style={{ color: "#dc2626" }}>{formatDateTime(r.createdAt)}</Td>
            <Th>Registration Type</Th>
            <Td className="font-semibold text-blue-600">{typeLabel}</Td>
          </tr>
          <tr>
            <Th>Mobile Number</Th>
            <Td className="font-medium" style={{ color: "#2563eb" }}>{r.mobile}</Td>
            <Th>Email Address</Th>
            <Td className="font-medium" style={{ color: "#2563eb" }}>{r.email}</Td>
          </tr>
          <tr>
            <Th>{r.category === "group" ? "Organisation" : "Company Name"}</Th>
            <Td className="font-semibold" style={{ color: "#063B00" }}>{r.companyName}</Td>
            <Th>Designation</Th>
            <Td>{r.designation}</Td>
          </tr>
          <tr>
            <Th>City / State</Th>
            <Td>{[r.city, r.state].filter(Boolean).join(", ")}</Td>
            <Th>{r.category === "international" ? "Country / Nationality" : "Country"}</Th>
            <Td>{r.category === "international" ? [r.country, r.nationality].filter(Boolean).join(" / ") : r.country}</Td>
          </tr>
          <tr>
            <Th>Status</Th>
            <Td><StatusBadge status={r.status} /></Td>
            <Th>Status Updated By</Th>
            <Td className="font-semibold text-[#4B1426]">
              {r.statusUpdatedBy}
              {r.statusUpdatedAt && <span className="ml-2 text-[10px] font-medium text-blue-600">{formatDateTime(r.statusUpdatedAt)}</span>}
            </Td>
          </tr>
        </DetailTable>

        {r.category === "group" && r.persons.length > 0 && (
          <div className="mt-8">
            <SectionHeading>Group Members ({r.persons.length})</SectionHeading>
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse border border-slate-200 text-[11px]">
                <thead>
                  <tr className="bg-[#f6f9f4] text-left text-slate-600">
                    {["#", "Name", "Gender", "Designation", "Email", "Mobile"].map((h) => (
                      <th key={h} className="border border-slate-200 px-3 py-2 font-bold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {r.persons.map((p, i) => (
                    <tr key={i} className={i === 0 ? "bg-emerald-50/50" : "bg-white"}>
                      <td className="border border-slate-200 px-3 py-2 font-semibold text-slate-500">{i + 1}</td>
                      <td className="border border-slate-200 px-3 py-2 font-semibold text-[#2563eb]">
                        {[p.firstName, p.lastName].filter(Boolean).join(" ") || "—"}
                        {i === 0 && <span className="ml-2 rounded border border-emerald-200 bg-white px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">PRIMARY</span>}
                      </td>
                      <td className="border border-slate-200 px-3 py-2">{p.gender || "—"}</td>
                      <td className="border border-slate-200 px-3 py-2">{p.designation || "—"}</td>
                      <td className="border border-slate-200 px-3 py-2">{p.email || "—"}</td>
                      <td className="border border-slate-200 px-3 py-2 font-semibold text-[#166534]">{p.mobile || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {pairs.length > 0 && (
          <div className="mt-8">
            <SectionHeading>{r.category === "group" ? "Organisation & Visit Details" : "Registration Form Details"}</SectionHeading>
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
