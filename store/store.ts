import { configureStore } from "@reduxjs/toolkit";
import authReducer, { logout, setTokens as setTokensAction } from "./slices/authSlice";
import { setTokenRefreshHandlers } from "@/lib/api";
import { authSyncMiddleware, AUTH_STORAGE_KEY } from "./middleware/authSyncMiddleware";

export const store = configureStore({
  reducer: { auth: authReducer },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(authSyncMiddleware),
});

setTokenRefreshHandlers({
  onRefreshed: (tokens) => store.dispatch(setTokensAction(tokens)),
  onFailed: () => store.dispatch(logout()),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
export { AUTH_STORAGE_KEY };
