import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Cooperative {
  id: string;
  user_id: string;
  name: string;
  address: string;
  barangay: string;
  city: string;
  province: string;
  region: string;
  postalCode: string;
  image: string | null;
  latitude: string;
  longitude: string;
  numOfReviews: number | null;
  created_at: string;
  deleted_at: string | null;
  email: string;
  phone: string;
  completeAddress: string;
  isApproved: boolean | null;
}

interface CooperativeState {
  cooperatives: Cooperative[];
  selectedCooperative: Cooperative | null;
  cooperativeLoggedIn: Cooperative | null;
  loading: boolean;
  error: string | null;
}

const initialState: CooperativeState = {
  cooperatives: [],
  selectedCooperative: null,
  cooperativeLoggedIn: null,
  loading: false,
  error: null,
};

const cooperativeSlice = createSlice({
  name: "cooperative",
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Set error message
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },

    // Set all cooperatives
    setCooperatives: (state, action: PayloadAction<Cooperative[]>) => {
      state.cooperatives = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Update a cooperative
    updateCooperative: (state, action: PayloadAction<Cooperative>) => {
      const index = state.cooperatives.findIndex(
        (coop) => coop.id === action.payload.id
      );
      if (index !== -1) {
        state.cooperatives[index] = action.payload;
      }

      // Update selected cooperative if it's the same one
      if (state.selectedCooperative?.id === action.payload.id) {
        state.selectedCooperative = action.payload;
      }

      // Update logged-in cooperative if it's the same one
      if (state.cooperativeLoggedIn?.id === action.payload.id) {
        state.cooperativeLoggedIn = action.payload;
      }
    },

    // Set selected cooperative (for viewing/details)
    setSelectedCooperative: (
      state,
      action: PayloadAction<Cooperative | null>
    ) => {
      state.selectedCooperative = action.payload;
    },

    // Set logged-in cooperative (for current user session)
    setCooperativeLoggedIn: (
      state,
      action: PayloadAction<Cooperative | null>
    ) => {
      state.cooperativeLoggedIn = action.payload;
    },

    // Update logged-in cooperative profile
    updateCooperativeLoggedIn: (
      state,
      action: PayloadAction<Partial<Cooperative>>
    ) => {
      if (state.cooperativeLoggedIn) {
        state.cooperativeLoggedIn = {
          ...state.cooperativeLoggedIn,
          ...action.payload,
        };

        // Also update in cooperatives list
        const index = state.cooperatives.findIndex(
          (coop) => coop.id === state.cooperativeLoggedIn?.id
        );
        if (index !== -1) {
          state.cooperatives[index] = {
            ...state.cooperatives[index],
            ...action.payload,
          };
        }
      }
    },

    // Logout cooperative (clear logged-in state)
    cooperativeLogout: (state) => {
      state.cooperativeLoggedIn = null;
    },

    // Clear all cooperatives
    clearCooperatives: (state) => {
      state.cooperatives = [];
      state.selectedCooperative = null;
      state.cooperativeLoggedIn = null;
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setCooperatives,
  updateCooperative,
  setSelectedCooperative,
  setCooperativeLoggedIn,
  updateCooperativeLoggedIn,
  cooperativeLogout,
  clearCooperatives,
} = cooperativeSlice.actions;

export default cooperativeSlice.reducer;
