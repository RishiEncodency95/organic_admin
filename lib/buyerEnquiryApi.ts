import { api } from "./api";

export type BuyerEnquiryStatus = "pending" | "contacted" | "resolved";

export interface BuyerEnquiry {
  _id: string;
  name: string;
  company?: string;
  phone: string; // 10-digit, WhatsApp-verified
  email: string;
  city?: string;
  country?: string;
  buyerType?: string;
  enquiryAbout: string;
  message: string;
  eventName?: string;
  status: BuyerEnquiryStatus;
  createdAt: string;
  updatedAt: string;
}

// "Buyer Enquiry" popup on the website's Buyer-Seller Meet page (backend: /buyer-enquiries).
export const buyerEnquiryApi = {
  list: () => api.get<{ enquiries: BuyerEnquiry[]; total: number }>("/buyer-enquiries/admin?limit=1000"),
  updateStatus: (id: string, status: BuyerEnquiryStatus) =>
    api.put<BuyerEnquiry>(`/buyer-enquiries/admin/${id}`, { status }),
  remove: (id: string) => api.delete<null>(`/buyer-enquiries/admin/${id}`),
};
