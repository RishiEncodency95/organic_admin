import { api } from "./api";

export type MsmeApplicationStatus =
  | "DRAFT"
  | "ENTERPRISE_SAVED"
  | "PARTICIPATION_SAVED"
  | "PAYMENT_PENDING"
  | "PAYMENT_FAILED"
  | "SUBMITTED";

export interface MsmeBankDetails {
  accountHolderName?: string;
  accountNumber?: string;
  ifsc?: string;
  bankName?: string;
  branch?: string;
}

export interface MsmeEnterpriseDetails {
  udyamNumber?: string;
  enterpriseName?: string;
  enterpriseType?: string;
  majorActivity?: string;
  constitution?: string;
  category?: string;
  gender?: string;
  dateOfIncorporation?: string;
  address?: string;
  state?: string;
  district?: string;
  pincode?: string;
  gstin?: string;
  pan?: string;
  bank?: MsmeBankDetails;
  mobile?: string;
  email?: string;
  verifiedMobile?: string;
  verifiedEmail?: string;
}

export interface MsmeContactPerson {
  name?: string;
  designation?: string;
  mobile?: string;
  email?: string;
  verifiedMobile?: string;
  verifiedEmail?: string;
}

export interface MsmeParticipationDetails {
  stallType?: string;
  stallSize?: string;
  stallLocation?: string;
  contactPerson?: MsmeContactPerson;
}

export interface MsmeEligibilitySnapshot {
  checked: boolean;
  eligible?: boolean;
  category?: string;
  supportPercentage?: number;
  checkedAt?: string;
}

export interface MsmePaymentDetails {
  amount?: number;
  currency?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status?: "PENDING" | "PAID" | "FAILED";
  paidAt?: string;
}

export type MsmeReviewStatus = "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "NEEDS_INFO";

export interface MsmeApplication {
  _id: string;
  applicationId: string;
  status: MsmeApplicationStatus;
  eligibility: MsmeEligibilitySnapshot;
  enterprise: MsmeEnterpriseDetails;
  participation: MsmeParticipationDetails;
  payment: MsmePaymentDetails;
  reviewStatus?: MsmeReviewStatus;
  reviewNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const MSME_REVIEW_LABELS: Record<MsmeReviewStatus, string> = {
  PENDING_REVIEW: "Pending Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  NEEDS_INFO: "Needs Info",
};

export const MSME_STATUS_LABELS: Record<MsmeApplicationStatus, string> = {
  DRAFT: "Draft",
  ENTERPRISE_SAVED: "Enterprise Saved",
  PARTICIPATION_SAVED: "Participation Saved",
  PAYMENT_PENDING: "Payment Pending",
  PAYMENT_FAILED: "Payment Failed",
  SUBMITTED: "Submitted",
};

export const msmeApi = {
  list: (params?: { status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.search) query.set("search", params.search);
    const qs = query.toString();
    return api.get<MsmeApplication[]>(`/msme/admin/applications${qs ? `?${qs}` : ""}`);
  },
  getById: (id: string) => api.get<MsmeApplication>(`/msme/admin/applications/${id}`),
  updateReviewStatus: (id: string, payload: { reviewStatus: MsmeReviewStatus; note?: string }) =>
    api.patch<MsmeApplication>(`/msme/admin/applications/${id}/review`, payload),
};
