import { api } from "./api";

export type ContactEnquiryStatus = "pending" | "contacted" | "resolved";

export interface ContactEnquiry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  subject?: string;
  service?: string;
  message: string;
  eventName?: string;
  status: ContactEnquiryStatus;
  createdAt: string;
  updatedAt: string;
}

interface ContactEnquiryListResponse {
  enquiries: ContactEnquiry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const contactEnquiryApi = {
  // A large limit keeps this in line with how the rest of the admin (e.g.
  // Job Postings) fetches once and filters/paginates client-side, instead of
  // round-tripping to the server on every keystroke.
  list: () => api.get<ContactEnquiryListResponse>("/contact-enquiry?limit=1000"),
  updateStatus: (id: string, status: ContactEnquiryStatus) =>
    api.put<ContactEnquiry>(`/contact-enquiry/${id}`, { status }),
  remove: (id: string) => api.delete<{ message: string }>(`/contact-enquiry/${id}`),
};
