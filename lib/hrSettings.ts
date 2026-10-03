import { api } from "@/lib/api";

// Career Settings → HR & Workflow (backend: /careers/admin/hr-settings).
export type RecipientType = "to" | "cc" | "bcc";

export interface HrRecipient {
  id?: string;
  name: string;
  designation: string;
  email: string;
  type: RecipientType;
  active: boolean;
}

export interface HrSettings {
  recipients: HrRecipient[];
  manualForward: boolean;
  notifyHr: boolean;
  updatedAt?: string;
}

export const RECIPIENT_TYPE_LABEL: Record<RecipientType, string> = { to: "To", cc: "CC", bcc: "BCC" };

export const loadHrSettings = () => api.get<HrSettings>(`/careers/admin/hr-settings?_=${Date.now()}`);
export const saveHrSettings = (settings: HrSettings) => api.put<HrSettings>("/careers/admin/hr-settings", settings);
