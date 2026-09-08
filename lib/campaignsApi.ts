import { api } from "./api";
import { Campaign, CampaignStatus, DonationCause } from "./types";

export interface CampaignInput {
  title: string;
  slug: string;
  description?: string;
  coverImage?: string;
  cause: DonationCause;
  goalAmount?: number;
  status: CampaignStatus;
}

export const campaignsApi = {
  list: (status?: CampaignStatus) => api.get<Campaign[]>(`/campaigns/admin${status ? `?status=${status}` : ""}`),
  getById: (id: string) => api.get<Campaign>(`/campaigns/admin/${id}`),
  create: (input: CampaignInput) => api.post<Campaign>("/campaigns/admin", input),
  update: (id: string, input: Partial<CampaignInput>) => api.put<Campaign>(`/campaigns/admin/${id}`, input),
};
