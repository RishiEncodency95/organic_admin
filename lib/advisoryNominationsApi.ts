import { api } from "./api";

export type AdvisoryNominationStatus = "pending" | "shortlisted" | "approved" | "rejected";

export const ADVISORY_STATUS_LABELS: Record<AdvisoryNominationStatus, string> = {
  pending: "Pending",
  shortlisted: "Shortlisted",
  approved: "Approved",
  rejected: "Rejected",
};

type Person = { name: string; designation: string; organisation: string; email: string; phone: string };

export interface AdvisoryNomination {
  _id: string;
  nominee: Person & { industry: string; linkedin: string };
  expertiseArea: string;
  achievements: string;
  reason: string;
  nominator: Person;
  relationship: string;
  selfNomination: boolean;
  additionalInfo: string;
  declaration: boolean;
  eventName: string;
  status: AdvisoryNominationStatus;
  adminNote: string;
  statusUpdatedBy?: string;
  statusUpdatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const BASE = "/advisory-nominations";

export const advisoryNominationsApi = {
  // Cache-busting query keeps the list fresh after a change
  list: () =>
    api
      .get<{ nominations: AdvisoryNomination[]; total: number }>(`${BASE}?limit=2000&_=${Date.now()}`)
      .then((res) => res?.nominations ?? []),
  update: (id: string, data: { status?: AdvisoryNominationStatus; adminNote?: string }) => api.patch<AdvisoryNomination>(`${BASE}/${id}`, data),
  remove: (id: string) => api.delete<null>(`${BASE}/${id}`),
};
