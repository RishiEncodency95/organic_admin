import { api } from "./api";
export type GbpLocation = { locationId: string; name: string; city: string; address: string; profileUrl?: string | null };
export type GbpReview = { id: string; googleReviewId: string; reviewerName: string; reviewerPhoto: string | null; rating: number; comment: string; locationId: string; locationName: string; createTime: string; updateTime: string; replyComment: string | null; replyUpdateTime: string | null; replyStatus: "pending" | "replied"; lastSyncedAt: string };
export type GbpDashboard = { metrics: { overallRating: number; totalReviews: number; newReviews: number; pendingReplies: number }; tabCounts: Record<"all"|"new"|"pending"|"replied"|"negative", number>; ratingBreakdown: { stars: number; count: number; percentage: number }[]; trend: { label: string; averageRating: number; count: number }[]; byLocation: { locationId: string; name: string; averageRating: number; totalReviews: number }[]; negativeReviews: { id: string; reviewerName: string; rating: number; comment: string; locationName: string; createTime: string; replyStatus: string }[]; lastSyncedAt: string | null };
export type Connection = { connected: boolean; googleEmail: string | null; oauthHealth: string; selectedAccountId: string | null; locationCount: number; lastSuccessfulSync: string | null; notifications: string };
const qs = (p: Record<string, string | number | undefined>) => new URLSearchParams(Object.entries(p).filter(([,v]) => v !== undefined).map(([k,v]) => [k,String(v)])).toString();
export const gbpApi = {
  connection: () => api.get<Connection>("/gbp/connection"), oauthUrl: () => api.get<{url:string}>("/gbp/oauth/url"), disconnect: () => api.delete<void>("/gbp/disconnect"),
  locations: () => api.get<GbpLocation[]>("/gbp/locations"), dashboard: (p: Record<string,string|undefined>) => api.get<GbpDashboard>(`/gbp/dashboard?${qs(p)}`),
  reviews: (p: Record<string,string|number|undefined>) => api.get<{ rows:GbpReview[]; pagination:{page:number;limit:number;total:number;totalPages:number}; totalReviews:number; filteredCount:number }>(`/gbp/reviews?${qs(p)}`),
  exportReviews: (p: Record<string,string|number|undefined>) => api.getBlob(`/gbp/reviews/export.csv?${qs(p)}`),
  sync: (locationId?: string) => api.post<{status:string;newReviewsCount:number;updatedReviewsCount:number;lastSyncedAt:string}>("/gbp/reviews/sync", locationId ? {locationId}: {}, {timeoutMs:120000}),
  reply: (id:string, comment:string) => api.post<GbpReview>(`/gbp/reviews/${encodeURIComponent(id)}/reply`, {comment}), deleteReply: (id:string) => api.delete<GbpReview>(`/gbp/reviews/${encodeURIComponent(id)}/reply`),
};
