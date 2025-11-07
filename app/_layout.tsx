import GlobalActionSheet from "@/components/GlobalActionSheet";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import "../index.css";
import { persistor, store } from "../redux/store";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        }
        persistor={persistor}
      >
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="OnboardingScreen" />
          <Stack.Screen name="RoleSelectionScreen" />
          <Stack.Screen name="LoginScreen" />
          <Stack.Screen name="RegisterScreen" />
          <Stack.Screen name="ForgotPassword" />
        </Stack>
        <StatusBar style="dark" />
        <GlobalActionSheet />
      </PersistGate>
    </Provider>
  );
}
