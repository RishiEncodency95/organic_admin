import { api } from "./api";

export interface ChatLead {
  name?: string;
  email?: string;
  phone?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface ChatRequest {
  type: "stall-quotation" | "sales-callback";
  stallSize?: string;
  company?: string;
  preferredTime?: string;
  createdAt?: string;
}

export type InboxStatus = "New" | "In Progress" | "Follow-up" | "Assigned" | "Waiting for Visitor" | "Resolved";
export type InboxPriority = "High" | "Medium" | "Low";
export type InboxCategory = "lead" | "enquiry" | "support" | "feedback" | "complaint";
export type InboxActivity = { kind: "reply" | "note" | "event"; text: string; by?: string; at?: string };

/** The team's follow-up on a chat (Inbox & Leads) */
export interface ChatWorkflow {
  assignedTo?: string;
  team?: string;
  status?: InboxStatus;
  priority?: InboxPriority;
  followUpKind?: "date" | "review" | "assign" | "none";
  followUpAt?: string;
  resolvedAt?: string;
  spam?: boolean;
  seenAt?: string;
  updatedAt?: string;
  updatedBy?: string;
  activity?: InboxActivity[];
}

/** Saved inbox state for one record; fields left out are not changed */
export type WorkflowUpdate = Partial<Omit<ChatWorkflow, "updatedAt" | "updatedBy">> & { id: string };

export interface NewManualEnquiry {
  name: string;
  mobile?: string;
  email?: string;
  category: InboxCategory;
  type: string;
  topic: string;
  detail: string;
  priority: InboxPriority;
  assignedTo: string;
  team?: string;
  source: string;
  followUpAt?: string;
}

export interface ChatSummary {
  _id: string;
  sessionId: string;
  lead?: ChatLead;
  /** "Visitor 103.x.x.x" — the chat's name until the mobile number is verified */
  visitorName?: string;
  visitor?: { ip?: string; userAgent?: string };
  /** When the mobile number in `lead` was verified with the WhatsApp OTP */
  phoneVerifiedAt?: string;
  feedback?: "yes" | "no";
  requests?: ChatRequest[];
  pageUrl?: string;
  enquiryId?: string;
  whatsappSentAt?: string;
  /** "manual" = added by hand in Inbox & Leads (only listed with source "all") */
  source?: "chat" | "manual";
  manual?: { channel?: string; category?: InboxCategory; type?: string; topic?: string; detail?: string };
  workflow?: ChatWorkflow;
  /** A Book a Stand registration made with this lead's mobile number ("confirmed" once paid) */
  booking?: { status: string; paid: boolean };
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  questionCount: number;
  firstQuestion?: ChatMessage;
  lastMessage?: ChatMessage;
}

export interface ChatDetail extends Omit<ChatSummary, "messageCount" | "questionCount" | "firstQuestion" | "lastMessage"> {
  messages: ChatMessage[];
}

export interface ChatListResponse {
  chats: ChatSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ChatStats {
  totals: {
    chats: number;
    leads: number;
    questions: number;
    replies: number;
    whatsappSent: number;
    engaged: number;
    verifiedLeads: number;
    handovers: number;
    feedbackYes: number;
    feedbackNo: number;
    unanswered: number;
    returningVisitors: number;
  };
  popularQuestions: { question: string; count: number }[];
  /** Current team queue (all records, not just the date range) */
  followUp: { unassigned: number; overdue: number; dueToday: number; openComplaints: number };
  /** When the chatbot content was last published */
  contentUpdatedAt: string | null;
  daily: { date: string; chats: number; questions: number }[];
  topPages: { pageUrl: string; chats: number }[];
  latestQuestions: { _id: string; chatId: string; name?: string; content: string; createdAt: string }[];
}

export interface ChatQuery {
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  limit?: number;
  /** "all" also returns enquiries added by hand in Inbox & Leads */
  source?: "all";
}

const toQuery = (q: ChatQuery) => {
  const params = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (v !== undefined && v !== "") params.set(k, String(v));
  });
  const s = params.toString();
  return s ? `?${s}` : "";
};

export const chatbotApi = {
  list: (q: ChatQuery = {}) => api.get<ChatListResponse>(`/admin/chats${toQuery(q)}`),
  stats: (q: Pick<ChatQuery, "from" | "to"> = {}) => api.get<ChatStats>(`/admin/chats/stats${toQuery(q)}`),
  get: (id: string) => api.get<ChatDetail>(`/admin/chats/${id}`),
  saveWorkflow: (items: WorkflowUpdate[]) => api.put<{ matched: number; modified: number }>("/admin/chats/workflow", { items }),
  createManual: (enquiry: NewManualEnquiry) => api.post<{ id: string; createdAt: string }>("/admin/chats/manual", enquiry),
};
