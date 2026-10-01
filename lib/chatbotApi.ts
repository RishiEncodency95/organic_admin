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

export interface ChatSummary {
  _id: string;
  sessionId: string;
  lead?: ChatLead;
  pageUrl?: string;
  enquiryId?: string;
  whatsappSentAt?: string;
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
  totals: { chats: number; leads: number; questions: number; replies: number; whatsappSent: number; engaged: number };
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
};
