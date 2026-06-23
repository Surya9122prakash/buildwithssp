import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
  id: string;
  name: string;
  email: string;
  role: "client" | "owner";
  mobile?: string | null;
  gender?: string | null;
  dob?: string | null;
  profileImage?: string | null;
  bio?: string | null;
}

export interface SessionSettingsState {
  idleTimeout: number; // in seconds
  warningDuration: number; // in seconds
  absoluteTimeout: number; // in seconds
}

interface AuthState {
  user: UserState | null;
  settings: SessionSettingsState | null;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  settings: null,
  loading: true, // Default to true so we wait for server verification on mount
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ user: UserState; settings: SessionSettingsState }>) => {
      state.user = action.payload.user;
      state.settings = action.payload.settings;
      state.loading = false;
    },
    clearUser: (state) => {
      state.user = null;
      state.settings = null;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    updateClientSettings: (state, action: PayloadAction<SessionSettingsState>) => {
      state.settings = action.payload;
    },
    updateUserProfile: (state, action: PayloadAction<Partial<UserState>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { setUser, clearUser, setLoading, updateClientSettings, updateUserProfile } = authSlice.actions;
export default authSlice.reducer;
