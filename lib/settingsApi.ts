import { Settings } from "./types";
import { api } from "./api";

const SETTINGS_KEY = "bharat_organic_admin_settings_v3";

const defaultMockSettings: Settings = {
  websiteName: "Bharat Organic Expo 2027",
  fullPaymentDiscount: 5,
  currency: "INR",
  contactEmail: "info@bharatorganicexpo.com",
  contactPhone: "+91 9654900525"
} as any;

export const settingsApi = {
  get: async (): Promise<Settings> => {
    try {
      const res: any = await api.get("/settings?website=Organicexpo");
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
  getSystemAlerts: async (): Promise<any> => ({ alerts: [] }),
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

    try {
      const res: any = await api.put("/settings?website=Organicexpo", updated);
      const saved = res?.data || res || updated;
      if (typeof window !== "undefined") {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(saved));
      }
      return saved;
    } catch (e) {
      console.warn("Failed to sync settings to backend API, falling back to local storage:", e);
      if (typeof window !== "undefined") {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      }
      return updated;
    }
  },
};
