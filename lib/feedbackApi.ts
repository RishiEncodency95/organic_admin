import { api } from "./api";

export type FeedbackStatus = "new" | "reviewed" | "contacted";

export interface WebsiteFeedback {
  _id: string;
  role: string;
  name: string;
  company: string;
  designation?: string;
  phone: string; // 10-digit
  email?: string;
  edition: string;
  ratings: { overall: number; networking: number; quality: number; management: number }; // 0 = not rated
  valuable: string;
  improve?: string;
  consentToFeature: boolean;
  wantsContact: boolean;
  photo?: string;
  logo?: string;
  status: FeedbackStatus;
  createdAt: string;
  updatedAt: string;
}

// "Share Your Feedback" form on the website (/feedback). Backend: /feedback.
export const feedbackApi = {
  list: () => api.get<{ items: WebsiteFeedback[]; total: number }>("/feedback/admin"),
  updateStatus: (id: string, status: FeedbackStatus) => api.put<WebsiteFeedback>(`/feedback/admin/${id}`, { status }),
  remove: (id: string) => api.delete<{ deleted: boolean }>(`/feedback/admin/${id}`),
};
