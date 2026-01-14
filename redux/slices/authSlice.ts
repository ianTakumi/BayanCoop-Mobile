import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  access_token: string | null;
  isAuthenticated: boolean;
  hasOnboarded: boolean;
  refresh_token: string | null;
}

const initialState: AuthState = {
  user: null,
  access_token: null,
  isAuthenticated: false,
  hasOnboarded: false,
  refresh_token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{
        user: User;
        access_token: string;
        refresh_token: string;
      }>
    ) => {
      state.user = action.payload.user;
      state.access_token = action.payload.access_token;
      state.refresh_token = action.payload.refresh_token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.access_token = null;
      state.isAuthenticated = false;
      state.refresh_token = null;
    },
    setOnboarded: (state) => {
      state.hasOnboarded = true;
    },
    restoreAuth: (
      state,
      action: PayloadAction<{
        user: User | null;
        access_token: string | null;
        refresh_token: string | null;
        hasOnboarded: boolean;
      }>
    ) => {
      state.user = action.payload.user;
      state.refresh_token = action.payload.refresh_token;
      state.isAuthenticated = !!action.payload.access_token;
      state.hasOnboarded = action.payload.hasOnboarded;
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload,
        };
      }
    },
    refreshSession: (
      // FIX 2: Properly typed and fixed syntax
      state,
      action: PayloadAction<{
        access_token: string;
        refresh_token?: string;
      }>
    ) => {
      state.access_token = action.payload.access_token;
      if (action.payload.refresh_token) {
        state.refresh_token = action.payload.refresh_token;
      }
    },
  },
});

export const {
  login,
  logout,
  setOnboarded,
  restoreAuth,
  updateProfile,
  refreshSession,
} = authSlice.actions;
export default authSlice.reducer;
