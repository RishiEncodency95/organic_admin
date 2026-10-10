import { Settings } from "./types";
import { api } from "./api";

const SETTINGS_KEY = "bharat_organic_admin_settings_v3";

// Used until the backend answers (and offline)
const defaultMockSettings: Settings = {
  _id: "",
  siteName: "Bharat Organic Expo 2027",
  helplineNumber: "+91 9654900525",
  supportEmail: "info@bharatorganicexpo.com",
  banners: [],
  socialLinks: [],
};

export const settingsApi = {
  get: async (): Promise<Settings> => {
    try {
      const res = await api.get<Partial<Settings> & { data?: Partial<Settings> }>("/settings?website=Organicexpo");
      const backendData = res?.data || res || {};
      if (backendData && Object.keys(backendData).length > 0) {
        if (typeof window !== "undefined") {
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(backendData));
        }
        return { ...defaultMockSettings, ...backendData };
      }
    } catch (e) {
      console.warn("Failed to fetch settings from backend API, using local storage:", e);
    }

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        try {
          return { ...defaultMockSettings, ...JSON.parse(stored) };
        } catch {
          // ignore error
        }
      }
    }
    return defaultMockSettings;
  },
  // No separate alerts endpoint yet: the defaults (no systemAlerts set)
  getSystemAlerts: async (): Promise<Settings> => defaultMockSettings,
  // Pages & CMS "Published" toggle. Patches only data.<configKey>.status on the server.
  setPageStatus: async (
    configKey: string,
    status: "Published" | "Draft",
    updatedBy?: string,
  ): Promise<Record<string, unknown>> => {
    const res = await api.patch<{ data?: Record<string, unknown> }>("/settings/page-status?website=Organicexpo", { configKey, status, updatedBy });
    const pageConfig = res?.data || {};
    // Keep the cached settings in sync: settingsApi.update() PUTs this whole object,
    // so a stale status here would silently revert the toggle on the next save elsewhere.
    if (typeof window !== "undefined") {
      try {
        const stored = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
        const { configKey: _key, ...fields } = pageConfig;
        stored[configKey] = { ...(stored[configKey] || {}), ...fields, status };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(stored));
      } catch {
        // ignore
      }
    }
    return pageConfig;
  },
  update: async (payload: Partial<Settings>): Promise<Settings> => {
    let current = defaultMockSettings;
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        try {
          current = { ...defaultMockSettings, ...JSON.parse(stored) };
        } catch {
          // ignore
        }
      }
    }
    const updated = { ...current, ...payload };

    const res = await api.put<Partial<Settings> & { data?: Partial<Settings> }>("/settings?website=Organicexpo", updated);
    const saved = { ...updated, ...(res?.data || res || {}) };
    if (typeof window !== "undefined") {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(saved));
    }
    return saved;
  },
};
