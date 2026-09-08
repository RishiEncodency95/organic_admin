import { Settings } from "./types";

const defaultMockSettings: Settings = {
  websiteName: "Bharat Organic Expo 2027",
  fullPaymentDiscount: 5,
  currency: "INR",
  contactEmail: "info@bharatorganicexpo.com",
  contactPhone: "+91 9654900525"
} as any;

export const settingsApi = {
  get: async (): Promise<Settings> => defaultMockSettings,
  getSystemAlerts: async (): Promise<any> => ({ alerts: [] }),
  update: async (payload: Partial<Settings>): Promise<Settings> => ({ ...defaultMockSettings, ...payload }),
};
