import { api } from "./api";

export type BackendJobStatus = "DRAFT" | "OPEN" | "CLOSED";
export type AdminJobStatus = "Draft" | "Active" | "Closed";

export const toBackendStatus = (status: AdminJobStatus): BackendJobStatus =>
  status === "Active" ? "OPEN" : status === "Draft" ? "DRAFT" : "CLOSED";

export const toAdminStatus = (status: BackendJobStatus): AdminJobStatus =>
  status === "OPEN" ? "Active" : status === "DRAFT" ? "Draft" : "Closed";

export interface JobPosting {
  _id: string;
  title: string;
  slug: string;
  designation?: string;
  company?: string;
  projectEvent?: string;
  department: string;
  jobCode?: string;
  location: string;
  employmentType: string;
  workplaceType?: string;
  totalOpenings: number;
  experienceMin: number;
  experienceMax: number;
  educationRequirements?: string;

  ctcMin?: number;
  ctcMax?: number;
  salaryType?: string;
  performanceIncentiveApplicable?: boolean;
  incentiveType?: string;
  salary?: string;

  description?: string;
  aboutCompany?: string;
  roleObjective?: string;
  skills: string[];
  preferredSkills?: string[];
  targetIndustrySegments?: string[];
  specificExperience?: string;
  responsibilities: string[];
  requirements: string[];
  preferredQualifications?: string[];

  acceptOnlineApplications?: boolean;
  aiCvScreening?: boolean;
  cvUploadMandatory?: boolean;
  candidatePhotoMandatory?: boolean;
  allowFresherCandidates?: boolean;
  allowCurrentlyNotEmployed?: boolean;
  allowCvReplacement?: boolean;
  eligibilityThreshold?: number;
  partialMatchMin?: number;
  partialMatchMax?: number;
  showMatchScoreToCandidate?: boolean;
  showMatchBreakdown?: boolean;

  featuredJob?: boolean;
  applicationOpenDate?: string;
  applicationClosingDate?: string;
  tags?: string[];

  views: number;
  applicationsCount?: number;

  status: BackendJobStatus;
  publishedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const jobsApi = {
  list: () => api.get<JobPosting[]>("/careers/admin/jobs"),
  getById: (id: string) => api.get<JobPosting>(`/careers/admin/jobs/${id}`),
  create: (data: Partial<JobPosting>) => api.post<JobPosting>("/careers/admin/jobs", data),
  update: (id: string, data: Partial<JobPosting>) => api.patch<JobPosting>(`/careers/admin/jobs/${id}`, data),
  remove: (id: string) => api.delete<{ message: string }>(`/careers/admin/jobs/${id}`),
};
