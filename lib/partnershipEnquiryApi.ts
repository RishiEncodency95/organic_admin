import { api } from "./api";

export type PartnershipEnquiryStatus = "pending" | "contacted" | "resolved";

export interface PartnershipEnquiry {
  _id: string;
  name: string;
  organization: string;
  email: string;
  phone: string;
  category: string;
  message?: string;
  eventName?: string;
  status: PartnershipEnquiryStatus;
  createdAt: string;
  updatedAt: string;
}

interface PartnershipEnquiryListResponse {
  enquiries: PartnershipEnquiry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const partnershipEnquiryApi = {
  // Fetch once with a large limit and filter/paginate client-side, same as Contact Us Messages.
  list: () => api.get<PartnershipEnquiryListResponse>("/partnership-enquiry?limit=1000"),
  updateStatus: (id: string, status: PartnershipEnquiryStatus) =>
    api.put<PartnershipEnquiry>(`/partnership-enquiry/${id}`, { status }),
  remove: (id: string) => api.delete<{ message: string }>(`/partnership-enquiry/${id}`),
};
