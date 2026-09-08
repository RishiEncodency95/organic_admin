import { configureStore, Middleware } from "@reduxjs/toolkit";
import authReducer, { logout, setCredentials, setTokens as setTokensAction, updateAdmin, AdminUser } from "./slices/authSlice";
import { setTokens, setTokenRefreshHandlers } from "@/lib/api";

const AUTH_STORAGE_KEY = "ms_admin_auth";

interface AuthStoreState {
  auth: { admin: AdminUser | null; accessToken: string | null; refreshToken: string | null };
}

/** Keeps lib/api.ts's token holder and localStorage in sync with the auth slice. Every branch
 * that changes admin/token state re-persists the full snapshot — missing one (as setTokensAction
 * used to) leaves a stale refresh token in localStorage that a page reload would resurrect,
 * reintroducing the exact "already-rotated token reused" false-theft-detection failure. */
const authSyncMiddleware: Middleware = (storeApi) => (next) => (action) => {
  const result = next(action);

  if (setCredentials.match(action)) {
    const { admin, accessToken, refreshToken } = action.payload;
    setTokens({ accessToken, refreshToken });
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ admin, accessToken, refreshToken }));
  }

  if (setTokensAction.match(action)) {
    setTokens(action.payload);
    const { admin } = (storeApi.getState() as AuthStoreState).auth;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ admin, ...action.payload }));
  }

  if (updateAdmin.match(action)) {
    const { admin, accessToken, refreshToken } = (storeApi.getState() as AuthStoreState).auth;
    if (admin) localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ admin, accessToken, refreshToken }));
  }

  if (logout.match(action)) {
    setTokens({ accessToken: null, refreshToken: null });
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  return result;
};

export function makeStore() {
  const store = configureStore({
    reducer: { auth: authReducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(authSyncMiddleware),
  });

  setTokenRefreshHandlers({
    onRefreshed: (tokens) => store.dispatch(setTokensAction(tokens)),
    onFailed: () => store.dispatch(logout()),
  });

  return store;
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
export { AUTH_STORAGE_KEY };
