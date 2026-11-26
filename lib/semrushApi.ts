import { api } from "./api";

/** Mirrors backend/src/modules/seoAudit/semrushCompare.service.ts */

export type SemrushIssueType = "ERROR" | "WARNING" | "NOTICE";
export type TaskOwner = "developer" | "seo";
export type TaskStatus = "open" | "in_progress" | "done";
export type OursStatus = "found" | "clean" | "not_checked" | "not_measured" | "no_audit";
export type Verdict = "both" | "semrush_only" | "not_checked" | "ours_only" | "clean";
export type UrlOurs = "flagged" | "clean" | "not_crawled" | "n/a";

export interface ComparedUrl {
  url: string;
  count: number;
  ours: UrlOurs;
  evidence: string[];
}

export interface ComparedCheck {
  id: number;
  name: string;
  type: SemrushIssueType;
  owner: TaskOwner;
  ownerReason: string | null;
  fix: string;
  plain: string;
  why: string;
  section: string;
  where: string;
  semrush: {
    failed: number;
    total: number;
    changed: number;
    pageShare: number | null;
    sitewide: boolean;
    urls: ComparedUrl[];
    urlsTruncated: boolean;
  };
  ours: { status: OursStatus; found: number; total: number; note: string | null; urls: string[] };
  verdict: Verdict;
}

export interface SemrushComparison {
  importId: string;
  uploadedAt: string;
  issuesFileName: string | null;
  pagesFileName: string | null;
  semrush: { checks: number; failing: number; errors: number; warnings: number; notices: number; pages: number | null };
  ours: {
    available: boolean;
    runAt: string | null;
    pagesCrawled: number;
    checksCovered: number;
    semrushPagesNotCrawled: number | null;
  };
  counts: Record<Verdict, number>;
  checks: ComparedCheck[];
}

export interface LiveState {
  state: "fixed" | "still" | "partly" | "unverified";
  stillPages: number;
  fixedPages: number;
  note: string;
}

export interface FixTask {
  issueId: number;
  title: string;
  owner: TaskOwner;
  ownerReason: string | null;
  priority: "high" | "medium" | "low";
  whatToDo: string;
  affectedPages: number;
  urls: string[];
  foundBy: Array<"semrush" | "our_audit">;
  semrushType: SemrushIssueType;
  live: LiveState;
  status: TaskStatus;
  note: string | null;
  updatedAt: string | null;
}

export interface SemrushPayload {
  comparison: SemrushComparison;
  tasks: FixTask[];
}

export const semrushApi = {
  /** The comparison and tasks for the newest upload; null when nothing was uploaded yet. */
  latest: async (): Promise<SemrushPayload | null> => {
    const data = await api.get<SemrushPayload | null>("/seo-audit/semrush", { forceFresh: true });
    return data && data.comparison ? data : null;
  },
  upload: (files: { issuesCsv: string; issuesFileName: string; pagesCsv?: string; pagesFileName?: string }) =>
    api.post<SemrushPayload>("/seo-audit/semrush", files, { timeoutMs: 60_000 }),
  setTask: (issueId: number, status: TaskStatus, note?: string) =>
    api.patch<SemrushPayload>(`/seo-audit/semrush/tasks/${issueId}`, { status, note }),
};
