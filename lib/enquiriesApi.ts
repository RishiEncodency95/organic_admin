import { api } from "./api";
import { Enquiry, EnquiryStatus } from "./types";

export const enquiriesApi = {
  list: () => api.get<Enquiry[]>("/enquiries/admin"),
  create: (data: Record<string, unknown>) =>
    api.post<Enquiry>("/enquiries/admin", data),
  updateStatus: (id: string, status: EnquiryStatus) =>
    api.put<Enquiry>(`/enquiries/admin/${id}/status`, { status }),
};
