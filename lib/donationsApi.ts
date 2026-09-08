import { api } from "./api";
import { Donation, DonationSummary, NewDonationStatus, DonationCause, PaymentMode } from "./types";

export const donationsApi = {
  list: (status?: NewDonationStatus) => api.get<Donation[]>(`/donations/admin${status ? `?status=${status}` : ""}`),
  summary: () => api.get<DonationSummary>("/donations/admin/summary"),
  updateStatus: (id: string, status: NewDonationStatus) =>
    api.put<Donation>(`/donations/admin/${id}/status`, { status }),
  recordOffline: (input: {
    donorName: string;
    donorEmail: string;
    donorPhone: string;
    pan?: string;
    dedication?: string;
    cause: DonationCause;
    campaignId?: string;
    amount: number;
    paymentMode: PaymentMode;
    referenceNo?: string;
  }) => api.post<Donation>("/donations/admin/offline", input),
  receiptHtml: (receiptId: string) => api.getHtml(`/donations/admin/receipts/${receiptId}`),
};
