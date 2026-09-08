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
  login: async (identifier: string, password: string, totpCode?: string): Promise<LoginResult> => ({
    user: {
      ...defaultMockAdmin,
      email: identifier || defaultMockAdmin.email,
    },
    twoFactorSetupRequired: false,
    accessToken: "mock_access_token_" + Date.now(),
    refreshToken: "mock_refresh_token_" + Date.now(),
  }),
  logout: async (refreshToken: string) => undefined,
  changePassword: async (currentPassword: string, newPassword: string) => ({ success: true }),
  setupTwoFactor: async () => ({
    secret: "JBSWY3DPEHPK3PXP",
    provisioningUri: "otpauth://totp/OrganicAdmin:admin?secret=JBSWY3DPEHPK3PXP&issuer=OrganicAdmin",
  }),
  confirmTwoFactor: async (code: string) => ({
    backupCodes: ["1234-5678", "8765-4321"],
  }),
  getMe: async () => ({
    userId: "admin_101",
    userType: "INTERNAL",
    roleSlug: "SUPER_ADMIN",
    permissions: ["*"],
    twoFactorPending: false,
  }),
  forgotPassword: async (email: string) => ({ success: true }),
  resetPassword: async (token: string, newPassword: string) => ({ success: true }),
};
