import { api } from "./api";

export type NominationStatus = "pending" | "shortlisted" | "approved" | "rejected";

export const NOMINATION_STATUS_LABELS: Record<NominationStatus, string> = {
  pending: "Pending",
  shortlisted: "Shortlisted",
  approved: "Approved",
  rejected: "Rejected",
};

export interface AwardNomination {
  _id: string;
  applicantType: string;
  orgName: string;
  contactPerson: string;
  designation: string;
  mobile: string;
  email: string;
  website: string;
  city: string;
  stateCountry: string;
  awardCategory: string;
  briefProfile: string;
  yearsExperience: string;
  teamSize: string;
  keyServices: string;
  keyAchievements: string;
  uniqueContribution: string;
  impactCreated: string;
  innovation: string;
  whyDeserve: string;
  deckFile: string;
  certFile: string;
  mediaFile: string;
  deckFileName: string;
  certFileName: string;
  mediaFileName: string;
  socialLink: string;
  declaration: boolean;
  mobileVerified: boolean;
  emailVerified: boolean;
  status: NominationStatus;
  createdAt: string;
  updatedAt: string;
}

interface NominationList {
  nominations: AwardNomination[];
  total: number;
}

const BASE = "/website/awards/nominations";

export const nominationsApi = {
  // Cache-busting query keeps the list fresh after a status change or delete.
  list: () =>
    api.get<NominationList>(`${BASE}?limit=1000&_=${Date.now()}`).then((res) => res?.nominations ?? []),
  updateStatus: (id: string, status: NominationStatus) =>
    api.patch<AwardNomination>(`${BASE}/${id}`, { status }),
  remove: (id: string) => api.delete<void>(`${BASE}/${id}`),
};
