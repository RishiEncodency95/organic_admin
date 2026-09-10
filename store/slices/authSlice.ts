import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { authApi } from "@/lib/authApi";

export interface AdminUser {
  id: string;
  name: string;
  email?: string;
  phone: string;
  avatarUrl?: string;
  userType: "INTERNAL" | "VOLUNTEER" | "DONOR";
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
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  admin: null,
  accessToken: null,
  refreshToken: null,
  hydrated: false,
  loading: false,
  error: null,
};

// Async Thunks
export const loginAdmin = createAsyncThunk(
  "auth/loginAdmin",
  async ({ email, password, totpCode }: { email: string; password: string; totpCode?: string }, { rejectWithValue }) => {
    try {
      const result = await authApi.login(email, password, totpCode);
      return result;
    } catch (err: any) {
      return rejectWithValue(err);
    }
  }
);

export const verifyTwoFactor = createAsyncThunk(
  "auth/verifyTwoFactor",
  async ({ totpCode, tempToken }: { totpCode: string; tempToken: string }, { rejectWithValue }) => {
    try {
      const result = await authApi.verifyTwoFactor(totpCode, tempToken);
      return result;
    } catch (err: any) {
      return rejectWithValue(err);
    }
  }
);

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
    updateAdmin: (state, action: PayloadAction<Partial<AdminUser>>) => {
      if (state.admin) state.admin = { ...state.admin, ...action.payload };
    },
    hydrate: (state, action: PayloadAction<Omit<AuthState, "hydrated" | "loading" | "error"> | null>) => {
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
  extraReducers: (builder) => {
    builder
      // loginAdmin cases
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state) => {
        state.loading = false;
        // We do not set admin state here automatically because the UI might need to handle 2FA branching.
        // It relies on dispatching setCredentials from the component after unwrapping.
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || action.error.message || "Failed to login";
      })
      // verifyTwoFactor cases
      .addCase(verifyTwoFactor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyTwoFactor.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(verifyTwoFactor.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || action.error.message || "Failed to verify 2FA";
      });
  }
});

export const { setCredentials, setTokens, updateAdmin, hydrate, logout } = authSlice.actions;
export default authSlice.reducer;
