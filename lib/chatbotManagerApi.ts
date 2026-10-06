import { api } from "./api";

/*
 * Chatbot Manager (admin) — draft / publish of the manager's sections, knowledge sources,
 * real AI test replies and the review queue. See organic_backend/src/modules/chatbot.
 */

export type ManagerSection = "buttons" | "answers" | "forms" | "rules" | "settings";

export interface ManagerVersion {
  minor: number;
  note: string;
  by: string;
  date: string;
}

export interface ManagerData {
  /** Saved sections, each as the tab's own JSON (missing = never saved, the tab keeps its defaults) */
  draft: Partial<Record<ManagerSection, unknown>>;
  /** Draft differs from what is live on the website */
  pending: boolean;
  versions: ManagerVersion[];
  /** Unpublished edits per area (shown in the Publish popup) */
  changes: { buttons: number; answers: number; sources: number; forms: number; settings: number };
  ai: { configured: boolean; model: string };
}

export interface KnowledgeSourceRow {
  _id: string;
  name: string;
  kind: "web" | "pdf" | "manual";
  url?: string;
  includeLinked?: boolean;
  frequency?: string;
  topic: string;
  owner?: string;
  status: "Published" | "Update pending" | "Draft";
  error?: string;
  checkedAt?: string;
  chars: number;
  pendingChars?: number;
  preview: string;
}

export interface ReviewQueueItem {
  key: string;
  question: string;
  asked: number;
  visitorMessage: string;
  botReply: string;
  lastAskedAt: string;
}

export type NewKnowledgeSource =
  | { kind: "web"; name: string; url: string; includeLinked: boolean; frequency: string; topic: string; owner: string }
  | { kind: "pdf"; name: string; file: File; topic: string; owner: string }
  | {
      kind: "manual";
      name: string;
      topic: string;
      owner: string;
      text?: string;
      question?: string;
      answerEn?: string;
      answerHi?: string;
      phrases?: string[];
    };

// AI replies, page fetches and document parsing can take longer than the default 10 s
const SLOW = { timeoutMs: 90_000 };

export const chatbotManagerApi = {
  get: () => api.get<ManagerData>("/admin/chatbot/manager"),
  saveDraft: (section: ManagerSection, data: unknown) => api.put<{ pending: boolean }>("/admin/chatbot/manager/draft", { section, data }),
  restore: (minor: number) => api.post<{ draft: ManagerData["draft"]; pending: boolean }>("/admin/chatbot/manager/restore", { minor }),
  publish: (note: string) => api.post<{ versions: ManagerVersion[]; pending: boolean }>("/admin/chatbot/manager/publish", { note }, SLOW),

  sources: () => api.get<KnowledgeSourceRow[]>("/admin/chatbot/sources"),
  addSource: (src: NewKnowledgeSource) => {
    if (src.kind === "pdf") {
      const form = new FormData();
      form.append("kind", "pdf");
      form.append("name", src.name);
      form.append("topic", src.topic);
      form.append("owner", src.owner);
      form.append("file", src.file);
      return api.postForm<KnowledgeSourceRow>("/admin/chatbot/sources", form, SLOW);
    }
    return api.post<KnowledgeSourceRow>("/admin/chatbot/sources", src, SLOW);
  },
  checkSources: () => api.post<{ changed: number; sources: KnowledgeSourceRow[] }>("/admin/chatbot/sources/check", {}, SLOW),
  refreshSource: (id: string) => api.post<{ changed: boolean; source: KnowledgeSourceRow }>(`/admin/chatbot/sources/${id}/refresh`, {}, SLOW),
  updateSource: (id: string, patch: { action?: "approve" | "keep"; name?: string; topic?: string; owner?: string }) =>
    api.patch<KnowledgeSourceRow>(`/admin/chatbot/sources/${id}`, patch),
  deleteSource: (id: string) => api.delete<null>(`/admin/chatbot/sources/${id}`),

  /** One real reply from the bot. `draft` = with unpublished changes, `live` = what the website uses */
  test: (body: { question: string; language?: string; mode: "draft" | "live"; history?: { role: "user" | "assistant"; content: string }[] }) =>
    api.post<{ text: string; found: boolean }>("/admin/chatbot/test", body, SLOW),

  review: () => api.get<ReviewQueueItem[]>("/admin/chatbot/review"),
  dismissReview: (key: string, undo = false) => api.post<null>("/admin/chatbot/review/dismiss", { key, undo }),
};
