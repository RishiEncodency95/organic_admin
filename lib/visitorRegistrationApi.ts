import { api } from "./api";

export type VisitorCategory = "domestic" | "international" | "group";
export type VisitorSubType = "corporate" | "general" | "healthCamp" | "";
export type VisitorStatus = "pending" | "confirmed" | "cancelled";

export interface VisitorPerson {
  firstName: string;
  lastName: string;
  gender?: string;
  designation?: string;
  email?: string;
  mobile?: string;
}

export interface VisitorRegistration {
  _id: string;
  registrationNo: string;
  category: VisitorCategory;
  subType: VisitorSubType;
  eventName?: string;
  name: string;
  email: string;
  mobile: string;
  companyName?: string;
  designation?: string;
  country?: string;
  state?: string;
  city?: string;
  nationality?: string;
  persons: VisitorPerson[];
  // Everything the visitor filled on the website (only returned by `get`)
  details?: Record<string, unknown>;
  status: VisitorStatus;
  statusUpdatedBy?: string;
  statusUpdatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const SUBTYPE_LABEL: Record<string, string> = {
  corporate: "Corporate Visitor",
  general: "General Visitor",
  healthCamp: "Free Health Camp",
};

export const CATEGORY_LABEL: Record<VisitorCategory, string> = {
  domestic: "Domestic Visitor",
  international: "International Visitor",
  group: "Group Registration",
};

// Website visitor registration (backend: /visitor-registrations).
export const visitorRegistrationApi = {
  list: (category: VisitorCategory) =>
    api.get<{ registrations: VisitorRegistration[]; total: number }>(
      `/visitor-registrations/admin?category=${category}&limit=1000`
    ),
  get: (id: string) => api.get<VisitorRegistration>(`/visitor-registrations/admin/${id}`),
  updateStatus: (id: string, status: VisitorStatus) =>
    api.put<VisitorRegistration>(`/visitor-registrations/admin/${id}`, { status }),
  remove: (id: string) => api.delete<null>(`/visitor-registrations/admin/${id}`),
};
