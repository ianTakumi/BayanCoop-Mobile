// slices/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  hasOnboarded: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  hasOnboarded: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    setOnboarded: (state) => {
      state.hasOnboarded = true;
    },
    restoreAuth: (
      state,
      action: PayloadAction<{
        user: User | null;
        token: string | null;
        hasOnboarded: boolean;
      }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = !!action.payload.token;
      state.hasOnboarded = action.payload.hasOnboarded;
    },
  },
});

export const { login, logout, setOnboarded, restoreAuth } = authSlice.actions;
export default authSlice.reducer;
