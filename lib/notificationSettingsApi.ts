import { api } from "./api";

/** Notification Settings (GET / PUT /admin/chats/routing) */
export type AssignmentRule = {
  ruleId: number;
  topic: string;
  team: string;
  type: "Assign in Rotation" | "Fixed Employee" | "Assign by Topic" | "Least Busy";
  /** Staff name; "" for none */
  backup: string;
  active: boolean;
  employees: string[];
  maxOpen: number;
  during: "Team Working Hours" | "Any Time" | "Custom Schedule";
  unavailable: "Use Next Available Employee" | "Assign to Backup Owner" | "Keep in Queue";
  noneAvailable: "Queue for Team Lead" | "Assign to Backup Owner" | "Notify Admin";
  keepOwner: boolean;
  noResponse: "Notify Team Lead" | "Notify Backup Owner" | "Do Nothing";
  reassign: boolean;
  delay: "Set delay" | "30 minutes" | "1 hour" | "2 hours" | "4 hours";
};

export type RoutingSettingsDoc = {
  rules: AssignmentRule[];
  unmatched: string;
  alerts?: unknown;
  updatedBy?: string;
  updatedAt?: string;
};

export type StaffCapacity = { name: string; active: boolean; open: number };

export const notificationSettingsApi = {
  get: () => api.get<{ settings: RoutingSettingsDoc | null; staff: StaffCapacity[] }>(`/admin/chats/routing?_=${Date.now()}`),
  save: (body: { rules: AssignmentRule[]; unmatched: string; alerts: unknown }) => api.put<RoutingSettingsDoc>("/admin/chats/routing", body),
};
