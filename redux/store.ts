// store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import cooperativeReducer from "./slices/coopSlice";
import supplierReducer from "./slices/supplierSlice"; // Import the supplier reducer
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Persist config for auth
const authPersistConfig = {
  key: "auth",
  storage: AsyncStorage,
};

// Persist config for cooperative
const cooperativePersistConfig = {
  key: "cooperative",
  storage: AsyncStorage,
  // Optional: You can whitelist specific fields to persist
  // whitelist: ['cooperativeLoggedIn', 'selectedCooperative']
};

// Persist config for supplier
const supplierPersistConfig = {
  key: "supplier",
  storage: AsyncStorage,
  // Optional: whitelist specific fields if needed
  // whitelist: ['supplier']
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedCooperativeReducer = persistReducer(
  cooperativePersistConfig,
  cooperativeReducer
);
const persistedSupplierReducer = persistReducer(
  supplierPersistConfig,
  supplierReducer
); // Create persisted supplier reducer

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    cooperative: persistedCooperativeReducer,
    supplier: persistedSupplierReducer, // Add supplier reducer to store
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
