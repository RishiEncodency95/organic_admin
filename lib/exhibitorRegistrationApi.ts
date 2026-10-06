import { api } from "./api";

export type ExhibitorCategory = "domestic" | "international";
export type ExhibitorStatus = "pending" | "confirmed" | "cancelled";
export type ExhibitorPaymentStatus = "pending" | "paid" | "failed";

export interface ExhibitorContact {
  title?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  designation?: string;
  mobile?: string;
  alternateNo?: string;
}

export interface ExhibitorRegistration {
  _id: string;
  registrationNo: string;
  category: ExhibitorCategory;
  eventName?: string;
  exhibitorName: string;
  fasciaName?: string;
  typeOfBusiness?: string;
  natureOfBusiness?: string;
  industrySector?: string;
  website?: string;
  address?: string;
  country?: string;
  state?: string;
  city?: string;
  pincode?: string;
  gstNo?: string;
  panNo?: string;
  contact1: ExhibitorContact;
  contact2?: ExhibitorContact;
  stallNumber: string;
  hall?: string;
  stallType?: string;
  stallArea?: number;
  plScheme?: string;
  currency: "INR" | "USD";
  ratePerSqm?: number;
  // Server-calculated price breakdown (only returned by `get`)
  finance?: Record<string, number>;
  paymentPlanLabel?: string;
  netPayable: number;
  amountDueNow: number;
  amountPaid: number;
  balanceAmount: number;
  paymentStatus: ExhibitorPaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paidAt?: string;
  stallConflict?: boolean;
  status: ExhibitorStatus;
  statusUpdatedBy?: string;
  statusUpdatedAt?: string;
  details?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export const formatMoney = (amount: number | undefined, currency: "INR" | "USD" = "INR") =>
  `${currency === "USD" ? "$" : "₹"}${Math.round(amount || 0).toLocaleString(currency === "USD" ? "en-US" : "en-IN")}`;

// Website "Book a Stand" (backend: /exhibitor-registrations).
export const exhibitorRegistrationApi = {
  list: (category: ExhibitorCategory) =>
    api.get<{ registrations: ExhibitorRegistration[]; total: number }>(
      `/exhibitor-registrations/admin?category=${category}&limit=1000`
    ),
  get: (id: string) => api.get<ExhibitorRegistration>(`/exhibitor-registrations/admin/${id}`),
  updateStatus: (id: string, status: ExhibitorStatus) =>
    api.put<ExhibitorRegistration>(`/exhibitor-registrations/admin/${id}`, { status }),
  remove: (id: string) => api.delete<null>(`/exhibitor-registrations/admin/${id}`),
};
