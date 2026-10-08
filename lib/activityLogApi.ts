import { api } from "./api";

export interface ActivityChange {
  entity: string;
  entityId?: string;
  operation: "created" | "updated" | "deleted";
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
}

/** One admin action, recorded automatically by the backend (see activityLog.middleware). */
export interface ActivityLogEntry {
  _id: string;
  userId?: string;
  userName: string;
  userEmail?: string;
  userRole?: string;
  action: string;
  module: string;
  url: string;
  method: string;
  apiPath: string;
  ip: string;
  userAgent?: string;
  status: "Success" | "Failed";
  statusCode: number;
  details: string;
  entityId?: string;
  durationMs?: number;
  /** Records the action touched, with old → new values (only changed fields for updates) */
  changes?: ActivityChange[];
  createdAt: string;
}

export interface ActivityLogStats {
  total: number;
  today: number;
  created: number;
  updated: number;
  deleted: number;
  logins: number;
  failed: number;
}

export interface ActivityLogPage {
  items: ActivityLogEntry[];
  total: number;
  page: number;
  pages: number;
  stats: ActivityLogStats;
  filters: { users: string[]; modules: string[]; actions: string[] };
}

export interface ActivityLogFilters {
  page?: number;
  limit?: number;
  q?: string;
  user?: string;
  action?: string;
  module?: string;
  status?: string;
  from?: string;
  to?: string;
}

export const activityLogApi = {
  list: (filters: ActivityLogFilters = {}) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== "") params.set(key, String(value));
    }
    // api.get memoises GETs for a moment; the timestamp keeps the log fresh
    params.set("_", String(Date.now()));
    return api.get<ActivityLogPage>(`/activity-logs?${params}`);
  },
};
