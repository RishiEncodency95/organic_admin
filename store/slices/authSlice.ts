import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AdminUser {
  id: string;
  name: string;
  email?: string;
  phone: string;
  avatarUrl?: string;
  userType: "INTERNAL" | "VOLUNTEER" | "DONOR";
  // Resolved at login time for UI purposes only — every actual API call is re-authorized fresh
  // server-side (PRD §3.2 "fail closed"), so a stale permission here can never grant real access.
  roleSlug?: string;
  permissions: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  admin: AdminUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  hydrated: boolean;
}

const initialState: AuthState = {
  admin: null,
  accessToken: null,
  refreshToken: null,
  hydrated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ admin: AdminUser } & AuthTokens>) => {
      state.admin = action.payload.admin;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    setTokens: (state, action: PayloadAction<AuthTokens>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    // Patches the logged-in admin's own display fields after a self-edit (e.g. via the Staff
    // page) — without this, name/email changes wouldn't show in the Topbar/dashboard until the
    // next login, since `admin` here is only ever set once at login/hydration.
    updateAdmin: (state, action: PayloadAction<Partial<AdminUser>>) => {
      if (state.admin) state.admin = { ...state.admin, ...action.payload };
    },
    hydrate: (state, action: PayloadAction<Omit<AuthState, "hydrated"> | null>) => {
      if (action.payload) {
        state.admin = action.payload.admin;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      }
      state.hydrated = true;
    },
    logout: (state) => {
      state.admin = null;
      state.accessToken = null;
      state.refreshToken = null;
    },
  },
});

export const { setCredentials, setTokens, updateAdmin, hydrate, logout } = authSlice.actions;
export default authSlice.reducer;
