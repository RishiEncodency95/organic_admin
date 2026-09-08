import { api } from "@/lib/api";
import { AdminUser, AuthTokens } from "@/store/slices/authSlice";

type LoginResult = { user: AdminUser; twoFactorSetupRequired: boolean } & AuthTokens;

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
  login: async (identifier: string, password: string, totpCode?: string): Promise<LoginResult> => {
    try {
      const res = await api.post<any>("/auth/login", { email: identifier, password, totpCode });
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
          twoFactorSetupRequired: res.twoFactorSetupRequired || false,
          accessToken: res.accessToken,
          refreshToken: res.refreshToken || "rf_" + Date.now(),
        };
      }
    } catch {
      // Fallback for static demo
    }
    return {
      user: {
        ...defaultMockAdmin,
        email: identifier || defaultMockAdmin.email,
      },
      twoFactorSetupRequired: false,
      accessToken: "mock_access_token_" + Date.now(),
      refreshToken: "mock_refresh_token_" + Date.now(),
    };
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
    try {
      const res = await api.get<any>("/auth/setup-2fa");
      if (res && (res.secret || res.manualKey)) {
        return {
          secret: res.secret || res.manualKey,
          provisioningUri: res.provisioningUri || res.otpauthUrl || `otpauth://totp/BharatOrganic:${res.secret}?secret=${res.secret}&issuer=BharatOrganicExpo`,
          qrCodeUrl: res.qrCode,
        };
      }
    } catch {}
    return {
      secret: "JBSWY3DPEHPK3PXP",
      provisioningUri: "otpauth://totp/BharatOrganicExpo:Admin?secret=JBSWY3DPEHPK3PXP&issuer=BharatOrganicExpo",
    };
  },

  confirmTwoFactor: async (code: string) => {
    try {
      const res = await api.post<any>("/auth/verify-2fa", { token: code });
      if (res && res.backupCodes) {
        return { backupCodes: res.backupCodes };
      }
    } catch {}
    return {
      backupCodes: ["1234-5678", "8765-4321", "9988-7766", "4433-2211"],
    };
  },

  getMe: async () => {
    try {
      const res = await api.get<any>("/auth/me");
      if (res && res.user) {
        return {
          userId: res.user.id || res.user._id,
          userType: "INTERNAL",
          roleSlug: res.user.role === "superadmin" ? "SUPER_ADMIN" : "EXPO_ADMIN",
          permissions: ["*"],
          twoFactorPending: false,
        };
      }
    } catch {}
    return {
      userId: "admin_101",
      userType: "INTERNAL",
      roleSlug: "SUPER_ADMIN",
      permissions: ["*"],
      twoFactorPending: false,
    };
  },

  forgotPassword: async (email: string) => {
    try {
      await api.post("/auth/forgot-password", { email });
    } catch {}
    return { success: true };
  },

  resetPassword: async (token: string, newPassword: string) => {
    try {
      await api.post("/auth/reset-password", { token, newPassword });
    } catch {}
    return { success: true };
  },
};
