import { api } from "./api";
import { Settings } from "./types";

export const settingsApi = {
  get: () => api.get<Settings>("/settings"),
  getSystemAlerts: () => api.get<Settings>("/settings/system-alerts"),
  update: (payload: Partial<Settings>) => api.put<Settings>("/settings/admin", payload),
};
