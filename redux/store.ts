// store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import cooperativeReducer from "./slices/coopSlice";
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

// Persist config for cooperative - mas maganda hiwalay ang keys
const cooperativePersistConfig = {
  key: "cooperative",
  storage: AsyncStorage,
  // Optional: You can whitelist specific fields to persist
  // whitelist: ['cooperativeLoggedIn', 'selectedCooperative']
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedCooperativeReducer = persistReducer(
  cooperativePersistConfig,
  cooperativeReducer
);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    cooperative: persistedCooperativeReducer,
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
