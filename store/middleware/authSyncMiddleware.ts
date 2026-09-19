import { Middleware } from "@reduxjs/toolkit";
import { setCredentials, setTokens as setTokensAction, updateAdmin, logout, AdminUser } from "../slices/authSlice";
import { setTokens } from "@/lib/api";

export const AUTH_STORAGE_KEY = "ms_admin_auth";

export interface AuthStoreState {
  auth: { admin: AdminUser | null; accessToken: string | null; refreshToken: string | null };
}

/** 
 * Keeps lib/api.ts's token holder and localStorage in sync with the auth slice. 
 * Every branch that changes admin/token state re-persists the full snapshot.
 */
export const authSyncMiddleware: Middleware = (storeApi) => (next) => (action) => {
  const result = next(action);

  if (setCredentials.match(action)) {
    const { admin, accessToken, refreshToken } = action.payload;
    setTokens({ accessToken, refreshToken });
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ admin, accessToken, refreshToken }));
    if (typeof document !== "undefined" && accessToken) {
      document.cookie = `ms_admin_token=${encodeURIComponent(accessToken)}; path=/; max-age=604800; SameSite=Lax`;
    }
  }

  if (setTokensAction.match(action)) {
    setTokens(action.payload);
    const { admin } = (storeApi.getState() as AuthStoreState).auth;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ admin, ...action.payload }));
    if (typeof document !== "undefined" && action.payload.accessToken) {
      document.cookie = `ms_admin_token=${encodeURIComponent(action.payload.accessToken)}; path=/; max-age=604800; SameSite=Lax`;
    }
  }

  if (updateAdmin.match(action)) {
    const { admin, accessToken, refreshToken } = (storeApi.getState() as AuthStoreState).auth;
    if (admin) localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ admin, accessToken, refreshToken }));
  }

  if (logout.match(action)) {
    setTokens({ accessToken: null, refreshToken: null });
    localStorage.removeItem(AUTH_STORAGE_KEY);
    if (typeof document !== "undefined") {
      document.cookie = "ms_admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    }
  }

  return result;
};
