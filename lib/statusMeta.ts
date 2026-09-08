import { EnquiryStatus, CaseStatus, AssistanceRequestStatus, CasePriority, ExpenseStatus, VolunteerStatus, VolunteerAvailability, AssignmentStatus, NewDonationStatus, CampaignStatus } from "./types";

// Booking/payment status meta were the paid-booking model and no longer apply.

type Tone = "pending" | "confirmed" | "progress" | "success" | "danger" | "neutral";

export const CASE_STATUS_META: Record<CaseStatus, { label: string; tone: Tone }> = {
  NEW: { label: "New", tone: "pending" },
  UNDER_VERIFICATION: { label: "Under Verification", tone: "pending" },
  APPROVED: { label: "Approved", tone: "confirmed" },
  VOLUNTEER_ASSIGNED: { label: "Volunteer Assigned", tone: "progress" },
  TRANSPORT_ARRANGED: { label: "Transport Arranged", tone: "progress" },
  CREMATION_IN_PROGRESS: { label: "Cremation In Progress", tone: "progress" },
  CREMATION_COMPLETED: { label: "Cremation Completed", tone: "confirmed" },
  DOCS_UPLOADED: { label: "Docs Uploaded", tone: "confirmed" },
  CLOSED: { label: "Closed", tone: "success" },
  REJECTED: { label: "Rejected", tone: "danger" },
  CANCELLED: { label: "Cancelled", tone: "neutral" },
};

// PRD §8.3 — mirrors backend CASE_STATUS_TRANSITIONS; kept here purely to drive the admin's
// status dropdown. The backend re-validates every transition regardless of what this shows.
export const CASE_STATUS_TRANSITIONS: Record<CaseStatus, CaseStatus[]> = {
  NEW: ["UNDER_VERIFICATION"],
  UNDER_VERIFICATION: ["APPROVED", "REJECTED"],
  APPROVED: ["VOLUNTEER_ASSIGNED", "CANCELLED"],
  VOLUNTEER_ASSIGNED: ["TRANSPORT_ARRANGED", "CANCELLED"],
  TRANSPORT_ARRANGED: ["CREMATION_IN_PROGRESS"],
  CREMATION_IN_PROGRESS: ["CREMATION_COMPLETED"],
  CREMATION_COMPLETED: ["DOCS_UPLOADED"],
  DOCS_UPLOADED: ["CLOSED"],
  CLOSED: [],
  REJECTED: [],
  CANCELLED: [],
};

export const CASE_PRIORITY_META: Record<CasePriority, { label: string; tone: Tone }> = {
  LOW: { label: "Low", tone: "neutral" },
  NORMAL: { label: "Normal", tone: "pending" },
  HIGH: { label: "High", tone: "progress" },
  CRITICAL: { label: "Critical", tone: "danger" },
};

export const REQUEST_STATUS_META: Record<AssistanceRequestStatus, { label: string; tone: Tone }> = {
  SUBMITTED: { label: "Submitted", tone: "pending" },
  CONVERTED: { label: "Converted", tone: "success" },
  REJECTED: { label: "Rejected", tone: "danger" },
};

export const EXPENSE_STATUS_META: Record<ExpenseStatus, { label: string; tone: Tone }> = {
  SUBMITTED: { label: "Pending Approval", tone: "pending" },
  APPROVED: { label: "Approved", tone: "success" },
  REJECTED: { label: "Rejected", tone: "danger" },
  REVERSED: { label: "Reversed", tone: "neutral" },
};

export const VOLUNTEER_STATUS_META: Record<VolunteerStatus, { label: string; tone: Tone }> = {
  ACTIVE: { label: "Active", tone: "success" },
  INACTIVE: { label: "Inactive", tone: "neutral" },
  BLACKLISTED: { label: "Blacklisted", tone: "danger" },
};

export const VOLUNTEER_AVAILABILITY_META: Record<VolunteerAvailability, { label: string; tone: Tone }> = {
  AVAILABLE: { label: "Available", tone: "success" },
  BUSY: { label: "Busy", tone: "pending" },
  UNAVAILABLE: { label: "Unavailable", tone: "neutral" },
};

export const ASSIGNMENT_STATUS_META: Record<AssignmentStatus, { label: string; tone: Tone }> = {
  ASSIGNED: { label: "Awaiting Response", tone: "pending" },
  ACCEPTED: { label: "Accepted", tone: "success" },
  DECLINED: { label: "Declined", tone: "danger" },
  COMPLETED: { label: "Completed", tone: "confirmed" },
  WITHDRAWN: { label: "Withdrawn", tone: "neutral" },
};

export const DONATION_STATUS_META: Record<NewDonationStatus, { label: string; tone: Tone }> = {
  PENDING: { label: "Pending", tone: "pending" },
  SUCCESS: { label: "Successful", tone: "success" },
  FAILED: { label: "Failed", tone: "danger" },
  REFUNDED: { label: "Refunded", tone: "neutral" },
  CANCELLED: { label: "Cancelled", tone: "neutral" },
};

export const CAMPAIGN_STATUS_META: Record<CampaignStatus, { label: string; tone: Tone }> = {
  DRAFT: { label: "Draft", tone: "neutral" },
  ACTIVE: { label: "Active", tone: "success" },
  PAUSED: { label: "Paused", tone: "pending" },
  COMPLETED: { label: "Completed", tone: "confirmed" },
  ARCHIVED: { label: "Archived", tone: "neutral" },
};

export const ENQUIRY_STATUS_META: Record<EnquiryStatus, { label: string; tone: Tone }> = {
  new: { label: "New", tone: "pending" },
  contacted: { label: "Contacted", tone: "confirmed" },
  closed: { label: "Closed", tone: "neutral" },
};

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}
