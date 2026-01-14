import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the Supplier interface based on your table structure
interface Supplier {
  // Primary fields
  id: string | number;
  name: string;
  type: string;
  user_id: string;
  email: string;
  phone: string;
  address: string;
  barangay: string;
  city: string;
  province: string;
  region: string;

  // Business information
  business_name?: string;
  business_type: string;
  business_registration?: string;

  // Profile
  profile_image?: string;

  // Status flags
  k_active: boolean;
  k_approved: boolean;

  // Archive/status management
  archive_reason: string | null;
  status: string;

  // Timestamps
  created_at: string;
  updated_at: string | null;
  archived_at: string | null;
  last_login_at: string | null;

  // Category relationship (from your list)
  parent_category_id?: string | number;

  // Add index signature for any additional properties if needed
  [key: string]: any;
}

interface SupplierState {
  supplier: Supplier | null;
}

const initialState: SupplierState = {
  supplier: null,
};

const supplierSlice = createSlice({
  name: "supplier",
  initialState,
  reducers: {
    // Add PayloadAction type here
    setSupplier: (state, action: PayloadAction<Supplier>) => {
      state.supplier = action.payload;
    },

    // Add PayloadAction type with Partial<Supplier> for updates
    updateSupplierProfile: (
      state,
      action: PayloadAction<Partial<Supplier>>
    ) => {
      if (state.supplier) {
        state.supplier = {
          ...state.supplier,
          ...action.payload,
        };
      }
    },

    supplierLogout: (state) => {
      state.supplier = null;
    },
  },
});

export const { setSupplier, updateSupplierProfile, supplierLogout } =
  supplierSlice.actions;

export default supplierSlice.reducer;

// Optional: Export types for use in other files
export type { Supplier, SupplierState };
