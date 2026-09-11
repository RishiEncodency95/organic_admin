import { Settings } from "./types";

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
      const updated = { ...current, ...payload };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      return updated;
    }
    return { ...defaultMockSettings, ...payload };
  },
};
