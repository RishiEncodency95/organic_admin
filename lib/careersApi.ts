import { api, getApiBaseUrl, getAccessToken, ApiRequestError } from "./api";

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

  reportingTo?: string;
  kras?: { label: string; result: string }[];
  kpis?: { label: string; measurement: string }[];
  referenceIndustries?: string[];
  screeningQuestions?: string[];

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

/** Downloads the job's formatted Word description document (generated server-side).
 * Uses a raw fetch — rather than the shared `api` JSON client — because the response
 * body is a binary file, not a {success,message,data} envelope, and a failure here
 * should surface the real server error rather than silently falling back to anything. */
async function downloadJobDocx(id: string, fallbackFilename: string): Promise<void> {
  const token = getAccessToken();
  const res = await fetch(`${getApiBaseUrl()}/careers/admin/jobs/${id}/export`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    let message = `Failed to generate document (status ${res.status})`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {
      // Response body wasn't JSON — keep the default message.
    }
    throw new ApiRequestError(res.status, message);
  }

  const disposition = res.headers.get("Content-Disposition") || "";
  const filename = disposition.match(/filename="([^"]+)"/)?.[1] || fallbackFilename;

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface GeneratedJobContent {
  opportunity: string;
  keyResponsibilities: string[];
  whoCanApply: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  targetIndustrySegments: string[];
  specificExperience: string;
  reportingTo: string;
  kras: { label: string; result: string }[];
  kpis: { label: string; measurement: string }[];
  referenceIndustries: string[];
  screeningQuestions: string[];
}

export const jobsApi = {
  list: () => api.get<JobPosting[]>("/careers/admin/jobs"),
  getById: (id: string) => api.get<JobPosting>(`/careers/admin/jobs/${id}`),
  create: (data: Partial<JobPosting>) => api.post<JobPosting>("/careers/admin/jobs", data),
  update: (id: string, data: Partial<JobPosting>) => api.patch<JobPosting>(`/careers/admin/jobs/${id}`, data),
  remove: (id: string) => api.delete<{ message: string }>(`/careers/admin/jobs/${id}`),
  downloadDocx: (id: string, jobTitle: string) => downloadJobDocx(id, `${jobTitle || "job-description"}.docx`),
  generateDescription: (data: {
    title: string;
    designation?: string;
    company?: string;
    projectEvent?: string;
    department: string;
    jobCode?: string;
    employmentType?: string;
    workplaceType?: string;
    totalOpenings?: number;
    location: string;
    experienceMin?: number;
    experienceMax?: number;
    educationRequirements?: string;
    ctcMin?: number;
    ctcMax?: number;
    salaryType?: string;
    performanceIncentiveApplicable?: boolean;
    incentiveType?: string;
  }) => api.post<GeneratedJobContent>("/careers/admin/jobs/generate-description", data),
};
