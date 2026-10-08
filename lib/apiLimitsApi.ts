import { api } from "./api";

/** IP Block Limits: per website API, how many attempts one IP gets and how long it is then blocked. */
export interface ApiLimitRule {
  key: string;
  label: string;
  path: string;
  enabled: boolean;
  maxAttempts: number;
  blockHours: number;
  defaults: { maxAttempts: number; blockHours: number };
  attemptsToday: number;
  blockedNow: number;
}

export interface ApiBlockRow {
  id: string;
  ip: string;
  api: string;
  apiLabel: string;
  path: string;
  attempts: number;
  blockedAt: string;
  blockedUntil: string;
  status: "Blocked" | "Expired" | "Unblocked";
  liftedAt: string | null;
  liftedBy: string | null;
}

export interface ApiLimitsData {
  rules: ApiLimitRule[];
  stats: { blockedNow: number; blocks30d: number; attemptsToday: number; ips7d: number; protectedOn: number; protectedTotal: number };
  blocks: ApiBlockRow[];
}

// api.get memoises GETs for a moment; the timestamp keeps the screen fresh after a change
const fresh = () => `_=${Date.now()}`;

export const apiLimitsApi = {
  get: () => api.get<ApiLimitsData>(`/api-limits/admin?${fresh()}`),
  save: (rules: Pick<ApiLimitRule, "key" | "enabled" | "maxAttempts" | "blockHours">[]) => api.put<unknown>("/api-limits/admin", { rules }),
  unblock: (ip: string, apiKey?: string) => api.post<unknown>("/api-limits/admin/unblock", { ip, api: apiKey }),
};
