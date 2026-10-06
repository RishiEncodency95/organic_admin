import type { CSSProperties, ReactNode } from "react";

/**
 * Building blocks of the admin "Registration Overview" pages (Visitor Registrations,
 * Book a Stand) — same layout as the CityCalls registration overview.
 */

/* ───────── Detail table (same layout as the CityCalls registration overview) ───────── */

export function DetailTable({ children }: { children: ReactNode }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse border border-slate-200">
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Th({ children }: { children: ReactNode }) {
  return (
    <th className="w-1/4 border border-slate-200 bg-[#f6f9f4] px-4 py-2.5 text-left align-middle text-[11px] font-bold text-slate-600">
      {children}
    </th>
  );
}

export function Td({ children, colSpan, className = "", style }: { children?: ReactNode; colSpan?: number; className?: string; style?: CSSProperties }) {
  const empty = children === undefined || children === null || children === "";
  return (
    <td colSpan={colSpan} style={style} className={`w-1/4 border border-slate-200 bg-white px-4 py-2.5 text-left align-middle text-[11px] text-slate-800 ${className}`}>
      {empty ? <span className="text-slate-400">—</span> : children}
    </td>
  );
}

export function SectionHeading({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
      <div className="flex items-center gap-3">
        <div className="h-5 w-1 rounded-full bg-[#3e8914]" />
        <h2 className="text-[12px] font-bold uppercase tracking-wider text-[#23471d]">{children}</h2>
      </div>
      {action}
    </div>
  );
}

export function Chip({ children, tone = "amber" }: { children: ReactNode; tone?: "amber" | "green" | "blue" }) {
  const tones = {
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    green: "border-green-200 bg-green-50 text-green-700",
    blue: "border-sky-200 bg-sky-50 text-sky-700",
  };
  return <span className={`inline-block rounded-md border px-2 py-0.5 text-[10.5px] font-bold ${tones[tone]}`}>{children}</span>;
}


/* ───────── Form answers: everything the visitor filled that isn't shown above ───────── */

export const SHOWN_KEYS = new Set([
  "firstName", "lastName", "name", "email", "mobile", "mobileNo", "companyName", "designation", "country", "state", "city",
  "nationality", "registrationFor",
]);

const LABELS: Record<string, string> = {
  dob: "Date of Birth",
  dateOfBirth: "Date of Birth",
  alternateNo: "Alternate No.",
  otherIndustry: "Other Industry",
  companyPincode: "Pincode",
  companyWebsite: "Company Website",
  companySize: "Company Size",
  schedulingB2B: "B2B Meeting Scheduling",
  whatsappUpdates: "WhatsApp Updates",
  anyRequirement: "Any Requirement",
  subscribeNewsletter: "Newsletter",
  purposeOfVisit: "Purpose of Visit",
  areaOfInterest: "Area of Interest",
  passportNo: "Passport No.",
  personalEmail: "Personal Email",
  whatsappNo: "WhatsApp No.",
  indiaContactNo: "India Contact No.",
  numAttendees: "No. of Attendees",
  vipPass: "VIP Pass",
  invitationLetter: "Invitation Letter",
  hotelAssistance: "Hotel Assistance",
  airportPickup: "Airport Pickup",
  translatorSupport: "Translator Support",
  conferenceInterest: "Conference Interest",
  conferenceRole: "Conference Role",
  residenceAddress: "Residence Address",
  existingMedicalConditions: "Existing Medical Conditions",
  isTakingMedications: "Taking Medications",
  hasAllergies: "Allergies",
  isExperiencingSymptoms: "Experiencing Symptoms",
  healthCheckupServices: "Health Check-up Services",
  consentMedicalData: "Consent for Medical Data",
  agreeToUpdates: "Agree to Updates",
  specificHealthConcerns: "Specific Health Concerns",
  confirmInfo: "Information Confirmed",
  agreeTerms: "Terms Accepted",
  acceptPrivacy: "Privacy Policy Accepted",
  agreeRules: "Expo Rules Accepted",
  digitalSignature: "Digital Signature",
  // Book a Stand
  selectedSectors: "Selected Sectors",
  primaryCategory: "Primary Category",
  subCategory: "Sub Category",
  otherSector: "Other Sector",
  referredBy: "Referred By",
  socialMediaType: "Social Media",
  referralName: "Referral Name",
  referralMobile: "Referral Mobile",
  spokenWith: "Spoken With",
  filledBy: "Form Filled By",
  landlineNo: "Landline No.",
  aadhaarNo: "Aadhaar No.",
  registrantType: "GST Registration",
  chosenTdsPercent: "TDS Deducted (%)",
};

export const labelOf = (key: string) =>
  LABELS[key] || key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").replace(/^./, (c) => c.toUpperCase());

const isYes = (v: unknown) => v === true || String(v).toLowerCase() === "yes";
const isNo = (v: unknown) => v === false || String(v).toLowerCase() === "no";

export function renderValue(value: unknown): ReactNode {
  if (value === null || value === undefined || value === "") return undefined;
  if (typeof value === "boolean" || isYes(value) || isNo(value)) {
    return isYes(value) ? <Chip tone="green">Yes</Chip> : <span className="font-semibold text-slate-500">No</span>;
  }
  if (Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {value.map((v, i) => (
          <Chip key={i}>{typeof v === "object" ? JSON.stringify(v) : String(v)}</Chip>
        ))}
      </div>
    );
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    // e.g. { generalCheckup: true, eyeCheckup: false } → chips of the ticked ones
    if (entries.every(([, v]) => typeof v === "boolean")) {
      const ticked = entries.filter(([, v]) => v).map(([k]) => labelOf(k));
      return ticked.length ? (
        <div className="flex flex-wrap gap-1.5">{ticked.map((t) => <Chip key={t} tone="blue">{t}</Chip>)}</div>
      ) : undefined;
    }
    return entries.map(([k, v]) => `${labelOf(k)}: ${String(v)}`).join(", ");
  }
  return <span className="whitespace-pre-wrap">{String(value)}</span>;
}
