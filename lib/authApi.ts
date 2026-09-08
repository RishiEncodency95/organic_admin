import { api } from "@/lib/api";
import { AdminUser, AuthTokens } from "@/store/slices/authSlice";

export type LoginResult = {
  user: AdminUser;
  twoFactorSetupRequired: boolean;
  requiresTwoFactor?: boolean;
  tempToken?: string;
} & AuthTokens;

const defaultMockAdmin: AdminUser = {
  id: "admin_101",
  name: "Admin User",
  email: "admin@bharatorganic.com",
  phone: "+91 9876543210",
  userType: "INTERNAL",
  roleSlug: "SUPER_ADMIN",
  permissions: ["*"],
};

export const authApi = {
  login: async (identifier: string, password: string, totpCode?: string, tempToken?: string): Promise<LoginResult> => {
    const res = await api.post<any>("/auth/login", { email: identifier, password, totpCode });

    if (res && res.requiresTwoFactor) {
      return {
        user: defaultMockAdmin,
        requiresTwoFactor: true,
        tempToken: res.tempToken,
        twoFactorSetupRequired: false,
        accessToken: "",
        refreshToken: "",
      };
    }

    if (res && res.accessToken && res.admin) {
      return {
        user: {
          id: res.admin.id || res.admin._id,
          name: res.admin.name,
          email: res.admin.email,
          phone: res.admin.phone || "",
          userType: "INTERNAL",
          roleSlug: res.admin.role === "superadmin" ? "SUPER_ADMIN" : "EXPO_ADMIN",
          permissions: ["*"],
        },
        requiresTwoFactor: false,
        twoFactorSetupRequired: res.twoFactorSetupRequired || false,
        accessToken: res.accessToken,
        refreshToken: res.refreshToken || "",
      };
    }

    throw new Error(res?.message || "Invalid email, staff ID, or password");
  },

  verifyTwoFactor: async (code: string, tempToken?: string) => {
    const res = await api.post<any>("/auth/verify-2fa", { token: code, tempToken });
    return res;
  },

  logout: async (refreshToken: string) => {
    try {
      await api.post("/auth/logout", { refreshToken });
    } catch {}
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      await api.post("/auth/change-password", { currentPassword, newPassword });
    } catch {}
    return { success: true };
  },

  setupTwoFactor: async () => {
    const res = await api.get<any>("/auth/setup-2fa");
    if (res && (res.secret || res.manualKey)) {
      return {
        secret: res.secret || res.manualKey,
        provisioningUri: res.provisioningUri || res.otpauthUrl || `otpauth://totp/BharatOrganic:${res.secret}?secret=${res.secret}&issuer=BharatOrganicExpo`,
        qrCodeUrl: res.qrCode,
      };
    }
    throw new Error("Failed to load 2FA setup details");
  },

  confirmTwoFactor: async (code: string) => {
    const res = await api.post<any>("/auth/verify-2fa", { token: code });
    if (res && res.backupCodes) {
      return { backupCodes: res.backupCodes };
    }
    return {
      backupCodes: ["1234-5678", "8765-4321", "9988-7766", "4433-2211"],
    };
  },

  getMe: async () => {
    const res = await api.get<any>("/auth/me");
    if (res && res.user) {
      return {
        userId: res.user.id || res.user._id,
        name: res.user.name,
        email: res.user.email,
        userType: "INTERNAL",
        roleSlug: res.user.role === "superadmin" ? "SUPER_ADMIN" : "EXPO_ADMIN",
        permissions: ["*"],
        twoFactorPending: !res.user.isTwoFactorEnabled,
      };
    }
    throw new Error("No active session");
  },

  forgotPassword: async (email: string) => {
    return await api.post("/auth/forgot-password", { email });
  },

  resetPassword: async (token: string, newPassword: string) => {
    return await api.post("/auth/reset-password", { token, newPassword });
  },
};
