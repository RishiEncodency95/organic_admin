import { api } from "./api";

/** Mirrors backend/src/modules/seoAudit/auditTasks.service.ts */

export type TaskStatus = "open" | "in_progress" | "done";

export interface AuditTask {
  checkId: number;
  title: string;
  type: "ERROR" | "WARNING" | "NOTICE";
  priority: "high" | "medium" | "low";
  section: string;
  owner: "developer" | "seo";
  ownerReason: string | null;
  what: string;
  why: string;
  fix: string;
  where: string;
  scope: "page" | "site";
  sitewide: boolean;
  affectedPages: string[];
  affectedTotal: number;
  pagesChecked: number;
  evidence: string[];
  source: "ours" | "uploaded_only";
  inUploadedReport: boolean;
  status: TaskStatus;
  note: string | null;
  updatedAt: string | null;
}

export interface FixedItem {
  checkId: number;
  title: string;
  section: string;
  owner: "developer" | "seo";
  reason: string;
}

export interface AuditTaskList {
  generatedFrom: { auditRunAt: string | null; pagesCrawled: number; uploadedReport: string | null };
  tasks: AuditTask[];
  fixed: FixedItem[];
}

export const auditTasksApi = {
  /** The task list from the latest audit; null when no audit has run yet. */
  list: async (): Promise<AuditTaskList | null> => {
    const data = await api.get<AuditTaskList | null>("/seo-audit/tasks", { forceFresh: true });
    return data && Array.isArray(data.tasks) ? data : null;
  },
  setStatus: (checkId: number, status: TaskStatus, note?: string) => api.patch<AuditTaskList>(`/seo-audit/tasks/${checkId}`, { status, note }),
};
