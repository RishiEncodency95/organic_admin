import { api } from "./api";

/** Careers Dashboard numbers (GET /careers/admin/dashboard) */
export type CareerCounts = {
  pageViews: number;
  jobViews: number;
  applyClicks: number;
  cvUploads: number;
  aiChecked: number;
  eligible: number;
  partial: number;
  notEligible: number;
  submitted: number;
};

export type CareerDashboard = {
  range: string;
  from: string | null;
  to: string;
  granularity: "daily" | "weekly" | "monthly";
  activeJobs: number;
  current: CareerCounts;
  /** % change against the previous period of the same length; null when it cannot be compared */
  trends: Record<keyof CareerCounts, number | null>;
  series: { label: string; pageViews: number; applyClicks: number; cvUploads: number }[];
  topLocations: { city: string; count: number }[];
  latestApplications: {
    id: string;
    applicationId: string;
    name: string;
    position: string;
    appliedOn: string;
    matchScore: number;
    result: "Eligible" | "Partial Match" | "Not Eligible";
    status: "Completed" | "Not Applied";
    source: string;
  }[];
};

export const CAREER_RANGES = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 3 months" },
  { value: "180d", label: "Last 6 months" },
  { value: "365d", label: "Last 12 months" },
  { value: "all", label: "All time" },
] as const;

export const careerDashboardApi = {
  get: (range: string, chart: string) => api.get<CareerDashboard>(`/careers/admin/dashboard?range=${range}&chart=${chart}&_=${Date.now()}`),
};
