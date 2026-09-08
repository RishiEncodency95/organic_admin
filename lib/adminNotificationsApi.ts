import { api } from "./api";

export type AdminNotificationType = "DONATION" | "ENQUIRY" | "CASE" | "VOLUNTEER" | "SYSTEM_EXPIRY";

export interface AdminNotificationItem {
  _id: string;
  type: AdminNotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AdminNotificationsResult {
  notifications: AdminNotificationItem[];
  unreadCount: number;
}

export const adminNotificationsApi = {
  list: () => api.get<AdminNotificationsResult>("/notifications/admin"),
  markRead: (id: string) => api.patch(`/notifications/admin/${id}/read`),
  markAllRead: () => api.patch("/notifications/admin/read-all"),
};
