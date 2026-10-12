import { api } from "./api";

export type BlogReportStatus = "published" | "hidden";

export interface BlogReport {
  _id: string;
  title: string;
  description: string;
  /** "/api/files/pdf?url=…" as the upload returns it */
  fileUrl: string;
  fileName: string;
  /** Bytes */
  fileSize: number;
  downloads: number;
  status: BlogReportStatus;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type BlogReportInput = Pick<BlogReport, "title" | "description" | "fileUrl" | "fileName" | "fileSize" | "status" | "order">;

/** Same limits as the backend (blogReport.service.ts) */
export const BLOG_REPORT_LIMITS = { title: 100, description: 200, maxFileMB: 25 } as const;

/** 2621440 → "2.5 MB", 972800 → "950 KB" */
export const formatFileSize = (bytes: number) =>
  !bytes ? "—" : bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, "")} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const BASE = "/blog-reports";

export const blogReportsApi = {
  // Cache-busting query keeps the list fresh after a change
  list: () => api.get<BlogReport[]>(`${BASE}/admin?_=${Date.now()}`).then((res) => res ?? []),
  create: (data: BlogReportInput) => api.post<BlogReport>(BASE, data),
  update: (id: string, data: Partial<BlogReportInput>) => api.patch<BlogReport>(`${BASE}/${id}`, data),
  remove: (id: string) => api.delete<{ deleted: boolean }>(`${BASE}/${id}`),
};
